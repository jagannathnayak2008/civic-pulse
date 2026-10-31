"""
Standalone AI Engine Microservice Runner
Exposes REST endpoints for Vision, Audio, pHash, Spatial Deduplication, and LangGraph Workflow.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

from ..vision import vision_engine
from ..audio import audio_engine
from ..duplicate_detection import evidence_engine
from ..geospatial import spatial_engine, MUNICIPAL_ZONES
from ..severity_assessment import xai_engine
from ..orchestration import orchestrator

app = FastAPI(
    title="CivicPulse AI Engine Microservice",
    description="Standalone inference and verification service for CivicPulse",
    version="1.0.0"
)

class WorkflowExecutionRequest(BaseModel):
    raw_text: str = ""
    audio_preset: Optional[str] = None
    latitude: float = 20.2961
    longitude: float = 85.8245
    media_type: str = "VIDEO"
    media_url: str = ""
    reporter_alias: str = "Citizen"
    active_incidents: Optional[List[Dict[str, Any]]] = None
    is_recycled_test: bool = False

class RepairVerifyRequest(BaseModel):
    before_image_url: str
    after_image_url: str
    officer_lat: float
    officer_lon: float
    expected_lat: float
    expected_lon: float

@app.get("/health")
def health():
    return {"status": "healthy", "service": "civicpulse-ai-engine"}

@app.post("/api/ai/execute-workflow")
def execute_workflow(payload: WorkflowExecutionRequest):
    result = orchestrator.execute_workflow(
        raw_text=payload.raw_text,
        audio_preset=payload.audio_preset,
        latitude=payload.latitude,
        longitude=payload.longitude,
        media_type=payload.media_type,
        media_url=payload.media_url,
        reporter_alias=payload.reporter_alias,
        active_incidents=payload.active_incidents,
        is_recycled_test=payload.is_recycled_test
    )
    return result

@app.post("/api/ai/verify-repair")
def verify_repair(payload: RepairVerifyRequest):
    return vision_engine.verify_repair_closure(
        payload.before_image_url,
        payload.after_image_url,
        payload.officer_lat,
        payload.officer_lon,
        payload.expected_lat,
        payload.expected_lon
    )

if __name__ == "__main__":
    uvicorn.run("ai_engine.services.ai_service:app", host="0.0.0.0", port=8001, reload=True)
