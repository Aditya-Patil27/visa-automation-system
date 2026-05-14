from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import List

from .database import get_database
from .models import UserCreate, Token, VisaRequirement, VisaDB
from .security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid authentication credentials")
    return payload


def get_current_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Admin privileges required")
    return user


@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed
    del user_dict["password"]
    await db.users.insert_one(user_dict)
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user["email"], "role": user.get("role")})
    return {"access_token": token}


# visa endpoints
@router.get("/visa", response_model=List[VisaDB])
async def list_visas(_: dict = Depends(get_current_user)):
    db = get_database()
    items = []
    cursor = db.visas.find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.post("/visa", response_model=VisaDB)
async def create_visa(visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    res = await db.visas.insert_one(visa.dict())
    visa_doc = visa.dict()
    visa_doc["_id"] = str(res.inserted_id)
    return visa_doc


@router.put("/visa/{id}", response_model=VisaDB)
async def update_visa(id: str, visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    await db.visas.update_one({"_id": id}, {"$set": visa.dict()})
    visa_doc = visa.dict()
    visa_doc["_id"] = id
    return visa_doc


@router.delete("/visa/{id}")
async def delete_visa(id: str, _: dict = Depends(get_current_admin)):
    db = get_database()
    await db.visas.delete_one({"_id": id})
    return {"detail": "deleted"}


# chat endpoint simplified
@router.post("/chat")
async def chat_endpoint(query: dict, user: dict = Depends(get_current_user)):
    from .rag import handle_query

    text = query.get("question")
    if not text:
        raise HTTPException(status_code=400, detail="No question provided")
    answer = await handle_query(text)
    return {"answer": answer}

# dashboard endpoints
@router.get("/dashboard/user")
async def get_user_dashboard(user: dict = Depends(get_current_user)):
    # Returns some static mock structural data combined with dynamic user fields
    return {
        "user_name": str(user.get("sub", "User")).split("@")[0].capitalize(),
        "email": user.get("sub"),
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
        "recent_activities": [
            {"title": "Documents Verified", "desc": "System updated status automatically", "time": "Today, 2:45 PM", "status": "completed"},
            {"title": "Proof of Funds Uploaded", "desc": "Bank Statement 2023_Oct.pdf", "time": "Yesterday, 9:15 AM", "status": "in_progress"},
            {"title": "Application Form Signed", "desc": "Digital signature captured", "time": "Oct 19, 2023", "status": "pending"}
        ],
        "documents": [
            {"name": "Passport_Scan.pdf", "size": "2.4 MB", "icon": "picture_as_pdf"},
            {"name": "Employment_Letter.docx", "size": "840 KB", "icon": "description"},
            {"name": "Portrait_Photo.jpg", "size": "4.1 MB", "icon": "image"}
        ]
    }

@router.get("/dashboard/admin")
async def get_admin_dashboard(admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_count = await db.users.count_documents({})
    visas_count = await db.visas.count_documents({})
    return {
        "admin_name": str(admin.get("sub", "Admin")).split("@")[0].capitalize(),
        "total_users": users_count,
        "active_applications": visas_count,
        "approval_rate": "87%",
        "processing_time": "14 Days"
    }

@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    db = get_database()
    # returning the seed or default
    prog = await db.progress.find_one({"user_email": "testuser_1234@test.com"})
    if not prog:
        return {"progress_steps": [], "stats": {}}
    return {"progress_steps": prog.get("progress_steps", []), "stats": prog.get("stats", {})}

@router.get("/workflow")
async def get_workflow(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.workflow.find({})
    workflows = await cursor.to_list(length=100)
    for w in workflows:
        w["_id"] = str(w["_id"])
    return workflows

@router.get("/scraper-logs")
async def get_scraper_logs(
    target: str = None,
    level: str = None,
    since: str = None,
    limit: int = 50,
    skip: int = 0,
    admin: dict = Depends(get_current_admin)
):
    """
    Get scraper logs with filtering and pagination.
    Filters:
    - target: Filter by embassy/target (e.g., "UK", "Germany")
    - level: Filter by log level (INFO, WARNING, ERROR)
    - since: Filter by date (ISO format, e.g., "2024-01-01")
    - limit: Number of results (default 50)
    - skip: Number of results to skip (for pagination)
    """
    db = get_database()
    
    # Build query
    query = {}
    if target:
        query["target"] = {"$regex": target, "$options": "i"}
    if level:
        query["level"] = level.upper()
    if since:
        query["timestamp"] = {"$gte": since}
    
    # Get total count
    total_count = await db.scraper_logs.count_documents(query)
    
    # Get paginated results (newest first)
    cursor = db.scraper_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    for l in logs:
        l["_id"] = str(l["_id"])
    
    return {
        "logs": logs,
        "total": total_count,
        "page": (skip // limit) + 1,
        "limit": limit
    }


@router.post("/scraper-logs/clear")
async def clear_scraper_logs(
    older_than_days: int = 30,
    admin: dict = Depends(get_current_admin)
):
    """Clear old scraper logs (admin only)."""
    import datetime
    db = get_database()
    
    # Calculate cutoff date
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=older_than_days)
    
    # Delete logs older than cutoff
    result = await db.scraper_logs.delete_many({
        "timestamp": {"$lt": cutoff.isoformat()}
    })
    
    return {
        "message": f"Deleted {result.deleted_count} old log entries",
        "deleted_count": result.deleted_count
    }


@router.get("/scraper-stats")
async def get_scraper_stats(admin: dict = Depends(get_current_admin)):
    """Get aggregated scraper statistics."""
    from datetime import datetime, timedelta
    db = get_database()
    
    # Get today's date
    today = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Total logs today
    today_logs = await db.scraper_logs.count_documents({
        "timestamp": {"$gte": today}
    })
    
    # Count by level
    level_counts = {}
    for level in ["INFO", "WARNING", "ERROR"]:
        count = await db.scraper_logs.count_documents({"level": level})
        level_counts[level] = count
    
    # Count by target
    target_counts = {}
    cursor = db.scraper_logs.distinct("target")
    targets = await cursor.to_list(length=100)
    for t in targets:
        count = await db.scraper_logs.count_documents({"target": t})
        target_counts[t] = count
    
    # Success rate (ERRORs vs total)
    total_logs = await db.scraper_logs.count_documents({})
    success_rate = ((total_logs - level_counts.get("ERROR", 0)) / total_logs * 100) if total_logs > 0 else 100
    
    # Last successful scrape
    last_success = await db.scraper_logs.find_one(
        {"level": "INFO", "status": "success"},
        sort=[("timestamp", -1)]
    )
    
    return {
        "total_scrapes_today": today_logs,
        "success_rate": round(success_rate, 2),
        "last_successful_scrape": last_success["timestamp"] if last_success else None,
        "active_errors": level_counts.get("ERROR", 0),
        "by_level": level_counts,
        "by_target": target_counts
    }


@router.get("/scraper-status")
async def get_scraper_status(admin: dict = Depends(get_current_admin)):
    """Get current scrape status for all targets."""
    db = get_database()
    
    # List of known embassy targets
    targets = ["UK", "Germany", "France", "Spain", "Italy", "USA", "Canada", "Australia", "Japan"]
    
    status_list = []
    for target in targets:
        # Get last log for this target
        last_log = await db.scraper_logs.find_one(
            {"target": {"$regex": target, "$options": "i"}},
            sort=[("timestamp", -1)]
        )
        
        # Count consecutive failures
        recent_logs = await db.scraper_logs.find(
            {"target": {"$regex": target, "$options": "i"}}
        ).sort("timestamp", -1).limit(5).to_list(length=5)
        
        failures = sum(1 for log in recent_logs if log.get("level") == "ERROR")
        
        # Determine status
        if not last_log:
            status = "never_run"
        elif failures >= 3:
            status = "error"
        elif failures > 0:
            status = "warning"
        else:
            status = "healthy"
        
        status_list.append({
            "target": target,
            "status": status,
            "last_run": last_log["timestamp"] if last_log else None,
            "last_status": last_log["status"] if last_log else None,
            "consecutive_failures": failures
        })
    
    return {"targets": status_list}


@router.post("/scraper/run")
async def trigger_scraper(
    target: str = None,
    admin: dict = Depends(get_current_admin)
):
    """Trigger scraper for a specific target or all targets."""
    import datetime
    db = get_database()
    
    # Log the scrape request
    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "target": target if target else "all",
        "action": "manual_scrape",
        "level": "INFO",
        "status": "started",
        "message": f"Manual scrape triggered for {target if target else 'all targets'}",
        "details": {}
    }
    
    await db.scraper_logs.insert_one(log_entry)
    
    # In a real implementation, this would trigger the actual scraper
    # For now, just return success
    return {
        "message": "Scrape triggered successfully",
        "target": target if target else "all",
        "log_id": str(log_entry["_id"])
    }

@router.get("/appointments")
async def get_appointments(user: dict = Depends(get_current_user)):
    db = get_database()
    # default to testuser_1234@test.com for demo
    appts = await db.appointments.find_one({"user_email": "testuser_1234@test.com"})
    if not appts:
        return {"selected": {}, "available_slots": [], "month": "October 2023"}
    appts["_id"] = str(appts["_id"])
    return appts

@router.get("/documents")
async def get_documents(user: dict = Depends(get_current_user)):
    db = get_database()
    docs = await db.documents.find_one({"user_email": "testuser_1234@test.com"})
    if not docs:
        return {"active_processing": {}, "checklist": []}
    docs["_id"] = str(docs["_id"])
    return docs


# ==================== Scheduler Endpoints ====================

# Global scheduler instance
_scheduler = None


def get_scheduler():
    """Get or initialize the scheduler."""
    global _scheduler
    if _scheduler is None:
        import sys
        import os
        # Add rag_pipeline to path
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from rag_pipeline.scheduler import EmbassyScheduler, SchedulerConfig
        config = SchedulerConfig()
        _scheduler = EmbassyScheduler(config)
        _scheduler.start()
    return _scheduler


@router.get("/scheduler/jobs")
async def list_scheduler_jobs(admin: dict = Depends(get_current_admin)):
    """List all scheduled jobs."""
    scheduler = get_scheduler()
    return {
        "jobs": scheduler.list_jobs()
    }


@router.post("/scheduler/jobs")
async def add_scheduler_job(
    job_config: dict,
    admin: dict = Depends(get_current_admin)
):
    """Add a new scheduled job."""
    scheduler = get_scheduler()
    
    job_id = job_config.get("job_id")
    job_type = job_config.get("type")  # "cron" or "interval"
    
    if not job_id or not job_type:
        raise HTTPException(
            status_code=400,
            detail="job_id and type are required"
        )
    
    # Import the function to run
    try:
        if job_config.get("target") == "daily":
            func = scheduler._run_daily_update
        elif job_config.get("target") == "weekly":
            func = scheduler._run_weekly_scan
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid target. Use 'daily' or 'weekly'"
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create trigger based on type
    from apscheduler.triggers.cron import CronTrigger
    from apscheduler.triggers.interval import IntervalTrigger
    
    if job_type == "cron":
        trigger = CronTrigger(
            hour=job_config.get("hour", 2),
            minute=job_config.get("minute", 0),
            day_of_week=job_config.get("day_of_week", "*")
        )
    elif job_type == "interval":
        trigger = IntervalTrigger(
            days=job_config.get("days", 1),
            hours=job_config.get("hours", 0),
            minutes=job_config.get("minutes", 0)
        )
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid job type. Use 'cron' or 'interval'"
        )
    
    result = scheduler.add_job(
        job_id=job_id,
        func=func,
        trigger=trigger,
        name=job_config.get("name", job_id),
        description=job_config.get("description", "")
    )
    
    if result:
        return {"message": "Job added successfully", "job_id": result}
    else:
        raise HTTPException(status_code=500, detail="Failed to add job")


@router.delete("/scheduler/jobs/{job_id}")
async def remove_scheduler_job(job_id: str, admin: dict = Depends(get_current_admin)):
    """Remove a scheduled job."""
    scheduler = get_scheduler()
    if scheduler.remove_job(job_id):
        return {"message": "Job removed successfully", "job_id": job_id}
    else:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")


@router.post("/scheduler/jobs/{job_id}/run")
async def trigger_scheduler_job(job_id: str, admin: dict = Depends(get_current_admin)):
    """Trigger immediate run of a job."""
    scheduler = get_scheduler()
    if scheduler.run_job(job_id):
        return {"message": "Job triggered successfully", "job_id": job_id}
    else:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")


@router.get("/scheduler/jobs/{job_id}/results")
async def get_job_results(job_id: str, admin: dict = Depends(get_current_admin)):
    """Get job execution history."""
    scheduler = get_scheduler()
    limit = 10
    return {
        "job_id": job_id,
        "results": scheduler.get_job_results(job_id, limit),
        "stats": scheduler.get_job_stats(job_id)
    }

