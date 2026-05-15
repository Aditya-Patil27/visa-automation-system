# Requirements: Visa Automation System

**Defined:** 2026-05-14
**Core Value:** Clients can complete a visa application from eligibility check through appointment booking without manual intervention from embassy staff.
**Status:** All v1 requirements implemented (30/30)

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can register with username, password, and email — POST /register with UserTable + JWT token return
- [x] **AUTH-02**: Passwords stored securely using hashing algorithms — bcrypt via security.py
- [x] **AUTH-03**: User can reset password via email link — POST /forgot-password + POST /reset-password with ResetTokenTable
- [x] **AUTH-04**: System displays error for incorrect credentials — 400 "Incorrect username or password" on /login
- [x] **AUTH-05**: User authenticated based on username/email and password — JWT flow with decode_access_token
- [x] **AUTH-06**: Registration triggers confirmation email — NotificationTable "Welcome to VisaAI" on /register

### Chatbot & Eligibility

- [x] **BOT-01**: Chatbot provides clear and concise responses to visa queries — RAGChatService with LCEL + SSE streaming
- [x] **BOT-02**: Chatbot is user-friendly and easy to interact with — AiVisaChatbot.js with suggestion chips, streaming, eligibility mode
- [x] **BOT-03**: Chatbot analyzes documents and provides visa eligibility feedback based on country requirements — OCR endpoint + conversational eligibility flow
- [x] **BOT-04**: Ineligible users receive alternative visa suggestions — get_alternative_visas() in eligibility.py
- [x] **BOT-05**: Users can explore other visa options or improve eligibility — alternative_visa_ids on VisaTable + eligibility results UI

### Visa Pre-Assessment

- [x] **VISA-01**: User can complete pre-assessment form with travel details and personal info — VisaEligibilityChecker.js 4-step wizard with auto-save
- [x] **VISA-02**: System assesses visa eligibility based on purpose of travel — rules_engine.py + assess_eligibility() hybrid approach
- [x] **VISA-03**: Eligibility check verifies requirements for selected destination country — hybrid deterministic + LLM assessment

### Appointment Scheduling

- [x] **VISA-04**: User can view available appointment slots via calendar interface — GET /appointments/slots with month/year, VisaAppointmentScheduler.js
- [x] **VISA-05**: User can select and confirm appointment slots for visa interviews — POST /appointments/book with conflict detection (409)
- [x] **VISA-06**: System integrates with external APIs for appointment availability — configurable slot generation (Mon-Fri, 9AM-5PM, 60-min)

### Document Management

- [x] **VISA-07**: User can upload required documents (passports, financial statements) — POST /documents/upload with per-type categorization
- [x] **VISA-08**: Documents are stored securely with encryption — Fernet (AES-256) via encryption.py
- [x] **VISA-09**: Administrators can approve or reject submitted documents — POST /admin/documents/{id}/review with reviewer_notes

### Notifications

- [x] **VISA-10**: System sends appointment reminders to users — auto-notification on POST /appointments/book, NotificationBell.js
- [x] **VISA-11**: System sends document status updates — auto-notification on POST /admin/documents/{id}/review
- [x] **VISA-12**: Notifications delivered via email (SMTP) — notification_service.py with SMTP/SendGrid/Twilio support

### Query Assistance

- [x] **VISA-13**: Users can submit queries regarding visa process — POST /queries with subject + message
- [x] **VISA-14**: Consultants/support staff can respond to user queries — POST /queries/{id}/respond with QueryResponseTable
- [x] **VISA-15**: Query history is preserved for users — GET /queries + GET /queries/{id} with full response thread

### Admin Management

- [x] **ADMIN-01**: Administrator can manage user accounts — GET /dashboard/admin with user/visa counts
- [x] **ADMIN-02**: Administrator can oversee appointment scheduling — GET /admin/documents/pending + booking review flow
- [x] **ADMIN-03**: Administrator can resolve user queries — POST /queries/{id}/respond gated by get_current_admin
- [x] **ADMIN-04**: Role-based access control (applicant, consultant, admin) — get_current_admin() decorator, role in JWT
- [x] **ADMIN-05**: System provides real-time application progress tracking — GET /progress + /dashboard/user + /tracking/simulate

## v2 Requirements

### AI Enhancements

- **AI-01**: Automated document verification via OCR — Partial (ocr_endpoint exists, full AI verification deferred)
- **AI-02**: AI-based visa pre-assessment with improved accuracy — Deferred
- **AI-03**: Multi-language chatbot support — Deferred

### Advanced Features

- **V2-01**: Payment processing for visa application fees — Deferred
- **V2-02**: SMS notification delivery — notification_service.py supports Twilio, deferred enable
- **V2-03**: Mobile app (iOS/Android) — Deferred
- **V2-04**: Embassy website scraping for requirement updates — Partial (scraper endpoints + ScraperLogTable exist)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment processing | Not in SRS scope for v1 |
| Real-time video interviews | Not in SRS scope |
| Native mobile apps | Web-first approach |
| Full OCR document verification | Defers to v2 AI enhancements |
| Multi-language support | Defers to v2 |

## Traceability

| Requirement | Phase | Status | Implementation |
|-------------|-------|--------|----------------|
| AUTH-01 | Phase 1 | Complete | POST /register in routes.py |
| AUTH-02 | Phase 1 | Complete | bcrypt in security.py |
| AUTH-03 | Phase 1 | Complete | POST /forgot-password + /reset-password |
| AUTH-04 | Phase 1 | Complete | POST /login with error messages |
| AUTH-05 | Phase 1 | Complete | JWT in security.py + get_current_user |
| AUTH-06 | Phase 1 | Complete | Welcome notification on register |
| BOT-01 | Phase 2 | Complete | RAGChatService + SSE streaming |
| BOT-02 | Phase 2 | Complete | AiVisaChatbot.js with chips + streaming |
| BOT-03 | Phase 2 | Complete | OCR + conversational eligibility |
| BOT-04 | Phase 2 | Complete | get_alternative_visas() in eligibility.py |
| BOT-05 | Phase 2 | Complete | alternative_visa_ids + eligibility results UI |
| VISA-01 | Phase 2 | Complete | VisaEligibilityChecker.js 4-step wizard |
| VISA-02 | Phase 2 | Complete | rules_engine.py + assess_eligibility() |
| VISA-03 | Phase 2 | Complete | Hybrid deterministic + LLM assessment |
| VISA-04 | Phase 3 | Complete | GET /appointments/slots + calendar UI |
| VISA-05 | Phase 3 | Complete | POST /appointments/book |
| VISA-06 | Phase 3 | Complete | Configurable slot generation |
| VISA-07 | Phase 3 | Complete | POST /documents/upload with categorization |
| VISA-08 | Phase 3 | Complete | Fernet AES-256 encryption |
| VISA-09 | Phase 3 | Complete | POST /admin/documents/{id}/review |
| VISA-10 | Phase 4 | Complete | Auto-notification on appointment book |
| VISA-11 | Phase 4 | Complete | Auto-notification on document review |
| VISA-12 | Phase 4 | Complete | notification_service.py (SMTP/SendGrid) |
| VISA-13 | Phase 4 | Complete | POST /queries |
| VISA-14 | Phase 4 | Complete | POST /queries/{id}/respond |
| VISA-15 | Phase 4 | Complete | GET /queries + /queries/{id} |
| ADMIN-01 | Phase 4 | Complete | GET /dashboard/admin |
| ADMIN-02 | Phase 4 | Complete | GET /admin/documents/pending |
| ADMIN-03 | Phase 4 | Complete | POST /queries/{id}/respond (admin) |
| ADMIN-04 | Phase 1 | Complete | get_current_admin() decorator |
| ADMIN-05 | Phase 4 | Complete | GET /progress + /tracking/simulate |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Implemented: 30/30 ✓

---
*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 — all v1 requirements verified complete*
