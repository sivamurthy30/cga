# Roadmap Integration Guide

This guide explains how to fetch and integrate roadmaps from [roadmap.sh](https://roadmap.sh) (developer-roadmap repository) into the DEVA platform.

## Quick Start

### 1. Install Dependencies

```bash
pip install requests
```

### 2. Run the Fetch Script

```bash
python scripts/fetch_roadmaps.py
```

This will:
- Fetch roadmaps from the developer-roadmap GitHub repository
- Transform them to our application format
- Save individual roadmap files to `backend/data/roadmaps/`
- Create an index file `roadmaps_index.json`

### 3. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### 4. Start the Frontend

```bash
npm start
```

## Available Roadmaps

The script fetches the following roadmaps from roadmap.sh:

### Core Development Paths
- 🎨 Frontend Developer
- ⚙️ Backend Developer
- 🚀 Full Stack Developer
- 🔧 DevOps Engineer
- 🤖 AI/ML Engineer
- 📊 Data Engineer
- 📱 Mobile Developer (Android)
- 🏗️ System Design / Software Architect

### Language-Specific
- ⚛️ React Developer
- 🟢 Node.js Developer
- 🐍 Python Developer
- ☕ Java Developer
- 🔵 Go Developer

### Tools & Technologies
- 🐳 Docker
- ☸️ Kubernetes
- 🐘 PostgreSQL

### Security
- 🔒 Security Engineer / Cyber Security

## API Endpoints

### List All Roadmaps
```
GET /api/roadmap/list
```

Response:
```json
{
  "roadmaps": [
    {
      "id": "frontend-developer",
      "name": "Frontend Developer",
      "icon": "🎨",
      "totalNodes": 45
    }
  ],
  "total": 17
}
```

### Get Specific Roadmap
```
GET /api/roadmap/{roadmap_id}
```

Example:
```
GET /api/roadmap/frontend-developer
```

Response:
```json
{
  "id": "frontend-developer",
  "name": "Frontend Developer",
  "icon": "🎨",
  "description": "Complete roadmap for Frontend Developer",
  "nodes": [...],
  "edges": [...],
  "totalNodes": 45
}
```

## File Structure

```
backend/data/roadmaps/
├── roadmaps_index.json          # Index of all roadmaps
├── frontend-developer.json      # Frontend roadmap
├── backend-developer.json       # Backend roadmap
├── fullstack-developer.json     # Full Stack roadmap
├── devops-engineer.json         # DevOps roadmap
├── ai-ml-engineer.json          # AI/ML roadmap
├── data-engineer.json           # Data Engineer roadmap
├── mobile-developer.json        # Mobile roadmap
├── system-design.json           # System Design roadmap
├── react-developer.json         # React roadmap
├── nodejs-developer.json        # Node.js roadmap
├── python-developer.json        # Python roadmap
├── java-developer.json          # Java roadmap
├── go-developer.json            # Go roadmap
├── docker.json                  # Docker roadmap
├── kubernetes.json              # Kubernetes roadmap
├── postgresql.json              # PostgreSQL roadmap
└── security-engineer.json       # Security roadmap
```

## Roadmap Data Format

Each roadmap file contains:

```json
{
  "id": "frontend-developer",
  "name": "Frontend Developer",
  "icon": "🎨",
  "description": "Complete roadmap for Frontend Developer",
  "nodes": [
    {
      "id": "node-0",
      "type": "custom",
      "position": { "x": 100, "y": 100 },
      "data": {
        "title": "HTML & CSS",
        "description": "Learn HTML & CSS for Frontend Developer",
        "learningTime": "2-4 hours",
        "level": "beginner",
        "resources": "/resources/node-0",
        "subtopics": [],
        "tools": []
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-0",
      "target": "node-1",
      "type": "smoothstep"
    }
  ],
  "totalNodes": 10
}
```

## Customization

### Adding More Roadmaps

Edit `scripts/fetch_roadmaps.py` and add to the `ROADMAPS` dictionary:

```python
ROADMAPS = {
    'your-roadmap': {
        'id': 'your-roadmap-id',
        'name': 'Your Roadmap Name',
        'icon': '🎯',
        'github_path': 'roadmap-path-on-github'
    }
}
```

### Modifying Node Structure

Edit the `transform_roadmap_data()` function in `fetch_roadmaps.py` to customize how nodes are transformed.

### Fallback Roadmaps

If a roadmap can't be fetched from GitHub, the script creates a simplified version using common topics defined in `create_simplified_roadmap()`.

## Troubleshooting

### Roadmap Not Found
If you get a 404 error, the roadmap file doesn't exist. Run the fetch script:
```bash
python scripts/fetch_roadmaps.py
```

### Empty Roadmap
Some roadmaps from roadmap.sh might have different formats. The script will create a simplified version with common topics.

### API Connection Issues
Make sure the backend is running on the correct port (default: 8000).

## Credits

Roadmap data is sourced from [roadmap.sh](https://roadmap.sh) by [Kamran Ahmed](https://github.com/kamranahmedse).

Repository: https://github.com/kamranahmedse/developer-roadmap

## License

The roadmap data is subject to the license of the developer-roadmap repository.
