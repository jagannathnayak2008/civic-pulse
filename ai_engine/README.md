# CivicPulse AI Engine

Modular, decoupled AI pipeline powering autonomous civic incident verification, spatial deduplication, explainable AI (XAI), and closed-loop before/after repair verification.

---

## 🧩 Submodules

1. **`vision/`**:
   - `detection/`: YOLOv8 defect detection across 8 civic categories (potholes, garbage, toilets, waterlogging, drainage, streetlights, manholes, others).
   - `preprocessing/`: OpenCV frame extraction from citizen video clips and Laplacian blur variance filtering (> 40 quality threshold).
   - `inference/`: Structural similarity (SSIM) and GPS tolerance (< 30m) repair verification.
2. **`audio/`**:
   - Whisper ASR audio processing, language identification, zero-shot English translation, and phonetic dialect normalization (Odia, Hindi, Bengali, Telugu, English).
3. **`duplicate_detection/`**:
   - Perceptual hashing (`pHash`) and EXIF integrity checks to prevent fraud and recycled uploads.
4. **`geospatial/`**:
   - PostGIS polygon containment across Municipal Zones 1–5, sensitive institution buffers (schools/hospitals), and DBSCAN 35-meter radius deduplication.
5. **`severity_assessment/`**:
   - Explainable AI (XAI) transparent point breakdown computing 0–100 risk score and SLA assignment (P1: 4h, P2: 12h, P3: 24h, P4: 72h).
6. **`orchestration/`**:
   - Multi-step LangGraph verification pipeline coordinating all submodules with cryptographic SHA-256 audit chaining.

---

## 🚀 Execution Options

### Option A: Direct Python Import (Zero Latency)
The backend can import and execute the AI engine directly in-process:
```python
from ai_engine import orchestrator, vision_engine

result = orchestrator.execute_workflow(
    raw_text="Deep pothole on road",
    latitude=20.2961,
    longitude=85.8245
)
```

### Option B: Standalone Microservice (HTTP REST)
Run the AI engine as an independent microservice on port 8001:
```bash
python -m uvicorn ai_engine.services.ai_service:app --port 8001 --reload
```
API endpoints available:
- `POST /api/ai/execute-workflow`
- `POST /api/ai/verify-repair`
- `GET /health`

