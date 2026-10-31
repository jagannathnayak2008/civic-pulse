"""
Security Utilities: Bcrypt Hashing, Password Complexity & Token Management
"""

import re
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import bcrypt

DEFAULT_SESSION_HOURS = 24
REMEMBER_ME_SESSION_DAYS = 30

# In-memory active session tokens: token -> { user_id, expires_at }
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str) -> str:
    """Hashes a password using bcrypt with 12 salt rounds."""
    salt = bcrypt.gensalt(12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def normalize_phone(phone: str) -> str:
    """Normalizes phone number to digits only or clean E.164 without spaces/dashes."""
    cleaned = re.sub(r"[\s\-\(\)]", "", phone.strip())
    if cleaned.startswith("+91") and len(cleaned) == 13:
        cleaned = cleaned[3:]
    elif cleaned.startswith("0") and len(cleaned) == 11:
        cleaned = cleaned[1:]
    return cleaned

def validate_password_complexity(password: str) -> Optional[str]:
    """
    Enforces password criteria:
    - Min 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """
    if len(password) < 8:
        return "Password must contain at least 8 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=\[\]~\\/]", password):
        return "Password must contain at least one special character (!@#$%^&* etc)."
    return None

def create_session_token(user_id: str, remember_me: bool = False) -> str:
    """Generates a cryptographically secure random session token."""
    token = secrets.token_urlsafe(32)
    duration = timedelta(days=REMEMBER_ME_SESSION_DAYS) if remember_me else timedelta(hours=DEFAULT_SESSION_HOURS)
    expires_at = datetime.utcnow() + duration
    ACTIVE_SESSIONS[token] = {
        "user_id": user_id,
        "expires_at": expires_at,
        "remember_me": remember_me
    }
    return token

def validate_session_token(token: Optional[str], user_finder_fn = None) -> Optional[Dict[str, Any]]:
    """Validates token. Returns user dict if valid and not expired, else None."""
    if not token or token not in ACTIVE_SESSIONS:
        return None
    session = ACTIVE_SESSIONS[token]
    if datetime.utcnow() > session["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None

    if user_finder_fn:
        return user_finder_fn(session["user_id"])
    return {"id": session["user_id"]}

def invalidate_session_token(token: str) -> bool:
    """Terminates session upon logout."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False
