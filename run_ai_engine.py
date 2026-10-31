import sys
import os

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("[CIVICPULSE] Starting Standalone AI Engine Microservice...")
    print("  * Service URL:   http://localhost:8001")
    print("  * Health Check:  http://localhost:8001/health")
    print("  * API Docs:      http://localhost:8001/docs")
    print("=" * 60 + "\n", flush=True)

    uvicorn.run("ai_engine.services.ai_service:app", host="0.0.0.0", port=8001, reload=True, log_level="info")

