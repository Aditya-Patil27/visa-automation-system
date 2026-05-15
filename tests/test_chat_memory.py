"""Tests for RAG service integration (requires GROQ_API_KEY)."""
import pytest


@pytest.mark.asyncio
async def test_rag_service_imports():
    """RAG service module imports without error."""
    from app.rag import get_rag_service, semantic_search, index_documents
    assert get_rag_service is not None
    assert semantic_search is not None
    assert index_documents is not None
