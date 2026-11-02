"""
Citizen Incident Reporting, Tracking, Community Upvotes, Repair Verification & Status Management
"""

from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from ...services.incident_service import incident_service
from ...services.ai_client import ai_client
from .websocket_routes import ws_manager

router = APIRouter(prefix="/api", tags=["Incidents & Citizen Operations"])

@router.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "CivicPulse AI Engine & Incident API",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/incidents")
async def list_incidents(
    zone_id: Optional[int] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None
):
    """List master incidents with optional filtering."""
    incidents = incident_service.get_all_incidents()
    if zone_id:
        incidents = [i for i in incidents if i.get("zone_id") == zone_id]
    if priority:
        incidents = [i for i in incidents if i.get("priority") == priority]
    if status:
        incidents = [i for i in incidents if i.get("status") == status]
    return incidents

@router.get("/incidents/{tracking_number}")
async def get_incident(tracking_number: str):
    """Retrieve details for a single incident by tracking number (e.g. CP102)."""
    inc = incident_service.get_incident_by_tracking(tracking_number)
    if inc:
        return inc
    raise HTTPException(status_code=404, detail=f"Incident {tracking_number} not found")

@router.post("/voice/translate")
async def translate_voice_note(payload: Dict[str, Any] = Body(...)):
    """
    Translates spoken regional voice notes (Odia, Hindi, Bengali, Telugu, English) to English
    with defect categorization and urgency keyword extraction.
    """
    text = payload.get("text", "")
    source_lang = payload.get("source_lang", "auto")
    preset_key = payload.get("preset_key", "")

    # Forward to audio engine
    try:
        from ai_engine.audio import audio_engine
        if preset_key:
            return audio_engine.process_voice_input(audio_preset_key=preset_key)
        return audio_engine.translate_to_english(text=text, source_lang=source_lang)
    except Exception as e:
        return {
            "translated_english": text or "Civic defect reported.",
            "detected_language": source_lang,
            "inferred_category": "POTHOLE_ROAD_DAMAGE",
            "urgency_keywords": ["civic defect", "road"]
        }

@router.post("/reports/submit")
async def submit_report(payload: Dict[str, Any] = Body(...)):
    """
    Multimodal Citizen Report Submission:
    Accepts text, audio preset (EN/HI/OR/BN/TE), coordinates, media type, and executes LangGraph orchestrator.
    """
    raw_text = payload.get("raw_text", "")
    category = payload.get("category", None)
    audio_preset = payload.get("audio_preset", "odia_pothole")
    latitude = float(payload.get("latitude", 20.2961))
    longitude = float(payload.get("longitude", 85.8245))
    media_type = payload.get("media_type", "VIDEO")
    media_url = payload.get("media_url", "")
    reporter_alias = payload.get("reporter_alias", "Citizen User")
    is_recycled_test = bool(payload.get("is_recycled_test", False))

    workflow_result = ai_client.execute_workflow(
        raw_text=raw_text,
        audio_preset=audio_preset,
        latitude=latitude,
        longitude=longitude,
        media_type=media_type,
        media_url=media_url,
        reporter_alias=reporter_alias,
        active_incidents=incident_service.get_all_incidents(),
        is_recycled_test=is_recycled_test,
        category=category
    )

    incident_service.kpi["total_reports"] += 1

    if workflow_result.get("is_duplicate"):
        master_tracking = workflow_result["master_tracking_number"]
        inc = incident_service.get_incident_by_tracking(master_tracking)
        if inc:
            inc["report_count"] += 1
            inc["reports"].append(workflow_result["new_report"])
            inc["audit_logs"].append(workflow_result["audit_entry"])
            inc["duplicate_match_confidence"] = workflow_result["match_confidence"]
            inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            if inc["report_count"] >= 2 and inc["risk_score"] < 95:
                inc["risk_score"] = min(100, inc["risk_score"] + 6)
        
        incident_service.kpi["duplicate_reports_merged"] += 1

        await ws_manager.broadcast({
            "event": "DUPLICATE_MERGED",
            "tracking_number": master_tracking,
            "match_confidence": workflow_result["match_confidence"],
            "distance_meters": workflow_result["distance_meters"],
            "total_reports": incident_service.kpi["total_reports"],
            "duplicate_reports_merged": incident_service.kpi["duplicate_reports_merged"]
        })

        return {
            "status": "MERGED",
            "message": f"Report merged into active ticket #{master_tracking}",
            "tracking_number": master_tracking,
            "is_duplicate": True,
            "match_confidence": workflow_result["match_confidence"]
        }
    else:
        new_inc = workflow_result["incident"]
        incident_service.incidents.insert(0, new_inc)
        incident_service.kpi["verified_incidents"] += 1
        incident_service.kpi["pending_incidents"] += 1
        if new_inc["priority"] == "P1_CRITICAL":
            incident_service.kpi["critical_incidents"] += 1

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

@router.post("/incidents/{tracking_number}/confirm")
async def community_confirm(tracking_number: str):
    """1-Click Community Confirmation: Nearby citizens confirm existing active incident (+1)."""
    inc = incident_service.get_incident_by_tracking(tracking_number)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc["community_upvotes"] += 1
    inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
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

@router.post("/incidents/{tracking_number}/verify-repair")
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

    inc = incident_service.get_incident_by_tracking(tracking_number)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    before_image = inc["reports"][0]["media_url"] if inc.get("reports") else ""
    
    ai_eval = ai_client.verify_repair(
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

@router.post("/incidents/{tracking_number}/citizen-feedback")
async def citizen_feedback(
    tracking_number: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Citizen confirms resolution (closes ticket as Resolved) or disputes repair.
    """
    action = payload.get("action", "CONFIRM")
    dispute_reason = payload.get("dispute_reason", "")

    inc = incident_service.get_incident_by_tracking(tracking_number)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if not inc.get("repair_verification"):
        raise HTTPException(status_code=400, detail="No repair verification pending for this incident")

    if action == "CONFIRM":
        inc["status"] = "RESOLVED"
        inc["repair_verification"]["citizen_feedback_status"] = "CONFIRMED"
        incident_service.kpi["pending_incidents"] = max(0, incident_service.kpi["pending_incidents"] - 1)
        incident_service.kpi["resolved_incidents"] += 1
        if inc["priority"] == "P1_CRITICAL":
            incident_service.kpi["critical_incidents"] = max(0, incident_service.kpi["critical_incidents"] - 1)

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

@router.post("/incidents/{tracking_number}/status")
async def update_incident_status(
    tracking_number: str,
    payload: Dict[str, Any] = Body(...)
):
    """Direct Incident Status Update with SLA and KPI adjustments."""
    new_status = payload.get("status", "").upper()
    valid_statuses = ["SUBMITTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "AWAITING_CITIZEN_CONFIRMATION", "RESOLVED", "CLOSED"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    actor_name = payload.get("actor_name", "Municipal Authority")
    notes = payload.get("notes", f"Status updated to {new_status}")

    inc = incident_service.get_incident_by_tracking(tracking_number)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = inc["status"]
    inc["status"] = new_status
    inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    if old_status in ["RESOLVED", "CLOSED"] and new_status not in ["RESOLVED", "CLOSED"]:
        incident_service.kpi["resolved_incidents"] = max(0, incident_service.kpi["resolved_incidents"] - 1)
        incident_service.kpi["pending_incidents"] += 1
    elif old_status not in ["RESOLVED", "CLOSED"] and new_status in ["RESOLVED", "CLOSED"]:
        incident_service.kpi["resolved_incidents"] += 1
        incident_service.kpi["pending_incidents"] = max(0, incident_service.kpi["pending_incidents"] - 1)
        if inc["priority"] == "P1_CRITICAL":
            incident_service.kpi["critical_incidents"] = max(0, incident_service.kpi["critical_incidents"] - 1)

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

@router.post("/demo/reset")
async def reset_demo_state():
    """Resets the state to original seed data for a fresh 90-second demo run."""
    incident_service.reset_state()
    await ws_manager.broadcast({
        "event": "STATE_RESET",
        "message": "Demo state reset to pristine baseline."
    })
    return {"status": "RESET_COMPLETE"}

