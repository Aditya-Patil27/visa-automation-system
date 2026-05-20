"""API routes — all MongoDB-backed."""
import json, io, re, base64, os, time, asyncio, logging, random
from collections import defaultdict
from datetime import datetime
from bson.objectid import ObjectId
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request, Form
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
except ImportError:
    class Limiter:
        def __init__(self, *args, **kwargs): pass
    def get_remote_address(request): return "unknown"

from .route_modules import router as auth_sub_router
from .database import get_database, doc_to_id
from .models import (
    UserCreate, Token, VisaRequirement, VisaDB,
    COLL_USERS, COLL_VISAS, COLL_ASSESSMENTS, COLL_APPOINTMENTS,
    COLL_USER_DOCUMENTS, COLL_DOCUMENT_STATUS, COLL_PROGRESS,
    COLL_WORKFLOW, COLL_QUERIES, COLL_QUERY_RESPONSES,
    COLL_NOTIFICATIONS, COLL_NOTIFICATION_PREFS, COLL_RESET_TOKENS,
    COLL_SCRAPER_LOGS, COLL_APPLICATIONS,
    visa_to_db, doc_to_visa, ApplicationCreate, ApplicationStatusUpdate,
)
from .schemas import (
    AssessmentStep, AppointmentCreate, DocumentReview,
)
from .security import verify_password, get_password_hash, create_access_token, decode_access_token
from .cache import get_cache, cache_rag_result, get_cached_rag_result, cache_visa_requirements, get_cached_visa_requirements, cache_user_session, get_cached_user_session, get_cache_stats
from .document_config import DOC_TYPE_MAP, DOC_TYPE_DESC

logger = logging.getLogger(__name__)
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# ── Auth dependencies ────────────────────────────────────────────────

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        token = request.cookies.get("access_token")
        if token:
            payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return payload

def get_current_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user

router.include_router(auth_sub_router)

# ── Helpers ──────────────────────────────────────────────────────────

def obid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid ID: {id_str}")

# ── Visa CRUD ────────────────────────────────────────────────────────

@router.get("/visa", response_model=List[VisaDB])
async def list_visas(limit: int = 50, offset: int = 0, _: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_VISAS].find().skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [doc_to_visa(d) for d in docs]

@router.post("/visa", response_model=VisaDB)
async def create_visa(visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    result = await db[COLL_VISAS].insert_one(visa_to_db(visa))
    doc = await db[COLL_VISAS].find_one({"_id": result.inserted_id})
    return doc_to_visa(doc)

@router.put("/visa/{id}", response_model=VisaDB)
async def update_visa(id: str, visa: VisaRequirement, _: dict = Depends(get_current_admin)):
    db = get_database()
    result = await db[COLL_VISAS].update_one({"_id": obid(id)}, {"$set": visa_to_db(visa)})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Visa not found")
    doc = await db[COLL_VISAS].find_one({"_id": obid(id)})
    return doc_to_visa(doc)

@router.delete("/visa/{id}")
async def delete_visa(id: str, _: dict = Depends(get_current_admin)):
    db = get_database()
    result = await db[COLL_VISAS].delete_one({"_id": obid(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Visa not found")
    return {"detail": "deleted"}

# ── Chat ─────────────────────────────────────────────────────────────

_chat_rate_limit = 10
_chat_store: dict = defaultdict(list)

def _check_chat_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    _chat_store[ip] = [t for t in _chat_store[ip] if t > now - 60]
    if len(_chat_store[ip]) >= _chat_rate_limit:
        raise HTTPException(status_code=429, detail="Chat rate limit exceeded")
    _chat_store[ip].append(now)

@router.post("/chat")
async def chat_endpoint(request: Request, query: dict, user: dict = Depends(get_current_user)):
    _check_chat_rate_limit(request)
    from .rag import get_rag_service
    text = query.get("question")
    if not text:
        raise HTTPException(status_code=400, detail="No question provided")
    session_id = query.get("session_id", "")
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
    user_email = user.get("sub", "")
    try:
        answer = await asyncio.wait_for(get_rag_service().invoke(text, session_id=session_id, user_email=user_email), timeout=30.0)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Chat service timed out")
    return {"answer": answer, "session_id": session_id}

@router.post("/chat/stream")
async def chat_stream(request: Request, query: dict, user: dict = Depends(get_current_user)):
    _check_chat_rate_limit(request)
    from .rag import get_rag_service
    question = query.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="No question provided")
    session_id = query.get("session_id", "")
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
    user_email = user.get("sub", "")
    async def event_generator():
        try:
            async for chunk in get_rag_service().stream(question, session_id, user_email):
                yield chunk
        except asyncio.TimeoutError:
            yield f"data: {json.dumps({'error': 'Chat service timed out'})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error("Chat stream error: %s", e)
            yield f"data: {json.dumps({'error': 'Chat service error'})}\n\n"
            yield "data: [DONE]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"})

@router.get("/chat/sessions")
async def list_chat_sessions(user: dict = Depends(get_current_user)):
    """List all chat sessions for the current user."""
    import pymongo
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/visa_db")
    db_name = os.getenv("DATABASE_NAME", "visa_db")
    client = pymongo.MongoClient(mongo_url)
    db = client[db_name]
    col = db["chat_history"]
    
    # Group messages by session_id, get first/last message and timestamps
    pipeline = [
        {"$match": {"user_email": user.get("sub", "")}},
        {"$sort": {"created_at": 1}},
        {"$group": {
            "_id": "$session_id",
            "first_message": {"$first": "$content"},
            "last_message": {"$last": "$content"},
            "created_at": {"$first": "$created_at"},
            "updated_at": {"$last": "$created_at"},
            "message_count": {"$sum": 1}
        }},
        {"$sort": {"updated_at": -1}}
    ]
    
    sessions = list(col.aggregate(pipeline))
    result = []
    for s in sessions:
        title = s["first_message"][:60] + "..." if len(s["first_message"]) > 60 else s["first_message"]
        result.append({
            "session_id": s["_id"],
            "title": title,
            "created_at": s["created_at"].isoformat() if hasattr(s["created_at"], "isoformat") else str(s["created_at"]),
            "updated_at": s["updated_at"].isoformat() if hasattr(s["updated_at"], "isoformat") else str(s["updated_at"]),
            "message_count": s["message_count"]
        })
    
    client.close()
    return {"sessions": result}

@router.get("/chat/sessions/{session_id}")
async def get_chat_session(session_id: str, user: dict = Depends(get_current_user)):
    """Get all messages for a specific chat session."""
    import pymongo
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/visa_db")
    db_name = os.getenv("DATABASE_NAME", "visa_db")
    client = pymongo.MongoClient(mongo_url)
    db = client[db_name]
    col = db["chat_history"]
    
    messages = list(col.find(
        {"session_id": session_id, "user_email": user.get("sub", "")}
    ).sort("created_at", 1))
    
    result = []
    for m in messages:
        result.append({
            "role": "user" if m["type"] == "human" else "assistant",
            "content": m["content"],
            "created_at": m["created_at"].isoformat() if hasattr(m["created_at"], "isoformat") else str(m["created_at"])
        })
    
    client.close()
    return {"messages": result}

# ── Assessment CRUD ──────────────────────────────────────────────────

@router.post("/assessment")
async def create_assessment(user: dict = Depends(get_current_user)):
    db = get_database()
    doc = {"user_email": user.get("sub", ""), "status": "draft", "current_step": 1,
           "form_data": json.dumps({}), "eligibility_score": None, "is_eligible": 0,
           "result_details": "{}", "created_at": datetime.utcnow().isoformat()}
    result = await db[COLL_ASSESSMENTS].insert_one(doc)
    return {"id": str(result.inserted_id), "status": "draft", "current_step": 1}

@router.put("/assessment/{id}")
async def update_assessment(id: str, step_data: AssessmentStep, user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db[COLL_ASSESSMENTS].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")
    existing = json.loads(doc.get("form_data", "{}"))
    existing[str(step_data.step)] = step_data.data
    await db[COLL_ASSESSMENTS].update_one({"_id": obid(id)},
        {"$set": {"form_data": json.dumps(existing), "current_step": step_data.step}})
    updated = await db[COLL_ASSESSMENTS].find_one({"_id": obid(id)})
    return {"id": str(updated["_id"]), "status": updated["status"],
            "current_step": updated["current_step"],
            "form_data": json.loads(updated.get("form_data", "{}"))}

@router.get("/assessment/{id}")
async def get_assessment(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db[COLL_ASSESSMENTS].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return {"id": str(doc["_id"]), "status": doc["status"], "current_step": doc["current_step"],
            "form_data": json.loads(doc.get("form_data", "{}")),
            "eligibility_score": doc.get("eligibility_score"),
            "is_eligible": bool(doc["is_eligible"]) if doc.get("is_eligible") is not None else None,
            "result": json.loads(doc["result_details"]) if doc.get("result_details") and doc["result_details"] != "{}" else None,
            "created_at": doc.get("created_at"), "updated_at": doc.get("updated_at")}

@router.post("/assessment/{id}/submit")
async def submit_assessment(id: str, user: dict = Depends(get_current_user)):
    from .eligibility import assess_eligibility
    REQUIRED_STEPS = {1, 2, 3}
    db = get_database()
    doc = await db[COLL_ASSESSMENTS].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if doc.get("status") in ("submitted", "completed"):
        return {"id": str(doc["_id"]), "status": doc["status"],
                "eligibility_score": doc.get("eligibility_score"),
                "is_eligible": bool(doc["is_eligible"]) if doc.get("is_eligible") is not None else None,
                "result": json.loads(doc.get("result_details", "{}"))}
    form_data = json.loads(doc.get("form_data", "{}"))
    completed_steps = {int(k) for k in form_data.keys() if k.isdigit()}
    missing_steps = REQUIRED_STEPS - completed_steps
    if missing_steps:
        raise HTTPException(status_code=400, detail=f"Cannot submit: steps {missing_steps} are incomplete")
    all_steps_data = {}
    for step_key, step_val in form_data.items():
        if isinstance(step_val, dict):
            all_steps_data.update(step_val)
    destination = all_steps_data.get("destination_country", "")
    purpose = all_steps_data.get("purpose", "")
    visa_doc = await db[COLL_VISAS].find_one({"country": {"$regex": f"^{destination}$", "$options": "i"}})
    if not visa_doc:
        return {"id": str(doc["_id"]), "status": "submitted", "eligibility_score": 0,
                "is_eligible": False, "result": {"overall_eligible": False, "score": 0,
                    "matched_requirements": [], "missing_requirements": ["No visa record found"],
                    "actionable_feedback": ["No visa data for this destination."]}}
    assessment_data = {"age": int(all_steps_data.get("age", 25) or 25),
        "bank_balance": float(all_steps_data.get("bank_balance", 0) or 0),
        "purpose": purpose, "passport_number": all_steps_data.get("passport_number", ""),
        "destination_country": destination, "nationality": all_steps_data.get("nationality", ""),
        "intended_stay_days": int(all_steps_data.get("intended_stay_days", 0) or 0)}
    try:
        eligibility_result = await asyncio.wait_for(assess_eligibility(assessment_data, visa_doc), timeout=30.0)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Eligibility assessment timed out")
    except Exception as e:
        logger.error("Eligibility assessment failed: %s", e)
        raise HTTPException(status_code=502, detail="Eligibility engine unavailable")
    await db[COLL_ASSESSMENTS].update_one({"_id": obid(id)},
        {"$set": {"status": "submitted", "eligibility_score": eligibility_result.get("score", 0),
                  "is_eligible": 1 if eligibility_result.get("overall_eligible") else 0,
                  "result_details": json.dumps(eligibility_result)}})
    return {"id": str(doc["_id"]), "status": "submitted",
            "eligibility_score": eligibility_result.get("score", 0),
            "is_eligible": eligibility_result.get("overall_eligible", False),
            "result": eligibility_result}

# ── Semantic Search ──────────────────────────────────────────────────

@router.post("/search")
async def search_endpoint(query: dict, user: dict = Depends(get_current_user)):
    from .rag import semantic_search
    text = query.get("query")
    k = query.get("k", 5)
    if not text:
        raise HTTPException(status_code=400, detail="No query provided")
    return {"results": semantic_search(text, k=k)}

# ── OCR ──────────────────────────────────────────────────────────────

async def _run_ocr(file_bytes: bytes, content_type: str) -> str:
    google_key = os.environ.get("GOOGLE_VISION_API_KEY", "")
    logger.info("OCR request: content_type=%s, google_key_set=%s", content_type, bool(google_key))

    # For images, try Google Vision API first (optional, requires billing)
    if google_key and content_type.startswith("image/"):
        import aiohttp
        try:
            b64_image = base64.standard_b64encode(file_bytes).decode("utf-8")
            url = f"https://vision.googleapis.com/v1/images:annotate?key={google_key}"
            payload = {"requests": [{"image": {"content": b64_image}, "features": [{"type": "TEXT_DETECTION"}]}]}
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    result = await response.json()
                    logger.info("Google Vision response: %s", json.dumps(result)[:500])
                    if "error" in result:
                        logger.warning("Google Vision error (falling back to local OCR): %s", result["error"])
                        # Don't raise - fall through to local OCR
                    else:
                        responses = result.get("responses", [])
                        if responses and responses[0].get("fullTextAnnotation"):
                            return responses[0]["fullTextAnnotation"]["text"]
        except Exception as e:
            logger.warning("Google Vision OCR failed (falling back to local OCR): %s", e)

    # For PDFs, use pdfplumber
    if content_type == "application/pdf":
        try:
            import pdfplumber
            import io
            extracted = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted.append(page_text)
            if extracted:
                return "\n\n".join(extracted)
            return "[No text detected in PDF - the file may be a scanned image]"
        except ImportError:
            return "[PDF text extraction requires pdfplumber: pip install pdfplumber]"
        except Exception as e:
            logger.error("PDF extraction failed: %s", e)
            return f"[PDF processing error: {str(e)}]"

    # Fallback for images: local pytesseract (free, no API key needed)
    if content_type.startswith("image/"):
        try:
            from PIL import Image
            import pytesseract
            import io
            # Set Tesseract path for Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
            if text.strip():
                return text.strip()
            return "[No text detected in image - try a clearer image or adjust contrast]"
        except ImportError:
            return "[OCR engine not installed. Run: pip install pytesseract Pillow, and install tesseract-ocr on your system.]"
        except Exception as e:
            logger.error("Local OCR failed: %s", e)
            return f"[OCR processing error: {str(e)}]"

    return f"[Unsupported file type: {content_type}. Please upload JPG, PNG, or PDF files.]"

def _extract_fields(ocr_text: str) -> dict:
    fields = {}
    m = re.search(r"(?:Name|Surname|Given)[:\s]*([A-Za-z\s]+)", ocr_text, re.I)
    if m: fields["full_name"] = m.group(1).strip()
    m = re.search(r"(?:Passport\s*(?:No|Number)?)[:\s]*([A-Z0-9]{6,12})", ocr_text, re.I)
    if m: fields["passport_number"] = m.group(1)
    dates = re.findall(r"\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b", ocr_text)
    if dates: fields["dates_found"] = dates
    m = re.search(r"(?:Nationality|Citizenship)[:\s]*([A-Za-z\s]+)", ocr_text, re.I)
    if m: fields["nationality"] = m.group(1).strip()
    return fields

@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    file_bytes = await file.read()
    ocr_text = await _run_ocr(file_bytes, file.content_type or "image/jpeg")
    return {"filename": file.filename, "ocr_text": ocr_text, "extracted_fields": _extract_fields(ocr_text)}

# ── Document Management ──────────────────────────────────────────────

MAX_FILE_SIZE = 20 * 1024 * 1024

@router.get("/documents/types")
async def get_document_types(visa_type_id: str = None, user: dict = Depends(get_current_user)):
    db = get_database()
    if visa_type_id:
        doc = await db[COLL_VISAS].find_one({"_id": obid(visa_type_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Visa type not found")
        doc_names = doc.get("documents", [])
        visa_label = f"{doc['country']} {doc['visa_type']}"
    else:
        cursor = db[COLL_VISAS].find({}, {"documents": 1}).limit(200)
        rows = await cursor.to_list(length=200)
        seen = set()
        doc_names = []
        for r in rows:
            for d in r.get("documents", []):
                if d not in seen:
                    seen.add(d)
                    doc_names.append(d)
        visa_label = "All Visas"
    types = []
    for name in doc_names:
        key = name.lower().replace(" ", "_").replace("/", "_")
        types.append({"name": key, "label": DOC_TYPE_MAP.get(key, name), "description": DOC_TYPE_DESC.get(key, ""), "required": True})
    return {"visa_type_id": visa_type_id, "visa_label": visa_label, "document_types": types}

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), document_type: str = Form("other"), user: dict = Depends(get_current_user)):
    from .encryption import encrypt_data
    from .verification import verify_document
    email = user.get("sub", "")
    db = get_database()

    logger.info(f"Upload request: document_type={document_type}, user={email}, filename={file.filename}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE // (1024*1024)}MB")
    ALLOWED_MAGIC = {b'\x89PNG': 'image/png', b'\xff\xd8\xff': 'image/jpeg', b'%PDF': 'application/pdf'}
    detected = None
    for magic, mime in ALLOWED_MAGIC.items():
        if file_bytes[:len(magic)] == magic:
            detected = mime
            break
    if not detected:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and PDF files are supported")
    ocr_text = await _run_ocr(file_bytes, detected)
    extracted = _extract_fields(ocr_text)
    
    # Run verification
    verification = verify_document(file_bytes, detected, ocr_text, extracted)
    
    encrypted = encrypt_data(file_bytes)
    doc = {"user_email": email, "filename": file.filename or "untitled",
           "content_type": file.content_type or "application/octet-stream",
           "document_type": document_type, "status": "pending_review", "is_encrypted": 1,
           "encrypted_data": encrypted, "ocr_text": ocr_text, 
           "extracted_fields": extracted, "verification": verification,
           "created_at": datetime.utcnow().isoformat()}
    result = await db[COLL_USER_DOCUMENTS].insert_one(doc)
    await db[COLL_DOCUMENT_STATUS].update_one(
        {"user_email": email, "document_type": document_type},
        {"$set": {"filename": file.filename or "untitled", "status": "pending_review"}},
        upsert=True)
    return {"id": str(result.inserted_id), "filename": doc["filename"], "content_type": doc["content_type"],
            "document_type": document_type, "status": "pending_review", "is_encrypted": True,
            "ocr_text": ocr_text, "extracted_fields": extracted,
            "verification": verification, "created_at": doc["created_at"]}

@router.get("/documents/mydocs")
async def get_my_documents(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_USER_DOCUMENTS].find({"user_email": user.get("sub", "")}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    status_cursor = db[COLL_DOCUMENT_STATUS].find({"user_email": user.get("sub", "")})
    status_list = await status_cursor.to_list(length=100)
    status_map = {s["document_type"]: {"status": s.get("status"), "reviewed_by": s.get("reviewed_by"), "reviewer_notes": s.get("reviewer_notes")} for s in status_list}
    return {"documents": [doc_to_id(d) for d in docs], "status_summary": status_map}

@router.get("/documents/download/{doc_id}")
async def download_document(doc_id: str, user: dict = Depends(get_current_user)):
    from .encryption import decrypt_data
    db = get_database()
    doc = await db[COLL_USER_DOCUMENTS].find_one({"_id": obid(doc_id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    decrypted = decrypt_data(doc["encrypted_data"])
    return StreamingResponse(io.BytesIO(decrypted), media_type=doc["content_type"],
        headers={"Content-Disposition": f'attachment; filename="{doc["filename"]}"'})

@router.get("/documents/list")
async def list_user_documents(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_USER_DOCUMENTS].find({"user_email": user.get("sub", "")}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [doc_to_id(d) for d in docs]

@router.delete("/documents/{id}")
async def delete_document(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db[COLL_USER_DOCUMENTS].delete_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"detail": "Document permanently deleted", "id": id}

# ── Admin Document Review ────────────────────────────────────────────

@router.get("/admin/documents/pending")
async def get_pending_documents(status: str = None, limit: int = 100, offset: int = 0, admin: dict = Depends(get_current_admin)):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    cursor = db[COLL_USER_DOCUMENTS].find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    result = []
    for d in docs:
        doc_data = doc_to_id(d)
        # Add verification summary
        if "verification" in doc_data:
            doc_data["verification_summary"] = {
                "confidence": doc_data["verification"].get("overall_confidence", 0),
                "is_likely_genuine": doc_data["verification"].get("is_likely_genuine", False),
                "warnings_count": len(doc_data["verification"].get("warnings", [])),
            }
        result.append(doc_data)
    return result

@router.post("/admin/documents/{id}/review")
async def review_document(id: str, review: DocumentReview, admin: dict = Depends(get_current_admin)):
    db = get_database()
    doc = await db[COLL_USER_DOCUMENTS].find_one({"_id": obid(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if review.status == "rejected" and not review.reviewer_notes.strip():
        raise HTTPException(status_code=400, detail="Notes required when rejecting")
    await db[COLL_USER_DOCUMENTS].update_one({"_id": obid(id)},
        {"$set": {"status": review.status, "reviewed_by": admin.get("sub", ""),
                  "reviewed_at": datetime.utcnow().isoformat(), "reviewer_notes": review.reviewer_notes}})
    notif = {"user_email": doc["user_email"], "type": "document",
             "title": f"Document {review.status}",
             "message": f"Your document '{doc['filename']}' has been {review.status}." +
                        (f"\n{review.reviewer_notes}" if review.reviewer_notes else ""),
             "created_at": datetime.utcnow().isoformat()}
    await db[COLL_NOTIFICATIONS].insert_one(notif)
    return {"detail": f"Document {review.status}", "id": id}

@router.get("/admin/documents/stats")
async def get_document_stats(admin: dict = Depends(get_current_admin)):
    db = get_database()
    total = await db[COLL_USER_DOCUMENTS].count_documents({})
    pending = await db[COLL_USER_DOCUMENTS].count_documents({"status": "uploaded"})
    approved = await db[COLL_USER_DOCUMENTS].count_documents({"status": "approved"})
    rejected = await db[COLL_USER_DOCUMENTS].count_documents({"status": "rejected"})
    return {"total": total, "pending": pending, "approved": approved, "rejected": rejected}

# ── Dashboard ────────────────────────────────────────────────────────

@router.get("/dashboard/user")
async def get_user_dashboard(user: dict = Depends(get_current_user)):
    email = user.get("sub", "")
    db = get_database()
    user_doc = await db[COLL_USERS].find_one({"email": email})
    user_name = str(email).split("@")[0].capitalize() if email else "User"
    return {"user_name": user_name, "email": email,
        "active_case": {"status": "In Progress", "message": "Your application is being processed."},
        "next_appointment": None,
        "recent_activities": [],
        "documents": []}

@router.get("/user/status")
async def get_user_status(user: dict = Depends(get_current_user)):
    return {"role": user.get("role")}

@router.get("/dashboard/admin")
async def get_admin_dashboard(admin: dict = Depends(get_current_admin)):
    db = get_database()
    users_count = await db[COLL_USERS].count_documents({})
    visas_count = await db[COLL_VISAS].count_documents({})
    return {"admin_name": str(admin.get("sub", "Admin")).split("@")[0].capitalize(),
            "total_users": users_count, "active_applications": visas_count,
            "approval_rate": "87%", "processing_time": "14 Days"}

@router.get("/progress")
async def get_progress(user: dict = Depends(get_current_user)):
    db = get_database()
    prog = await db[COLL_PROGRESS].find_one({"user_email": user.get("sub", "")})
    if not prog:
        return {"progress_steps": [], "stats": {}}
    return {"progress_steps": json.loads(prog.get("progress_steps", "[]")),
            "stats": json.loads(prog.get("stats", "{}"))}

@router.get("/workflow")
async def get_workflow(admin: dict = Depends(get_current_admin)):
    db = get_database()
    cursor = db[COLL_WORKFLOW].find()
    rows = await cursor.to_list(length=200)
    return [{"_id": str(w["_id"]), "id": w.get("task_id"), "type": w.get("type"), "priority": w.get("priority"), "time": w.get("time"), "user": w.get("user")} for w in rows]

# ── Scraper ──────────────────────────────────────────────────────────

@router.get("/scraper-logs")
async def get_scraper_logs(target: str = None, level: str = None, since: str = None,
                           limit: int = 50, skip: int = 0, admin: dict = Depends(get_current_admin)):
    db = get_database()
    query = {}
    if target: query["target"] = {"$regex": target, "$options": "i"}
    if level: query["level"] = level.upper()
    if since: query["timestamp"] = {"$gte": since}
    total = await db[COLL_SCRAPER_LOGS].count_documents(query)
    cursor = db[COLL_SCRAPER_LOGS].find(query).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    return {"logs": [doc_to_id(l) for l in logs], "total": total, "page": (skip // limit) + 1, "limit": limit}

@router.get("/scraper-stats")
async def get_scraper_stats(admin: dict = Depends(get_current_admin)):
    db = get_database()
    pipeline = [{"$group": {"_id": None,
        "total": {"$sum": 1}, "errors": {"$sum": {"$cond": [{"$eq": ["$level", "ERROR"]}, 1, 0]}},
        "warnings": {"$sum": {"$cond": [{"$eq": ["$level", "WARNING"]}, 1, 0]}},
        "infos": {"$sum": {"$cond": [{"$eq": ["$level", "INFO"]}, 1, 0]}}}}]
    agg = await db[COLL_SCRAPER_LOGS].aggregate(pipeline).to_list(length=1)
    target_agg = await db[COLL_SCRAPER_LOGS].aggregate([{"$group": {"_id": "$target", "count": {"$sum": 1}}}]).to_list(length=100)
    a = agg[0] if agg else {}
    total = a.get("total", 0)
    errors = a.get("errors", 0)
    last = await db[COLL_SCRAPER_LOGS].find_one({"level": "INFO", "status": "success"}, sort=[("timestamp", -1)])
    return {"total_scrapes_today": 0, "success_rate": round(((total - errors) / total * 100) if total else 100, 2),
            "last_successful_scrape": last["timestamp"] if last else None, "active_errors": errors,
            "by_level": {"INFO": a.get("infos", 0), "WARNING": a.get("warnings", 0), "ERROR": errors},
            "by_target": {t["_id"]: t["count"] for t in target_agg if t["_id"]}}

# ── Appointment Booking ──────────────────────────────────────────────

@router.get("/appointments/slots")
async def get_available_slots(month: int, year: int, user: dict = Depends(get_current_user)):
    import calendar
    from datetime import date
    month_str = f"{year:04d}-{month:02d}"
    db = get_database()
    cursor = db[COLL_APPOINTMENTS].find({"date": {"$regex": f"^{month_str}"}, "status": {"$in": ["confirmed", "completed"]}})
    booked = await cursor.to_list(length=200)
    booked_set = {(b["date"], b["time_slot"]) for b in booked}
    num_days = calendar.monthrange(year, month)[1]
    time_slots = [f"{h}:00 {'AM' if h < 12 else 'PM'}" for h in range(9, 17)]
    slots_by_day = []
    for day in range(1, num_days + 1):
        d = date(year, month, day)
        if d.weekday() >= 5:
            continue
        date_str = f"{month_str}-{day:02d}"
        slots_by_day.append({"date": date_str, "day_name": d.strftime("%a"),
            "slots": [{"time": ts, "display": ts, "available": (date_str, ts) not in booked_set} for ts in time_slots]})
    return {"month": month, "year": year, "days": slots_by_day}

@router.post("/appointments/book")
async def book_appointment(booking: AppointmentCreate, user: dict = Depends(get_current_user)):
    db = get_database()
    existing = await db[COLL_APPOINTMENTS].find_one(
        {"date": booking.date, "time_slot": booking.time_slot, "status": {"$in": ["confirmed", "completed"]}})
    if existing:
        raise HTTPException(status_code=409, detail="This time slot is already booked")
    doc = {"user_email": user.get("sub", ""), "visa_type_id": booking.visa_type_id,
           "date": booking.date, "time_slot": booking.time_slot, "status": "confirmed",
           "location": booking.location or "VFS Global Center", "notes": booking.notes or "",
           "created_at": datetime.utcnow().isoformat()}
    result = await db[COLL_APPOINTMENTS].insert_one(doc)
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": user.get("sub", ""), "type": "appointment",
        "title": "Appointment Confirmed",
        "message": f"Your appointment on {booking.date} at {booking.time_slot} has been confirmed.",
        "created_at": datetime.utcnow().isoformat()})
    return {"id": str(result.inserted_id), "date": booking.date, "time_slot": booking.time_slot,
            "status": "confirmed", "location": booking.location, "message": "Appointment booked successfully"}

@router.get("/appointments/my")
async def get_my_appointments(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_APPOINTMENTS].find({"user_email": user.get("sub", "")}).sort("date", 1)
    rows = await cursor.to_list(length=100)
    return [{"id": str(r["_id"]), "date": r["date"], "time_slot": r["time_slot"], "status": r["status"],
             "location": r.get("location"), "notes": r.get("notes"), "created_at": r.get("created_at")} for r in rows]

@router.delete("/appointments/{id}")
async def cancel_appointment(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db[COLL_APPOINTMENTS].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if doc.get("status") == "cancelled":
        raise HTTPException(status_code=400, detail="Already cancelled")
    await db[COLL_APPOINTMENTS].update_one({"_id": obid(id)}, {"$set": {"status": "cancelled"}})
    return {"detail": "Appointment cancelled", "id": id}

# ── Documents (legacy) ───────────────────────────────────────────────

@router.get("/documents")
async def get_documents(user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db[COLL_USER_DOCUMENTS].find_one({"user_email": user.get("sub", "")})
    if not doc:
        return {"active_processing": {}, "checklist": []}
    return {"_id": str(doc["_id"]),
            "active_processing": json.loads(doc.get("active_processing", "{}")) if isinstance(doc.get("active_processing"), str) else doc.get("active_processing", {}),
            "checklist": json.loads(doc.get("checklist", "[]")) if isinstance(doc.get("checklist"), str) else doc.get("checklist", [])}

# ── Tracking Simulation ──────────────────────────────────────────────

@router.post("/tracking/simulate")
async def simulate_tracking(user: dict = Depends(get_current_user)):
    return {"application_id": "VF-9928341", "country": "United Kingdom", "visa_type": "Tier 4 Student Visa",
        "simulation_steps": [
            {"step": 1, "title": "Application Received", "description": "Received at VFS Global.", "location": "VFS Global, Mumbai", "coordinates": {"lat": 19.076, "lng": 72.8777}, "timestamp": "2023-10-12T09:00:00Z", "status": "completed", "duration_seconds": 3},
            {"step": 2, "title": "Documents Forwarded", "description": "Forwarded to Embassy.", "location": "Destination Embassy", "coordinates": {"lat": 28.6139, "lng": 77.209}, "timestamp": "2023-10-14T14:30:00Z", "status": "completed", "duration_seconds": 4},
            {"step": 3, "title": "Under Review", "description": "Under review by visa officer.", "location": "Visa Processing Center", "coordinates": {"lat": 53.3811, "lng": -1.4701}, "timestamp": "2023-10-18T10:00:00Z", "status": "in_progress", "duration_seconds": 5},
            {"step": 4, "title": "Additional Verification", "description": "Background verification.", "location": "UKVI Hub, London", "coordinates": {"lat": 51.5074, "lng": -0.1278}, "timestamp": "2023-10-22T11:00:00Z", "status": "pending", "duration_seconds": 4},
            {"step": 5, "title": "Decision Made", "description": "Decision has been made.", "location": "Visa Office", "coordinates": {"lat": 53.3811, "lng": -1.4701}, "timestamp": "2023-10-28T16:00:00Z", "status": "pending", "duration_seconds": 3}]}

# ── Notifications ────────────────────────────────────────────────────

@router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_NOTIFICATIONS].find({"user_email": user.get("sub", "")}).sort("created_at", -1).limit(20)
    rows = await cursor.to_list(length=20)
    return [{"id": str(n["_id"]), "type": n.get("type"), "title": n.get("title"),
             "message": n.get("message"), "read": bool(n.get("read", 0)), "created_at": n.get("created_at")} for n in rows]

@router.put("/notifications/{id}/read")
async def mark_notification_read(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db[COLL_NOTIFICATIONS].update_one(
        {"_id": obid(id), "user_email": user.get("sub", "")}, {"$set": {"read": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "marked read"}

# ── Queries / Support Tickets ────────────────────────────────────────

@router.post("/queries")
async def create_query(query_data: dict, user: dict = Depends(get_current_user)):
    if not query_data.get("subject") or not query_data.get("message"):
        raise HTTPException(status_code=400, detail="Subject and message are required")
    db = get_database()
    doc = {"user_email": user.get("sub", ""), "subject": query_data["subject"],
           "message": query_data["message"], "status": "open", "created_at": datetime.utcnow().isoformat()}
    result = await db[COLL_QUERIES].insert_one(doc)
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": user.get("sub", ""), "type": "query",
        "title": "Query Submitted", "message": f"Your query '{query_data['subject']}' has been submitted.",
        "created_at": datetime.utcnow().isoformat()})
    return {"id": str(result.inserted_id), "status": "open"}

@router.get("/queries")
async def get_my_queries(user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db[COLL_QUERIES].find({"user_email": user.get("sub", "")}).sort("created_at", -1)
    rows = await cursor.to_list(length=100)
    return [{"id": str(q["_id"]), "subject": q["subject"], "status": q["status"], "created_at": q.get("created_at")} for q in rows]

@router.get("/queries/{id}")
async def get_query_detail(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    q = await db[COLL_QUERIES].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")
    cursor = db[COLL_QUERY_RESPONSES].find({"query_id": id}).sort("created_at", 1)
    responses = await cursor.to_list(length=100)
    return {"id": str(q["_id"]), "subject": q["subject"], "message": q["message"], "status": q.get("status"),
            "assigned_to": q.get("assigned_to"), "created_at": q.get("created_at"),
            "responses": [{"responder": r["responder_email"], "message": r["message"], "created_at": r.get("created_at")} for r in responses]}

@router.post("/queries/{id}/respond")
async def respond_to_query(id: str, response_data: dict, admin: dict = Depends(get_current_admin)):
    if not response_data.get("message"):
        raise HTTPException(status_code=400, detail="Response message is required")
    db = get_database()
    q = await db[COLL_QUERIES].find_one({"_id": obid(id)})
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")
    await db[COLL_QUERY_RESPONSES].insert_one({"query_id": id, "responder_email": admin.get("sub", ""),
        "message": response_data["message"], "created_at": datetime.utcnow().isoformat()})
    await db[COLL_QUERIES].update_one({"_id": obid(id)}, {"$set": {"status": "responded"}})
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": q["user_email"], "type": "query",
        "title": "Query Response", "message": f"Your query '{q['subject']}' has been responded to.",
        "created_at": datetime.utcnow().isoformat()})
    return {"detail": "Response added", "query_id": id}

@router.get("/admin/queries")
async def get_all_queries(status: str = None, limit: int = 100, offset: int = 0, admin: dict = Depends(get_current_admin)):
    db = get_database()
    query = {}
    if status:
        query["status"] = status
    cursor = db[COLL_QUERIES].find(query).sort("created_at", -1).skip(offset).limit(limit)
    rows = await cursor.to_list(length=limit)
    return [{"id": str(q["_id"]), "user_email": q["user_email"], "subject": q["subject"], "status": q["status"], "created_at": q.get("created_at")} for q in rows]

# ── Cache ────────────────────────────────────────────────────────────

@router.get("/cache/stats")
async def get_cache_statistics(admin: dict = Depends(get_current_admin)):
    return await get_cache_stats()

@router.post("/cache/clear")
async def clear_cache(cache_type: Optional[str] = None, admin: dict = Depends(get_current_admin)):
    from .cache import invalidate_visa_cache, invalidate_rag_cache, get_cache
    if cache_type == "visa":
        deleted = await invalidate_visa_cache()
    elif cache_type == "rag":
        deleted = await invalidate_rag_cache()
    elif cache_type == "session":
        cache = await get_cache()
        deleted = await cache.clear_pattern("session:*")
    else:
        cache = await get_cache()
        deleted = await cache.clear_all()
    return {"message": "Cache cleared", "deleted_count": deleted, "cache_type": cache_type or "all"}

# ── Visa Marketplace (Public) ────────────────────────────────────────

@router.get("/visa/public")
async def list_visas_public(
    country: Optional[str] = None,
    visa_type: Optional[str] = None,
    min_processing_days: Optional[int] = None,
    max_processing_days: Optional[int] = None,
):
    db = get_database()
    pipeline = [{"$match": {}}]
    match_stage = {}
    if country:
        match_stage["country"] = {"$regex": country, "$options": "i"}
    if visa_type:
        match_stage["visa_type"] = {"$regex": visa_type, "$options": "i"}
    if match_stage:
        pipeline[0]["$match"] = match_stage
    cursor = db[COLL_VISAS].aggregate(pipeline)
    docs = await cursor.to_list(length=500)
    result = []
    for d in docs:
        visa = doc_to_visa(d)
        pt = visa.processing_time or ""
        days_match = re.search(r"(\d+)", pt)
        processing_days = int(days_match.group(1)) if days_match else None
        if min_processing_days and processing_days and processing_days < min_processing_days:
            continue
        if max_processing_days and processing_days and processing_days > max_processing_days:
            continue
        result.append(visa)
    return result


@router.get("/visa/{id}")
async def get_visa_detail(id: str):
    db = get_database()
    doc = await db[COLL_VISAS].find_one({"_id": obid(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Visa not found")
    return doc_to_visa(doc)


# ── Visa Applications ────────────────────────────────────────────────

@router.post("/applications")
async def create_application(app: ApplicationCreate, user: dict = Depends(get_current_user)):
    db = get_database()
    visa_doc = await db[COLL_VISAS].find_one({"_id": obid(app.visa_id)})
    if not visa_doc:
        raise HTTPException(status_code=404, detail="Visa not found")
    now = datetime.utcnow().isoformat()
    doc = {
        "user_email": user.get("sub", ""),
        "visa_id": obid(app.visa_id),
        "status": "submitted",
        "applicant_name": app.applicant_name,
        "applicant_email": app.applicant_email,
        "applicant_passport": app.applicant_passport,
        "applicant_nationality": app.applicant_nationality,
        "purpose": app.purpose,
        "intended_stay_days": app.intended_stay_days,
        "travel_date": app.travel_date,
        "documents_submitted": app.documents_submitted,
        "notes": app.notes,
        "created_at": now,
        "updated_at": now,
    }
    result = await db[COLL_APPLICATIONS].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    del doc["_id"]
    del doc["visa_id"]
    doc["visa_id"] = app.visa_id
    await db[COLL_NOTIFICATIONS].insert_one({
        "user_email": user.get("sub", ""),
        "type": "application",
        "title": "Application Submitted",
        "message": f"Your visa application for {visa_doc['country']} ({visa_doc['visa_type']}) has been submitted.",
        "created_at": now,
    })
    return doc


@router.get("/applications/my")
async def get_my_applications(search: str = None, user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        logger.info(f"Fetching applications for user: {user.get('sub')}")
        # Simple query without aggregation for now
        query = {"user_email": user.get("sub", "")}
        cursor = db[COLL_APPLICATIONS].find(query).sort("created_at", -1)
        docs = await cursor.to_list(length=200)
        logger.info(f"Found {len(docs)} applications")
        
        result = []
        for d in docs:
            item = doc_to_id(d)
            # Convert visa_id ObjectId to string
            if "visa_id" in item:
                item["visa_id"] = str(item["visa_id"])
            result.append(item)
        
        logger.info(f"Returning {len(result)} applications")
        return result
    except Exception as e:
        import traceback
        logger.error(f"Error in get_my_applications: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/applications/{id}")
async def get_application(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    pipeline = [
        {"$match": {"_id": obid(id), "user_email": user.get("sub", "")}},
        {"$lookup": {
            "from": COLL_VISAS,
            "localField": "visa_id",
            "foreignField": "_id",
            "as": "visa_info",
        }},
        {"$unwind": {"path": "$visa_info", "preserveNullAndEmptyArrays": True}},
    ]
    cursor = db[COLL_APPLICATIONS].aggregate(pipeline)
    docs = await cursor.to_list(length=1)
    if not docs:
        raise HTTPException(status_code=404, detail="Application not found")
    d = doc_to_id(docs[0])
    if "visa_info" in d and d["visa_info"]:
        visa = d["visa_info"]
        d["visa_country"] = visa.get("country", "Unknown")
        d["visa_type_label"] = visa.get("visa_type", "Unknown")
        d["visa_processing_time"] = visa.get("processing_time", "")
        d["visa_description"] = visa.get("description", "")
        d["visa_fee"] = visa.get("fee")
        d["visa_documents"] = visa.get("documents", [])
        del d["visa_info"]
    # Convert visa_id ObjectId to string
    if "visa_id" in d and hasattr(d["visa_id"], "__str__"):
        d["visa_id"] = str(d["visa_id"])
    return d


@router.post("/applications/{id}/cancel")
async def cancel_application(id: str, user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db[COLL_APPLICATIONS].find_one({"_id": obid(id), "user_email": user.get("sub", "")})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    if doc["status"] not in ("pending", "submitted"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel application with status '{doc['status']}'")
    now = datetime.utcnow().isoformat()
    await db[COLL_APPLICATIONS].update_one(
        {"_id": obid(id)},
        {"$set": {"status": "cancelled", "updated_at": now}},
    )
    return {"detail": "Application cancelled", "id": id, "status": "cancelled"}


@router.post("/admin/applications/{id}/status")
async def admin_update_application_status(id: str, update: ApplicationStatusUpdate, admin: dict = Depends(get_current_admin)):
    db = get_database()
    doc = await db[COLL_APPLICATIONS].find_one({"_id": obid(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    now = datetime.utcnow().isoformat()
    set_fields = {"status": update.status, "updated_at": now}
    if update.notes:
        set_fields["admin_notes"] = update.notes
    await db[COLL_APPLICATIONS].update_one({"_id": obid(id)}, {"$set": set_fields})
    await db[COLL_NOTIFICATIONS].insert_one({
        "user_email": doc["user_email"],
        "type": "application",
        "title": f"Application {update.status.replace('_', ' ').title()}",
        "message": f"Your visa application status has been updated to: {update.status.replace('_', ' ')}." +
                   (f"\nNotes: {update.notes}" if update.notes else ""),
        "created_at": now,
    })
    return {"detail": f"Status updated to {update.status}", "id": id, "status": update.status}


# ── Scheduler Endpoints ──────────────────────────────────────────────

import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

_scheduler = None
_scheduler_lock = False

def get_scheduler():
    global _scheduler, _scheduler_lock
    if _scheduler is None and not _scheduler_lock:
        _scheduler_lock = True
        try:
            from rag_pipeline.scheduler import EmbassyScheduler, SchedulerConfig
            config = SchedulerConfig()
            if config.enabled:
                _scheduler = EmbassyScheduler(config)
                _scheduler.start()
        except Exception as e:
            logger.warning("Scheduler init failed: %s", e)
        finally:
            _scheduler_lock = False
    return _scheduler

@router.get("/scheduler/jobs")
async def list_scheduler_jobs(admin: dict = Depends(get_current_admin)):
    s = get_scheduler()
    if not s: return {"jobs": []}
    return {"jobs": s.list_jobs()}

@router.post("/scheduler/jobs")
async def add_scheduler_job(job_config: dict, admin: dict = Depends(get_current_admin)):
    s = get_scheduler()
    if not s: raise HTTPException(status_code=503, detail="Scheduler not available")
    from apscheduler.triggers.cron import CronTrigger
    from apscheduler.triggers.interval import IntervalTrigger
    job_id = job_config.get("job_id")
    job_type = job_config.get("type")
    if not job_id or not job_type:
        raise HTTPException(status_code=400, detail="job_id and type required")
    func = s._run_daily_update if job_config.get("target") == "daily" else s._run_weekly_scan
    trigger = CronTrigger(hour=job_config.get("hour", 2), minute=job_config.get("minute", 0)) if job_type == "cron" \
        else IntervalTrigger(days=job_config.get("days", 1))
    result = s.add_job(job_id=job_id, func=func, trigger=trigger, name=job_config.get("name", job_id))
    if result:
        return {"message": "Job added", "job_id": result}
    raise HTTPException(status_code=500, detail="Failed to add job")

@router.delete("/scheduler/jobs/{job_id}")
async def remove_scheduler_job(job_id: str, admin: dict = Depends(get_current_admin)):
    s = get_scheduler()
    if not s or not s.remove_job(job_id):
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
    return {"message": "Job removed", "job_id": job_id}

@router.post("/scheduler/jobs/{job_id}/run")
async def trigger_scheduler_job(job_id: str, admin: dict = Depends(get_current_admin)):
    s = get_scheduler()
    if not s or not s.run_job(job_id):
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
    return {"message": "Job triggered", "job_id": job_id}
