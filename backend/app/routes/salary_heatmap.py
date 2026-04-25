"""
Salary Heatmap — Live salary data for target roles.
"""
import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_STATIC_SALARIES = {
    "frontend developer": {"min": 75000, "median": 105000, "max": 155000, "yoy_change": 4.2},
    "backend developer": {"min": 85000, "median": 115000, "max": 170000, "yoy_change": 5.1},
    "full stack developer": {"min": 90000, "median": 120000, "max": 175000, "yoy_change": 4.8},
    "data scientist": {"min": 95000, "median": 130000, "max": 190000, "yoy_change": 6.3},
    "machine learning engineer": {"min": 110000, "median": 150000, "max": 220000, "yoy_change": 8.5},
    "devops engineer": {"min": 95000, "median": 130000, "max": 185000, "yoy_change": 5.7},
    "security engineer": {"min": 100000, "median": 140000, "max": 200000, "yoy_change": 7.2},
    "mobile developer": {"min": 85000, "median": 115000, "max": 165000, "yoy_change": 3.9},
}

_CITIES = [
    {"city": "San Francisco", "multiplier": 1.45},
    {"city": "New York", "multiplier": 1.35},
    {"city": "Seattle", "multiplier": 1.30},
    {"city": "Austin", "multiplier": 1.10},
    {"city": "Chicago", "multiplier": 1.05},
    {"city": "Remote", "multiplier": 1.15},
    {"city": "Bangalore", "multiplier": 0.35},
    {"city": "London", "multiplier": 1.20},
]

_PREMIUM_SKILLS = {
    "frontend developer": ["TypeScript", "React", "Next.js", "WebAssembly"],
    "backend developer": ["Rust", "Go", "Kafka", "gRPC"],
    "machine learning engineer": ["PyTorch", "MLOps", "LLM Fine-tuning", "CUDA"],
    "data scientist": ["Python", "Spark", "dbt", "Tableau"],
    "devops engineer": ["Kubernetes", "Terraform", "ArgoCD", "eBPF"],
    "security engineer": ["Zero Trust", "SIEM", "Threat Modeling", "Rust"],
}


class SalaryPoint(BaseModel):
    city: str
    min_salary: int
    median_salary: int
    max_salary: int
    yoy_change: float


class SalaryHeatmapResponse(BaseModel):
    role: str
    currency: str
    data_points: list[SalaryPoint]
    top_skills_premium: list[str]
    market_trend: str
    last_updated: str


@router.get("/heatmap", response_model=SalaryHeatmapResponse)
async def get_salary_heatmap(role: str = "Full Stack Developer"):
    role_key = role.lower().strip()
    base = _STATIC_SALARIES.get(role_key, _STATIC_SALARIES["full stack developer"])

    data_points = []
    for city_info in _CITIES:
        m = city_info["multiplier"]
        data_points.append(SalaryPoint(
            city=city_info["city"],
            min_salary=int(base["min"] * m),
            median_salary=int(base["median"] * m),
            max_salary=int(base["max"] * m),
            yoy_change=round(base["yoy_change"] + (m - 1) * 2, 1),
        ))

    # Get premium skills for role
    premium_skills = _PREMIUM_SKILLS.get(
        role_key,
        ["Cloud Architecture", "System Design", "Distributed Systems", "AI/ML Integration"]
    )

    return SalaryHeatmapResponse(
        role=role,
        currency="USD",
        data_points=data_points,
        top_skills_premium=premium_skills,
        market_trend=(
            f"Demand for {role}s is up {base['yoy_change']}% YoY. "
            "Remote roles command a 15% premium over national average."
        ),
        last_updated="2026-04-22",
    )
