"""
Core Application Configuration
Loads environment variables with safe defaults for development and production.
Includes built-in zero-dependency .env file parser.
"""

import os
from typing import List
from pydantic import BaseModel

def load_env_file(filepath: str):
    """Loads key-value pairs from .env into os.environ if not already present."""
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

# Auto-load backend/.env and root .env
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)) # backend/app/core
BACKEND_DIR = os.path.dirname(os.path.dirname(CURRENT_DIR)) # backend
ROOT_DIR = os.path.dirname(BACKEND_DIR) # root

load_env_file(os.path.join(BACKEND_DIR, ".env"))
load_env_file(os.path.join(ROOT_DIR, ".env"))

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
