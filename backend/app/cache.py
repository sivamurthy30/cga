"""
Cache layer — tries Redis first, falls back to in-process TTL dict.
Usage:
    from app.cache import cache
    await cache.get("key")
    await cache.set("key", value, ttl=300)
    await cache.delete("key")
"""
import time, json, asyncio
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)

# ── In-process fallback ───────────────────────────────────────────────────────
class _MemCache:
    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}  # key → (value, expires_at)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            value, exp = entry
            if exp and time.time() > exp:
                del self._store[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        async with self._lock:
            self._store[key] = (value, time.time() + ttl if ttl else 0)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._store.pop(key, None)

    async def clear_pattern(self, prefix: str) -> None:
        async with self._lock:
            keys = [k for k in self._store if k.startswith(prefix)]
            for k in keys:
                del self._store[k]

# ── Redis wrapper ─────────────────────────────────────────────────────────────
class _RedisCache:
    def __init__(self, url: str):
        self._url = url
        self._client = None

    async def _connect(self):
        if self._client is None:
            try:
                import redis.asyncio as aioredis
                self._client = aioredis.from_url(self._url, decode_responses=True)
                await self._client.ping()
                logger.info("✅ Redis connected")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}), using in-memory cache")
                self._client = None
        return self._client

    async def get(self, key: str) -> Optional[Any]:
        r = await self._connect()
        if not r:
            return None
        try:
            raw = await r.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        r = await self._connect()
        if not r:
            return
        try:
            await r.setex(key, ttl, json.dumps(value))
        except Exception:
            pass

    async def delete(self, key: str) -> None:
        r = await self._connect()
        if r:
            try:
                await r.delete(key)
            except Exception:
                pass

    async def clear_pattern(self, prefix: str) -> None:
        r = await self._connect()
        if r:
            try:
                keys = await r.keys(f"{prefix}*")
                if keys:
                    await r.delete(*keys)
            except Exception:
                pass

# ── Unified cache instance ────────────────────────────────────────────────────
_mem = _MemCache()

def _make_cache():
    try:
        from app.config import settings
        if settings.REDIS_ENABLED and settings.REDIS_URL:
            return _RedisCache(settings.REDIS_URL)
    except Exception:
        pass
    return _mem

cache = _make_cache()

# ── Decorator ─────────────────────────────────────────────────────────────────
def cached(key_fn, ttl: int = 300):
    """Async cache decorator. key_fn(*args, **kwargs) → cache key string."""
    def decorator(fn):
        async def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            hit = await cache.get(key)
            if hit is not None:
                return hit
            result = await fn(*args, **kwargs)
            await cache.set(key, result, ttl=ttl)
            return result
        return wrapper
    return decorator
