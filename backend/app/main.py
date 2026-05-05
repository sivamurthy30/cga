"""
FastAPI Main Application — Production-grade with Observability, Events, Feature Flags
"""

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database.mongo import init_mongo, close_mongo
from app.routes import auth, user, ml, features, chat
from app.routes import payment as payment_routes
from app.observability import ObservabilityMiddleware, get_metrics
from app.feature_flags import flags
from app.events import emit
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s — %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 DEVA Backend starting")
    logger.info(f"📝 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🚩 Feature flags: {flags.get_all()}")
    try:
        await init_mongo()
        logger.info("🔄 MongoDB background connection scheduled")
    except Exception as e:
        logger.error(f"❌ MongoDB init error: {e}")
    yield
    await close_mongo()
    logger.info("👋 Shutdown complete")


app = FastAPI(
    title="DEVA Career Guidance API",
    description="AI-powered career guidance platform with intelligent recommendations",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ── Middleware stack ───────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Observability FIRST — wraps everything
app.add_middleware(ObservabilityMiddleware)

# In production allow all origins (Vercel URL is set via CORS_ORIGINS env var)
# In development restrict to localhost
cors_origins = settings.CORS_ORIGINS
if settings.ENVIRONMENT == "production":
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False if settings.ENVIRONMENT == "production" else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})

# ── System endpoints ──────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "version": "2.0.0", "environment": settings.ENVIRONMENT}


@app.get("/metrics", tags=["System"])
async def metrics():
    """Observability metrics — request counts, latency, error rate."""
    return get_metrics()


@app.get("/flags", tags=["System"])
async def feature_flags():
    """Current feature flag state."""
    return flags.get_all()


@app.get("/", tags=["System"])
async def root():
    return {"message": "DEVA Career Guidance API", "version": "2.0.0", "docs": "/docs"}

# ── Routers — v1 (canonical) + legacy /api/* aliases ─────────────────────────
for prefix, tag_suffix in [("/api/v1", ""), ("/api", "-legacy")]:
    schema = tag_suffix == ""
    app.include_router(auth.router,            prefix=f"{prefix}/auth",    tags=[f"Auth{tag_suffix}"],    include_in_schema=schema)
    app.include_router(user.router,            prefix=f"{prefix}/user",    tags=[f"User{tag_suffix}"],    include_in_schema=schema)
    app.include_router(ml.router,              prefix=f"{prefix}",         tags=[f"ML{tag_suffix}"],      include_in_schema=schema)
    app.include_router(features.router,        prefix=f"{prefix}",         tags=[f"Features{tag_suffix}"],include_in_schema=schema)
    app.include_router(chat.router,            prefix=f"{prefix}",         tags=[f"Chat{tag_suffix}"],    include_in_schema=schema)
    app.include_router(payment_routes.router,  prefix=f"{prefix}/payment", tags=[f"Payment{tag_suffix}"], include_in_schema=schema)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
