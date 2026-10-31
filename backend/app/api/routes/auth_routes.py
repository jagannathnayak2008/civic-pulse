"""
Authentication Routes: Register, Login, Session Check, Logout, Password Recovery
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from ...schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    AuthSuccessResponse,
    UserProfileResponse
)
from ...services.auth_service import user_manager
from ...core.security import (
    create_session_token,
    validate_session_token,
    invalidate_session_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthSuccessResponse)
async def auth_register(payload: RegisterRequest):
    """
    First-time User Registration:
    Validates full name, mobile number format, password match, and password complexity.
    Stores password hashed with bcrypt and issues a session token.
    """
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match. Please verify both fields.")

    try:
        new_user = user_manager.register_user(
            full_name=payload.full_name,
            phone_number=payload.phone_number,
            password=payload.password,
            role=payload.role or "CITIZEN"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

    token = create_session_token(new_user["id"], remember_me=True)
    user_resp = UserProfileResponse(
        id=new_user["id"],
        full_name=new_user["full_name"],
        phone_number=new_user["phone_number"],
        role=new_user["role"],
        created_at=new_user["created_at"],
        last_login=new_user["last_login"]
    )
    return AuthSuccessResponse(
        success=True,
        message="Account registered successfully! Welcome to CivicPulse.",
        token=token,
        user=user_resp
    )

@router.post("/login", response_model=AuthSuccessResponse)
async def auth_login(payload: LoginRequest):
    """
    Returning User Login:
    Authenticates by Registered Number or User ID and verifies bcrypt password hash.
    """
    user = user_manager.authenticate(payload.login_identifier, payload.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please verify your Registered Number and Password."
        )

    token = create_session_token(user["id"], remember_me=payload.remember_me or False)
    user_resp = UserProfileResponse(
        id=user["id"],
        full_name=user["full_name"],
        phone_number=user["phone_number"],
        role=user["role"],
        created_at=user["created_at"],
        last_login=user["last_login"]
    )
    return AuthSuccessResponse(
        success=True,
        message=f"Welcome back, {user['full_name']}!",
        token=token,
        user=user_resp
    )

@router.get("/me")
async def auth_me(authorization: Optional[str] = Header(None)):
    """
    Session Verification:
    Validates the bearer token or session cookie and returns active user details.
    """
    token = None
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        else:
            token = authorization

    if not token:
        raise HTTPException(status_code=401, detail="No authentication token provided.")

    user = validate_session_token(token, user_finder_fn=user_manager.find_by_id)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")

    return {
        "authenticated": True,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "phone_number": user["phone_number"],
            "role": user["role"],
            "created_at": user["created_at"],
            "last_login": user.get("last_login")
        }
    }

@router.post("/logout")
async def auth_logout(authorization: Optional[str] = Header(None)):
    """
    Terminates the user's active session token.
    """
    token = None
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        else:
            token = authorization

    if token:
        invalidate_session_token(token)

    return {"success": True, "message": "Session logged out successfully."}

@router.post("/forgot-password")
async def auth_forgot_password(payload: ForgotPasswordRequest):
    """
    Password Recovery / Reset flow:
    Updates password if account exists and meets complexity criteria.
    """
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match.")

    try:
        success = user_manager.reset_password(payload.login_identifier, payload.new_password)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Account not found. Please verify your Registered Number."
            )
        return {
            "success": True,
            "message": "Password reset successfully. You can now log in with your new password."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")
