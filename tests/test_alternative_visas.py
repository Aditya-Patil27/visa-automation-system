"""Tests for alternative visa suggestion logic (D-17).

Coverage: get_alternative_visas, empty alternatives.
Req: BOT-04 (alternative visa suggestions for ineligible users)
"""
import pytest
from app.eligibility import get_alternative_visas


@pytest.mark.asyncio
async def test_get_alternative_visas_empty_list():
    """Empty list returns empty list."""
    results = await get_alternative_visas([])
    assert results == []


@pytest.mark.asyncio
async def test_get_alternative_visas_invalid_ids():
    """Invalid IDs return empty list."""
    results = await get_alternative_visas(["000000000000000000000000"])
    assert results == []
