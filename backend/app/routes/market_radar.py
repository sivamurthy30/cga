"""
Market Radar — Trending skills in the job market.
Nodes on the roadmap glow if the skill is currently trending.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Curated trending skills (updated periodically — in prod, pull from job APIs)
_TRENDING = {
    "hot": [
        "Rust", "Go", "TypeScript", "Next.js", "Kubernetes",
        "LLM Fine-tuning", "MLOps", "Terraform", "eBPF",
        "WebAssembly", "Bun", "Deno", "tRPC", "Prisma",
    ],
    "rising": [
        "React Server Components", "Astro", "Svelte", "Hono",
        "PyTorch", "LangChain", "Vector Databases", "Qdrant",
        "ArgoCD", "Cilium", "OpenTelemetry", "Grafana",
    ],
    "stable": [
        "React", "Python", "Docker", "PostgreSQL", "Redis",
        "Node.js", "FastAPI", "GraphQL", "AWS", "Git",
    ],
}

# Salary premium for trending skills (% above base)
_SALARY_PREMIUM = {
    "Rust": 22, "Go": 18, "TypeScript": 12, "Kubernetes": 20,
    "LLM Fine-tuning": 35, "MLOps": 28, "Terraform": 18,
    "WebAssembly": 25, "eBPF": 30, "Next.js": 10,
    "PyTorch": 22, "LangChain": 20, "Vector Databases": 25,
}


class TrendingSkillsResponse(BaseModel):
    hot: list[str]
    rising: list[str]
    stable: list[str]
    salary_premium: dict[str, int]
    last_updated: str


@router.get("/trending", response_model=TrendingSkillsResponse)
async def get_trending_skills():
    return TrendingSkillsResponse(
        hot=_TRENDING["hot"],
        rising=_TRENDING["rising"],
        stable=_TRENDING["stable"],
        salary_premium=_SALARY_PREMIUM,
        last_updated="2026-04-22",
    )


@router.get("/trending/{skill}")
async def get_skill_trend(skill: str):
    skill_lower = skill.lower()
    for tier, skills in _TRENDING.items():
        if any(s.lower() == skill_lower for s in skills):
            return {
                "skill": skill,
                "tier": tier,
                "is_trending": tier in ("hot", "rising"),
                "salary_premium": _SALARY_PREMIUM.get(skill, 0),
            }
    return {"skill": skill, "tier": "unknown", "is_trending": False, "salary_premium": 0}
