from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings
from app.database.db import db

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.get_learner(int(user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    skills = db.get_learner_skills(user_id)
    quiz_results = db.get_quiz_results(user_id, limit=5)
    stats = db.get_user_stats(user_id)
    
    latest_quiz = quiz_results[0].get('results_data') if quiz_results else None
    roadmap_id = 'frontend-developer'
    completed_nodes = db.get_roadmap_progress(user_id, roadmap_id)
    
    return {
        "profile": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "target_role": current_user.get("target_role", ""),
            "learning_speed": current_user.get("learning_speed", "medium"),
            "onboarding_complete": current_user.get("onboarding_complete", 0),
            "created_at": current_user.get("created_at"),
            "skills": skills,
            "latest_quiz": latest_quiz,
            "quiz_results": quiz_results,
            "stats": stats,
            "completed_nodes": completed_nodes,
            "roadmap_id": roadmap_id
        }
    }

@router.post("/complete-onboarding")
async def complete_onboarding(request: Request, current_user: dict = Depends(get_current_user)):
    data = await request.json()
    target_role = data.get('target_role', '')
    known_skills = data.get('known_skills', [])
    learning_speed = data.get('learning_speed', 'medium')
    
    user_id = current_user["id"]
    
    db.update_learner(user_id,
                      target_role=target_role,
                      learning_speed=learning_speed,
                      onboarding_complete=1)

    if known_skills:
        db.add_skills_batch(user_id, known_skills)

    return {'message': 'Onboarding complete', 'target_role': target_role}

@router.get("/roadmap/progress")
async def get_roadmap_progress(roadmap_id: str = 'frontend-developer', current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    completed_nodes = db.get_roadmap_progress(user_id, roadmap_id)
    stats = db.get_user_stats(user_id)

    return {
        'completed_nodes': completed_nodes,
        'roadmap_id': roadmap_id,
        'stats': stats
    }

@router.post("/roadmap/progress")
async def update_roadmap_progress(request: Request, current_user: dict = Depends(get_current_user)):
    data = await request.json()
    roadmap_id = data.get('roadmap_id', 'frontend-developer')
    node_id = data.get('node_id')
    completed = data.get('completed', True)
    
    if not node_id:
        raise HTTPException(status_code=400, detail="node_id is required")

    db.upsert_roadmap_node(current_user["id"], roadmap_id, node_id, completed)
    return {'message': 'Progress saved', 'node_id': node_id, 'completed': completed}


@router.post("/quiz/save")
async def save_quiz_results(request: Request, current_user: dict = Depends(get_current_user)):
    data = await request.json()
    quiz_type = data.get("quiz_type", "skill_assessment")
    score = data.get("score", 0)
    total_questions = data.get("total_questions", 0)
    category = data.get("category", "")
    results_data = data.get("results_data", {})

    result_id = db.save_quiz_result(
        learner_id=current_user["id"],
        quiz_type=quiz_type,
        score=score,
        total_questions=total_questions,
        category=category,
        results_data=results_data
    )
    db.update_learner(current_user["id"], quiz_score=score, quiz_category=category)
    return {"message": "Quiz results saved", "id": result_id}


@router.get("/status")
async def get_user_status(current_user: dict = Depends(get_current_user)):
    """Anti-Amnesia Shield — returns exactly where the user left off."""
    user_id = current_user["id"]
    onboarding_complete = bool(current_user.get("onboarding_complete", 0))
    last_saved_step = current_user.get("last_saved_step", 0) or 0
    is_pro = bool(current_user.get("is_pro", 0))

    if not onboarding_complete:
        status = f"onboarding_step_{last_saved_step}"
    else:
        # Once onboarding is done, always go to dashboard.
        # Assessment is only shown once (first time, triggered by frontend after onboarding).
        # Returning users should never be blocked by a missing quiz record.
        status = "dashboard"

    return {
        "status": status,
        "last_saved_step": last_saved_step,
        "onboarding_complete": onboarding_complete,
        "is_pro": is_pro,
        "target_role": current_user.get("target_role", ""),
        "user_id": user_id,
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
    }


@router.post("/status/step")
async def save_onboarding_step(request: Request, current_user: dict = Depends(get_current_user)):
    """Atomic save — called after every onboarding step click."""
    data = await request.json()
    step = data.get("step", 0)
    db.update_learner(current_user["id"], last_saved_step=step)
    return {"saved": True, "step": step}


@router.post("/stats")
async def update_user_stats(request: Request, current_user: dict = Depends(get_current_user)):
    """Update XP, badges, streak from frontend Zustand store."""
    import json as _json
    data = await request.json()
    user_id = current_user["id"]
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_stats (learner_id, total_xp, badges, streak, last_completed_date)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(learner_id) DO UPDATE SET
                total_xp = excluded.total_xp,
                badges = excluded.badges,
                streak = excluded.streak,
                last_completed_date = excluded.last_completed_date
        ''', (
            user_id,
            data.get("total_xp", 0),
            _json.dumps(data.get("badges", [])),
            data.get("streak", 0),
            data.get("last_completed_date", ""),
        ))
    return {"saved": True}


@router.post("/pro/activate")
async def activate_pro(request: Request, current_user: dict = Depends(get_current_user)):
    """Called by PayU webhook after successful payment."""
    db.update_learner(current_user["id"], is_pro=1)
    return {"is_pro": True, "message": "DEVAsquare Pro activated"}
