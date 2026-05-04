"""
ML & Recommendation Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import aiofiles
import os

from app.database.db import get_db
from app.models.ml import (
    RecommendationRequest, RecommendationResponse,
    ResumeUploadResponse, GitHubAnalysisRequest, GitHubAnalysisResponse
)
from app.utils.dependencies import get_current_user, get_optional_user
from app.services.ml_service import MLService
from app.config import settings


router = APIRouter()


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get skill recommendation using ML algorithms"""
    ml_service = MLService(db)
    recommendation = await ml_service.get_recommendation(
        target_role=request.targetRole,
        known_skills=request.knownSkills,
        learning_speed=request.learningSpeed,
        algorithm=request.algorithm
    )
    return recommendation


# NOTE: /resume/upload is handled by features.py (no auth required, used by onboarding)
# This route is intentionally removed to avoid duplicate registration.

@router.post("/resume/transform")
async def transform_resume(
    file: UploadFile = File(...),
    target_role: str = "Full Stack Developer",
    tone: str = "professional",
    completed_nodes: str = "[]",
    current_user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Parse resume and return a richly structured, ATS-optimised version."""
    import json, re

    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower() or '.txt'
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type '{file_ext}' not allowed. Upload PDF, DOCX, or TXT.")

    content_bytes = await file.read()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    user_id   = getattr(current_user, 'id', 0)
    user_name = getattr(current_user, 'name', None) or 'Your Name'
    user_email = getattr(current_user, 'email', None) or 'your.email@example.com'
    file_path = os.path.join(settings.UPLOAD_DIR, f"{user_id}_transform_{file.filename}")

    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content_bytes)

    try:
        ml_service = MLService(db)
        analysis  = await ml_service.analyze_resume(file_path=file_path, user_id=user_id)
        skills    = analysis.skills_found

        # ── Role-specific skill sets ──────────────────────────────────────────
        ROLE_DATA = {
            "frontend": {
                "core":      ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Next.js"],
                "tools":     ["Webpack", "Vite", "Jest", "Cypress", "Figma", "Git"],
                "projected": ["React Native", "GraphQL", "Web Performance", "Micro-frontends"],
                "keywords":  ["responsive design", "component architecture", "state management",
                               "accessibility", "performance optimisation", "cross-browser compatibility"],
            },
            "backend": {
                "core":      ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Docker"],
                "tools":     ["SQLAlchemy", "Celery", "Nginx", "Git", "Linux", "REST APIs"],
                "projected": ["Kubernetes", "GraphQL", "gRPC", "Event-driven architecture"],
                "keywords":  ["scalable APIs", "database optimisation", "microservices",
                               "authentication", "caching strategies", "CI/CD pipelines"],
            },
            "full stack": {
                "core":      ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
                "tools":     ["Git", "Jest", "Redis", "Nginx", "GitHub Actions", "Figma"],
                "projected": ["Kubernetes", "GraphQL", "Micro-frontends", "Serverless"],
                "keywords":  ["end-to-end development", "RESTful APIs", "agile methodology",
                               "system design", "performance optimisation", "cloud deployment"],
            },
            "data": {
                "core":      ["Python", "Pandas", "SQL", "Spark", "Tableau", "dbt"],
                "tools":     ["Jupyter", "Airflow", "BigQuery", "Snowflake", "Git", "Docker"],
                "projected": ["LLMs", "MLflow", "dbt Cloud", "Real-time streaming"],
                "keywords":  ["data pipelines", "ETL processes", "statistical analysis",
                               "data visualisation", "A/B testing", "business intelligence"],
            },
            "ml": {
                "core":      ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "MLflow", "Docker"],
                "tools":     ["Jupyter", "Weights & Biases", "Hugging Face", "FastAPI", "Git", "AWS"],
                "projected": ["LLMs", "RAG", "Model quantisation", "Edge deployment"],
                "keywords":  ["model training", "feature engineering", "hyperparameter tuning",
                               "model deployment", "MLOps", "experiment tracking"],
            },
            "devops": {
                "core":      ["Kubernetes", "Terraform", "Docker", "AWS", "GitHub Actions", "Prometheus"],
                "tools":     ["Helm", "Ansible", "Grafana", "ArgoCD", "Linux", "Python"],
                "projected": ["eBPF", "Platform engineering", "GitOps", "FinOps"],
                "keywords":  ["infrastructure as code", "CI/CD pipelines", "zero-downtime deployments",
                               "observability", "cost optimisation", "SRE practices"],
            },
            "mobile": {
                "core":      ["React Native", "TypeScript", "Swift", "Kotlin", "Firebase", "Redux"],
                "tools":     ["Xcode", "Android Studio", "Expo", "Fastlane", "Git", "Figma"],
                "projected": ["Flutter", "SwiftUI", "Jetpack Compose", "AR/VR"],
                "keywords":  ["cross-platform development", "app store optimisation",
                               "offline-first architecture", "push notifications", "performance profiling"],
            },
            "security": {
                "core":      ["Python", "OWASP", "Burp Suite", "Wireshark", "Linux", "AWS Security"],
                "tools":     ["Metasploit", "Nmap", "Splunk", "SIEM", "Git", "Docker"],
                "projected": ["Zero Trust", "Cloud security posture", "DevSecOps", "AI-driven threat detection"],
                "keywords":  ["penetration testing", "vulnerability assessment", "incident response",
                               "threat modelling", "compliance", "security architecture"],
            },
        }

        role_key  = next((k for k in ROLE_DATA if k in target_role.lower()), "full stack")
        rd        = ROLE_DATA[role_key]

        # Merge found skills with role core skills (found skills first)
        all_skills = list(dict.fromkeys(skills + [s for s in rd["core"] if s not in skills]))
        tools      = rd["tools"]
        projected  = [s for s in rd["projected"] if s not in all_skills][:4]

        # ── ATS score calculation ─────────────────────────────────────────────
        keyword_hits = sum(1 for kw in rd["keywords"] if any(kw.lower() in s.lower() for s in skills))
        skill_hits   = sum(1 for s in rd["core"] if s in all_skills)
        ats_score    = min(96, 52 + skill_hits * 5 + keyword_hits * 3 + min(len(skills), 8) * 2)

        # ── Summary ───────────────────────────────────────────────────────────
        top_skills = ", ".join(all_skills[:4]) if all_skills else "modern technologies"
        tone_phrase = {
            "professional": "delivering production-grade solutions and driving measurable business impact",
            "creative":     "crafting innovative solutions that blend technical excellence with creative thinking",
        }.get(tone, "delivering high-quality solutions")

        summary = (
            f"Results-driven {target_role} with hands-on experience in {top_skills}. "
            f"Passionate about {tone_phrase}. "
            f"Proven track record of building scalable systems, collaborating with cross-functional teams, "
            f"and continuously upskilling to stay ahead of industry trends."
        )

        # ── Experience bullets (role-specific, quantified) ────────────────────
        EXPERIENCE_TEMPLATES = {
            "frontend": [
                f"Architected and delivered responsive React/TypeScript applications serving 50,000+ monthly active users, achieving 98% Lighthouse performance scores",
                f"Reduced initial page load time by 42% through code splitting, lazy loading, and strategic caching — directly improving conversion rates by 18%",
                f"Built a reusable component library (40+ components) adopted across 3 product teams, cutting UI development time by 35%",
                f"Led migration from Create React App to Next.js 14 App Router, enabling SSR and reducing TTFB by 60%",
                f"Implemented comprehensive test coverage (Jest + Cypress) raising suite from 34% to 87%, eliminating 90% of regression bugs",
            ],
            "backend": [
                f"Designed and deployed RESTful microservices handling 2M+ daily API requests with 99.9% uptime SLA",
                f"Optimised critical PostgreSQL queries reducing average response time from 850ms to 45ms through indexing and query restructuring",
                f"Built async task processing pipeline with Celery + Redis, processing 500K background jobs/day with zero data loss",
                f"Implemented JWT-based authentication with RBAC supporting 15 permission levels across 3 user tiers",
                f"Containerised 8 services with Docker Compose, reducing environment setup time from 4 hours to 15 minutes",
            ],
            "full stack": [
                f"Built end-to-end SaaS platform (React + Node.js + PostgreSQL) from 0 to 10,000 users in 6 months",
                f"Designed RESTful API with 35 endpoints, achieving sub-100ms response times under 1,000 concurrent users",
                f"Implemented real-time features (WebSockets) enabling live collaboration for 500+ simultaneous users",
                f"Reduced cloud infrastructure costs by 28% through query optimisation, caching, and right-sizing EC2 instances",
                f"Established CI/CD pipeline (GitHub Actions + Docker) cutting deployment time from 45 minutes to 8 minutes",
            ],
            "data": [
                f"Built automated ETL pipelines processing 5TB+ daily data with 99.8% reliability using Apache Airflow",
                f"Developed executive dashboards in Tableau/Power BI adopted by C-suite, replacing 12 manual weekly reports",
                f"Reduced data warehouse query costs by 40% through partitioning, clustering, and materialised views in BigQuery",
                f"Designed A/B testing framework that ran 200+ experiments, directly contributing to 22% revenue uplift",
                f"Created ML-powered churn prediction model (87% accuracy) enabling proactive retention campaigns",
            ],
            "ml": [
                f"Trained and deployed NLP classification model (BERT fine-tuned) achieving 94.2% F1 score in production",
                f"Built end-to-end MLOps pipeline (MLflow + Docker + FastAPI) reducing model deployment time from 2 weeks to 4 hours",
                f"Optimised inference latency by 65% through model quantisation and ONNX conversion for edge deployment",
                f"Designed feature store serving 200+ features to 8 downstream models with sub-10ms retrieval",
                f"Led LLM integration project using RAG architecture, improving customer support resolution rate by 34%",
            ],
            "devops": [
                f"Managed Kubernetes cluster (50+ nodes, 200+ pods) with 99.95% uptime across 3 production environments",
                f"Implemented GitOps workflow with ArgoCD reducing deployment failures by 78% and rollback time to under 2 minutes",
                f"Automated infrastructure provisioning with Terraform, managing 150+ AWS resources across dev/staging/prod",
                f"Built observability stack (Prometheus + Grafana + Loki) reducing MTTR from 4 hours to 22 minutes",
                f"Optimised cloud spend by $180K/year through reserved instances, spot fleets, and right-sizing initiatives",
            ],
            "mobile": [
                f"Shipped React Native app (iOS + Android) with 4.8★ rating and 100K+ downloads in first 3 months",
                f"Reduced app bundle size by 38% and cold start time by 52% through code splitting and lazy loading",
                f"Implemented offline-first architecture with SQLite sync, enabling full functionality without internet",
                f"Built push notification system reaching 85% open rate through personalised, behaviour-triggered campaigns",
                f"Established automated testing pipeline (Detox E2E) catching 95% of regressions before App Store submission",
            ],
            "security": [
                f"Conducted 40+ penetration tests identifying 120+ critical vulnerabilities across web, mobile, and API surfaces",
                f"Implemented Zero Trust architecture reducing attack surface by 60% and achieving SOC 2 Type II compliance",
                f"Built SIEM dashboard (Splunk) correlating 10M+ daily events, reducing false positive rate by 72%",
                f"Led incident response for 3 major security events, containing breaches within 2 hours with zero data exfiltration",
                f"Developed security training programme achieving 98% phishing simulation resistance across 500+ employees",
            ],
        }

        bullets = EXPERIENCE_TEMPLATES.get(role_key, EXPERIENCE_TEMPLATES["full stack"])

        experience = [
            {
                "role": target_role,
                "company": "Current / Most Recent Company",
                "period": "2022 – Present",
                "bullets": bullets[:3],
            },
            {
                "role": f"Junior {target_role}",
                "company": "Previous Company",
                "period": "2020 – 2022",
                "bullets": bullets[3:5],
            },
        ]

        # ── Education & Certifications ────────────────────────────────────────
        CERTS = {
            "frontend":   ["Meta Front-End Developer Certificate", "Google UX Design Certificate"],
            "backend":    ["AWS Certified Developer – Associate", "MongoDB Certified Developer"],
            "full stack": ["AWS Certified Developer – Associate", "Meta Full-Stack Developer Certificate"],
            "data":       ["Google Professional Data Engineer", "dbt Analytics Engineering Certificate"],
            "ml":         ["AWS Certified Machine Learning – Specialty", "Deep Learning Specialisation (Coursera)"],
            "devops":     ["CKA – Certified Kubernetes Administrator", "AWS Solutions Architect – Associate"],
            "mobile":     ["Google Associate Android Developer", "Apple Swift Certified Developer"],
            "security":   ["CEH – Certified Ethical Hacker", "CompTIA Security+"],
        }

        return {
            "name":             user_name,
            "email":            user_email,
            "title":            target_role,
            "summary":          summary,
            "skills":           all_skills[:12],
            "tools":            tools,
            "projected_skills": projected,
            "experience":       experience,
            "education": {
                "degree":      "Bachelor of Technology / Bachelor of Engineering",
                "field":       "Computer Science & Engineering",
                "institution": "Your University",
                "year":        "2020",
            },
            "certifications":   CERTS.get(role_key, CERTS["full stack"]),
            "ats_score":        ats_score,
            "ats_keywords":     rd["keywords"][:6],
            "original_text":    "",
        }
    finally:
        try:
            os.remove(file_path)
        except Exception:
            pass


@router.post("/resume/add-skill")
async def add_skill_to_resume(
    skill: str = "",
    current_resume_json: str = "{}",
):
    """Inject a new skill into an existing optimised resume JSON."""
    import json
    try:
        resume = json.loads(current_resume_json)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resume JSON")

    skills = resume.get("skills", [])
    if skill and skill not in skills:
        skills.append(skill)
    resume["skills"] = skills

    if resume.get("experience"):
        resume["experience"][0]["bullets"].append(
            f"Expanded expertise in {skill} to meet evolving project requirements"
        )

    return {"updated_resume": resume}


@router.post("/github/analyze", response_model=GitHubAnalysisResponse)
async def analyze_github(
    request: GitHubAnalysisRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze GitHub profile"""
    ml_service = MLService(db)
    result = await ml_service.analyze_github(
        github_username=request.github_username,
        user_id=current_user.id
    )
    return result
