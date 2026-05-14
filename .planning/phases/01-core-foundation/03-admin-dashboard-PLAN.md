---
plan: 03-admin-dashboard
phase: 01
objective: Admin content management dashboard with CRUD operations
wave: 2
depends_on: null
requirements_addressed: [REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, NFR-08, NFR-09]
files_modified:
  - frontend/src/components/AdminDashboard.js
  - frontend/src/components/VisaKnowledgeManagement.js
  - frontend/src/components/VisaProgressTracker.js
autonomous: false
---

# Plan 03-admin-dashboard: Admin Content Management Dashboard

## Context

Phase 01 builds core functionality. This plan covers the admin dashboard where Sales Ops Managers and HR can manage visa requirement content.

## Tasks

### Task 3.1: Review existing admin dashboard

<read_first>
- frontend/src/components/AdminDashboard.js
- frontend/src/components/VisaKnowledgeManagement.js
</read_first>

<action>
1. Review existing AdminDashboard.js - identify current features and gaps
2. Review VisaKnowledgeManagement.js - understand current CRUD UI patterns
3. Identify missing features per requirements (add, edit, delete, search, filter)
4. Document current component structure
</action>

<acceptance_criteria>
- AdminDashboard.js exists and renders main admin view
- VisaKnowledgeManagement.js contains table/list of visa requirements
- Current implementation has basic layout structure
</acceptance_criteria>

### Task 3.2: Implement add/edit/delete visa requirements

<read_first>
- frontend/src/components/VisaKnowledgeManagement.js
- frontend/src/App.js
</read_first>

<action>
1. Add "Add New Requirement" button (top-right, primary color)
2. Create modal/dialog for new requirement form with fields:
   - Country (dropdown or text)
   - Visa Type (dropdown or text)
   - Documents (multi-select tags or comma-separated)
   - Processing Time (optional text)
3. Implement edit functionality - same modal, pre-filled with existing data
4. Implement delete with confirmation dialog
5. Add inline success/error notifications
6. Connect to backend API (POST/PUT/DELETE /visa)
</action>

<acceptance_criteria>
- "Add New Requirement" button visible on dashboard
- Modal opens on click with form fields (country, visa_type, documents, processing_time)
- Form submits POST request to /visa for new entries
- Edit button opens modal with existing data pre-filled
- Form submits PUT request to /visa/{id} for updates
- Delete button shows confirmation dialog before DELETE request
- Success toast appears after successful operation
</acceptance_criteria>

### Task 3.3: Implement search and filter functionality

<read_first>
- frontend/src/components/VisaKnowledgeManagement.js
</read_first>

<action>
1. Add search bar at top of visa list
   - Placeholder: "Search by country or visa type..."
   - Searches across country, visa_type fields
   - Debounced input (300ms)
2. Add filter dropdowns:
   - Country filter (populated from existing data)
   - Visa Type filter (populated from existing data)
3. Display active filter count badge
4. "Clear filters" button when filters active
5. Empty state message when no results match
</action>

<acceptance_criteria>
- Search bar exists with placeholder text
- Typing in search filters list in real-time (debounced 300ms)
- Country dropdown contains unique countries from data
- Visa Type dropdown contains unique visa types from data
- Multiple filters can be combined
- "Clear filters" button resets all search and filters
- "No results found" message displays when search/filter returns empty
</acceptance_criteria>

### Task 3.4: Category and organization view

<read_first>
- frontend/src/components/VisaKnowledgeManagement.js
</read_first>

<action>
1. Implement grouping by country (accordion or tabs)
2. Each country section shows all visa types for that country
3. Add country flag icons (optional, using emoji or simple text)
4. Add visa type badges with different colors
5. Sort options: alphabetical, recently added, recently updated
6. Pagination or virtualized list for large datasets
</action>

<acceptance_criteria>
- Visa requirements are grouped/tabbed by country
- Each group shows visa types within that country
- Badge colors differentiate visa types (tourist=blue, student=green, work=purple)
- Sort dropdown with 3+ options
- List handles 50+ entries without performance issues
</acceptance_criteria>

### Task 3.5: Responsive UI

<read_first>
- frontend/src/index.css
</read_first>

<action>
1. Review and update CSS for responsive design
2. Ensure dashboard works on tablet (768px+) and desktop
3. Modal adapts to screen size
4. Table/list converts to card view on mobile
5. Touch-friendly button sizes (min 44px tap target)
</action>

<acceptance_criteria>
- Dashboard renders correctly on 768px+ width
- Modal is usable on tablet screens
- Card view appears on screens < 768px
- All buttons have minimum 44px touch target
- Forms are scrollable on small screens
</acceptance_criteria>

## Verification

- All CRUD operations work
- Search filters in real-time
- Category grouping displays correctly
- UI is responsive

## Must-Haves (Goal Verification)

- Admins can add new visa requirements
- Admins can edit existing requirements
- Admins can delete requirements
- Data is categorized by country and visa type
- Search and filter works correctly