# CivicPulse Project Directory Structure

Complete map of every directory, component, and configuration file in the CivicPulse codebase.

---

```text
Civic Pulse/
├── frontend/                               # Independent React 18 + Vite Frontend (Vercel-ready)
│   ├── public/                             # Public static assets & sample civic images
│   ├── src/
│   │   ├── assets/                         # SVG icons, badges
│   │   ├── components/                     # Preserved UI Components
│   │   │   ├── Auth/                       # AuthPortal.tsx (Login/Register), LogoutModal.tsx
│   │   │   ├── CitizenPortal/              # ReportWizard.tsx, TrackingPortal.tsx, CommunityConfirm.tsx, RepairVerifier.tsx
│   │   │   ├── CommandCenter/              # LiveIncidentMap.tsx, WorkloadSlaPanel.tsx, HumanReviewQueue.tsx, KpiGrid.tsx, OfficerRepairModal.tsx, AuthorityAuth.tsx
│   │   │   ├── DemoSimulator/              # JawDropDemo.tsx (90s guided judge presentation)
│   │   │   └── Navbar.tsx                  # Header navigation with role switchers and active user profile
│   │   ├── context/                        # CivicPulseContext.tsx (Global state provider)
│   │   ├── services/                       # api.ts (REST client with VITE_API_URL fallback), websocket.ts
│   │   ├── routes/                         # routes.ts (Navigation constants)
│   │   ├── styles/                         # globals.css, index.css (Theme tokens & variables)
│   │   ├── utils/                          # formatters.ts
│   │   ├── types/                          # auth.ts, civicpulse.ts
│   │   ├── App.tsx                         # Main React layout coordinator
│   │   └── main.tsx                        # DOM mount
│   ├── package.json                        # Frontend NPM dependencies
│   ├── vite.config.ts                      # Vite build configuration
│   ├── vercel.json                         # Vercel SPA routing rules
│   └── .env.example                        # Frontend environment variables template
│
├── backend/                                # Independent FastAPI REST & WebSocket Backend (Render-ready)
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth_routes.py          # /api/auth endpoints (register, login, me, logout, forgot-password)
│   │   │       ├── incident_routes.py      # /api/incidents, /api/reports/submit, /api/voice/translate
│   │   │       ├── municipal_routes.py     # /api/zones, /api/kpi, /api/review-queue
│   │   │       └── websocket_routes.py     # /ws/live-feed real-time manager
│   │   ├── core/
│   │   │   ├── config.py                   # Pydantic Settings & environment variables
│   │   │   └── security.py                 # Bcrypt hashing & cryptographically secure session tokens
│   │   ├── models/                         # Domain models (IncidentCategory, MasterIncident, KPIGridSummary)
│   │   ├── schemas/                        # Request/Response schemas (auth_schemas.py, incident_schemas.py)
│   │   ├── services/
│   │   │   ├── auth_service.py             # User DB manager & credentials verifier
│   │   │   ├── incident_service.py         # Incident state & KPI summary calculator
│   │   │   └── ai_client.py                # Decoupled bridge calling AI Engine (in-process or remote REST)
│   │   ├── database/                       # Local database seeds & fallback connection
│   │   ├── middleware/                     # CORS setup
│   │   └── main.py                         # FastAPI application factory
│   ├── tests/                              # Backend unit test suite (test_auth.py, test_incidents.py)
│   ├── uploads/                            # Stored citizen media evidence
│   ├── requirements.txt                    # Python backend dependencies
│   ├── Procfile                            # Render/Heroku web entrypoint
│   ├── render.yaml                         # Render Infrastructure-as-Code service blueprint
│   └── .env.example                        # Backend environment template
│
├── ai_engine/                              # Decoupled AI Verification & Machine Learning Subsystem
│   ├── vision/
│   │   ├── detection/                      # YOLOv8 object detection across 8 civic defect categories
│   │   ├── preprocessing/                  # Frame extraction & Laplacian blur variance filter
│   │   └── inference/                      # Vision engine & before/after repair verifier
│   ├── audio/                              # Whisper speech-to-text & multilingual translation (Odia, Hindi, Bengali, Telugu)
│   ├── duplicate_detection/                # Perceptual hashing (pHash) & EXIF fraud guardrail
│   ├── geospatial/                         # PostGIS spatial polygon routing & DBSCAN 35m deduplication
│   ├── severity_assessment/                # Explainable AI (XAI) transparent point breakdown
│   ├── orchestration/                      # LangGraph multi-step verification pipeline coordinator
│   ├── models/                             # Model categories, priority weights & confidence thresholds
│   ├── services/                           # ai_service.py (Standalone microservice runner)
│   ├── requirements.txt                    # AI engine dependencies (PyTorch, Ultralytics, Whisper, OpenCV)
│   └── README.md                           # AI engine architecture guide
│
├── database/                               # Database Schemas, Seeds & Migration Framework
│   ├── migrations/                         # SQL migration scripts (001_initial_schema.sql)
│   ├── schemas/                            # Full PostgreSQL + PostGIS DDL schema
│   │   └── schema.sql
│   ├── seeds/                              # Initial incident records (#CP102) and pre-hashed user credentials
│   │   ├── seed_data.py
│   │   └── users_db.json
│   └── README.md                           # Guide for Neon PostgreSQL, Supabase, or local PostGIS
│
├── deployment/                             # Enterprise DevOps & Multi-Cloud Deployment Configurations
│   ├── vercel/                             # Vercel deployment config & guide
│   ├── render/                             # Render deployment config & Dockerfile
│   ├── docker/                             # Dockerfile.frontend, Dockerfile.backend, Dockerfile.ai_engine, docker-compose.yml
│   ├── scripts/                            # One-click start scripts (start_local.bat, start_local.sh)
│   └── DEPLOYMENT.md                       # Comprehensive deployment manual
│
├── docs/                                   # Platform Documentation & Specifications
│   ├── ARCHITECTURE.md                     # System architecture & data pipeline diagrams
│   ├── API_DOCUMENTATION.md                # Complete REST & WebSocket API reference
│   └── PROJECT_STRUCTURE.md                # This directory structure guide
│
├── run_all.bat                             # One-click launcher for dual dev servers
├── run_backend.py                          # Dedicated backend launcher
├── package.json                            # Root NPM scripts
├── .gitignore                              # Comprehensive ignore rules
├── README.md                               # Project master README
└── .env.example                            # Root environment template
```
