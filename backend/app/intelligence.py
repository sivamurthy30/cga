"""
Context-Aware Recommendation Engine

Decision-making system that adapts recommendations based on:
- User's skill assessment scores
- Struggling topics (score < 50%)
- Learning speed
- Target role requirements
- Completed roadmap nodes

This is NOT a CRUD app — it's a decision-making system.
"""
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Role → ordered skill priority (most critical first)
ROLE_SKILL_PRIORITY: Dict[str, List[str]] = {
    "frontend":   ["JavaScript", "React", "TypeScript", "CSS", "HTML", "Next.js", "Testing", "Performance"],
    "backend":    ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "REST APIs", "Authentication", "Caching"],
    "fullstack":  ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker", "TypeScript", "REST APIs", "AWS"],
    "data":       ["Python", "Pandas", "SQL", "Machine Learning", "Statistics", "Visualization", "Spark", "dbt"],
    "ml":         ["Python", "PyTorch", "TensorFlow", "MLOps", "Feature Engineering", "Statistics", "Docker", "LLMs"],
    "devops":     ["Linux", "Docker", "Kubernetes", "Terraform", "CI/CD", "AWS", "Monitoring", "Scripting"],
    "mobile":     ["React Native", "TypeScript", "JavaScript", "Firebase", "REST APIs", "Testing", "Performance"],
    "security":   ["Python", "Linux", "Networking", "OWASP", "Cryptography", "Penetration Testing", "SIEM"],
}

# Skill prerequisites — you need A before B
PREREQUISITES: Dict[str, List[str]] = {
    "React":          ["JavaScript", "HTML", "CSS"],
    "Next.js":        ["React", "JavaScript"],
    "TypeScript":     ["JavaScript"],
    "FastAPI":        ["Python"],
    "PostgreSQL":     ["SQL"],
    "Docker":         ["Linux"],
    "Kubernetes":     ["Docker", "Linux"],
    "Terraform":      ["Linux", "AWS"],
    "PyTorch":        ["Python", "Statistics"],
    "TensorFlow":     ["Python", "Statistics"],
    "MLOps":          ["Python", "Docker"],
    "React Native":   ["React", "JavaScript"],
    "Penetration Testing": ["Linux", "Networking", "Python"],
}


def _role_key(target_role: str) -> str:
    role = target_role.lower()
    for key in ROLE_SKILL_PRIORITY:
        if key in role:
            return key
    return "fullstack"


def get_intelligent_recommendation(
    target_role: str,
    known_skills: List[str],
    assessment_results: Optional[Dict] = None,
    completed_nodes: Optional[List[str]] = None,
    learning_speed: str = "medium",
) -> Dict:
    """
    Returns the single most important skill to learn next, with full reasoning.

    Decision logic:
    1. Find skills the user is STRUGGLING with (score < 50%) → fix weaknesses first
    2. Find prerequisite skills they're missing → unblock the path
    3. Find the next role-critical skill they haven't learned → advance the path
    4. Adjust confidence based on learning speed
    """
    role_key   = _role_key(target_role)
    priority   = ROLE_SKILL_PRIORITY.get(role_key, ROLE_SKILL_PRIORITY["fullstack"])
    known_set  = {s.lower() for s in (known_skills or [])}
    done_set   = {n.lower() for n in (completed_nodes or [])}
    results    = assessment_results or {}

    # ── Step 1: Identify struggling skills (score < 50%) ─────────────────────
    struggling = [
        skill for skill, data in results.items()
        if isinstance(data, dict) and data.get("weightedPercentage", 100) < 50
    ]

    if struggling:
        # Prioritise the most critical struggling skill
        for p_skill in priority:
            for s in struggling:
                if s.lower() == p_skill.lower():
                    return {
                        "skill":      p_skill,
                        "confidence": 0.95,
                        "reason":     f"You scored below 50% in {p_skill}. Fixing weak foundations has the highest ROI.",
                        "category":   "weakness_fix",
                        "urgency":    "high",
                    }
        # Fallback to first struggling skill
        skill = struggling[0]
        return {
            "skill":      skill,
            "confidence": 0.90,
            "reason":     f"Your {skill} score needs improvement before advancing.",
            "category":   "weakness_fix",
            "urgency":    "high",
        }

    # ── Step 2: Find missing prerequisites ───────────────────────────────────
    for skill in priority:
        if skill.lower() in known_set or skill.lower() in done_set:
            continue
        prereqs = PREREQUISITES.get(skill, [])
        missing_prereqs = [p for p in prereqs if p.lower() not in known_set and p.lower() not in done_set]
        if missing_prereqs:
            prereq = missing_prereqs[0]
            return {
                "skill":      prereq,
                "confidence": 0.88,
                "reason":     f"You need {prereq} before learning {skill}. Unblocking your path.",
                "category":   "prerequisite",
                "urgency":    "medium",
                "unlocks":    skill,
            }

    # ── Step 3: Next role-critical skill ─────────────────────────────────────
    for skill in priority:
        if skill.lower() not in known_set and skill.lower() not in done_set:
            speed_boost = {"fast": 0.05, "slow": -0.05}.get(learning_speed, 0)
            confidence  = round(min(0.95, 0.82 + speed_boost), 2)
            return {
                "skill":      skill,
                "confidence": confidence,
                "reason":     f"{skill} is the next critical skill for {target_role}. It appears in 80%+ of job descriptions.",
                "category":   "role_advancement",
                "urgency":    "normal",
            }

    # ── Step 4: All role skills known — suggest advanced topic ───────────────
    return {
        "skill":      "System Design",
        "confidence": 0.80,
        "reason":     "You've covered the core skills. System Design is what separates mid-level from senior engineers.",
        "category":   "advanced",
        "urgency":    "low",
    }


def get_skill_gap_analysis(
    target_role: str,
    known_skills: List[str],
    assessment_results: Optional[Dict] = None,
) -> Dict:
    """
    Full skill gap analysis — shows exactly what's missing and why it matters.
    """
    role_key  = _role_key(target_role)
    priority  = ROLE_SKILL_PRIORITY.get(role_key, ROLE_SKILL_PRIORITY["fullstack"])
    known_set = {s.lower() for s in (known_skills or [])}
    results   = assessment_results or {}

    gaps, strengths, weak = [], [], []

    for skill in priority:
        score_data = next((v for k, v in results.items() if k.lower() == skill.lower()), None)
        score = score_data.get("weightedPercentage", 0) if isinstance(score_data, dict) else 0

        if skill.lower() in known_set and score >= 70:
            strengths.append({"skill": skill, "score": score, "level": score_data.get("level", "intermediate") if score_data else "intermediate"})
        elif skill.lower() in known_set and score < 50:
            weak.append({"skill": skill, "score": score, "priority": "fix_first"})
        else:
            gaps.append({"skill": skill, "priority": priority.index(skill) + 1})

    coverage = round(len(strengths) / len(priority) * 100) if priority else 0

    return {
        "target_role":    target_role,
        "coverage":       coverage,
        "strengths":      strengths[:5],
        "gaps":           gaps[:8],
        "weak_areas":     weak,
        "recommendation": f"Focus on {gaps[0]['skill']} next." if gaps else "You're well-covered. Go deeper on System Design.",
        "job_readiness":  "High" if coverage >= 70 else "Medium" if coverage >= 40 else "Low",
    }
