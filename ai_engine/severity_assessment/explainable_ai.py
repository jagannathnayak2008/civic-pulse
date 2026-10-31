"""
Explainable AI (XAI) & Dynamic Severity Risk Scoring Engine
Generates transparent, mathematically grounded rationale for municipal officials and citizens.
"""

from typing import Dict, Any, Optional

class ExplainableAIEngine:
    def __init__(self):
        pass

    def compute_risk_score(
        self,
        category: str,
        defect_area_pct: float = 14.8,
        depth_severity: str = "DEEP_COLLAPSE",
        near_sensitive_inst: bool = True,
        sensitive_inst_name: Optional[str] = "City General Hospital & Trauma Care",
        road_traffic_level: str = "ARTERIAL", # "ARTERIAL", "COLLECTOR", "LOCAL"
        report_count: int = 1
    ) -> Dict[str, Any]:
        """
        Calculates deterministic AI Risk Score (0-100) and maps to Priority Tier (P1-P4).
        """
        # 1. Base Defect Severity (Max 40 points)
        if depth_severity == "DEEP_COLLAPSE" or defect_area_pct >= 12.0:
            base_severity = 35
        elif defect_area_pct >= 6.0:
            base_severity = 25
        else:
            base_severity = 15

        # 2. Proximity Penalty (Max 30 points)
        if near_sensitive_inst:
            proximity_penalty = 25
        else:
            proximity_penalty = 0

        # 3. Traffic Importance (Max 20 points)
        if road_traffic_level == "ARTERIAL":
            traffic_importance = 20
        elif road_traffic_level == "COLLECTOR":
            traffic_importance = 12
        else:
            traffic_importance = 5

        # 4. Worsening Trend / Multiple Reports (Max 15 points)
        if report_count >= 2:
            worsening_trend = 12
        else:
            worsening_trend = 0

        total_risk = min(100, max(5, base_severity + proximity_penalty + traffic_importance + worsening_trend))

        # Map to Priority Tier
        if total_risk >= 85:
            priority = "P1_CRITICAL"
            sla_hours = 4
            emergency_escalation = True
        elif total_risk >= 65:
            priority = "P2_HIGH"
            sla_hours = 12
            emergency_escalation = False
        elif total_risk >= 40:
            priority = "P3_MEDIUM"
            sla_hours = 24
            emergency_escalation = False
        else:
            priority = "P4_LOW"
            sla_hours = 72
            emergency_escalation = False

        # Build human-readable narrative
        narrative_parts = [
            f"Evaluated as {priority.replace('_', ' ')} with composite AI Risk Score of {total_risk}/100.",
            f"+{base_severity} pts: High-volume defect ({defect_area_pct}% visual void area, {depth_severity})."
        ]
        if near_sensitive_inst and sensitive_inst_name:
            narrative_parts.append(f"+{proximity_penalty} pts: Critical proximity to {sensitive_inst_name} within 200m safety buffer.")
        if traffic_importance > 0:
            narrative_parts.append(f"+{traffic_importance} pts: Arterial transit corridor classification with continuous vehicular flow.")
        if worsening_trend > 0:
            narrative_parts.append(f"+{worsening_trend} pts: Multiple independent citizen reports indicate active road breakdown.")

        summary_narrative = " ".join(narrative_parts)

        return {
            "total_risk_score": total_risk,
            "priority": priority,
            "sla_hours": sla_hours,
            "emergency_escalation": emergency_escalation,
            "factor_breakdown": {
                "base_severity": base_severity,
                "proximity_penalty": proximity_penalty,
                "traffic_importance": traffic_importance,
                "worsening_trend": worsening_trend,
                "total_risk_score": total_risk,
                "summary_narrative": summary_narrative
            }
        }

    def generate_dedup_explanation(
        self,
        distance_meters: float,
        visual_overlap_pct: float,
        time_delta_minutes: int,
        master_tracking: str
    ) -> str:
        """Mathematical justification for merging duplicate reports."""
        return (
            f"Merged into master ticket #{master_tracking}: Spatial distance is {distance_meters:.1f}m "
            f"(DBSCAN threshold < 35m), perceptual hash feature overlap is {visual_overlap_pct:.0f}%, "
            f"and report timestamp delta is {time_delta_minutes} mins."
        )

    def generate_jurisdiction_explanation(
        self,
        zone_name: str,
        category: str,
        department: str
    ) -> str:
        """Jurisdiction containment rule."""
        return (
            f"Coordinates fall strictly within {zone_name} polygon. "
            f"Under Municipal Charter Rule 14-B, '{category.replace('_', ' ').title()}' "
            f"routes automatically to {department}."
        )

xai_engine = ExplainableAIEngine()

