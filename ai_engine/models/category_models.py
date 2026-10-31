"""
AI Model Definitions, Categories, Priority Weights, and Thresholds
"""

from typing import Dict, Any, List

CIVIC_CATEGORIES: List[str] = [
    "POTHOLE_ROAD_DAMAGE",
    "GARBAGE_OVERFLOW",
    "PUBLIC_TOILET_ISSUES",
    "WATERLOGGING",
    "DRAINAGE_WATER_LEAKAGE",
    "BROKEN_STREETLIGHT",
    "OPEN_MANHOLE_HAZARDS",
    "OTHERS"
]

PRIORITY_SLA_HOURS: Dict[str, int] = {
    "P1": 4,   # Immediate / Life Safety
    "P2": 12,  # High Priority
    "P3": 24,  # Moderate Priority
    "P4": 72   # Routine Maintenance
}

AI_CONFIDENCE_THRESHOLDS: Dict[str, float] = {
    "min_evidence_confidence": 70.0,
    "spatial_cluster_radius_meters": 35.0,
    "repair_verification_min_score": 85.0,
    "gps_tolerance_meters": 30.0
}

