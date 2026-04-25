"""
Routes for System 3: Shadow Mentor
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from app.services.shadow_mentor import (
    record_login,
    get_pending_notifications,
    check_and_notify,
)

router = APIRouter()


class LoginEvent(BaseModel):
    user_id: str
    user_profile: Dict = {}


class StagnationCheckRequest(BaseModel):
    user_id: str
    user_profile: Dict


@router.post("/login-event")
async def on_login(event: LoginEvent):
    """
    Call this every time a user logs in.
    Records the timestamp used for stagnation detection.
    """
    record_login(event.user_id)
    return {"status": "recorded", "user_id": event.user_id}


@router.get("/notifications/{user_id}")
async def get_notifications(user_id: str):
    """
    Return unread Shadow Mentor notifications for a user.
    Marks them as read on retrieval.
    """
    notes = get_pending_notifications(user_id)
    return {"notifications": notes, "count": len(notes)}


@router.post("/check-stagnation")
async def check_stagnation(req: StagnationCheckRequest):
    """
    Manually trigger a stagnation check for a user.
    Useful for testing or on-demand checks.
    """
    note = await check_and_notify(req.user_id, req.user_profile)
    if note:
        return {"stagnant": True, "notification": note}
    return {"stagnant": False, "notification": None}
