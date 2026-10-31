"""
CivicPulse Domain Models & Pydantic Schemas
Strict negative constraints applied:
- NO average resolution time
- NO predictive analytics / predictive civic intelligence
- NO digital twin / 2D or 3D city model visualization
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class IncidentCategory(str, Enum):
    POTHOLE_ROAD_DAMAGE = "POTHOLE_ROAD_DAMAGE"          # Roads with repeated potholes
    GARBAGE_OVERFLOW = "GARBAGE_OVERFLOW"                # Recurring garbage overflow
    PUBLIC_TOILET_ISSUES = "PUBLIC_TOILET_ISSUES"        # Public toilet cleanliness & plumbing
    WATERLOGGING = "WATERLOGGING"                        # Street waterlogging & flash inundation
    DRAINAGE_WATER_LEAKAGE = "DRAINAGE_WATER_LEAKAGE"    # Frequent drainage complaints & sewer overflow
    BROKEN_STREETLIGHT = "BROKEN_STREETLIGHT"            # Streetlights that repeatedly fail
    OPEN_MANHOLE_HAZARDS = "OPEN_MANHOLE_HAZARDS"        # Open manholes & physical safety hazards
    OTHERS = "OTHERS"                                    # Other civic problems

class PriorityTier(str, Enum):
    P1_CRITICAL = "P1_CRITICAL"   # 4 hours SLA
    P2_HIGH = "P2_HIGH"           # 12 hours SLA
    P3_MEDIUM = "P3_MEDIUM"       # 24 hours SLA
    P4_LOW = "P4_LOW"             # 72 hours SLA

class IncidentStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    AWAITING_CITIZEN_CONFIRMATION = "AWAITING_CITIZEN_CONFIRMATION"
    DISPUTED = "DISPUTED"
    CLOSED = "CLOSED"

class EvidenceConfidenceTier(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    SUSPICIOUS = "SUSPICIOUS"

class LocationConsistency(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ImageQuality(str, Enum):
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"

# --- Sub-models ---

class BoundingBox(BaseModel):
    label: str
    confidence: float
    x: float
    y: float
    width: float
    height: float
    severity_note: str

class VideoFrame(BaseModel):
    frame_index: int
    timestamp_offset_sec: float
    image_url: str
    blur_score: float
    detections: List[BoundingBox] = []

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    actor: str
    actor_role: str
    action: str
    details: str
    cryptographic_hash: str

class XAIFactorBreakdown(BaseModel):
    base_severity: int = Field(..., description="Base defect size & severity contribution")
    proximity_penalty: int = Field(..., description="School/Hospital buffer proximity penalty")
    traffic_importance: int = Field(..., description="Road hierarchy traffic penalty")
    worsening_trend: int = Field(..., description="Consecutive reports / worsening trend")
    total_risk_score: int
    summary_narrative: str
    deduplication_reason: Optional[str] = None
    jurisdiction_rule: str

class BeforeAfterVerification(BaseModel):
    before_image_url: str
    after_image_url: str
    officer_id: str
    officer_name: str
    uploaded_at: str
    ssim_score: float
    repair_verification_score: float # e.g. 91.0
    hazard_resolved: bool
    citizen_feedback_status: str # "PENDING", "CONFIRMED", "DISPUTED"
    citizen_dispute_reason: Optional[str] = None

class CitizenReport(BaseModel):
    id: str
    reporter_alias: str
    phone_masked: str
    submitted_at: str
    latitude: float
    longitude: float
    media_url: str
    media_type: str # "VIDEO" or "PHOTO"
    extracted_frames: List[VideoFrame] = []
    
    # Audio NLP
    original_audio_script: Optional[str] = None
    detected_language: Optional[str] = None # "en", "hi", "or", "bn"
    translated_english_text: Optional[str] = None
    extracted_urgency_keywords: List[str] = []
    
    # Authenticity & Fraud
    phash: str
    evidence_confidence: float # 0-100%
    evidence_tier: EvidenceConfidenceTier
    location_consistency: LocationConsistency
    image_quality: ImageQuality
    flagged_for_human_review: bool
    review_reason: Optional[str] = None

class MasterIncident(BaseModel):
    id: str
    tracking_number: str # e.g. "CP102"
    title: str
    category: IncidentCategory
    priority: PriorityTier
    risk_score: int # 0-100
    status: IncidentStatus
    latitude: float
    longitude: float
    address_display: str
    zone_id: int
    zone_name: str
    assigned_department: str
    
    # SLA Management
    sla_hours: int
    sla_deadline: str
    sla_breached: bool
    created_at: str
    updated_at: str
    
    # Aggregated Citizen Intelligence
    report_count: int
    community_upvotes: int
    duplicate_match_confidence: float
    reports: List[CitizenReport]
    
    # XAI & Audit
    xai: XAIFactorBreakdown
    audit_logs: List[AuditLogEntry]
    
    # Closed-loop Verification
    repair_verification: Optional[BeforeAfterVerification] = None

class MunicipalZone(BaseModel):
    zone_id: int
    zone_code: str
    zone_name: str
    boundary_coordinates: List[List[float]] # Polygon lat/lon coordinates
    responsible_department: str
    ward_officer: str
    contact_phone: str

class KPIGridSummary(BaseModel):
    """Strictly 6 core municipal metrics - NO average resolution time!"""
    total_reports: int = 1250
    verified_incidents: int = 840
    duplicate_reports_merged: int = 310
    pending_incidents: int = 120
    critical_incidents: int = 18
    resolved_incidents: int = 720

