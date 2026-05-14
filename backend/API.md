# Visa Automation System - API Documentation

## Authentication

### POST /register

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "employee"  // or "admin"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Notes:**
- Password must be at least 8 characters
- `role` defaults to `"employee"` if not specified
- Valid roles: `"employee"`, `"admin"`

---

### POST /login

Authenticate and receive JWT token.

**Request (OAuth2 Password Flow):**
```
username=user@example.com&password=password123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Response (400):**
```json
{
  "detail": "Incorrect username or password"
}
```

---

### JWT Token Usage

Include the token in the `Authorization` header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 30 minutes

**Role-Based Access:**
- `employee` - Can access `/chat`, `/visa` (read), `/dashboard/user`
- `admin` - Can access all endpoints including CRUD operations on `/visa`

---

## Visa Management

### GET /visa

List all visa requirements.

**Authorization:** Bearer token (employee or admin)

**Query Parameters:**
- `country` (optional) - Filter by exact country name (case-insensitive)
- `visa_type` (optional) - Filter by visa type (case-insensitive)
- `search` (optional) - Search across country and visa_type fields

**Example:**
```
GET /visa?country=USA
GET /visa?visa_type=tourist
GET /visa?search=UK
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "country": "USA",
    "visa_type": "tourist",
    "documents": ["passport", "photo", "application_form"],
    "processing_time": "3-5 weeks"
  }
]
```

---

### POST /visa

Create a new visa requirement entry.

**Authorization:** Bearer token (admin only)

**Request Body:**
```json
{
  "country": "USA",
  "visa_type": "tourist",
  "documents": ["passport", "photo", "application_form"],
  "processing_time": "3-5 weeks"
}
```

**Response:** Created visa requirement object with `_id`

---

### PUT /visa/{id}

Update an existing visa requirement.

**Authorization:** Bearer token (admin only)

**Request Body:** Same as POST /visa

**Response:** Updated visa requirement object

---

### DELETE /visa/{id}

Delete a visa requirement.

**Authorization:** Bearer token (admin only)

**Response:**
```json
{
  "detail": "deleted"
}
```

---

## Chat

### POST /chat

Send a question to the visa chatbot.

**Authorization:** Bearer token (employee or admin)

**Request Body:**
```json
{
  "question": "What documents do I need for a tourist visa?"
}
```

**Response:**
```json
{
  "answer": "For a tourist visa, you typically need:\n\n1. Valid passport...\n"
}
```

---

## Dashboard

### GET /dashboard/user

Get user dashboard data.

**Authorization:** Bearer token (employee or admin)

**Response:**
```json
{
  "user_name": "John",
  "email": "john@example.com",
  "active_case": {
    "status": "Documents Verified",
    "message": "Your standard application has successfully passed the document verification stage."
  },
  "next_appointment": {
    "date": "Oct 24",
    "title": "Biometric Enrollment",
    "time": "10:30 AM (GMT +1)",
    "location": "VFS Global, London"
  },
  "recent_activities": [...],
  "documents": [...]
}
```

---

### GET /dashboard/admin

Get admin dashboard statistics.

**Authorization:** Bearer token (admin only)

**Response:**
```json
{
  "admin_name": "Admin",
  "total_users": 150,
  "active_applications": 45,
  "approval_rate": "87%",
  "processing_time": "14 Days"
}
```

---

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid credentials or validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Validation Error - Invalid request body |