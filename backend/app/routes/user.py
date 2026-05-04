"""
User Routes — MongoDB stores ONLY: onboarding_complete + assessment_complete flags.
All other data lives in localStorage on the client.
"""
from fastapi import APIRouter, Depends
from bson import ObjectId
from app.utils.dependencies import get_current_user
from app.database.mongo import users_col

router = APIRouter()


@router.get("/status")
async def get_status(current_user=Depends(get_current_user)):
    uid = current_user["id"]
    user = await users_col().find_one({"_id": ObjectId(uid)}, {"onboarding_complete": 1, "assessment_complete": 1})
    onboarding = bool(user.get("onboarding_complete")) if user else False
    assessment = bool(user.get("assessment_complete")) if user else False

    if onboarding and assessment:
        status = "dashboard"
    elif onboarding:
        status = "assessment"
    else:
        status = "onboarding_step_0"

    return {
        "status": status,
        "user_id": uid,
        "email": current_user["email"],
        "name": current_user.get("name", current_user["email"].split("@")[0]),
        "onboarding_complete": onboarding,
        "assessment_complete": assessment,
        "is_pro": False,
        "last_saved_step": 0,
        "target_role": "",
    }


@router.post("/complete-onboarding", status_code=200)
async def complete_onboarding(body: dict, current_user=Depends(get_current_user)):
    await users_col().update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"onboarding_complete": True}},
    )
    return {"message": "Onboarding complete"}


@router.post("/quiz/save", status_code=201)
async def save_quiz(body: dict, current_user=Depends(get_current_user)):
    await users_col().update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"assessment_complete": True}},
    )
    return {"message": "Assessment saved"}


@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    return {"profile": {
        "id": current_user["id"],
        "email": current_user["email"],
        "onboarding_complete": False,
        "skills": [], "latest_quiz": None,
        "completed_nodes": [], "roadmap_id": "frontend-developer",
        "stats": {"total_xp": 0, "streak": 0, "badges": []},
    }}


@router.post("/skills/add", status_code=200)
async def add_skills(body: dict, current_user=Depends(get_current_user)):
    return {"message": "Saved locally"}


@router.post("/roadmap/progress", status_code=200)
async def roadmap_progress(body: dict, current_user=Depends(get_current_user)):
    return {"message": "Saved locally", "xp_earned": 10}


@router.post("/stats", status_code=200)
async def update_stats(body: dict, current_user=Depends(get_current_user)):
    return {"message": "Saved locally"}


@router.get("/stats")
async def get_stats(current_user=Depends(get_current_user)):
    return {"total_xp": 0, "badges": [], "streak": 0, "last_completed_date": None}


@router.post("/status/step", status_code=200)
async def save_step(body: dict, current_user=Depends(get_current_user)):
    return {"message": "Step noted"}
