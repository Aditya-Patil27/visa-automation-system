"""Shared test fixtures for Phase 2 tests.

Provides:
- test_db: in-memory SQLite async session with all tables created
- test_visa_data: seeded VisaTable records for testing eligibility rules
- test_client: httpx AsyncClient pointed at the FastAPI app
- test_jwt_token: valid JWT token for authenticated test requests
- test_assessment: an AssessmentTable draft record
"""
import asyncio
import json
import os
import sys
import pytest
import pytest_asyncio
from datetime import datetime

# Ensure backend/ is on the Python path so `from app.database` etc. resolve
_backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.database import Base
from app.models import VisaTable, AssessmentTable
from app.security import create_access_token


@pytest_asyncio.fixture
async def test_db():
    """Create an in-memory SQLite database with all tables.
    Yields an async_sessionmaker for test use.
    Drops all tables after test completes."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    yield session_factory

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def test_visa_data(test_db):
    """Seed VisaTable with test records for rule testing.
    Returns list of created VisaTable objects."""
    async with test_db() as session:
        visas = []
        # US B1/B2 Tourist Visa
        v1 = VisaTable(
            country="United States",
            visa_type="B1/B2 Tourist/Business Visa",
            processing_time="10-15 business days",
            min_age=18,
            max_age=None,
            min_balance=5000.0,
            description="For tourism, business visits, or medical treatment.",
            validity="10 years",
            max_stay_days=180,
            fee=185.0,
        )
        v1.set_documents(["Valid passport", "DS-160 confirmation", "Photo", "Bank statements"])
        v1.set_allowed_purposes(["tourism", "business", "medical"])
        v1.set_eligibility_rules({
            "age_ok": "assessment.age >= visa.min_age",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
        })
        v1.set_alternative_visa_ids([2])
        visas.append(v1)

        # UK Standard Visitor Visa
        v2 = VisaTable(
            country="United Kingdom",
            visa_type="Standard Visitor Visa",
            processing_time="15 working days",
            min_age=18,
            max_age=None,
            min_balance=3000.0,
            description="For tourism, family visits, or business meetings.",
            fee=115.0,
        )
        v2.set_documents(["Valid passport", "Bank statements", "Travel itinerary"])
        v2.set_allowed_purposes(["tourism", "business"])
        v2.set_eligibility_rules({
            "age_ok": "assessment.age >= visa.min_age",
            "funds_ok": "assessment.bank_balance >= visa.min_balance",
        })
        v2.set_alternative_visa_ids([1])  # references v1 (US B1/B2)
        visas.append(v2)

        for v in visas:
            session.add(v)
        await session.commit()
        for v in visas:
            await session.refresh(v)

        return visas


@pytest_asyncio.fixture
async def test_client():
    """Return an httpx AsyncClient pointed at the FastAPI test app.
    Requires app.main to import correctly with test settings."""
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


@pytest_asyncio.fixture
async def test_assessment(test_db):
    """Create a draft AssessmentTable record with sample form data."""
    async with test_db() as session:
        from app.models import AssessmentTable
        assessment = AssessmentTable(
            user_email="testuser@example.com",
            status="draft",
            current_step=1,
            form_data=json.dumps({
                "1": {"full_name": "John Doe", "nationality": "United States",
                      "date_of_birth": "1990-01-15", "passport_number": "AB123456"},
            }),
        )
        session.add(assessment)
        await session.commit()
        await session.refresh(assessment)
        return assessment
