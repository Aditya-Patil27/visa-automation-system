# Roadmap: Visa Automation System

## Overview

Four phases to transform the existing Visa Automation prototype into a full-featured visa consultation platform. Start with authentication hardening, then add chatbot intelligence and eligibility assessment, followed by appointment scheduling and document management, finishing with notifications and admin capabilities.

**Synthetic Data Strategy:** Every phase generates synthetic seed data for testing and simulation. A shared `seed_db.py` script populates the database with realistic fake applicants, visa types, country requirements, appointment slots, and documents — enabling end-to-end testing without real user data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Auth & Role Management** - Secure authentication, registration, password management, and role-based access
- [ ] **Phase 2: Chatbot & Visa Assessment** - AI-powered chatbot, eligibility checking, and pre-assessment flows
- [ ] **Phase 3: Scheduling & Documents** - Appointment booking calendar, document upload, and verification workflows
- [ ] **Phase 4: Notifications & Admin** - Email notifications, query system, admin dashboard, and progress tracking

## Phase Details

### Phase 1: Auth & Role Management
**Goal**: Users can register, log in, and manage their accounts with role-based access control. Password security and email verification are in place.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, ADMIN-04
**Success Criteria** (what must be TRUE):
  1. User can register with username, password, and email and receive confirmation
  2. User can log in with credentials and receive JWT token
  3. Invalid credentials return clear error messages
  4. User can reset password via email link
  5. Passwords are hashed in database (not plaintext)
  6. Three roles exist: applicant, consultant, admin with distinct access levels
  7. Synthetic user data seeds database with 10+ fake applicants, 3 admins, 2 consultants
**Plans**: 4 plans

Plans:
- [ ] 01-01: Registration & Login Flow
- [ ] 01-02: Password Management & Email Verification
- [ ] 01-03: Role-Based Access Control
- [ ] 01-04: Synthetic Auth Data Seeding

### Phase 2: Chatbot & Visa Assessment
**Goal**: Users can interact with an AI chatbot for visa queries and complete eligibility assessments against destination country requirements.
**Depends on**: Phase 1
**Requirements**: BOT-01, BOT-02, BOT-03, BOT-04, BOT-05, VISA-01, VISA-02, VISA-03
**Success Criteria** (what must be TRUE):
  1. Chatbot responds to visa questions with accurate, contextual answers
  2. Chatbot analyzes user documents and provides eligibility feedback
  3. Ineligible users receive alternative visa suggestions
  4. User can fill out pre-assessment form with travel details
  5. System checks eligibility against destination country requirements
  6. User can explore alternative visa options
  7. Synthetic visa requirements seeded for 5+ countries with 3+ visa types each
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — RAG Chat with Memory & Streaming (BOT-01, BOT-02)
- [x] 02-02-PLAN.md — Eligibility Rules Engine + Seed Data (BOT-03, VISA-02)
- [ ] 02-03-PLAN.md — Pre-Assessment Form + Backend CRUD API (VISA-01, BOT-05)
- [x] 02-04-PLAN.md — Eligibility Results + Alternative Visas + Test Infrastructure (BOT-04, VISA-03)

### Phase 3: Scheduling & Documents
**Goal**: Users can book visa interview appointments through a calendar interface and upload required documents for admin verification.
**Depends on**: Phase 2
**Requirements**: VISA-04, VISA-05, VISA-06, VISA-07, VISA-08, VISA-09
**Success Criteria** (what must be TRUE):
  1. User sees available appointment slots in a calendar view
  2. User can select and confirm an appointment
  3. System integrates with external APIs for slot availability
  4. User can upload passport, financial statements, and other documents
  5. Documents are stored encrypted
  6. Admin can approve or reject submitted documents
  7. Synthetic appointments and mock documents created for 10+ test applicants
**Plans**: 4 plans

Plans:
- [ ] 03-01: Appointment Calendar & Booking
- [ ] 03-02: Document Upload & Storage
- [ ] 03-03: Admin Document Verification
- [ ] 03-04: Synthetic Appointment & Document Data

### Phase 4: Notifications & Admin
**Goal**: Users receive timely notifications about appointments and document status. Administrators have a full dashboard for user management, query resolution, and progress tracking.
**Depends on**: Phase 3
**Requirements**: VISA-10, VISA-11, VISA-12, VISA-13, VISA-14, VISA-15, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. Users receive email reminders for upcoming appointments
  2. Users receive email notifications on document status changes
  3. Users can submit and track queries to support staff
  4. Consultants can respond to user queries with history preserved
  5. Admin dashboard shows user management, appointment oversight, and query queue
  6. Admin can track application progress in real-time
  7. Synthetic notification logs and query threads seeded for realistic admin view
**Plans**: 4 plans

Plans:
- [ ] 04-01: Email Notification System
- [ ] 04-02: Query & Support Ticketing
- [ ] 04-03: Admin Dashboard & Progress Tracking
- [ ] 04-04: Synthetic Activity Data Seeding

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth & Role Management | 0/4 | Not started | - |
| 2. Chatbot & Visa Assessment | 3/4 | In Progress|  |
| 3. Scheduling & Documents | 0/4 | Not started | - |
| 4. Notifications & Admin | 0/4 | Not started | - |
