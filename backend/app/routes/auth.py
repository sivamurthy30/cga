"""
Auth Routes — MongoDB primary, SQLite fallback when Atlas is unreachable.
MongoDB stores: email, password_hash, onboarding_complete, assessment_complete, is_pro
Everything else (skills, progress, profile) lives in localStorage on the client.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId

from app.database.mongo import users_col, is_mongo_ready
from app.database.sqlite_auth import (
    sqlite_find_user, sqlite_create_user, sqlite_update_user, init_sqlite_users
)
from app.utils.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.events import emit
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Ensure SQLite table exists at import time
init_sqlite_users()

# ── Pro email list ─────────────────────────────────────────────────────────────
PRO_EMAILS = {"pro@deva.dev", "admin@deva.dev"}


def _make_tokens(uid: str, email: str) -> dict:
    return {
        "token": create_access_token({"user_id": uid, "email": email}),
        "refresh_token": create_refresh_token({"user_id": uid, "email": email}),
    }


# ── Helpers: unified read/write that pick the right backend ───────────────────

async def _find_user(email: str) -> dict | None:
    if is_mongo_ready():
        doc = await users_col().find_one({"email": email})
        if doc:
            doc["id"] = str(doc["_id"])
            return doc
        return None
    return sqlite_find_user(email)


async def _create_user(email: str, password_hash: str, name: str,
                        is_pro: bool) -> str:
    if is_mongo_ready():
        result = await users_col().insert_one({
            "email": email,
            "password_hash": password_hash,
            "onboarding_complete": False,
            "assessment_complete": False,
            "is_pro": is_pro,
            "created_at": datetime.utcnow(),
        })
        return str(result.inserted_id)
    return sqlite_create_user(email, password_hash, name, is_pro)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
async def signup(body: dict):
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    name     = body.get("name") or email.split("@")[0]

    if not email or not password:
        raise HTTPException(400, "Email and password required")
    if len(password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    if await _find_user(email):
        raise HTTPException(400, "Email already registered")

    is_pro = email in PRO_EMAILS
    uid = await _create_user(email, hash_password(password), name, is_pro)

    backend = "MongoDB" if is_mongo_ready() else "SQLite"
    logger.info(f"✅ Signup via {backend}: {email}")

    return {
        **_make_tokens(uid, email),
        "user": {
            "id": uid, "email": email, "name": name,
            "onboarding_complete": False, "assessment_complete": False,
            "is_pro": is_pro,
        },
    }


@router.post("/login", status_code=200)
async def login(body: dict):
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    name     = body.get("name") or email.split("@")[0]

    if not email or not password:
        raise HTTPException(400, "Email and password required")

    user = await _find_user(email)

    if not user:
        # Auto-register on first login
        is_pro = email in PRO_EMAILS
        uid = await _create_user(email, hash_password(password), name, is_pro)
        onboarding = False
        assessment = False
    else:
        if not verify_password(password, user["password_hash"]):
            raise HTTPException(401, "Invalid credentials")
        uid        = user.get("id") or str(user.get("_id", user.get("id", "")))
        onboarding = bool(user.get("onboarding_complete", False))
        assessment = bool(user.get("assessment_complete", False))
        is_pro     = bool(user.get("is_pro", False)) or (email in PRO_EMAILS)

    await emit("USER_LOGGED_IN", {"user_id": uid, "email": email})

    backend = "MongoDB" if is_mongo_ready() else "SQLite"
    logger.info(f"✅ Login via {backend}: {email}")

    return {
        **_make_tokens(uid, email),
        "user": {
            "id": uid, "email": email, "name": name,
            "onboarding_complete": onboarding, "assessment_complete": assessment,
            "is_pro": is_pro,
        },
    }


@router.post("/dev-login", status_code=200)
async def dev_login(body: dict):
    email = "pro@deva.dev"
    if body.get("email") != email:
        raise HTTPException(403, "Dev login only for pro@deva.dev")

    user = await _find_user(email)
    if not user:
        uid = await _create_user(email, hash_password("DevaPro123!"), "Pro Tester", True)
    else:
        uid = user.get("id") or str(user.get("_id", ""))
        if is_mongo_ready():
            await users_col().update_one({"_id": ObjectId(uid)}, {"$set": {"is_pro": True}})
        else:
            sqlite_update_user(email, is_pro=1)

    return {
        **_make_tokens(uid, email),
        "user": {
            "id": uid, "email": email, "name": "Pro Tester",
            "onboarding_complete": True, "assessment_complete": True, "is_pro": True,
        },
    }


@router.post("/grant-pro", status_code=200)
async def grant_pro(body: dict):
    email = body.get("email", "").strip().lower()
    if not email:
        raise HTTPException(400, "Email required")

    if is_mongo_ready():
        result = await users_col().update_one(
            {"email": email}, {"$set": {"is_pro": True}}, upsert=False
        )
        if result.matched_count == 0:
            return {"message": "Pro granted (user not in DB yet)", "is_pro": True, "email": email}
    else:
        sqlite_update_user(email, is_pro=1)

    return {"message": "Pro status granted", "is_pro": True, "email": email}


@router.post("/logout", status_code=200)
async def logout():
    return {"message": "Logged out"}


@router.post("/refresh", status_code=200)
async def refresh(body: dict):
    payload = decode_token(body.get("refresh_token", ""))
    if not payload:
        raise HTTPException(401, "Invalid refresh token")
    return {"token": create_access_token({"user_id": payload["user_id"], "email": payload["email"]})}
