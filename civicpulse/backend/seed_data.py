"""
Seed Data for CivicPulse
Pre-populates Municipal Zones 1-5, Flagship Incident #CP102, and initial 6 KPI metrics.
Strict negative constraints applied:
- NO average resolution time
- NO predictive analytics / predictive civic intelligence
- NO digital twin
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta

from .orchestrator.spatial_postgis import MUNICIPAL_ZONES
from .orchestrator.vision_yolo import vision_engine

def get_initial_seed_incidents() -> List[Dict[str, Any]]:
    # Flagship Incident #CP102 (P1 Critical Road Crater with 2 Merged Citizen Reports)
    cp102_frames = vision_engine.extract_video_frames()
    
    cp102 = {
        "id": "cp-102-master-uuid",
        "tracking_number": "CP102",
        "title": "Severe Road Crater & Waterlogging near St. Xavier Model High School",
        "category": "POTHOLE_ROAD_DAMAGE",
        "priority": "P1_CRITICAL",
        "risk_score": 92,
        "status": "IN_PROGRESS",
        "latitude": 20.2961,
        "longitude": 85.8245,
        "address_display": "Opposite St. Xavier Model High School, Metro Boulevard, Zone 3",
        "zone_id": 3,
        "zone_name": "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
        "assigned_department": "Road Maintenance Department",
        "sla_hours": 4,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=3, minutes=15)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 2,
        "community_upvotes": 14,
        "duplicate_match_confidence": 96.0,
        "reports": [
            {
                "id": "rep-001",
                "reporter_alias": "Citizen A (Priyanka M.)",
                "phone_masked": "+91 98*** **321",
                "submitted_at": "10:00 AM",
                "latitude": 20.2961,
                "longitude": 85.8245,
                "media_url": "/images/road_pothole_before.jpg",
                "media_type": "VIDEO",
                "extracted_frames": cp102_frames,
                "original_audio_script": "ରାସ୍ତାରେ ଏକ ବଡ଼ ଗାତ ହୋଇଛି, ପାଣି ଜମି ରହିଛି ଏବଂ ସ୍କୁଲ ପାଖରେ ଗାଡ଼ି ଚଳାଚଳରେ ବିପଦ ସୃଷ୍ଟି ହେଉଛି।",
                "detected_language": "or",
                "translated_english_text": "There is a deep crater pothole on the road with stagnant water, creating severe hazard for school transit.",
                "extracted_urgency_keywords": ["ବଡ଼ ଗାତ (large crater)", "ପାଣି ଜମି (waterlogged)", "ସ୍କୁଲ ପାଖରେ (near school)", "ବିପଦ (severe hazard)"],
                "phash": "3f8a9c1e7b2d5a40",
                "evidence_confidence": 96.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            },
            {
                "id": "rep-002",
                "reporter_alias": "Citizen B (Debashis R.)",
                "phone_masked": "+91 97*** **842",
                "submitted_at": "10:20 AM",
                "latitude": 20.2962,
                "longitude": 85.8246,
                "media_url": "/images/road_pothole_angle2.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Same huge pothole seen from south sidewalk, school vans are swerving into oncoming traffic lane.",
                "detected_language": "en",
                "translated_english_text": "Same huge pothole seen from south sidewalk, school vans are swerving into oncoming traffic lane.",
                "extracted_urgency_keywords": ["school vans swerving", "oncoming traffic", "huge pothole"],
                "phash": "3f8a9c1e7b2d5a42",
                "evidence_confidence": 94.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 35,
            "proximity_penalty": 25,
            "traffic_importance": 20,
            "worsening_trend": 12,
            "total_risk_score": 92,
            "summary_narrative": "Calculated P1 CRITICAL Risk Score (92/100). Contributing factors: +35 Base Pothole Severity (1.8m crater, 94% YOLO confidence), +25 School Zone Proximity (<200m to St. Xavier Model High School), +20 Arterial Road Traffic, +12 Worsening Trend from 2 consecutive citizen reports.",
            "deduplication_reason": "Merged Citizen Report A (10:00 AM) and Citizen Report B (10:20 AM): 14m GPS distance via DBSCAN, 89% visual feature overlap, and 20-min timestamp delta.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 3 Polygon. Category 'Road Damage' routes automatically to Road Maintenance Department."
        },
        "audit_logs": [
            {
                "id": "log-001",
                "timestamp": "2026-10-31 10:00:15 UTC",
                "actor": "Citizen A (Priyanka M.)",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Uploaded road damage video with Odia voice note at coordinates (20.2961, 85.8245).",
                "cryptographic_hash": "SHA256-e9b41a3f8c2d10e5"
            },
            {
                "id": "log-002",
                "timestamp": "2026-10-31 10:00:22 UTC",
                "actor": "Vision YOLO Node",
                "actor_role": "SYSTEM",
                "action": "DEFECT_DETECTED",
                "details": "YOLOv8 detected deep road void (94% confidence, 14.8% frame area).",
                "cryptographic_hash": "SHA256-4a7b2c9e1d8f30aa"
            },
            {
                "id": "log-003",
                "timestamp": "2026-10-31 10:00:30 UTC",
                "actor": "Severity Scoring Node",
                "actor_role": "SYSTEM",
                "action": "PRIORITY_ASSIGNED",
                "details": "AI Risk Score: 92/100. Assigned P1_CRITICAL (4-hour SLA). Emergency escalation triggered.",
                "cryptographic_hash": "SHA256-7f8e1d2c3b4a5960"
            },
            {
                "id": "log-004",
                "timestamp": "2026-10-31 10:00:35 UTC",
                "actor": "Jurisdiction Router Node",
                "actor_role": "SYSTEM",
                "action": "ROUTED_TO_DEPARTMENT",
                "details": "Routed to Road Maintenance Department (Municipal Zone 3). Zonal Chief Engineer notified.",
                "cryptographic_hash": "SHA256-11ac92ef8834db02"
            },
            {
                "id": "log-005",
                "timestamp": "2026-10-31 10:20:45 UTC",
                "actor": "LangGraph Deduplication Node",
                "actor_role": "SYSTEM",
                "action": "DUPLICATE_MERGED",
                "details": "Citizen B report merged into #CP102 (14m GPS distance, 96% match confidence). Reports consolidated (2 -> 1).",
                "cryptographic_hash": "SHA256-88d4fe3109ab76cc"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/road_pothole_before.jpg",
            "after_image_url": "/images/road_pothole_after.jpg",
            "officer_id": "OFFICER-ZN3-01",
            "officer_name": "Er. Alok Das (Chief Zonal Engineer)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.94,
            "repair_verification_score": 96.5,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP103: Garbage Overflow in Zone 2
    cp103 = {
        "id": "cp-103-master-uuid",
        "tracking_number": "CP103",
        "title": "Severe Solid Waste Overflow on Market Street Pedestrian Path",
        "category": "GARBAGE_OVERFLOW",
        "priority": "P2_HIGH",
        "risk_score": 74,
        "status": "ASSIGNED",
        "latitude": 20.2985,
        "longitude": 85.8290,
        "address_display": "Opposite Saheed Nagar Daily Market, Zone 2",
        "zone_id": 2,
        "zone_name": "Municipal Zone 2 — Saheed Nagar Residential Sector",
        "assigned_department": "Sanitation Department",
        "sla_hours": 12,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=9, minutes=40)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 1,
        "community_upvotes": 7,
        "duplicate_match_confidence": 0.0,
        "reports": [
            {
                "id": "rep-003",
                "reporter_alias": "Citizen C (Ramesh S.)",
                "phone_masked": "+91 99*** **112",
                "submitted_at": "08:15 AM",
                "latitude": 20.2985,
                "longitude": 85.8290,
                "media_url": "/images/garbage_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "मेन मार्केट के सामने कचरे का बहुत बड़ा ढेर लगा है, बदबू आ रही है।",
                "detected_language": "hi",
                "translated_english_text": "There is a massive overflow of rotten garbage opposite main market, causing stench and attracting stray animals.",
                "extracted_urgency_keywords": ["कचरे का ढेर", "बदबू", "आवारा पशु"],
                "phash": "7c9b1a5e3d2f4088",
                "evidence_confidence": 92.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 30,
            "proximity_penalty": 20,
            "traffic_importance": 14,
            "worsening_trend": 10,
            "total_risk_score": 74,
            "summary_narrative": "P2 High Priority (74/100). Biological waste spillover blocking commercial footpath within 150m of public food stalls.",
            "deduplication_reason": "Evaluated as unique civic incident; no active reports within 35m.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 2. Category 'Garbage Overflow' routes to Sanitation Department."
        },
        "audit_logs": [
            {
                "id": "log-006",
                "timestamp": "2026-10-31 08:15:10 UTC",
                "actor": "Citizen C (Ramesh S.)",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Photo report with Hindi audio submitted in Zone 2.",
                "cryptographic_hash": "SHA256-55aa32c109df4421"
            },
            {
                "id": "log-007",
                "timestamp": "2026-10-31 08:15:30 UTC",
                "actor": "Jurisdiction Router Node",
                "actor_role": "SYSTEM",
                "action": "ROUTED_TO_DEPARTMENT",
                "details": "Assigned to Sanitation Department. 12h SLA timer running.",
                "cryptographic_hash": "SHA256-99bc4512e0fa3311"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/garbage_before.jpg",
            "after_image_url": "/images/garbage_after.jpg",
            "officer_id": "OFFICER-ZN2-04",
            "officer_name": "Er. Suresh Mohanty (Zonal Sanitation Inspector)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.94,
            "repair_verification_score": 96.5,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP104: Broken Streetlight in Zone 1 (Low Confidence Flagged for Human Review)
    cp104 = {
        "id": "cp-104-master-uuid",
        "tracking_number": "CP104",
        "title": "Broken Sodium Luminaire & Blackout on Old Heritage Walkway",
        "category": "BROKEN_STREETLIGHT",
        "priority": "P3_MEDIUM",
        "risk_score": 58,
        "status": "VERIFIED",
        "latitude": 20.2850,
        "longitude": 85.8150,
        "address_display": "Near Old Temple Gate, Heritage Corridor, Zone 1",
        "zone_id": 1,
        "zone_name": "Municipal Zone 1 — Old City & Heritage Corridor",
        "assigned_department": "Electrical Department",
        "sla_hours": 24,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=21)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 1,
        "community_upvotes": 3,
        "duplicate_match_confidence": 0.0,
        "reports": [
            {
                "id": "rep-004",
                "reporter_alias": "Citizen D (Ananya B.)",
                "phone_masked": "+91 94*** **555",
                "submitted_at": "07:30 AM",
                "latitude": 20.2850,
                "longitude": 85.8150,
                "media_url": "/images/streetlight_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "বাস স্টপের কাছে স্ট্রিট লাইট ৩ দিন ধরে বন্ধ, রাতে অন্ধকার রয়েছে।",
                "detected_language": "bn",
                "translated_english_text": "The street lamp near the bus stop has been broken for 3 days; total blackout poses safety risks for commuters.",
                "extracted_urgency_keywords": ["স্ট্রিট লাইট বন্ধ", "অন্ধকার", "বাস স্টপ"],
                "phash": "2a8e1b9f7c3d5501",
                "evidence_confidence": 68.0, # Below 70% -> Flagged for Human Review
                "evidence_tier": "LOW",
                "location_consistency": "HIGH",
                "image_quality": "FAIR",
                "flagged_for_human_review": True,
                "review_reason": "Evidence confidence (68.0%) below 70% threshold due to night glare and partial lighting occlusion.",
                "verified_by_officer": False
            }
        ],
        "xai": {
            "base_severity": 22,
            "proximity_penalty": 15,
            "traffic_importance": 12,
            "worsening_trend": 9,
            "total_risk_score": 58,
            "summary_narrative": "P3 Medium Priority (58/100). Luminaire failure causing walkway blackout. Flagged to Officer Queue due to low-confidence nighttime exposure.",
            "deduplication_reason": "Evaluated as unique civic incident; no active reports within 35m.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 1. Category 'Broken Streetlight' routes to Electrical Department."
        },
        "audit_logs": [
            {
                "id": "log-008",
                "timestamp": "2026-10-31 07:30:10 UTC",
                "actor": "Citizen D (Ananya B.)",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Night photo with Bengali audio submitted.",
                "cryptographic_hash": "SHA256-33ee4411bb22aa09"
            },
            {
                "id": "log-009",
                "timestamp": "2026-10-31 07:30:25 UTC",
                "actor": "Evidence Authenticity Node",
                "actor_role": "SYSTEM",
                "action": "FLAGGED_FOR_HUMAN_REVIEW",
                "details": "Confidence 68% < 70%. Routed to Human Review Queue in Command Center.",
                "cryptographic_hash": "SHA256-44dd5522cc33bb10"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/streetlight_before.jpg",
            "after_image_url": "/images/streetlight_after.jpg",
            "officer_id": "OFFICER-ZN1-03",
            "officer_name": "Er. Debendra Jena (Chief Electrical Inspector)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.92,
            "repair_verification_score": 94.8,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP101: Already Resolved Road Repair with Closed-Loop Before/After Verification
    cp101 = {
        "id": "cp-101-master-uuid",
        "tracking_number": "CP101",
        "title": "Asphalt Subsurface Crack Repair at Master Canteen Commercial Plaza",
        "category": "POTHOLE_ROAD_DAMAGE",
        "priority": "P2_HIGH",
        "risk_score": 68,
        "status": "RESOLVED",
        "latitude": 20.2780,
        "longitude": 85.8320,
        "address_display": "South Avenue Commercial Circle, Zone 5",
        "zone_id": 5,
        "zone_name": "Municipal Zone 5 — Master Canteen Commercial Plaza",
        "assigned_department": "Road Maintenance Department",
        "sla_hours": 12,
        "sla_deadline": (datetime.utcnow() - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 1,
        "community_upvotes": 19,
        "duplicate_match_confidence": 0.0,
        "reports": [
            {
                "id": "rep-005",
                "reporter_alias": "Citizen E (Vikram K.)",
                "phone_masked": "+91 93*** **774",
                "submitted_at": "Yesterday 06:00 PM",
                "latitude": 20.2780,
                "longitude": 85.8320,
                "media_url": "/images/road_pothole_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Deep pavement crack threatening bus corridor lane.",
                "detected_language": "en",
                "translated_english_text": "Deep pavement crack threatening bus corridor lane.",
                "extracted_urgency_keywords": ["pavement crack", "bus corridor"],
                "phash": "9f1b4a2e8c5d3310",
                "evidence_confidence": 95.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 28,
            "proximity_penalty": 18,
            "traffic_importance": 14,
            "worsening_trend": 8,
            "total_risk_score": 68,
            "summary_narrative": "P2 High Priority (68/100). Commercial plaza roadway fracture verified and repaired.",
            "deduplication_reason": "Evaluated as unique civic incident; no active reports within 35m.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 5. Assigned to Road Maintenance Department."
        },
        "audit_logs": [
            {
                "id": "log-010",
                "timestamp": "2026-10-30 18:00:00 UTC",
                "actor": "Citizen E",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Initial photo report submitted.",
                "cryptographic_hash": "SHA256-aa11bb22cc33dd44"
            },
            {
                "id": "log-011",
                "timestamp": "2026-10-31 06:15:00 UTC",
                "actor": "Officer Er. Smita Rout",
                "actor_role": "MUNICIPAL_OFFICER",
                "action": "REPAIR_PHOTO_UPLOADED",
                "details": "Uploaded post-repair asphalt patch photograph.",
                "cryptographic_hash": "SHA256-bb22cc33dd44ee55"
            },
            {
                "id": "log-012",
                "timestamp": "2026-10-31 06:15:20 UTC",
                "actor": "Vision AI Verifier",
                "actor_role": "SYSTEM",
                "action": "REPAIR_VERIFIED",
                "details": "AI Before/After Repair Verification: 94.2% score. Hazard resolved.",
                "cryptographic_hash": "SHA256-cc33dd44ee55ff66"
            },
            {
                "id": "log-013",
                "timestamp": "2026-10-31 06:40:00 UTC",
                "actor": "Citizen E (Vikram K.)",
                "actor_role": "CITIZEN",
                "action": "CITIZEN_CONFIRMED_RESOLUTION",
                "details": "Citizen confirmed repair satisfaction via Tracking Portal. Ticket CLOSED.",
                "cryptographic_hash": "SHA256-dd44ee55ff66aa77"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/road_pothole_before.jpg",
            "after_image_url": "/images/road_pothole_after.jpg",
            "officer_id": "OFFICER-ZN5-01",
            "officer_name": "Er. Smita Rout",
            "uploaded_at": "Today 06:15 AM",
            "ssim_score": 0.91,
            "repair_verification_score": 94.2,
            "hazard_resolved": True,
            "citizen_feedback_status": "CONFIRMED",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP105: Drainage Blockage in Zone 4 (Near Breach Warning)
    cp105 = {
        "id": "cp-105-master-uuid",
        "tracking_number": "CP105",
        "title": "Industrial Storm Drain Inundation & Hazardous Blackwater Pooling",
        "category": "DRAINAGE_WATER_LEAKAGE",
        "priority": "P2_HIGH",
        "risk_score": 79,
        "status": "IN_PROGRESS",
        "latitude": 20.3180,
        "longitude": 85.8420,
        "address_display": "Plot 42, Mancheswar Industrial Estate, Zone 4",
        "zone_id": 4,
        "zone_name": "Municipal Zone 4 — Mancheswar Logistics & Industrial Hub",
        "assigned_department": "Water and Drainage Department",
        "sla_hours": 12,
        "sla_deadline": (datetime.utcnow() + timedelta(minutes=25)).strftime("%Y-%m-%d %H:%M:%S UTC"), # < 30m left! Near breach
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=11, minutes=35)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 1,
        "community_upvotes": 11,
        "duplicate_match_confidence": 0.0,
        "reports": [
            {
                "id": "rep-006",
                "reporter_alias": "Citizen F (Manoj K.)",
                "phone_masked": "+91 91*** **889",
                "submitted_at": "11 hours ago",
                "latitude": 20.3180,
                "longitude": 85.8420,
                "media_url": "/images/drainage_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Storm drain overflowing with black sewage water after rain, flooding road corner.",
                "detected_language": "en",
                "translated_english_text": "Storm drain overflowing with black sewage water after rain, flooding road corner.",
                "extracted_urgency_keywords": ["storm drain", "black sewage", "flooding road"],
                "phash": "5b2e9a1c8f4d7702",
                "evidence_confidence": 91.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 32,
            "proximity_penalty": 20,
            "traffic_importance": 15,
            "worsening_trend": 12,
            "total_risk_score": 79,
            "summary_narrative": "P2 High Priority (79/100). Silt and chemical sludge backflow threatening freight logistics route. SLA near breach (< 30 mins remaining).",
            "deduplication_reason": "Evaluated as unique civic incident; no active reports within 35m.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 4. Category 'Drainage' routes to Water and Drainage Department."
        },
        "audit_logs": [
            {
                "id": "log-014",
                "timestamp": "2026-10-30 20:00:00 UTC",
                "actor": "Citizen F",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Drainage flooding reported in Zone 4.",
                "cryptographic_hash": "SHA256-ff77ee88dd99aa00"
            },
            {
                "id": "log-015",
                "timestamp": "2026-10-30 20:01:00 UTC",
                "actor": "Jurisdiction Router Node",
                "actor_role": "SYSTEM",
                "action": "ROUTED_TO_DEPARTMENT",
                "details": "Assigned to Water and Drainage Department. 12-hour SLA.",
                "cryptographic_hash": "SHA256-1122334455667788"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/drainage_before.jpg",
            "after_image_url": "/images/drainage_after.jpg",
            "officer_id": "OFFICER-ZN4-02",
            "officer_name": "Er. Bimal Patnaik (Zonal Drainage Engineer)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.93,
            "repair_verification_score": 95.8,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP106: Public Toilet Issues (Zone 2 - Saheed Nagar)
    cp106 = {
        "id": "cp-106-master-uuid",
        "tracking_number": "CP106",
        "title": "Recurring Public Toilet Sanitary Failure & Water Supply Choke",
        "category": "PUBLIC_TOILET_ISSUES",
        "priority": "P2_HIGH",
        "risk_score": 76,
        "status": "ASSIGNED",
        "latitude": 20.2970,
        "longitude": 85.8305,
        "address_display": "Public Convenience Complex, Saheed Nagar Park, Zone 2",
        "zone_id": 2,
        "zone_name": "Municipal Zone 2 — Saheed Nagar Residential Sector",
        "assigned_department": "Public Health & Sanitation Division",
        "sla_hours": 12,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 2,
        "community_upvotes": 16,
        "duplicate_match_confidence": 94.0,
        "reports": [
            {
                "id": "rep-007",
                "reporter_alias": "Citizen G (Sunil T.)",
                "phone_masked": "+91 98*** **401",
                "submitted_at": "06:30 AM",
                "latitude": 20.2970,
                "longitude": 85.8305,
                "media_url": "/images/toilet_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Public toilet has broken flush valve and severe sewage overflow, unusable for park visitors.",
                "detected_language": "en",
                "translated_english_text": "Public toilet has broken flush valve and severe sewage overflow, unusable for park visitors.",
                "extracted_urgency_keywords": ["broken flush", "sewage overflow", "public toilet"],
                "phash": "3c7b9e1a2f4d6688",
                "evidence_confidence": 93.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 30,
            "proximity_penalty": 20,
            "traffic_importance": 14,
            "worsening_trend": 12,
            "total_risk_score": 76,
            "summary_narrative": "P2 High Priority (76/100). Severe biological sanitation hazard in public utility facility near children's park.",
            "deduplication_reason": "Merged with recurring facility maintenance cluster #CP106.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 2. Assigned to Public Health & Sanitation Division."
        },
        "audit_logs": [
            {
                "id": "log-016",
                "timestamp": "2026-10-31 06:30:00 UTC",
                "actor": "Citizen G",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Public toilet complaint filed.",
                "cryptographic_hash": "SHA256-44332211aabbccdd"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/toilet_before.jpg",
            "after_image_url": "/images/toilet_after.jpg",
            "officer_id": "OFFICER-ZN2-07",
            "officer_name": "Er. Rashmi Rekha Das (Public Health Officer)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.95,
            "repair_verification_score": 93.6,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP107: Waterlogging Hotspot (Zone 3 - Metro Corridor)
    cp107 = {
        "id": "cp-107-master-uuid",
        "tracking_number": "CP107",
        "title": "Severe Street Waterlogging (30cm Depth) Trapping Transit Traffic",
        "category": "WATERLOGGING",
        "priority": "P1_CRITICAL",
        "risk_score": 91,
        "status": "IN_PROGRESS",
        "latitude": 20.2940,
        "longitude": 85.8260,
        "address_display": "Metro Underpass Intersection, Zone 3",
        "zone_id": 3,
        "zone_name": "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
        "assigned_department": "Stormwater Management & Flood Unit",
        "sla_hours": 4,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=2, minutes=40)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=1, minutes=20)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(minutes=20)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 3,
        "community_upvotes": 28,
        "duplicate_match_confidence": 98.0,
        "reports": [
            {
                "id": "rep-008",
                "reporter_alias": "Citizen H (Anita P.)",
                "phone_masked": "+91 94*** **910",
                "submitted_at": "09:10 AM",
                "latitude": 20.2940,
                "longitude": 85.8260,
                "media_url": "/images/waterlogging_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Metro underpass flooded knee-deep, two auto-rickshaws stalled in water.",
                "detected_language": "en",
                "translated_english_text": "Metro underpass flooded knee-deep, two auto-rickshaws stalled in water.",
                "extracted_urgency_keywords": ["flooded knee-deep", "stalled auto-rickshaws", "waterlogging"],
                "phash": "1e9f4a2b8c5d7711",
                "evidence_confidence": 96.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 36,
            "proximity_penalty": 24,
            "traffic_importance": 20,
            "worsening_trend": 11,
            "total_risk_score": 91,
            "summary_narrative": "P1 Critical Emergency (91/100). Recurring monsoon waterlogging hotspot blocking arterial underpass with 30cm water depth.",
            "deduplication_reason": "Merged 3 citizen complaints into recurring hotspot cluster #CP107.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 3. Dispatched to Stormwater Management & Flood Unit."
        },
        "audit_logs": [
            {
                "id": "log-017",
                "timestamp": "2026-10-31 09:10:00 UTC",
                "actor": "Citizen H",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Waterlogging emergency reported.",
                "cryptographic_hash": "SHA256-5566778899aabbcc"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/waterlogging_before.jpg",
            "after_image_url": "/images/waterlogging_after.jpg",
            "officer_id": "OFFICER-ZN3-05",
            "officer_name": "Er. Kedar Panda (Stormwater Operations Lead)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.96,
            "repair_verification_score": 97.1,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    # Incident #CP108: Open Manhole Hazard (Zone 1 - Old City)
    cp108 = {
        "id": "cp-108-master-uuid",
        "tracking_number": "CP108",
        "title": "Uncovered Open Manhole Chamber on Pedestrian Walkway",
        "category": "OPEN_MANHOLE_HAZARDS",
        "priority": "P1_CRITICAL",
        "risk_score": 95,
        "status": "IN_PROGRESS",
        "latitude": 20.2820,
        "longitude": 85.8180,
        "address_display": "Near Heritage Market Lane, Zone 1",
        "zone_id": 1,
        "zone_name": "Municipal Zone 1 — Old City & Heritage Corridor",
        "assigned_department": "Emergency Civil Infrastructure Unit",
        "sla_hours": 4,
        "sla_deadline": (datetime.utcnow() + timedelta(hours=1, minutes=45)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sla_breached": False,
        "created_at": (datetime.utcnow() - timedelta(hours=2, minutes=15)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "updated_at": (datetime.utcnow() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "report_count": 2,
        "community_upvotes": 22,
        "duplicate_match_confidence": 97.0,
        "reports": [
            {
                "id": "rep-009",
                "reporter_alias": "Citizen I (Alok B.)",
                "phone_masked": "+91 93*** **118",
                "submitted_at": "08:15 AM",
                "latitude": 20.2820,
                "longitude": 85.8180,
                "media_url": "/images/manhole_before.jpg",
                "media_type": "PHOTO",
                "extracted_frames": [],
                "original_audio_script": "Open manhole cover stolen or broken, deep drop in middle of footpath.",
                "detected_language": "en",
                "translated_english_text": "Open manhole cover stolen or broken, deep drop in middle of footpath.",
                "extracted_urgency_keywords": ["open manhole", "deep drop", "fatal fall risk"],
                "phash": "2f8a9c1e7b4d5500",
                "evidence_confidence": 98.0,
                "evidence_tier": "HIGH",
                "location_consistency": "HIGH",
                "image_quality": "GOOD",
                "flagged_for_human_review": False,
                "review_reason": None
            }
        ],
        "xai": {
            "base_severity": 38,
            "proximity_penalty": 25,
            "traffic_importance": 20,
            "worsening_trend": 12,
            "total_risk_score": 95,
            "summary_narrative": "P1 Critical Safety Emergency (95/100). Uncovered 2-meter deep sewer chamber creating imminent fatal fall risk for pedestrians.",
            "deduplication_reason": "Merged into open manhole emergency ticket #CP108.",
            "jurisdiction_rule": "Coordinates fall inside Municipal Zone 1. Dispatched to Emergency Civil Infrastructure Unit."
        },
        "audit_logs": [
            {
                "id": "log-018",
                "timestamp": "2026-10-31 08:15:00 UTC",
                "actor": "Citizen I",
                "actor_role": "CITIZEN",
                "action": "SUBMISSION_RECEIVED",
                "details": "Open manhole hazard reported.",
                "cryptographic_hash": "SHA256-6677889900aabbcc"
            }
        ],
        "repair_verification": {
            "before_image_url": "/images/manhole_before.jpg",
            "after_image_url": "/images/manhole_after.jpg",
            "officer_id": "OFFICER-ZN1-09",
            "officer_name": "Er. Alok Das (Emergency Infrastructure Team)",
            "uploaded_at": "Today 10:45 AM",
            "ssim_score": 0.97,
            "repair_verification_score": 98.4,
            "hazard_resolved": True,
            "citizen_feedback_status": "PENDING",
            "citizen_dispute_reason": None
        }
    }

    return [cp102, cp103, cp104, cp105, cp106, cp107, cp108, cp101]

