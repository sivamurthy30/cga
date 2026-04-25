"""
Executive Vault — Premium features powered by Gemini.
- Role-specific eBook library (40+ books across 8 roles)
- 15-min AI summaries
- Resume tailoring
"""
import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)

# ── 40+ books mapped to roles ──────────────────────────────────────────────────
BOOKS = [
    # ── Engineering Fundamentals (all roles) ──
    {"id": "pragmatic-programmer",       "title": "The Pragmatic Programmer",                "author": "Hunt & Thomas",       "category": "engineering",   "cover": "#7c3aed", "roles": ["all"]},
    {"id": "clean-code",                 "title": "Clean Code",                               "author": "Robert C. Martin",    "category": "engineering",   "cover": "#b45309", "roles": ["all"]},
    {"id": "designing-data-intensive",   "title": "Designing Data-Intensive Applications",    "author": "Martin Kleppmann",    "category": "engineering",   "cover": "#be185d", "roles": ["backend", "data", "fullstack"]},
    {"id": "system-design-interview",    "title": "System Design Interview",                  "author": "Alex Xu",             "category": "engineering",   "cover": "#1d4ed8", "roles": ["backend", "fullstack", "devops"]},
    {"id": "clean-architecture",         "title": "Clean Architecture",                       "author": "Robert C. Martin",    "category": "engineering",   "cover": "#0f766e", "roles": ["backend", "fullstack"]},
    {"id": "refactoring",                "title": "Refactoring",                              "author": "Martin Fowler",       "category": "engineering",   "cover": "#7c3aed", "roles": ["all"]},
    {"id": "code-complete",              "title": "Code Complete",                            "author": "Steve McConnell",     "category": "engineering",   "cover": "#0891b2", "roles": ["all"]},
    # ── Frontend ──
    {"id": "javascript-good-parts",      "title": "JavaScript: The Good Parts",               "author": "Douglas Crockford",   "category": "frontend",      "cover": "#d97706", "roles": ["frontend", "fullstack"]},
    {"id": "you-dont-know-js",           "title": "You Don't Know JS",                        "author": "Kyle Simpson",        "category": "frontend",      "cover": "#dc2626", "roles": ["frontend", "fullstack"]},
    {"id": "css-secrets",                "title": "CSS Secrets",                              "author": "Lea Verou",           "category": "frontend",      "cover": "#7c3aed", "roles": ["frontend"]},
    {"id": "high-performance-browser",   "title": "High Performance Browser Networking",      "author": "Ilya Grigorik",       "category": "frontend",      "cover": "#0891b2", "roles": ["frontend", "fullstack"]},
    {"id": "dont-make-me-think",         "title": "Don't Make Me Think",                      "author": "Steve Krug",          "category": "frontend",      "cover": "#15803d", "roles": ["frontend"]},
    # ── Backend ──
    {"id": "release-it",                 "title": "Release It!",                              "author": "Michael Nygard",      "category": "backend",       "cover": "#0f766e", "roles": ["backend", "devops"]},
    {"id": "building-microservices",     "title": "Building Microservices",                   "author": "Sam Newman",          "category": "backend",       "cover": "#1d4ed8", "roles": ["backend", "fullstack"]},
    {"id": "database-internals",         "title": "Database Internals",                       "author": "Alex Petrov",         "category": "backend",       "cover": "#be185d", "roles": ["backend", "data"]},
    {"id": "api-design-patterns",        "title": "API Design Patterns",                      "author": "JJ Geewax",           "category": "backend",       "cover": "#b45309", "roles": ["backend", "fullstack"]},
    # ── Data Science / ML ──
    {"id": "hands-on-ml",                "title": "Hands-On Machine Learning",                "author": "Aurélien Géron",      "category": "data",          "cover": "#0891b2", "roles": ["data", "ml"]},
    {"id": "deep-learning-book",         "title": "Deep Learning",                            "author": "Goodfellow et al.",   "category": "data",          "cover": "#7c3aed", "roles": ["ml"]},
    {"id": "python-for-data-analysis",   "title": "Python for Data Analysis",                 "author": "Wes McKinney",        "category": "data",          "cover": "#15803d", "roles": ["data"]},
    {"id": "feature-engineering",        "title": "Feature Engineering for ML",               "author": "Alice Zheng",         "category": "data",          "cover": "#dc2626", "roles": ["data", "ml"]},
    {"id": "ml-engineering",             "title": "Machine Learning Engineering",              "author": "Andriy Burkov",       "category": "data",          "cover": "#d97706", "roles": ["ml"]},
    {"id": "statistics-for-hackers",     "title": "Statistics for Hackers",                   "author": "Jake VanderPlas",     "category": "data",          "cover": "#0f766e", "roles": ["data"]},
    # ── DevOps / SRE ──
    {"id": "site-reliability-engineering","title": "Site Reliability Engineering",            "author": "Google SRE Team",     "category": "devops",        "cover": "#1d4ed8", "roles": ["devops"]},
    {"id": "phoenix-project",            "title": "The Phoenix Project",                      "author": "Kim, Behr & Spafford","category": "devops",        "cover": "#be185d", "roles": ["devops"]},
    {"id": "kubernetes-in-action",       "title": "Kubernetes in Action",                     "author": "Marko Luksa",         "category": "devops",        "cover": "#0891b2", "roles": ["devops"]},
    {"id": "terraform-up-running",       "title": "Terraform: Up & Running",                  "author": "Yevgeniy Brikman",    "category": "devops",        "cover": "#7c3aed", "roles": ["devops"]},
    {"id": "accelerate",                 "title": "Accelerate",                               "author": "Forsgren et al.",     "category": "devops",        "cover": "#15803d", "roles": ["devops"]},
    # ── Security ──
    {"id": "web-application-hacker",     "title": "The Web Application Hacker's Handbook",   "author": "Stuttard & Pinto",    "category": "security",      "cover": "#dc2626", "roles": ["security"]},
    {"id": "hacking-art-exploitation",   "title": "Hacking: The Art of Exploitation",         "author": "Jon Erickson",        "category": "security",      "cover": "#b45309", "roles": ["security"]},
    {"id": "threat-modeling",            "title": "Threat Modeling",                          "author": "Adam Shostack",       "category": "security",      "cover": "#0f766e", "roles": ["security"]},
    {"id": "rtfm",                       "title": "RTFM: Red Team Field Manual",              "author": "Ben Clark",           "category": "security",      "cover": "#7c3aed", "roles": ["security"]},
    # ── Mobile ──
    {"id": "ios-programming",            "title": "iOS Programming: The Big Nerd Ranch Guide","author": "Hillegass & Conway",  "category": "mobile",        "cover": "#0891b2", "roles": ["mobile"]},
    {"id": "android-programming",        "title": "Android Programming: Big Nerd Ranch",      "author": "Phillips et al.",     "category": "mobile",        "cover": "#15803d", "roles": ["mobile"]},
    {"id": "react-native-in-action",     "title": "React Native in Action",                   "author": "Nader Dabit",         "category": "mobile",        "cover": "#d97706", "roles": ["mobile", "frontend"]},
    # ── Leadership / Career ──
    {"id": "staff-engineer",             "title": "Staff Engineer",                           "author": "Will Larson",         "category": "leadership",    "cover": "#0891b2", "roles": ["all"]},
    {"id": "managers-path",              "title": "The Manager's Path",                       "author": "Camille Fournier",    "category": "leadership",    "cover": "#7c3aed", "roles": ["all"]},
    {"id": "soft-skills",                "title": "Soft Skills: The Software Developer's Life Manual","author": "John Sonmez","category": "leadership",    "cover": "#be185d", "roles": ["all"]},
    {"id": "mythical-man-month",         "title": "The Mythical Man-Month",                   "author": "Fred Brooks",         "category": "leadership",    "cover": "#b45309", "roles": ["all"]},
    # ── Productivity ──
    {"id": "atomic-habits",              "title": "Atomic Habits",                            "author": "James Clear",         "category": "productivity",  "cover": "#4f46e5", "roles": ["all"]},
    {"id": "deep-work",                  "title": "Deep Work",                                "author": "Cal Newport",         "category": "productivity",  "cover": "#0f766e", "roles": ["all"]},
    {"id": "psychology-money",           "title": "The Psychology of Money",                  "author": "Morgan Housel",       "category": "finance",       "cover": "#15803d", "roles": ["all"]},
]

ROLE_ALIAS = {
    "frontend developer": "frontend", "backend developer": "backend",
    "full stack developer": "fullstack", "data scientist": "data",
    "machine learning engineer": "ml", "devops engineer": "devops",
    "security engineer": "security", "mobile developer": "mobile",
}

# ── Static summaries ───────────────────────────────────────────────────────────
_STATIC_SUMMARIES = {
    "pragmatic-programmer": {
        "summary": "A timeless guide to software craftsmanship. Great programmers are pragmatic — they adapt tools to the problem rather than following dogma.",
        "key_takeaways": [
            "DRY: Don't Repeat Yourself — every piece of knowledge must have a single representation",
            "Orthogonality: design components that are independent and have a single purpose",
            "Tracer bullets: build end-to-end skeletons first to validate architecture early",
            "Invest regularly in your knowledge portfolio like a financial portfolio",
            "Fix broken windows immediately — bad code invites more bad code",
        ],
        "career_impact": "Teaches the mindset shift from 'coder' to 'craftsman' — essential for Senior+ roles.",
        "read_time_mins": 15,
    },
    "staff-engineer": {
        "summary": "Will Larson maps the path from Senior Engineer to Staff and beyond, demystifying the ambiguous role with concrete strategies.",
        "key_takeaways": [
            "Staff engineers operate in four archetypes: Tech Lead, Architect, Solver, Right Hand",
            "Your job is to create leverage — multiply the output of those around you",
            "Write engineering strategy documents to align teams without direct authority",
            "Manage your energy, not just your time — Staff work is a marathon",
            "Sponsor others actively — your career grows when you grow others",
        ],
        "career_impact": "The definitive guide for engineers targeting Staff/Principal roles.",
        "read_time_mins": 12,
    },
    "clean-code": {
        "summary": "Robert Martin's manifesto for writing readable, maintainable code. Every line should communicate intent clearly to the next developer.",
        "key_takeaways": [
            "Meaningful names: variables and functions should reveal their intent",
            "Functions should do one thing and do it well",
            "Comments are a failure to express yourself in code — write self-documenting code instead",
            "The Boy Scout Rule: always leave the code cleaner than you found it",
            "Test-Driven Development creates a safety net that enables fearless refactoring",
        ],
        "career_impact": "Separates junior developers from senior ones — code review skills skyrocket.",
        "read_time_mins": 14,
    },
    "designing-data-intensive": {
        "summary": "The definitive guide to building reliable, scalable, and maintainable data systems. Covers databases, distributed systems, and stream processing.",
        "key_takeaways": [
            "Reliability, scalability, and maintainability are the three pillars of data systems",
            "Understand the trade-offs between consistency and availability (CAP theorem)",
            "Replication and partitioning are the two fundamental techniques for scaling",
            "Event sourcing and CQRS enable powerful audit trails and temporal queries",
            "Batch vs stream processing: choose based on latency requirements",
        ],
        "career_impact": "Essential for any backend or data engineer targeting senior roles at scale.",
        "read_time_mins": 18,
    },
    "system-design-interview": {
        "summary": "A practical guide to acing system design interviews at top tech companies, with step-by-step frameworks for designing large-scale systems.",
        "key_takeaways": [
            "Always clarify requirements and constraints before designing",
            "Start with a high-level design, then dive into components",
            "Back-of-envelope calculations: know your numbers (QPS, storage, bandwidth)",
            "Design for failure: every component will fail eventually",
            "Trade-offs are the heart of system design — there is no perfect solution",
        ],
        "career_impact": "Directly applicable to FAANG/MAANG interviews — pass the system design round.",
        "read_time_mins": 13,
    },
    "hands-on-ml": {
        "summary": "The most practical ML book available. Covers the full pipeline from data preparation to deploying models in production using scikit-learn and TensorFlow.",
        "key_takeaways": [
            "The ML project checklist: frame the problem, get data, explore, prepare, select model, fine-tune, deploy",
            "Feature engineering often matters more than algorithm choice",
            "Cross-validation is essential — never trust a single train/test split",
            "Regularization prevents overfitting: L1 for sparsity, L2 for smoothness",
            "Neural networks are universal approximators but require careful tuning",
        ],
        "career_impact": "The fastest path from zero to production ML — used in top ML bootcamps worldwide.",
        "read_time_mins": 20,
    },
    "site-reliability-engineering": {
        "summary": "Google's SRE book reveals how they run the world's largest systems reliably. Introduces SLOs, error budgets, and the philosophy of treating operations as a software problem.",
        "key_takeaways": [
            "SLOs (Service Level Objectives) are the contract between SRE and product teams",
            "Error budgets: if you haven't used your error budget, you're being too conservative",
            "Toil is manual, repetitive work — automate it or it will consume your team",
            "Postmortems should be blameless — focus on systems, not people",
            "On-call rotations must be sustainable — alert fatigue kills reliability",
        ],
        "career_impact": "The bible for DevOps/SRE roles — required reading at Google, Netflix, and Stripe.",
        "read_time_mins": 16,
    },
    "phoenix-project": {
        "summary": "A novel about IT, DevOps, and helping your business win. Follows Bill as he transforms a failing IT department using the Three Ways of DevOps.",
        "key_takeaways": [
            "The Three Ways: Flow, Feedback, and Continual Learning",
            "Identify your constraint (Theory of Constraints) and exploit it before optimizing elsewhere",
            "Technical debt is like financial debt — it accrues interest and must be paid",
            "DevOps is about breaking down silos between Dev, QA, and Ops",
            "Small batch sizes and continuous deployment reduce risk and increase speed",
        ],
        "career_impact": "Changes how you think about IT work — essential for DevOps culture transformation.",
        "read_time_mins": 11,
    },
    "atomic-habits": {
        "summary": "James Clear's framework for building good habits and breaking bad ones through tiny 1% improvements that compound into remarkable results.",
        "key_takeaways": [
            "Small changes compound: 1% better every day = 37x better in a year",
            "Focus on systems, not goals — goals are for direction, systems are for progress",
            "The Four Laws: Make it obvious, attractive, easy, and satisfying",
            "Identity-based habits: become the type of person who does the thing",
            "Environment design is more powerful than willpower",
        ],
        "career_impact": "Transforms how you approach skill-building — the meta-skill for all learning.",
        "read_time_mins": 12,
    },
    "deep-work": {
        "summary": "Cal Newport argues that the ability to focus without distraction is the superpower of the 21st century, and provides rules for cultivating it.",
        "key_takeaways": [
            "Deep work is becoming increasingly rare and increasingly valuable",
            "Schedule every minute of your day — don't leave time to chance",
            "Embrace boredom: train your brain to resist distraction even when not working",
            "Quit social media that doesn't serve your professional goals",
            "The 4DX framework: focus on the wildly important, act on lead measures",
        ],
        "career_impact": "The single biggest productivity unlock for software engineers — 4x output quality.",
        "read_time_mins": 11,
    },
    "building-microservices": {
        "summary": "Sam Newman's comprehensive guide to designing, building, and evolving microservices architectures in production.",
        "key_takeaways": [
            "Model services around business capabilities, not technical layers",
            "Services should be independently deployable — loose coupling is non-negotiable",
            "Distributed systems introduce new failure modes: design for resilience",
            "API versioning and backward compatibility are critical for evolution",
            "Observability (logs, metrics, traces) is more important in microservices than monoliths",
        ],
        "career_impact": "Required reading for any backend engineer working at scale.",
        "read_time_mins": 17,
    },
    "you-dont-know-js": {
        "summary": "Kyle Simpson's deep dive into JavaScript's core mechanisms — scope, closures, this, prototypes, and async — the parts most developers misunderstand.",
        "key_takeaways": [
            "Scope and closures are the foundation of JavaScript — understand them deeply",
            "The 'this' keyword is determined by call-site, not definition-site",
            "Prototypal inheritance is different from classical OOP — embrace it",
            "Promises and async/await are syntactic sugar over the event loop",
            "JavaScript's type coercion is predictable once you understand the rules",
        ],
        "career_impact": "Turns JavaScript developers from framework users into language experts.",
        "read_time_mins": 14,
    },
    "web-application-hacker": {
        "summary": "The definitive guide to finding and exploiting vulnerabilities in web applications, covering every major attack class from SQLi to CSRF.",
        "key_takeaways": [
            "Every input is a potential attack vector — validate and sanitize everything",
            "SQL injection remains the most dangerous vulnerability — use parameterized queries",
            "XSS attacks steal sessions and execute arbitrary code in victims' browsers",
            "CSRF exploits trust in authenticated sessions — use CSRF tokens",
            "Security testing requires an attacker's mindset — think like a hacker",
        ],
        "career_impact": "The foundation for any security engineer or penetration tester.",
        "read_time_mins": 19,
    },
}



async def _gemini_summary(book_title: str, book_author: str) -> dict:
    if not GEMINI_API_KEY:
        return {}
    prompt = f"""Create a 15-minute book summary for "{book_title}" by {book_author} targeted at software engineers.

Return ONLY valid JSON:
{{
  "summary": "<2-3 sentence overview>",
  "key_takeaways": ["<takeaway 1>", "<takeaway 2>", "<takeaway 3>", "<takeaway 4>", "<takeaway 5>"],
  "career_impact": "<1 sentence on how this helps a developer's career>",
  "read_time_mins": 15
}}"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.5, "maxOutputTokens": 600},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload)
        resp.raise_for_status()
        raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(raw)


@router.get("/books")
async def list_books(role: Optional[str] = None):
    """Return books filtered by role, or all books if no role specified."""
    if not role:
        return {"books": BOOKS}
    role_key = ROLE_ALIAS.get(role.lower().strip(), role.lower().strip())
    filtered = [b for b in BOOKS if "all" in b["roles"] or role_key in b["roles"]]
    return {"books": filtered, "role": role, "total": len(filtered)}


@router.get("/books/{book_id}/summary")
async def get_book_summary(book_id: str):
    book = next((b for b in BOOKS if b["id"] == book_id), None)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Try static first, then Gemini
    if book_id in _STATIC_SUMMARIES:
        return {"book": book, **_STATIC_SUMMARIES[book_id]}

    try:
        data = await _gemini_summary(book["title"], book["author"])
        if data:
            return {"book": book, **data}
    except Exception:
        pass

    return {
        "book": book,
        "summary": f"A must-read for software engineers. '{book['title']}' by {book['author']} covers essential concepts for career growth.",
        "key_takeaways": [
            "Focus on fundamentals that don't change",
            "Build systems that are easy to change",
            "Communicate clearly with technical and non-technical stakeholders",
            "Invest in your craft continuously",
            "Mentor others to multiply your impact",
        ],
        "career_impact": "Essential reading for engineers targeting senior and staff-level roles.",
        "read_time_mins": 15,
    }


class ResumeTailorRequest(BaseModel):
    resume_text: str
    job_description: str
    target_role: Optional[str] = None


@router.post("/resume/tailor")
async def tailor_resume(req: ResumeTailorRequest):
    """Gemini rewrites resume bullets to match job description keywords."""
    if not GEMINI_API_KEY:
        return {
            "tailored_bullets": [
                "Developed scalable REST APIs serving 10,000+ daily active users",
                "Led migration from monolith to microservices, reducing deployment time by 60%",
                "Implemented CI/CD pipeline with GitHub Actions and Docker, cutting release cycles from weekly to daily",
            ],
            "keywords_added": ["scalable", "microservices", "CI/CD"],
            "ats_score": 72,
            "note": "AI tailoring unavailable — showing template bullets",
        }

    prompt = f"""You are an expert resume writer. Rewrite the resume bullets to match the job description.

Resume:
{req.resume_text[:2000]}

Job Description:
{req.job_description[:1500]}

Return ONLY valid JSON:
{{
  "tailored_bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>", "<bullet 4>", "<bullet 5>"],
  "keywords_added": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "ats_score": <estimated ATS match score 0-100>,
  "note": "<1 sentence tip>"
}}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 700},
    }
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            resp = await client.post(GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload)
            resp.raise_for_status()
            raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
            return json.loads(raw)
    except Exception:
        raise HTTPException(status_code=500, detail="Resume tailoring failed")
