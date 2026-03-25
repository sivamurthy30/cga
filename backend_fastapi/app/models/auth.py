"""
Authentication Pydantic Models
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class OTPSendRequest(BaseModel):
    """OTP send request for signup"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6, max_length=100)


class OTPVerifyRequest(BaseModel):
    """OTP verification request"""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class OTPLoginRequest(BaseModel):
    """OTP login request"""
    email: EmailStr


class Token(BaseModel):
    """JWT Token"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[int] = None
    email: Optional[str] = None
