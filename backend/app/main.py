from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Visa Automation API")

app.include_router(router)

# Global scheduler instance
scheduler_instance = None


@app.on_event("startup")
async def startup_event():
    # Create MongoDB indexes for performance
    try:
        from .database import create_indexes
        await create_indexes()
        print("MongoDB indexes created successfully")
    except Exception as e:
        print("Failed to create MongoDB indexes on startup", e)

    # Connect to Redis cache
    try:
        from .cache import get_cache
        await get_cache()
        print("Redis cache connected successfully")
    except Exception as e:
        print("Failed to connect to Redis on startup", e)

    # index visa docs into FAISS at startup (non-blocking)
    try:
        from .rag import index_from_db

        await index_from_db()
    except Exception as e:
        print("Failed to index docs on startup", e)
    
    # Start scheduler
    global scheduler_instance
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from rag_pipeline.scheduler import EmbassyScheduler, SchedulerConfig
        config = SchedulerConfig()
        if config.enabled:
            scheduler_instance = EmbassyScheduler(config)
            scheduler_instance.start()
            print(f"Scheduler started with {len(scheduler_instance.list_jobs())} jobs")
    except Exception as e:
        print("Failed to start scheduler on startup", e)


@app.on_event("shutdown")
async def shutdown_event():
    # Disconnect Redis cache
    try:
        from .cache import _cache_service
        if _cache_service:
            await _cache_service.disconnect()
            print("Redis cache disconnected successfully")
    except Exception as e:
        print("Failed to disconnect Redis on shutdown", e)

    # Stop scheduler gracefully
    global scheduler_instance
    if scheduler_instance:
        try:
            scheduler_instance.stop()
            print("Scheduler stopped gracefully")
        except Exception as e:
            print("Failed to stop scheduler on shutdown", e)


@app.get("/")
def root():
    return {"message": "Welcome to Visa Automation API"}


@app.get("/health")
async def health_check():
    """Health check endpoint for load balancer."""
    health = {"status": "healthy", "services": {}}
    
    # Check MongoDB
    try:
        from .database import get_database
        db = get_database()
        await db.command("ping")
        health["services"]["mongodb"] = "connected"
    except Exception as e:
        health["services"]["mongodb"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    # Check Redis
    try:
        from .cache import get_cache
        cache = await get_cache()
        if cache._client:
            await cache._client.ping()
            health["services"]["redis"] = "connected"
        else:
            health["services"]["redis"] = "not connected"
    except Exception as e:
        health["services"]["redis"] = f"error: {str(e)}"
        health["status"] = "degraded"
    
    return health
