from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
from pydantic import field_validator
import asyncio


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "visa_db"

    @field_validator('mongodb_url')
    @classmethod
    def validate_mongodb_url(cls, v: str) -> str:
        if "@cluster.mongodb.net" in v:
            raise ValueError("Invalid MongoDB Atlas connection string. You must include your specific cluster subdomain (e.g., @cluster0.xyzid.mongodb.net)")
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"


# Database client singleton
_client = None
_db = None


def get_database():
    global _client, _db
    if _client is None:
        settings = Settings()
        _client = AsyncIOMotorClient(settings.mongodb_url)
        _db = _client[settings.database_name]
    return _db


async def create_indexes():
    """
    Create MongoDB indexes for optimized query performance.
    Call this on application startup to ensure indexes exist.
    """
    db = get_database()

    # Users collection indexes
    await db.users.create_index("email", unique=True, background=True)
    await db.users.create_index("role", background=True)
    await db.users.create_index([("created_at", -1)], background=True)

    # Visas collection indexes
    await db.visas.create_index(
        [("country", 1), ("visa_type", 1)],
        background=True
    )
    await db.visas.create_index("country", background=True)
    await db.visas.create_index("visa_type", background=True)
    await db.visas.create_index([("updated_at", -1)], background=True)

    # Documents collection indexes
    await db.documents.create_index("user_email", background=True)
    await db.documents.create_index(
        [("user_email", 1), ("country_code", 1)],
        background=True
    )
    await db.documents.create_index(
        [("timestamp", -1)],
        background=True
    )
    await db.documents.create_index("status", background=True)

    # Appointments collection indexes
    await db.appointments.create_index("user_email", background=True)
    await db.appointments.create_index(
        [("user_email", 1), ("appointment_date", 1)],
        background=True
    )
    await db.appointments.create_index("appointment_date", background=True)
    await db.appointments.create_index("status", background=True)

    # Scraper logs indexes
    await db.scraper_logs.create_index(
        [("timestamp", -1)],
        background=True
    )
    await db.scraper_logs.create_index("target", background=True)
    await db.scraper_logs.create_index("level", background=True)
    await db.scraper_logs.create_index(
        [("target", 1), ("timestamp", -1)],
        background=True
    )

    # Progress collection indexes
    await db.progress.create_index("user_email", unique=True, background=True)

    # Workflow collection indexes
    await db.workflow.create_index("name", background=True)
    await db.workflow.create_index("status", background=True)

    # Eligibility assessments indexes
    await db.eligibility_assessments.create_index(
        [("user_email", 1), ("timestamp", -1)],
        background=True
    )
    await db.eligibility_assessments.create_index("timestamp", background=True)

    # Notifications indexes
    await db.notifications.create_index(
        [("user_email", 1), ("timestamp", -1)],
        background=True
    )
    await db.notifications.create_index("user_email", background=True)
    await db.notifications.create_index("read", background=True)

    # Notification preferences indexes
    await db.notification_preferences.create_index(
        "user_email",
        unique=True,
        background=True
    )

    print("MongoDB indexes created successfully")


async def verify_indexes():
    """Verify that indexes exist on the collections."""
    db = get_database()
    indexes_info = {}

    collections = [
        "users", "visas", "documents", "appointments",
        "scraper_logs", "progress", "workflow",
        "eligibility_assessments", "notifications", "notification_preferences"
    ]

    for collection_name in collections:
        collection = db[collection_name]
        indexes = await collection.index_information()
        indexes_info[collection_name] = list(indexes.keys())

    return indexes_info
