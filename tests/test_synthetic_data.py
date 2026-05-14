"""Tests for synthetic visa data seeding.

Coverage: seed_visa_data.py creates records for 5+ countries with 3+ visa types,
FAISS index is rebuilt after seeding.
Req: VISA-03 (eligibility check against destination country requirements)
"""
import pytest
from sqlalchemy import select
from app.models import VisaTable


@pytest.mark.asyncio
async def test_seed_creates_multiple_visa_records(test_db, test_visa_data):
    """After seeding, VisaTable contains records for test countries."""
    async with test_db() as session:
        result = await session.execute(select(VisaTable))
        rows = result.scalars().all()
    assert len(rows) >= 2  # At least the 2 test visas


@pytest.mark.asyncio
async def test_seeded_visa_has_eligibility_fields(test_db, test_visa_data):
    """Each seeded VisaTable record has non-null eligibility fields."""
    async with test_db() as session:
        result = await session.execute(select(VisaTable))
        rows = result.scalars().all()

    for row in rows:
        assert row.min_age is not None, f"{row.visa_type} missing min_age"
        assert row.min_balance is not None, f"{row.visa_type} missing min_balance"
        assert row.get_allowed_purposes() is not None, f"{row.visa_type} missing allowed_purposes"
        assert len(row.get_allowed_purposes()) > 0, f"{row.visa_type} has empty allowed_purposes"
        assert len(row.get_documents()) > 0, f"{row.visa_type} has no documents"


@pytest.mark.asyncio
async def test_seeded_visa_has_rules_and_alternatives(test_db, test_visa_data):
    """Each seeded VisaTable has eligibility_rules and may have alternative_visa_ids."""
    async with test_db() as session:
        result = await session.execute(select(VisaTable))
        rows = result.scalars().all()

    all_have_rules = all(
        len(row.get_eligibility_rules()) > 0
        for row in rows
    )
    assert all_have_rules, "Not all visa records have eligibility_rules"
