#!/usr/bin/env bash
set -e

echo "Starting CivicPulse Full-Stack Development Environment..."
python3 run_backend.py &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
wait
