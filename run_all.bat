@echo off
title CivicPulse Platform Launcher
echo ============================================================
echo [CIVICPULSE] Starting Full Platform (Backend + Frontend)...
echo ============================================================
start "CivicPulse Backend (8000)" cmd /k "run_backend.bat"
start "CivicPulse Frontend (3000)" cmd /k "run_frontend.bat"
echo.
echo Both servers have been launched in separate windows!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo   - Swagger:  http://localhost:8000/docs
echo.
pause

