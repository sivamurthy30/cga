"""
Authentication Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.db import get_db
from app.models.auth import OTPSendRequest, OTPVerifyRequest, OTPLoginRequest, Token
from app.models.user import UserResponse
from app.services.auth_service import AuthService
from app.utils.security import create_access_token, create_refresh_token


router = APIRouter()


@router.post("/send-otp-signup", status_code=status.HTTP_200_OK)
async def send_otp_signup(request: OTPSendRequest, db: Session = Depends(get_db)):
    """Send OTP for signup"""
    auth_service = AuthService(db)
    result = await auth_service.send_otp_signup(
        email=request.email,
        name=request.name,
        phone=request.phone,
        password=request.password
    )
    return result


@router.post("/send-otp-login", status_code=status.HTTP_200_OK)
async def send_otp_login(request: OTPLoginRequest, db: Session = Depends(get_db)):
    """Send OTP for login"""
    auth_service = AuthService(db)
    result = await auth_service.send_otp_login(email=request.email)
    return result


@router.post("/verify-otp-signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def verify_otp_signup(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and create account"""
    auth_service = AuthService(db)
    user = await auth_service.verify_otp_signup(email=request.email, otp=request.otp)
    
    # Create tokens
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"user_id": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        },
        "message": "Account created successfully"
    }


@router.post("/verify-otp-login", response_model=dict, status_code=status.HTTP_200_OK)
async def verify_otp_login(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and login"""
    auth_service = AuthService(db)
    user = await auth_service.verify_otp_login(email=request.email, otp=request.otp)
    
    # Create tokens
    access_token = create_access_token(data={"user_id": user.id, "email": user.email})
    refresh_token = create_refresh_token(data={"user_id": user.id, "email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "target_role": user.target_role,
            "onboarding_complete": user.onboarding_complete
        },
        "message": "Login successful"
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    from app.utils.security import decode_token
    
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("user_id")
    email = payload.get("email")
    
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Create new access token
    new_access_token = create_access_token(data={"user_id": user_id, "email": email})
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
