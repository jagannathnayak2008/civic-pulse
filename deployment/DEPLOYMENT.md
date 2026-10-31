# CivicPulse Multi-Cloud Deployment Manual

This guide walks you through deploying CivicPulse into production across **Vercel (Frontend)**, **Render (Backend)**, and **Neon (PostgreSQL Database)**.

---

## 🏛️ Architecture Overview

```text
               ┌───────────────────────┐
               │    Vercel Edge CDN    │
               │  (React 18 + Vite)    │
               └──────────┬────────────┘
                          │ HTTPS / WSS
                          ▼
               ┌───────────────────────┐
               │      Render.com       │
               │   (FastAPI Backend)   │
               └──┬─────────────────┬──┘
                  │                 │
                  ▼                 ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  Neon PostgreSQL  │     │  AI Engine Subsys │
        │     (PostGIS)     │     │ (Vision, Whisper) │
        └───────────────────┘     └───────────────────┘
```

---

## 1. Step-by-Step Deployment

### Step 1: Database (Neon PostgreSQL)
1. Navigate to [Neon.tech](https://neon.tech) and create a project called `civicpulse`.
2. In the Neon SQL Console, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Copy and run the entire SQL contents of [database/schemas/schema.sql](file:///c:/Users/nictn/OneDrive/Pictures/Documents/Civic%20Pulse/database/schemas/schema.sql).
4. Copy your database connection string:
   ```text
   postgresql://user:password@ep-xyz.aws.neon.tech/civicpulse_db?sslmode=require
   ```

### Step 2: Backend (Render.com)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository: `jagannathnayak2008/civic-pulse`.
3. Fill in the service configuration:
   - **Name**: `civicpulse-backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `PYTHONPATH` = `.`
   - `ENVIRONMENT` = `production`
   - `DATABASE_URL` = `<your-neon-connection-string>`
   - `FRONTEND_URL` = `https://<your-vercel-app>.vercel.app`
   - `SECRET_KEY` = `<secure-random-32-byte-hex>`
5. Click **Create Web Service**. Note your Render URL (e.g., `https://civicpulse-backend.onrender.com`).

### Step 3: Frontend (Vercel)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Select `civic-pulse`.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL` = `https://civicpulse-backend.onrender.com`
   - `VITE_WS_URL` = `wss://civicpulse-backend.onrender.com/ws/live-feed`
5. Click **Deploy**.

---

## 2. Docker Compose Deployment (Self-Hosted / VPS)

To deploy the entire stack on a single Linux VPS or local server with Docker:
```bash
cd deployment/docker
docker-compose up --build -d
```
All services will initialize automatically:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- AI Engine: `http://localhost:8001`
- PostGIS DB: `localhost:5432`

