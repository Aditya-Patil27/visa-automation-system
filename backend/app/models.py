"""Pydantic models and MongoDB collection helpers for the visa automation system."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# ── MongoDB Collection Names ─────────────────────────────────────────

COLL_USERS = "users"
COLL_VISAS = "visas"
COLL_ASSESSMENTS = "assessments"
COLL_APPOINTMENTS = "appointments"
COLL_USER_DOCUMENTS = "user_documents"
COLL_DOCUMENT_STATUS = "document_status"
COLL_PROGRESS = "progress"
COLL_WORKFLOW = "workflow"
COLL_QUERIES = "queries"
COLL_QUERY_RESPONSES = "query_responses"
COLL_NOTIFICATIONS = "notifications"
COLL_NOTIFICATION_PREFS = "notification_preferences"
COLL_RESET_TOKENS = "reset_tokens"
COLL_SCRAPER_LOGS = "scraper_logs"
COLL_APPLICATIONS = "applications"


# ── Pydantic Models (API Layer) ──────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "employee"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VisaRequirement(BaseModel):
    country: str
    visa_type: str
    documents: List[str]
    processing_time: Optional[str] = None
    min_age: int = 18
    max_age: Optional[int] = None
    min_balance: float = 0.0
    allowed_purposes: List[str] = ["tourism"]
    eligibility_rules: dict = {}
    description: str = ""
    validity: Optional[str] = None
    max_stay_days: Optional[int] = None
    fee: Optional[float] = None
    alternative_visa_ids: List[str] = []


class VisaDB(VisaRequirement):
    id: Optional[str] = None


class AssessmentStep(BaseModel):
    step: int = Field(ge=1, le=4)
    data: dict


class AppointmentCreate(BaseModel):
    date: str
    time_slot: str
    visa_type_id: Optional[str] = None
    location: Optional[str] = "VFS Global Center"
    notes: Optional[str] = ""


class DocumentReview(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    reviewer_notes: str = ""


class ApplicationCreate(BaseModel):
    visa_id: str
    applicant_name: str
    applicant_email: EmailStr
    applicant_passport: str
    applicant_nationality: str
    purpose: str
    intended_stay_days: int
    travel_date: str
    documents_submitted: List[str] = []
    notes: str = ""


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|submitted|under_review|approved|rejected|cancelled)$")
    notes: str = ""


# ── Helper Functions ─────────────────────────────────────────────────

def doc_to_id(doc: dict) -> dict:
    """Convert MongoDB _id to string id for JSON response."""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


def visa_to_db(visa: VisaRequirement) -> dict:
    """Convert VisaRequirement to MongoDB document dict."""
    return {
        "country": visa.country,
        "visa_type": visa.visa_type,
        "documents": visa.documents,
        "processing_time": visa.processing_time,
        "min_age": visa.min_age,
        "max_age": visa.max_age,
        "min_balance": visa.min_balance,
        "allowed_purposes": visa.allowed_purposes,
        "eligibility_rules": visa.eligibility_rules,
        "description": visa.description,
        "validity": visa.validity,
        "max_stay_days": visa.max_stay_days,
        "fee": visa.fee,
        "alternative_visa_ids": visa.alternative_visa_ids,
    }


def doc_to_visa(doc: dict) -> VisaDB:
    """Convert MongoDB doc to VisaDB."""
    doc = doc_to_id(doc)
    return VisaDB(**doc)
