"""
Vision AI: YOLO Object Detection, Video Frame Extraction & Before/After Repair Verification
Combines detection, preprocessing, and inference verification.
"""

from typing import List, Dict, Any, Optional
from ..detection.yolo_detector import detector
from ..preprocessing.frame_extractor import frame_extractor
from .repair_verifier import repair_verifier

class VisionYOLOEngine:
    def __init__(self):
        self.detector = detector
        self.frame_extractor = frame_extractor
        self.repair_verifier = repair_verifier

    def extract_video_frames(
        self,
        video_name: str = "road_damage_citizen_a.mp4",
        num_frames: int = 4
    ) -> List[Dict[str, Any]]:
        return self.frame_extractor.extract_video_frames(video_name, num_frames)

    def detect_infrastructure_defects(
        self,
        category: str,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        return self.detector.detect_infrastructure_defects(category, image_url)

    def verify_repair_closure(
        self,
        before_image_url: str,
        after_image_url: str,
        officer_lat: float,
        officer_lon: float,
        expected_lat: float,
        expected_lon: float
    ) -> Dict[str, Any]:
        return self.repair_verifier.verify_repair_closure(
            before_image_url,
            after_image_url,
            officer_lat,
            officer_lon,
            expected_lat,
            expected_lon
        )

vision_engine = VisionYOLOEngine()
