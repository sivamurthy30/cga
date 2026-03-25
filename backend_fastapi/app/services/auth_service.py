"""
Authentication Service
Business logic for auth operations
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import Optional

from app.database.models import User, OTPRecord
from app.utils.security import hash_password, verify_password, generate_otp
from app.utils.email_service import send_otp_email


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    async def send_otp_signup(self, email: str, name: str, phone: str, password: str) -> dict:
        """Send OTP for signup"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate OTP
        otp = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Hash password
        password_hash = hash_password(password)
        
        # Delete old OTP records for this email
        self.db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp_type == "signup"
        ).delete()
        
        # Create OTP record
        otp_record = OTPRecord(
            email=email,
            otp=otp,
            otp_type="signup",
            expires_at=expires_at,
            temp_name=name,
            temp_phone=phone,
            temp_password_hash=password_hash
        )
        self.db.add(otp_record)
        self.db.commit()
        
        # Send OTP via email
        await send_otp_email(email, otp, name)
        
        return {"message": "OTP sent to email", "email": email}
    
    async def verify_otp_signup(self, email: str, otp: str) -> User:
        """Verify OTP and create user account"""
        # Find OTP record
        otp_record = self.db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp == otp,
            OTPRecord.otp_type == "signup",
            OTPRecord.verified == False
        ).first()
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
        
        # Check expiry
        if datetime.utcnow() > otp_record.expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired"
            )
        
        # Create user
        user = User(
            email=email,
            name=otp_record.temp_name,
            phone=otp_record.temp_phone,
            password_hash=otp_record.temp_password_hash,
            last_login=datetime.utcnow()
        )
        self.db.add(user)
        
        # Mark OTP as verified
        otp_record.verified = True
        otp_record.user_id = user.id
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    async def send_otp_login(self, email: str) -> dict:
        """Send OTP for login"""
        # Check if user exists
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate OTP
        otp = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Delete old OTP records
        self.db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp_type == "login"
        ).delete()
        
        # Create OTP record
        otp_record = OTPRecord(
            user_id=user.id,
            email=email,
            otp=otp,
            otp_type="login",
            expires_at=expires_at
        )
        self.db.add(otp_record)
        self.db.commit()
        
        # Send OTP via email
        await send_otp_email(email, otp, user.name)
        
        return {"message": "OTP sent to email", "email": email}
    
    async def verify_otp_login(self, email: str, otp: str) -> User:
        """Verify OTP and login"""
        # Find OTP record
        otp_record = self.db.query(OTPRecord).filter(
            OTPRecord.email == email,
            OTPRecord.otp == otp,
            OTPRecord.otp_type == "login",
            OTPRecord.verified == False
        ).first()
        
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
        
        # Check expiry
        if datetime.utcnow() > otp_record.expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired"
            )
        
        # Get user
        user = self.db.query(User).filter(User.id == otp_record.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        
        # Mark OTP as verified
        otp_record.verified = True
        
        self.db.commit()
        self.db.refresh(user)
        
        return user
