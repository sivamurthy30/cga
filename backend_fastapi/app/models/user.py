"""
User Pydantic Models
Request/Response schemas with automatic validation
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    """User response model (no password)"""
    id: int
    target_role: Optional[str] = None
    onboarding_complete: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """Extended user profile with skills and stats"""
    skills: List[str] = []
    learning_speed: str = "medium"
    quiz_score: Optional[int] = None
    quiz_category: Optional[str] = None
    latest_quiz: Optional[dict] = None
    stats: Optional[dict] = None
    completed_nodes: List[str] = []
    roadmap_id: str = "frontend-developer"


class OnboardingComplete(BaseModel):
    """Onboarding completion data"""
    target_role: str = Field(..., min_length=1)
    known_skills: List[str] = []
    learning_speed: str = Field(default="medium", pattern="^(slow|medium|fast)$")


class SkillAdd(BaseModel):
    """Add skills to user"""
    skills: List[str] = Field(..., min_items=1)


class QuizResult(BaseModel):
    """Quiz result submission"""
    quiz_type: str = "skill_assessment"
    score: int = Field(..., ge=0)
    total_questions: int = Field(..., gt=0)
    category: str = ""
    results_data: dict = {}
    
    @validator('score')
    def score_not_greater_than_total(cls, v, values):
        if 'total_questions' in values and v > values['total_questions']:
            raise ValueError('score cannot be greater than total_questions')
        return v


class RoadmapProgress(BaseModel):
    """Roadmap node progress"""
    roadmap_id: str = Field(default="frontend-developer")
    node_id: str = Field(..., min_length=1)
    completed: bool = True


class UserStats(BaseModel):
    """User statistics"""
    total_xp: int = Field(default=0, ge=0)
    badges: List[str] = []
    streak: int = Field(default=0, ge=0)
    last_completed_date: Optional[str] = None


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)
