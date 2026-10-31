@echo off
echo ========================================================
echo Starting CivicPulse Full-Stack Development Environment
echo ========================================================

start "CivicPulse Backend" cmd /k "python run_backend.py"
timeout /t 3 /nobreak >nul
start "CivicPulse Frontend" cmd /k "npm run dev"

echo Dual servers launched successfully!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
pause

