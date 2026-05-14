import json
import io
import re
import base64
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .database import async_session
from .models import (
    UserCreate, Token, VisaRequirement, VisaDB,
    UserTable, VisaTable, ProgressTable, WorkflowTable,
    ScraperLogTable, AppointmentTable, DocumentTable,
    UserDocumentTable,
)
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


# ---- auth ----

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    async with async_session() as session:
        result = await session.execute(select(UserTable).where(UserTable.email == user.email))
        existing = result.scalars().first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        new_user = UserTable(
            email=user.email,
            hashed_password=get_password_hash(user.password),
            role=user.role,
        )
        session.add(new_user)
        await session.commit()
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    async with async_session() as session:
        result = await session.execute(select(UserTable).where(UserTable.email == form_data.username))
        user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token}


# ---- visa CRUD ----

@router.get("/visa", response_model=List[VisaDB])
async def list_visas(_: dict = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(select(VisaTable))
        rows = result.scalars().all()
    return [
        VisaDB(
            id=r.id,
            country=r.country,
            visa_type=r.visa_type,
            documents=r.get_documents(),
            processing_time=r.processing_time,
        )
        for r in rows
    ]


@router.post("/visa", response_model=VisaDB)
async def create_visa(visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    async with async_session() as session:
        row = VisaTable(
            country=visa.country,
            visa_type=visa.visa_type,
            processing_time=visa.processing_time,
        )
        row.set_documents(visa.documents)
        session.add(row)
        await session.commit()
        await session.refresh(row)
    return VisaDB(
        id=row.id,
        country=row.country,
        visa_type=row.visa_type,
        documents=row.get_documents(),
        processing_time=row.processing_time,
    )


@router.put("/visa/{id}", response_model=VisaDB)
async def update_visa(id: int, visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    async with async_session() as session:
        result = await session.execute(select(VisaTable).where(VisaTable.id == id))
        row = result.scalars().first()
        if not row:
            raise HTTPException(status_code=404, detail="Visa not found")
        row.country = visa.country
        row.visa_type = visa.visa_type
        row.processing_time = visa.processing_time
        row.set_documents(visa.documents)
        await session.commit()
        await session.refresh(row)
    return VisaDB(
        id=row.id,
        country=row.country,
        visa_type=row.visa_type,
        documents=row.get_documents(),
        processing_time=row.processing_time,
    )


@router.delete("/visa/{id}")
async def delete_visa(id: int, _: dict = Depends(get_current_admin)):
    async with async_session() as session:
        result = await session.execute(select(VisaTable).where(VisaTable.id == id))
        row = result.scalars().first()
        if not row:
            raise HTTPException(status_code=404, detail="Visa not found")
        await session.delete(row)
        await session.commit()
    return {"detail": "deleted"}


# ---- chat ----

@router.post("/chat")
async def chat_endpoint(query: dict, user: dict = Depends(get_current_user)):
    from .rag import get_rag_service

    text = query.get("question")
    if not text:
        raise HTTPException(status_code=400, detail="No question provided")
    session_id = user.get("sub", "")
    answer = await get_rag_service().invoke(text, session_id=session_id)
    return {"answer": answer}


@router.post("/chat/stream")
async def chat_stream(query: dict, user: dict = Depends(get_current_user)):
    from .rag import get_rag_service

    question = query.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="No question provided")
    session_id = user.get("sub", "")

    async def event_generator():
        async for chunk in get_rag_service().stream(question, session_id):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---- semantic search ----

@router.post("/search")
async def search_endpoint(query: dict, user: dict = Depends(get_current_user)):
    from .rag import semantic_search

    text = query.get("query")
    k = query.get("k", 5)
    if not text:
        raise HTTPException(status_code=400, detail="No query provided")
    results = semantic_search(text, k=k)
    return {"results": results}


# ---- OCR via Groq Vision ----

async def _run_ocr(file_bytes: bytes, content_type: str) -> str:
    """Extract text from image bytes using Google Cloud Vision REST API."""
    import aiohttp

    _env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    # Load GOOGLE_VISION_API_KEY from .env
    google_key = os.environ.get("GOOGLE_VISION_API_KEY", "")
    if not google_key and os.path.exists(_env_path):
        with open(_env_path) as f:
            for line in f:
                if line.strip().startswith("GOOGLE_VISION_API_KEY"):
                    google_key = line.strip().split("=", 1)[1].strip()
                    break
    if not google_key:
        return "[OCR unavailable – GOOGLE_VISION_API_KEY not set]"

    try:
        b64_image = base64.standard_b64encode(file_bytes).decode("utf-8")
        
        url = f"https://vision.googleapis.com/v1/images:annotate?key={google_key}"
        payload = {
            "requests": [
                {
                    "image": {
                        "content": b64_image
                    },
                    "features": [
                        {
                            "type": "TEXT_DETECTION"
                        }
                    ]
                }
            ]
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                result = await response.json()
                
                if "error" in result:
                    return f"[OCR error: {result['error'].get('message', 'Unknown error')}]"
                
                responses = result.get("responses", [])
                if not responses or not responses[0].get("fullTextAnnotation"):
                    return "[OCR error: No text could be detected in this image.]"
                    
                return responses[0]["fullTextAnnotation"]["text"]

    except Exception as e:
        return f"[OCR error: {str(e)}]"


def _extract_fields(ocr_text: str) -> dict:
    """Try to extract common passport/ID fields from OCR text."""
    fields = {}
    # Simple regex patterns for common fields
    name_match = re.search(r"(?:Name|Surname|Given)[:\s]*([A-Z][A-Z\s]+)", ocr_text, re.I)
    if name_match:
        fields["full_name"] = name_match.group(1).strip()

    passport_match = re.search(r"(?:Passport\s*(?:No|Number)?)[:\s]*([A-Z0-9]{6,12})", ocr_text, re.I)
    if passport_match:
        fields["passport_number"] = passport_match.group(1)

    date_match = re.findall(r"\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b", ocr_text)
    if date_match:
        fields["dates_found"] = date_match

    nationality_match = re.search(r"(?:Nationality|Citizenship)[:\s]*([A-Za-z\s]+)", ocr_text, re.I)
    if nationality_match:
        fields["nationality"] = nationality_match.group(1).strip()

    return fields


@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    file_bytes = await file.read()
    ocr_text = await _run_ocr(file_bytes, file.content_type or "image/jpeg")
    fields = _extract_fields(ocr_text)
    return {
        "filename": file.filename,
        "ocr_text": ocr_text,
        "extracted_fields": fields,
    }


# ---- encrypted document storage ----

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    from .encryption import encrypt_data

    file_bytes = await file.read()
    # Run OCR
    ocr_text = await _run_ocr(file_bytes, file.content_type or "image/jpeg")
    # Encrypt
    encrypted = encrypt_data(file_bytes)

    async with async_session() as session:
        doc = UserDocumentTable(
            user_email=user.get("sub", ""),
            filename=file.filename or "untitled",
            content_type=file.content_type or "application/octet-stream",
            encrypted_data=encrypted,
            ocr_text=ocr_text,
            created_at=datetime.utcnow(),
        )
        session.add(doc)
        await session.commit()
        await session.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "content_type": doc.content_type,
        "ocr_text": ocr_text,
        "extracted_fields": _extract_fields(ocr_text),
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "encrypted": True,
    }


@router.get("/documents/download/{doc_id}")
async def download_document(doc_id: int, user: dict = Depends(get_current_user)):
    from .encryption import decrypt_data

    async with async_session() as session:
        result = await session.execute(
            select(UserDocumentTable).where(
                UserDocumentTable.id == doc_id,
                UserDocumentTable.user_email == user.get("sub", ""),
            )
        )
        doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    decrypted = decrypt_data(doc.encrypted_data)
    return StreamingResponse(
        io.BytesIO(decrypted),
        media_type=doc.content_type,
        headers={"Content-Disposition": f'attachment; filename="{doc.filename}"'},
    )


@router.get("/documents/list")
async def list_user_documents(user: dict = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(UserDocumentTable).where(
                UserDocumentTable.user_email == user.get("sub", "")
            ).order_by(UserDocumentTable.created_at.desc())
        )
        docs = result.scalars().all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "content_type": d.content_type,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "encrypted": True,
        }
        for d in docs
    ]


# ---- dashboards ----

@router.get("/dashboard/user")
async def get_user_dashboard(user: dict = Depends(get_current_user)):
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
    async with async_session() as session:
        users_count = (await session.execute(select(func.count(UserTable.id)))).scalar() or 0
        visas_count = (await session.execute(select(func.count(VisaTable.id)))).scalar() or 0
    return {
        "admin_name": str(admin.get("sub", "Admin")).split("@")[0].capitalize(),
        "total_users": users_count,
        "active_applications": visas_count,
        "approval_rate": "87%",
        "processing_time": "14 Days"
    }


@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(ProgressTable).where(ProgressTable.user_email == user.get("sub", ""))
        )
        prog = result.scalars().first()
    # fallback to test user data
    if not prog:
        async with async_session() as session:
            result = await session.execute(
                select(ProgressTable).where(ProgressTable.user_email == "testuser_1234@test.com")
            )
            prog = result.scalars().first()
    if not prog:
        return {"progress_steps": [], "stats": {}}
    return {
        "progress_steps": json.loads(prog.progress_steps) if prog.progress_steps else [],
        "stats": json.loads(prog.stats) if prog.stats else {},
    }


@router.get("/workflow")
async def get_workflow(admin: dict = Depends(get_current_admin)):
    async with async_session() as session:
        result = await session.execute(select(WorkflowTable))
        rows = result.scalars().all()
    return [
        {"_id": str(w.id), "id": w.task_id, "type": w.type, "priority": w.priority, "time": w.time, "user": w.user}
        for w in rows
    ]


@router.get("/scraper-logs")
async def get_scraper_logs(admin: dict = Depends(get_current_admin)):
    async with async_session() as session:
        result = await session.execute(select(ScraperLogTable))
        rows = result.scalars().all()
    return [
        {"_id": str(l.id), "timestamp": l.timestamp, "action": l.action, "entity": l.entity, "status": l.status}
        for l in rows
    ]


@router.get("/appointments")
async def get_appointments(user: dict = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(AppointmentTable).where(AppointmentTable.user_email == user.get("sub", ""))
        )
        appt = result.scalars().first()
    # fallback to test user
    if not appt:
        async with async_session() as session:
            result = await session.execute(
                select(AppointmentTable).where(AppointmentTable.user_email == "testuser_1234@test.com")
            )
            appt = result.scalars().first()
    if not appt:
        return {"selected": {}, "available_slots": [], "month": "October 2023"}
    return {
        "_id": str(appt.id),
        "selected": json.loads(appt.selected) if appt.selected else {},
        "available_slots": json.loads(appt.available_slots) if appt.available_slots else [],
        "month": appt.month,
    }


@router.get("/documents")
async def get_documents(user: dict = Depends(get_current_user)):
    async with async_session() as session:
        result = await session.execute(
            select(DocumentTable).where(DocumentTable.user_email == user.get("sub", ""))
        )
        doc = result.scalars().first()
    # fallback to test user
    if not doc:
        async with async_session() as session:
            result = await session.execute(
                select(DocumentTable).where(DocumentTable.user_email == "testuser_1234@test.com")
            )
            doc = result.scalars().first()
    if not doc:
        return {"active_processing": {}, "checklist": []}
    return {
        "_id": str(doc.id),
        "active_processing": json.loads(doc.active_processing) if doc.active_processing else {},
        "checklist": json.loads(doc.checklist) if doc.checklist else [],
    }


# ---- tracking simulation ----

@router.post("/tracking/simulate")
async def simulate_tracking(user: dict = Depends(get_current_user)):
    """Returns a step-by-step simulation of visa application tracking."""
    return {
        "application_id": "VF-9928341",
        "country": "United Kingdom",
        "visa_type": "Tier 4 Student Visa",
        "simulation_steps": [
            {
                "step": 1,
                "title": "Application Received",
                "description": "Your visa application has been received at the VFS Global center.",
                "location": "VFS Global, Mumbai",
                "coordinates": {"lat": 19.076, "lng": 72.8777},
                "timestamp": "2023-10-12T09:00:00Z",
                "status": "completed",
                "duration_seconds": 3,
            },
            {
                "step": 2,
                "title": "Documents Forwarded",
                "description": "Application documents have been forwarded to the destination Embassy.",
                "location": "Destination Embassy, Local Branch",
                "coordinates": {"lat": 28.6139, "lng": 77.209},
                "timestamp": "2023-10-14T14:30:00Z",
                "status": "completed",
                "duration_seconds": 4,
            },
            {
                "step": 3,
                "title": "Under Review",
                "description": "Your application is currently under review by a visa officer.",
                "location": "Visa Processing Center",
                "coordinates": {"lat": 53.3811, "lng": -1.4701},
                "timestamp": "2023-10-18T10:00:00Z",
                "status": "in_progress",
                "duration_seconds": 5,
            },
            {
                "step": 4,
                "title": "Additional Verification",
                "description": "Background verification and document authenticity checks in progress.",
                "location": "UKVI Verification Hub, London",
                "coordinates": {"lat": 51.5074, "lng": -0.1278},
                "timestamp": "2023-10-22T11:00:00Z",
                "status": "pending",
                "duration_seconds": 4,
            },
            {
                "step": 5,
                "title": "Decision Made",
                "description": "A decision has been made on your visa application.",
                "location": "Visa Office",
                "coordinates": {"lat": 53.3811, "lng": -1.4701},
                "timestamp": "2023-10-28T16:00:00Z",
                "status": "pending",
                "duration_seconds": 3,
            },
            {
                "step": 6,
                "title": "Passport Dispatched",
                "description": "Your passport with visa is being dispatched to the collection center.",
                "location": "VFS Global, Mumbai",
                "coordinates": {"lat": 19.076, "lng": 72.8777},
                "timestamp": "2023-10-30T09:00:00Z",
                "status": "pending",
                "duration_seconds": 3,
            },
            {
                "step": 7,
                "title": "Ready for Collection",
                "description": "Your passport is ready for collection. Please bring your receipt.",
                "location": "VFS Global, Mumbai",
                "coordinates": {"lat": 19.076, "lng": 72.8777},
                "timestamp": "2023-11-01T10:00:00Z",
                "status": "pending",
                "duration_seconds": 2,
            },
        ],
    }
