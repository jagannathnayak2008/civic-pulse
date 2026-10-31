"""
Authentication Request & Response Schemas
Matches frontend payload structure identically.
"""

from pydantic import BaseModel, Field
from typing import Optional

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
