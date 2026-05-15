# Visa Automation System

AI-powered visa eligibility assessment, document management, appointment scheduling, and embassy data tracking.

## Tech Stack

- **Backend:** FastAPI (Python 3.11+) on Uvicorn
- **Database:** MongoDB (primary) with optional Redis caching
- **AI/ML:** LangChain + Groq (LLaMA) + FAISS vector search + HuggingFace embeddings
- **Frontend:** React 18 (Create React App) with Tailwind CSS
- **Infrastructure:** Nginx reverse proxy (sample config included)

## Quick Start

### Prerequisites

- Python 3.11+
- MongoDB running on `localhost:27017` (or set `MONGODB_URL`)
- Node.js 18+ (for frontend)
- Groq API key (for AI chat) — get one at https://console.groq.com

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Set environment variables:

```bash
# Required
export JWT_SECRET="generate_a_random_64_char_secret"

# Optional — without these, the app runs but AI/OCR features are disabled
export GROQ_API_KEY="gsk_your_key_here"
export GOOGLE_VISION_API_KEY="your_key_here"
```

### 2. Seed Database

```bash
python seed_db.py
```
This creates 6 visa records (US, UK, India, Australia, Canada, Schengen) with indexes.

### 3. Start Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The first startup downloads the `all-MiniLM-L6-v2` embedding model (~80MB) and builds the FAISS index. This is a one-time cost.

### 4. Verify

```bash
curl http://localhost:8000/
# {"message":"Welcome to Visa Automation API"}

curl http://localhost:8000/health
# {"status":"healthy","services":{"mongodb":"connected","redis":"not connected"}}

curl http://localhost:8000/docs
# Swagger UI at /docs
```

### 5. Frontend (Optional)

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login (returns JWT + httpOnly cookie) |
| POST | `/forgot-password` | No | Request password reset |
| POST | `/reset-password` | No | Reset password with token |
| GET | `/visa` | User | List visa requirements |
| POST | `/visa` | Admin | Create visa requirement |
| PUT | `/visa/{id}` | Admin | Update visa requirement |
| DELETE | `/visa/{id}` | Admin | Delete visa requirement |
| POST | `/assessment` | User | Create assessment draft |
| PUT | `/assessment/{id}` | User | Save assessment step |
| GET | `/assessment/{id}` | User | Get assessment |
| POST | `/assessment/{id}/submit` | User | Submit assessment for eligibility check |
| POST | `/chat` | User | Ask AI visa assistant |
| POST | `/chat/stream` | User | Streaming chat response (SSE) |
| POST | `/search` | User | Semantic search visa knowledge base |
| POST | `/ocr` | User | OCR document via Google Vision |
| POST | `/documents/upload` | User | Upload encrypted document |
| GET | `/documents/mydocs` | User | List my documents |
| GET | `/documents/download/{id}` | User | Download decrypted document |
| DELETE | `/documents/{id}` | User | Delete document (GDPR hard delete) |
| GET | `/documents/types` | User | List required document types |
| POST | `/appointments/book` | User | Book appointment slot |
| GET | `/appointments/slots` | User | View available slots |
| GET | `/appointments/my` | User | My appointments |
| DELETE | `/appointments/{id}` | User | Cancel appointment |
| POST | `/queries` | User | Submit support ticket |
| GET | `/queries` | User | My tickets |
| GET | `/notifications` | User | My notifications |
| GET | `/dashboard/user` | User | User dashboard |
| GET | `/dashboard/admin` | Admin | Admin dashboard |
| GET | `/admin/documents/pending` | Admin | Pending document reviews |
| POST | `/admin/documents/{id}/review` | Admin | Approve/reject document |
| GET | `/admin/documents/stats` | Admin | Document statistics |
| GET | `/progress` | User | Application progress |
| GET | `/scraper-logs` | Admin | Embassy scraper logs |
| GET | `/scraper-stats` | Admin | Scraper statistics |
| GET | `/health` | No | Health check (503 if degraded) |
| GET | `/cache/stats` | Admin | Cache hit/miss stats |

## Auth Flow

1. `POST /login` returns `{"access_token": "..."}` and sets `HttpOnly; SameSite=Strict` cookie
2. API accepts token via `Authorization: Bearer <token>` header OR cookie
3. Token is JWT with 30-minute expiry, HS256-signed
4. Auth endpoints are rate-limited: 5 requests/minute per IP

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `JWT_SECRET` | — | **Yes** | JWT signing key (min 32 chars) |
| `MONGODB_URL` | `mongodb://localhost:27017` | No | MongoDB connection string |
| `GROQ_API_KEY` | — | No | Groq API key for AI chat |
| `GOOGLE_VISION_API_KEY` | — | No | Google Vision key for OCR |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Frontend URL(s), comma-separated |
| `REDIS_URL` | `redis://localhost:6379/0` | No | Redis for caching |
| `JWT_EXPIRE_MINUTES` | `30` | No | Token lifetime |
| `ENVIRONMENT` | `development` | No | Set `production` for secure cookies |

## Security Features

- Passwords hashed with bcrypt
- JWT in httpOnly+SameSite cookie (XSS-resistant)
- Reset tokens SHA256-hashed (O(1) indexed lookup)
- File upload validated by magic bytes (not Content-Type header)
- Encrypted document storage (Fernet/AES-256)
- Rate limiting on auth (5/min) and LLM (10/min) endpoints
- Security headers: HSTS, XFO, nosniff, XSS-Protection
- Health check returns 503 when dependencies are down
- Hard delete for GDPR right-to-erasure compliance

## Project Structure

```
visa-automation-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, startup, health check
│   │   ├── database.py          # MongoDB connection, indexes
│   │   ├── models.py            # Pydantic models, collection constants
│   │   ├── routes.py            # All API endpoints (50 routes)
│   │   ├── schemas.py           # Request/response Pydantic schemas
│   │   ├── security.py          # JWT create/decode, bcrypt helpers
│   │   ├── encryption.py        # Fernet document encryption
│   │   ├── cache.py             # Redis caching layer
│   │   ├── eligibility.py       # Eligibility assessment (rules + LLM)
│   │   ├── rules_engine.py      # Deterministic eligibility rules
│   │   ├── rag.py               # RAG pipeline (FAISS + LangChain)
│   │   ├── notification_service.py  # Email/SMS notifications
│   │   ├── document_config.py   # Document type definitions
│   │   └── route_modules/
│   │       ├── auth.py          # Auth routes (register, login, reset)
│   │       └── deps.py          # Shared dependencies
│   ├── seed_db.py               # MongoDB seed script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js               # Router, protected routes
│   │   ├── services/api.js      # API client with cookie support
│   │   ├── config/              # Routes, labels, navigation
│   │   └── components/          # React components (18 pages)
│   └── package.json
├── rag_pipeline/                # Embassy data scraper + indexer
├── tests/
│   ├── test_eligibility_rules.py  # 14 rules engine tests
│   ├── test_security.py           # 6 security tests (JWT, bcrypt, SHA256)
│   ├── test_preassessment.py      # Assessment CRUD integration
│   ├── test_routes.py             # Route integration tests
│   └── conftest.py                # Test fixtures
└── nginx.conf                   # Sample Nginx load balancing config
```
