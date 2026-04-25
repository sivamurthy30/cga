"""
AI Resume Transformation Engine — The "Bridge" Algorithm
1. Parse uploaded PDF/DOCX → extract raw text
2. Gemini performs 3 transformations:
   - ATS Keyword Injection (from roadmap)
   - Achievement Quantification (passive → impact bullets)
   - Projected Skills section (from DEV^A roadmap progress)
3. Returns structured JSON resume ready for frontend rendering
"""
import os
import io
import json
import base64
import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)

# Role → ATS keywords map (injected into resume)
ROLE_KEYWORDS = {
    "Frontend Developer": [
        "React", "TypeScript", "Next.js", "Tailwind CSS", "Web Performance",
        "Accessibility (WCAG)", "Component Architecture", "REST APIs", "CI/CD",
    ],
    "Backend Developer": [
        "FastAPI", "PostgreSQL", "Redis", "Docker", "Microservices",
        "REST APIs", "gRPC", "System Design", "Kafka", "AWS",
    ],
    "Full Stack Developer": [
        "React", "Node.js", "PostgreSQL", "Docker", "TypeScript",
        "REST APIs", "CI/CD", "System Design", "AWS", "Redis",
    ],
    "Data Scientist": [
        "Python", "PyTorch", "scikit-learn", "Pandas", "SQL",
        "Machine Learning", "Feature Engineering", "MLOps", "A/B Testing", "Statistics",
    ],
    "Machine Learning Engineer": [
        "PyTorch", "MLOps", "LLM Fine-tuning", "CUDA", "Distributed Training",
        "Model Deployment", "Feature Stores", "Kubernetes", "Python", "Spark",
    ],
    "DevOps Engineer": [
        "Kubernetes", "Terraform", "ArgoCD", "GitHub Actions", "Docker",
        "AWS", "Prometheus", "Grafana", "Linux", "Infrastructure as Code",
    ],
    "Security Engineer": [
        "OWASP", "Penetration Testing", "Zero Trust", "SIEM", "Threat Modeling",
        "Vulnerability Assessment", "Python", "Linux", "Cloud Security", "DevSecOps",
    ],
    "Mobile Developer": [
        "React Native", "TypeScript", "iOS", "Android", "REST APIs",
        "Redux", "Jest", "CI/CD", "App Store Deployment", "Performance Optimization",
    ],
}


def _extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """Extract plain text from PDF, DOCX, or TXT bytes."""
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "txt":
        return file_bytes.decode("utf-8", errors="ignore")

    if ext in ("pdf",):
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                return "\n".join(p.extract_text() or "" for p in pdf.pages)
        except Exception:
            try:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                return "\n".join(p.extract_text() or "" for p in reader.pages)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF parse failed: {e}")

    if ext in ("docx", "doc"):
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"DOCX parse failed: {e}")

    raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")


async def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return ""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1500},
    }
    async with httpx.AsyncClient(timeout=40) as client:
        resp = await client.post(GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


def _build_fallback(resume_text: str, target_role: str, tone: str, completed_nodes: list) -> dict:
    """Static fallback when Gemini is unavailable."""
    keywords = ROLE_KEYWORDS.get(target_role, ROLE_KEYWORDS["Full Stack Developer"])
    return {
        "name": "Your Name",
        "title": target_role,
        "summary": f"Results-driven engineer transitioning to {target_role}. "
                   f"Proven track record of delivering scalable solutions with expertise in "
                   f"{', '.join(keywords[:3])}.",
        "experience": [
            {
                "company": "Previous Company",
                "role": "Software Engineer",
                "period": "2022 – Present",
                "bullets": [
                    f"Engineered high-performance features using {keywords[0]}, reducing load time by 35%",
                    "Led cross-functional team of 4 engineers to deliver project 2 weeks ahead of schedule",
                    "Implemented automated testing suite achieving 90% code coverage",
                    f"Architected {keywords[1]} integration serving 50,000+ daily active users",
                ],
            }
        ],
        "skills": keywords,
        "projected_skills": completed_nodes[:5] if completed_nodes else [
            f"{keywords[0]} (In Progress)", f"{keywords[1]} (In Progress)"
        ],
        "ats_keywords_injected": keywords[:5],
        "ats_score": 68,
        "tone": tone,
        "note": "AI unavailable — showing template. Add GEMINI_API_KEY for full transformation.",
    }


@router.post("/transform")
async def transform_resume(
    file: UploadFile = File(...),
    target_role: str = Form("Full Stack Developer"),
    tone: str = Form("professional"),          # "professional" | "creative"
    completed_nodes: str = Form("[]"),         # JSON array of completed roadmap nodes
):
    """
    The Bridge Algorithm:
    1. Parse resume → raw text
    2. Gemini: ATS inject + quantify achievements + add projected skills
    3. Return structured JSON
    """
    allowed = {"pdf", "docx", "doc", "txt"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file: {ext}")

    file_bytes = await file.read()
    if len(file_bytes) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")

    resume_text = _extract_text_from_bytes(file_bytes, file.filename)

    try:
        nodes = json.loads(completed_nodes)
    except Exception:
        nodes = []

    role_keywords = ROLE_KEYWORDS.get(target_role, ROLE_KEYWORDS["Full Stack Developer"])
    keywords_str = ", ".join(role_keywords)
    nodes_str = ", ".join(nodes[:10]) if nodes else "None yet"
    tone_instruction = (
        "Use a formal, precise, executive tone." if tone == "professional"
        else "Use a confident, modern, slightly creative tone while staying professional."
    )

    prompt = f"""You are a senior technical resume writer and career coach.

TASK: Transform the resume below for a "{target_role}" role.

ORIGINAL RESUME:
{resume_text[:3000]}

INSTRUCTIONS:
1. ATS OPTIMIZATION: Naturally inject these keywords where relevant: {keywords_str}
2. ACHIEVEMENT QUANTIFICATION: Rewrite every passive bullet (e.g. "worked on X") into an impact-driven bullet with metrics (e.g. "Engineered X reducing Y by Z%"). Invent plausible metrics if none exist.
3. PROJECTED SKILLS: Add a "Projected Skills" section listing these in-progress skills from the user's learning roadmap: {nodes_str}
4. TONE: {tone_instruction}

Return ONLY valid JSON with this exact structure:
{{
  "name": "<full name from resume or 'Your Name'>",
  "title": "{target_role}",
  "summary": "<2-3 sentence professional summary optimized for {target_role}>",
  "experience": [
    {{
      "company": "<company name>",
      "role": "<job title>",
      "period": "<date range>",
      "bullets": ["<impact bullet 1>", "<impact bullet 2>", "<impact bullet 3>", "<impact bullet 4>"]
    }}
  ],
  "skills": ["<skill 1>", "<skill 2>", ...],
  "projected_skills": ["<in-progress skill 1>", "<in-progress skill 2>", ...],
  "ats_keywords_injected": ["<keyword 1>", "<keyword 2>", ...],
  "ats_score": <estimated ATS match 0-100>,
  "tone": "{tone}"
}}"""

    try:
        raw = await _call_gemini(prompt)
        raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
        result = json.loads(raw)
        result["original_text"] = resume_text[:2000]
        return result
    except Exception:
        return _build_fallback(resume_text, target_role, tone, nodes)


@router.post("/add-skill")
async def add_skill_to_resume(
    skill: str = Form(...),
    current_resume_json: str = Form("{}"),
):
    """
    Called when user completes a roadmap node.
    Adds the skill to the projected_skills section.
    """
    try:
        resume = json.loads(current_resume_json)
    except Exception:
        resume = {}

    projected = resume.get("projected_skills", [])
    if skill not in projected:
        projected.append(skill)
    resume["projected_skills"] = projected

    # Also add to skills if not already there
    skills = resume.get("skills", [])
    if skill not in skills:
        skills.append(skill)
    resume["skills"] = skills

    return {"updated_resume": resume, "skill_added": skill}
