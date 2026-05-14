from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Visa Automation API")

app.include_router(router)

# Global scheduler instance
scheduler_instance = None


@app.on_event("startup")
async def startup_event():
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
