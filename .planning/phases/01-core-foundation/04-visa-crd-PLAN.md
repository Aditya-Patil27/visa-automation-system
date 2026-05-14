---
plan: 04-visa-crd
phase: 01
objective: Visa requirement CRUD API endpoints with proper validation
wave: 2
depends_on: null
requirements_addressed: [REQ-11, REQ-12, REQ-13, REQ-14, NFR-01, NFR-05, NFR-06]
files_modified:
  - backend/app/routes.py
  - backend/app/models.py
  - backend/app/database.py
autonomous: false
---

# Plan 04-visa-crd: Visa Requirement CRUD API

## Context

Phase 01 builds core functionality. This plan covers the backend API endpoints for visa requirement CRUD operations. The existing routes.py already has basic CRUD, this plan enhances it with validation, search, and filtering.

## Tasks

### Task 4.1: Review existing visa CRUD endpoints

<read_first>
- backend/app/routes.py
- backend/app/models.py
</read_first>

<action>
1. Review existing GET /visa, POST /visa, PUT /visa/{id}, DELETE /visa/{id} endpoints
2. Verify authentication/authorization (get_current_user, get_current_admin)
3. Check model validation with Pydantic (VisaRequirement, VisaDB)
4. Identify gaps in current implementation
</action>

<acceptance_criteria>
- GET /visa returns list of visas for authenticated users
- POST /visa requires admin role (get_current_admin)
- PUT /visa/{id} requires admin role
- DELETE /visa/{id} requires admin role
- VisaRequirement model has required fields with validation
</acceptance_criteria>

### Task 4.2: Add search and filter endpoints

<read_first>
- backend/app/routes.py
</read_first>

<action>
1. Add query parameters to GET /visa:
   - `?country=USA` - filter by country (case-insensitive)
   - `?visa_type=tourist` - filter by visa type
   - `?search=keyword` - search across country and visa_type
2. Add MongoDB text index on country, visa_type fields
3. Return filtered results with pagination metadata
4. Handle empty results gracefully
</action>

<acceptance_criteria>
- GET /visa?country=USA returns only USA visas
- GET /visa?visa_type=student returns only student visas
- GET /visa?search=UK returns visas with UK in country or visa_type
- Empty search returns all visas
- Response includes result count metadata
</acceptance_criteria>

### Task 4.3: Enhance validation

<read_first>
- backend/app/models.py
</read_first>

<action>
1. Add Pydantic validation:
   - country: min_length=2, max_length=100
   - visa_type: min_length=2, max_length=100
   - documents: min_items=1 (at least one document required)
   - processing_time: optional, max_length=100
2. Add enum for common visa types (optional, for UI dropdown)
3. Add created_at, updated_at timestamps to VisaDB model
4. Return proper HTTP 422 for validation errors
</action>

<acceptance_criteria>
- POST /visa with empty documents returns HTTP 422
- POST /visa with country < 2 chars returns HTTP 422
- Successful POST returns VisaDB with _id
- VisaDB includes created_at timestamp
</acceptance_criteria>

### Task 4.4: Add bulk operations

<read_first>
- backend/app/routes.py
</read_first>

<action>
1. Add POST /visa/bulk - create multiple visa entries in one request
2. Add DELETE /visa/bulk - delete multiple entries by IDs
3. Validate all entries before inserting any
4. Return success count and any failures
5. Document bulk API in backend/API.md
</action>

<acceptance_criteria>
- POST /visa/bulk with valid array creates all entries
- POST /visa/bulk with one invalid entry returns error (none created)
- DELETE /visa/bulk with valid IDs deletes all matching entries
- Response includes created_count or deleted_count
</acceptance_criteria>

### Task 4.5: Performance optimization

<read_first>
- backend/app/database.py
</read_first>

<action>
1. Add database indexes:
   - Index on country field
   - Index on visa_type field
   - Compound index on (country, visa_type)
2. Add projection to limit returned fields when not needed
3. Add cursor batching for large result sets
4. Test query performance with explain()
</action>

<acceptance_criteria>
- Database has indexes on country and visa_type
- GET /visa with filters uses indexes (verify with explain)
- Large result sets (>100) return within 200ms
- Projection reduces response payload size
</acceptance_criteria>

### Task 4.6: Update API documentation

<read_first>
- backend/app/routes.py
</read_first>

<action>
1. Update backend/API.md with:
   - All visa endpoints with request/response schemas
   - Query parameters for search/filter
   - Bulk operation formats
   - Error responses (400, 401, 403, 404, 422)
   - Example requests/responses for each endpoint
</action>

<acceptance_criteria>
- API.md has complete OpenAPI-style documentation
- Each endpoint has request body schema
- Each endpoint has response schema
- Query parameters are documented
- Error codes are listed
</acceptance_criteria>

## Verification

- CRUD endpoints work correctly
- Search and filter return correct results
- Validation rejects invalid input
- Bulk operations work atomically
- Performance meets NFR-01 (200ms)

## Must-Haves (Goal Verification)

- Admins can create, read, update, delete visa requirements
- Data is categorized correctly in database
- API responses are fast (<200ms)
- Role-based protection on all endpoints
- Search functionality works