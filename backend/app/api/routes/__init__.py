from .auth_routes import router as auth_router
from .incident_routes import router as incident_router
from .municipal_routes import router as municipal_router
from .websocket_routes import router as websocket_router, ws_manager

__all__ = [
    "auth_router",
    "incident_router",
    "municipal_router",
    "websocket_router",
    "ws_manager"
]
