#!/usr/bin/env python3
"""
Fetch roadmaps from roadmap.sh (developer-roadmap repository)
and convert them to our application format.
"""

import json
import requests
import os
from pathlib import Path

# GitHub raw content base URL for developer-roadmap
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps"

# Roadmaps to fetch
ROADMAPS = {
    'frontend': {
        'id': 'frontend-developer',
        'name': 'Frontend Developer',
        'icon': '🎨',
        'github_path': 'frontend'
    },
    'backend': {
        'id': 'backend-developer',
        'name': 'Backend Developer',
        'icon': '⚙️',
        'github_path': 'backend'
    },
    'devops': {
        'id': 'devops-engineer',
        'name': 'DevOps Engineer',
        'icon': '🔧',
        'github_path': 'devops'
    },
    'full-stack': {
        'id': 'fullstack-developer',
        'name': 'Full Stack Developer',
        'icon': '🚀',
        'github_path': 'full-stack'
    },
    'ai-data-scientist': {
        'id': 'ai-ml-engineer',
        'name': 'AI/ML Engineer',
        'icon': '🤖',
        'github_path': 'ai-data-scientist'
    },
    'data-analyst': {
        'id': 'data-engineer',
        'name': 'Data Engineer',
        'icon': '📊',
        'github_path': 'data-analyst'
    },
    'android': {
        'id': 'mobile-developer',
        'name': 'Mobile Developer (Android)',
        'icon': '📱',
        'github_path': 'android'
    },
    'software-architect': {
        'id': 'system-design',
        'name': 'System Design',
        'icon': '🏗️',
        'github_path': 'software-architect'
    },
    'react': {
        'id': 'react-developer',
        'name': 'React Developer',
        'icon': '⚛️',
        'github_path': 'react'
    },
    'nodejs': {
        'id': 'nodejs-developer',
        'name': 'Node.js Developer',
        'icon': '🟢',
        'github_path': 'nodejs'
    },
    'python': {
        'id': 'python-developer',
        'name': 'Python Developer',
        'icon': '🐍',
        'github_path': 'python'
    },
    'java': {
        'id': 'java-developer',
        'name': 'Java Developer',
        'icon': '☕',
        'github_path': 'java'
    },
    'golang': {
        'id': 'go-developer',
        'name': 'Go Developer',
        'icon': '🔵',
        'github_path': 'golang'
    },
    'docker': {
        'id': 'docker',
        'name': 'Docker',
        'icon': '🐳',
        'github_path': 'docker'
    },
    'kubernetes': {
        'id': 'kubernetes',
        'name': 'Kubernetes',
        'icon': '☸️',
        'github_path': 'kubernetes'
    },
    'postgresql-dba': {
        'id': 'postgresql',
        'name': 'PostgreSQL',
        'icon': '🐘',
        'github_path': 'postgresql-dba'
    },
    'cyber-security': {
        'id': 'security-engineer',
        'name': 'Security Engineer',
        'icon': '🔒',
        'github_path': 'cyber-security'
    }
}

def fetch_roadmap_content(github_path):
    """Fetch roadmap.json from GitHub"""
    url = f"{GITHUB_RAW_BASE}/{github_path}/content/roadmap.json"
    print(f"Fetching: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  ❌ Failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def transform_roadmap_data(roadmap_content, roadmap_info):
    """Transform roadmap.sh format to our application format"""
    nodes = []
    edges = []
    
    if not roadmap_content:
        return {'nodes': nodes, 'edges': edges}
    
    # Extract nodes from roadmap content
    node_groups = roadmap_content.get('nodes', [])
    
    node_id_counter = 0
    y_position = 100
    
    for group in node_groups:
        # Each group can have multiple nodes
        if isinstance(group, dict):
            node_id = f"node-{node_id_counter}"
            
            # Extract node data
            title = group.get('label', group.get('title', 'Untitled'))
            description = group.get('description', f'Learn about {title}')
            
            # Determine level based on position or metadata
            level = 'beginner'
            if 'advanced' in title.lower() or 'expert' in title.lower():
                level = 'advanced'
            elif 'intermediate' in title.lower():
                level = 'intermediate'
            
            node = {
                'id': node_id,
                'type': 'custom',
                'position': {'x': 100 + (node_id_counter % 5) * 250, 'y': y_position},
                'data': {
                    'title': title,
                    'description': description,
                    'learningTime': '2-4 hours',
                    'level': level,
                    'resources': f'/resources/{node_id}',
                    'subtopics': group.get('children', []),
                    'tools': []
                }
            }
            
            nodes.append(node)
            
            # Create edges if there are dependencies
            if node_id_counter > 0:
                edges.append({
                    'id': f"edge-{node_id_counter}",
                    'source': f"node-{node_id_counter - 1}",
                    'target': node_id,
                    'type': 'smoothstep'
                })
            
            node_id_counter += 1
            
            if node_id_counter % 5 == 0:
                y_position += 200
    
    return {'nodes': nodes, 'edges': edges}

def create_simplified_roadmap(roadmap_info):
    """Create a simplified roadmap structure for roadmaps we can't fetch"""
    common_topics = {
        'frontend-developer': [
            'HTML & CSS', 'JavaScript Basics', 'React/Vue/Angular', 
            'State Management', 'TypeScript', 'Testing', 'Build Tools', 
            'Performance Optimization', 'Accessibility', 'Responsive Design'
        ],
        'backend-developer': [
            'Programming Language', 'Databases', 'APIs & REST', 
            'Authentication', 'Caching', 'Testing', 'Docker', 
            'CI/CD', 'Security', 'Scalability'
        ],
        'fullstack-developer': [
            'Frontend Basics', 'Backend Basics', 'Databases', 
            'APIs', 'Authentication', 'Deployment', 'DevOps Basics', 
            'Testing', 'Security', 'System Design'
        ],
        'devops-engineer': [
            'Linux', 'Networking', 'Docker', 'Kubernetes', 
            'CI/CD', 'Monitoring', 'Cloud Platforms', 'IaC', 
            'Security', 'Automation'
        ],
        'ai-ml-engineer': [
            'Python', 'Math & Statistics', 'Machine Learning', 
            'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 
            'Model Deployment', 'Data Processing', 'Frameworks'
        ],
        'data-engineer': [
            'SQL', 'Python', 'Data Warehousing', 'ETL', 
            'Big Data', 'Data Modeling', 'Cloud Platforms', 
            'Streaming', 'Data Quality', 'Orchestration'
        ],
        'mobile-developer': [
            'Mobile Basics', 'UI/UX', 'State Management', 
            'APIs', 'Local Storage', 'Testing', 'App Store', 
            'Performance', 'Security', 'Push Notifications'
        ],
        'system-design': [
            'Scalability', 'Load Balancing', 'Caching', 
            'Databases', 'Microservices', 'Message Queues', 
            'CDN', 'Monitoring', 'Security', 'CAP Theorem'
        ]
    }
    
    topics = common_topics.get(roadmap_info['id'], [
        'Fundamentals', 'Core Concepts', 'Advanced Topics', 
        'Best Practices', 'Tools & Frameworks', 'Testing', 
        'Deployment', 'Security', 'Performance', 'Real Projects'
    ])
    
    nodes = []
    edges = []
    
    for i, topic in enumerate(topics):
        node_id = f"node-{i}"
        level = 'beginner' if i < 3 else ('intermediate' if i < 7 else 'advanced')
        
        node = {
            'id': node_id,
            'type': 'custom',
            'position': {'x': 100 + (i % 5) * 250, 'y': 100 + (i // 5) * 200},
            'data': {
                'title': topic,
                'description': f'Learn {topic} for {roadmap_info["name"]}',
                'learningTime': '2-4 hours',
                'level': level,
                'resources': f'/resources/{node_id}',
                'subtopics': [],
                'tools': []
            }
        }
        
        nodes.append(node)
        
        if i > 0:
            edges.append({
                'id': f"edge-{i}",
                'source': f"node-{i-1}",
                'target': node_id,
                'type': 'smoothstep'
            })
    
    return {'nodes': nodes, 'edges': edges}

def main():
    output_dir = Path(__file__).parent.parent / 'backend' / 'data' / 'roadmaps'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    all_roadmaps = {}
    
    print("🗺️  Fetching roadmaps from roadmap.sh...\n")
    
    for key, roadmap_info in ROADMAPS.items():
        print(f"📍 Processing: {roadmap_info['name']}")
        
        # Try to fetch from GitHub
        roadmap_content = fetch_roadmap_content(roadmap_info['github_path'])
        
        if roadmap_content:
            roadmap_data = transform_roadmap_data(roadmap_content, roadmap_info)
            print(f"  ✅ Fetched {len(roadmap_data['nodes'])} nodes")
        else:
            # Create simplified version
            roadmap_data = create_simplified_roadmap(roadmap_info)
            print(f"  ⚠️  Using simplified version with {len(roadmap_data['nodes'])} nodes")
        
        # Save individual roadmap file
        roadmap_file = output_dir / f"{roadmap_info['id']}.json"
        with open(roadmap_file, 'w', encoding='utf-8') as f:
            json.dump({
                'id': roadmap_info['id'],
                'name': roadmap_info['name'],
                'icon': roadmap_info['icon'],
                'description': f'Complete roadmap for {roadmap_info["name"]}',
                'nodes': roadmap_data['nodes'],
                'edges': roadmap_data['edges'],
                'totalNodes': len(roadmap_data['nodes'])
            }, f, indent=2, ensure_ascii=False)
        
        all_roadmaps[roadmap_info['id']] = {
            'id': roadmap_info['id'],
            'name': roadmap_info['name'],
            'icon': roadmap_info['icon'],
            'totalNodes': len(roadmap_data['nodes'])
        }
        
        print()
    
    # Save roadmaps index
    index_file = output_dir / 'roadmaps_index.json'
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump({
            'roadmaps': all_roadmaps,
            'lastUpdated': '2024-01-01'
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully processed {len(all_roadmaps)} roadmaps!")
    print(f"📁 Saved to: {output_dir}")

if __name__ == '__main__':
    main()
 