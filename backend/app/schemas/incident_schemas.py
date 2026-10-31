"""
Incident & Municipal API Request Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ReportDamagePayload(BaseModel):
    raw_text: str = ""
    audio_preset: Optional[str] = None
    latitude: float = 20.2961
    longitude: float = 85.8245
    media_type: str = "VIDEO"
    media_url: str = ""
    reporter_alias: str = "Citizen"
    is_recycled_test: bool = False

class StatusUpdatePayload(BaseModel):
    new_status: str
    officer_notes: Optional[str] = None

class VerifyRepairPayload(BaseModel):
    after_image_url: str
    officer_lat: float
    officer_lon: float

class CitizenFeedbackPayload(BaseModel):
    action: str = Field(..., description="'CONFIRM' or 'DISPUTE'")
    dispute_reason: Optional[str] = None

