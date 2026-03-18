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
        # Role-Based Roadmaps
        {
            "title": "Frontend Developer",
            "slug": "frontend-developer",
            "url": "/roadmap/frontend-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/frontend.png",
            "short_description": "Step by step guide to becoming a modern frontend developer",
            "difficulty": "Beginner Friendly",
            "duration": "6-12 months"
        },
        {
            "title": "Backend Developer",
            "slug": "backend-developer",
            "url": "/roadmap/backend-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/backend.png",
            "short_description": "Step by step guide to becoming a modern backend developer",
            "difficulty": "Intermediate",
            "duration": "8-14 months"
        },
        {
            "title": "Full Stack Developer",
            "slug": "full-stack-developer",
            "url": "/roadmap/full-stack-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/fullstack.png",
            "short_description": "Step by step guide to becoming a modern full stack developer",
            "difficulty": "Advanced",
            "duration": "12-18 months"
        },
        {
            "title": "DevOps Engineer",
            "slug": "devops-engineer",
            "url": "/roadmap/devops-engineer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/devops.png",
            "short_description": "Step by step guide to becoming a modern DevOps engineer",
            "difficulty": "Advanced",
            "duration": "10-16 months"
        },
        {
            "title": "Data Scientist",
            "slug": "data-scientist",
            "url": "/roadmap/data-scientist",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/data-science.png",
            "short_description": "Step by step guide to becoming a data scientist",
            "difficulty": "Advanced",
            "duration": "12-18 months"
        },
        {
            "title": "Mobile Developer",
            "slug": "mobile-developer",
            "url": "/roadmap/mobile-developer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/mobile.png",
            "short_description": "Build native and cross-platform mobile applications",
            "difficulty": "Intermediate",
            "duration": "8-12 months"
        },
        {
            "title": "Machine Learning Engineer",
            "slug": "ml-engineer",
            "url": "/roadmap/ml-engineer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/ml.png",
            "short_description": "Build and deploy machine learning models",
            "difficulty": "Advanced",
            "duration": "14-20 months"
        },
        {
            "title": "Cloud Architect",
            "slug": "cloud-architect",
            "url": "/roadmap/cloud-architect",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/cloud.png",
            "short_description": "Design and manage cloud infrastructure",
            "difficulty": "Advanced",
            "duration": "12-18 months"
        },
        {
            "title": "Security Engineer",
            "slug": "security-engineer",
            "url": "/roadmap/security-engineer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/security.png",
            "short_description": "Protect systems and data from cyber threats",
            "difficulty": "Advanced",
            "duration": "12-16 months"
        },
        {
            "title": "UI/UX Designer",
            "slug": "ui-ux-designer",
            "url": "/roadmap/ui-ux-designer",
            "category": "Role-Based Roadmap",
            "thumbnail": "/images/design.png",
            "short_description": "Design beautiful and user-friendly interfaces",
            "difficulty": "Beginner Friendly",
            "duration": "6-10 months"
        },
        
        # Skill-Based Roadmaps
        {
            "title": "React Developer",
            "slug": "react-developer",
            "url": "/roadmap/react-developer",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/react.png",
            "short_description": "Master React.js and build modern web applications",
            "difficulty": "Intermediate",
            "duration": "4-6 months"
        },
        {
            "title": "Python Developer",
            "slug": "python-developer",
            "url": "/roadmap/python-developer",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/python.png",
            "short_description": "Learn Python programming from basics to advanced",
            "difficulty": "Beginner Friendly",
            "duration": "5-8 months"
        },
        {
            "title": "Node.js Developer",
            "slug": "nodejs-developer",
            "url": "/roadmap/nodejs-developer",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/nodejs.png",
            "short_description": "Build scalable backend applications with Node.js",
            "difficulty": "Intermediate",
            "duration": "4-7 months"
        },
        {
            "title": "Docker & Kubernetes",
            "slug": "docker-kubernetes",
            "url": "/roadmap/docker-kubernetes",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/docker.png",
            "short_description": "Master containerization and orchestration",
            "difficulty": "Intermediate",
            "duration": "3-5 months"
        },
        {
            "title": "AWS Cloud",
            "slug": "aws-cloud",
            "url": "/roadmap/aws-cloud",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/aws.png",
            "short_description": "Learn Amazon Web Services cloud platform",
            "difficulty": "Intermediate",
            "duration": "5-8 months"
        },
        {
            "title": "TypeScript",
            "slug": "typescript",
            "url": "/roadmap/typescript",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/typescript.png",
            "short_description": "Add type safety to JavaScript applications",
            "difficulty": "Intermediate",
            "duration": "2-4 months"
        },
        {
            "title": "GraphQL",
            "slug": "graphql",
            "url": "/roadmap/graphql",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/graphql.png",
            "short_description": "Build efficient APIs with GraphQL",
            "difficulty": "Intermediate",
            "duration": "2-3 months"
        },
        {
            "title": "PostgreSQL",
            "slug": "postgresql",
            "url": "/roadmap/postgresql",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/postgresql.png",
            "short_description": "Master PostgreSQL database management",
            "difficulty": "Intermediate",
            "duration": "3-5 months"
        },
        {
            "title": "MongoDB",
            "slug": "mongodb",
            "url": "/roadmap/mongodb",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/mongodb.png",
            "short_description": "Learn NoSQL database with MongoDB",
            "difficulty": "Beginner Friendly",
            "duration": "2-4 months"
        },
        {
            "title": "Vue.js",
            "slug": "vuejs",
            "url": "/roadmap/vuejs",
            "category": "Skill-Based Roadmap",
            "thumbnail": "/images/vue.png",
            "short_description": "Build progressive web applications with Vue.js",
            "difficulty": "Beginner Friendly",
            "duration": "3-5 months"
        }
    ]
    return roadmaps

def generate_frontend_roadmap() -> Dict[str, Any]:
    """STEP 2 & 3: Generate detailed Frontend Developer roadmap"""
    return {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "description": "Frontend development involves creating the user interface and user experience of web applications. This comprehensive roadmap covers everything from basic HTML/CSS to advanced frameworks, tools, and best practices used in modern web development.",
        "sections": [
            {
                "level": "Foundation",
                "topics": [
                    {
                        "id": "internet-basics",
                        "title": "How the Internet Works",
                        "slug": "internet-basics",
                        "level": "foundation",
                        "description": "Understand HTTP, DNS, browsers, and how the web works",
                        "subtopics": [
                            "HTTP/HTTPS Protocol",
                            "DNS and Domain Names",
                            "Browsers and How They Work",
                            "Hosting and Servers"
                        ],
                        "tools": ["Chrome DevTools", "Postman"],
                        "articles": [
                            "How the Web Works - MDN",
                            "HTTP Protocol Explained"
                        ],
                        "practice_links": [
                            "HTTP Status Codes Quiz",
                            "DNS Lookup Practice"
                        ]
                    },
                    {
                        "id": "html-basics",
                        "title": "HTML Fundamentals",
                        "slug": "html-basics",
                        "level": "foundation",
                        "description": "Learn HTML structure, semantic elements, and accessibility",
                        "subtopics": [
                            "HTML Document Structure",
                            "Semantic HTML5 Elements",
                            "Forms and Input Types",
                            "Tables and Lists",
                            "Accessibility (ARIA)",
                            "SEO Basics"
                        ],
                        "tools": ["VS Code", "HTML Validator"],
                        "articles": [
                            "MDN HTML Guide",
                            "Semantic HTML Best Practices",
                            "Web Accessibility Guide"
                        ],
                        "practice_links": [
                            "FreeCodeCamp HTML Course",
                            "HTML Exercises",
                            "Build a Portfolio Page"
                        ]
                    },
                    {
                        "id": "css-fundamentals",
                        "title": "CSS Fundamentals",
                        "slug": "css-fundamentals",
                        "level": "foundation",
                        "description": "Master CSS styling, layouts, and responsive design",
                        "subtopics": [
                            "CSS Selectors and Specificity",
                            "Box Model",
                            "Positioning",
                            "Flexbox Layout",
                            "CSS Grid",
                            "Responsive Design",
                            "Media Queries",
                            "CSS Variables"
                        ],
                        "tools": ["CSS Grid Generator", "Flexbox Playground", "Can I Use"],
                        "articles": [
                            "CSS Tricks Complete Guide",
                            "Modern CSS Layouts",
                            "Responsive Web Design"
                        ],
                        "practice_links": [
                            "CSS Diner",
                            "Flexbox Froggy",
                            "Grid Garden",
                            "Build Responsive Layouts"
                        ]
                    },
                    {
                        "id": "javascript-basics",
                        "title": "JavaScript Fundamentals",
                        "slug": "javascript-basics",
                        "level": "foundation",
                        "description": "Learn JavaScript core concepts and DOM manipulation",
                        "subtopics": [
                            "Variables and Data Types",
                            "Functions and Scope",
                            "Arrays and Objects",
                            "DOM Manipulation",
                            "Events and Event Handling",
                            "ES6+ Features",
                            "Async JavaScript",
                            "Promises and Async/Await"
                        ],
                        "tools": ["Browser Console", "Node.js", "ESLint"],
                        "articles": [
                            "JavaScript.info",
                            "MDN JavaScript Guide",
                            "You Don't Know JS"
                        ],
                        "practice_links": [
                            "JavaScript30",
                            "Exercism JavaScript Track",
                            "LeetCode Easy Problems"
                        ]
                    }
                ]
            },
            {
                "level": "Beginner",
                "topics": [
                    {
                        "id": "version-control",
                        "title": "Version Control (Git)",
                        "slug": "version-control",
                        "level": "beginner",
                        "description": "Master Git for code versioning and collaboration",
                        "subtopics": [
                            "Git Basics (init, add, commit)",
                            "Branching and Merging",
                            "GitHub/GitLab/Bitbucket",
                            "Pull Requests and Code Review",
                            "Git Workflows",
                            "Resolving Conflicts"
                        ],
                        "tools": ["Git", "GitHub", "GitLab", "GitHub Desktop"],
                        "articles": [
                            "Pro Git Book",
                            "Git Workflow Guide",
                            "GitHub Flow"
                        ],
                        "practice_links": [
                            "Learn Git Branching",
                            "GitHub Learning Lab",
                            "Git Exercises"
                        ]
                    },
                    {
                        "id": "package-managers",
                        "title": "Package Managers",
                        "slug": "package-managers",
                        "level": "beginner",
                        "description": "Learn npm, yarn, and package management",
                        "subtopics": [
                            "npm Basics",
                            "package.json",
                            "Installing Packages",
                            "Yarn",
                            "pnpm",
                            "Semantic Versioning"
                        ],
                        "tools": ["npm", "Yarn", "pnpm"],
                        "articles": [
                            "npm Documentation",
                            "Package Management Guide"
                        ],
                        "practice_links": [
                            "Create npm Package",
                            "Manage Dependencies"
                        ]
                    },
                    {
                        "id": "css-preprocessors",
                        "title": "CSS Preprocessors",
                        "slug": "css-preprocessors",
                        "level": "beginner",
                        "description": "Use Sass/SCSS for advanced CSS",
                        "subtopics": [
                            "Sass/SCSS Syntax",
                            "Variables and Nesting",
                            "Mixins and Functions",
                            "Partials and Imports",
                            "Less (Alternative)"
                        ],
                        "tools": ["Sass", "Less", "PostCSS"],
                        "articles": [
                            "Sass Guide",
                            "CSS Preprocessors Comparison"
                        ],
                        "practice_links": [
                            "Sass Exercises",
                            "Build with Sass"
                        ]
                    },
                    {
                        "id": "build-tools",
                        "title": "Build Tools",
                        "slug": "build-tools",
                        "level": "beginner",
                        "description": "Learn Webpack, Vite, and build processes",
                        "subtopics": [
                            "Module Bundlers",
                            "Webpack Basics",
                            "Vite",
                            "Parcel",
                            "Task Runners",
                            "Code Splitting"
                        ],
                        "tools": ["Webpack", "Vite", "Parcel", "Rollup"],
                        "articles": [
                            "Webpack Documentation",
                            "Vite Guide",
                            "Modern Build Tools"
                        ],
                        "practice_links": [
                            "Configure Webpack",
                            "Build Tool Comparison"
                        ]
                    }
                ]
            },
            {
                "level": "Intermediate",
                "topics": [
                    {
                        "id": "react-js",
                        "title": "React.js",
                        "slug": "react-js",
                        "level": "intermediate",
                        "description": "Build modern web applications with React",
                        "subtopics": [
                            "Components and Props",
                            "State and Lifecycle",
                            "Hooks (useState, useEffect, etc.)",
                            "Context API",
                            "React Router",
                            "Forms and Validation",
                            "Performance Optimization",
                            "Custom Hooks"
                        ],
                        "tools": ["Create React App", "React DevTools", "Vite"],
                        "articles": [
                            "React Official Docs",
                            "React Patterns",
                            "React Best Practices"
                        ],
                        "practice_links": [
                            "React Tutorial",
                            "Build React Projects",
                            "React Challenges"
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
                            "Recoil",
                            "MobX",
                            "Context API Patterns"
                        ],
                        "tools": ["Redux DevTools", "Zustand", "Recoil"],
                        "articles": [
                            "Redux Documentation",
                            "State Management Patterns",
                            "When to Use Redux"
                        ],
                        "practice_links": [
                            "Redux Tutorial",
                            "State Management Examples",
                            "Build Todo App with Redux"
                        ]
                    },
                    {
                        "id": "api-integration",
                        "title": "API Integration",
                        "slug": "api-integration",
                        "level": "intermediate",
                        "description": "Fetch and manage data from APIs",
                        "subtopics": [
                            "REST APIs",
                            "Fetch API",
                            "Axios",
                            "GraphQL",
                            "Apollo Client",
                            "React Query",
                            "SWR",
                            "Error Handling"
                        ],
                        "tools": ["Axios", "React Query", "Apollo Client", "Postman"],
                        "articles": [
                            "REST API Best Practices",
                            "GraphQL Guide",
                            "Data Fetching in React"
                        ],
                        "practice_links": [
                            "Build API Client",
                            "GraphQL Tutorial",
                            "API Integration Projects"
                        ]
                    },
                    {
                        "id": "styling-solutions",
                        "title": "Modern CSS Solutions",
                        "slug": "styling-solutions",
                        "level": "intermediate",
                        "description": "CSS-in-JS and modern styling approaches",
                        "subtopics": [
                            "Styled Components",
                            "Emotion",
                            "CSS Modules",
                            "Tailwind CSS",
                            "Material-UI",
                            "Chakra UI",
                            "Theme Management"
                        ],
                        "tools": ["Styled Components", "Tailwind CSS", "Material-UI"],
                        "articles": [
                            "CSS-in-JS Comparison",
                            "Tailwind CSS Guide",
                            "Component Libraries"
                        ],
                        "practice_links": [
                            "Style with Tailwind",
                            "Build UI Components",
                            "Theme Switching"
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
                            "Interfaces and Types",
                            "Generics",
                            "Advanced Types",
                            "TypeScript with React",
                            "Type Guards",
                            "Utility Types"
                        ],
                        "tools": ["TypeScript Compiler", "TSConfig", "TS-Node"],
                        "articles": [
                            "TypeScript Handbook",
                            "TypeScript Deep Dive",
                            "React TypeScript Cheatsheet"
                        ],
                        "practice_links": [
                            "TypeScript Exercises",
                            "Type Challenges",
                            "Convert JS to TS"
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
                            "Jest",
                            "React Testing Library",
                            "Cypress",
                            "Playwright",
                            "Test-Driven Development"
                        ],
                        "tools": ["Jest", "React Testing Library", "Cypress", "Playwright"],
                        "articles": [
                            "Testing Best Practices",
                            "TDD Guide",
                            "Testing React Applications"
                        ],
                        "practice_links": [
                            "Testing JavaScript",
                            "Cypress Tutorial",
                            "Write Test Suites"
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
                            "Web Vitals",
                            "Image Optimization",
                            "Bundle Size Optimization",
                            "Caching Strategies",
                            "Performance Monitoring"
                        ],
                        "tools": ["Lighthouse", "WebPageTest", "Bundle Analyzer"],
                        "articles": [
                            "Web Performance Guide",
                            "React Performance",
                            "Core Web Vitals"
                        ],
                        "practice_links": [
                            "Performance Optimization Course",
                            "Web Vitals Workshop",
                            "Optimize Real App"
                        ]
                    },
                    {
                        "id": "ssr-ssg",
                        "title": "SSR & SSG",
                        "slug": "ssr-ssg",
                        "level": "advanced",
                        "description": "Server-Side Rendering and Static Site Generation",
                        "subtopics": [
                            "Next.js",
                            "Server-Side Rendering",
                            "Static Site Generation",
                            "Incremental Static Regeneration",
                            "Gatsby",
                            "Remix",
                            "SEO Optimization"
                        ],
                        "tools": ["Next.js", "Gatsby", "Remix"],
                        "articles": [
                            "Next.js Documentation",
                            "SSR vs SSG vs CSR",
                            "Modern Rendering Patterns"
                        ],
                        "practice_links": [
                            "Build with Next.js",
                            "Gatsby Tutorial",
                            "SSR Project"
                        ]
                    },
                    {
                        "id": "pwa",
                        "title": "Progressive Web Apps",
                        "slug": "pwa",
                        "level": "advanced",
                        "description": "Build installable web applications",
                        "subtopics": [
                            "Service Workers",
                            "Web App Manifest",
                            "Offline Functionality",
                            "Push Notifications",
                            "App Shell Pattern",
                            "Workbox"
                        ],
                        "tools": ["Workbox", "Lighthouse", "PWA Builder"],
                        "articles": [
                            "PWA Guide",
                            "Service Workers Explained",
                            "Building PWAs"
                        ],
                        "practice_links": [
                            "Build a PWA",
                            "Service Worker Tutorial",
                            "PWA Checklist"
                        ]
                    },
                    {
                        "id": "web-security",
                        "title": "Web Security",
                        "slug": "web-security",
                        "level": "advanced",
                        "description": "Secure your web applications",
                        "subtopics": [
                            "HTTPS and SSL",
                            "CORS",
                            "XSS Prevention",
                            "CSRF Protection",
                            "Content Security Policy",
                            "Authentication",
                            "Authorization",
                            "OWASP Top 10"
                        ],
                        "tools": ["OWASP ZAP", "Snyk", "npm audit"],
                        "articles": [
                            "Web Security Guide",
                            "OWASP Top 10",
                            "Secure Coding Practices"
                        ],
                        "practice_links": [
                            "Security Challenges",
                            "Secure Your App",
                            "Security Audit"
                        ]
                    },
                    {
                        "id": "ci-cd",
                        "title": "CI/CD",
                        "slug": "ci-cd",
                        "level": "advanced",
                        "description": "Automate deployment and testing",
                        "subtopics": [
                            "GitHub Actions",
                            "GitLab CI",
                            "Jenkins",
                            "Automated Testing",
                            "Deployment Strategies",
                            "Docker",
                            "Vercel/Netlify"
                        ],
                        "tools": ["GitHub Actions", "Docker", "Vercel", "Netlify"],
                        "articles": [
                            "CI/CD Best Practices",
                            "GitHub Actions Guide",
                            "Deployment Automation"
                        ],
                        "practice_links": [
                            "Setup CI/CD Pipeline",
                            "Automate Deployment",
                            "Docker Tutorial"
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
    
    y_position = 100
    level_spacing = 350
    
    for section_idx, section in enumerate(roadmap_data['sections']):
        level = section['level'].lower()
        topics_count = len(section['topics'])
        
        # Calculate starting x position to center the row
        total_width = (topics_count - 1) * 300
        x_start = 400 - (total_width / 2)
        
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
                    "x": x_start + (i * 300),
                    "y": y_position
                },
                "data": {
                    "title": topic['title'],
                    "level": level,
                    "link": f"/roadmap/{roadmap_slug}/{topic['slug']}",
                    "subtopics": topic['subtopics'],
                    "tools": topic['tools']
                },
                "animation": {
                    "initial": {"opacity": 0, "scale": 0.8, "y": 20},
                    "animate": {"opacity": 1, "scale": 1, "y": 0},
                    "transition": {
                        "duration": 0.5,
                        "delay": (section_idx * 0.3) + (i * 0.1),
                        "ease": "easeOut"
                    }
                },
                "style": {
                    "background": get_level_color(level),
                    "border": f"2px solid {get_level_border(level)}",
                    "borderRadius": "12px",
                    "padding": "16px",
                    "minWidth": "200px"
                }
            }
            nodes.append(node)
        
        y_position += level_spacing
    
    return nodes

def get_level_color(level: str) -> str:
    """Get background color for level"""
    colors = {
        "foundation": "#e3f2fd",
        "beginner": "#f3e5f5",
        "intermediate": "#fff3e0",
        "advanced": "#ffebee"
    }
    return colors.get(level, "#f5f5f5")

def get_level_border(level: str) -> str:
    """Get border color for level"""
    borders = {
        "foundation": "#2196f3",
        "beginner": "#9c27b0",
        "intermediate": "#ff9800",
        "advanced": "#f44336"
    }
    return borders.get(level, "#9e9e9e")

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
    print("🚀 Generating comprehensive roadmap data...")
    print("=" * 60)
    
    # STEP 1: Generate roadmaps
    roadmaps = generate_roadmaps()
    print(f"✅ Generated {len(roadmaps)} roadmaps")
    print(f"   - Role-Based: {len([r for r in roadmaps if r['category'] == 'Role-Based Roadmap'])}")
    print(f"   - Skill-Based: {len([r for r in roadmaps if r['category'] == 'Skill-Based Roadmap'])}")
    
    # STEP 2-3: Generate detailed roadmap
    frontend_roadmap = generate_frontend_roadmap()
    print(f"\n✅ Generated detailed Frontend Developer roadmap")
    print(f"   - Sections: {len(frontend_roadmap['sections'])}")
    total_topics = sum(len(s['topics']) for s in frontend_roadmap['sections'])
    print(f"   - Total Topics: {total_topics}")
    
    # STEP 4-6: Generate nodes
    nodes = generate_nodes(frontend_roadmap)
    print(f"\n✅ Generated {len(nodes)} visualization nodes")
    
    # STEP 5: Generate edges
    edges = generate_edges(frontend_roadmap)
    print(f"✅ Generated {len(edges)} dependency edges")
    
    # STEP 8: Generate topic details
    topics = []
    all_topics = []
    for section in frontend_roadmap['sections']:
        all_topics.extend(section['topics'])
    
    for i, topic in enumerate(all_topics):
        next_topics = [all_topics[i + 1]['title']] if i < len(all_topics) - 1 else []
        topic_detail = generate_topic_details(topic, frontend_roadmap['slug'], next_topics)
        topics.append(topic_detail)
    
    print(f"✅ Generated {len(topics)} detailed topic pages")
    
    # STEP 9: Generate routes
    routes = generate_routes(roadmaps, frontend_roadmap)
    print(f"✅ Generated {len(routes)} navigation routes")
    
    # D3.js format
    d3_data = {
        "nodes": nodes,
        "links": [{"source": e["source"], "target": e["target"], "value": 1} for e in edges]
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
    
    # Frontend roadmap detail
    with open(f"{output_dir}/frontend_roadmap.json", "w") as f:
        json.dump(frontend_roadmap, f, indent=2)
    
    print("\n" + "=" * 60)
    print("📁 Files saved to: backend/data/roadmaps/")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"   Total Roadmaps: {len(roadmaps)}")
    print(f"   Total Nodes: {len(nodes)}")
    print(f"   Total Edges: {len(edges)}")
    print(f"   Total Topics: {len(topics)}")
    print(f"   Total Routes: {len(routes)}")
    print(f"   Levels: {len(frontend_roadmap['sections'])}")
    print("\n✅ Ready for React Flow + Framer Motion + D3.js visualization!")
    print("=" * 60)

if __name__ == "__main__":
    main()
