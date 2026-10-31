"""
CivicPulse Modular AI Engine
Provides Vision, Audio, pHash, Spatial PostGIS, XAI, and LangGraph Orchestration.
"""

from .vision import vision_engine
from .audio import audio_engine
from .duplicate_detection import evidence_engine
from .geospatial import spatial_engine, MUNICIPAL_ZONES
from .severity_assessment import xai_engine
from .orchestration import orchestrator

__all__ = [
    "vision_engine",
    "audio_engine",
    "evidence_engine",
    "spatial_engine",
    "MUNICIPAL_ZONES",
    "xai_engine",
    "orchestrator"
]

