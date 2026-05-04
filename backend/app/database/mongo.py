"""
MongoDB connection using Motor (async driver).
Non-blocking startup — the app starts immediately and MongoDB connects in the background.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient = None
_mongo_ready: bool = False   # True once ping succeeds


def get_mongo_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsInsecure=True,
            # Short timeouts — fail fast, don't block the app
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
        )
    return _client


def get_db():
    return get_mongo_client()[settings.MONGODB_DB_NAME]


def users_col():
    return get_db()["users"]


def is_mongo_ready() -> bool:
    return _mongo_ready


async def _connect_background():
    """
    Runs in the background after startup.
    Retries every 10 s so the app recovers automatically if Atlas comes back.
    """
    global _mongo_ready
    attempt = 0
    while True:
        attempt += 1
        try:
            await get_mongo_client().admin.command("ping")
            await get_db()["users"].create_index("email", unique=True)
            _mongo_ready = True
            logger.info(f"✅ MongoDB connected (attempt {attempt})")
            return  # success — stop retrying
        except Exception as e:
            _mongo_ready = False
            short = str(e)[:120]
            logger.warning(f"⚠️  MongoDB not reachable (attempt {attempt}): {short}")
            logger.warning("    Retrying in 10 s — app is fully functional without it")
            await asyncio.sleep(10)


async def init_mongo():
    """
    Called at startup. Schedules the connection attempt as a background task
    so the app starts instantly regardless of MongoDB availability.
    """
    asyncio.create_task(_connect_background())
    logger.info("🔄 MongoDB connecting in background — startup not blocked")


async def close_mongo():
    global _client, _mongo_ready
    if _client:
        _client.close()
        _client = None
    _mongo_ready = False
