"""
CivicPulse Authentication Module
Secure User Registration, Login, Session Management, and Password Hashing with Bcrypt.
"""

import os
import json
import re
import uuid
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import bcrypt
from pydantic import BaseModel, Field

USERS_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users_db.json")

# Token expiration: 30 days if remember_me, else 24 hours
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
    # If starts with +91 and 10 digits follow, strip country code for consistent 10-digit login
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


class UserManager:
    def __init__(self, db_path: str = USERS_DB_PATH):
        self.db_path = db_path
        self.users: List[Dict[str, Any]] = []
        self._load_users()

    def _load_users(self):
        """Loads users from JSON file, initializing with demo users if empty."""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    self.users = json.load(f)
                    return
            except Exception as e:
                print(f"[Auth] Warning: Could not read {self.db_path}, resetting: {e}")

        # Seed with initial demo account
        demo_user = {
            "id": "USR-101",
            "full_name": "Rajesh Sharma",
            "phone_number": "9876543210",
            "hashed_password": hash_password("Password@123"),
            "role": "CITIZEN",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": None
        }
        # Authority demo account
        officer_user = {
            "id": "USR-OFFICER-01",
            "full_name": "Er. Alok Das (Zonal Engineer)",
            "phone_number": "9437033003",
            "hashed_password": hash_password("Officer@2026!"),
            "role": "OFFICER",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": None
        }
        self.users = [demo_user, officer_user]
        self._save_users()

    def _save_users(self):
        """Saves users to JSON file safely."""
        try:
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self.users, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Auth] Error saving users DB: {e}")

    def find_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        norm = normalize_phone(phone)
        for u in self.users:
            if normalize_phone(u.get("phone_number", "")) == norm:
                return u
        return None

    def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for u in self.users:
            if u.get("id") == user_id:
                return u
        return None

    def register_user(self, full_name: str, phone_number: str, password: str, role: str = "CITIZEN") -> Dict[str, Any]:
        """Validates and creates a new user record."""
        norm_phone = normalize_phone(phone_number)
        
        # Check duplicate
        if self.find_by_phone(norm_phone):
            raise ValueError(f"An account with registered number '{phone_number}' already exists. Please log in.")

        # Complexity check
        err = validate_password_complexity(password)
        if err:
            raise ValueError(err)

        user_id = f"USR-{secrets.randbelow(90000) + 10000}"
        hashed = hash_password(password)

        new_user = {
            "id": user_id,
            "full_name": full_name.strip(),
            "phone_number": norm_phone,
            "hashed_password": hashed,
            "role": role,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

        self.users.append(new_user)
        self._save_users()
        return new_user

    def authenticate(self, login_identifier: str, password: str) -> Optional[Dict[str, Any]]:
        """Verifies credentials against phone number or user id."""
        norm = normalize_phone(login_identifier)
        user = None
        for u in self.users:
            if normalize_phone(u.get("phone_number", "")) == norm or u.get("id", "").upper() == login_identifier.strip().upper():
                user = u
                break

        if not user:
            return None

        if not verify_password(password, user["hashed_password"]):
            return None

        # Update last login
        user["last_login"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        self._save_users()
        return user

    def reset_password(self, login_identifier: str, new_password: str) -> bool:
        """Resets password for an existing account."""
        norm = normalize_phone(login_identifier)
        user = None
        for u in self.users:
            if normalize_phone(u.get("phone_number", "")) == norm or u.get("id", "").upper() == login_identifier.strip().upper():
                user = u
                break
        if not user:
            return False

        err = validate_password_complexity(new_password)
        if err:
            raise ValueError(err)

        user["hashed_password"] = hash_password(new_password)
        self._save_users()
        return True


user_manager = UserManager()


def create_session_token(user_id: str, remember_me: bool = False) -> str:
    """Creates a cryptographically secure random session token with expiration."""
    token = secrets.token_urlsafe(32)
    duration = timedelta(days=REMEMBER_ME_SESSION_DAYS) if remember_me else timedelta(hours=DEFAULT_SESSION_HOURS)
    expires_at = datetime.utcnow() + duration

    ACTIVE_SESSIONS[token] = {
        "user_id": user_id,
        "expires_at": expires_at,
        "remember_me": remember_me
    }
    return token


def validate_session_token(token: str) -> Optional[Dict[str, Any]]:
    """Validates session token and returns the user object if active and not expired."""
    if not token or token not in ACTIVE_SESSIONS:
        return None

    session = ACTIVE_SESSIONS[token]
    if datetime.utcnow() > session["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None

    user = user_manager.find_by_id(session["user_id"])
    return user


def invalidate_session_token(token: str) -> bool:
    """Invalidates and removes session token."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False


# --- Pydantic Request/Response Models ---

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=80)
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    role: Optional[str] = "CITIZEN"


class LoginRequest(BaseModel):
    login_identifier: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
    remember_me: Optional[bool] = False


class ForgotPasswordRequest(BaseModel):
    login_identifier: str = Field(..., min_length=3)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class UserProfileResponse(BaseModel):
    id: str
    full_name: str
    phone_number: str
    role: str
    created_at: str
    last_login: Optional[str] = None


class AuthSuccessResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserProfileResponse
