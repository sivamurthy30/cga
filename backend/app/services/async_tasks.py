"""
System 4: Asynchronous Analytics — Celery + Redis
- Resume and GitHub uploads are processed in the background
- Results streamed to the frontend via WebSocket
- UI is never blocked
"""

from __future__ import annotations
import os
import json
import asyncio
import logging
from typing import Any, Dict

from celery import Celery

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ---------------------------------------------------------------------------
# Celery app
# ---------------------------------------------------------------------------
celery_app = Celery(
    "deva_tasks",
    broker=os.getenv("CELERY_BROKER_URL", REDIS_URL),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1"),
)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Beat schedule: stagnation sweep every 6 hours
    beat_schedule={
        "shadow-mentor-sweep": {
            "task": "app.services.async_tasks.shadow_mentor_sweep_task",
            "schedule": 6 * 3600,
        }
    },
)


# ---------------------------------------------------------------------------
# WebSocket connection manager (FastAPI)
# ---------------------------------------------------------------------------
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # task_id -> WebSocket
        self._connections: Dict[str, WebSocket] = {}

    async def connect(self, task_id: str, ws: WebSocket):
        await ws.accept()
        self._connections[task_id] = ws

    def disconnect(self, task_id: str):
        self._connections.pop(task_id, None)

    async def send(self, task_id: str, data: Dict):
        ws = self._connections.get(task_id)
        if ws:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                self.disconnect(task_id)


ws_manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Helper: push progress update to WebSocket from sync Celery task
# ---------------------------------------------------------------------------
def _push(task_id: str, event: str, payload: Dict):
    """
    Fire-and-forget WebSocket push from inside a Celery worker.
    Uses a fresh event loop since Celery workers are synchronous.
    """
    async def _send():
        await ws_manager.send(task_id, {"event": event, **payload})

    try:
        loop = asyncio.new_event_loop()
        loop.run_until_complete(_send())
        loop.close()
    except Exception as e:
        logger.debug(f"WS push skipped ({e})")


# ---------------------------------------------------------------------------
# Task 1: Resume processing
# ---------------------------------------------------------------------------
@celery_app.task(bind=True, name="app.services.async_tasks.process_resume")
def process_resume_task(self, task_id: str, file_bytes_hex: str, filename: str):
    """
    Parse resume in background.
    Streams progress events: started → parsing → skills_extracted → done
    """
    _push(task_id, "started", {"message": "Resume processing started"})

    try:
        file_bytes = bytes.fromhex(file_bytes_hex)

        _push(task_id, "progress", {"step": "parsing", "pct": 20,
                                     "message": "Extracting text from document…"})

        # Import here to avoid circular imports at module load
        from app.utils.simple_resume_parser import parse_resume
        result = parse_resume(file_bytes, filename)

        _push(task_id, "progress", {"step": "skills_extracted", "pct": 70,
                                     "message": f"Found {result['total_skills']} skills"})

        _push(task_id, "progress", {"step": "role_suggestion", "pct": 90,
                                     "message": "Generating role suggestion…"})

        _push(task_id, "done", {
            "skills_found": result["skills_found"],
            "total_skills": result["total_skills"],
            "suggested_role": result["suggested_role"],
            "confidence": result["confidence"],
            "experience_years": result["experience_years"],
            "projects": result["projects"],
        })
        return result

    except Exception as e:
        logger.error(f"Resume task failed: {e}")
        _push(task_id, "error", {"message": str(e)})
        raise


# ---------------------------------------------------------------------------
# Task 2: GitHub analysis
# ---------------------------------------------------------------------------
@celery_app.task(bind=True, name="app.services.async_tasks.process_github")
def process_github_task(self, task_id: str, github_username: str):
    """
    Analyse GitHub profile in background.
    Streams: started → fetching → analysing → done
    """
    _push(task_id, "started", {"message": f"Fetching GitHub profile for @{github_username}…"})

    try:
        import requests

        headers = {}
        token = os.getenv("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"token {token}"

        _push(task_id, "progress", {"step": "fetching", "pct": 20,
                                     "message": "Fetching repositories…"})

        # Fetch repos
        resp = requests.get(
            f"https://api.github.com/users/{github_username}/repos",
            headers=headers, params={"per_page": 50}, timeout=10
        )
        resp.raise_for_status()
        repos = resp.json()

        _push(task_id, "progress", {"step": "analysing", "pct": 60,
                                     "message": f"Analysing {len(repos)} repositories…"})

        # Language frequency
        lang_counts: Dict[str, int] = {}
        for repo in repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1

        # Commits in last 30 days (velocity)
        events_resp = requests.get(
            f"https://api.github.com/users/{github_username}/events/public",
            headers=headers, params={"per_page": 100}, timeout=10
        )
        push_events = [e for e in events_resp.json() if e.get("type") == "PushEvent"]
        commits_30d = sum(
            len(e.get("payload", {}).get("commits", []))
            for e in push_events
        )
        velocity = round(commits_30d / 4.3, 1)  # per week

        # Map languages to skills
        lang_to_skill = {
            "Python": "Python", "JavaScript": "JavaScript", "TypeScript": "TypeScript",
            "Java": "Java", "Go": "Go", "Rust": "Rust", "C++": "C++",
            "Kotlin": "Kotlin", "Swift": "Swift", "Ruby": "Ruby",
            "PHP": "PHP", "Dart": "Flutter",
        }
        skills_found = [lang_to_skill[l] for l in lang_counts if l in lang_to_skill]

        _push(task_id, "done", {
            "skills_found": skills_found,
            "total_skills": len(skills_found),
            "language_breakdown": lang_counts,
            "github_velocity": velocity,
            "total_repos": len(repos),
            "activity_score": min(velocity / 10, 1.0),
        })

        return {
            "skills_found": skills_found,
            "github_velocity": velocity,
            "language_breakdown": lang_counts,
        }

    except Exception as e:
        logger.error(f"GitHub task failed: {e}")
        _push(task_id, "error", {"message": str(e)})
        raise


# ---------------------------------------------------------------------------
# Task 3: Shadow Mentor sweep (Celery Beat)
# ---------------------------------------------------------------------------
@celery_app.task(name="app.services.async_tasks.shadow_mentor_sweep_task")
def shadow_mentor_sweep_task():
    """
    Periodic task: check all users for stagnation and generate notifications.
    Runs every 6 hours via Celery Beat.
    """
    import asyncio
    from app.services.shadow_mentor import run_stagnation_sweep, _last_seen

    # Build minimal user list from in-memory store
    users = [{"id": uid} for uid in _last_seen]
    if not users:
        return {"notified": 0}

    loop = asyncio.new_event_loop()
    created = loop.run_until_complete(run_stagnation_sweep(users))
    loop.close()
    return {"notified": len(created)}
