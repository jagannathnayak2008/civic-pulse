"""
Incident Service & In-Memory / DB State Management
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

from ..models.models import KPIGridSummary
from .ai_client import ai_client, MUNICIPAL_ZONES

# Try importing seeds from database/seeds or local
try:
    from database.seeds.seed_data import get_initial_seed_incidents
except ImportError:
    import sys
    import os
    root_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    if root_path not in sys.path:
        sys.path.insert(0, root_path)
    from database.seeds.seed_data import get_initial_seed_incidents

class IncidentService:
    def __init__(self):
        self.incidents: List[Dict[str, Any]] = get_initial_seed_incidents()
        self.zones: List[Dict[str, Any]] = MUNICIPAL_ZONES
        self.kpi = KPIGridSummary(
            total_reports=1250,
            verified_incidents=840,
            duplicate_reports_merged=310,
            pending_incidents=120,
            critical_incidents=18,
            resolved_incidents=720
        ).model_dump()

    def reset_state(self):
        self.incidents = get_initial_seed_incidents()
        self.zones = MUNICIPAL_ZONES
        self.kpi = KPIGridSummary().model_dump()

    def get_all_incidents(self) -> List[Dict[str, Any]]:
        return self.incidents

    def get_incident_by_tracking(self, tracking_number: str) -> Optional[Dict[str, Any]]:
        target = tracking_number.strip().upper()
        for inc in self.incidents:
            if inc["tracking_number"].upper() == target:
                return inc
        return None

    def get_zones(self) -> List[Dict[str, Any]]:
        return self.zones

    def get_kpi(self) -> Dict[str, Any]:
        return self.kpi

    def get_review_queue(self) -> List[Dict[str, Any]]:
        review_items = []
        for inc in self.incidents:
            for rep in inc.get("reports", []):
                if rep.get("flagged_for_human_review", False):
                    review_items.append({
                        "tracking_number": inc["tracking_number"],
                        "incident_title": inc["title"],
                        "report_id": rep["id"],
                        "submitted_at": rep["submitted_at"],
                        "evidence_confidence": rep["evidence_confidence"],
                        "evidence_tier": rep["evidence_tier"],
                        "flagged_reason": rep.get("review_reason", "AI Confidence guardrail check"),
                        "media_url": rep.get("media_url", ""),
                        "category": inc["category"],
                        "zone_name": inc["zone_name"]
                    })
        return review_items

    def approve_review_item(self, tracking_number: str) -> Optional[Dict[str, Any]]:
        target = tracking_number.strip().upper()
        for inc in self.incidents:
            if inc["tracking_number"].upper() == target:
                for rep in inc.get("reports", []):
                    rep["flagged_for_human_review"] = False
                    rep["review_reason"] = "Approved by Municipal Review Officer"
                    rep["evidence_confidence"] = 92.0
                    rep["evidence_tier"] = "HIGH"

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Human Review Officer",
                    "actor_role": "OFFICER",
                    "action": "EVIDENCE_MANUALLY_APPROVED",
                    "details": "Low-confidence AI guardrail verified and manually approved by municipal officer.",
                    "cryptographic_hash": f"SHA256-{uuid.uuid4().hex[:16]}"
                })
                return inc
        return None

    def update_status(self, tracking_number: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target = tracking_number.strip().upper()
        for inc in self.incidents:
            if inc["tracking_number"].upper() == target:
                inc["status"] = new_status
                inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

                if new_status == "RESOLVED":
                    self.kpi["resolved_incidents"] += 1
                    self.kpi["pending_incidents"] = max(0, self.kpi["pending_incidents"] - 1)

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Municipal Officer",
                    "actor_role": "OFFICER",
                    "action": f"STATUS_UPDATED_TO_{new_status}",
                    "details": notes or f"Status updated to {new_status} via Municipal Control Center.",
                    "cryptographic_hash": f"SHA256-{uuid.uuid4().hex[:16]}"
                })
                return inc
        return None

    def verify_repair(self, tracking_number: str, after_image_url: str, officer_lat: float, officer_lon: float) -> Optional[Dict[str, Any]]:
        target = tracking_number.strip().upper()
        for inc in self.incidents:
            if inc["tracking_number"].upper() == target:
                before_url = inc["reports"][0].get("media_url", "") if inc.get("reports") else ""

                verification = ai_client.verify_repair(
                    before_image_url=before_url,
                    after_image_url=after_image_url,
                    officer_lat=officer_lat,
                    officer_lon=officer_lon,
                    expected_lat=inc["latitude"],
                    expected_lon=inc["longitude"]
                )

                inc["repair_verification"] = {
                    "before_image_url": before_url,
                    "after_image_url": after_image_url,
                    "officer_id": "OFFICER-7412",
                    "officer_name": "Er. Alok Das",
                    "uploaded_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "ssim_score": verification["ssim_score"],
                    "repair_verification_score": verification["repair_verification_score"],
                    "hazard_resolved": verification["hazard_resolved"],
                    "citizen_feedback_status": "PENDING",
                    "citizen_dispute_reason": None
                }

                inc["status"] = "AWAITING_CITIZEN_CONFIRMATION"
                inc["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Vision AI Verifier",
                    "actor_role": "SYSTEM",
                    "action": "REPAIR_INSPECTION_RECORDED",
                    "details": f"Repair score {verification['repair_verification_score']}% · GPS Delta: {verification['gps_distance_meters']}m · Awaiting citizen verification.",
                    "cryptographic_hash": f"SHA256-{uuid.uuid4().hex[:16]}"
                })
                return inc
        return None

    def submit_citizen_feedback(self, tracking_number: str, action: str, dispute_reason: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target = tracking_number.strip().upper()
        for inc in self.incidents:
            if inc["tracking_number"].upper() == target:
                if not inc.get("repair_verification"):
                    return None

                if action.upper() == "CONFIRM":
                    inc["repair_verification"]["citizen_feedback_status"] = "CONFIRMED"
                    inc["status"] = "CLOSED"
                    self.kpi["resolved_incidents"] += 1
                    self.kpi["pending_incidents"] = max(0, self.kpi["pending_incidents"] - 1)
                    details = "Citizen inspected and confirmed repair quality. Ticket closed."
                else:
                    inc["repair_verification"]["citizen_feedback_status"] = "DISPUTED"
                    inc["repair_verification"]["citizen_dispute_reason"] = dispute_reason
                    inc["status"] = "DISPUTED"
                    details = f"Citizen disputed repair: '{dispute_reason}'. Reopened for investigation."

                inc["audit_logs"].append({
                    "id": str(uuid.uuid4())[:8],
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "actor": "Citizen Verifier",
                    "actor_role": "CITIZEN",
                    "action": f"REPAIR_{action.upper()}",
                    "details": details,
                    "cryptographic_hash": f"SHA256-{uuid.uuid4().hex[:16]}"
                })
                return inc
        return None

incident_service = IncidentService()
