from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    target_role: Optional[str] = None
    onboarding_complete: int = 0

    class Config:
        from_attributes = True

class Token(BaseModel):
    token: str
    user: UserResponse
    message: str
