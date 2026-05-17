import json
import os
import logging
from typing import List, AsyncGenerator

logger = logging.getLogger(__name__)

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from pydantic_settings import BaseSettings


_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")


class Settings(BaseSettings):
    groq_api_key: str
    faiss_index_path: str = "faiss_index"

    class Config:
        env_file = _env_path
        extra = "ignore"


# ── Module-level singletons (loaded ONCE, not per-request) ──────────────
_embeddings = None
_vectorstore = None
_settings = None


def _get_settings():
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings


def load_vectorstore():
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore
    settings = _get_settings()
    embeddings = _get_embeddings()
    if os.path.exists(settings.faiss_index_path):
        _vectorstore = FAISS.load_local(
            settings.faiss_index_path, embeddings,
            allow_dangerous_deserialization=True,
        )
    else:
        _vectorstore = FAISS.from_texts([""], embeddings)

    # Move FAISS index to GPU if available
    try:
        import faiss
        import faiss.contrib.torch_utils
        if faiss.get_num_gpus() > 0:
            res = faiss.StandardGpuResources()
            index = _vectorstore.index
            if not isinstance(index, faiss.GpuIndex):
                _vectorstore.index = faiss.index_cpu_to_gpu(res, 0, index)
                logger.info("FAISS index moved to GPU")
    except Exception as e:
        logger.debug("GPU Faiss not available, using CPU: %s", e)

    return _vectorstore


def reload_vectorstore():
    """Force-reload after indexing new documents."""
    global _vectorstore
    _vectorstore = None
    return load_vectorstore()


# ── Semantic search with relevance scores ───────────────────────────────
def semantic_search(question: str, k: int = 5) -> List[dict]:
    vs = load_vectorstore()
    results = vs.similarity_search_with_relevance_scores(question, k=k)
    return [
        {"content": doc.page_content, "score": round(float(score), 4)}
        for doc, score in results
        if doc.page_content.strip()
    ]


# ── MongoDB-backed chat history ─────────────────────────────────────────
class MongoDBChatMessageHistory(BaseChatMessageHistory):
    """Chat message history stored in MongoDB."""

    def __init__(self, session_id: str, user_email: str = "", collection=None):
        self.session_id = session_id
        self.user_email = user_email
        self._collection = collection
        self._messages: List[BaseMessage] = []
        self._load_messages()

    def _get_collection(self):
        if self._collection is None:
            import pymongo
            from dotenv import load_dotenv
            load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
            mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/visa_db")
            client = pymongo.MongoClient(mongo_url)
            db_name = os.getenv("DATABASE_NAME", "visa_db")
            self._collection = client[db_name]["chat_history"]
        return self._collection

    def _load_messages(self):
        try:
            col = self._get_collection()
            query = {"session_id": self.session_id}
            if self.user_email:
                query["user_email"] = self.user_email
            cursor = col.find(query).sort("created_at", 1)
            self._messages = []
            for doc in cursor:
                if doc["type"] == "human":
                    self._messages.append(HumanMessage(content=doc["content"]))
                elif doc["type"] == "ai":
                    self._messages.append(AIMessage(content=doc["content"]))
        except Exception as e:
            logger.warning("Failed to load chat history from MongoDB: %s", e)
            self._messages = []

    @property
    def messages(self) -> List[BaseMessage]:
        return self._messages

    @messages.setter
    def messages(self, value: List[BaseMessage]):
        self._messages = value

    def add_message(self, message: BaseMessage) -> None:
        self._messages.append(message)
        try:
            col = self._get_collection()
            from datetime import datetime
            msg_type = "human" if isinstance(message, HumanMessage) else "ai"
            col.insert_one({
                "session_id": self.session_id,
                "user_email": self.user_email,
                "type": msg_type,
                "content": message.content,
                "created_at": datetime.utcnow(),
            })
        except Exception as e:
            logger.warning("Failed to save chat message to MongoDB: %s", e)

    def clear(self) -> None:
        self._messages = []
        try:
            col = self._get_collection()
            col.delete_many({"session_id": self.session_id})
        except Exception as e:
            logger.warning("Failed to clear chat history in MongoDB: %s", e)


# ── RAGChatService (LCEL chain with memory + streaming) ─────────────────
class RAGChatService:
    """LCEL-based RAG pipeline with persisted MongoDB chat memory and SSE
    token streaming."""

    def __init__(self):
        self.settings = _get_settings()
        self._build_chains()

    # ------------------------------------------------------------------
    def _get_vectorstore(self):
        return load_vectorstore()

    # ------------------------------------------------------------------
    def _get_session_history(self, session_id: str, user_email: str = ""):
        history = MongoDBChatMessageHistory(session_id=session_id, user_email=user_email)
        # Sliding window: keep at most the last 20 messages (≈10 exchanges)
        if len(history.messages) > 20:
            history.messages = history.messages[-20:]
        return history

    # ------------------------------------------------------------------
    async def _retrieve(self, question: str, k: int = 3) -> str:
        docs = load_vectorstore().similarity_search(question, k=k)
        return "\n\n".join(d.page_content for d in docs)

    # ------------------------------------------------------------------
    def _build_chains(self):
        self.llm = ChatGroq(
            groq_api_key=self.settings.groq_api_key,
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1024,
        )

        rag_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a visa consultation assistant. "
                       "Use the provided context to answer visa-related "
                       "questions concisely and accurately. "
                       "IMPORTANT: Output plain text only. Do NOT use markdown, asterisks, bold, italics, or any formatting symbols. "
                       "Use bullet points with dashes (-) for lists.\n\n"
                       "Context:\n{context}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ])

        # LCEL: retrieve → prompt → llm → string
        rag_chain = (
            RunnablePassthrough.assign(
                context=lambda x: self._retrieve(x["question"])
            )
            | rag_prompt
            | self.llm
            | StrOutputParser()
        )

        self.rag_chain = rag_chain
        self.prompt_template = rag_prompt

    # ------------------------------------------------------------------
    async def invoke(self, question: str, session_id: str, user_email: str = "") -> str:
        history = self._get_session_history(session_id, user_email)
        context = await self._retrieve(question)

        messages = [
            ("system", "You are a visa consultation assistant. "
                       "ONLY answer visa-related questions (travel documents, eligibility, requirements, processing times, fees, interviews, etc.). "
                       "If the question is NOT related to visas, travel, or immigration, respond with: "
                       "'I can only help with visa and travel-related questions. Please ask about visa requirements, documents, eligibility, or travel procedures.'\n\n"
                       "If the provided context is empty or not relevant, say: "
                       "'I do not have specific information about that in my database yet. However, I recommend checking the official embassy website for the most accurate information.'\n\n"
                       "IMPORTANT: Output plain text only. Do NOT use markdown, asterisks, bold, italics, or any formatting symbols. "
                       "Use bullet points with dashes (-) for lists.\n\n"
                       f"Context:\n{context}"),
        ]
        for msg in history.messages:
            messages.append(msg)
        messages.append(("human", question))

        response = await self.llm.ainvoke(messages)
        full_response = response.content

        # Save to history
        history.add_message(HumanMessage(content=question))
        history.add_message(AIMessage(content=full_response))
        return full_response

    # ------------------------------------------------------------------
    async def stream(self, question: str, session_id: str, user_email: str = "") -> AsyncGenerator[str, None]:
        try:
            history = self._get_session_history(session_id, user_email)
            context = await self._retrieve(question)

            messages = [
                ("system", "You are a visa consultation assistant. "
                           "ONLY answer visa-related questions (travel documents, eligibility, requirements, processing times, fees, interviews, etc.). "
                           "If the question is NOT related to visas, travel, or immigration, respond with: "
                           "'I can only help with visa and travel-related questions. Please ask about visa requirements, documents, eligibility, or travel procedures.'\n\n"
                           "If the provided context is empty or not relevant, say: "
                           "'I do not have specific information about that in my database yet. However, I recommend checking the official embassy website for the most accurate information.'\n\n"
                           "IMPORTANT: Output plain text only. Do NOT use markdown, asterisks, bold, italics, or any formatting symbols. "
                           "Use bullet points with dashes (-) for lists.\n\n"
                           f"Context:\n{context}"),
            ]
            for msg in history.messages:
                messages.append(msg)
            messages.append(("human", question))

            full_response = ""
            async for chunk in self.llm.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield f"data: {json.dumps({'token': chunk.content})}\n\n"

            # Save to history
            history.add_message(HumanMessage(content=question))
            history.add_message(AIMessage(content=full_response))
        except Exception as e:
            logger.error("Stream error: %s", e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"


# ── Module-level RAGChatService singleton ───────────────────────────
_rag_service = None


def get_rag_service():
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGChatService()
    return _rag_service


# ── Indexing ─────────────────────────────────────────────────────────────
def index_documents(docs: List[str]):
    """Build / extend FAISS index from text documents."""
    vs = load_vectorstore()
    vs.add_texts(docs)
    vs.save_local(_get_settings().faiss_index_path)
    reload_vectorstore()


async def index_from_db():
    """Load all visa descriptions from MongoDB and index them into FAISS."""
    from .database import get_database
    from .models import COLL_VISAS

    db = get_database()
    cursor = db[COLL_VISAS].find()
    docs = []
    async for doc in cursor:
        country = doc.get('country', '')
        visa_type = doc.get('visa_type', '')
        desc = (
            f"Country: {country}\nType: {visa_type}\n"
            f"Docs: {', '.join(doc.get('documents', []))}\n"
            f"Time: {doc.get('processing_time', '')}"
        )
        docs.append((desc, {"country": country, "visa_type": visa_type, "source": f"{country} {visa_type}"}))

    if docs:
        texts = [d[0] for d in docs]
        metadatas = [d[1] for d in docs]
        vs = load_vectorstore()
        vs.add_texts(texts, metadatas=metadatas)
        vs.save_local(Settings().faiss_index_path)
