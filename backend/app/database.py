"""MongoDB primary database configuration."""

import os
import logging
from pathlib import Path
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class MongoSettings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "visa_db"

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")
        extra = "ignore"


_mongo_client: Optional[AsyncIOMotorClient] = None
_mongo_db: Optional[AsyncIOMotorDatabase] = None


def get_database() -> AsyncIOMotorDatabase:
    """Get the MongoDB database instance (lazy singleton)."""
    global _mongo_client, _mongo_db
    if _mongo_client is None:
        settings = MongoSettings()
        _mongo_client = AsyncIOMotorClient(
            settings.mongodb_url,
            maxPoolSize=100,
            serverSelectionTimeoutMS=5000,
        )
        _mongo_db = _mongo_client[settings.database_name]
    return _mongo_db


async def init_db():
    """Ensure collections and indexes exist."""
    db = get_database()

    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")

    # Visas
    await db.visas.create_index([("country", 1), ("visa_type", 1)])
    await db.visas.create_index("country")

    # Assessments
    await db.assessments.create_index([("user_email", 1), ("status", 1)])
    await db.assessments.create_index("user_email")

    # Appointments
    await db.appointments.create_index([("date", 1), ("time_slot", 1)], unique=True)
    await db.appointments.create_index("user_email")
    await db.appointments.create_index("status")

    # Documents
    await db.user_documents.create_index("user_email")
    await db.document_status.create_index([("user_email", 1), ("document_type", 1)], unique=True)

    # Progress
    await db.progress.create_index("user_email", unique=True)

    # Workflows
    await db.workflow.create_index("task_id")

    # Queries
    await db.queries.create_index("user_email")
    await db.queries.create_index("status")

    # Notifications
    await db.notifications.create_index([("user_email", 1), ("created_at", -1)])
    await db.notification_preferences.create_index("user_email", unique=True)

    # Reset tokens
    await db.reset_tokens.create_index("token", unique=True)
    await db.reset_tokens.create_index([("email", 1), ("used", 1)])

    # Scraper logs
    await db.scraper_logs.create_index([("timestamp", -1)])
    await db.scraper_logs.create_index([("target", 1), ("timestamp", -1)])

    logger.info("MongoDB collections and indexes ready")


def doc_to_id(doc: dict) -> dict:
    """Convert MongoDB _id to string id and remove ObjectId."""
    if not doc:
        return doc
    result = dict(doc)
    if "_id" in result:
        result["id"] = str(result["_id"])
        del result["_id"]
    return result
