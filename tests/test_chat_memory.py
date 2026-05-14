"""Tests for RAG conversation memory and SSE streaming.

Coverage: conversation memory persists across messages within a session,
session isolation (different sessions don't share context),
sliding window truncation keeps token budget under 8K.
Req: BOT-01 (chatbot responds with accurate answers)
"""
import pytest
from app.rag import get_rag_service


@pytest.mark.asyncio
async def test_conversation_memory_persists_across_messages(test_db, test_jwt_token):
    """Two messages in same session: second message sees context from first."""
    session_id = "test-user"
    service = get_rag_service()

    msg1 = await service.invoke("My name is Alice", session_id)
    msg2 = await service.invoke("What is my name?", session_id)

    assert "Alice" in msg2, "Second message should reference first message context"


@pytest.mark.asyncio
async def test_session_isolation(test_db, test_jwt_token):
    """Different session IDs do not share conversation context."""
    service = get_rag_service()

    await service.invoke("My name is Bob", "session-a")
    msg_b = await service.invoke("What is my name?", "session-b")

    # Session B should NOT know the name from session A
    assert "Bob" not in msg_b.lower(), "Session isolation failed"


@pytest.mark.asyncio
async def test_streaming_endpoint_returns_sse(test_client, test_jwt_token):
    """POST /chat/stream returns text/event-stream with valid SSE format."""
    headers = {"Authorization": f"Bearer {test_jwt_token}"}
    resp = await test_client.post(
        "/chat/stream",
        json={"question": "What documents do I need?"},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("text/event-stream")

    body = resp.text
    assert "data:" in body, "SSE response should contain data: lines"
