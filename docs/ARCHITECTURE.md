# CivicPulse System Architecture & Technical Specification

> **From Citizen Complaints to Verified Civic Action — An Autonomous Municipal Intelligence Platform.**

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (React 18 + Vite)"]
        CitizenUI["Citizen Portal (Report, Voice, GPS, Status)"]
        AuthorityUI["Command Center (OSM Geospatial, SLA Boards, Review Queue)"]
        DemoUI["90s Guided Judge Presentation Simulator"]
    end

    subgraph ApiGateway ["Ingestion & API Gateway (FastAPI)"]
        AuthRouter["Auth Router (Bcrypt, Session Tokens)"]
        IncidentRouter["Incident Router (REST + WebSockets)"]
        MunicipalRouter["Municipal Router (Zones, KPIs, SLA)"]
    end

    subgraph AIEngineSubsystem ["Modular AI Engine (Decoupled Subsystem)"]
        Whisper["Audio AI: Whisper + Phonetic Normalization"]
        YOLO["Vision AI: YOLOv8 + Blur Variance Filter"]
        pHash["Evidence AI: pHash & EXIF Fraud Shield"]
        PostGIS["Geospatial AI: PostGIS & DBSCAN 35m Clustering"]
        XAI["Severity AI: Transparent Mathematical Point Scorer"]
        LangGraph["LangGraph Workflow Coordinator & SHA-256 Chainer"]
    end

    subgraph StorageLayer ["Data & Storage Layer"]
        UserDB["User Store (JSON / PostgreSQL)"]
        PostgresDB["PostgreSQL + PostGIS (Spatial Polygons & Incidents)"]
        MediaStorage["Evidence Media Store (Images & Video Keyframes)"]
    end

    ClientLayer <-->|REST API & WebSockets| ApiGateway
    ApiGateway <-->|In-Process / Microservice| AIEngineSubsystem
    ApiGateway <-->|Async Queries| StorageLayer
```

---

## 2. Multi-Step AI Verification Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Reporter
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant AI as AI Engine (LangGraph)
    participant WS as WebSocket Hub
    actor Officer as Municipal Authority

    Citizen->>FE: Submits Photo/Video, Odia/Hindi Voice & GPS
    FE->>API: POST /api/reports/submit
    API->>AI: execute_workflow()
    
    activate AI
    AI->>AI: Step 1: Whisper ASR + Indic Dialect Translation
    AI->>AI: Step 2: YOLOv8 Defect Detection & Bounding Box
    AI->>AI: Step 3: pHash Perceptual Hash & EXIF Check
    AI->>AI: Step 4: DBSCAN Spatial Deduplication (35m radius)
    alt Is Duplicate
        AI->>API: Consolidate into Master Ticket #CP102
    else Is Unique Incident
        AI->>AI: Step 5: XAI Risk Score (0-100) & SLA Assignment
        AI->>AI: Step 6: PostGIS Municipal Zone Boundary Routing
        AI->>API: Create New Master Incident
    end
    deactivate AI

    API->>WS: Broadcast INCIDENT_CREATED / DUPLICATE_MERGED
    WS-->>Officer: Real-time update on Municipal Map & SLA Boards
    API-->>FE: Return Master Tracking Number (#CP102)
```

---

## 3. Core Technical Modules

### Module 1: Multimodal Ingestion & Multilingual Voice (Whisper AI)
- Transcribes voice complaints in **English, Hindi, Odia, Bengali, and Telugu**.
- Employs phonetic dictionary normalization to ensure Indic dialect variants (e.g., Odia `"ଗତ"` $\rightarrow$ `"ଗାତ"`, Bengali `"গত"` $\rightarrow$ `"গর্ত"`) translate into standardized English defect summaries without Indic leakage.

### Module 2: Vision Inspector & Defect Extraction (OpenCV + YOLOv8)
- Samples 4 keyframes from citizen uploads and evaluates Laplacian blur variance ($> 40$ sharpness threshold).
- Predicts bounding boxes, defect volume percentage, and collapse severity across 8 civic problem categories.

### Module 3: Evidence Authenticity & Anti-Fraud (pHash + EXIF)
- Computes 64-bit perceptual image hashes to prevent recycled photos or duplicate fraud.
- Guardrail: Low-confidence items ($< 70\%$) are safely held in the Human Review Queue instead of auto-rejection.

### Module 4: Spatial Deduplication Intelligence (DBSCAN + Category)
- Groups incoming reports within a **35-meter radius** sharing identical defect categories.
- Consolidates redundant citizen reports into a canonical master ticket with match confidence scores.

### Module 5: Autonomous Jurisdiction Routing & SLA Allocation
- Evaluates coordinates against deterministic PostGIS municipal polygon boundaries across **Zones 1–5**.
- Enforces strict SLA countdowns:
  - **P1 Critical**: 4 hours
  - **P2 High**: 12 hours
  - **P3 Medium**: 24 hours
  - **P4 Low**: 72 hours

### Module 6: Closed-Loop Before/After Repair Verification
- Municipal officers upload after-repair photos on-site.
- Validates GPS delta ($< 30$ meters) and computes Structural Similarity Index (SSIM) score (e.g. 91.4%).
- Requires citizen inspection before official ticket closure.

### Module 7: Explainable AI (XAI) & Cryptographic Audit Trails
- Transparent mathematical scoring: `Base Severity + Proximity Penalty + Traffic Level + Worsening Trend`.
- Every ticket transition appends a cryptographically chained SHA-256 audit entry.
