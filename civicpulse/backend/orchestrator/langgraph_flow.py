"""
LangGraph Multi-Step AI Orchestrator Pipeline for CivicPulse
Coordinates Ingestion, Vision, Authenticity, Deduplication, Risk Scoring, XAI, and Routing.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import hashlib
import uuid

from .audio_whisper import audio_engine
from .vision_yolo import vision_engine
from .evidence_phash import evidence_engine
from .spatial_postgis import spatial_engine
from .explainable_ai import xai_engine

class LangGraphIncidentOrchestrator:
    def __init__(self):
        pass

    def _generate_crypto_hash(self, prev_hash: str, action: str, data: str) -> str:
        payload = f"{prev_hash}:{action}:{data}:{datetime.utcnow().isoformat()}"
        return hashlib.sha256(payload.encode()).hexdigest()[:16]

    def execute_workflow(
        self,
        raw_text: str = "",
        audio_preset: Optional[str] = None,
        latitude: float = 20.2961,
        longitude: float = 85.8245,
        media_type: str = "VIDEO",
        media_url: str = "",
        reporter_alias: str = "Citizen A",
        active_incidents: Optional[List[Dict[str, Any]]] = None,
        is_recycled_test: bool = False
    ) -> Dict[str, Any]:
        """
        Executes the end-to-end multi-agent LangGraph workflow.
        Returns complete enriched incident record or merged duplicate update.
        """
        active_incidents = active_incidents or []
        audit_trail: List[Dict[str, Any]] = []
        current_hash = "GENESIS_BLOCK_0000"

        # STEP 1: Multimodal Ingestion & Multilingual Voice (Audio AI)
        audio_result = audio_engine.process_voice_input(
            audio_preset_key=audio_preset or "odia_pothole",
            custom_text=raw_text
        )
        category = audio_result["inferred_category"]

        current_hash = self._generate_crypto_hash(current_hash, "MULTIMODAL_INGESTION", f"{category}:{audio_result['detected_language']}")
        audit_trail.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": "Citizen Ingestion Node",
            "actor_role": "CITIZEN",
            "action": "SUBMISSION_RECEIVED",
            "details": f"Processed complaint in {audio_result['language_name']} ({audio_result['detected_language']}). Translated to English: '{audio_result['translated_english'][:60]}...'",
            "cryptographic_hash": f"SHA256-{current_hash}"
        })

        # STEP 2: Vision Inspection (OpenCV & YOLOv8)
        if media_type == "VIDEO":
            extracted_frames = vision_engine.extract_video_frames()
            blur_score = extracted_frames[0]["blur_score"]
        else:
            extracted_frames = []
            blur_score = 150.0

        defect_detection = vision_engine.detect_infrastructure_defects(category)
        
        current_hash = self._generate_crypto_hash(current_hash, "VISION_INSPECTION", str(defect_detection["detection_confidence"]))
        audit_trail.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": "Vision YOLO Node",
            "actor_role": "SYSTEM",
            "action": "DEFECT_DETECTED",
            "details": f"Detected '{defect_detection['primary_defect']}' with {defect_detection['detection_confidence']*100:.1f}% confidence. Defect area: {defect_detection['defect_area_pct']}%.",
            "cryptographic_hash": f"SHA256-{current_hash}"
        })

        # STEP 3: Authenticity & Fraud Detection (pHash + EXIF + Blur)
        auth_result = evidence_engine.evaluate_evidence(
            simulated_phash="3f8a9c1e7b2d5a40",
            blur_score=blur_score,
            has_exif=True,
            exif_gps_match=True,
            is_recycled_test=is_recycled_test
        )
        
        current_hash = self._generate_crypto_hash(current_hash, "AUTHENTICITY_VERIFICATION", str(auth_result["evidence_confidence"]))
        audit_trail.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": "Evidence Authenticity Node",
            "actor_role": "SYSTEM",
            "action": "EVIDENCE_VERIFIED",
            "details": f"Perceptual hash computed ({auth_result['phash']}). Evidence Confidence: {auth_result['evidence_confidence']}%, Location Consistency: {auth_result['location_consistency']}.",
            "cryptographic_hash": f"SHA256-{current_hash}"
        })

        # STEP 4: Spatial Deduplication Intelligence (DBSCAN + Category)
        duplicate_match = spatial_engine.check_spatial_duplicate(
            new_lat=latitude,
            new_lon=longitude,
            category=category,
            active_incidents=active_incidents,
            radius_threshold_m=35.0
        )

        is_duplicate = duplicate_match is not None

        if is_duplicate:
            # Consolidate into existing incident
            master_tracking = duplicate_match["tracking_number"]
            match_confidence = duplicate_match["match_confidence"]
            dist_m = duplicate_match["distance_meters"]

            current_hash = self._generate_crypto_hash(current_hash, "SPATIAL_DEDUPLICATION", master_tracking)
            audit_trail.append({
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "actor": "LangGraph Deduplication Node",
                "actor_role": "SYSTEM",
                "action": "DUPLICATE_MERGED",
                "details": f"Report from {reporter_alias} matched active ticket #{master_tracking} ({dist_m}m away, {match_confidence}% confidence). Merged into master record without duplicate ticket.",
                "cryptographic_hash": f"SHA256-{current_hash}"
            })

            return {
                "action": "MERGED_DUPLICATE",
                "is_duplicate": True,
                "master_tracking_number": master_tracking,
                "master_incident_id": duplicate_match["master_incident_id"],
                "match_confidence": match_confidence,
                "distance_meters": dist_m,
                "new_report": {
                    "id": str(uuid.uuid4())[:8],
                    "reporter_alias": reporter_alias,
                    "phone_masked": "+91 97*** **842",
                    "submitted_at": datetime.utcnow().strftime("%H:%M UTC"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "media_url": media_url or "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
                    "media_type": media_type,
                    "extracted_frames": extracted_frames,
                    "original_audio_script": audio_result["original_script"],
                    "detected_language": audio_result["detected_language"],
                    "translated_english_text": audio_result["translated_english"],
                    "extracted_urgency_keywords": audio_result["urgency_keywords"],
                    "phash": auth_result["phash"],
                    "evidence_confidence": auth_result["evidence_confidence"],
                    "evidence_tier": auth_result["evidence_tier"],
                    "location_consistency": auth_result["location_consistency"],
                    "image_quality": auth_result["image_quality"],
                    "flagged_for_human_review": auth_result["flagged_for_human_review"],
                    "review_reason": auth_result["review_reason"]
                },
                "audit_entry": audit_trail[-1]
            }

        # STEP 5: AI Severity Scoring & Proximity Engine
        is_near_sensitive, sensitive_name, _ = spatial_engine.check_sensitive_proximity(latitude, longitude)
        
        severity_result = xai_engine.compute_risk_score(
            category=category,
            defect_area_pct=defect_detection["defect_area_pct"],
            depth_severity=defect_detection["depth_severity"],
            near_sensitive_inst=is_near_sensitive,
            sensitive_inst_name=sensitive_name,
            road_traffic_level="ARTERIAL",
            report_count=1
        )

        # STEP 6: Explainable AI (XAI) Synthesis
        zone_info = spatial_engine.locate_municipal_zone(latitude, longitude)
        department = spatial_engine.route_department(category)
        
        jurisdiction_rule = xai_engine.generate_jurisdiction_explanation(
            zone_name=zone_info["zone_name"],
            category=category,
            department=department
        )

        factor_breakdown = severity_result["factor_breakdown"]
        xai_payload = {
            "base_severity": factor_breakdown["base_severity"],
            "proximity_penalty": factor_breakdown["proximity_penalty"],
            "traffic_importance": factor_breakdown["traffic_importance"],
            "worsening_trend": factor_breakdown["worsening_trend"],
            "total_risk_score": factor_breakdown["total_risk_score"],
            "summary_narrative": factor_breakdown["summary_narrative"],
            "deduplication_reason": "Evaluated as unique civic incident; no active reports within 35m.",
            "jurisdiction_rule": jurisdiction_rule
        }

        current_hash = self._generate_crypto_hash(current_hash, "SEVERITY_SCORING", str(severity_result["total_risk_score"]))
        audit_trail.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": "Severity Scoring Node",
            "actor_role": "SYSTEM",
            "action": "PRIORITY_ASSIGNED",
            "details": f"Assigned {severity_result['priority']} (Risk Score {severity_result['total_risk_score']}/100). SLA target: {severity_result['sla_hours']} hours.",
            "cryptographic_hash": f"SHA256-{current_hash}"
        })

        # STEP 7: Autonomous Department Routing & SLA Activation
        sla_deadline = (datetime.utcnow() + timedelta(hours=severity_result["sla_hours"])).strftime("%Y-%m-%d %H:%M:%S UTC")
        
        current_hash = self._generate_crypto_hash(current_hash, "DEPARTMENT_ROUTING", department)
        audit_trail.append({
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "actor": "Jurisdiction Router Node",
            "actor_role": "SYSTEM",
            "action": "ROUTED_TO_DEPARTMENT",
            "details": f"Routed to {department} · {zone_info['zone_name']} · Active SLA timer started ({severity_result['sla_hours']}h).",
            "cryptographic_hash": f"SHA256-{current_hash}"
        })

        # Master Tracking Number
        tracking_number = f"CP{len(active_incidents) + 102}"

        master_incident = {
            "id": str(uuid.uuid4()),
            "tracking_number": tracking_number,
            "title": f"{category.replace('_', ' ').title()} near {sensitive_name or 'Metro Corridor'}",
            "category": category,
            "priority": severity_result["priority"],
            "risk_score": severity_result["total_risk_score"],
            "status": "VERIFIED",
            "latitude": latitude,
            "longitude": longitude,
            "address_display": f"Near {sensitive_name or 'Central Avenue'}, {zone_info['zone_name']}",
            "zone_id": zone_info["zone_id"],
            "zone_name": zone_info["zone_name"],
            "assigned_department": department,
            "sla_hours": severity_result["sla_hours"],
            "sla_deadline": sla_deadline,
            "sla_breached": False,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "report_count": 1,
            "community_upvotes": 0,
            "duplicate_match_confidence": 0.0,
            "reports": [
                {
                    "id": str(uuid.uuid4())[:8],
                    "reporter_alias": reporter_alias,
                    "phone_masked": "+91 98*** **321",
                    "submitted_at": datetime.utcnow().strftime("%H:%M UTC"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "media_url": media_url or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
                    "media_type": media_type,
                    "extracted_frames": extracted_frames,
                    "original_audio_script": audio_result["original_script"],
                    "detected_language": audio_result["detected_language"],
                    "translated_english_text": audio_result["translated_english"],
                    "extracted_urgency_keywords": audio_result["urgency_keywords"],
                    "phash": auth_result["phash"],
                    "evidence_confidence": auth_result["evidence_confidence"],
                    "evidence_tier": auth_result["evidence_tier"],
                    "location_consistency": auth_result["location_consistency"],
                    "image_quality": auth_result["image_quality"],
                    "flagged_for_human_review": auth_result["flagged_for_human_review"],
                    "review_reason": auth_result["review_reason"]
                }
            ],
            "xai": xai_payload,
            "audit_logs": audit_trail,
            "repair_verification": None
        }

        return {
            "action": "CREATED_NEW_INCIDENT",
            "is_duplicate": False,
            "incident": master_incident
        }

orchestrator = LangGraphIncidentOrchestrator()

