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
from app.utils.dependencies import get_current_user
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


@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    learner_id: Optional[int] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and analyze resume"""
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Use: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Analyze resume
    ml_service = MLService(db)
    result = await ml_service.analyze_resume(
        file_path=file_path,
        user_id=current_user.id
    )
    
    # Clean up file in background
    background_tasks.add_task(os.remove, file_path)
    
    return result


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
