import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, user, quiz, roadmap, ai, legacy_routes, linucb
from app.config import settings
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="DEVA - AI-Powered Career Guidance with LinUCB Reinforcement Learning"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(f"Method: {request.method} Path: {request.url.path} Time: {process_time:.4f}s Status: {response.status_code}")
    return response

# Expose API paths matching simple_app.py exactly to be drop-in compatible
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(linucb.router, prefix="/api/linucb", tags=["linucb", "reinforcement-learning"])
app.include_router(ai.router, tags=["ai"])
app.include_router(legacy_routes.router, tags=["legacy"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "mode": "fastapi",
        "features": {
            "linucb": "enabled",
            "reinforcement_learning": "active"
        }
    }
