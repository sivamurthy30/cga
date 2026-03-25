"""
User Routes - Profile, Skills, Progress
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database.db import get_db
from app.models.user import (
    UserProfile, OnboardingComplete, SkillAdd, 
    QuizResult, RoadmapProgress, UserStats
)
from app.utils.dependencies import get_current_user
from app.services.user_service import UserService


router = APIRouter()


@router.get("/profile", response_model=dict)
async def get_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile with skills and progress"""
    user_service = UserService(db)
    profile = await user_service.get_full_profile(current_user.id)
    return {"profile": profile}


@router.post("/complete-onboarding", status_code=status.HTTP_200_OK)
async def complete_onboarding(
    data: OnboardingComplete,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark onboarding as complete and save initial profile"""
    user_service = UserService(db)
    await user_service.complete_onboarding(
        user_id=current_user.id,
        target_role=data.target_role,
        known_skills=data.known_skills,
        learning_speed=data.learning_speed
    )
    return {"message": "Onboarding completed successfully"}


@router.post("/skills/add", status_code=status.HTTP_200_OK)
async def add_skills(
    data: SkillAdd,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add skills to user profile"""
    user_service = UserService(db)
    await user_service.add_skills(current_user.id, data.skills)
    return {"message": f"Added {len(data.skills)} skills", "skills": data.skills}


@router.post("/quiz/save", status_code=status.HTTP_201_CREATED)
async def save_quiz_result(
    quiz: QuizResult,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save quiz/assessment results"""
    user_service = UserService(db)
    await user_service.save_quiz_result(
        user_id=current_user.id,
        quiz_type=quiz.quiz_type,
        score=quiz.score,
        total_questions=quiz.total_questions,
        category=quiz.category,
        results_data=quiz.results_data
    )
    return {"message": "Quiz results saved successfully"}


@router.post("/roadmap/progress", status_code=status.HTTP_200_OK)
async def update_roadmap_progress(
    progress: RoadmapProgress,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update roadmap node completion"""
    user_service = UserService(db)
    result = await user_service.update_roadmap_progress(
        user_id=current_user.id,
        roadmap_id=progress.roadmap_id,
        node_id=progress.node_id,
        completed=progress.completed
    )
    return result


@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics (XP, badges, streak)"""
    user_service = UserService(db)
    stats = await user_service.get_user_stats(current_user.id)
    return stats
