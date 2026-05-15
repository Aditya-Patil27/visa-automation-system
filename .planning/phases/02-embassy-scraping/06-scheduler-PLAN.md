---
plan: 06-scheduler
phase: 02
objective: Automated scheduling system for periodic embassy data updates
wave: 2
depends_on: 05-scraper
requirements_addressed: [REQ-21, NFR-03]
files_modified:
  - rag_pipeline/scheduler.py
  - backend/app/main.py
  - backend/.env
autonomous: false
---

# Plan 06-scheduler: Periodic Update Scheduling

## Context

Phase 02 builds automated scraping. This plan adds scheduling to run updates periodically, keeping the knowledge base fresh without manual intervention.

## Tasks

### Task 6.1: Implement APScheduler-based scheduler

<read_first>
- rag_pipeline/indexer.py
</read_first>

<action>
1. Create rag_pipeline/scheduler.py with scheduler configuration:
   - APScheduler for job scheduling
   - Configure job stores (memory for dev, Redis for production)
   - Add cron triggers for scheduled updates
   - Support interval-based and cron-based scheduling
2. Create predefined schedules:
   - Daily update at 2 AM UTC (low traffic)
   - Weekly deep scan on Sunday at 3 AM UTC
3. Add job management:
   - Add/update/remove scheduled jobs
   - List active jobs
   - Skip next run option
4. Implement job result tracking (success/failure/history)
</action>

<acceptance_criteria>
- rag_pipeline/scheduler.py exists with APScheduler configured
- Scheduler has add_job() method
- Scheduler has list_jobs() method
- Daily cron job configured for 2 AM UTC
- Weekly scan job configured for Sunday 3 AM UTC
</acceptance_criteria>

### Task 6.2: Add scheduler to FastAPI backend

<read_first>
- backend/app/main.py
- rag_pipeline/scheduler.py
</read_first>

<action>
1. Integrate scheduler into FastAPI startup/shutdown:
   - Start scheduler on app startup
   - Graceful shutdown on app termination
2. Add scheduler API endpoints:
   - GET /scheduler/jobs - list all scheduled jobs
   - POST /scheduler/jobs - add new job
   - DELETE /scheduler/jobs/{job_id} - remove job
   - POST /scheduler/jobs/{job_id}/run - trigger immediate run
3. Add admin-only protection on scheduler endpoints
4. Store job state in MongoDB for persistence across restarts
</action>

<acceptance_criteria>
- Scheduler starts on FastAPI startup (check logs)
- GET /scheduler/jobs returns list of scheduled jobs
- POST /scheduler/jobs creates new scheduled job
- DELETE /scheduler/jobs/{id} removes scheduled job
- Job state persists across app restarts
</acceptance_criteria>

### Task 6.3: Add environment configuration

<read_first>
- backend/.env
</read_first>

<action>
1. Add scheduler configuration to backend/.env:
   - SCHEDULER_ENABLED=true
   - SCHEDULER_TIMEZONE=UTC
   - SCHEDULER_DAILY_HOUR=2
   - SCHEDULER_DAILY_MINUTE=0
   - SCHEDULER_WEEKLY_DAY=6 (Sunday=6 in cron, 0=Monday)
   - SCHEDULER_WEEKLY_HOUR=3
2. Update .env.example with all scheduler variables
3. Add validation for environment variables
4. Document configuration in rag_pipeline/README.md
</action>

<acceptance_criteria>
- backend/.env has SCHEDULER_ENABLED=true
- backend/.env has timezone configuration
- backend/.env.example includes all scheduler vars with comments
- .env.example documented in rag_pipeline/README.md
</acceptance_criteria>

### Task 6.4: Implement job result handling

<read_first>
- rag_pipeline/scheduler.py
</read_first>

<action>
1. Create MongoDB collection for job results:
   - job_id
   - run_id
   - start_time
   - end_time
   - status (running/completed/failed)
   - targets_scraped
   - documents_added
   - documents_updated
   - errors
2. Implement result callbacks:
   - on_success: log stats, update last successful run
   - on_failure: log error, increment failure count, alert if threshold exceeded
3. Add failure handling:
   - Max consecutive failures alert (configurable, default 3)
   - Dead letter queue for failed jobs
4. Implement retry with backoff after failures
</action>

<acceptance_criteria>
- MongoDB collection 'scheduler_jobs' exists with schema
- Job results stored in MongoDB with all fields
- on_failure callback logs error and increments counter
- Alert generated after 3 consecutive failures
- Retry with exponential backoff implemented
</acceptance_criteria>

### Task 6.5: Add scheduling to API docs

<read_first>
- backend/API.md
</read_first>

<action>
Update backend/API.md with scheduler endpoints:
1. GET /scheduler/jobs
2. POST /scheduler/jobs
3. DELETE /scheduler/jobs/{job_id}
4. POST /scheduler/jobs/{job_id}/run
5. GET /scheduler/jobs/{job_id}/results
</action>

<acceptance_criteria>
- backend/API.md documents all scheduler endpoints
- Each endpoint has request/response schemas
- Error codes listed for validation failures
</acceptance_criteria>

## Verification

- Scheduler runs jobs on schedule
- API endpoints work correctly
- Results stored in MongoDB
- Failures handled gracefully

## Must-Haves (Goal Verification)

- Updates run automatically on schedule
- Manual trigger works via API
- Job history tracked in MongoDB
- Failures don't crash the scheduler