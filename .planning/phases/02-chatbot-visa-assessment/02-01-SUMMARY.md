---
phase: "02"
plan: "02-01"
subsystem: "RAG Chat Pipeline"
tags:
  - rag
  - lcel
  - streaming
  - sse
  - chat-memory
  - sqlite
  - frontend
requires:
  - 01-core-auth
  - 01-rag-foundation
provides:
  - lcel-rag-service
  - sse-streaming
  - conversation-memory
affects:
  - backend/app/rag.py
  - backend/app/routes.py
  - frontend/src/components/AiVisaChatbot.js
tech-stack:
  added:
    - langchain-core (RunnableWithMessageHistory, StrOutputParser, RunnablePassthrough)
    - langchain-community (SQLChatMessageHistory)
    - Server-Sent Events (SSE)
  patterns:
    - LCEL chain composition
    - Singleton service pattern
    - ReadableStream SSE consumer
key-files:
  created:
    - none (all modifications to existing files)
  modified:
    - backend/app/rag.py
    - backend/app/routes.py
    - frontend/src/components/AiVisaChatbot.js
decisions:
  - "Use sqlite+aiosqlite for async-compatible SQLChatMessageHistory connection"
  - "RAGChatService as singleton via get_rag_service() for cross-endpoint reuse"
  - "Sliding window of 20 messages (10 exchanges) to bound memory growth"
  - "SSE over WebSocket for simpler frontend integration with fetch/ReadableStream"
  - "Dynamic suggestion chips updated post-response based on keyword matching"
metrics:
  duration: "~15 min"
  completed: "2026-05-14"
  tasks: 3
  commits: 3
---

# Phase 2 Plan 01: LCEL RAGChatService with Memory and Streaming Summary

Transformed the stateless RAG pipeline into an LCEL-based `RAGChatService` with
`RunnableWithMessageHistory`, SQLite-backed conversation memory, and SSE token
streaming. Extended the frontend chat UI to consume SSE events with real-time
token rendering and dynamic context-aware suggestion chips.

## Key Changes

### Task 1: Refactored `rag.py` to RAGChatService LCEL class

- Added `RAGChatService` class with LCEL chain:
  `RunnablePassthrough.assign(context=retrieve) | ChatPromptTemplate | ChatGroq | StrOutputParser`
- Wrapped with `RunnableWithMessageHistory` using `SQLChatMessageHistory` (SQLite,
  20-message sliding window)
- `invoke()` and `stream()` methods — stream uses `astream_events` with
  `on_chat_model_stream` filter for SSE token output
- Module-level `get_rag_service()` singleton
- `handle_query()` preserved intact with deprecation comment for backward compatibility
- All existing functions (`load_vectorstore`, `reload_vectorstore`, `semantic_search`,
  `index_documents`, `index_from_db`) untouched

**Commit:** `0010eca`

### Task 2: Upgraded routes and added SSE endpoint

- `/chat` POST now calls `get_rag_service().invoke()` with session memory
- `/chat/stream` POST added: returns `StreamingResponse` with `text/event-stream`
  media type, SSE headers (`Cache-Control: no-cache`, `X-Accel-Buffering: no`)
- Both endpoints derive `session_id` from JWT `sub` claim

**Commit:** `e47af1a`

### Task 3: Frontend SSE consumption and dynamic chips

- `handleSend` now POSTs to `/chat/stream` and consumes SSE via `ReadableStream`
  + `TextDecoder` reader
- Real-time token rendering: adds empty assistant message, appends tokens as
  they arrive via `setMessages` functional updates
- Dynamic `suggestionChips` state: updates post-response based on keywords
  (France/Schengen/Europe → document chips, eligibility/check/qualify → eligibility chips)
- Hardcoded chip buttons replaced with `suggestionChips.map()`
- File upload (`handleAttachFile`) and typing indicator (bouncing dots) preserved

**Commit:** `b787136`

## Deviations from Plan

None — plan executed exactly as written with one minor correction:

- **API key passthrough (Rule 2):** Added `groq_api_key=self.settings.groq_api_key`
  to `ChatGroq` constructor in `_build_chains()`. The plan omitted this, but since
  `pydantic-settings` loads into the model (not `os.environ`), the key wouldn't
  be found by ChatGroq's auto-detection. Fixed during implementation.

## Verification

```text
$ python -c "from app.rag import get_rag_service; svc = get_rag_service(); assert hasattr(svc, 'invoke'); assert hasattr(svc, 'stream'); print('RAGChatService OK')"
RAGChatService OK

$ python -c "from app.routes import router; assert '/chat/stream' in [r.path for r in router.routes]; print('/chat/stream endpoint registered')"
/chat/stream endpoint registered

Backward compatibility confirmed: handle_query, semantic_search, load_vectorstore,
reload_vectorstore, index_documents, index_from_db all importable.
```

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | `0010eca` | feat(02-01): add RAGChatService LCEL class with memory + streaming |
| 2 | `e47af1a` | feat(02-01): upgrade /chat to use RAGChatService + add /chat/stream SSE endpoint |
| 3 | `b787136` | feat(02-01): SSE streaming chat, dynamic chips, real-time token rendering |

## Self-Check: PASSED

- [x] `RAGChatService` has `invoke` and `stream` methods — verified
- [x] `/chat/stream` route registered in FastAPI router — verified
- [x] All existing module-level functions remain importable — verified
- [x] `handle_query` preserved with deprecation comment — verified
- [x] Frontend reads SSE stream via `ReadableStream` API — confirmed in source
- [x] Dynamic `suggestionChips` state and mapping — confirmed in source
- [x] Each task committed individually — 3 commits confirmed in git log
