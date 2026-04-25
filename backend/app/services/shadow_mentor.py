"""
System 3: Shadow Mentor — Agentic AI
- Monitors user stagnation (no login for 3+ days)
- Calls Gemini Flash to generate a personalised Market Insight notification
- Stores notifications in DB; exposes them via API
"""

from __future__ import annotations
import os
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)
STAGNATION_DAYS = 3


# ---------------------------------------------------------------------------
# In-memory notification store (swap for DB in production)
# ---------------------------------------------------------------------------
_notifications: Dict[str, List[Dict]] = {}   # user_id -> [notification, ...]
_last_seen: Dict[str, datetime] = {}          # user_id -> last login timestamp


def record_login(user_id: str):
    """Call this every time a user successfully logs in."""
    _last_seen[user_id] = datetime.now(timezone.utc)


def get_pending_notifications(user_id: str) -> List[Dict]:
    """Return unread notifications for a user and mark them read."""
    notes = _notifications.get(user_id, [])
    unread = [n for n in notes if not n.get("read")]
    for n in unread:
        n["read"] = True
    return unread


# ---------------------------------------------------------------------------
# Gemini call
# ---------------------------------------------------------------------------

async def _call_gemini(prompt: str) -> str:
    """Call Gemini Flash and return the text response."""
    if not GEMINI_API_KEY:
        return _fallback_insight(prompt)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.8, "maxOutputTokens": 300},
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                GEMINI_URL,
                params={"key": GEMINI_API_KEY},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return _fallback_insight(prompt)


def _fallback_insight(prompt: str) -> str:
    """Static fallback when Gemini is unavailable."""
    return (
        "The tech job market is moving fast — companies are actively hiring "
        "engineers with your skill set right now. Log back in to see your "
        "personalised roadmap and stay ahead of the curve."
    )


# ---------------------------------------------------------------------------
# Stagnation check + notification generation
# ---------------------------------------------------------------------------

async def check_and_notify(user_id: str, user_profile: Dict) -> Optional[Dict]:
    """
    Check if the user has been inactive for STAGNATION_DAYS.
    If so, generate a Market Insight via Gemini and store it.
    Returns the notification dict or None.
    """
    last = _last_seen.get(user_id)
    if last is None:
        return None

    days_inactive = (datetime.now(timezone.utc) - last).days
    if days_inactive < STAGNATION_DAYS:
        return None

    # Avoid spamming — only one notification per stagnation window
    existing = _notifications.get(user_id, [])
    if existing:
        latest = existing[-1]
        created = datetime.fromisoformat(latest["created_at"])
        if (datetime.now(timezone.utc) - created).days < STAGNATION_DAYS:
            return None

    role = user_profile.get("target_role", "Software Engineer")
    skills = user_profile.get("known_skills", "Python, JavaScript")
    xp = user_profile.get("xp", 0)

    prompt = (
        f"You are a career coach AI. A developer targeting the role of '{role}' "
        f"with skills in {skills} and {xp} XP has not logged into their learning "
        f"platform for {days_inactive} days. "
        f"Write a short (2-3 sentence), motivating, data-driven 'Market Insight' "
        f"notification that references a real trend in the {role} job market in 2025-2026 "
        f"and encourages them to return. Be specific, not generic. No emojis."
    )

    insight_text = await _call_gemini(prompt)

    notification = {
        "id": f"notif_{user_id}_{int(datetime.now().timestamp())}",
        "user_id": user_id,
        "type": "market_insight",
        "title": f"Market Update for {role}",
        "body": insight_text,
        "days_inactive": days_inactive,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False,
    }

    _notifications.setdefault(user_id, []).append(notification)
    logger.info(f"Shadow Mentor: notification created for user {user_id}")
    return notification


# ---------------------------------------------------------------------------
# Proactive nudge — call from a scheduled task / Celery beat
# ---------------------------------------------------------------------------

async def run_stagnation_sweep(all_users: List[Dict]):
    """
    Iterate over all users and generate notifications for stagnant ones.
    Designed to be called by a Celery beat task every 6 hours.
    """
    created = []
    for user in all_users:
        uid = str(user.get("id", ""))
        if not uid:
            continue
        note = await check_and_notify(uid, user)
        if note:
            created.append(note)
    logger.info(f"Shadow Mentor sweep: {len(created)} notifications created")
    return created
