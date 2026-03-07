from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    role: str = "employee"  # or admin


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


class VisaDB(VisaRequirement):
    id: Optional[str] = Field(None, alias="_id")
