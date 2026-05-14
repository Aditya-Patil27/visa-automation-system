# Project: Visa Automation System (VAS)

**Status:** Planning Phase  
**Last Activity:** 2026-05-14  
**Phase:** 0

## Project Overview

**Purpose:** An AI-powered chatbot and admin dashboard system that centralizes visa/embassy requirements knowledge, enabling employees to get accurate visa process information and admins to manage content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | FastAPI (Python) |
| Database | MongoDB |
| AI Layer | LangChain + OpenAI API |
| Vector DB | FAISS |

## User Classes

| Role | Description |
|------|-------------|
| Employee | Queries chatbot, tracks visa progress |
| Admin | Manages visa content via dashboard |

## Scope

### In Scope (Phase 1)
- User authentication (register/login)
- Chatbot for visa queries
- Admin dashboard for content management
- Basic RAG pipeline

### In Scope (Phase 2)
- Automated embassy website scraping

## Key Decisions

- MongoDB for flexible visa requirement schemas
- FAISS for vector similarity search
- JWT-based authentication
- Role-based access control (employee/admin)

## Directory Structure

```
visa-automation-system/
├── admin_dashboard/
├── backend/
│   └── app/
│       ├── database.py
│       ├── main.py
│       ├── models.py
│       ├── rag.py
│       ├── routes.py
│       └── security.py
├── database/
├── frontend/
│   └── src/
│       └── components/
├── rag_pipeline/
└── .planning/
```