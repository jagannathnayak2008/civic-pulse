"""
Authentication Request & Response Schemas
Flexible, forgiving schemas to ensure flawless connection with frontend and mobile clients.
"""

from pydantic import BaseModel, Field
from typing import Optional

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    phone_number: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=4)
    confirm_password: Optional[str] = None
    role: Optional[str] = "CITIZEN"

class LoginRequest(BaseModel):
    login_identifier: Optional[str] = None
    username: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=1)
    remember_me: Optional[bool] = True

    def get_identifier(self) -> str:
        """Returns the first non-empty login identifier supplied."""
        return (self.login_identifier or self.username or self.phone_number or self.email or "").strip()

class ForgotPasswordRequest(BaseModel):
    login_identifier: Optional[str] = None
    phone_number: Optional[str] = None
    new_password: str = Field(..., min_length=4)
    confirm_password: Optional[str] = None

    def get_identifier(self) -> str:
        return (self.login_identifier or self.phone_number or "").strip()

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
