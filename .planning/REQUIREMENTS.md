# Requirements: Visa Automation System

**Status:** Draft  
**Last Activity:** 2026-05-14

## Functional Requirements

### Authentication Module

| REQ-ID | Requirement | Priority | Phase |
|--------|-------------|----------|-------|
| REQ-01 | Users can register with email, password, and role selection | HIGH | 1 |
| REQ-02 | Users can login with email/password and receive JWT token | HIGH | 1 |
| REQ-03 | System stores passwords securely using hashing (bcrypt) | HIGH | 1 |
| REQ-04 | Role-based access: employees see chatbot only, admins see dashboard | HIGH | 1 |
| REQ-05 | JWT tokens expire and must be refreshed | MEDIUM | 1 |

### Chatbot Module

| REQ-ID | Requirement | Priority | Phase |
|--------|-------------|----------|-------|
| REQ-06 | Employees can ask visa-related questions via chatbot | HIGH | 1 |
| REQ-07 | Chatbot retrieves relevant context from FAISS vector store | HIGH | 1 |
| REQ-08 | Chatbot responds with accurate information from knowledge base | HIGH | 1 |
| REQ-09 | Chatbot handles FAQs, step-by-step processes, documents, timelines | MEDIUM | 1 |
| REQ-10 | Chatbot provides links/downloads for embassy forms | LOW | 1 |

### Admin Dashboard Module

| REQ-ID | Requirement | Priority | Phase |
|--------|-------------|----------|-------|
| REQ-11 | Admins can add new visa requirement entries | HIGH | 1 |
| REQ-12 | Admins can edit existing visa requirement entries | HIGH | 1 |
| REQ-13 | Admins can delete visa requirement entries | HIGH | 1 |
| REQ-14 | Data categorized by country, visa type, embassy | HIGH | 1 |
| REQ-15 | Search functionality for visa requirements | MEDIUM | 1 |
| REQ-16 | Filter by country/visa type | MEDIUM | 1 |

### Knowledge Base / RAG

| REQ-ID | Requirement | Priority | Phase |
|--------|-------------|----------|-------|
| REQ-17 | FAISS index stores visa requirements for semantic search | HIGH | 1 |
| REQ-18 | Documents can be added to vector store | HIGH | 1 |
| REQ-19 | RAG pipeline combines retrieved context with LLM response | HIGH | 1 |

### Data Scraping (Phase 2)

| REQ-ID | Requirement | Priority | Phase |
|--------|-------------|----------|-------|
| REQ-20 | Automated scraping from embassy websites | HIGH | 2 |
| REQ-21 | Periodic updates to knowledge base | MEDIUM | 2 |
| REQ-22 | Scraping logs and monitoring dashboard | MEDIUM | 2 |

## Non-Functional Requirements

### Performance

| REQ-ID | Requirement | Priority |
|--------|-------------|----------|
| NFR-01 | API responses within 200ms | HIGH |
| NFR-02 | Chatbot response within 3 seconds | MEDIUM |
| NFR-03 | Support 100 concurrent users | MEDIUM |

### Security

| REQ-ID | Requirement | Priority |
|--------|-------------|----------|
| NFR-04 | Passwords hashed with bcrypt | HIGH |
| NFR-05 | JWT tokens for session management | HIGH |
| NFR-06 | Role-based route protection | HIGH |
| NFR-07 | HTTPS for all communications | HIGH |

### Usability

| REQ-ID | Requirement | Priority |
|--------|-------------|----------|
| NFR-08 | Responsive UI for desktop and tablet | MEDIUM |
| NFR-09 | Clear error messages | MEDIUM |
| NFR-10 | User-friendly chatbot interface | HIGH |

## Data Models

### User
```
email: string (unique)
hashed_password: string
role: enum["employee", "admin"]
```

### VisaRequirement
```
country: string
visa_type: string
documents: string[]
processing_time: string (optional)
```

## API Endpoints

### Auth
- POST `/register` - Create new user
- POST `/login` - Authenticate and get token

### Visa Management
- GET `/visa` - List all visa requirements
- POST `/visa` - Create new entry (admin only)
- PUT `/visa/{id}` - Update entry (admin only)
- DELETE `/visa/{id}` - Delete entry (admin only)

### Chat
- POST `/chat` - Submit query, get AI response

### Dashboard
- GET `/dashboard/user` - User dashboard data
- GET `/dashboard/admin` - Admin dashboard stats

## Open Questions

- [ ] How will embassy form links be verified?
- [ ] What scraping targets for Phase 2?
- [ ] Email notification requirements?