"""
LinUCB Recommendation API Routes
Provides endpoints for reinforcement learning-based skill recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from app.services.linucb_service import get_linucb_recommender

router = APIRouter()


# Request/Response Models
class LearnerProfile(BaseModel):
    """Learner profile for recommendations"""
    id: Optional[str] = None
    target_role: str = Field(..., description="Target career role")
    known_skills: str = Field(default="", description="Comma-separated list of known skills")
    num_projects: int = Field(default=0, ge=0, le=50)
    experience_years: int = Field(default=0, ge=0, le=50)
    has_github: bool = False
    has_portfolio: bool = False
    has_certifications: bool = False
    has_quantifiable_metrics: bool = False
    learning_speed: float = Field(default=0.5, ge=0.1, le=1.0)


class SkillRecommendation(BaseModel):
    """Skill recommendation with scores"""
    skill: str
    ucb_score: float
    expected_reward: float
    objectives: Dict[str, float]
    metadata: Dict


class RecommendationResponse(BaseModel):
    """Response with skill recommendations"""
    recommendations: List[SkillRecommendation]
    total_candidates: int
    algorithm: str = "LinUCB"
    exploration_parameter: float


class FeedbackRequest(BaseModel):
    """User feedback for a recommendation"""
    learner_profile: LearnerProfile
    skill: str
    interaction_type: str = Field(
        ..., 
        description="Type: clicked, started, progress, completed, skipped"
    )
    time_spent: Optional[int] = Field(None, description="Time spent in minutes")
    completed: bool = False


class FeedbackResponse(BaseModel):
    """Response after feedback"""
    success: bool
    reward: float
    message: str


class StatisticsResponse(BaseModel):
    """Recommendation statistics"""
    total_interactions: int
    average_reward: float
    median_reward: float
    total_skills_recommended: int
    reward_distribution: Dict[str, int]


# API Endpoints

@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_skills(
    profile: LearnerProfile,
    top_k: int = 5,
    exclude_known: bool = True
):
    """
    Get personalized skill recommendations using LinUCB
    
    **Algorithm**: LinUCB (Linear Upper Confidence Bound) Contextual Bandit
    
    **Features**:
    - Exploration-exploitation balance
    - Multi-objective reward optimization
    - Personalized to learner context
    
    **Parameters**:
    - profile: Learner profile with target role and skills
    - top_k: Number of recommendations (1-10)
    - exclude_known: Exclude already known skills
    
    **Returns**:
    - List of recommended skills with scores and metadata
    """
    try:
        # Validate top_k
        if top_k < 1 or top_k > 10:
            raise HTTPException(status_code=400, detail="top_k must be between 1 and 10")
        
        # Get recommender
        recommender = get_linucb_recommender()
        
        # Convert to dict
        profile_dict = profile.dict()
        
        # Get recommendations
        recommendations = recommender.recommend_skills(
            learner_profile=profile_dict,
            top_k=top_k,
            exclude_known=exclude_known
        )
        
        # Count total candidates
        known_skills = [s.strip() for s in profile.known_skills.split(',') if s.strip()]
        total_candidates = len(recommender.all_skills) - len(known_skills) if exclude_known else len(recommender.all_skills)
        
        return RecommendationResponse(
            recommendations=recommendations,
            total_candidates=total_candidates,
            algorithm="LinUCB",
            exploration_parameter=recommender.alpha
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackRequest):
    """
    Submit user feedback to update LinUCB model
    
    **Interaction Types**:
    - `clicked`: User clicked on skill (reward: 0.2)
    - `started`: User started learning (reward: 0.4)
    - `progress`: User made progress (reward: 0.3-0.7 based on time)
    - `completed`: User completed skill (reward: 1.0)
    - `skipped`: User skipped skill (reward: 0.0)
    
    **Learning**:
    - Model updates immediately with feedback
    - Future recommendations improve based on interactions
    
    **Parameters**:
    - feedback: Interaction details with learner profile
    
    **Returns**:
    - Calculated reward and success status
    """
    try:
        # Get recommender
        recommender = get_linucb_recommender()
        
        # Calculate reward from interaction
        reward = recommender.calculate_reward_from_interaction(
            interaction_type=feedback.interaction_type,
            time_spent=feedback.time_spent,
            completed=feedback.completed
        )
        
        # Update model
        profile_dict = feedback.learner_profile.dict()
        recommender.update_with_feedback(
            learner_profile=profile_dict,
            skill=feedback.skill,
            reward=reward
        )
        
        # Save model periodically (every 10 interactions)
        if len(recommender.interaction_history) % 10 == 0:
            try:
                import os
                model_path = os.path.join(
                    os.path.dirname(__file__),
                    '../../../data/linucb_model.json'
                )
                recommender.save_model(model_path)
            except Exception as save_error:
                print(f"⚠️ Could not save model: {save_error}")
        
        return FeedbackResponse(
            success=True,
            reward=reward,
            message=f"Feedback recorded. Reward: {reward:.2f}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback error: {str(e)}")


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics():
    """
    Get LinUCB recommendation statistics
    
    **Metrics**:
    - Total interactions
    - Average and median reward
    - Reward distribution
    - Total unique skills recommended
    
    **Returns**:
    - Statistics about recommendation performance
    """
    try:
        recommender = get_linucb_recommender()
        stats = recommender.get_statistics()
        
        return StatisticsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics error: {str(e)}")


@router.get("/skills")
async def get_all_skills():
    """
    Get list of all available skills
    
    **Returns**:
    - List of all skills in the system
    - Total count
    """
    try:
        recommender = get_linucb_recommender()
        
        return {
            "skills": recommender.all_skills,
            "total": len(recommender.all_skills),
            "categories": recommender.skills_df['category'].unique().tolist()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skills error: {str(e)}")


@router.get("/roles")
async def get_all_roles():
    """
    Get list of all career roles with required skills
    
    **Returns**:
    - Dictionary mapping roles to required skills
    """
    try:
        recommender = get_linucb_recommender()
        
        return {
            "roles": recommender.role_skills_map,
            "total": len(recommender.role_skills_map)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roles error: {str(e)}")


@router.post("/explain")
async def explain_recommendation(
    profile: LearnerProfile,
    skill: str
):
    """
    Explain why a skill was recommended
    
    **Returns**:
    - Detailed breakdown of recommendation scores
    - Multi-objective rewards
    - Skill metadata
    """
    try:
        recommender = get_linucb_recommender()
        
        # Get target role skills
        target_role = profile.target_role
        target_role_skills = recommender.role_skills_map.get(target_role, [])
        
        # Calculate multi-objective reward
        reward, objectives = recommender.reward_calculator.calculate_multi_objective_reward(
            skill=skill,
            learner=profile.dict(),
            target_role_skills=target_role_skills
        )
        
        # Get skill metadata
        skill_info = recommender.skills_df[recommender.skills_df['skill'] == skill]
        if skill_info.empty:
            raise HTTPException(status_code=404, detail=f"Skill '{skill}' not found")
        
        skill_data = skill_info.iloc[0]
        
        return {
            "skill": skill,
            "total_reward": float(reward),
            "objectives": {
                "career_readiness": {
                    "score": float(objectives['career_readiness']),
                    "weight": 0.40,
                    "description": "How much this skill helps reach career goal"
                },
                "time_efficiency": {
                    "score": float(objectives['time_efficiency']),
                    "weight": 0.20,
                    "description": "How quickly this skill can be learned"
                },
                "difficulty_match": {
                    "score": float(objectives['difficulty_match']),
                    "weight": 0.20,
                    "description": "How well difficulty matches learner ability"
                },
                "market_demand": {
                    "score": float(objectives['market_demand']),
                    "weight": 0.15,
                    "description": "Job market demand for this skill"
                },
                "prerequisite_fit": {
                    "score": float(objectives['prerequisite_fit']),
                    "weight": 0.05,
                    "description": "Whether learner has prerequisites"
                }
            },
            "metadata": {
                "difficulty": float(skill_data['difficulty']),
                "learning_time": int(skill_data['learning_time']),
                "category": skill_data['category'],
                "is_required_for_role": skill in target_role_skills
            },
            "explanation": f"This skill is recommended because it has a {reward:.1%} overall fit score. "
                          f"It's {'required' if skill in target_role_skills else 'beneficial'} for {target_role}."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")


@router.get("/health")
async def health_check():
    """Check if LinUCB service is healthy"""
    try:
        recommender = get_linucb_recommender()
        stats = recommender.get_statistics()
        
        return {
            "status": "healthy",
            "algorithm": "LinUCB",
            "total_skills": len(recommender.all_skills),
            "total_roles": len(recommender.role_skills_map),
            "total_interactions": stats['total_interactions'],
            "average_reward": stats['average_reward']
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
