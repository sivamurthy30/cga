#!/bin/bash

echo "🚀 Starting DEVA ML Backend..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $PYTHON_VERSION"

# Install dependencies if needed
echo ""
echo "📦 Installing backend dependencies..."
pip3 install -r backend/requirements.txt

# Check if data files exist
if [ ! -f "data/roles_skills.csv" ]; then
    echo "❌ data/roles_skills.csv not found!"
    echo "Please ensure the data directory is properly set up."
    exit 1
fi

echo ""
echo "🎯 Starting Flask API on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""

# Start the backend
python3 backend/simple_app.py
