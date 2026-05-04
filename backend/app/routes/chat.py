"""
DEVA Career AI Chat — intent-based + semantic matching + caching
"""
from fastapi import APIRouter, Request
from app.ai.knowledge_base import KNOWLEDGE_BASE
from app.ai.intent_engine import classify_intent, find_best_match
from app.cache import cache

router = APIRouter()
_sessions: dict = {}


@router.post("/chat")
async def chat(body: dict, request: Request):
    session_id = body.get("session_id", "default")
    message = body.get("message", "").strip()
    user_profile = body.get("profile", {})

    if not message:
        return {"response": "Please ask me something!"}

    # Cache identical messages within same session for 60s
    cache_key = f"chat:{session_id}:{hash(message)}"
    cached_resp = await cache.get(cache_key)
    if cached_resp:
        return {"response": cached_resp, "intent": "cached"}

    ctx = _sessions.setdefault(session_id, {
        "year": None, "background": None, "goal": None,
        "history": [], "name": None,
    })
    _update_context(ctx, message, user_profile)
    intent = classify_intent(message, ctx)
    response = find_best_match(message, intent, ctx, KNOWLEDGE_BASE)

    ctx["history"].append({"user": message, "bot": response})
    if len(ctx["history"]) > 20:
        ctx["history"] = ctx["history"][-20:]

    await cache.set(cache_key, response, ttl=60)
    return {"response": response, "intent": intent}


def _update_context(ctx: dict, msg: str, profile: dict):
    m = msg.lower()
    if "1st year" in m or "first year" in m: ctx["year"] = 1
    elif "2nd year" in m or "second year" in m: ctx["year"] = 2
    elif "3rd year" in m or "third year" in m: ctx["year"] = 3
    elif "4th year" in m or "fourth year" in m or "final year" in m: ctx["year"] = 4
    elif "fresher" in m or "just graduated" in m: ctx["year"] = 0
    if "cse" in m or "computer science" in m: ctx["background"] = "CSE"
    elif "ece" in m or "electronics" in m: ctx["background"] = "ECE"
    elif "mechanical" in m or "mech" in m: ctx["background"] = "Mechanical"
    elif "non.cs" in m or "non cs" in m: ctx["background"] = "Non-CS"
    if "job" in m or "placement" in m: ctx["goal"] = "job"
    elif "higher studies" in m or "ms " in m or "mtech" in m: ctx["goal"] = "higher_studies"
    if profile.get("targetRole"): ctx["role"] = profile["targetRole"]
    if profile.get("knownSkills"): ctx["skills"] = profile["knownSkills"]
