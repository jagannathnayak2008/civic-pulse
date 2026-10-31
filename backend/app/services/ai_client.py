"""
AI Client Bridge
Supports both direct in-process Python execution and decoupled HTTP microservice communication.
"""

from typing import Dict, Any, List, Optional
import urllib.request
import json

from ..core.config import settings

# Attempt in-process import
try:
    from ai_engine import orchestrator, vision_engine, MUNICIPAL_ZONES
except ImportError:
    import sys
    import os
    # Add root to sys.path if not present
    root_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    if root_path not in sys.path:
        sys.path.insert(0, root_path)
    from ai_engine import orchestrator, vision_engine, MUNICIPAL_ZONES

class AIClient:
    def __init__(self):
        self.remote_url = settings.AI_ENGINE_URL

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
        """Runs the LangGraph verification pipeline."""
        if self.remote_url:
            try:
                url = f"{self.remote_url.rstrip('/')}/api/ai/execute-workflow"
                payload = json.dumps({
                    "raw_text": raw_text,
                    "audio_preset": audio_preset,
                    "latitude": latitude,
                    "longitude": longitude,
                    "media_type": media_type,
                    "media_url": media_url,
                    "reporter_alias": reporter_alias,
                    "active_incidents": active_incidents or [],
                    "is_recycled_test": is_recycled_test
                }).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except Exception as e:
                print(f"[AIClient] Warning: Remote AI microservice failed ({e}), falling back to in-process AI engine.")

        # In-process execution
        return orchestrator.execute_workflow(
            raw_text=raw_text,
            audio_preset=audio_preset,
            latitude=latitude,
            longitude=longitude,
            media_type=media_type,
            media_url=media_url,
            reporter_alias=reporter_alias,
            active_incidents=active_incidents,
            is_recycled_test=is_recycled_test
        )

    def verify_repair(
        self,
        before_image_url: str,
        after_image_url: str,
        officer_lat: float,
        officer_lon: float,
        expected_lat: float,
        expected_lon: float
    ) -> Dict[str, Any]:
        """Runs the vision repair verification."""
        if self.remote_url:
            try:
                url = f"{self.remote_url.rstrip('/')}/api/ai/verify-repair"
                payload = json.dumps({
                    "before_image_url": before_image_url,
                    "after_image_url": after_image_url,
                    "officer_lat": officer_lat,
                    "officer_lon": officer_lon,
                    "expected_lat": expected_lat,
                    "expected_lon": expected_lon
                }).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except Exception as e:
                print(f"[AIClient] Warning: Remote repair verifier failed ({e}), falling back to in-process.")

        return vision_engine.verify_repair_closure(
            before_image_url,
            after_image_url,
            officer_lat,
            officer_lon,
            expected_lat,
            expected_lon
        )

ai_client = AIClient()

