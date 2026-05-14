"""Hybrid eligibility assessment: deterministic rules + LLM structured output.

Per D-06: LLM only for nuanced cases after all deterministic hard rules pass.
Per AI-SPEC §4b.1: Uses ChatGroq.with_structured_output() for structured LLM output.
Per T-02-02-05: Falls back to deterministic-only result if LLM fails.
"""

import logging
from typing import List, Optional

from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)


class EligibilityAssessment(BaseModel):
    """Structured output model for LLM nuanced visa eligibility assessment.

    Per AI-SPEC §4b.1 — used with ChatGroq.with_structured_output().
    """

    overall_eligible: bool
    visa_type: str
    country: str
    matched_requirements: List[str]
    missing_requirements: List[str]
    actionable_feedback: List[str]
    alternative_visa_suggestion: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)


async def assess_eligibility(assessment_data: dict, visa_record) -> dict:
    """Hybrid eligibility assessment: deterministic rules first, then optional LLM.

    Per D-06:
      Step 1 — Run all deterministic rules via rules_engine.evaluate_all().
               If any hard rule fails, return deterministic-only result immediately.
      Step 2 — If all hard rules pass, attempt LLM structured output for nuanced
               assessment (non-PII data only — passport check was deterministic).
      Step 3 — If LLM fails or times out, return deterministic-only result
               as fallback (T-02-02-05).

    Args:
        assessment_data: dict with age, bank_balance, purpose, passport_number, etc.
        visa_record: VisaTable ORM row with min_age, min_balance, allowed_purposes, etc.

    Returns:
        dict with overall_eligible, score, visa_type, country,
        matched_requirements, missing_requirements, actionable_feedback,
        alternative_visa_suggestion, rule_results.
    """
    from .rules_engine import evaluate_all, get_actionable_feedback

    # ── Step 1: Deterministic rules (mandatory, runs first) ──────────────
    visa_req = {
        "min_age": visa_record.min_age or 0,
        "max_age": visa_record.max_age,
        "min_balance": visa_record.min_balance or 0,
        "allowed_purposes": visa_record.get_allowed_purposes(),
    }

    rule_results = evaluate_all(assessment_data, visa_req)

    # Extract the per-check results (age, funds, purpose, passport)
    rule_checks = {k: v for k, v in rule_results.items()
                   if isinstance(v, dict) and "passed" in v}

    all_passed = rule_results.get("all_passed", False)
    failed_rules = [k for k, v in rule_checks.items() if not v["passed"]]
    passed_rules = [k for k, v in rule_checks.items() if v["passed"]]
    score = max(0, 100 - (len(failed_rules) * 25))  # each failed rule costs 25 points
    actionable = get_actionable_feedback(rule_checks)

    if not all_passed:
        # Deterministic failure — return detailed breakdown immediately
        logger.info(
            "Deterministic rules failed (%d/%d): %s",
            len(failed_rules), len(rule_checks), failed_rules,
        )
        return {
            "overall_eligible": False,
            "score": score,
            "visa_type": visa_record.visa_type,
            "country": visa_record.country,
            "matched_requirements": passed_rules,
            "missing_requirements": [
                f"{k}: {v['detail']}" for k, v in rule_checks.items() if not v["passed"]
            ],
            "actionable_feedback": actionable,
            "alternative_visa_suggestion": None,
            "rule_results": {k: v["passed"] for k, v in rule_checks.items()},
        }

    # ── Step 2: All hard rules passed — attempt LLM structured output ─────
    logger.info("All deterministic rules passed — attempting LLM nuanced assessment")

    try:
        from langchain_groq import ChatGroq
        from .rag import _get_settings

        settings = _get_settings()

        structured_llm = ChatGroq(
            groq_api_key=settings.groq_api_key,
            model_name="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=512,
        ).with_structured_output(EligibilityAssessment)

        prompt = (
            f"Assess visa eligibility for {assessment_data.get('destination_country', visa_record.country)} "
            f"{visa_record.visa_type} visa.\n"
            f"Applicant: age={assessment_data.get('age')}, "
            f"bank_balance=${assessment_data.get('bank_balance', 0):,.0f}, "
            f"purpose={assessment_data.get('purpose')}\n"
            f"Requirements: min_age={visa_req['min_age']}, "
            f"min_balance=${visa_req['min_balance']:,.0f}, "
            f"allowed_purposes={visa_req['allowed_purposes']}\n"
            f"Deterministic results: all passed"
        )

        llm_result = await structured_llm.ainvoke(prompt)

        if isinstance(llm_result, EligibilityAssessment):
            logger.info("LLM structured output succeeded (confidence=%.2f)", llm_result.confidence)
            return {
                "overall_eligible": llm_result.overall_eligible,
                "score": llm_result.confidence,
                "visa_type": llm_result.visa_type or visa_record.visa_type,
                "country": llm_result.country or visa_record.country,
                "matched_requirements": list(set(llm_result.matched_requirements + passed_rules)),
                "missing_requirements": llm_result.missing_requirements,
                "actionable_feedback": llm_result.actionable_feedback,
                "alternative_visa_suggestion": llm_result.alternative_visa_suggestion,
                "rule_results": {k: v["passed"] for k, v in rule_checks.items()},
            }
        else:
            logger.warning("LLM returned unexpected type: %s", type(llm_result))

    except Exception as e:
        logger.warning("LLM structured output failed: %s — falling back to deterministic result", e)

    # ── Step 3: Deterministic-only fallback ──────────────────────────────
    return {
        "overall_eligible": True,
        "score": score,
        "visa_type": visa_record.visa_type,
        "country": visa_record.country,
        "matched_requirements": passed_rules,
        "missing_requirements": [],
        "actionable_feedback": [],
        "alternative_visa_suggestion": None,
        "rule_results": {k: v["passed"] for k, v in rule_checks.items()},
    }
