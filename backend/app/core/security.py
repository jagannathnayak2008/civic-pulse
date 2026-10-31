"""
Security Utilities: RFC 7519 Compliant HS256 JWT, Bcrypt Hashing & Password Verification.
Stateless, cryptographically secure with zero mandatory external JWT dependencies.
"""

import os
import re
import hmac
import hashlib
import base64
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import bcrypt

from .config import settings

DEFAULT_SESSION_HOURS = 24
REMEMBER_ME_SESSION_DAYS = 30

# In-memory session tracking registry for backwards compatibility
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_secret_key() -> str:
    """Returns configured JWT / application secret key."""
    return settings.JWT_SECRET or settings.SECRET_KEY or "civicpulse_production_jwt_secret_key_2026"

# ---------------------------------------------------------------------------
# Bcrypt Password Hashing & Verification
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hashes a password using bcrypt with 12 salt rounds."""
    salt = bcrypt.gensalt(12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

# ---------------------------------------------------------------------------
# Identifier Normalization & Password Validation
# ---------------------------------------------------------------------------

def normalize_phone(phone: str) -> str:
    """Normalizes phone number or login identifier (strips spaces, dashes, prefixes)."""
    if not phone:
        return ""
    cleaned = re.sub(r"[\s\-\(\)]", "", str(phone).strip())
    if cleaned.startswith("+91") and len(cleaned) == 13:
        cleaned = cleaned[3:]
    elif cleaned.startswith("0") and len(cleaned) == 11:
        cleaned = cleaned[1:]
    return cleaned

def validate_password_complexity(password: str) -> Optional[str]:
    """
    Validates minimum password length (minimum 6 characters).
    Permissive to ensure seamless development and citizen testing.
    """
    if not password or len(password) < 6:
        return "Password must contain at least 6 characters."
    return None

# ---------------------------------------------------------------------------
# Standard RFC 7519 HS256 JSON Web Token (JWT) Engine
# ---------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64url_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_jwt_token(
    user_id: str,
    role: str = "CITIZEN",
    full_name: str = "",
    phone_number: str = "",
    remember_me: bool = False,
    extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    """Generates an RFC 7519 compliant HS256 JSON Web Token signed with JWT_SECRET."""
    secret = get_secret_key()
    duration = timedelta(days=REMEMBER_ME_SESSION_DAYS) if remember_me else timedelta(hours=DEFAULT_SESSION_HOURS)
    now = int(time.time())
    exp = now + int(duration.total_seconds())

    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "user_id": user_id,
        "role": role,
        "full_name": full_name,
        "phone_number": phone_number,
        "iat": now,
        "exp": exp,
        "remember_me": remember_me
    }
    if extra_claims:
        payload.update(extra_claims)

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies an HS256 JWT using JWT_SECRET."""
    if not token or not isinstance(token, str):
        return None
    parts = token.strip().split(".")
    if len(parts) != 3:
        return None

    secret = get_secret_key()
    signing_input = f"{parts[0]}.{parts[1]}".encode("utf-8")
    try:
        sig = _b64url_decode(parts[2])
        expected_sig = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
        if not hmac.compare_digest(sig, expected_sig):
            # Check secondary fallback if SECRET_KEY differed from JWT_SECRET
            fallback_secret = settings.SECRET_KEY
            if fallback_secret and fallback_secret != secret:
                alt_sig = hmac.new(fallback_secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
                if not hmac.compare_digest(sig, alt_sig):
                    return None
            else:
                return None

        payload = json.loads(_b64url_decode(parts[1]).decode("utf-8"))
        if "exp" in payload and payload["exp"] < time.time():
            return None
        return payload
    except Exception:
        return None

# ---------------------------------------------------------------------------
# Session Token Compatibility Layer
# ---------------------------------------------------------------------------

def create_session_token(
    user_id: str,
    remember_me: bool = False,
    role: str = "CITIZEN",
    full_name: str = "",
    phone_number: str = ""
) -> str:
    """Creates a signed JWT session token."""
    return create_jwt_token(
        user_id=user_id,
        role=role,
        full_name=full_name,
        phone_number=phone_number,
        remember_me=remember_me
    )

def validate_session_token(token: Optional[str], user_finder_fn = None) -> Optional[Dict[str, Any]]:
    """
    Validates token via JWT signature verification.
    If valid, resolves the user profile either from database or embedded token claims.
    """
    if not token:
        return None

    payload = decode_jwt_token(token)
    if not payload:
        return None

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        return None

    if user_finder_fn:
        user = user_finder_fn(user_id)
        if user:
            return user

    # Fallback to embedded JWT claims if DB lookup misses
    return {
        "id": user_id,
        "full_name": payload.get("full_name") or "CivicPulse User",
        "phone_number": payload.get("phone_number") or "",
        "role": payload.get("role") or "CITIZEN",
        "created_at": datetime.utcfromtimestamp(payload.get("iat", time.time())).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "last_login": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }

def invalidate_session_token(token: str) -> bool:
    """Stateless JWT invalidation hook (client discards token on logout)."""
    return True
