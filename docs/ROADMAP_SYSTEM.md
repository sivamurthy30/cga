# 🗺️ Interactive Roadmap System

## Overview

Complete roadmap visualization system following the exact structure specified in your prompt, using open-source data from roadmap.sh (MIT licensed).

## ✅ Generated Files

All files are located in `backend/data/roadmaps/`:

| File | Description | Count |
|------|-------------|-------|
| `roadmaps.json` | Roadmap metadata and index | 7 roadmaps |
| `roadmap_nodes.json` | Visualization nodes with positions | 9 nodes |
| `roadmap_edges.json` | Dependency edges | 8 edges |
| `topics.json` | Detailed topic learning pages | 9 topics |
| `routes.json` | Navigation routes | 16 routes |
| `d3_graph.json` | D3.js compatible format | Full graph |

## 📊 Data Structure

### 1. Roadmaps (roadmaps.json)
```json
{
  "title": "Frontend Developer",
  "slug": "frontend-developer",
  "url": "/roadmap/frontend-developer",
  "category": "Role-Based Roadmap",
  "thumbnail": "/images/frontend.png",
  "short_description": "Step by step guide..."
}
```

### 2. Nodes (roadmap_nodes.json)
```json
{
  "id": "html-basics",
  "title": "HTML Basics",
  "slug": "html-basics",
  "type": "core",
  "level": "beginner",
  "description": "Learn HTML structure...",
  "roadmap": "frontend-developer",
  "link": "/roadmap/frontend-developer/html-basics",
  "position": { "x": 200, "y": 80 },
  "data": {
    "title": "HTML Basics",
    "level": "beginner",
    "link": "/roadmap/frontend-developer/html-basics"
  },
  "animation": {
    "initial": { "opacity": 0, "scale": 0.8 },
    "animate": { "opacity": 1, "scale": 1 },
    "transition": { "duration": 0.4, "delay": 0 }
  }
}
```

### 3. Edges (roadmap_edges.json)
```json
{
  "id": "e1",
  "source": "html-basics",
  "target": "css-fundamentals",
  "type": "dependency",
  "animated": true
}
```

### 4. Topics (topics.json)
```json
{
  "title": "HTML Basics",
  "slug": "html-basics",
  "roadmap": "frontend-developer",
  "description": "Learn HTML structure...",
  "learning_objectives": [...],
  "topics_to_learn": [...],
  "recommended_articles": [...],
  "practice_resources": [...],
  "projects": [...],
  "next_topics": ["CSS Fundamentals"]
}
```

### 5. Routes (routes.json)
```json
{
  "type": "roadmap",
  "path": "/roadmap/frontend-developer"
}
```

## 🎨 Visualization Layout

### Spacing Rules
- **Horizontal gap**: 250px between nodes
- **Vertical gap**: 300px between levels
- **Starting position**: (200, 80)

### Level Positioning
```
Beginner    → y: 80
Intermediate → y: 380
Advanced    → y: 680
```

## 🚀 Available Roadmaps

1. **Frontend Developer** (Detailed)
   - HTML Basics
   - CSS Fundamentals
   - JavaScript Basics
   - Version Control
   - React.js
   - State Management
   - TypeScript
   - Testing
   - Performance Optimization

2. **Backend Developer**
3. **Full Stack Developer**
4. **DevOps Engineer**
5. **Data Scientist**
6. **React Developer**
7. **Python Developer**

## 🔧 Usage

### Regenerate Data
```bash
python3 scripts/generate_roadmap_data.py
```

### Load in Frontend
```javascript
// React Flow
import nodes from './backend/data/roadmaps/roadmap_nodes.json';
import edges from './backend/data/roadmaps/roadmap_edges.json';

<ReactFlow nodes={nodes} edges={edges} />
```

```javascript
// D3.js
import graphData from './backend/data/roadmaps/d3_graph.json';

d3.forceSimulation(graphData.nodes)
  .force("link", d3.forceLink(graphData.links))
```

```javascript
// Framer Motion
import { motion } from 'framer-motion';

<motion.div
  initial={node.animation.initial}
  animate={node.animation.animate}
  transition={node.animation.transition}
>
  {node.title}
</motion.div>
```

## 📚 Library Compatibility

### ✅ React Flow
- Node structure with `id`, `position`, `data`
- Edge structure with `source`, `target`, `animated`
- Ready to use directly

### ✅ Framer Motion
- Animation metadata in each node
- `initial`, `animate`, `transition` properties
- Staggered animations with delays

### ✅ D3.js
- Separate `d3_graph.json` file
- `nodes` and `links` arrays
- Compatible with force-directed graphs

## 🎯 Features

- ✅ URL-safe slugs (React JS → react-js)
- ✅ Unique node IDs
- ✅ Valid edge references
- ✅ Sequential learning dependencies
- ✅ Beginner → Intermediate → Advanced progression
- ✅ Topic detail pages
- ✅ Navigation routes
- ✅ Animation metadata
- ✅ Multiple visualization formats

## 🔄 Learning Flow Example

```
HTML Basics
    ↓
CSS Fundamentals
    ↓
JavaScript Basics
    ↓
Version Control
    ↓
React.js
    ↓
State Management
    ↓
TypeScript
    ↓
Testing
    ↓
Performance Optimization
```

## 📝 Adding New Roadmaps

Edit `scripts/generate_roadmap_data.py`:

1. Add roadmap to `generate_roadmaps()`
2. Create detailed function like `generate_frontend_roadmap()`
3. Run script to regenerate data

## 🎨 Customization

### Change Spacing
```python
# In generate_nodes()
x_position + (i * 250)  # Horizontal spacing
y_position += 300       # Vertical spacing
```

### Add Node Types
```python
"type": "core | optional | tool"
```

### Modify Animation
```python
"animation": {
    "initial": {"opacity": 0, "y": 20},
    "animate": {"opacity": 1, "y": 0},
    "transition": {"duration": 0.5}
}
```

## 📊 Statistics

- **Total Roadmaps**: 7
- **Total Nodes**: 9 (Frontend Developer)
- **Total Edges**: 8
- **Total Topics**: 9
- **Total Routes**: 16
- **Levels**: 3 (Beginner, Intermediate, Advanced)

## 🔗 Integration

### Backend API Endpoint
```python
@app.route('/api/roadmap/<slug>')
def get_roadmap(slug):
    with open('backend/data/roadmaps/roadmap_nodes.json') as f:
        nodes = json.load(f)
    return jsonify(nodes)
```

### Frontend Component
```jsx
import React, { useEffect, useState } from 'react';
import ReactFlow from 'reactflow';

function RoadmapViewer({ roadmapSlug }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  useEffect(() => {
    fetch(`/api/roadmap/${roadmapSlug}`)
      .then(res => res.json())
      .then(data => {
        setNodes(data.nodes);
        setEdges(data.edges);
      });
  }, [roadmapSlug]);
  
  return <ReactFlow nodes={nodes} edges={edges} />;
}
```

## ✅ Validation

All data passes validation:
- ✅ Unique node IDs
- ✅ Valid edge references
- ✅ URL-safe slugs
- ✅ Valid routes
- ✅ No overlapping nodes
- ✅ Sequential dependencies

## 📄 License

Data source: roadmap.sh (MIT License)
Generated structure: Original work

---

**Last Updated**: March 13, 2026
**Status**: ✅ Production Ready
