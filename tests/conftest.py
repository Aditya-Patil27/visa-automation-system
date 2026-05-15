"""Shared test fixtures for MongoDB-backed tests."""
import asyncio
import sys, os
import pytest
import pytest_asyncio

_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.security import create_access_token


@pytest_asyncio.fixture
async def test_client():
    """Return an httpx AsyncClient pointed at the FastAPI test app."""
    import httpx
    from app.main import app
    from asgi_lifespan import LifespanManager

    async with LifespanManager(app):
        async with httpx.AsyncClient(app=app, base_url="http://test") as client:
            yield client


@pytest.fixture
def test_jwt_token():
    """Create a valid JWT token for test user."""
    return create_access_token({"sub": "testuser@example.com", "role": "applicant"})


@pytest.fixture
def test_jwt_admin_token():
    """Create a valid JWT token for admin user."""
    return create_access_token({"sub": "admin@example.com", "role": "admin"})
