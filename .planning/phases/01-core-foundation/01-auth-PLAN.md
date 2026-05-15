---
plan: 01-auth
phase: 01
objective: User authentication system with JWT tokens and role-based access control
wave: 1
depends_on: null
requirements_addressed: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, NFR-04, NFR-05, NFR-06]
files_modified:
  - backend/app/security.py
  - backend/app/routes.py
  - backend/app/models.py
autonomous: false
---

# Plan 01-auth: Authentication System

## Context

Phase 01 builds the core foundation including user authentication. This plan covers the JWT-based auth system with role-based access for employees and admins.

## Tasks

### Task 1.1: Review existing auth code

<read_first>
- backend/app/security.py
- backend/app/routes.py
- backend/app/models.py
</read_first>

<action>
Review the existing security.py (JWT creation, password hashing with bcrypt), routes.py (register/login endpoints), and models.py (UserCreate model). The existing implementation already has bcrypt hashing and JWT creation - verify it covers all requirements.
</action>

<acceptance_criteria>
- security.py contains `get_password_hash()` using bcrypt
- security.py contains `verify_password()` for comparison
- security.py contains `create_access_token()` with JWT
- security.py contains `decode_access_token()` for validation
</acceptance_criteria>

### Task 1.2: Add JWT expiration and refresh

<read_first>
- backend/app/security.py
</read_first>

<action>
1. Add JWT expiration configuration to security.py:
   - Access token expires in 30 minutes
   - Add `ACCESS_TOKEN_EXPIRE_MINUTES` constant set to 30
2. Update `create_access_token()` to include `exp` claim using `datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)`
3. Update `decode_access_token()` to catch ExpiredSignatureError and return None
</action>

<acceptance_criteria>
- `grep -n "ACCESS_TOKEN_EXPIRE_MINUTES" backend/app/security.py` returns "ACCESS_TOKEN_EXPIRE_MINUTES = 30"
- `grep -n "exp" backend/app/security.py` returns a line with timedelta usage in token creation
- `grep -n "ExpiredSignatureError" backend/app/security.py` returns decode function handles expiration
</acceptance_criteria>

### Task 1.3: Test auth endpoints

<read_first>
- backend/app/routes.py
</read_first>

<action>
1. Test the registration endpoint with a new email and password
2. Test login with correct credentials - verify JWT returned
3. Test login with wrong password - verify 400 error returned
4. Test protected endpoint with valid JWT - verify 200 response
5. Test protected endpoint with invalid JWT - verify 401 error
</action>

<acceptance_criteria>
- POST /register returns access_token with "bearer" token_type
- POST /login with correct credentials returns access_token
- POST /login with wrong password returns HTTP 400
- GET /visa with valid token returns 200 and visa list
- GET /visa without token returns HTTP 401
</acceptance_criteria>

### Task 1.4: Document auth API

<read_first>
- backend/app/routes.py
</read_first>

<action>
Create or update backend/API.md documenting:
1. POST /register - request body (email, password, role), response (Token)
2. POST /login - OAuth2PasswordRequestForm, response (Token)
3. JWT token usage - include "Authorization: Bearer <token>" header format
4. Token expiration - 30 minutes
5. Role values - "employee" or "admin"
</action>

<acceptance_criteria>
- backend/API.md exists
- API.md documents POST /register with request/response format
- API.md documents POST /login with OAuth2 form format
- API.md documents JWT header format for authenticated requests
</acceptance_criteria>

## Verification

- All 4 acceptance criteria tests pass
- Auth flow works end-to-end
- API documentation is complete

## Must-Haves (Goal Verification)

- Employees can register and login
- Passwords are hashed with bcrypt
- JWT tokens are issued with 30-minute expiration
- Role-based access is enforced on protected routes