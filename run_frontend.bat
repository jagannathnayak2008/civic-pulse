@echo off
title CivicPulse Frontend Server (Port 3000)
cd /d "%~dp0civicpulse\frontend"
echo ============================================================
echo [CIVICPULSE] Launching React + Vite UI on http://localhost:3000
echo ============================================================
call npm.cmd run dev
pause

