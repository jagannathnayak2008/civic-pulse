@echo off
title CivicPulse Backend Server (Port 8000)
cd /d "%~dp0"
echo ============================================================
echo [CIVICPULSE] Launching FastAPI Backend on http://localhost:8000
echo ============================================================
python run_backend.py
pause

