"""
Event-Driven Architecture — lightweight in-process event bus.

Usage:
    from app.events import emit, on

    @on("USER_LOGGED_IN")
    async def handle_login(payload):
        logger.info(f"User logged in: {payload['user_id']}")

    await emit("USER_LOGGED_IN", {"user_id": "123"})
"""
import asyncio
import logging
from collections import defaultdict
from typing import Callable, Any

logger = logging.getLogger(__name__)

_handlers: dict[str, list[Callable]] = defaultdict(list)


def on(event: str):
    """Decorator to register an event handler."""
    def decorator(fn: Callable):
        _handlers[event].append(fn)
        return fn
    return decorator


async def emit(event: str, payload: dict = None):
    """Fire an event. All handlers run concurrently."""
    payload = payload or {}
    handlers = _handlers.get(event, [])
    if not handlers:
        return
    logger.debug(f"[EVENT] {event} → {len(handlers)} handler(s) | payload={payload}")
    await asyncio.gather(*[h(payload) for h in handlers], return_exceptions=True)


# ── Built-in event handlers ───────────────────────────────────────────────────

@on("USER_LOGGED_IN")
async def _on_login(payload):
    logger.info(f"[AUTH] User logged in: {payload.get('email')} (id={payload.get('user_id')})")


@on("ONBOARDING_COMPLETED")
async def _on_onboarding(payload):
    logger.info(f"[ONBOARDING] Completed for user {payload.get('user_id')} → role={payload.get('target_role')}")


@on("ASSESSMENT_COMPLETED")
async def _on_assessment(payload):
    uid   = payload.get('user_id')
    score = payload.get('avg_score', 0)
    logger.info(f"[ASSESSMENT] User {uid} completed assessment. Avg score: {score}%")


@on("ROADMAP_NODE_COMPLETED")
async def _on_node_complete(payload):
    logger.info(f"[ROADMAP] User {payload.get('user_id')} completed node '{payload.get('node_id')}' (+{payload.get('xp', 10)} XP)")


@on("RECOMMENDATION_GENERATED")
async def _on_recommendation(payload):
    logger.info(f"[RECOMMEND] User {payload.get('user_id')} → skill='{payload.get('skill')}' confidence={payload.get('confidence')}")
