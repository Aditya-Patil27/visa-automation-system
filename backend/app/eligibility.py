"""
Visa Eligibility Assessment Service

Provides conversational eligibility checking via RAG-based matching.
"""

from typing import Dict, Optional, List
from pydantic import BaseModel
from .rag import load_vectorstore
from langchain_groq import ChatGroq
from pydantic_settings import Settings


class EligibilityContext(BaseModel):
    """User context for eligibility assessment"""
    travel_purpose: str  # tourism, business, work, study, transit
    duration_days: Optional[int] = None
    country: str
    nationality: Optional[str] = None
    has_passport: bool = True
    has_prior_visa: bool = False
    criminal_record: bool = False
    has_ties: bool = True  # ties to home country (job, family, property)


class EligibilityResult(BaseModel):
    """Result of eligibility assessment"""
    eligible: bool
    visa_type: str
    confidence: float  # 0-1
    requirements_met: List[str]
    requirements_missing: List[str]
    processing_time: Optional[str] = None
    estimated_cost: Optional[str] = None
    notes: str


async def assess_eligibility(context: EligibilityContext) -> EligibilityResult:
    """
    Assess visa eligibility based on user context and RAG knowledge base.
    """
    vs = load_vectorstore()
    
    # Build query based on context
    query = f"{context.country} {context.travel_purpose} visa eligibility requirements"
    
    # Search knowledge base
    docs = vs.similarity_search(query, k=5)
    
    if not docs or not docs[0].page_content.strip():
        return EligibilityResult(
            eligible=False,
            visa_type="Unknown",
            confidence=0.0,
            requirements_met=[],
            requirements_missing=["Could not find eligibility information"],
            notes="Unable to assess eligibility. Please contact an administrator to add this country's visa information to the knowledge base."
        )
    
    # Extract context for LLM
    context_text = "\n".join([doc.page_content for doc in docs])
    
    # Build eligibility prompt
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

    llm = ChatGroq(
        groq_api_key=Settings().groq_api_key if hasattr(Settings(), 'groq_api_key') else "",
        model_name="llama-3.1-8b-instant",
        temperature=0.3
    )
    
    try:
        response = llm.invoke(prompt)
        response_text = response.content if hasattr(response, 'content') else str(response)
    except Exception as e:
        return EligibilityResult(
            eligible=False,
            visa_type="Unknown",
            confidence=0.0,
            requirements_met=[],
            requirements_missing=["Error during assessment"],
            notes=f"Assessment failed: {str(e)}"
        )
    
    # Parse the LLM response
    return parse_eligibility_response(response_text, context)


def parse_eligibility_response(response: str, context: EligibilityContext) -> EligibilityResult:
    """Parse LLM response into structured EligibilityResult"""
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
            except:
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
    
    # Apply basic eligibility rules
    if context.criminal_record:
        eligible = False
        notes = "Note: A criminal record may affect visa eligibility. Additional scrutiny likely required."
        requirements_missing.append("Criminal background clearance certificate")
    
    if not context.has_passport:
        eligible = False
        requirements_missing.append("Valid passport")
    
    # Add default requirements based on purpose
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
    
    return EligibilityResult(
        eligible=eligible,
        visa_type=visa_type,
        confidence=confidence,
        requirements_met=requirements_met,
        requirements_missing=requirements_missing,
        processing_time=processing_time,
        estimated_cost=estimated_cost,
        notes=notes
    )


async def get_eligibility_status(user_email: str) -> Optional[Dict]:
    """Get stored eligibility assessment for a user"""
    from .database import get_database
    db = get_database()
    
    result = await db.eligibility_assessments.find_one({"user_email": user_email})
    if result:
        result["_id"] = str(result["_id"])
    return result


async def save_eligibility_assessment(user_email: str, context: EligibilityContext, result: EligibilityResult):
    """Save eligibility assessment to database"""
    from .database import get_database
    from datetime import datetime
    
    db = get_database()
    
    assessment_doc = {
        "user_email": user_email,
        "context": context.dict(),
        "result": result.dict(),
        "assessed_at": datetime.utcnow().isoformat()
    }
    
    await db.eligibility_assessments.insert_one(assessment_doc)
    
    return {"saved": True, "assessment_id": str(assessment_doc.get("_id", "unknown"))}