"""
Core Application Configuration
Loads environment variables with safe defaults for development and production.
Zero external dependency: uses standard pydantic.BaseModel with os.getenv.
"""

import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CivicPulse Autonomous Incident Intelligence API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server Host & Port
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Authentication & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicpulse_dev_super_secret_session_token_key_2026")
    SESSION_EXPIRE_HOURS: int = int(os.getenv("SESSION_EXPIRE_HOURS", "24"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicpulse.db")
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Optional decoupled AI Engine URL
    AI_ENGINE_URL: str = os.getenv("AI_ENGINE_URL", "")

settings = Settings()
