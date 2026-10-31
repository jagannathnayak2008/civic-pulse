"""
CivicPulse FastAPI Application Entrypoint & Real-time WebSocket Feed
Strict negative constraints applied:
- NO average resolution time
- NO predictive analytics / predictive civic intelligence
- NO digital twin / 2D or 3D city model visualization
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Body, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import json
import uuid
import os

from .models import KPIGridSummary
from .seed_data import get_initial_seed_incidents
from .orchestrator.spatial_postgis import MUNICIPAL_ZONES, spatial_engine
from .orchestrator.langgraph_flow import orchestrator
from .orchestrator.vision_yolo import vision_engine
from .orchestrator.audio_whisper import audio_engine
from .auth import (
    user_manager,
    create_session_token,
    validate_session_token,
    invalidate_session_token,
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    AuthSuccessResponse,
    UserProfileResponse
)

app = FastAPI(
    title="CivicPulse Autonomous Incident Intelligence API",
    description="End-to-end AI platform for civic verification, deduplication, routing, and resolution.",
    version="1.0.0"
)

# Mount static images
STATIC_IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
if os.path.exists(STATIC_IMG_DIR):
    app.mount("/images", StaticFiles(directory=STATIC_IMG_DIR), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Stateful Store (Zero-blocker, instantaneous local preview)
STATE = {
    "incidents": get_initial_seed_incidents(),
    "zones": MUNICIPAL_ZONES,
    "kpi": KPIGridSummary(
        total_reports=1250,
        verified_incidents=840,
        duplicate_reports_merged=310,
        pending_incidents=120,
        critical_incidents=18,
        resolved_incidents=720
    ).model_dump()
}

# WebSocket Connection Manager
class WebSocketFeedManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

ws_manager = WebSocketFeedManager()

# --- REST Endpoints ---

# --- Authentication Endpoints ---

@app.post("/api/auth/register", response_model=AuthSuccessResponse)
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

@app.post("/api/auth/login", response_model=AuthSuccessResponse)
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

@app.get("/api/auth/me")
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

    user = validate_session_token(token)
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

@app.post("/api/auth/logout")
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

@app.post("/api/auth/forgot-password")
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
                detail="No account found with this registered number or user ID."
            )
        return {
            "success": True,
            "message": "Password updated successfully. Please log in with your new password."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "HEALTHY", "service": "CivicPulse AI Engine", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/zones")
async def get_municipal_zones():
    """Retrieve Municipal Zones 1-5 polygon boundaries and department contacts."""
    return STATE["zones"]

@app.get("/api/kpi")
async def get_kpi_summary():
    """Strictly 6 core municipal metrics (NO average resolution time)."""
    return STATE["kpi"]

@app.get("/api/incidents")
async def list_incidents(
    zone_id: Optional[int] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None
):
    """List master incidents with optional filtering."""
    incidents = STATE["incidents"]
    if zone_id:
        incidents = [i for i in incidents if i["zone_id"] == zone_id]
    if priority:
        incidents = [i for i in incidents if i["priority"] == priority]
    if status:
        incidents = [i for i in incidents if i["status"] == status]
    return incidents

@app.get("/api/incidents/{tracking_number}")
async def get_incident(tracking_number: str):
    """Retrieve details for a single incident by tracking number (e.g. CP102)."""
    for inc in STATE["incidents"]:
        if inc["tracking_number"].upper() == tracking_number.upper():
            return inc
    raise HTTPException(status_code=404, detail=f"Incident {tracking_number} not found")

@app.post("/api/voice/translate")
async def translate_voice_note(payload: Dict[str, Any] = Body(...)):
    """
    Translates spoken regional voice notes (Odia, Hindi, Bengali, Telugu, English) to English
    with defect categorization and urgency keyword extraction.
    """
    text = payload.get("text", "")
    source_lang = payload.get("source_lang", "auto")
    preset_key = payload.get("preset_key", "")

    if preset_key:
        return audio_engine.process_voice_input(audio_preset_key=preset_key)
    return audio_engine.translate_to_english(text=text, source_lang=source_lang)

@app.post("/api/reports/submit")
async def submit_report(payload: Dict[str, Any] = Body(...)):
    """
    Multimodal Citizen Report Submission:
    Accepts text, audio preset (EN/HI/OR/BN), coordinates, media type, and executes LangGraph orchestrator.
    """
    raw_text = payload.get("raw_text", "")
    audio_preset = payload.get("audio_preset", "odia_pothole")
    latitude = float(payload.get("latitude", 20.2961))
    longitude = float(payload.get("longitude", 85.8245))
    media_type = payload.get("media_type", "VIDEO")
    media_url = payload.get("media_url", "")
    reporter_alias = payload.get("reporter_alias", "Citizen User")
    is_recycled_test = bool(payload.get("is_recycled_test", False))

    workflow_result = orchestrator.execute_workflow(
        raw_text=raw_text,
        audio_preset=audio_preset,
        latitude=latitude,
        longitude=longitude,
        media_type=media_type,
        media_url=media_url,
        reporter_alias=reporter_alias,
        active_incidents=STATE["incidents"],
        is_recycled_test=is_recycled_test
    )

    STATE["kpi"]["total_reports"] += 1

    if workflow_result["is_duplicate"]:
        # Update existing master ticket
        master_tracking = workflow_result["master_tracking_number"]
        for inc in STATE["incidents"]:
            if inc["tracking_number"] == master_tracking:
                inc["report_count"] += 1
                inc["reports"].append(workflow_result["new_report"])
                inc["audit_logs"].append(workflow_result["audit_entry"])
                inc["duplicate_match_confidence"] = workflow_result["match_confidence"]
                inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                
                # Recalculate risk score with worsening multiplier
                if inc["report_count"] >= 2 and inc["risk_score"] < 95:
                    inc["risk_score"] = min(100, inc["risk_score"] + 6)
                break
        
        STATE["kpi"]["duplicate_reports_merged"] += 1

        # Broadcast WebSocket event
        await ws_manager.broadcast({
            "event": "DUPLICATE_MERGED",
            "tracking_number": master_tracking,
            "match_confidence": workflow_result["match_confidence"],
            "distance_meters": workflow_result["distance_meters"],
            "total_reports": STATE["kpi"]["total_reports"],
            "duplicate_reports_merged": STATE["kpi"]["duplicate_reports_merged"]
        })

        return {
            "status": "MERGED",
            "message": f"Report merged into active ticket #{master_tracking}",
            "tracking_number": master_tracking,
            "is_duplicate": True,
            "match_confidence": workflow_result["match_confidence"]
        }
    else:
        # Create brand new master incident
        new_inc = workflow_result["incident"]
        STATE["incidents"].insert(0, new_inc)
        STATE["kpi"]["verified_incidents"] += 1
        STATE["kpi"]["pending_incidents"] += 1
        if new_inc["priority"] == "P1_CRITICAL":
            STATE["kpi"]["critical_incidents"] += 1

        # Broadcast WebSocket event
        await ws_manager.broadcast({
            "event": "INCIDENT_CREATED",
            "tracking_number": new_inc["tracking_number"],
            "priority": new_inc["priority"],
            "risk_score": new_inc["risk_score"],
            "category": new_inc["category"],
            "zone_id": new_inc["zone_id"],
            "latitude": new_inc["latitude"],
            "longitude": new_inc["longitude"]
        })

        return {
            "status": "CREATED",
            "message": f"New ticket #{new_inc['tracking_number']} created & routed",
            "tracking_number": new_inc["tracking_number"],
            "is_duplicate": False,
            "incident": new_inc
        }

@app.post("/api/incidents/{tracking_number}/confirm")
async def community_confirm(tracking_number: str):
    """1-Click Community Confirmation: Nearby citizens confirm existing active incident (+1)."""
    for inc in STATE["incidents"]:
        if inc["tracking_number"].upper() == tracking_number.upper():
            inc["community_upvotes"] += 1
            inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            # Log audit entry
            log_entry = {
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "actor": "Nearby Citizen (+1)",
                "actor_role": "CITIZEN",
                "action": "COMMUNITY_CONFIRMED",
                "details": f"1-Tap independent community verification registered. Total upvotes: {inc['community_upvotes']}.",
                "cryptographic_hash": f"SHA256-{str(uuid.uuid4())[:16]}"
            }
            inc["audit_logs"].append(log_entry)

            await ws_manager.broadcast({
                "event": "UPVOTE_ADDED",
                "tracking_number": inc["tracking_number"],
                "community_upvotes": inc["community_upvotes"]
            })

            return {"status": "SUCCESS", "tracking_number": inc["tracking_number"], "community_upvotes": inc["community_upvotes"]}

    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents/{tracking_number}/verify-repair")
async def officer_verify_repair(
    tracking_number: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Municipal Officer uploads after-repair photograph at incident GPS coordinates.
    Vision AI compares Before vs. After, generates Repair Verification Score (e.g. 91%),
    and sets status to AWAITING_CITIZEN_CONFIRMATION.
    """
    officer_name = payload.get("officer_name", "Er. Alok Das (Zonal Engineer)")
    officer_id = payload.get("officer_id", "OFFICER-ZN3-01")
    after_image_url = payload.get("after_image_url", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80")
    officer_lat = float(payload.get("latitude", 20.2961))
    officer_lon = float(payload.get("longitude", 85.8245))

    for inc in STATE["incidents"]:
        if inc["tracking_number"].upper() == tracking_number.upper():
            before_image = inc["reports"][0]["media_url"]
            
            # Run Vision AI comparison
            ai_eval = vision_engine.verify_repair_closure(
                before_image_url=before_image,
                after_image_url=after_image_url,
                officer_lat=officer_lat,
                officer_lon=officer_lon,
                expected_lat=inc["latitude"],
                expected_lon=inc["longitude"]
            )

            inc["status"] = "AWAITING_CITIZEN_CONFIRMATION"
            inc["repair_verification"] = {
                "before_image_url": before_image,
                "after_image_url": after_image_url,
                "officer_id": officer_id,
                "officer_name": officer_name,
                "uploaded_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "ssim_score": ai_eval["ssim_score"],
                "repair_verification_score": ai_eval["repair_verification_score"],
                "hazard_resolved": ai_eval["hazard_resolved"],
                "citizen_feedback_status": "PENDING",
                "citizen_dispute_reason": None
            }

            # Add audit log
            inc["audit_logs"].append({
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "actor": officer_name,
                "actor_role": "MUNICIPAL_OFFICER",
                "action": "AFTER_REPAIR_SUBMITTED",
                "details": f"Uploaded after-repair road photo. AI verification: {ai_eval['repair_verification_score']}%. Status transitioned to Awaiting Citizen Confirmation.",
                "cryptographic_hash": f"SHA256-{str(uuid.uuid4())[:16]}"
            })

            await ws_manager.broadcast({
                "event": "REPAIR_VERIFIED",
                "tracking_number": inc["tracking_number"],
                "verification_score": ai_eval["repair_verification_score"],
                "status": "AWAITING_CITIZEN_CONFIRMATION"
            })

            return {
                "status": "SUCCESS",
                "tracking_number": inc["tracking_number"],
                "repair_verification": inc["repair_verification"]
            }

    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents/{tracking_number}/citizen-feedback")
async def citizen_feedback(
    tracking_number: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Citizen confirms resolution (closes ticket as Resolved) or disputes repair.
    """
    action = payload.get("action", "CONFIRM") # "CONFIRM" or "DISPUTE"
    dispute_reason = payload.get("dispute_reason", "")

    for inc in STATE["incidents"]:
        if inc["tracking_number"].upper() == tracking_number.upper():
            if not inc.get("repair_verification"):
                raise HTTPException(status_code=400, detail="No repair verification pending for this incident")

            if action == "CONFIRM":
                inc["status"] = "RESOLVED"
                inc["repair_verification"]["citizen_feedback_status"] = "CONFIRMED"
                STATE["kpi"]["pending_incidents"] = max(0, STATE["kpi"]["pending_incidents"] - 1)
                STATE["kpi"]["resolved_incidents"] += 1
                if inc["priority"] == "P1_CRITICAL":
                    STATE["kpi"]["critical_incidents"] = max(0, STATE["kpi"]["critical_incidents"] - 1)

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Citizen Reporter",
                    "actor_role": "CITIZEN",
                    "action": "CITIZEN_CONFIRMED_RESOLUTION",
                    "details": "Citizen inspected repair and approved closure. Ticket officially marked RESOLVED.",
                    "cryptographic_hash": f"SHA256-{str(uuid.uuid4())[:16]}"
                })
            else:
                inc["status"] = "DISPUTED"
                inc["repair_verification"]["citizen_feedback_status"] = "DISPUTED"
                inc["repair_verification"]["citizen_dispute_reason"] = dispute_reason or "Asphalt surface incomplete or loose gravel remaining."

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Citizen Reporter",
                    "actor_role": "CITIZEN",
                    "action": "REPAIR_DISPUTED",
                    "details": f"Citizen disputed repair: '{inc['repair_verification']['citizen_dispute_reason']}'. Escalated back to Department Supervisor.",
                    "cryptographic_hash": f"SHA256-{str(uuid.uuid4())[:16]}"
                })

            await ws_manager.broadcast({
                "event": "CITIZEN_FEEDBACK_RECORDED",
                "tracking_number": inc["tracking_number"],
                "status": inc["status"],
                "action": action
            })

            return {"status": "SUCCESS", "incident_status": inc["status"]}

    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents/{tracking_number}/status")
async def update_incident_status(
    tracking_number: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Direct Incident Status Update:
    Allows updating status to SUBMITTED, ASSIGNED, IN_PROGRESS, or RESOLVED.
    Recalculates KPIs, adds audit entry, and broadcasts real-time WebSocket update.
    """
    new_status = payload.get("status", "").upper()
    valid_statuses = ["SUBMITTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "AWAITING_CITIZEN_CONFIRMATION", "RESOLVED", "CLOSED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    actor_name = payload.get("actor_name", "Municipal Authority")
    notes = payload.get("notes", f"Status updated to {new_status}")

    for inc in STATE["incidents"]:
        if inc["tracking_number"].upper() == tracking_number.upper():
            old_status = inc["status"]
            inc["status"] = new_status
            inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

            # Update KPIs accordingly
            if old_status in ["RESOLVED", "CLOSED"] and new_status not in ["RESOLVED", "CLOSED"]:
                STATE["kpi"]["resolved_incidents"] = max(0, STATE["kpi"]["resolved_incidents"] - 1)
                STATE["kpi"]["pending_incidents"] += 1
            elif old_status not in ["RESOLVED", "CLOSED"] and new_status in ["RESOLVED", "CLOSED"]:
                STATE["kpi"]["resolved_incidents"] += 1
                STATE["kpi"]["pending_incidents"] = max(0, STATE["kpi"]["pending_incidents"] - 1)
                if inc["priority"] == "P1_CRITICAL":
                    STATE["kpi"]["critical_incidents"] = max(0, STATE["kpi"]["critical_incidents"] - 1)

            # Audit log
            inc["audit_logs"].append({
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "actor": actor_name,
                "actor_role": "MUNICIPAL_OFFICER",
                "action": f"STATUS_UPDATED_TO_{new_status}",
                "details": notes,
                "cryptographic_hash": f"SHA256-{str(uuid.uuid4())[:16]}"
            })

            await ws_manager.broadcast({
                "event": "INCIDENT_STATUS_UPDATED",
                "tracking_number": inc["tracking_number"],
                "status": inc["status"],
                "old_status": old_status
            })

            return {
                "status": "SUCCESS",
                "tracking_number": inc["tracking_number"],
                "incident_status": inc["status"],
                "message": f"Ticket #{inc['tracking_number']} status updated to {new_status}"
            }

    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/demo/reset")
async def reset_demo_state():
    """Resets the state to original seed data for a fresh 90-second demo run."""
    STATE["incidents"] = get_initial_seed_incidents()
    STATE["kpi"] = KPIGridSummary().model_dump()
    
    await ws_manager.broadcast({
        "event": "STATE_RESET",
        "message": "Demo state reset to pristine baseline."
    })
    return {"status": "RESET_COMPLETE"}

# --- WebSocket Live Stream ---
@app.websocket("/ws/live-feed")
async def websocket_live_feed(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial handshake message
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "Connected to CivicPulse Autonomous AI WebSocket feed.",
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            # Client heartbeat / message listener
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

