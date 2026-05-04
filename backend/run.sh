#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON="$DIR/venv/bin/python3"
UVICORN="$DIR/venv/bin/uvicorn"

echo "🚀 Starting DEVA backend..."
cd "$DIR"
exec "$UVICORN" app.main:app --host 0.0.0.0 --port 8000 --reload
