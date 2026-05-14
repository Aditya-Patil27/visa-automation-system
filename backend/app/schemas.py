from pydantic import BaseModel, Field
from typing import List, Optional


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    question: str
    session_id: Optional[str] = None


class AssessmentStep(BaseModel):
    """Request body for saving a single step of the pre-assessment form.
    step is 1-indexed (1=Personal, 2=Travel, 3=Documents, 4=Review).
    data contains the form fields for that step."""
    step: int = Field(ge=1, le=4)
    data: dict


class AssessmentResponse(BaseModel):
    """Response returned when fetching an assessment."""
    id: int
    status: str
    current_step: int
    form_data: dict
    eligibility_score: Optional[int] = None
    is_eligible: Optional[bool] = None
    result: Optional[dict] = None

    class Config:
        from_attributes = True


class EligibilityResult(BaseModel):
    """Structured eligibility assessment result returned after submit."""
    eligible: bool
    score: int = Field(ge=0, le=100)
    matched_requirements: List[str]
    missing_requirements: List[str]
    actionable_feedback: List[str]
    alternative_visas: List[dict] = []


class AssessmentListResponse(BaseModel):
    """List of user's assessments (summary only)."""
    id: int
    status: str
    current_step: int
    updated_at: Optional[str] = None
