"""
User Service
Business logic for user operations
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, date, timedelta
from typing import List, Optional

from app.database.models import User, UserSkill, QuizResult, RoadmapProgress, UserStats


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_full_profile(self, user_id: int) -> dict:
        """Get complete user profile"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get skills
        skills = self.db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        skill_list = [skill.skill for skill in skills]
        
        # Get latest quiz
        latest_quiz = self.db.query(QuizResult).filter(
            QuizResult.user_id == user_id
        ).order_by(QuizResult.created_at.desc()).first()
        
        # Get roadmap progress
        completed_nodes = self.db.query(RoadmapProgress).filter(
            RoadmapProgress.user_id == user_id,
            RoadmapProgress.completed == True
        ).all()
        
        # Get stats
        stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "target_role": user.target_role,
            "learning_speed": user.learning_speed,
            "onboarding_complete": user.onboarding_complete,
            "skills": skill_list,
            "latest_quiz": latest_quiz.results_data if latest_quiz else None,
            "completed_nodes": [node.node_id for node in completed_nodes],
            "roadmap_id": completed_nodes[0].roadmap_id if completed_nodes else "frontend-developer",
            "stats": {
                "total_xp": stats.total_xp if stats else 0,
                "streak": stats.streak if stats else 0,
                "badges": stats.badges if stats else []
            } if stats else None,
            "created_at": user.created_at.isoformat()
        }
    
    async def complete_onboarding(
        self, 
        user_id: int, 
        target_role: str, 
        known_skills: List[str],
        learning_speed: str
    ):
        """Complete onboarding and save profile"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user
        user.target_role = target_role
        user.learning_speed = learning_speed
        user.onboarding_complete = True
        
        # Add skills
        for skill in known_skills:
            existing_skill = self.db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill == skill
            ).first()
            
            if not existing_skill:
                user_skill = UserSkill(user_id=user_id, skill=skill)
                self.db.add(user_skill)
        
        # Create stats record if doesn't exist
        stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id)
            self.db.add(stats)
        
        self.db.commit()
    
    async def add_skills(self, user_id: int, skills: List[str]):
        """Add skills to user profile"""
        for skill in skills:
            existing_skill = self.db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill == skill
            ).first()
            
            if not existing_skill:
                user_skill = UserSkill(user_id=user_id, skill=skill)
                self.db.add(user_skill)
        
        self.db.commit()
    
    async def save_quiz_result(
        self,
        user_id: int,
        quiz_type: str,
        score: int,
        total_questions: int,
        category: str,
        results_data: dict
    ):
        """Save quiz/assessment results"""
        quiz = QuizResult(
            user_id=user_id,
            quiz_type=quiz_type,
            score=score,
            total_questions=total_questions,
            category=category,
            results_data=results_data
        )
        self.db.add(quiz)
        self.db.commit()
    
    async def update_roadmap_progress(
        self,
        user_id: int,
        roadmap_id: str,
        node_id: str,
        completed: bool
    ) -> dict:
        """Update roadmap node completion"""
        # Find existing progress
        progress = self.db.query(RoadmapProgress).filter(
            RoadmapProgress.user_id == user_id,
            RoadmapProgress.roadmap_id == roadmap_id,
            RoadmapProgress.node_id == node_id
        ).first()
        
        if progress:
            progress.completed = completed
            if completed and not progress.completed_at:
                progress.completed_at = datetime.utcnow()
                progress.xp_earned = 10  # Base XP
        else:
            progress = RoadmapProgress(
                user_id=user_id,
                roadmap_id=roadmap_id,
                node_id=node_id,
                completed=completed,
                completed_at=datetime.utcnow() if completed else None,
                xp_earned=10 if completed else 0
            )
            self.db.add(progress)
        
        # Update stats
        if completed:
            stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
            if not stats:
                stats = UserStats(user_id=user_id)
                self.db.add(stats)
            
            stats.total_xp += progress.xp_earned
            
            # Update streak
            today = date.today().isoformat()
            if stats.last_completed_date != today:
                yesterday = (date.today() - timedelta(days=1)).isoformat()
                if stats.last_completed_date == yesterday:
                    stats.streak += 1
                else:
                    stats.streak = 1
                stats.last_completed_date = today
        
        self.db.commit()
        
        return {
            "message": "Progress updated",
            "xp_earned": progress.xp_earned if completed else 0
        }
    
    async def get_user_stats(self, user_id: int) -> dict:
        """Get user statistics"""
        stats = self.db.query(UserStats).filter(UserStats.user_id == user_id).first()
        
        if not stats:
            # Create default stats
            stats = UserStats(user_id=user_id)
            self.db.add(stats)
            self.db.commit()
            self.db.refresh(stats)
        
        return {
            "total_xp": stats.total_xp,
            "badges": stats.badges or [],
            "streak": stats.streak,
            "last_completed_date": stats.last_completed_date
        }
