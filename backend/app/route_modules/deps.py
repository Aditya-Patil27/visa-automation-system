"""Shared dependencies for all route modules."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..database import get_database
from ..security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return payload

def get_current_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user

__all__ = ["get_database", "get_current_user", "get_current_admin", "oauth2_scheme"]
