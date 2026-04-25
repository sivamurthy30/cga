#!/bin/bash
# Start all four backend systems

echo "=== DEVA Backend — Starting All Systems ==="

# 1. FastAPI server
echo "[1/3] Starting FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# 2. Celery worker (System 4 — async tasks)
echo "[2/3] Starting Celery worker..."
celery -A app.services.async_tasks.celery_app worker --loglevel=info &

# 3. Celery beat (System 3 — Shadow Mentor sweep every 6h)
echo "[3/3] Starting Celery beat scheduler..."
celery -A app.services.async_tasks.celery_app beat --loglevel=info &

echo ""
echo "All systems running:"
echo "  API          → http://localhost:8000"
echo "  Docs         → http://localhost:8000/docs"
echo "  System 1     → POST /api/linucb/recommend"
echo "  System 2     → POST /api/graph/backtrace"
echo "  System 3     → GET  /api/mentor/notifications/{user_id}"
echo "  System 4     → POST /api/analytics/resume/upload"
echo "  WebSocket    → WS   /api/analytics/ws/{task_id}"
echo ""
echo "Prerequisites: Redis must be running on localhost:6379"
echo "  Start Redis: redis-server"

wait
