"""
Redis caching layer for performance optimization.
Supports caching of visa requirements, user sessions, and RAG query results.
"""

import json
import hashlib
import logging
from typing import Any, Optional
from datetime import timedelta

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl_default: int = 300
    cache_ttl_rag: int = 3600
    cache_ttl_visa: int = 600
    cache_ttl_session: int = 1800

    class Config:
        env_file = ".env"
        extra = "ignore"


class CacheService:
    """Async Redis cache service for the visa automation system."""

    def __init__(self):
        self._client: Any = None
        self._settings = Settings()

    async def connect(self) -> None:
        """Initialize Redis connection lazily — only imports redis module on first use."""
        if self._client is None:
            try:
                import redis.asyncio as redis
                self._client = redis.from_url(
                    self._settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True
                )
            except ImportError:
                logger.warning("redis module not installed — cache disabled")
                self._client = None

    def is_connected(self) -> bool:
        return self._client is not None

    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()
            self._client = None

    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        if not self._client:
            return None
        return await self._client.get(key)

    async def set(
        self,
        key: str,
        value: str,
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache with optional TTL (in seconds)."""
        if not self._client:
            return False
        if ttl is None:
            ttl = self._settings.cache_ttl_default
        return await self._client.setex(key, ttl, value)

    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self._client:
            return False
        return await self._client.delete(key) > 0

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if not self._client:
            return False
        return await self._client.exists(key) > 0

    async def get_json(self, key: str) -> Optional[dict]:
        """Get JSON value from cache."""
        value = await self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return None
        return None

    async def set_json(
        self,
        key: str,
        value: dict,
        ttl: Optional[int] = None
    ) -> bool:
        """Set JSON value in cache."""
        return await self.set(key, json.dumps(value), ttl)

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching a pattern."""
        if not self._client:
            return 0
        keys = []
        async for key in self._client.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            return await self._client.delete(*keys)
        return 0

    async def clear_all(self) -> bool:
        """Clear all cache entries."""
        if not self._client:
            return False
        await self._client.flushdb()
        return True


# Global cache instance
_cache_service: Optional[CacheService] = None


async def get_cache() -> CacheService:
    """Get the global cache service instance."""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
        await _cache_service.connect()
    return _cache_service


# ==================== Cache Helper Functions ====================


def _generate_cache_key(prefix: str, *args) -> str:
    """Generate a cache key from prefix and arguments."""
    key_parts = [prefix] + [str(arg) for arg in args]
    return ":".join(key_parts)


def _hash_query(query: str) -> str:
    """Generate a short hash for query strings."""
    return hashlib.md5(query.encode()).hexdigest()[:12]


async def cache_rag_result(query: str, result: str) -> bool:
    """
    Cache RAG query result.

    Args:
        query: The user's question
        result: The AI-generated answer

    Returns:
        True if cached successfully
    """
    cache = await get_cache()
    key = f"rag:{_hash_query(query)}"
    return await cache.set(
        key,
        result,
        ttl=Settings().cache_ttl_rag
    )


async def get_cached_rag_result(query: str) -> Optional[str]:
    """
    Retrieve cached RAG query result.

    Args:
        query: The user's question

    Returns:
        Cached result or None if not found
    """
    cache = await get_cache()
    key = f"rag:{_hash_query(query)}"
    return await cache.get(key)


async def cache_visa_requirements(country: str, visa_type: str, requirements: dict) -> bool:
    """
    Cache visa requirements for a country and visa type.

    Args:
        country: Country code (e.g., "US", "UK")
        visa_type: Type of visa (e.g., "tourist", "work")
        requirements: The visa requirements dict

    Returns:
        True if cached successfully
    """
    cache = await get_cache()
    key = f"visa:{country.lower()}:{visa_type.lower()}"
    return await cache.set_json(
        key,
        requirements,
        ttl=Settings().cache_ttl_visa
    )


async def get_cached_visa_requirements(country: str, visa_type: str) -> Optional[dict]:
    """
    Retrieve cached visa requirements.

    Args:
        country: Country code
        visa_type: Type of visa

    Returns:
        Cached requirements or None if not found
    """
    cache = await get_cache()
    key = f"visa:{country.lower()}:{visa_type.lower()}"
    return await cache.get_json(key)


async def cache_user_session(user_email: str, session_data: dict) -> bool:
    """
    Cache user session data.

    Args:
        user_email: User's email address
        session_data: Session data to cache

    Returns:
        True if cached successfully
    """
    cache = await get_cache()
    key = f"session:{user_email}"
    return await cache.set_json(
        key,
        session_data,
        ttl=Settings().cache_ttl_session
    )


async def get_cached_user_session(user_email: str) -> Optional[dict]:
    """
    Retrieve cached user session.

    Args:
        user_email: User's email address

    Returns:
        Cached session or None if not found
    """
    cache = await get_cache()
    key = f"session:{user_email}"
    return await cache.get_json(key)


async def invalidate_user_session(user_email: str) -> bool:
    """Invalidate user session cache."""
    cache = await get_cache()
    key = f"session:{user_email}"
    return await cache.delete(key)


async def invalidate_visa_cache(country: Optional[str] = None) -> int:
    """
    Invalidate visa requirement cache.

    Args:
        country: Specific country to invalidate, or None for all

    Returns:
        Number of keys deleted
    """
    cache = await get_cache()
    if country:
        return await cache.clear_pattern(f"visa:{country.lower()}:*")
    return await cache.clear_pattern("visa:*")


async def invalidate_rag_cache() -> int:
    """Invalidate all RAG query cache."""
    cache = await get_cache()
    return await cache.clear_pattern("rag:*")


async def get_cache_stats() -> dict:
    """Get cache statistics."""
    cache = await get_cache()
    if not cache._client:
        return {"status": "disconnected"}

    info = await cache._client.info("stats")
    return {
        "status": "connected",
        "keys": await cache._client.dbsize(),
        "hits": info.get("keyspace_hits", 0),
        "misses": info.get("keyspace_misses", 0),
        "hit_rate": (
            info.get("keyspace_hits", 0) /
            max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
            * 100
        )
    }