import sys
import os

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add root and civicpulse paths to sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CIVICPULSE_DIR = os.path.join(ROOT_DIR, "civicpulse")

for path in [ROOT_DIR, CIVICPULSE_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("[CIVICPULSE] Starting Autonomous AI Backend...")
    print("  * Local URL:     http://localhost:8000")
    print("  * API Docs:      http://localhost:8000/docs")
    print("  * WebSocket:     ws://localhost:8000/ws/live-feed")
    print("=" * 60 + "\n", flush=True)

    try:
        from civicpulse.backend.main import app
    except ImportError:
        from backend.main import app

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
