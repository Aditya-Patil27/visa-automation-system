# Roadmap: Visa Automation System

**Status:** Planning  
**Last Activity:** 2026-05-14  
**Total Phases:** 3

## Project Overview

Chatbot-driven system for employees to get visa/embassy information. Admin dashboard for managing content. Phase 2 adds automated embassy scraping.

---

## Phase 01: Core Foundation
**Goal:** User authentication, chatbot, admin dashboard, basic RAG pipeline

**Depends on:** None

**Requirements:** REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, NFR-01, NFR-02, NFR-04, NFR-05, NFR-06, NFR-07, NFR-09, NFR-10

### Phase 01 Scope

- User registration and login with JWT
- Role-based access control (employee/admin)
- React chatbot component with RAG backend
- Admin dashboard for CRUD on visa requirements
- FAISS vector store integration
- MongoDB persistence

### Plans

| Plan | Objective | Wave | Status |
|------|-----------|------|--------|
| 01-auth | Authentication system (register/login/JWT) | 1 | ✓ Planned |
| 02-chatbot | Employee chatbot with RAG integration | 1 | ✓ Planned |
| 03-admin-dashboard | Admin content management dashboard | 2 | ✓ Planned |
| 04-visa-crd | Visa requirement CRUD API endpoints | 2 | ✓ Planned |

---

## Phase 02: Embassy Scraping
**Goal:** Automated data scraping from embassy websites to keep knowledge updated

**Depends on:** Phase 01

**Requirements:** REQ-20, REQ-21, REQ-22, NFR-03

### Phase 02 Scope

- Embassy website scraping pipeline
- Scheduled periodic updates
- Scraping monitoring dashboard
- Error handling and retry logic

### Plans

| Plan | Objective | Wave | Status |
|------|-----------|------|--------|
| 05-scraper | Web scraping for embassy sites | 1 | ○ Pending |
| 06-scheduler | Periodic update scheduling | 2 | ○ Pending |
| 07-scraper-dashboard | Scraping logs and monitoring UI | 2 | ○ Pending |

---

## Phase 03: Enhanced Features
**Goal:** Improve chatbot accuracy, add eligibility checking, notifications

**Depends on:** Phase 01, Phase 02

**Requirements:** NFR-03, NFR-08

### Phase 03 Scope

- Eligibility checker integration
- Email/SMS notifications
- Document upload system
- Performance optimization for 100+ concurrent users

### Plans

| Plan | Objective | Wave | Status |
|------|-----------|------|--------|
| 08-eligibility | Visa eligibility assessment | 1 | ○ Pending |
| 09-notifications | Email/SMS alerts | 1 | ○ Pending |
| 10-performance | Scale to 100+ concurrent users | 2 | ○ Pending |

---

## Phase Status

| Phase | Status | Plans | Progress |
|-------|--------|-------|----------|
| 01 | ✓ Complete | 4/4 | 100% |
| 02 | ○ Pending | 3 | - |
| 03 | ○ Pending | 3 | - |

---

## Dependencies

| Phase | Depends on |
|-------|------------|
| 02 | 01 |
| 03 | 01, 02 |