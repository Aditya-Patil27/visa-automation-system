from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import List

from .database import get_database
from .models import UserCreate, Token, VisaRequirement, VisaDB
from .security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid authentication credentials")
    return payload


def get_current_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Admin privileges required")
    return user


@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    db = get_database()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed
    del user_dict["password"]
    await db.users.insert_one(user_dict)
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user["email"], "role": user.get("role")})
    return {"access_token": token}


# visa endpoints
@router.get("/visa", response_model=List[VisaDB])
async def list_visas(_: dict = Depends(get_current_user)):
    db = get_database()
    items = []
    cursor = db.visas.find()
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items


@router.post("/visa", response_model=VisaDB)
async def create_visa(visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    res = await db.visas.insert_one(visa.dict())
    visa_doc = visa.dict()
    visa_doc["_id"] = str(res.inserted_id)
    return visa_doc


@router.put("/visa/{id}", response_model=VisaDB)
async def update_visa(id: str, visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    await db.visas.update_one({"_id": id}, {"$set": visa.dict()})
    visa_doc = visa.dict()
    visa_doc["_id"] = id
    return visa_doc


@router.delete("/visa/{id}")
async def delete_visa(id: str, _: dict = Depends(get_current_admin)):
    db = get_database()
    await db.visas.delete_one({"_id": id})
    return {"detail": "deleted"}


# chat endpoint simplified
@router.post("/chat")
async def chat_endpoint(query: dict, user: dict = Depends(get_current_user)):
    from .rag import handle_query

    text = query.get("question")
    if not text:
        raise HTTPException(status_code=400, detail="No question provided")
    answer = await handle_query(text)
    return {"answer": answer}

# dashboard endpoints
@router.get("/dashboard/user")
async def get_user_dashboard(user: dict = Depends(get_current_user)):
    # Returns some static mock structural data combined with dynamic user fields
    return {
        "user_name": str(user.get("sub", "User")).split("@")[0].capitalize(),
        "email": user.get("sub"),
        "active_case": {
            "status": "Documents Verified",
            "message": "Your standard application has successfully passed the document verification stage."
        },
        "next_appointment": {
            "date": "Oct 24",
            "title": "Biometric Enrollment",
            "time": "10:30 AM (GMT +1)",
            "location": "VFS Global, London"
        },
        "recent_activities": [
            {"title": "Documents Verified", "desc": "System updated status automatically", "time": "Today, 2:45 PM", "status": "completed"},
            {"title": "Proof of Funds Uploaded", "desc": "Bank Statement 2023_Oct.pdf", "time": "Yesterday, 9:15 AM", "status": "in_progress"},
            {"title": "Application Form Signed", "desc": "Digital signature captured", "time": "Oct 19, 2023", "status": "pending"}
        ],
        "documents": [
            {"name": "Passport_Scan.pdf", "size": "2.4 MB", "icon": "picture_as_pdf"},
            {"name": "Employment_Letter.docx", "size": "840 KB", "icon": "description"},
            {"name": "Portrait_Photo.jpg", "size": "4.1 MB", "icon": "image"}
        ]
    }

@router.get("/dashboard/admin")
async def get_admin_dashboard(admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_count = await db.users.count_documents({})
    visas_count = await db.visas.count_documents({})
    return {
        "admin_name": str(admin.get("sub", "Admin")).split("@")[0].capitalize(),
        "total_users": users_count,
        "active_applications": visas_count,
        "approval_rate": "87%",
        "processing_time": "14 Days"
    }

@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    db = get_database()
    # returning the seed or default
    prog = await db.progress.find_one({"user_email": "testuser_1234@test.com"})
    if not prog:
        return {"progress_steps": [], "stats": {}}
    return {"progress_steps": prog.get("progress_steps", []), "stats": prog.get("stats", {})}

@router.get("/workflow")
async def get_workflow(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.workflow.find({})
    workflows = await cursor.to_list(length=100)
    for w in workflows:
        w["_id"] = str(w["_id"])
    return workflows

@router.get("/scraper-logs")
async def get_scraper_logs(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db.scraper_logs.find({})
    logs = await cursor.to_list(length=100)
    for l in logs:
        l["_id"] = str(l["_id"])
    return logs

@router.get("/appointments")
async def get_appointments(user: dict = Depends(get_current_user)):
    db = get_database()
    # default to testuser_1234@test.com for demo
    appts = await db.appointments.find_one({"user_email": "testuser_1234@test.com"})
    if not appts:
        return {"selected": {}, "available_slots": [], "month": "October 2023"}
    appts["_id"] = str(appts["_id"])
    return appts

@router.get("/documents")
async def get_documents(user: dict = Depends(get_current_user)):
    db = get_database()
    docs = await db.documents.find_one({"user_email": "testuser_1234@test.com"})
    if not docs:
        return {"active_processing": {}, "checklist": []}
    docs["_id"] = str(docs["_id"])
    return docs

