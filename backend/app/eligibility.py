"""Hybrid eligibility assessment: deterministic rules + LLM structured output.

Per D-06: LLM only for nuanced cases after all deterministic hard rules pass.
Per AI-SPEC §4b.1: Uses ChatGroq.with_structured_output() for structured LLM output.
Per T-02-02-05: Falls back to deterministic-only result if LLM fails.
"""

import asyncio
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
        "min_age": visa_record.get("min_age") or 0,
        "max_age": visa_record.get("max_age"),
        "min_balance": visa_record.get("min_balance") or 0,
        "allowed_purposes": visa_record.get("allowed_purposes", ["tourism"]),
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
        # Step 3 — Deterministic failure: return detailed breakdown with alternative visas
        alt_visas = await get_alternative_visas(
            visa_record.get("alternative_visa_ids", [])
        )

        return {
            "overall_eligible": False,
            "score": score,
            "visa_type": visa_record.get("visa_type", ""),
            "country": visa_record.get("country", ""),
            "matched_requirements": passed_rules,
            "missing_requirements": [
                f"{k}: {v['detail']}" for k, v in rule_checks.items() if not v["passed"]
            ],
            "actionable_feedback": actionable,
            "alternative_visa_suggestion": None,
            "alternative_visas": alt_visas,
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
            f"Assess visa eligibility for {assessment_data.get('destination_country', visa_record.get('country', ''))} "
            f"{visa_record.get('visa_type', '')} visa.\n"
            f"Applicant: age={assessment_data.get('age')}, "
            f"bank_balance=${assessment_data.get('bank_balance', 0):,.0f}, "
            f"purpose={assessment_data.get('purpose')}\n"
            f"Requirements: min_age={visa_req['min_age']}, "
            f"min_balance=${visa_req['min_balance']:,.0f}, "
            f"allowed_purposes={visa_req['allowed_purposes']}\n"
            f"Deterministic results: all passed"
        )

        llm_result = await asyncio.wait_for(
            structured_llm.ainvoke(prompt), timeout=15.0
        )

        if isinstance(llm_result, EligibilityAssessment):
            logger.info("LLM structured output succeeded (confidence=%.2f)", llm_result.confidence)
            return {
                "overall_eligible": llm_result.overall_eligible,
                "score": llm_result.confidence,
                "visa_type": llm_result.visa_type or visa_record.get("visa_type", ""),
                "country": llm_result.country or visa_record.get("country", ""),
                "matched_requirements": list(set(llm_result.matched_requirements + passed_rules)),
                "missing_requirements": llm_result.missing_requirements,
                "actionable_feedback": llm_result.actionable_feedback,
                "alternative_visa_suggestion": llm_result.alternative_visa_suggestion,
                "alternative_visas": [],
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
        "visa_type": visa_record.get("visa_type", ""),
        "country": visa_record.get("country", ""),
        "matched_requirements": passed_rules,
        "missing_requirements": [],
        "actionable_feedback": [],
        "alternative_visa_suggestion": None,
        "alternative_visas": [],
        "rule_results": {k: v["passed"] for k, v in rule_checks.items()},
    }


async def get_alternative_visas(alternative_visa_ids: list) -> list:
    """Look up alternative visa suggestions by ID from MongoDB."""
    if not alternative_visa_ids:
        return []

    from bson.objectid import ObjectId
    from .database import get_database
    from .models import COLL_VISAS

    ids = [ObjectId(v) for v in alternative_visa_ids if isinstance(v, str) and len(v) == 24]
    if not ids:
        return []

    try:
        db = get_database()
        cursor = db[COLL_VISAS].find({"_id": {"$in": ids}})
        rows = await cursor.to_list(length=len(ids))
        return [
            {
                "id": str(r["_id"]),
                "country": r.get("country", ""),
                "visa_type": r.get("visa_type", ""),
                "description": r.get("description") or f"{r.get('visa_type', '')} for {r.get('country', '')}",
                "processing_time": r.get("processing_time"),
                "fee": r.get("fee"),
            }
            for r in rows
        ]
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Failed to get alternative visas: %s", e)
        return []


# ── Conversational eligibility (remote-enhanced, RAG+LLM based) ────────────

from pydantic import BaseModel as _BM


class ConversationalEligibilityContext(_BM):
    travel_purpose: str
    duration_days: Optional[int] = None
    country: str
    nationality: Optional[str] = None
    has_passport: bool = True
    has_prior_visa: bool = False
    criminal_record: bool = False
    has_ties: bool = True


class ConversationalEligibilityResult(_BM):
    eligible: bool
    visa_type: str
    confidence: float
    requirements_met: List[str]
    requirements_missing: List[str]
    processing_time: Optional[str] = None
    estimated_cost: Optional[str] = None
    notes: str


async def conversational_assess_eligibility(context: ConversationalEligibilityContext) -> ConversationalEligibilityResult:
    from .rag import load_vectorstore
    from langchain_groq import ChatGroq

    vs = load_vectorstore()
    query = f"{context.country} {context.travel_purpose} visa eligibility requirements"
    docs = vs.similarity_search(query, k=5)

    if not docs or not docs[0].page_content.strip():
        return ConversationalEligibilityResult(
            eligible=False, visa_type="Unknown", confidence=0.0,
            requirements_met=[], requirements_missing=["Could not find eligibility information"],
            notes="Unable to assess eligibility. Contact an administrator to add visa information."
        )

    context_text = "\n".join([doc.page_content for doc in docs])
    prompt = f"""You are a visa eligibility assessment expert. Based on the user's travel context and the visa knowledge base, determine if they are likely eligible for a visa.

User Context:
- Destination Country: {context.country}
- Travel Purpose: {context.travel_purpose}
- Duration: {context.duration_days} days if specified
- Nationality: {context.nationality if context.nationality else 'Not specified'}
- Has valid passport: {context.has_passport}
- Has prior visa: {context.has_prior_visa}
- Criminal record: {context.criminal_record}
- Has ties to home country: {context.has_ties}

Knowledge Base Information:
{context_text}

Based on this information, provide a structured eligibility assessment. Consider:
1. Visa type they should apply for
2. Whether they meet basic eligibility criteria
3. What documents they would need
4. Estimated processing time

Return your assessment in this format:
- ELIGIBLE: YES or NO
- VISA_TYPE: [specific visa type]
- CONFIDENCE: [0-1 scale]
- REQUIREMENTS_MET: [list of requirements user likely meets]
- REQUIREMENTS_MISSING: [list of requirements user likely needs]
- PROCESSING_TIME: [estimated time if known]
- ESTIMATED_COST: [estimated cost if known]
- NOTES: [any important notes or warnings]

If you cannot determine eligibility with confidence, state so clearly."""

    from .rag import _get_settings
    settings = _get_settings()
    llm = ChatGroq(groq_api_key=settings.groq_api_key, model_name="llama-3.1-8b-instant", temperature=0.3)

    try:
        response = await llm.ainvoke(prompt)
        response_text = response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        return ConversationalEligibilityResult(
            eligible=False, visa_type="Unknown", confidence=0.0,
            requirements_met=[], requirements_missing=["Error during assessment"],
            notes=f"Assessment failed: {str(e)}"
        )

    return _parse_conversational_result(response_text, context)


def _parse_conversational_result(response: str, context: ConversationalEligibilityContext) -> ConversationalEligibilityResult:
    lines = response.split('\n')
    eligible = False
    visa_type = "Standard Visa"
    confidence = 0.5
    requirements_met = []
    requirements_missing = []
    processing_time = None
    estimated_cost = None
    notes = ""

    for line in lines:
        line = line.strip()
        if line.startswith("ELIGIBLE:"):
            eligible = "YES" in line.upper()
        elif line.startswith("VISA_TYPE:"):
            visa_type = line.replace("VISA_TYPE:", "").strip()
        elif line.startswith("CONFIDENCE:"):
            try:
                confidence = float(line.replace("CONFIDENCE:", "").strip())
            except ValueError:
                confidence = 0.5
        elif line.startswith("REQUIREMENTS_MET:"):
            requirements_met = [r.strip() for r in line.replace("REQUIREMENTS_MET:", "").split(",") if r.strip()]
        elif line.startswith("REQUIREMENTS_MISSING:"):
            requirements_missing = [r.strip() for r in line.replace("REQUIREMENTS_MISSING:", "").split(",") if r.strip()]
        elif line.startswith("PROCESSING_TIME:"):
            processing_time = line.replace("PROCESSING_TIME:", "").strip()
        elif line.startswith("ESTIMATED_COST:"):
            estimated_cost = line.replace("ESTIMATED_COST:", "").strip()
        elif line.startswith("NOTES:"):
            notes = line.replace("NOTES:", "").strip()

    if context.criminal_record:
        eligible = False
        notes = "A criminal record may affect visa eligibility. Additional scrutiny likely required."
        requirements_missing.append("Criminal background clearance certificate")

    if not context.has_passport:
        eligible = False
        requirements_missing.append("Valid passport")

    if not requirements_met and not requirements_missing:
        if context.travel_purpose.lower() in ["tourism", "business"]:
            requirements_met = ["Valid passport", "Proof of accommodation", "Return ticket"]
            requirements_missing = ["Financial proof", "Travel insurance"]
        elif context.travel_purpose.lower() == "work":
            requirements_met = ["Valid passport"]
            requirements_missing = ["Employment letter", "Work permit", "Financial proof"]
        elif context.travel_purpose.lower() == "study":
            requirements_met = ["Valid passport"]
            requirements_missing = ["Acceptance letter", "Financial proof", "Student visa"]

    return ConversationalEligibilityResult(
        eligible=eligible, visa_type=visa_type, confidence=confidence,
        requirements_met=requirements_met, requirements_missing=requirements_missing,
        processing_time=processing_time, estimated_cost=estimated_cost, notes=notes
    )


async def conversational_get_status(user_email: str) -> Optional[dict]:
    from .database import get_database
    db = get_database()
    result = await db.eligibility_assessments.find_one({"user_email": user_email})
    if result:
        result["_id"] = str(result["_id"])
    return result


async def conversational_save_assessment(user_email: str, context: ConversationalEligibilityContext, result: ConversationalEligibilityResult):
    from .database import get_database
    from datetime import datetime
    db = get_database()
    assessment_doc = {"user_email": user_email, "context": context.dict(), "result": result.dict(), "assessed_at": datetime.utcnow().isoformat()}
    await db.eligibility_assessments.insert_one(assessment_doc)
    return {"saved": True, "assessment_id": str(assessment_doc.get("_id", "unknown"))}
