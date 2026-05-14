"""
Scheduler for automated embassy data updates.
Uses APScheduler for job scheduling with MongoDB persistence.
"""

import logging
import os
import sys
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime
from enum import Enum

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.jobstores.mongodb import MongoDBJobStore
from pymongo import MongoClient

logger = logging.getLogger(__name__)


class JobStatus(Enum):
    """Job execution status."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class SchedulerConfig:
    """Scheduler configuration."""
    
    def __init__(self):
        self.enabled = os.getenv("SCHEDULER_ENABLED", "true").lower() == "true"
        self.timezone = os.getenv("SCHEDULER_TIMEZONE", "UTC")
        self.daily_hour = int(os.getenv("SCHEDULER_DAILY_HOUR", "2"))
        self.daily_minute = int(os.getenv("SCHEDULER_DAILY_MINUTE", "0"))
        self.weekly_day = int(os.getenv("SCHEDULER_WEEKLY_DAY", "6"))  # 0=Monday, 6=Sunday
        self.weekly_hour = int(os.getenv("SCHEDULER_WEEKLY_HOUR", "3"))
        self.max_consecutive_failures = int(os.getenv("SCHEDULER_MAX_FAILURES", "3"))
        
        # MongoDB configuration
        self.mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        self.db_name = os.getenv("DATABASE_NAME", "visa_db")
        
        # Redis configuration (for production)
        self.redis_url = os.getenv("REDIS_URL", None)
    
    def is_production(self) -> bool:
        """Check if running in production mode (Redis available)."""
        return bool(self.redis_url)


class JobResult:
    """Job execution result."""
    
    def __init__(
        self,
        job_id: str,
        run_id: str,
        status: JobStatus,
        start_time: datetime,
        end_time: Optional[datetime] = None,
        targets_scraped: int = 0,
        documents_added: int = 0,
        documents_updated: int = 0,
        errors: List[str] = None,
        error_message: Optional[str] = None
    ):
        self.job_id = job_id
        self.run_id = run_id
        self.status = status
        self.start_time = start_time
        self.end_time = end_time
        self.targets_scraped = targets_scraped
        self.documents_added = documents_added
        self.documents_updated = documents_updated
        self.errors = errors or []
        self.error_message = error_message
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for MongoDB storage."""
        return {
            "job_id": self.job_id,
            "run_id": self.run_id,
            "status": self.status.value,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "targets_scraped": self.targets_scraped,
            "documents_added": self.documents_added,
            "documents_updated": self.documents_updated,
            "errors": self.errors,
            "error_message": self.error_message
        }


class EmbassyScheduler:
    """
    APScheduler-based scheduler for embassy data updates.
    Supports cron and interval-based scheduling with MongoDB persistence.
    """
    
    def __init__(self, config: Optional[SchedulerConfig] = None):
        """
        Initialize the scheduler.
        
        Args:
            config: SchedulerConfig object (uses env vars if not provided)
        """
        self.config = config or SchedulerConfig()
        self.scheduler = None
        self._job_results = {}
        self._failure_counts: Dict[str, int] = {}
        self._last_successful_runs: Dict[str, datetime] = {}
        
        # Callbacks
        self.on_success: Optional[Callable] = None
        self.on_failure: Optional[Callable] = None
        self.on_job_complete: Optional[Callable] = None
    
    def _get_jobstores(self) -> Dict[str, Any]:
        """Get job stores based on configuration."""
        if self.config.is_production():
            # Use Redis for production
            return {
                "default": {
                    "type": "redis",
                    "host": self.config.redis_url,
                    "path": 0
                }
            }
        else:
            # Use memory for development
            return {
                "default": MemoryJobStore()
            }
    
    def _get_mongodb_jobstore(self) -> Optional[MongoDBJobStore]:
        """Get MongoDB job store for persistence."""
        try:
            client = MongoClient(self.config.mongodb_url)
            db = client[self.config.db_name]
            return MongoDBJobStore(
                client=client,
                database=self.config.db_name,
                collection="scheduler_jobs"
            )
        except Exception as e:
            logger.warning(f"Could not connect to MongoDB for job persistence: {e}")
            return None
    
    def start(self):
        """Start the scheduler."""
        if not self.config.enabled:
            logger.info("Scheduler is disabled via configuration")
            return
        
        logger.info("Starting embassy data scheduler")
        
        # Configure job stores
        jobstores = self._get_jobstores()
        
        # Add MongoDB job store if available
        mongo_store = self._get_mongodb_jobstore()
        if mongo_store:
            jobstores["default"] = mongo_store
        
        # Create scheduler
        self.scheduler = BackgroundScheduler(
            jobstores=jobstores,
            timezone=self.config.timezone
        )
        
        # Add default scheduled jobs
        self._add_default_jobs()
        
        # Start scheduler
        self.scheduler.start()
        logger.info(f"Scheduler started with {len(self.scheduler.get_jobs())} jobs")
    
    def stop(self):
        """Stop the scheduler gracefully."""
        if self.scheduler:
            logger.info("Stopping scheduler")
            self.scheduler.shutdown(wait=True)
            logger.info("Scheduler stopped")
    
    def _add_default_jobs(self):
        """Add default scheduled jobs."""
        # Daily update at 2 AM UTC
        self.add_job(
            job_id="daily_update",
            func=self._run_daily_update,
            trigger=CronTrigger(
                hour=self.config.daily_hour,
                minute=self.config.daily_minute,
                timezone=self.config.timezone
            ),
            name="Daily Embassy Update",
            description="Daily scrape and index embassy visa data"
        )
        
        # Weekly deep scan on Sunday at 3 AM UTC
        self.add_job(
            job_id="weekly_deep_scan",
            func=self._run_weekly_scan,
            trigger=CronTrigger(
                day_of_week=self.config.weekly_day,
                hour=self.config.weekly_hour,
                minute=0,
                timezone=self.config.timezone
            ),
            name="Weekly Deep Scan",
            description="Weekly comprehensive embassy data scan"
        )
    
    def _run_daily_update(self):
        """Run daily embassy data update."""
        logger.info("Starting daily embassy data update")
        run_id = f"daily_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            # Import and run the indexer
            from indexer import index_all
            result = index_all()
            
            # Record success
            self._record_job_result(
                job_id="daily_update",
                run_id=run_id,
                status=JobStatus.SUCCESS,
                targets_scraped=result.get("targets_processed", 0),
                documents_added=result.get("total_documents", 0),
                errors=result.get("failed", 0)
            )
            
            self._reset_failure_count("daily_update")
            self._last_successful_runs["daily_update"] = datetime.now()
            
            if self.on_success:
                self.on_success("daily_update", result)
            
            logger.info(f"Daily update completed: {result}")
            
        except Exception as e:
            logger.error(f"Daily update failed: {e}")
            self._handle_job_failure("daily_update", run_id, str(e))
    
    def _run_weekly_scan(self):
        """Run weekly deep scan."""
        logger.info("Starting weekly deep scan")
        run_id = f"weekly_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            from indexer import index_all
            result = index_all()
            
            self._record_job_result(
                job_id="weekly_deep_scan",
                run_id=run_id,
                status=JobStatus.SUCCESS,
                targets_scraped=result.get("targets_processed", 0),
                documents_added=result.get("total_documents", 0),
                errors=result.get("failed", 0)
            )
            
            self._reset_failure_count("weekly_deep_scan")
            self._last_successful_runs["weekly_deep_scan"] = datetime.now()
            
            if self.on_success:
                self.on_success("weekly_deep_scan", result)
            
            logger.info(f"Weekly scan completed: {result}")
            
        except Exception as e:
            logger.error(f"Weekly scan failed: {e}")
            self._handle_job_failure("weekly_deep_scan", run_id, str(e))
    
    def _handle_job_failure(self, job_id: str, run_id: str, error: str):
        """Handle job failure with retry logic."""
        self._failure_counts[job_id] = self._failure_counts.get(job_id, 0) + 1
        
        self._record_job_result(
            job_id=job_id,
            run_id=run_id,
            status=JobStatus.FAILED,
            error_message=error,
            errors=[error]
        )
        
        if self.on_failure:
            self.on_failure(job_id, error, self._failure_counts[job_id])
        
        # Check if threshold exceeded
        if self._failure_counts[job_id] >= self.config.max_consecutive_failures:
            logger.error(
                f"ALERT: Job {job_id} has failed {self._failure_counts[job_id]} "
                f"consecutive times (threshold: {self.config.max_consecutive_failures})"
            )
    
    def _reset_failure_count(self, job_id: str):
        """Reset failure count after successful run."""
        self._failure_counts[job_id] = 0
    
    def _record_job_result(self, job_id: str, run_id: str, status: JobStatus, **kwargs):
        """Record job result in memory and optionally persist to MongoDB."""
        result = JobResult(
            job_id=job_id,
            run_id=run_id,
            status=status,
            start_time=datetime.now(),
            end_time=datetime.now(),
            **kwargs
        )
        
        if job_id not in self._job_results:
            self._job_results[job_id] = []
        
        self._job_results[job_id].append(result)
        
        # Also save to MongoDB if available
        try:
            self._save_result_to_mongodb(result)
        except Exception as e:
            logger.warning(f"Could not save job result to MongoDB: {e}")
        
        if self.on_job_complete:
            self.on_job_complete(result)
    
    def _save_result_to_mongodb(self, result: JobResult):
        """Save job result to MongoDB."""
        client = MongoClient(self.config.mongodb_url)
        db = client[self.config.db_name]
        db.scheduler_results.insert_one(result.to_dict())
    
    def add_job(
        self,
        job_id: str,
        func: Callable,
        trigger: Any,
        name: Optional[str] = None,
        description: Optional[str] = None,
        replace_existing: bool = True
    ) -> Optional[str]:
        """
        Add a new scheduled job.
        
        Args:
            job_id: Unique identifier for the job
            func: Function to execute
            trigger: APScheduler trigger (CronTrigger, IntervalTrigger, etc.)
            name: Human-readable name
            description: Job description
            replace_existing: Replace existing job with same ID
            
        Returns:
            Job ID if successful, None otherwise
        """
        if not self.scheduler:
            logger.error("Scheduler not started")
            return None
        
        try:
            job = self.scheduler.add_job(
                func=func,
                trigger=trigger,
                id=job_id,
                name=name or job_id,
                description=description,
                replace_existing=replace_existing
            )
            logger.info(f"Added job: {job_id}")
            return job.id
        except Exception as e:
            logger.error(f"Failed to add job {job_id}: {e}")
            return None
    
    def remove_job(self, job_id: str) -> bool:
        """
        Remove a scheduled job.
        
        Args:
            job_id: ID of the job to remove
            
        Returns:
            True if successful, False otherwise
        """
        if not self.scheduler:
            return False
        
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job: {job_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove job {job_id}: {e}")
            return False
    
    def list_jobs(self) -> List[Dict[str, Any]]:
        """
        List all scheduled jobs.
        
        Returns:
            List of job dictionaries
        """
        if not self.scheduler:
            return []
        
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": str(job.next_run_time) if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        return jobs
    
    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job details by ID."""
        if not self.scheduler:
            return None
        
        job = self.scheduler.get_job(job_id)
        if not job:
            return None
        
        return {
            "id": job.id,
            "name": job.name,
            "next_run_time": str(job.next_run_time) if job.next_run_time else None,
            "trigger": str(job.trigger)
        }
    
    def run_job(self, job_id: str) -> bool:
        """
        Trigger immediate run of a job.
        
        Args:
            job_id: ID of the job to run
            
        Returns:
            True if successful, False otherwise
        """
        if not self.scheduler:
            return False
        
        job = self.scheduler.get_job(job_id)
        if not job:
            logger.error(f"Job not found: {job_id}")
            return False
        
        try:
            job.modify(next_run_time=datetime.now())
            logger.info(f"Triggered immediate run for job: {job_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to trigger job {job_id}: {e}")
            return False
    
    def skip_next_run(self, job_id: str) -> bool:
        """Skip the next scheduled run of a job."""
        if not self.scheduler:
            return False
        
        job = self.scheduler.get_job(job_id)
        if not job:
            return False
        
        try:
            # Get current next run time and add a small delay
            if job.next_run_time:
                from datetime import timedelta
                job.modify(next_run_time=job.next_run_time + timedelta(days=365))
                logger.info(f"Skipped next run for job: {job_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to skip job {job_id}: {e}")
            return False
    
    def get_job_results(self, job_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get job execution history."""
        results = self._job_results.get(job_id, [])
        return [r.to_dict() for r in results[-limit:]]
    
    def get_job_stats(self, job_id: str) -> Dict[str, Any]:
        """Get job statistics."""
        results = self._job_results.get(job_id, [])
        if not results:
            return {
                "job_id": job_id,
                "total_runs": 0,
                "successes": 0,
                "failures": 0,
                "last_run": None,
                "last_success": None,
                "consecutive_failures": self._failure_counts.get(job_id, 0)
            }
        
        successes = sum(1 for r in results if r.status == JobStatus.SUCCESS)
        failures = sum(1 for r in results if r.status == JobStatus.FAILED)
        
        return {
            "job_id": job_id,
            "total_runs": len(results),
            "successes": successes,
            "failures": failures,
            "last_run": str(results[-1].start_time) if results else None,
            "last_success": str(self._last_successful_runs.get(job_id)) if job_id in self._last_successful_runs else None,
            "consecutive_failures": self._failure_counts.get(job_id, 0)
        }


# Global scheduler instance
_scheduler: Optional[EmbassyScheduler] = None


def get_scheduler() -> EmbassyScheduler:
    """Get the global scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = EmbassyScheduler()
    return _scheduler


def init_scheduler() -> EmbassyScheduler:
    """Initialize and start the scheduler."""
    global _scheduler
    _scheduler = EmbassyScheduler()
    _scheduler.start()
    return _scheduler


def stop_scheduler():
    """Stop the scheduler."""
    global _scheduler
    if _scheduler:
        _scheduler.stop()
        _scheduler = None