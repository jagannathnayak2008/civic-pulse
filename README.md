# CivicPulse — Autonomous Civic Incident Verifier & Intelligence Platform

> **From Citizen Complaints to Verified Civic Action — An Autonomous AI Platform for Smarter Municipal Governance.**

CivicPulse is an enterprise-grade civic incident verification, deduplication, routing, and resolution platform. It seamlessly converts multi-channel citizen complaints (photos, videos, multilingual voice, GPS) into verified, prioritized municipal tickets with closed-loop repair verification.

---

## 🌟 Key Features

1. **Autonomous Civic Problem Classifier**:
   - Multi-problem classification: Road Potholes, Garbage Overflow, Public Toilets, Waterlogging, Drainage & Sewage, Streetlights, Open Manhole, and Others.
   - Zero sample picture required for "Others" category.
   - Interactive camera capture & media upload evidence verification.

2. **Multilingual AI Voice Assistant**:
   - Automated speech-to-text with zero-shot English translation supporting **Odia, Hindi, Bengali, Telugu, and English**.
   - Phonetic dialect normalization with real-time audio wave visualization.

3. **Spatial Deduplication & PostGIS Clustering**:
   - Automated 35m spatial radius grouping with pHash perceptual visual hashing.
   - Automatically detects duplicate incident reports and unifies them into canonical master tickets.

4. **Authority Dashboard & Municipal Geospatial Console**:
   - Interactive OpenStreetMap geospatial console with incident cluster pins, boundary polygons, and SLA tracking.
   - Department workload management, Human Review Queue, and closed-loop repair approval.
   - White inspect highlight marker with instant popup centering.

5. **Secure Authentication & Role-Based Access Control**:
   - Dedicated citizen and authority officer login/registration flows.
   - Secure bcrypt password hashing, session tokens, and strict role permissions.

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
# From the project root
python run_backend.py
```
Or directly:
```bash
python -m uvicorn civicpulse.backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend API Docs will be live at `http://localhost:8000/docs`.*

#### Step 2: Start the Frontend (React + Vite)
```bash
cd civicpulse/frontend
npm install
npm run dev
```
*Frontend application will be live at `http://localhost:3000`.*

---

## 📁 Project Architecture

```text
Civic Pulse/
├── civicpulse/
│   ├── backend/
│   │   ├── auth.py              # User authentication, bcrypt hashing & JWT/tokens
│   │   ├── main.py              # FastAPI endpoints & WebSocket broadcast hub
│   │   ├── models.py            # Pydantic schemas & data models
│   │   ├── seed_data.py         # Initial municipal incident records & demo datasets
│   │   ├── users_db.json        # Persistent user records with hashed passwords
│   │   └── orchestrator/        # Whisper, YOLOv8 vision, PostGIS & pHash logic
│   └── frontend/
│       ├── src/
│       │   ├── components/      # CitizenPortal, CommandCenter, Auth, Navbar
│       │   ├── types/           # TypeScript definitions
│       │   └── index.css        # Enterprise design system & theme variables
│       ├── package.json
│       └── vite.config.ts
├── run_all.bat                  # One-click dual server launcher
├── run_backend.py               # Backend runner
├── package.json                 # Root script definitions
└── README.md
```

---

## 🛡️ License & Acknowledgements
Built for modern municipal authorities and smart cities. Powered by open-source OpenStreetMap, FastAPI, and React.
