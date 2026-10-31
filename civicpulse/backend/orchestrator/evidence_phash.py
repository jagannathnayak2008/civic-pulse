"""
Evidence Authenticity & Fraud Detection Engine
Perceptual Hashing (pHash), EXIF Inspection, Blur Analysis, and Guardrails.
"""

from typing import Dict, Any, Optional

class EvidenceAuthenticityEngine:
    def __init__(self):
        # Known existing pHash registry to catch recycled images
        self.known_phashes = {
            "a8f0c2394e1d5b7a": "CP089_GARBAGE_RECYCLED_FRAUD",
            "d4e7a1b9c3f50286": "CP042_STOCK_INTERNET_PHOTO"
        }

    def evaluate_evidence(
        self,
        simulated_phash: str = "3f8a9c1e7b2d5a40",
        blur_score: float = 145.0,
        has_exif: bool = True,
        exif_gps_match: bool = True,
        is_recycled_test: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluates authenticity and trustworthiness of uploaded media.
        Never auto-rejects; flags for human review if confidence < 70%.
        """
        if is_recycled_test:
            simulated_phash = "a8f0c2394e1d5b7a"

        # 1. pHash Duplication / Fraud Check against unrelated historical tickets
        is_recycled = simulated_phash in self.known_phashes
        
        # 2. Image Quality & Blur
        if blur_score >= 80.0:
            quality = "GOOD"
            quality_penalty = 0.0
        elif blur_score >= 40.0:
            quality = "FAIR"
            quality_penalty = 15.0
        else:
            quality = "POOR"
            quality_penalty = 35.0

        # 3. Location Consistency
        if has_exif and exif_gps_match:
            loc_consistency = "HIGH"
            loc_penalty = 0.0
        elif has_exif and not exif_gps_match:
            loc_consistency = "LOW"
            loc_penalty = 30.0
        else:
            loc_consistency = "MEDIUM"
            loc_penalty = 10.0

        # 4. Calculate Final Evidence Confidence (0-100%)
        base_confidence = 98.0
        if is_recycled:
            base_confidence -= 50.0

        final_score = max(5.0, min(100.0, base_confidence - quality_penalty - loc_penalty))
        
        if final_score >= 80.0:
            tier = "HIGH"
        elif final_score >= 60.0:
            tier = "MEDIUM"
        elif final_score >= 40.0:
            tier = "LOW"
        else:
            tier = "SUSPICIOUS"

        # Human-in-the-loop Guardrail
        flagged_for_human_review = final_score < 70.0 or is_recycled or (loc_consistency == "LOW")
        review_reason = None
        if is_recycled:
            review_reason = "pHash exact duplicate detected from an unrelated past incident (potential recycled photo)."
        elif loc_consistency == "LOW":
            review_reason = "EXIF device coordinates differ significantly from user-submitted map coordinates."
        elif final_score < 70.0:
            review_reason = f"Evidence confidence ({final_score:.1f}%) below 70% threshold due to image quality or metadata degradation."

        return {
            "phash": simulated_phash,
            "evidence_confidence": round(final_score, 1),
            "evidence_tier": tier,
            "location_consistency": loc_consistency,
            "image_quality": quality,
            "blur_score": blur_score,
            "flagged_for_human_review": flagged_for_human_review,
            "review_reason": review_reason
        }

evidence_engine = EvidenceAuthenticityEngine()

