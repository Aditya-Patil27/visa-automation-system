from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
from pydantic import field_validator


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


def get_database():
    settings = Settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    return client[settings.database_name]
