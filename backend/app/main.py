"""FastAPI application entry point."""
import os, logging
from pathlib import Path
from dotenv import load_dotenv

# Load .env BEFORE any other imports
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .routes import router
from .database import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="Visa Automation API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = os.getenv("CORS_ORIGIN", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    if not request.url.path.startswith("/api") and not request.url.path.startswith("/health"):
        response.headers["Cache-Control"] = "no-store"
    return response

app.include_router(router)

scheduler_instance = None

@app.on_event("startup")
async def startup_event():
    try:
        await init_db()
        logger.info("MongoDB initialized")
    except Exception as e:
        logger.warning("MongoDB init issue: %s", e)

    try:
        from .cache import get_cache
        await get_cache()
        logger.info("Redis cache connected")
    except Exception as e:
        logger.warning("Redis cache not available: %s", e)

    try:
        from .rag import index_from_db
        await index_from_db()
        logger.info("FAISS index built")
    except Exception as e:
        logger.warning("FAISS index build failed: %s", e)

    global scheduler_instance
    try:
        import sys as _sys
        _sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from rag_pipeline.scheduler import EmbassyScheduler, SchedulerConfig
        config = SchedulerConfig()
        if config.enabled:
            scheduler_instance = EmbassyScheduler(config)
            scheduler_instance.start()
            logger.info("Scheduler started with %d jobs", len(scheduler_instance.list_jobs()))
    except Exception as e:
        logger.warning("Scheduler not started: %s", e)

@app.on_event("shutdown")
async def shutdown_event():
    try:
        from .cache import _cache_service
        if _cache_service:
            await _cache_service.disconnect()
            logger.info("Redis disconnected")
    except Exception as e:
        logger.error("Redis disconnect error: %s", e)

    global scheduler_instance
    if scheduler_instance:
        try:
            scheduler_instance.stop()
            logger.info("Scheduler stopped")
        except Exception as e:
            logger.error("Scheduler stop error: %s", e)

@app.get("/")
def root():
    return {"message": "Welcome to Visa Automation API"}

from fastapi.responses import JSONResponse

@app.get("/health")
async def health_check():
    health = {"status": "healthy", "services": {}}
    try:
        from .database import get_database
        db = get_database()
        await db.command("ping")
        health["services"]["mongodb"] = "connected"
    except Exception as e:
        health["services"]["mongodb"] = f"error: {str(e)}"
        health["status"] = "degraded"
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

    if health["status"] == "degraded":
        return JSONResponse(status_code=503, content=health)
    return health
