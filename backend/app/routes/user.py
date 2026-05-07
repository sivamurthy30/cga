"""
User Routes — backend is the SINGLE source of truth.

Key rules:
- /status  : always reads from DB, never crashes, returns next_route
- /complete-onboarding : writes to BOTH MongoDB and SQLite
- /quiz/save           : writes to BOTH MongoDB and SQLite
- /profile             : returns REAL values from DB (never hardcoded)
- Logout does NOT clear onboarding/assessment flags
"""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.utils.dependencies import get_current_user
from app.database.mongo import users_col, is_mongo_ready
from app.database.sqlite_auth import sqlite_find_user, sqlite_update_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# ══════════════════════════════════════════════════════════════════════════════
# SHARED HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _get_next_route(onboarding: bool, assessment: bool) -> str:
    """Determine where the frontend should route the user."""
    if not onboarding:
        return "/onboarding"
    if not assessment:
        return "/assessment"
    return "/dashboard"


async def _get_user_flags(uid: str, email: str) -> dict:
    """
    Read all completion flags from DB.
    Tries MongoDB first, falls back to SQLite.
    Returns safe defaults if both fail — never crashes.
    """
    # ── Try MongoDB ────────────────────────────────────────────────────────────
    if is_mongo_ready():
        try:
            doc = await users_col().find_one(
                {"_id": ObjectId(uid)},
                {"onboarding_complete": 1, "assessment_complete": 1,
                 "profile_complete": 1, "is_pro": 1, "subscription_status": 1}
            )
            if doc:
                return {
                    "onboarding_complete":  bool(doc.get("onboarding_complete",  False)),
                    "assessment_complete":  bool(doc.get("assessment_complete",  False)),
                    "profile_complete":     bool(doc.get("profile_complete",     False)),
                    "is_pro":               bool(doc.get("is_pro",               False)),
                    "subscription_status":  doc.get("subscription_status", "free"),
                }
        except Exception as e:
            logger.warning(f"MongoDB read failed for uid={uid}: {e}")

    # ── SQLite fallback ────────────────────────────────────────────────────────
    row = sqlite_find_user(email)
    if row:
        return {
            "onboarding_complete":  bool(row.get("onboarding_complete",  0)),
            "assessment_complete":  bool(row.get("assessment_complete",  0)),
            "profile_complete":     bool(row.get("profile_complete",     0)),
            "is_pro":               bool(row.get("is_pro",               0)),
            "subscription_status":  row.get("subscription_status", "free"),
        }

    # ── Both DBs unavailable — safe defaults (do NOT reset progress) ──────────
    logger.warning(f"Both DBs unavailable for uid={uid} — returning safe defaults")
    return {
        "onboarding_complete": False, "assessment_complete": False,
        "profile_complete": False, "is_pro": False, "subscription_status": "free",
    }


async def _update_user_flags(uid: str, email: str, **flags) -> bool:
    """
    Write flags to BOTH MongoDB and SQLite.
    Returns True if at least one DB succeeded.
    Logs errors from each DB independently.
    """
    mongo_ok  = False
    sqlite_ok = False

    # ── MongoDB ────────────────────────────────────────────────────────────────
    if is_mongo_ready():
        try:
            await users_col().update_one(
                {"_id": ObjectId(uid)},
                {"$set": {**flags, "updated_at": datetime.utcnow()}},
            )
            mongo_ok = True
        except Exception as e:
            logger.error(f"MongoDB write failed for uid={uid}: {e}")

    # ── SQLite (always attempt, regardless of MongoDB result) ─────────────────
    try:
        sqlite_fields = {k: (int(v) if isinstance(v, bool) else v) for k, v in flags.items()}
        sqlite_update_user(email, **sqlite_fields)
        sqlite_ok = True
    except Exception as e:
        logger.error(f"SQLite write failed for email={email}: {e}")

    if not mongo_ok and not sqlite_ok:
        raise HTTPException(500, "Failed to persist user data to any database")

    return True


# ══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/status")
async def get_status(current_user=Depends(get_current_user)):
    """
    THE source of truth for frontend routing.
    Called after every login and page refresh.
    Returns next_route so frontend never has to guess.
    """
    uid   = current_user["id"]
    email = current_user["email"]

    flags = await _get_user_flags(uid, email)

    onboarding = flags["onboarding_complete"]
    assessment = flags["assessment_complete"]
    profile    = flags["profile_complete"]
    is_pro     = flags["is_pro"]
    sub_status = flags["subscription_status"]

    next_route = _get_next_route(onboarding, assessment)

    # Legacy "status" field kept for backward compatibility
    if next_route == "/dashboard":
        status = "dashboard"
    elif next_route == "/assessment":
        status = "assessment"
    else:
        status = "onboarding_step_0"

    return {
        # ── Routing ──────────────────────────────────────────────────────────
        "next_route":           next_route,
        "status":               status,          # legacy alias
        # ── Completion flags ─────────────────────────────────────────────────
        "onboarding_completed": onboarding,
        "assessment_completed": assessment,
        "profile_completed":    profile,
        "onboarding_complete":  onboarding,      # legacy alias
        "assessment_complete":  assessment,      # legacy alias
        # ── Subscription ─────────────────────────────────────────────────────
        "is_pro":               is_pro,
        "subscription_status":  sub_status,
        # ── User info ────────────────────────────────────────────────────────
        "authenticated":        True,
        "user_id":              uid,
        "email":                email,
        "name":                 current_user.get("name", email.split("@")[0]),
        "last_saved_step":      0,
        "target_role":          "",
    }


@router.post("/complete-onboarding", status_code=200)
async def complete_onboarding(body: dict, current_user=Depends(get_current_user)):
    """
    Called when user finishes onboarding.
    Writes onboarding_complete=True to BOTH MongoDB and SQLite.
    """
    uid   = current_user["id"]
    email = current_user["email"]

    await _update_user_flags(uid, email,
        onboarding_complete=True,
        profile_complete=True,
    )
    logger.info(f"✅ Onboarding complete: {email}")

    return {
        "message":              "Onboarding complete",
        "onboarding_completed": True,
        "profile_completed":    True,
        "next_route":           "/assessment",
    }


@router.post("/quiz/save", status_code=201)
async def save_quiz(body: dict, current_user=Depends(get_current_user)):
    """
    Called when user completes the skill assessment.
    Writes assessment_complete=True to BOTH MongoDB and SQLite.
    """
    uid   = current_user["id"]
    email = current_user["email"]

    await _update_user_flags(uid, email, assessment_complete=True)
    logger.info(f"✅ Assessment complete: {email}")

    return {
        "message":              "Assessment saved",
        "assessment_completed": True,
        "next_route":           "/dashboard",
    }


@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    """
    Returns user profile with REAL completion flags from DB.
    Never hardcodes onboarding_complete: False.
    """
    uid   = current_user["id"]
    email = current_user["email"]

    flags = await _get_user_flags(uid, email)
    next_route = _get_next_route(
        flags["onboarding_complete"],
        flags["assessment_complete"],
    )

    return {"profile": {
        "id":                   uid,
        "email":                email,
        # ── Real values from DB ───────────────────────────────────────────────
        "onboarding_complete":  flags["onboarding_complete"],
        "assessment_complete":  flags["assessment_complete"],
        "profile_complete":     flags["profile_complete"],
        "is_pro":               flags["is_pro"],
        "subscription_status":  flags["subscription_status"],
        "next_route":           next_route,
        # ── Skill/roadmap data (stored in localStorage) ───────────────────────
        "skills":               [],
        "latest_quiz":          None,
        "completed_nodes":      [],
        "roadmap_id":           "frontend-developer",
        "stats":                {"total_xp": 0, "streak": 0, "badges": []},
    }}


# ── Misc endpoints ────────────────────────────────────────────────────────────

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
