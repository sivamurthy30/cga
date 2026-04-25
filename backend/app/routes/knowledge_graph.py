"""
Routes for System 2: Semantic Knowledge Graph
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.knowledge_graph import get_knowledge_graph

router = APIRouter()


class BacktraceRequest(BaseModel):
    failed_skill: str
    known_skills: List[str] = []
    depth: int = 4


@router.post("/backtrace")
async def backtrace_gaps(req: BacktraceRequest):
    """
    Given a skill the user failed, walk the prerequisite graph backwards
    and return the foundational gaps they need to fill first.
    """
    kg = get_knowledge_graph()
    result = kg.backtrace(
        failed_skill=req.failed_skill,
        known_skills=req.known_skills,
        depth=req.depth,
    )
    return result


@router.get("/skill/{skill_name}")
async def get_skill_info(skill_name: str):
    """Return prerequisites and dependents for a skill node."""
    kg = get_knowledge_graph()
    info = kg.get_skill_info(skill_name)
    if not info["in_graph"]:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not in graph")
    return info


@router.get("/skills")
async def list_graph_skills():
    """List all skills in the knowledge graph."""
    kg = get_knowledge_graph()
    return {"skills": kg.all_skills(), "total": len(kg.all_skills())}


@router.get("/prerequisites/{skill_name}")
async def get_prerequisites(skill_name: str, min_weight: float = 0.5):
    """Return direct prerequisites for a skill above the given weight threshold."""
    kg = get_knowledge_graph()
    prereqs = kg.get_prerequisites(skill_name, min_weight=min_weight)
    return {"skill": skill_name, "prerequisites": prereqs}
