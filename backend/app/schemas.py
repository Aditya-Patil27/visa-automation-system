"""Pydantic schemas for API request/response models."""
from pydantic import BaseModel, Field
from typing import List, Optional


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


class AssessmentStep(BaseModel):
    step: int = Field(ge=1, le=4)
    data: dict


class AssessmentResponse(BaseModel):
    id: str
    status: str
    current_step: int
    form_data: dict
    eligibility_score: Optional[int] = None
    is_eligible: Optional[bool] = None
    result: Optional[dict] = None


class EligibilityResult(BaseModel):
    eligible: bool
    score: int = Field(ge=0, le=100)
    matched_requirements: List[str]
    missing_requirements: List[str]
    actionable_feedback: List[str]
    alternative_visas: List[dict] = []


class AssessmentListResponse(BaseModel):
    id: str
    status: str
    current_step: int
    updated_at: Optional[str] = None


class SlotTime(BaseModel):
    time: str
    display: str
    available: bool = True


class DaySlots(BaseModel):
    date: str
    day_name: str
    slots: list


class AppointmentCreate(BaseModel):
    date: str
    time_slot: str
    visa_type_id: Optional[str] = None
    location: Optional[str] = "VFS Global Center"
    notes: Optional[str] = ""


class AppointmentResponse(BaseModel):
    id: str
    user_email: str
    date: str
    time_slot: str
    status: str
    location: str
    notes: Optional[str] = None
    created_at: Optional[str] = None


class DocumentTypeInfo(BaseModel):
    name: str
    label: str
    description: str = ""
    required: bool = True


class DocumentTypesResponse(BaseModel):
    visa_type_id: Optional[str] = None
    visa_label: str
    document_types: List[DocumentTypeInfo]


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    document_type: str
    status: str
    is_encrypted: bool
    ocr_text: str = ""
    extracted_fields: dict = {}
    created_at: Optional[str] = None


class UserDocumentItem(BaseModel):
    id: str
    filename: str
    content_type: str
    document_type: str
    status: str
    is_encrypted: bool
    created_at: Optional[str] = None


class DocStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending_review|approved|rejected)$")
    reviewer_notes: Optional[str] = ""


class DocumentReview(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    reviewer_notes: str = ""


class DocumentReviewResponse(BaseModel):
    id: str
    filename: str
    user_email: str
    document_type: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewer_notes: Optional[str] = None
