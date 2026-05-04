"""
SQLAlchemy Database Models
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.database.db import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(15), nullable=True)
    
    # Profile
    target_role = Column(String(100), nullable=True)
    learning_speed = Column(String(20), default="medium")
    onboarding_complete = Column(Boolean, default=False)
    is_pro = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan")
    roadmap_progress = relationship("RoadmapProgress", back_populates="user", cascade="all, delete-orphan")
    otp_records = relationship("OTPRecord", back_populates="user", cascade="all, delete-orphan")


class UserSkill(Base):
    """User skills"""
    __tablename__ = "user_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill = Column(String(100), nullable=False)
    proficiency = Column(String(20), default="beginner")  # beginner, intermediate, advanced, expert
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="skills")


class QuizResult(Base):
    """Quiz/Assessment results"""
    __tablename__ = "quiz_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_type = Column(String(50), nullable=False)  # skill_assessment, etc.
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    category = Column(String(100), nullable=True)
    results_data = Column(JSON, nullable=True)  # Detailed results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="quizzes")


class RoadmapProgress(Base):
    """Roadmap node completion tracking"""
    __tablename__ = "roadmap_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(String(100), nullable=False)
    node_id = Column(String(100), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    xp_earned = Column(Integer, default=0)
    
    user = relationship("User", back_populates="roadmap_progress")


class OTPRecord(Base):
    """OTP records for authentication"""
    __tablename__ = "otp_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for signup
    email = Column(String(255), nullable=False, index=True)
    otp = Column(String(6), nullable=False)
    otp_type = Column(String(20), nullable=False)  # signup, login, reset
    verified = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Temporary signup data
    temp_name = Column(String(100), nullable=True)
    temp_phone = Column(String(15), nullable=True)
    temp_password_hash = Column(String(255), nullable=True)
    
    user = relationship("User", back_populates="otp_records")


class UserStats(Base):
    """User statistics and gamification"""
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    badges = Column(JSON, default=list)  # List of badge IDs
    last_completed_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
