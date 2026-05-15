# Visa Automation System

## What This Is

An AI-powered visa consultation platform that helps clients navigate visa applications through eligibility assessment, appointment scheduling, document verification, and chatbot-assisted support. Built as a single-page web app with React frontend, FastAPI backend, and OpenAI-powered RAG pipeline.

## Core Value

Clients can complete a visa application from eligibility check through appointment booking without manual intervention from embassy staff.

## Requirements

### Validated

- ✓ User registration & JWT-based authentication — existing
- ✓ Chatbot for visa-related Q&A — existing (basic RAG)
- ✓ Admin dashboard for managing visa requirements — existing
- ✓ Document upload capability — existing
- ✓ FAISS-based vector search for visa knowledge — existing

### Active

- [ ] **AUTH-01**: User can register with username, password, and email
- [ ] **AUTH-02**: Passwords stored securely using hashing algorithms
- [ ] **AUTH-03**: Password reset via email
- [ ] **AUTH-04**: Error feedback for incorrect credentials
- [ ] **AUTH-05**: Authentication based on username/email and password
- [ ] **BOT-01**: Chatbot provides clear responses to visa queries
- [ ] **BOT-02**: Chatbot is user-friendly and easy to interact with
- [ ] **BOT-03**: Chatbot analyzes documents and provides visa eligibility feedback
- [ ] **BOT-04**: Ineligible users get alternative visa suggestions
- [ ] **BOT-05**: Users can explore other visas or improve eligibility
- [ ] **VISA-01**: Visa pre-assessment form for travel details
- [ ] **VISA-02**: Eligibility check against destination country requirements
- [ ] **VISA-03**: Appointment scheduling with calendar interface
- [ ] **VISA-04**: Document upload for passports, financial statements
- [ ] **VISA-05**: Notifications and alerts for appointments and document status
- [ ] **VISA-06**: Query assistance platform for user questions
- [ ] **ADMIN-01**: Administrator user management
- [ ] **ADMIN-02**: Query resolution and appointment oversight
- [ ] **ADMIN-03**: Document approval/rejection workflow

### Out of Scope

- Payment processing — Not part of current SRS scope
- Real-time video visa interviews — Out of scope for v1
- Mobile native apps — Web-first; mobile later
- OCR-based document verification — Deferred to future enhancement

## Context

Brownfield project with existing codebase:
- **Frontend**: React.js (Chatbot.js, AdminDashboard.js components)
- **Backend**: FastAPI (MongoDB via Beanie ODM, JWT auth, RAG pipeline)
- **AI Layer**: LangChain + OpenAI embeddings with FAISS vector store
- **RAG Pipeline**: Document embedding and similarity search
- The SRS specifies MariaDB but current codebase uses MongoDB — maintaining MongoDB for flexibility

## Constraints

- **Tech Stack**: React (frontend), FastAPI (backend), MongoDB (database), LangChain + OpenAI (AI layer), FAISS (vector store)
- **OS Target**: Windows 10 64-bit or later
- **Performance**: Auth in ≤1s, API responses ≤200ms, document verification ≤5s
- **Concurrency**: Support 500+ concurrent users with 99.9% uptime
- **Security**: JWT authentication, hashed passwords, encrypted data storage, role-based access control
- **External APIs**: Third-party visa eligibility and appointment scheduling APIs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MongoDB over MariaDB | Existing codebase already uses MongoDB; flexibility for document storage | ✓ Good |
| FastAPI over Flask | Existing implementation; async native, auto-docs | ✓ Good |
| React over Jinja2 templates | Existing frontend; better UX for SPA | ✓ Good |
| JWT auth | Stateless, scalable auth for API | ✓ Good |
| FAISS for vector search | Local vector store, no cloud dependency for embeddings | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-14 after initialization*
