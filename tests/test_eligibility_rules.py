"""Tests for rules_engine.py deterministic eligibility rules.

Coverage: check_age, check_funds, check_purpose, check_passport, evaluate_all
Req: BOT-03 (deterministic document/requirement checking), VISA-02 (purpose assessment)
"""
import pytest
from app.rules_engine import (
    check_age, check_funds, check_purpose, check_passport,
    evaluate_all, get_actionable_feedback,
)


@pytest.mark.asyncio
async def test_check_age_passes():
    """Age 25 meets minimum 18 requirement -> passed=True."""
    result = check_age(25, 18)
    assert result["passed"] is True
    assert "meets requirement" in result["detail"]


@pytest.mark.asyncio
async def test_check_age_fails_below_minimum():
    """Age 17 fails minimum 18 requirement -> passed=False with actionable detail."""
    result = check_age(17, 18)
    assert result["passed"] is False
    assert "17" in result["detail"]
    assert "18" in result["detail"]


@pytest.mark.asyncio
async def test_check_age_fails_above_maximum():
    """Age 65 fails maximum 60 requirement -> passed=False."""
    result = check_age(65, 18, 60)
    assert result["passed"] is False
    assert "65" in result["detail"]
    assert "60" in result["detail"]


@pytest.mark.asyncio
async def test_check_funds_passes():
    """Balance $10,000 meets $5,000 minimum -> passed=True."""
    result = check_funds(10000.0, 5000.0)
    assert result["passed"] is True
    assert "10,000" in result["detail"]


@pytest.mark.asyncio
async def test_check_funds_fails():
    """Balance $2,500 fails $5,000 minimum -> passed=False with actionable detail per D-20."""
    result = check_funds(2500.0, 5000.0)
    assert result["passed"] is False
    assert "2,500" in result["detail"]
    assert "5,000" in result["detail"]


@pytest.mark.asyncio
async def test_check_purpose_passes():
    """Purpose 'tourism' is in allowed list -> passed=True."""
    result = check_purpose("tourism", ["tourism", "business"])
    assert result["passed"] is True
    assert "tourism" in result["detail"]


@pytest.mark.asyncio
async def test_check_purpose_fails():
    """Purpose 'work' is not in allowed list -> passed=False with actionable detail."""
    result = check_purpose("work", ["tourism", "business"])
    assert result["passed"] is False
    assert "work" in result["detail"]
    assert "tourism" in result["detail"]


@pytest.mark.asyncio
async def test_check_passport_passes():
    """Valid passport number -> passed=True."""
    result = check_passport("AB123456")
    assert result["passed"] is True
    assert "Passport provided" in result["detail"]


@pytest.mark.asyncio
async def test_check_passport_fails():
    """None passport -> passed=False."""
    result = check_passport(None)
    assert result["passed"] is False
    assert "Passport number is required" in result["detail"]


@pytest.mark.asyncio
async def test_check_passport_fails_empty():
    """Empty string passport -> passed=False."""
    result = check_passport("")
    assert result["passed"] is False


@pytest.mark.asyncio
async def test_evaluate_all_all_passed():
    """All requirements met -> all_passed=True, passed_count=4."""
    assessment = {"age": 30, "bank_balance": 10000.0, "purpose": "tourism", "passport_number": "AB123456"}
    visa_req = {"min_age": 18, "max_age": None, "min_balance": 5000.0, "allowed_purposes": ["tourism"]}
    result = evaluate_all(assessment, visa_req)
    assert result["all_passed"] is True
    assert result["passed_count"] == 4
    assert result["failed_count"] == 0


@pytest.mark.asyncio
async def test_evaluate_all_some_failed():
    """Age too low + insufficient funds -> all_passed=False, 2 failed."""
    assessment = {"age": 16, "bank_balance": 1000.0, "purpose": "tourism", "passport_number": "AB123456"}
    visa_req = {"min_age": 18, "max_age": None, "min_balance": 5000.0, "allowed_purposes": ["tourism"]}
    result = evaluate_all(assessment, visa_req)
    assert result["all_passed"] is False
    assert result["failed_count"] == 2
    assert result["passed_count"] == 2


@pytest.mark.asyncio
async def test_evaluate_all_with_max_age():
    """Age exceeds max_age -> fails."""
    assessment = {"age": 65, "bank_balance": 10000.0, "purpose": "tourism", "passport_number": "AB123456"}
    visa_req = {"min_age": 18, "max_age": 60, "min_balance": 5000.0, "allowed_purposes": ["tourism"]}
    result = evaluate_all(assessment, visa_req)
    assert result["all_passed"] is False
    assert result["age"]["passed"] is False


@pytest.mark.asyncio
async def test_get_actionable_feedback():
    """Failed rules produce actionable feedback strings."""
    rule_results = {
        "age": {"passed": False, "detail": "Minimum age is 18 (provided: 16)"},
        "funds": {"passed": True, "detail": "Balance $10,000 meets $5,000 minimum"},
    }
    feedback = get_actionable_feedback(rule_results)
    assert len(feedback) == 1
    assert "16" in feedback[0]
