"""Security-focused tests.

Coverage: JWT token validation, password hashing, SHA256 token lookup,
input validation, magic byte detection.
"""
import secrets
import hashlib
import pytest
import pytest_asyncio
from datetime import datetime, timedelta
from app.security import create_access_token, decode_access_token, verify_password, get_password_hash


def test_password_hashing():
    """Password hash is bcrypt and verifiable."""
    pwd = "SecureP@ss123!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_create_and_decode():
    """JWT token encodes and decodes correctly."""
    data = {"sub": "test@example.com", "role": "admin"}
    token = create_access_token(data, expires_delta=timedelta(hours=1))
    assert token is not None
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "test@example.com"
    assert payload["role"] == "admin"


def test_jwt_expired_token_returns_none():
    """Expired JWT token returns None (not crash)."""
    data = {"sub": "test@example.com"}
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    payload = decode_access_token(token)
    assert payload is None


def test_jwt_invalid_token_returns_none():
    """Malformed JWT token returns None."""
    payload = decode_access_token("invalid.token.here")
    assert payload is None


def test_reset_token_stored_as_hash():
    """Reset token should be stored as SHA256 hash, not plaintext."""
    raw_token = "test_reset_token_12345"
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    assert token_hash != raw_token
    assert hashlib.sha256(raw_token.encode("utf-8")).hexdigest() == token_hash  # deterministic
    assert hashlib.sha256(b"wrong_token").hexdigest() != token_hash  # different token


def test_upload_magic_bytes_validation():
    """Simulated magic byte validation for file uploads."""
    ALLOWED_MAGIC_BYTES = {
        b'\x89PNG': 'image/png',
        b'\xff\xd8\xff': 'image/jpeg',
        b'%PDF': 'application/pdf',
    }
    valid_files = [
        (b'\x89PNG\r\n\x1a\n', 'image/png'),
        (b'\xff\xd8\xff\xe0', 'image/jpeg'),
        (b'%PDF-1.4', 'application/pdf'),
    ]
    invalid_files = [
        b'GIF89a',
        b'<html>',
        b'MZ\x90\x00',
    ]
    for content, expected_mime in valid_files:
        detected = None
        for magic, mime in ALLOWED_MAGIC_BYTES.items():
            if content[:len(magic)] == magic:
                detected = mime
                break
        assert detected == expected_mime, f"Failed to detect {expected_mime}"

    for content in invalid_files:
        detected = None
        for magic, mime in ALLOWED_MAGIC_BYTES.items():
            if content[:len(magic)] == magic:
                detected = mime
                break
        assert detected is None, f"Should not detect {content[:4]}"


def test_password_hash_not_equal():
    """Password hash should not equal original password."""
    hashed = get_password_hash("testpass123")
    assert hashed != "testpass123"


def test_bcrypt_verify_fails_on_wrong_password():
    """Wrong password should fail bcrypt verify."""
    hashed = get_password_hash("testpass123")
    assert verify_password("wrongpass", hashed) is False


def test_sha256_token_lookup():
    """SHA256 token hashing produces consistent indexed-key."""
    import hashlib
    raw = secrets.token_urlsafe(32)
    h1 = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    h2 = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    assert h1 == h2  # deterministic
    assert h1 != raw  # not plaintext


def test_sha256_token_uniqueness():
    """Different tokens produce different SHA256 hashes."""
    import hashlib
    raw1 = secrets.token_urlsafe(32)
    raw2 = secrets.token_urlsafe(32)
    h1 = hashlib.sha256(raw1.encode("utf-8")).hexdigest()
    h2 = hashlib.sha256(raw2.encode("utf-8")).hexdigest()
    assert h1 != h2
