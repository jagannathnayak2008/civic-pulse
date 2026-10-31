# CivicPulse — Autonomous Civic Incident Intelligence & Action Platform

> *"From Citizen Complaints to Verified Civic Action — An Autonomous AI Platform for Smarter Cities."*

CivicPulse is an end-to-end, zero-key, production-grade civic incident verification, deduplication, routing, and resolution platform built for advanced hackathons. It converts noisy, multi-channel citizen complaints into verified, prioritized municipal tickets with closed-loop repair verification.

---

## 1. System Architecture

```text
Citizen App (Photo / Video / Multilingual Voice / GPS)
                    │
                    ▼
FastAPI Ingestion Layer (Validation & Metadata Extraction)
                    │
                    ▼
Specialized AI Modules (Whisper, OpenCV, YOLOv8, pHash, PostGIS)
                    │
                    ▼
LangGraph Orchestrator (Deduplication, Risk Scoring, XAI, Routing)
                    │
                    ▼
Real-Time WebSocket Feed & State Synchronization
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
Citizen Tracking Portal    Civic Command Center
(5-Stage Progress,         (6 KPI Cards, Leaflet
 XAI, Repair Verifier)      P1-P4 Pins, SLA Boards)
```

---

## 2. Core AI Modules

- **Module 1: Multimodal Ingestion & Multilingual Voice (Whisper AI)**
  - Transcribes voice complaints in **English, Hindi, Odia, and Bengali**.
  - Extracts regional Indian dialect scripts and translates into standardized English internal summaries with extracted urgency keywords.
- **Module 2: Vision Inspector & AI Severity Scoring (OpenCV + YOLOv8)**
  - Samples 3–5 representative frames from video clips and measures Laplacian blur variance.
  - Detects infrastructure damage (potholes, garbage, streetlights, drainage) with bounding boxes and defect volume percentages.
- **Module 3: Evidence Authenticity & Fraud Detection (pHash + EXIF)**
  - Evaluates perceptual hash signatures against historical uploads to catch recycled photos.
  - Human review guardrail: Never auto-rejects based on low AI confidence; items with `< 70%` evidence confidence are routed to the Human Review Queue.
- **Module 4: Spatial Deduplication Intelligence (DBSCAN + Category)**
  - Clusters complaints within a **35-meter radius** with matching category and perceptual visual similarity.
  - Merges duplicates into a canonical master ticket (e.g., `#CP102`: 2 reports $\rightarrow$ 1 unique ticket, 96% match confidence).
- **Module 5: Autonomous Jurisdiction Routing & SLA Monitoring**
  - Mapped via deterministic PostGIS polygon boundaries across **Municipal Zones 1–5**.
  - Enforces priority-based SLA timers (P1: 4h, P2: 12h, P3: 24h, P4: 72h) with auto-escalation supervisor triggers.
- **Module 6: Closed-Loop Before/After Repair Verification**
  - Municipal officers upload an after-repair photo with on-site GPS validation (< 30m).
  - Vision AI computes a Repair Verification Score (91.4%) and requires citizen approval before closing the ticket.
- **Module 7: Explainable AI (XAI) & Cryptographic Audit Trails**
  - Transparent mathematical point breakdown for every risk score.
  - Chained cryptographic SHA-256 audit logs on every ticket transition.

---

## 3. Strict Negative Constraint Compliance

The codebase has been verified to contain **NO**:
- Average resolution time metrics
- Predictive analytics / predictive civic intelligence
- Digital twin / 2D or 3D city models

---

## 4. Quick Start (Zero External API Keys Required)

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Start the FastAPI Backend & Live WebSocket Feed
```bash
# From the root directory:
$env:PYTHONPATH='civicpulse'
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The API documentation is available at `http://localhost:8000/docs`.

### Step 2: Start the React + TypeScript Frontend
```bash
# In a new terminal:
cd civicpulse/frontend
npm run dev
```
Open `http://localhost:3000` to launch the interactive platform.

---

## 5. The 90-Second Judge Demo Workflow (#CP102)

Click the **"90s Live Demo"** button in the top navigation header to execute the guided presentation:

1. **Step 01 — Citizen Report:** Citizen A uploads a damaged-road video at 10:00 AM with an Odia voice note and GPS in Municipal Zone 3. OpenCV extracts 4 frames.
2. **Step 02 — AI Vision Inspection:** YOLO detects a deep road crater (94% confidence) with bounding box overlay. AI Risk Score is computed at **92/100 (P1 Critical)** with school buffer proximity.
3. **Step 03 — Duplicate Detection & Merge:** Citizen B reports the same road hazard from an alternate angle at 10:20 AM. DBSCAN + pHash match the reports (**96% Match Confidence**) and consolidate them into `#CP102` (2 citizen reports $\rightarrow$ 1 unique ticket).
4. **Step 04 — Autonomous Routing:** Mapped to **Municipal Zone 3** and dispatched to the **Road Maintenance Department** with an active 4-hour SLA countdown timer and cryptographic audit block.
5. **Step 05 — Before/After Resolution Verification:** Officer uploads the after-repair photo. Vision AI verifies the bitumen patch (**91.4% Repair Score**). The citizen confirms repair satisfaction to officially close `#CP102`.

