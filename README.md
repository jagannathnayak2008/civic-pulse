# CivicPulse — Autonomous Civic Incident Verifier & Intelligence Platform

> **From Citizen Complaints to Verified Civic Action — An Autonomous AI Platform for Smarter Municipal Governance.**

CivicPulse is an enterprise-grade civic incident verification, deduplication, routing, and resolution platform. It seamlessly converts multi-channel citizen complaints (photos, videos, multilingual voice, GPS) into verified, prioritized municipal tickets with closed-loop repair verification.

---

## 🌟 Architecture & Modular Layout

CivicPulse is organized into independent, deployment-ready modules:

```text
CIVICPULSE/
├── frontend/           # Independent React 18 + Vite SPA (Vercel-ready with vercel.json)
├── backend/            # Independent FastAPI REST & WebSocket Backend (Render-ready with render.yaml)
├── ai_engine/          # Decoupled AI Engine (YOLOv8, Whisper, pHash, PostGIS, XAI, LangGraph)
├── database/           # PostgreSQL + PostGIS Schemas, Migrations & Seed Data (Neon-ready)
├── deployment/         # Docker Compose, Multi-Cloud Blueprints (Vercel, Render) & Scripts
└── docs/               # System Architecture, API Specification & Project Structure
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18 or higher
- **Python**: v3.10 or higher

---

### Method 1: One-Click Startup (Windows)
Double-click `run_all.bat` or run:
```cmd
run_all.bat
```
This automatically launches both the FastAPI backend server and the Vite React frontend.

---

### Method 2: Manual Startup

#### Step 1: Start the Backend (FastAPI)
```bash
python run_backend.py
```
*Backend API Docs will be live at `http://localhost:8000/docs`.*

#### Step 2: Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will be live at `http://localhost:3000`.*

---

## ☁️ Cloud Deployment

| Service | Recommended Host | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Point root to `frontend`, uses `vercel.json` |
| **Backend** | [Render](https://render.com) | Uses `render.yaml` or `Procfile` |
| **Database** | [Neon PostgreSQL](https://neon.tech) | Uses `database/schemas/schema.sql` (PostGIS) |
| **Self-Hosted** | Docker Compose | Run `cd deployment/docker && docker-compose up -d` |

See [deployment/DEPLOYMENT.md](file:///c:/Users/nictn/OneDrive/Pictures/Documents/Civic%20Pulse/deployment/DEPLOYMENT.md) for full instructions.

---

## 📖 Complete Documentation
- **[System Architecture](file:///c:/Users/nictn/OneDrive/Pictures/Documents/Civic%20Pulse/docs/ARCHITECTURE.md)**: Data pipelines, Whisper phonetic normalization, YOLOv8 frame sampling, and LangGraph workflow.
- **[REST & WebSocket API Specification](file:///c:/Users/nictn/OneDrive/Pictures/Documents/Civic%20Pulse/docs/API_DOCUMENTATION.md)**: Complete endpoint documentation with payload examples.
- **[Project Directory Guide](file:///c:/Users/nictn/OneDrive/Pictures/Documents/Civic%20Pulse/docs/PROJECT_STRUCTURE.md)**: Detailed component and module mapping.

---

## 🛡️ License & Acknowledgements
Built for modern municipal authorities and smart cities. Powered by open-source OpenStreetMap, FastAPI, and React.
