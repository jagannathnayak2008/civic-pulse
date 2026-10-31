"""
CivicPulse FastAPI Application Entrypoint & Modular Router Assembly
Strict negative constraints applied:
- NO average resolution time
- NO predictive analytics / predictive civic intelligence
- NO digital twin / 2D or 3D city model visualization
"""

import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .middleware.cors import setup_cors
from .api.routes import (
    auth_router,
    incident_router,
    municipal_router,
    websocket_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="End-to-end AI platform for civic verification, deduplication, routing, and resolution.",
    version=settings.VERSION
)

# Apply CORS
setup_cors(app)

# Mount static images for preview evidence
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_IMG_DIRS = [
    os.path.join(BASE_DIR, "images"),
    os.path.join(BASE_DIR, "uploads"),
    os.path.join(os.path.dirname(BASE_DIR), "civicpulse", "backend", "images")
]

for img_dir in STATIC_IMG_DIRS:
    if os.path.exists(img_dir):
        app.mount("/images", StaticFiles(directory=img_dir), name="images")
        break

# Include Decoupled Routers
app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(municipal_router)
app.include_router(websocket_router)

@app.get("/")
def root():
    return {
        "platform": "CivicPulse Autonomous Incident Verifier",
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

