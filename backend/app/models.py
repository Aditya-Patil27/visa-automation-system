import json
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Text, Float, LargeBinary, DateTime
from datetime import datetime
from .database import Base


# --------------- SQLAlchemy ORM tables ---------------

class UserTable(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")


class VisaTable(Base):
    __tablename__ = "visas"
    id = Column(Integer, primary_key=True, autoincrement=True)
    country = Column(String, nullable=False)
    visa_type = Column(String, nullable=False)
    documents = Column(Text, default="[]")        # JSON list
    processing_time = Column(String, nullable=True)

    # NEW: Eligibility criteria columns
    min_age = Column(Integer, default=18)
    max_age = Column(Integer, nullable=True)
    min_balance = Column(Float, default=0.0)
    allowed_purposes = Column(Text, default='["tourism"]')      # JSON list
    eligibility_rules = Column(Text, default="{}")               # JSON dict
    description = Column(Text, default="")
    validity = Column(String, nullable=True)
    max_stay_days = Column(Integer, nullable=True)
    fee = Column(Float, nullable=True)
    alternative_visa_ids = Column(Text, default="[]")            # JSON list

    def set_documents(self, docs: list):
        self.documents = json.dumps(docs)

    def get_documents(self) -> list:
        return json.loads(self.documents) if self.documents else []

    def set_allowed_purposes(self, purposes: list):
        self.allowed_purposes = json.dumps(purposes)

    def get_allowed_purposes(self) -> list:
        return json.loads(self.allowed_purposes) if self.allowed_purposes else []

    def set_eligibility_rules(self, rules: dict):
        self.eligibility_rules = json.dumps(rules)

    def get_eligibility_rules(self) -> dict:
        return json.loads(self.eligibility_rules) if self.eligibility_rules else {}

    def set_alternative_visa_ids(self, ids: list):
        self.alternative_visa_ids = json.dumps(ids)

    def get_alternative_visa_ids(self) -> list:
        return json.loads(self.alternative_visa_ids) if self.alternative_visa_ids else []


class ProgressTable(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    progress_steps = Column(Text, default="[]")    # JSON list
    stats = Column(Text, default="{}")              # JSON dict


class WorkflowTable(Base):
    __tablename__ = "workflow"
    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String)
    type = Column(String)
    priority = Column(String)
    time = Column(String)
    user = Column(String)


class ScraperLogTable(Base):
    __tablename__ = "scraper_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(String)
    action = Column(String)
    entity = Column(String)
    status = Column(String)


class AppointmentTable(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    selected = Column(Text, default="{}")           # JSON dict
    available_slots = Column(Text, default="[]")    # JSON list
    month = Column(String)


class DocumentTable(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    active_processing = Column(Text, default="{}")  # JSON dict
    checklist = Column(Text, default="[]")          # JSON list


class UserDocumentTable(Base):
    """Stores user-uploaded documents with AES-encrypted file data."""
    __tablename__ = "user_documents"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    encrypted_data = Column(LargeBinary, nullable=False)
    ocr_text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class AssessmentTable(Base):
    """Pre-assessment form data and eligibility results."""
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String, nullable=False, index=True)
    status = Column(String, default="draft")              # draft, submitted, completed
    current_step = Column(Integer, default=1)             # 1-4 for form wizard
    form_data = Column(Text, default="{}")                # JSON dict — full form state across all steps
    eligibility_score = Column(Integer, nullable=True)
    is_eligible = Column(Integer, default=0)              # 0=False, 1=True
    result_details = Column(Text, default="{}")           # JSON dict — eligibility breakdown per D-19
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# --------------- Pydantic schemas (API layer) ---------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    role: str = "employee"


class UserInDB(UserCreate):
    hashed_password: str


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
    alternative_visa_ids: List[int] = []


class VisaDB(VisaRequirement):
    id: Optional[int] = None

    class Config:
        from_attributes = True
