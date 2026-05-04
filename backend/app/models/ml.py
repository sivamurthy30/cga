"""
ML & Recommendation Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class RecommendationRequest(BaseModel):
    """Skill recommendation request"""
    targetRole: str = Field(..., min_length=1)
    knownSkills: List[str] = []
    learningSpeed: str = Field(default="medium", pattern="^(slow|medium|fast)$")
    algorithm: str = Field(default="linucb", pattern="^(linucb|thompson|neural|hybrid)$")


class RecommendationResponse(BaseModel):
    """Skill recommendation response"""
    skill: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    algorithm: str
    message: str


class ResumeUploadResponse(BaseModel):
    """Resume analysis response"""
    skills_found: List[str]
    total_skills: int
    learning_speed: str
    message: str


class GitHubAnalysisRequest(BaseModel):
    """GitHub analysis request"""
    learner_id: Optional[int] = None
    github_username: str = Field(..., min_length=1)


class GitHubAnalysisResponse(BaseModel):
    """GitHub analysis response"""
    skills_found: List[str]
    activity_score: int = Field(..., ge=0, le=100)
    message: str
