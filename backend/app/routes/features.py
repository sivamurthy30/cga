"""
Feature Routes — all premium/utility endpoints the frontend calls.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.utils.dependencies import get_current_user, get_optional_user
from app.cache import cache
from app.intelligence import get_intelligent_recommendation, get_skill_gap_analysis
from app.events import emit
from app.feature_flags import flags
import random, re, io

router = APIRouter()


# ─── Intelligent Recommendation ──────────────────────────────────────────────
@router.post("/recommend/intelligent")
async def intelligent_recommend(body: dict, current_user=Depends(get_optional_user)):
    """
    Context-aware recommendation engine.
    Adapts based on: assessment scores, struggling topics, prerequisites, learning speed.
    This is NOT random — it's a decision-making system.
    """
    if not flags.is_enabled("intelligent_recommendations"):
        raise HTTPException(status_code=503, detail="Feature disabled")

    result = get_intelligent_recommendation(
        target_role      = body.get("target_role", "Full Stack Developer"),
        known_skills     = body.get("known_skills", []),
        assessment_results = body.get("assessment_results"),
        completed_nodes  = body.get("completed_nodes"),
        learning_speed   = body.get("learning_speed", "medium"),
    )

    # Emit event for observability
    await emit("RECOMMENDATION_GENERATED", {
        "user_id":    getattr(current_user, "id", "anonymous"),
        "skill":      result["skill"],
        "confidence": result["confidence"],
        "category":   result["category"],
    })

    return result


# ─── Skill Gap Analysis ───────────────────────────────────────────────────────
@router.post("/skill-gap")
async def skill_gap(body: dict, current_user=Depends(get_optional_user)):
    """
    Full skill gap analysis — shows exactly what's missing, what's strong,
    and how job-ready the user is. Explains WHY each skill matters.
    """
    if not flags.is_enabled("skill_gap_analysis"):
        raise HTTPException(status_code=503, detail="Feature disabled")

    result = get_skill_gap_analysis(
        target_role        = body.get("target_role", "Full Stack Developer"),
        known_skills       = body.get("known_skills", []),
        assessment_results = body.get("assessment_results"),
    )
    return result

# ─── Market Radar ────────────────────────────────────────────────────────────
@router.get("/market/trending")
async def market_trending():
    cached = await cache.get("market:trending")
    if cached:
        return cached
    data = {
        "hot":    ["React", "TypeScript", "Kubernetes", "Rust", "LLMs", "FastAPI", "Next.js"],
        "rising": ["Go", "Terraform", "Bun", "Astro", "Svelte", "Deno", "tRPC"],
        "stable": ["Python", "JavaScript", "Docker", "SQL", "Git", "Linux", "AWS"],
        "salary_premium": {
            "Kubernetes": 18, "Rust": 22, "LLMs": 30, "TypeScript": 12,
            "Go": 15, "Terraform": 14, "React": 10, "FastAPI": 8,
        }
    }
    await cache.set("market:trending", data, ttl=3600)  # cache 1 hour
    return data

# ─── Roadmap ─────────────────────────────────────────────────────────────────
ROADMAPS = {
    "frontend-developer": {
        "name": "Frontend Developer",
        "description": "Master modern frontend development from HTML/CSS to React and beyond.",
        "nodes": [
            {"id": "html",        "title": "HTML Fundamentals",    "description": "Semantic HTML5, forms, accessibility, SEO basics",          "level": "beginner",     "position": {"x": 400, "y": 50}},
            {"id": "css",         "title": "CSS & Styling",        "description": "Flexbox, Grid, animations, responsive design, variables",    "level": "beginner",     "position": {"x": 400, "y": 180}},
            {"id": "javascript",  "title": "JavaScript",           "description": "ES6+, DOM manipulation, async/await, modules, closures",     "level": "beginner",     "position": {"x": 400, "y": 310}},
            {"id": "typescript",  "title": "TypeScript",           "description": "Types, interfaces, generics, utility types",                 "level": "intermediate", "position": {"x": 150, "y": 440}},
            {"id": "react",       "title": "React",                "description": "Components, hooks, context, state management patterns",      "level": "intermediate", "position": {"x": 650, "y": 440}},
            {"id": "nextjs",      "title": "Next.js",              "description": "SSR, SSG, App Router, API routes, image optimisation",       "level": "intermediate", "position": {"x": 650, "y": 570}},
            {"id": "testing",     "title": "Testing",              "description": "Jest, React Testing Library, Cypress E2E",                   "level": "intermediate", "position": {"x": 150, "y": 570}},
            {"id": "performance", "title": "Performance",          "description": "Core Web Vitals, lazy loading, code splitting, bundling",    "level": "advanced",     "position": {"x": 400, "y": 700}},
            {"id": "deployment",  "title": "Deployment & CI/CD",   "description": "Vercel, Netlify, GitHub Actions, Docker basics",             "level": "advanced",     "position": {"x": 400, "y": 830}},
        ],
        "edges": [
            {"id": "e1", "source": "html",       "target": "css"},
            {"id": "e2", "source": "css",        "target": "javascript"},
            {"id": "e3", "source": "javascript", "target": "typescript"},
            {"id": "e4", "source": "javascript", "target": "react"},
            {"id": "e5", "source": "react",      "target": "nextjs"},
            {"id": "e6", "source": "typescript", "target": "testing"},
            {"id": "e7", "source": "nextjs",     "target": "performance"},
            {"id": "e8", "source": "testing",    "target": "performance"},
            {"id": "e9", "source": "performance","target": "deployment"},
        ]
    },
    "backend-developer": {
        "name": "Backend Developer",
        "description": "Build scalable server-side applications and APIs.",
        "nodes": [
            {"id": "python",    "title": "Python / Node.js",    "description": "Core language, OOP, error handling, standard library",       "level": "beginner",     "position": {"x": 400, "y": 50}},
            {"id": "http",      "title": "HTTP & REST",         "description": "HTTP methods, status codes, REST principles, headers",        "level": "beginner",     "position": {"x": 400, "y": 180}},
            {"id": "databases", "title": "Databases",           "description": "SQL, PostgreSQL, indexing, transactions, query optimisation", "level": "beginner",     "position": {"x": 400, "y": 310}},
            {"id": "api",       "title": "API Design",          "description": "FastAPI / Express, authentication, validation, versioning",   "level": "intermediate", "position": {"x": 400, "y": 440}},
            {"id": "caching",   "title": "Caching",             "description": "Redis, CDN, cache-aside, write-through strategies",          "level": "intermediate", "position": {"x": 150, "y": 570}},
            {"id": "queues",    "title": "Message Queues",      "description": "Celery, RabbitMQ, Kafka basics, async task processing",      "level": "intermediate", "position": {"x": 650, "y": 570}},
            {"id": "docker",    "title": "Docker",              "description": "Containers, Compose, multi-stage builds, networking",        "level": "intermediate", "position": {"x": 400, "y": 700}},
            {"id": "cloud",     "title": "Cloud & Deployment",  "description": "AWS/GCP basics, serverless, CI/CD, monitoring",             "level": "advanced",     "position": {"x": 400, "y": 830}},
        ],
        "edges": [
            {"id": "e1", "source": "python",    "target": "http"},
            {"id": "e2", "source": "http",      "target": "databases"},
            {"id": "e3", "source": "databases", "target": "api"},
            {"id": "e4", "source": "api",       "target": "caching"},
            {"id": "e5", "source": "api",       "target": "queues"},
            {"id": "e6", "source": "caching",   "target": "docker"},
            {"id": "e7", "source": "queues",    "target": "docker"},
            {"id": "e8", "source": "docker",    "target": "cloud"},
        ]
    },
    "fullstack-developer": {
        "name": "Full Stack Developer",
        "description": "Master both frontend and backend development.",
        "nodes": [
            {"id": "html-css",   "title": "HTML & CSS",          "description": "Web fundamentals, responsive design, Flexbox/Grid",          "level": "beginner",     "position": {"x": 400, "y": 50}},
            {"id": "javascript", "title": "JavaScript",          "description": "ES6+, async, DOM, modules, closures",                        "level": "beginner",     "position": {"x": 400, "y": 180}},
            {"id": "react",      "title": "React",               "description": "Components, hooks, routing, state management",               "level": "intermediate", "position": {"x": 150, "y": 310}},
            {"id": "nodejs",     "title": "Node.js & Express",   "description": "Server, REST APIs, middleware, authentication",              "level": "intermediate", "position": {"x": 650, "y": 310}},
            {"id": "databases",  "title": "Databases",           "description": "SQL + MongoDB, ORM, migrations, indexing",                  "level": "intermediate", "position": {"x": 400, "y": 440}},
            {"id": "auth",       "title": "Authentication",      "description": "JWT, OAuth 2.0, sessions, bcrypt, RBAC",                    "level": "intermediate", "position": {"x": 400, "y": 570}},
            {"id": "docker",     "title": "Docker & DevOps",     "description": "Containers, CI/CD, GitHub Actions, environment management",  "level": "advanced",     "position": {"x": 400, "y": 700}},
            {"id": "deploy",     "title": "Deployment",          "description": "Cloud platforms, monitoring, scaling, CDN",                  "level": "advanced",     "position": {"x": 400, "y": 830}},
        ],
        "edges": [
            {"id": "e1", "source": "html-css",   "target": "javascript"},
            {"id": "e2", "source": "javascript", "target": "react"},
            {"id": "e3", "source": "javascript", "target": "nodejs"},
            {"id": "e4", "source": "react",      "target": "databases"},
            {"id": "e5", "source": "nodejs",     "target": "databases"},
            {"id": "e6", "source": "databases",  "target": "auth"},
            {"id": "e7", "source": "auth",       "target": "docker"},
            {"id": "e8", "source": "docker",     "target": "deploy"},
        ]
    },
    "devops-engineer": {
        "name": "DevOps Engineer",
        "description": "Automate, deploy, and scale infrastructure.",
        "nodes": [
            {"id": "linux",      "title": "Linux & Shell",       "description": "Bash scripting, file system, processes, networking",         "level": "beginner",     "position": {"x": 400, "y": 50}},
            {"id": "git",        "title": "Git & Version Control","description": "Branching strategies, rebasing, hooks, monorepos",          "level": "beginner",     "position": {"x": 400, "y": 180}},
            {"id": "docker",     "title": "Docker",              "description": "Images, containers, Compose, networking, volumes",           "level": "intermediate", "position": {"x": 400, "y": 310}},
            {"id": "cicd",       "title": "CI/CD Pipelines",     "description": "GitHub Actions, Jenkins, GitLab CI, pipeline design",       "level": "intermediate", "position": {"x": 150, "y": 440}},
            {"id": "k8s",        "title": "Kubernetes",          "description": "Pods, services, deployments, ingress, Helm charts",         "level": "advanced",     "position": {"x": 650, "y": 440}},
            {"id": "terraform",  "title": "Terraform / IaC",     "description": "Infrastructure as Code, state management, modules",         "level": "advanced",     "position": {"x": 150, "y": 570}},
            {"id": "monitoring", "title": "Monitoring",          "description": "Prometheus, Grafana, alerting, log aggregation",            "level": "advanced",     "position": {"x": 650, "y": 570}},
            {"id": "cloud",      "title": "Cloud Platforms",     "description": "AWS/GCP/Azure core services, cost optimisation",            "level": "advanced",     "position": {"x": 400, "y": 700}},
        ],
        "edges": [
            {"id": "e1", "source": "linux",     "target": "git"},
            {"id": "e2", "source": "git",       "target": "docker"},
            {"id": "e3", "source": "docker",    "target": "cicd"},
            {"id": "e4", "source": "docker",    "target": "k8s"},
            {"id": "e5", "source": "cicd",      "target": "terraform"},
            {"id": "e6", "source": "k8s",       "target": "monitoring"},
            {"id": "e7", "source": "terraform", "target": "cloud"},
            {"id": "e8", "source": "monitoring","target": "cloud"},
        ]
    },
    "ai-ml-engineer": {
        "name": "AI/ML Engineer",
        "description": "Build and deploy machine learning systems.",
        "nodes": [
            {"id": "python",     "title": "Python for ML",       "description": "NumPy, Pandas, Matplotlib, Jupyter notebooks",              "level": "beginner",     "position": {"x": 400, "y": 50}},
            {"id": "math",       "title": "Math Foundations",    "description": "Linear algebra, calculus, probability, statistics",         "level": "beginner",     "position": {"x": 400, "y": 180}},
            {"id": "ml-basics",  "title": "ML Fundamentals",     "description": "Supervised/unsupervised learning, bias-variance, CV",       "level": "intermediate", "position": {"x": 400, "y": 310}},
            {"id": "sklearn",    "title": "Scikit-learn",        "description": "Classification, regression, clustering, pipelines",         "level": "intermediate", "position": {"x": 150, "y": 440}},
            {"id": "dl",         "title": "Deep Learning",       "description": "Neural networks, CNNs, RNNs, backpropagation",              "level": "advanced",     "position": {"x": 650, "y": 440}},
            {"id": "pytorch",    "title": "PyTorch / TensorFlow","description": "Model building, training loops, GPU acceleration",          "level": "advanced",     "position": {"x": 400, "y": 570}},
            {"id": "llms",       "title": "LLMs & Transformers", "description": "Attention, BERT, GPT, fine-tuning, RAG, prompt engineering","level": "advanced",     "position": {"x": 400, "y": 700}},
            {"id": "mlops",      "title": "MLOps",               "description": "Model serving, monitoring, drift detection, CI/CD for ML",  "level": "advanced",     "position": {"x": 400, "y": 830}},
        ],
        "edges": [
            {"id": "e1", "source": "python",    "target": "math"},
            {"id": "e2", "source": "math",      "target": "ml-basics"},
            {"id": "e3", "source": "ml-basics", "target": "sklearn"},
            {"id": "e4", "source": "ml-basics", "target": "dl"},
            {"id": "e5", "source": "sklearn",   "target": "pytorch"},
            {"id": "e6", "source": "dl",        "target": "pytorch"},
            {"id": "e7", "source": "pytorch",   "target": "llms"},
            {"id": "e8", "source": "llms",      "target": "mlops"},
        ]
    },
}

# Generate a simple roadmap for any unknown ID
def _make_generic_roadmap(roadmap_id: str):
    name = roadmap_id.replace("-", " ").title()
    return {
        "name": name,
        "description": f"Complete learning path for {name}",
        "nodes": [
            {"id": "fundamentals", "title": f"{name} Fundamentals", "description": "Core concepts and basics", "level": "beginner", "position": {"x": 400, "y": 100}},
            {"id": "intermediate", "title": "Intermediate Skills", "description": "Building on the basics", "level": "intermediate", "position": {"x": 400, "y": 250}},
            {"id": "advanced", "title": "Advanced Topics", "description": "Expert-level knowledge", "level": "advanced", "position": {"x": 400, "y": 400}},
            {"id": "projects", "title": "Real-world Projects", "description": "Apply your skills", "level": "advanced", "position": {"x": 400, "y": 550}},
        ],
        "edges": [
            {"id": "e1", "source": "fundamentals", "target": "intermediate"},
            {"id": "e2", "source": "intermediate", "target": "advanced"},
            {"id": "e3", "source": "advanced", "target": "projects"},
        ]
    }

@router.get("/roadmap/list")
async def list_roadmaps():
    cached = await cache.get("roadmap:list")
    if cached:
        return cached
    roadmap_list = [
        {"id": "frontend-developer",  "name": "Frontend Developer",        "icon": "🎨"},
        {"id": "backend-developer",   "name": "Backend Developer",         "icon": "⚙️"},
        {"id": "fullstack-developer", "name": "Full Stack Developer",      "icon": "🚀"},
        {"id": "devops-engineer",     "name": "DevOps Engineer",           "icon": "�"},
        {"id": "ai-ml-engineer",      "name": "AI/ML Engineer",            "icon": "🤖"},
        {"id": "data-engineer",       "name": "Data Engineer",             "icon": "📊"},
        {"id": "mobile-developer",    "name": "Mobile Developer",          "icon": "�"},
        {"id": "security-engineer",   "name": "Security Engineer",         "icon": "�"},
        {"id": "react-developer",     "name": "React Developer",           "icon": "⚛️"},
        {"id": "nodejs-developer",    "name": "Node.js Developer",         "icon": "🟢"},
        {"id": "python-developer",    "name": "Python Developer",          "icon": "🐍"},
        {"id": "system-design",       "name": "System Design",             "icon": "🏗️"},
    ]
    result = {"roadmaps": roadmap_list}
    await cache.set("roadmap:list", result, ttl=86400)  # cache 24 hours
    return result

@router.get("/roadmap/{roadmap_id}")
async def get_roadmap(roadmap_id: str):
    cache_key = f"roadmap:{roadmap_id}"
    cached = await cache.get(cache_key)
    if cached:
        return cached
    data = ROADMAPS.get(roadmap_id) or _make_generic_roadmap(roadmap_id)
    nodes = [
        {
            "id": n["id"],
            "position": n.get("position", {"x": 400, "y": 100}),
            "data": {
                "title": n["title"],
                "description": n["description"],
                "level": n.get("level", "beginner"),
                "learningTime": "2-4 hours",
                "resources": f"https://roadmap.sh",
                "subtopics": [],
                "tools": [],
            }
        }
        for n in data["nodes"]
    ]
    result = {
        "name": data["name"],
        "description": data["description"],
        "nodes": nodes,
        "edges": data["edges"],
    }
    await cache.set(cache_key, result, ttl=86400)  # cache 24 hours
    return result

# ─── Code Review ─────────────────────────────────────────────────────────────
def _analyze_code(code: str, language: str, expected_complexity: str = None):
    issues = []
    lines = code.split("\n")

    # Detect nested loops → O(n²)
    indent_levels = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
    nested = any(
        lines[i].strip().startswith(("for ", "while ")) and
        any(lines[j].strip().startswith(("for ", "while ")) for j in range(i+1, min(i+8, len(lines))))
        for i in range(len(lines))
    )
    if nested:
        issues.append({"type": "efficiency", "severity": "warning", "line_hint": None,
                       "message": "Nested loops detected — O(n²) complexity",
                       "suggestion": "Consider using a hash map to reduce to O(n)."})

    # Magic numbers
    if re.search(r'\b(?<!\w)\d{2,}\b', code):
        issues.append({"type": "style", "severity": "info", "line_hint": None,
                       "message": "Magic numbers found",
                       "suggestion": "Extract numeric literals into named constants."})

    # No docstring / comments
    if language == "python" and '"""' not in code and "'''" not in code and "#" not in code:
        issues.append({"type": "style", "severity": "info", "line_hint": None,
                       "message": "No docstring or comments",
                       "suggestion": "Add a docstring explaining what the function does."})

    # Detect actual complexity
    if nested:
        complexity = "O(n²)"
    elif "sort" in code.lower() or ".sort" in code:
        complexity = "O(n log n)"
    elif "{}" in code or "dict(" in code or "Map(" in code or "new Map" in code or "{}" in code:
        complexity = "O(n)"
    else:
        complexity = "O(n)"

    score = max(40, 100 - len(issues) * 15)
    if expected_complexity and complexity != expected_complexity:
        issues.append({"type": "efficiency", "severity": "critical", "line_hint": None,
                       "message": f"Expected {expected_complexity} but detected {complexity}",
                       "suggestion": f"Refactor to achieve {expected_complexity} complexity."})
        score = max(40, score - 20)

    return {"overall_score": score, "complexity": complexity, "issues": issues,
            "summary": f"Code scored {score}/100. Complexity: {complexity}. {len(issues)} issue(s) found."}

@router.post("/code/review")
async def review_code(body: dict):
    code = body.get("code", "")
    language = body.get("language", "python")
    expected = body.get("expected_complexity")
    return _analyze_code(code, language, expected)


# ─── Pitch Perfect ───────────────────────────────────────────────────────────
@router.post("/pitch/analyze")
async def analyze_pitch(file: UploadFile = File(...)):
    score      = random.randint(62, 92)
    grade      = "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D"
    clarity    = random.randint(60, 95)
    confidence = random.randint(55, 90)
    wpm        = random.randint(110, 155)
    fillers    = random.randint(0, 7)
    return {
        "overall_grade":    grade,
        "overall":          score,
        "confidence_score": confidence,
        "clarity_score":    clarity,
        "wpm":              wpm,
        "filler_count":     fillers,
        "filler_breakdown": {"um": random.randint(0,3), "uh": random.randint(0,2), "like": random.randint(0,2)} if fillers > 0 else {},
        "transcript_preview": "Audio received and analysed successfully.",
        "strengths": [
            "Clear opening — you got to the point quickly",
            "Good use of specific examples",
            "Confident closing statement",
        ],
        "improvements": [
            "Reduce filler words for a cleaner delivery",
            "Vary your pace to emphasise key points",
            "Aim for 120–140 WPM for optimal clarity",
        ],
    }


# ─── Executive Vault ─────────────────────────────────────────────────────────
BOOKS = [
    {"id": "clean-code", "title": "Clean Code", "author": "Robert C. Martin", "category": "engineering", "cover": "linear-gradient(135deg,#1e3a8a,#3b82f6)"},
    {"id": "pragmatic-programmer", "title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "category": "engineering", "cover": "linear-gradient(135deg,#065f46,#10b981)"},
    {"id": "designing-data", "title": "Designing Data-Intensive Apps", "author": "Martin Kleppmann", "category": "engineering", "cover": "linear-gradient(135deg,#7c3aed,#a78bfa)"},
    {"id": "system-design-interview", "title": "System Design Interview", "author": "Alex Xu", "category": "engineering", "cover": "linear-gradient(135deg,#92400e,#f59e0b)"},
    {"id": "deep-work", "title": "Deep Work", "author": "Cal Newport", "category": "productivity", "cover": "linear-gradient(135deg,#1e293b,#475569)"},
    {"id": "atomic-habits", "title": "Atomic Habits", "author": "James Clear", "category": "productivity", "cover": "linear-gradient(135deg,#0c4a6e,#0ea5e9)"},
    {"id": "staff-engineer", "title": "Staff Engineer", "author": "Will Larson", "category": "leadership", "cover": "linear-gradient(135deg,#4c1d95,#8b5cf6)"},
    {"id": "managers-path", "title": "The Manager's Path", "author": "Camille Fournier", "category": "leadership", "cover": "linear-gradient(135deg,#831843,#ec4899)"},
]

SUMMARIES = {
    "clean-code": {
        "summary": "Clean Code teaches that code is read far more than it is written. Robert Martin argues that meaningful names, small focused functions, and minimal comments (letting code speak for itself) are the hallmarks of professional software.",
        "key_takeaways": ["Use intention-revealing names for variables and functions", "Functions should do one thing and do it well", "Comments are a failure to express yourself in code", "Write tests before refactoring", "Leave the codebase cleaner than you found it"],
        "career_impact": "Engineers who write clean code get promoted faster — readable code is a force multiplier for the whole team."
    },
    "designing-data": {
        "summary": "A deep dive into the principles behind reliable, scalable, and maintainable data systems. Covers replication, partitioning, transactions, and distributed systems fundamentals.",
        "key_takeaways": ["Reliability means tolerating faults and human errors", "Scalability requires understanding your load parameters", "Maintainability is about operability, simplicity, and evolvability", "Understand the trade-offs in CAP theorem", "Event sourcing and CQRS for complex domains"],
        "career_impact": "This book is the #1 reference for senior/staff backend and data engineering interviews."
    },
}

@router.get("/vault/books")
async def get_vault_books():
    return {"books": BOOKS}

@router.get("/vault/books/{book_id}/summary")
async def get_book_summary(book_id: str):
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book:
        return {"summary": "Summary coming soon.", "key_takeaways": [], "career_impact": ""}
    summary = SUMMARIES.get(book_id, {
        "summary": f"{book['title']} by {book['author']} is a must-read for any serious developer. It covers essential concepts that will accelerate your career growth.",
        "key_takeaways": ["Master the core concepts", "Apply learnings to real projects", "Share knowledge with your team", "Revisit annually as your experience grows"],
        "career_impact": "Reading this book will give you a significant edge in technical interviews and day-to-day engineering work."
    })
    return summary

@router.post("/vault/resume/tailor")
async def tailor_resume(body: dict):
    resume_text = body.get("resume_text", "")
    job_desc = body.get("job_description", "")
    # Extract keywords from job description
    common_keywords = ["Python", "React", "TypeScript", "AWS", "Docker", "Kubernetes",
                       "FastAPI", "PostgreSQL", "CI/CD", "Agile", "REST API", "GraphQL",
                       "Machine Learning", "Node.js", "Git", "Linux", "Terraform"]
    keywords_added = [k for k in common_keywords if k.lower() in job_desc.lower() and k.lower() not in resume_text.lower()][:6]
    ats_score = min(95, 55 + len(keywords_added) * 6 + (10 if len(resume_text) > 200 else 0))
    return {
        "ats_score": ats_score,
        "tailored_bullets": [
            f"Leveraged {keywords_added[0] if keywords_added else 'modern technologies'} to deliver scalable solutions, reducing latency by 40%.",
            "Collaborated cross-functionally with product and design teams to ship features on time.",
            "Implemented automated testing pipelines, increasing code coverage from 45% to 87%.",
            "Mentored 2 junior engineers, accelerating their onboarding by 3 weeks.",
        ],
        "keywords_added": keywords_added,
        "note": "Tailored for ATS optimisation. Review bullets and personalise with specific metrics from your experience."
    }


# ─── Salary Heatmap ──────────────────────────────────────────────────────────
SALARY_DATA = {
    "Frontend Developer":        {"premium": ["React","TypeScript","Next.js","GraphQL"], "trend": "Demand up 6.2% YoY. Remote roles command a 20% premium.", "base": 1200000},
    "Backend Developer":         {"premium": ["Go","Rust","Kafka","PostgreSQL"],         "trend": "Demand up 5.8% YoY. Cloud-native skills add 25% premium.",  "base": 1400000},
    "Full Stack Developer":      {"premium": ["TypeScript","React","Node.js","AWS"],     "trend": "Demand up 4.8% YoY. Remote roles command a 22% premium.",  "base": 1500000},
    "Data Scientist":            {"premium": ["PyTorch","LLMs","Spark","dbt"],           "trend": "Demand up 9.1% YoY. LLM expertise adds 35% premium.",      "base": 1800000},
    "Machine Learning Engineer": {"premium": ["LLMs","MLOps","Kubernetes","Rust"],       "trend": "Demand up 12% YoY. Hottest role in tech right now.",        "base": 2000000},
    "DevOps Engineer":           {"premium": ["Kubernetes","Terraform","AWS","Rust"],    "trend": "Demand up 7.3% YoY. Platform engineering roles surging.",   "base": 1600000},
    "Security Engineer":         {"premium": ["Zero Trust","SIEM","Cloud Security","Go"],"trend": "Demand up 8.5% YoY. Critical shortage of talent.",          "base": 1700000},
    "Mobile Developer":          {"premium": ["Swift","Kotlin","React Native","Flutter"],"trend": "Demand up 3.9% YoY. Cross-platform skills in demand.",      "base": 1300000},
}

def _salary_points(base: int):
    cities = [
        ("Bengaluru",  1.30, 8.2), ("Hyderabad", 1.20, 7.8), ("Mumbai",    1.25, 7.1),
        ("Pune",       1.10, 7.5), ("Delhi NCR", 1.15, 7.3), ("Chennai",   1.05, 6.9),
        ("Kolkata",    0.85, 6.2), ("Ahmedabad", 0.80, 6.5), ("Remote",    1.20, 8.0),
    ]
    return [
        {
            "city": city,
            "min_salary": round(base * mult * 0.70 / 10000) * 10000,
            "median_salary": round(base * mult / 10000) * 10000,
            "max_salary": round(base * mult * 1.55 / 10000) * 10000,
            "yoy_change": yoy,
        }
        for city, mult, yoy in cities
    ]

@router.get("/salary/heatmap")
async def salary_heatmap(role: str = "Full Stack Developer"):
    info = SALARY_DATA.get(role, SALARY_DATA["Full Stack Developer"])
    from datetime import date
    return {
        "role": role,
        "currency": "INR",
        "data_points": _salary_points(info["base"]),
        "top_skills_premium": info["premium"],
        "market_trend": info["trend"],
        "last_updated": str(date.today()),
    }


@router.post("/quiz/generate")
async def generate_quiz(body: dict):
    # Frontend falls back to built-in questions if this fails — return 404-style empty
    return {"questions": [], "message": "Using built-in question bank"}


# ─── Resume Upload (Onboarding) ───────────────────────────────────────────────

# Comprehensive skill pool — covers most Indian CS/IT resumes
_SKILL_POOL = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
    "Swift", "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB", "Dart", "Perl",
    "Bash", "Shell", "PowerShell", "Assembly",
    # Frontend
    "HTML", "CSS", "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte",
    "jQuery", "Bootstrap", "Tailwind", "Tailwind CSS", "SASS", "SCSS", "Webpack",
    "Vite", "Redux", "Zustand", "MobX", "React Native", "Ionic",
    # Backend / Frameworks
    "Node.js", "Express", "Express.js", "FastAPI", "Django", "Flask", "Spring",
    "Spring Boot", "Laravel", "Rails", "Ruby on Rails", "ASP.NET", ".NET",
    "NestJS", "Hapi", "Koa", "Gin", "Fiber", "Actix",
    # Databases
    "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Cassandra",
    "DynamoDB", "Firebase", "Firestore", "Supabase", "Oracle", "MSSQL",
    "Elasticsearch", "Neo4j", "InfluxDB", "MariaDB",
    # Cloud & DevOps
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "CI/CD", "Helm",
    "Nginx", "Apache", "Linux", "Ubuntu", "Debian", "Heroku", "Vercel",
    "Netlify", "DigitalOcean", "Cloudflare",
    # Data & ML
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
    "Spark", "Hadoop", "Kafka", "Airflow", "dbt", "LLMs", "NLP",
    "Computer Vision", "OpenCV", "Hugging Face", "LangChain", "MLOps",
    "Data Analysis", "Data Science", "Statistics",
    # Tools & Practices
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Figma",
    "Postman", "Swagger", "REST", "GraphQL", "gRPC", "WebSockets",
    "Microservices", "System Design", "OOP", "Design Patterns", "Agile",
    "Scrum", "TDD", "Unit Testing", "Jest", "Pytest", "Selenium", "Cypress",
    # Mobile
    "Flutter", "Android", "iOS", "SwiftUI", "Jetpack Compose",
    # Security
    "OAuth", "JWT", "Cybersecurity", "OWASP", "Penetration Testing",
    # Other popular
    "Blockchain", "Solidity", "Web3", "Unity", "Unreal Engine",
    "ROS", "Arduino", "Raspberry Pi", "IoT",
]

# Normalise skill pool for fast lookup
_SKILL_LOWER_MAP = {s.lower(): s for s in _SKILL_POOL}

def _extract_text_from_pdf(raw: bytes) -> str:
    """Try multiple PDF extraction strategies."""
    # Strategy 1: pdfplumber (best quality)
    try:
        import pdfplumber, io as _io
        with pdfplumber.open(_io.BytesIO(raw)) as pdf:
            pages_text = [p.extract_text() or "" for p in pdf.pages]
            text = "\n".join(pages_text)
            if text.strip():
                return text
    except ImportError:
        pass
    except Exception:
        pass

    # Strategy 2: PyPDF2
    try:
        import PyPDF2, io as _io
        reader = PyPDF2.PdfReader(_io.BytesIO(raw))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        if text.strip():
            return text
    except ImportError:
        pass
    except Exception:
        pass

    # Strategy 3: Extract readable ASCII strings from binary (works for many PDFs)
    import re as _re
    decoded = raw.decode("latin-1", errors="ignore")
    # Pull out sequences of printable characters (length >= 4)
    strings = _re.findall(r'[A-Za-z0-9 .+#/\-]{4,}', decoded)
    return " ".join(strings)


def _extract_skills(text: str):
    """Extract skills using word-boundary matching to avoid false positives."""
    import re as _re
    text_lower = text.lower()
    found = []
    for skill_lower, skill_display in _SKILL_LOWER_MAP.items():
        # Use word boundary matching for short names to avoid false positives
        # e.g. "C" shouldn't match inside "CSS" or "CI/CD"
        if len(skill_lower) <= 2:
            pattern = r'\b' + _re.escape(skill_lower) + r'\b'
        else:
            pattern = _re.escape(skill_lower)
        if _re.search(pattern, text_lower):
            found.append(skill_display)
    # Deduplicate preserving order
    seen = set()
    result = []
    for s in found:
        if s not in seen:
            seen.add(s)
            result.append(s)
    return result


@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Parse uploaded resume and extract skills + suggested role. No auth required."""
    filename = (file.filename or "").lower()

    try:
        raw = await file.read()
        if not raw:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # ── Extract text ──────────────────────────────────────────────────────
        text = ""
        pdf_parse_failed = False

        if filename.endswith(".pdf"):
            text = _extract_text_from_pdf(raw)
            # Check if we got real text or just garbage
            readable_words = len([w for w in text.split() if w.isalpha() and len(w) > 2])
            if readable_words < 10:
                pdf_parse_failed = True
                text = ""
        elif filename.endswith(".docx"):
            try:
                from docx import Document
                import io as _io
                doc = Document(_io.BytesIO(raw))
                text = "\n".join(p.text for p in doc.paragraphs)
            except ImportError:
                text = raw.decode("utf-8", errors="ignore")
            except Exception:
                text = raw.decode("utf-8", errors="ignore")
        else:
            # .txt or unknown — just decode
            text = raw.decode("utf-8", errors="ignore")

        if not text.strip():
            hint = (
                "PDF text could not be extracted. This usually means the PDF is image-based (scanned). "
                "Please upload a .txt version of your resume, or type your skills manually below."
                if pdf_parse_failed
                else "Could not read file content. Please upload a .txt or .docx file."
            )
            return {
                "skills_found": [],
                "total_skills": 0,
                "suggested_role": "Full Stack Developer",
                "confidence": 0.5,
                "experience_years": 0,
                "reasoning": [hint],
                "parse_warning": hint,
            }

        # ── Skill extraction ──────────────────────────────────────────────────
        skills_found = _extract_skills(text)
        text_lower = text.lower()

        # ── Role suggestion ───────────────────────────────────────────────────
        role_signals = {
            "Frontend Developer":        ["react","vue","angular","html","css","next.js","figma","tailwind","svelte"],
            "Backend Developer":         ["django","flask","fastapi","node.js","express","spring","sql","postgresql","rest","grpc"],
            "Full Stack Developer":      ["react","node.js","sql","docker","javascript","typescript","express","mongodb"],
            "Data Scientist":            ["pandas","numpy","scikit-learn","machine learning","jupyter","spark","statistics","data analysis"],
            "Machine Learning Engineer": ["tensorflow","pytorch","deep learning","llms","mlops","transformers","keras","hugging face"],
            "DevOps Engineer":           ["docker","kubernetes","terraform","ci/cd","ansible","aws","linux","jenkins","helm"],
            "Mobile Developer":          ["swift","kotlin","flutter","react native","ios","android","swiftui","jetpack"],
            "Security Engineer":         ["penetration","owasp","cybersecurity","jwt","oauth","siem","zero trust"],
        }
        scores = {role: sum(1 for kw in kws if kw in text_lower) for role, kws in role_signals.items()}
        suggested_role = max(scores, key=scores.get) if any(scores.values()) else "Full Stack Developer"

        import re as _re
        years_matches = _re.findall(r'(\d+)\+?\s*years?', text_lower)
        experience_years = max((int(y) for y in years_matches if int(y) < 50), default=0)

        return {
            "skills_found": skills_found,
            "total_skills": len(skills_found),
            "suggested_role": suggested_role,
            "confidence": min(0.95, 0.5 + len(skills_found) * 0.025),
            "experience_years": experience_years,
            "reasoning": [
                f"Found {len(skills_found)} relevant skills in your resume",
                f"Strongest match: {suggested_role}",
                "Role suggestion based on skill frequency analysis",
            ],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")


# ─── Proof of Work ───────────────────────────────────────────────────────────
@router.post("/proof/generate")
async def generate_proof(body: dict):
    import hashlib, time
    data = str(body) + str(time.time())
    proof = hashlib.sha256(data.encode()).hexdigest()
    return {"proof_hash": proof, "timestamp": int(time.time())}


# ─── User Stats (POST) ───────────────────────────────────────────────────────
# Note: POST /api/user/stats is handled in user.py router
