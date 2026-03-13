#!/usr/bin/env python3
"""
Generate interactive roadmap data from open-source roadmap.sh content
Structured for React Flow, Framer Motion, and D3.js visualization
"""

import json
import re
from typing import List, Dict, Any

def slugify(text: str) -> str:
    """Convert text to URL-safe slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def generate_roadmaps() -> List[Dict[str, Any]]:
    """STEP 1: Generate roadmap metadata"""
    roadmaps = [
        {
            "title": "Frontend Developer",
            "slug": "frontend-developer",
            "url": "/roadmap/frontend-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/frontend.png",
            "short_description": "Step by step guide to becoming a modern frontend developer"
        },
        {
            "title": "Backend Developer",
            "slug": "backend-developer",
            "url": "/roadmap/backend-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/backend.png",
            "short_description": "Step by step guide to becoming a modern backend developer"
        },
        {
            "title": "Full Stack Developer",
            "slug": "full-stack-developer",
            "url": "/roadmap/full-stack-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/fullstack.png",
            "short_description": "Step by step guide to becoming a modern full stack developer"
        },
        {
            "title": "DevOps Engineer",
            "slug": "devops-engineer",
            "url": "/roadmap/devops-engineer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/devops.png",
            "short_description": "Step by step guide to becoming a modern DevOps engineer"
        },
        {
            "title": "Data Scientist",
            "slug": "data-scientist",
            "url": "/roadmap/data-scientist",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/data-science.png",
            "short_description": "Step by step guide to becoming a data scientist"
        },
        {
            "title": "React Developer",
            "slug": "react-developer",
            "url": "/roadmap/react-developer",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/react.png",
            "short_description": "Everything you need to know to become a React developer"
        },
        {
            "title": "Python Developer",
            "slug": "python-developer",
            "url": "/roadmap/python-developer",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/python.png",
            "short_description": "Step by step guide to becoming a Python developer"
        }
    ]
    return roadmaps

def generate_frontend_roadmap() -> Dict[str, Any]:
    """STEP 2 & 3: Generate detailed Frontend Developer roadmap"""
    return {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "description": "Frontend development involves creating the user interface and user experience of web applications. This roadmap covers everything from basic HTML/CSS to advanced frameworks and tools.",
        "sections": [
            {
                "level": "Beginner",
                "topics": [
                    {
                        "id": "html-basics",
                        "title": "HTML Basics",
                        "slug": "html-basics",
                        "level": "beginner",
                        "description": "Learn HTML structure, semantic elements, and best practices",
                        "subtopics": [
                            "HTML Document Structure",
                            "Semantic HTML",
                            "Forms and Validation",
                            "Accessibility Basics"
                        ],
                        "tools": ["VS Code", "Chrome DevTools"],
                        "articles": [
                            "MDN HTML Guide",
                            "HTML Best Practices"
                        ],
                        "practice_links": [
                            "FreeCodeCamp HTML Course",
                            "HTML Exercises"
                        ]
                    },
                    {
                        "id": "css-fundamentals",
                        "title": "CSS Fundamentals",
                        "slug": "css-fundamentals",
                        "level": "beginner",
                        "description": "Master CSS styling, layouts, and responsive design",
                        "subtopics": [
                            "CSS Selectors",
                            "Box Model",
                            "Flexbox",
                            "Grid Layout",
                            "Responsive Design"
                        ],
                        "tools": ["CSS Grid Generator", "Flexbox Playground"],
                        "articles": [
                            "CSS Tricks Guide",
                            "Modern CSS Layouts"
                        ],
                        "practice_links": [
                            "CSS Diner",
                            "Flexbox Froggy"
                        ]
                    },
                    {
                        "id": "javascript-basics",
                        "title": "JavaScript Basics",
                        "slug": "javascript-basics",
                        "level": "beginner",
                        "description": "Learn JavaScript fundamentals and DOM manipulation",
                        "subtopics": [
                            "Variables and Data Types",
                            "Functions",
                            "DOM Manipulation",
                            "Events",
                            "ES6+ Features"
                        ],
                        "tools": ["Browser Console", "Node.js"],
                        "articles": [
                            "JavaScript.info",
                            "MDN JavaScript Guide"
                        ],
                        "practice_links": [
                            "JavaScript30",
                            "Exercism JavaScript Track"
                        ]
                    }
                ]
            },
            {
                "level": "Intermediate",
                "topics": [
                    {
                        "id": "version-control",
                        "title": "Version Control (Git)",
                        "slug": "version-control",
                        "level": "intermediate",
                        "description": "Master Git for code versioning and collaboration",
                        "subtopics": [
                            "Git Basics",
                            "Branching and Merging",
                            "GitHub/GitLab",
                            "Pull Requests"
                        ],
                        "tools": ["Git", "GitHub", "GitLab"],
                        "articles": [
                            "Pro Git Book",
                            "Git Workflow Guide"
                        ],
                        "practice_links": [
                            "Learn Git Branching",
                            "GitHub Learning Lab"
                        ]
                    },
                    {
                        "id": "react-js",
                        "title": "React.js",
                        "slug": "react-js",
                        "level": "intermediate",
                        "description": "Build modern web applications with React",
                        "subtopics": [
                            "Components and Props",
                            "State and Lifecycle",
                            "Hooks",
                            "Context API",
                            "React Router"
                        ],
                        "tools": ["Create React App", "React DevTools"],
                        "articles": [
                            "React Official Docs",
                            "React Patterns"
                        ],
                        "practice_links": [
                            "React Tutorial",
                            "Build React Projects"
                        ]
                    },
                    {
                        "id": "state-management",
                        "title": "State Management",
                        "slug": "state-management",
                        "level": "intermediate",
                        "description": "Manage application state effectively",
                        "subtopics": [
                            "Redux",
                            "Redux Toolkit",
                            "Zustand",
                            "Recoil"
                        ],
                        "tools": ["Redux DevTools"],
                        "articles": [
                            "Redux Documentation",
                            "State Management Patterns"
                        ],
                        "practice_links": [
                            "Redux Tutorial",
                            "State Management Examples"
                        ]
                    }
                ]
            },
            {
                "level": "Advanced",
                "topics": [
                    {
                        "id": "typescript",
                        "title": "TypeScript",
                        "slug": "typescript",
                        "level": "advanced",
                        "description": "Add type safety to JavaScript applications",
                        "subtopics": [
                            "Type Annotations",
                            "Interfaces",
                            "Generics",
                            "Advanced Types"
                        ],
                        "tools": ["TypeScript Compiler", "TSConfig"],
                        "articles": [
                            "TypeScript Handbook",
                            "TypeScript Deep Dive"
                        ],
                        "practice_links": [
                            "TypeScript Exercises",
                            "Type Challenges"
                        ]
                    },
                    {
                        "id": "testing",
                        "title": "Testing",
                        "slug": "testing",
                        "level": "advanced",
                        "description": "Write tests for reliable applications",
                        "subtopics": [
                            "Unit Testing",
                            "Integration Testing",
                            "E2E Testing",
                            "Test-Driven Development"
                        ],
                        "tools": ["Jest", "React Testing Library", "Cypress"],
                        "articles": [
                            "Testing Best Practices",
                            "TDD Guide"
                        ],
                        "practice_links": [
                            "Testing JavaScript",
                            "Cypress Tutorial"
                        ]
                    },
                    {
                        "id": "performance-optimization",
                        "title": "Performance Optimization",
                        "slug": "performance-optimization",
                        "level": "advanced",
                        "description": "Optimize web application performance",
                        "subtopics": [
                            "Code Splitting",
                            "Lazy Loading",
                            "Memoization",
                            "Web Vitals"
                        ],
                        "tools": ["Lighthouse", "WebPageTest"],
                        "articles": [
                            "Web Performance Guide",
                            "React Performance"
                        ],
                        "practice_links": [
                            "Performance Optimization Course",
                            "Web Vitals Workshop"
                        ]
                    }
                ]
            }
        ]
    }

def generate_nodes(roadmap_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """STEP 4 & 6: Generate visualization nodes with positions"""
    nodes = []
    roadmap_slug = roadmap_data['slug']
    
    y_position = 80
    level_spacing = 300
    
    for section in roadmap_data['sections']:
        level = section['level'].lower()
        x_position = 200
        
        for i, topic in enumerate(section['topics']):
            node = {
                "id": topic['id'],
                "title": topic['title'],
                "slug": topic['slug'],
                "type": "core",
                "level": level,
                "description": topic['description'],
                "roadmap": roadmap_slug,
                "link": f"/roadmap/{roadmap_slug}/{topic['slug']}",
                "position": {
                    "x": x_position + (i * 250),
                    "y": y_position
                },
                "data": {
                    "title": topic['title'],
                    "level": level,
                    "link": f"/roadmap/{roadmap_slug}/{topic['slug']}"
                },
                "animation": {
                    "initial": {"opacity": 0, "scale": 0.8},
                    "animate": {"opacity": 1, "scale": 1},
                    "transition": {"duration": 0.4, "delay": i * 0.1}
                }
            }
            nodes.append(node)
        
        y_position += level_spacing
    
    return nodes

def generate_edges(roadmap_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """STEP 5: Generate dependency edges"""
    edges = []
    edge_id = 1
    
    all_topics = []
    for section in roadmap_data['sections']:
        all_topics.extend(section['topics'])
    
    # Create sequential dependencies
    for i in range(len(all_topics) - 1):
        source = all_topics[i]['id']
        target = all_topics[i + 1]['id']
        
        edge = {
            "id": f"e{edge_id}",
            "source": source,
            "target": target,
            "type": "dependency",
            "animated": True
        }
        edges.append(edge)
        edge_id += 1
    
    return edges

def generate_topic_details(topic: Dict[str, Any], roadmap_slug: str, next_topics: List[str]) -> Dict[str, Any]:
    """STEP 8: Generate topic detail page data"""
    return {
        "title": topic['title'],
        "slug": topic['slug'],
        "roadmap": roadmap_slug,
        "description": topic['description'],
        "learning_objectives": [
            f"Understand {topic['title']} fundamentals",
            f"Apply {topic['title']} in real projects",
            f"Master {topic['title']} best practices"
        ],
        "topics_to_learn": topic['subtopics'],
        "recommended_articles": topic['articles'],
        "practice_resources": topic['practice_links'],
        "projects": [
            f"Build a project using {topic['title']}",
            f"Create a portfolio piece with {topic['title']}"
        ],
        "next_topics": next_topics
    }

def generate_routes(roadmaps: List[Dict[str, Any]], roadmap_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """STEP 9: Generate navigation routes"""
    routes = []
    
    # Roadmap routes
    for roadmap in roadmaps:
        routes.append({
            "type": "roadmap",
            "path": roadmap['url']
        })
    
    # Topic routes
    for section in roadmap_data['sections']:
        for topic in section['topics']:
            routes.append({
                "type": "topic",
                "path": f"/roadmap/{roadmap_data['slug']}/{topic['slug']}"
            })
    
    return routes

def main():
    """Generate all roadmap data files"""
    print("🚀 Generating roadmap data...")
    
    # STEP 1: Generate roadmaps
    roadmaps = generate_roadmaps()
    
    # STEP 2-3: Generate detailed roadmap
    frontend_roadmap = generate_frontend_roadmap()
    
    # STEP 4-6: Generate nodes
    nodes = generate_nodes(frontend_roadmap)
    
    # STEP 5: Generate edges
    edges = generate_edges(frontend_roadmap)
    
    # STEP 8: Generate topic details
    topics = []
    all_topics = []
    for section in frontend_roadmap['sections']:
        all_topics.extend(section['topics'])
    
    for i, topic in enumerate(all_topics):
        next_topics = [all_topics[i + 1]['title']] if i < len(all_topics) - 1 else []
        topic_detail = generate_topic_details(topic, frontend_roadmap['slug'], next_topics)
        topics.append(topic_detail)
    
    # STEP 9: Generate routes
    routes = generate_routes(roadmaps, frontend_roadmap)
    
    # D3.js format
    d3_data = {
        "nodes": nodes,
        "links": [{"source": e["source"], "target": e["target"]} for e in edges]
    }
    
    # STEP 11: Save output files
    output_dir = "backend/data/roadmaps"
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    with open(f"{output_dir}/roadmaps.json", "w") as f:
        json.dump(roadmaps, f, indent=2)
    
    with open(f"{output_dir}/roadmap_nodes.json", "w") as f:
        json.dump(nodes, f, indent=2)
    
    with open(f"{output_dir}/roadmap_edges.json", "w") as f:
        json.dump(edges, f, indent=2)
    
    with open(f"{output_dir}/topics.json", "w") as f:
        json.dump(topics, f, indent=2)
    
    with open(f"{output_dir}/routes.json", "w") as f:
        json.dump(routes, f, indent=2)
    
    with open(f"{output_dir}/d3_graph.json", "w") as f:
        json.dump(d3_data, f, indent=2)
    
    print("✅ Generated files:")
    print(f"   - roadmaps.json ({len(roadmaps)} roadmaps)")
    print(f"   - roadmap_nodes.json ({len(nodes)} nodes)")
    print(f"   - roadmap_edges.json ({len(edges)} edges)")
    print(f"   - topics.json ({len(topics)} topics)")
    print(f"   - routes.json ({len(routes)} routes)")
    print(f"   - d3_graph.json (D3.js format)")
    print(f"\n📁 Files saved to: {output_dir}/")

if __name__ == "__main__":
    main()
