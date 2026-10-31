"""
Municipal Authority & Dashboard Routes: Zones, KPIs, and Review Queue
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional

from ...services.incident_service import incident_service
from .websocket_routes import ws_manager

router = APIRouter(prefix="/api", tags=["Municipal Operations"])

@router.get("/zones")
async def get_municipal_zones():
    """Retrieve Municipal Zones 1-5 polygon boundaries and department contacts."""
    return incident_service.get_zones()

@router.get("/kpi")
async def get_kpi_summary():
    """Strictly 6 core municipal metrics (NO average resolution time)."""
    return incident_service.get_kpi()

@router.get("/review-queue")
async def get_review_queue():
    """Retrieve items flagged for human review by AI safety guardrail (< 70% confidence)."""
    return incident_service.get_review_queue()

@router.post("/review-queue/{tracking_number}/approve")
async def approve_review_queue_item(tracking_number: str):
    """Manually approve flagged low-confidence evidence."""
    updated = incident_service.approve_review_item(tracking_number)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found in review queue")

    await ws_manager.broadcast({
        "event": "REVIEW_ITEM_APPROVED",
        "tracking_number": tracking_number,
        "evidence_confidence": 92.0
    })

    return {"status": "SUCCESS", "tracking_number": tracking_number, "incident": updated}

