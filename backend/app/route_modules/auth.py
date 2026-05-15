"""Authentication routes — MongoDB-backed."""
import json, os, secrets, hashlib, bcrypt, logging, time
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from ..models import UserCreate, COLL_USERS, COLL_RESET_TOKENS, COLL_NOTIFICATIONS
from ..security import verify_password, get_password_hash, create_access_token
from ..database import get_database, doc_to_id
from .deps import get_current_user

logger = logging.getLogger(__name__)

_rate_store: dict = defaultdict(list)
_RATE_LIMIT = 5
_RATE_WINDOW = 60

def _check_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    _rate_store[ip] = [t for t in _rate_store[ip] if t > now - _RATE_WINDOW]
    if len(_rate_store[ip]) >= _RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
    _rate_store[ip].append(now)

router = APIRouter()

@router.post("/register")
async def register(request: Request, user: UserCreate):
    _check_rate_limit(request)
    db = get_database()
    existing = await db[COLL_USERS].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {"email": user.email, "hashed_password": get_password_hash(user.password), "role": user.role}
    result = await db[COLL_USERS].insert_one(doc)
    token = create_access_token({"sub": user.email, "role": user.role})
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": user.email, "type": "auth",
        "title": "Welcome to VisaAI", "message": f"Account created successfully. Welcome {user.email}!",
        "created_at": datetime.utcnow().isoformat()})
    logger.info("User registered: %s", user.email)
    resp = JSONResponse({"access_token": token, "message": "Registration successful. Welcome!"})
    resp.set_cookie("access_token", token, httponly=True, samesite="strict", max_age=1800,
                    secure=os.getenv("ENVIRONMENT", "development") == "production")
    return resp

@router.post("/login")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    _check_rate_limit(request)
    db = get_database()
    user = await db[COLL_USERS].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        logger.warning("Failed login for: %s", form_data.username)
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token({"sub": user["email"], "role": user["role"]})
    logger.info("User logged in: %s", user["email"])
    resp = JSONResponse({"access_token": token})
    resp.set_cookie("access_token", token, httponly=True, samesite="strict", max_age=1800,
                    secure=os.getenv("ENVIRONMENT", "development") == "production")
    return resp

@router.post("/forgot-password")
async def forgot_password(request: Request, data: dict):
    _check_rate_limit(request)
    email = data.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    db = get_database()
    user = await db[COLL_USERS].find_one({"email": email})
    if not user:
        return {"detail": "If the email exists, a reset link has been sent"}
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    await db[COLL_RESET_TOKENS].insert_one({
        "email": email, "token": token_hash,
        "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
        "used": 0, "created_at": datetime.utcnow().isoformat()})
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": email, "type": "auth",
        "title": "Password Reset Requested", "message": "A reset link has been sent. It expires in 1 hour.",
        "created_at": datetime.utcnow().isoformat()})
    logger.info("Password reset requested for: %s", email)
    return {"detail": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(request: Request, data: dict):
    _check_rate_limit(request)
    raw_token = data.get("token", "")
    new_password = data.get("password", "")
    if not raw_token or not new_password:
        raise HTTPException(status_code=400, detail="Token and password are required")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    db = get_database()
    reset_doc = await db[COLL_RESET_TOKENS].find_one({"token": token_hash, "used": 0})
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if reset_doc["expires_at"] < datetime.utcnow().isoformat():
        raise HTTPException(status_code=400, detail="Reset token has expired")
    user = await db[COLL_USERS].find_one({"email": reset_doc["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db[COLL_USERS].update_one({"email": user["email"]}, {"$set": {"hashed_password": get_password_hash(new_password)}})
    await db[COLL_RESET_TOKENS].update_one({"_id": reset_doc["_id"]}, {"$set": {"used": 1}})
    await db[COLL_NOTIFICATIONS].insert_one({"user_email": user["email"], "type": "auth",
        "title": "Password Reset Successful", "message": "Your password has been changed successfully.",
        "created_at": datetime.utcnow().isoformat()})
    logger.info("Password reset completed")
    return {"detail": "Password reset successful"}
