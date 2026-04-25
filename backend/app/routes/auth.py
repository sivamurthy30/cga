from fastapi import APIRouter, HTTPException, Depends
from app.models.auth import UserCreate, Token, LoginRequest
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.database.db import db
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from fastapi import Request

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.get_learner(int(user_id))
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/signup", response_model=Token)
async def signup(user_in: UserCreate):
    if len(user_in.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing_user = db.get_learner_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    learner_id = db.create_learner(
        email=user_in.email,
        name=user_in.name,
        target_role='',
        learning_speed='medium'
    )
    
    db.update_learner(learner_id, password_hash=get_password_hash(user_in.password))
    
    token = create_access_token(subject=learner_id)
    
    return {
        "token": token,
        "user": {
            "id": learner_id,
            "email": user_in.email,
            "name": user_in.name,
            "target_role": "",
            "onboarding_complete": 0
        },
        "message": "Account created successfully"
    }

@router.post("/login", response_model=Token)
async def login(login_req: LoginRequest):
    user = db.get_learner_by_email(login_req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    stored_hash = user.get("password_hash", "")
    if not verify_password(login_req.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Transparent migration: upgrade legacy SHA-256 hash to bcrypt on successful login.
    if len(stored_hash or "") == 64:
        db.update_learner(user["id"], password_hash=get_password_hash(login_req.password))
        
    token = create_access_token(subject=user["id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "target_role": user.get("target_role"),
            "onboarding_complete": user.get("onboarding_complete", 0),
            "is_pro": bool(user.get("is_pro", 0)),
        },
        "message": "Login successful"
    }

@router.get("/verify")
async def verify(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "target_role": current_user.get("target_role"),
            "onboarding_complete": current_user.get("onboarding_complete", 0)
        }
    }


@router.post("/logout")
async def logout():
    # JWT auth is stateless for now; frontend can clear token locally.
    return {"message": "Logged out successfully"}


# ─── DEV-ONLY: Test Pro User ──────────────────────────────────────────────────
# Credentials: pro@deva.dev / DevaPro123!
# This endpoint is safe to call multiple times (idempotent).
DEV_PRO_EMAIL    = "pro@deva.dev"
DEV_PRO_PASSWORD = "DevaPro123!"
DEV_PRO_NAME     = "Pro Tester"

@router.post("/dev/seed-pro-user")
async def seed_pro_user():
    """
    Creates (or resets) a fully-onboarded Pro test account.
    Only intended for development / demo use.
    """
    from app.utils.security import get_password_hash

    existing = db.get_learner_by_email(DEV_PRO_EMAIL)
    if existing:
        user_id = existing["id"]
    else:
        user_id = db.create_learner(
            email=DEV_PRO_EMAIL,
            name=DEV_PRO_NAME,
            target_role="Full Stack Developer",
            learning_speed="fast",
        )

    db.update_learner(
        user_id,
        password_hash=get_password_hash(DEV_PRO_PASSWORD),
        onboarding_complete=1,
        is_pro=1,
        target_role="Full Stack Developer",
        learning_speed="fast",
    )

    # Ensure some skills exist
    db.add_skills_batch(user_id, [
        "JavaScript", "React", "Node.js", "Python", "SQL",
        "Docker", "TypeScript", "AWS", "Machine Learning",
    ])

    token = create_access_token(subject=user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": DEV_PRO_EMAIL,
            "name": DEV_PRO_NAME,
            "target_role": "Full Stack Developer",
            "onboarding_complete": 1,
            "is_pro": True,
        },
        "message": "Dev pro user ready",
        "credentials": {"email": DEV_PRO_EMAIL, "password": DEV_PRO_PASSWORD},
    }
