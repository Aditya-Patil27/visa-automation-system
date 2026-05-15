"""
Fernet-based encryption helpers for document storage.
Key is derived from JWT_SECRET so no extra config is needed.
"""
import base64
import hashlib

from cryptography.fernet import Fernet

from .security import SECRET_KEY


def _derive_key(secret: str) -> bytes:
    """Derive a 32-byte Fernet-compatible key from the JWT secret."""
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


_fernet = Fernet(_derive_key(SECRET_KEY))


def encrypt_data(data: bytes) -> bytes:
    """Encrypt raw bytes and return the Fernet token."""
    return _fernet.encrypt(data)


def decrypt_data(token: bytes) -> bytes:
    """Decrypt a Fernet token back to raw bytes."""
    return _fernet.decrypt(token)
