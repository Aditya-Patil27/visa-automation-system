"""Deterministic eligibility rules engine — hand-rolled Python functions.

Per D-04: pure Python, no rule-engine library, no external calls.
Completes under 200ms.
"""

from typing import Dict, Any, List


def check_age(age: int, min_age: int, max_age: int | None = None) -> Dict[str, Any]:
    """Check if applicant meets age requirements."""
    if age < min_age:
        return {"passed": False, "detail": f"Minimum age is {min_age} (provided: {age})"}
    if max_age is not None and age > max_age:
        return {"passed": False, "detail": f"Maximum age is {max_age} (provided: {age})"}
    return {"passed": True, "detail": f"Age {age} meets requirement"}


def check_funds(balance: float, min_balance: float) -> Dict[str, Any]:
    """Check that the applicant's bank balance meets the minimum requirement.

    Per D-20: actionable feedback includes actual vs required values.
    """
    if balance < min_balance:
        return {
            "passed": False,
            "detail": f"Minimum balance is ${min_balance:,.0f} (provided: ${balance:,.0f})",
        }
    return {"passed": True, "detail": f"Balance ${balance:,.0f} meets ${min_balance:,.0f} minimum"}


def check_purpose(purpose: str, allowed_purposes: List[str]) -> Dict[str, Any]:
    """Check if the purpose of travel is covered by the visa type (case-insensitive)."""
    if purpose.lower() not in [p.lower() for p in allowed_purposes]:
        return {
            "passed": False,
            "detail": f"Purpose '{purpose}' not in allowed purposes: {', '.join(allowed_purposes)}",
        }
    return {"passed": True, "detail": f"Purpose '{purpose}' is allowed"}


def check_passport(passport_number: str | None) -> Dict[str, Any]:
    """Check that a passport number has been provided."""
    if passport_number:
        return {"passed": True, "detail": "Passport provided"}
    return {"passed": False, "detail": "Passport number is required"}


def evaluate_all(assessment: dict, visa_req: dict) -> Dict[str, Dict[str, Any]]:
    """Run all four deterministic checks and return detailed results.

    Args:
        assessment: dict with keys like 'age', 'bank_balance', 'purpose', 'passport_number'
        visa_req: dict with keys like 'min_age', 'max_age', 'min_balance', 'allowed_purposes'

    Returns:
        dict with per-check results plus computed aggregates.
    """
    age_result = check_age(
        assessment.get("age", 0),
        visa_req.get("min_age", 0),
        visa_req.get("max_age"),
    )
    funds_result = check_funds(
        assessment.get("bank_balance", 0.0),
        visa_req.get("min_balance", 0.0),
    )
    purpose_result = check_purpose(
        assessment.get("purpose", ""),
        visa_req.get("allowed_purposes", []),
    )
    passport_result = check_passport(assessment.get("passport_number"))

    results = {
        "age": age_result,
        "funds": funds_result,
        "purpose": purpose_result,
        "passport": passport_result,
    }

    passed_count = sum(1 for r in results.values() if r["passed"])
    failed_count = 4 - passed_count
    all_passed = failed_count == 0

    return {
        **results,
        "all_passed": all_passed,
        "passed_count": passed_count,
        "failed_count": failed_count,
    }


def get_actionable_feedback(rule_results: dict) -> List[str]:
    """Collect detail strings from all failed rules into a list.

    Per D-20: returns actionable feedback strings that tell the user
    what went wrong and what is needed.
    """
    feedback = []
    for key, result in rule_results.items():
        if isinstance(result, dict) and not result.get("passed", True):
            feedback.append(result.get("detail", f"{key}: check failed"))
    return feedback
