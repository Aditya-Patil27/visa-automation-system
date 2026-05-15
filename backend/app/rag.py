import json
import os
import logging
from typing import List, Tuple, AsyncGenerator

logger = logging.getLogger(__name__)

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.chat_message_histories import SQLChatMessageHistory
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


# ── RAGChatService (LCEL chain with memory + streaming) ─────────────────
class RAGChatService:
    """LCEL-based RAG pipeline with persisted SQLite chat memory and SSE
    token streaming."""

    def __init__(self):
        self.settings = _get_settings()
        self._build_chains()

    # ------------------------------------------------------------------
    def _get_vectorstore(self):
        return load_vectorstore()

    # ------------------------------------------------------------------
    def _get_session_history(self, session_id: str):
        history = SQLChatMessageHistory(
            session_id=session_id,
            connection_string="sqlite+aiosqlite:///chat_history.db",
            table_name="chat_history",
        )
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
        llm = ChatGroq(
            groq_api_key=self.settings.groq_api_key,
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1024,
        )

        rag_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a visa consultation assistant. "
                       "Use the provided context to answer visa-related "
                       "questions concisely and accurately.\n\n"
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
            | llm
            | StrOutputParser()
        )

        self.chain_with_memory = RunnableWithMessageHistory(
            rag_chain,
            self._get_session_history,
            input_messages_key="question",
            history_messages_key="history",
        )

    # ------------------------------------------------------------------
    async def invoke(self, question: str, session_id: str) -> str:
        return await self.chain_with_memory.ainvoke(
            {"question": question},
            config={"configurable": {"session_id": session_id}},
        )

    # ------------------------------------------------------------------
    async def stream(self, question: str, session_id: str) -> AsyncGenerator[str, None]:
        async for event in self.chain_with_memory.astream_events(
            {"question": question},
            config={"configurable": {"session_id": session_id}},
            version="v1",
            include=["on_chat_model_stream"],
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content:
                    yield f"data: {json.dumps({'token': chunk.content})}\n\n"
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
