import os
from typing import List, Tuple

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
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


# ── Chat handler (async, cached) ────────────────────────────────────────
async def handle_query(question: str) -> str:
    vs = load_vectorstore()
    docs = vs.similarity_search(question, k=3)
    context_text = "\n".join([doc.page_content for doc in docs])
    settings = _get_settings()
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.2,
    )
    prompt = f"Context:\n{context_text}\n\nQuestion: {question}\nAnswer:"
    response = await llm.ainvoke(prompt)
    return response.content


# ── Indexing ─────────────────────────────────────────────────────────────
def index_documents(docs: List[str]):
    """Build / extend FAISS index from text documents."""
    vs = load_vectorstore()
    vs.add_texts(docs)
    vs.save_local(_get_settings().faiss_index_path)
    reload_vectorstore()


async def index_from_db():
    """Load all visa descriptions from SQLite and index them."""
    from sqlalchemy import select
    from .database import async_session
    from .models import VisaTable

    async with async_session() as session:
        result = await session.execute(select(VisaTable))
        rows = result.scalars().all()

    docs = []
    for row in rows:
        doc_list = row.get_documents()
        desc = (
            f"Country: {row.country}\nType: {row.visa_type}\n"
            f"Docs: {', '.join(doc_list)}\nTime: {row.processing_time or ''}"
        )
        docs.append(desc)
    if docs:
        index_documents(docs)
