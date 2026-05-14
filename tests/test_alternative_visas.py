"""Tests for alternative visa suggestion logic (D-17).

Coverage: get_alternative_visas, empty alternatives, no result for invalid IDs
Req: BOT-04 (alternative visa suggestions for ineligible users)
"""
import pytest
from app.eligibility import get_alternative_visas


@pytest.mark.asyncio
async def test_get_alternative_visas_found(test_db, test_visa_data):
    """Given valid alternative_visa_ids, returns matching visa details.
    The test_visa_data fixture creates visa IDs 1 (US B1/B2) and 2 (UK Visitor).
    Get alternatives for visa 1 should return visa 2."""
    async with test_db() as session:
        results = await get_alternative_visas([2], session=session)
        assert len(results) >= 1
        # Should include UK or the second visa type
        types = [r["visa_type"] for r in results]
        assert any("Visitor" in t for t in types)


@pytest.mark.asyncio
async def test_get_alternative_visas_empty_list(test_db):
    """Empty alternative_visa_ids list returns empty list -- no crash."""
    async with test_db() as session:
        results = await get_alternative_visas([], session=session)
        assert results == []


@pytest.mark.asyncio
async def test_get_alternative_visas_non_existent_ids(test_db):
    """IDs that don't exist return empty list -- no crash."""
    async with test_db() as session:
        results = await get_alternative_visas([999, 888], session=session)
        assert results == []
