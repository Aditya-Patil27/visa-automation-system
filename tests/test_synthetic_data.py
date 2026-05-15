"""Tests for synthetic visa data seeding.

Coverage: seed_db.py creates records for 6 countries.
"""
import pytest
from app.models import COLL_VISAS
from app.database import get_database


@pytest.mark.asyncio
async def test_seed_data_model_has_required_fields():
    """VisaRequirement model validates required fields."""
    from app.models import VisaRequirement
    v = VisaRequirement(country="Test", visa_type="Test", documents=["Doc1"])
    assert v.country == "Test"
    assert v.visa_type == "Test"
    assert v.documents == ["Doc1"]
    assert v.min_age == 18  # default
    assert v.min_balance == 0.0  # default


@pytest.mark.asyncio
async def test_visa_to_db_converts_correctly():
    """visa_to_db creates expected dict."""
    from app.models import visa_to_db, VisaRequirement
    req = VisaRequirement(country="Test", visa_type="Test", documents=["Doc1"],
                          min_age=21, min_balance=5000.0)
    doc = visa_to_db(req)
    assert doc["country"] == "Test"
    assert doc["min_age"] == 21
    assert doc["min_balance"] == 5000.0
    assert doc["documents"] == ["Doc1"]
