---
plan: 07-scraper-dashboard
phase: 02
objective: Scraping monitoring dashboard showing logs, status, and statistics
wave: 2
depends_on: 05-scraper
requirements_addressed: [REQ-22, NFR-03]
files_modified:
  - frontend/src/components/ScraperMonitoringDashboard.js
  - backend/app/routes.py
autonomous: false
---

# Plan 07-scraper-dashboard: Scraping Logs and Monitoring UI

## Context

Phase 02 adds automated scraping. This plan builds the monitoring dashboard where admins can view scraping status, logs, and trigger manual updates.

## Tasks

### Task 7.1: Review existing scraper monitoring dashboard

<read_first>
- frontend/src/components/ScraperMonitoringDashboard.js
- backend/app/routes.py
</read_first>

<action>
1. Review existing ScraperMonitoringDashboard.js component
2. Review existing GET /scraper-logs endpoint
3. Identify current features and gaps
4. Document current structure
</action>

<acceptance_criteria>
- ScraperMonitoringDashboard.js exists
- GET /scraper-logs endpoint exists in routes.py
- Dashboard shows basic log display
</acceptance_criteria>

### Task 7.2: Enhance backend logging API

<read_first>
- backend/app/routes.py
- backend/app/database.py
</read_first>

<action>
1. Enhance scraper logging collection in MongoDB:
   - Log levels: INFO, WARNING, ERROR
   - Fields: timestamp, target, action, status, message, details
   - Automatic timestamps on insert
2. Create backend endpoints:
   - GET /scraper-logs - fetch logs with pagination and filters
   - POST /scraper-logs/clear - clear old logs (admin only)
   - GET /scraper-stats - aggregated statistics
   - GET /scraper-status - current scrape status
3. Add filtering options:
   - ?target=UK (filter by embassy)
   - ?level=ERROR (filter by log level)
   - ?since=2024-01-01 (filter by date)
   - ?limit=50 (pagination)
</action>

<acceptance_criteria>
- GET /scraper-logs returns paginated logs
- Filtering by target works
- Filtering by level works
- Filtering by date works
- GET /scraper-stats returns aggregated counts
- GET /scraper-status returns current state
</acceptance_criteria>

### Task 7.3: Build monitoring dashboard UI

<read_first>
- frontend/src/components/ScraperMonitoringDashboard.js
</read_first>

<action>
1. Update dashboard with:
   - Overview cards showing:
     - Total scrapes today
     - Success rate (%)
     - Last successful scrape
     - Active errors
   - Status indicators per target embassy
   - Timeline chart of scrape results over time
2. Add manual controls:
   - "Run Now" button per target
   - "Run All" button for all targets
   - Schedule configuration dropdown
3. Implement log viewer:
   - Filterable log table
   - Expandable log entries
   - Export logs to CSV
   - Clear logs button (with confirmation)
4. Add real-time updates:
   - Auto-refresh every 30 seconds
   - Manual refresh button
   - WebSocket for live updates (optional enhancement)
</action>

<acceptance_criteria>
- Dashboard shows 4 overview cards with stats
- Target embassy list with status indicators (green/yellow/red)
- "Run Now" button triggers scrape for single target
- Log viewer table is filterable by target and level
- Log entries are expandable with full details
- Auto-refresh enabled every 30 seconds
</acceptance_criteria>

### Task 7.4: Add job scheduling UI

<read_first>
- frontend/src/components/ScraperMonitoringDashboard.js
</read_first>

<action>
1. Add schedule management section:
   - Display current schedule (daily at 2 AM, weekly Sunday at 3 AM)
   - Enable/disable toggle per schedule
   - Edit schedule time dropdown
2. Add job history table:
   - Job ID, Target, Start Time, End Time, Status, Documents
   - Sortable columns
   - Pagination
3. Add scheduler job management:
   - List scheduled jobs
   - Add new job form
   - Delete job button
</action>

<acceptance_criteria>
- Schedule section displays current schedule
- Enable/disable toggles update scheduler
- Schedule edit opens modal with time picker
- Job history table shows all runs with pagination
- Scheduled jobs can be added and deleted
</acceptance_criteria>

### Task 7.5: Add error alerting

<read_first>
- frontend/src/components/ScraperMonitoringDashboard.js
</read_first>

<action>
1. Add error tracking:
   - Count of consecutive failures
   - Alert threshold indicator (3 failures = red alert)
2. Add notification component:
   - Toast notifications on scrape completion
   - Error alerts with details
3. Add email alert configuration (if configured):
   - Toggle for email on failure
   - Email recipient input
   - Test email button
</action>

<acceptance_criteria>
- Error count displayed per target
- Red alert shown after 3 consecutive failures
- Toast notification appears on scrape completion/failure
- Email alert toggle is visible (shows if enabled/disabled)
</acceptance_criteria>

### Task 7.6: Make dashboard responsive

<read_first>
- frontend/src/components/ScraperMonitoringDashboard.js
</read_first>

<action>
1. Review CSS for responsive design
2. Ensure works on tablet (768px+) and desktop
3. Log table converts to card view on mobile
4. Charts resize appropriately
5. Touch-friendly controls (min 44px tap target)
</action>

<acceptance_criteria>
- Dashboard renders correctly on 768px+ width
- Mobile shows card view instead of table
- Charts resize with container
- All buttons have minimum 44px tap target
</acceptance_criteria>

## Verification

- Dashboard displays scraping statistics
- Manual triggers work via API
- Logs are filterable and paginated
- Schedule management works
- Responsive design functions correctly

## Must-Haves (Goal Verification)

- Admins can monitor scraping status
- Admins can view detailed logs
- Admins can trigger manual scrapes
- Admins can manage schedules
- Errors are clearly displayed