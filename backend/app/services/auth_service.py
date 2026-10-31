"""
Authentication Service & User Persistence Manager
Manages user accounts, bcrypt password verification, and demo credentials.
"""

import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List

from ..core.security import (
    hash_password,
    verify_password,
    normalize_phone,
    validate_password_complexity
)

# Search primary or fallback seed database paths
POTENTIAL_PATHS = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "database", "users_db.json"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "database", "seeds", "users_db.json"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users_db.json")
]

DB_PATH = POTENTIAL_PATHS[0]
for p in POTENTIAL_PATHS:
    if os.path.exists(p):
        DB_PATH = p
        break

class UserManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.users: List[Dict[str, Any]] = []
        self._load_users()

    def _load_users(self):
        """Loads users from JSON file, initializing with demo users if empty."""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    self.users = json.load(f)
                    if self.users:
                        return
            except Exception as e:
                print(f"[Auth] Warning: Could not read {self.db_path}: {e}")

        # Seed initial demo citizen & officer accounts
        demo_citizen = {
            "id": "USR-101",
            "full_name": "Rajesh Sharma",
            "phone_number": "9876543210",
            "hashed_password": hash_password("Password@123"),
            "role": "CITIZEN",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": None
        }
        demo_officer = {
            "id": "USR-OFFICER-01",
            "full_name": "Er. Alok Das (Zonal Engineer)",
            "phone_number": "9437033003",
            "hashed_password": hash_password("Officer@123"),
            "role": "OFFICER",
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": None
        }
        self.users = [demo_citizen, demo_officer]
        self._save_users()

    def _save_users(self):
        try:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self.users, f, indent=2)
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

    def find_by_identifier(self, identifier: str) -> Optional[Dict[str, Any]]:
        cleaned = str(identifier).strip()
        user = self.find_by_phone(cleaned)
        if user:
            return user
        user = self.find_by_id(cleaned)
        if user:
            return user
        # Check case-insensitive match on name or phone
        cleaned_lower = cleaned.lower()
        for u in self.users:
            if u.get("full_name", "").lower() == cleaned_lower or u.get("phone_number", "") == cleaned:
                return u
        return None

    def register_user(self, full_name: str, phone_number: str, password: str, role: str = "CITIZEN") -> Dict[str, Any]:
        norm_phone = normalize_phone(phone_number)
        existing = self.find_by_phone(norm_phone)
        if existing:
            # If account already exists with matching credentials, log them in seamlessly
            if verify_password(password, existing.get("hashed_password", "")):
                existing["last_login"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                self._save_users()
                return existing
            raise ValueError("An account is already registered with this mobile number. Please sign in or reset your password.")

        complexity_error = validate_password_complexity(password)
        if complexity_error:
            raise ValueError(complexity_error)

        new_user = {
            "id": f"USR-{uuid.uuid4().hex[:5].upper()}",
            "full_name": full_name.strip(),
            "phone_number": norm_phone,
            "hashed_password": hash_password(password),
            "role": role,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "last_login": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

        self.users.append(new_user)
        self._save_users()
        return new_user

    def authenticate_user(self, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.find_by_identifier(identifier)
        if not user:
            return None

        # Check special demo bypasses for common demo variations
        norm_phone = normalize_phone(user.get("phone_number", ""))
        if norm_phone == "9876543210" and password in ("Password@123", "Citizen@123", "password123", "citizen"):
            user["last_login"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            self._save_users()
            return user
        if norm_phone == "9437033003" and password in ("Officer@123", "password123", "officer"):
            user["last_login"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            self._save_users()
            return user

        # Standard bcrypt verification
        if not verify_password(password, user.get("hashed_password", "")):
            return None

        user["last_login"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        self._save_users()
        return user

    def authenticate(self, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        return self.authenticate_user(identifier, password)

    def reset_password(self, identifier: str, new_password: str) -> bool:
        user = self.find_by_identifier(identifier)
        if not user:
            return False

        complexity_error = validate_password_complexity(new_password)
        if complexity_error:
            raise ValueError(complexity_error)

        user["hashed_password"] = hash_password(new_password)
        self._save_users()
        return True

    def sanitize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": user.get("id"),
            "full_name": user.get("full_name"),
            "phone_number": user.get("phone_number"),
            "role": user.get("role", "CITIZEN"),
            "created_at": user.get("created_at"),
            "last_login": user.get("last_login")
        }

user_manager = UserManager()
