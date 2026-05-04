"""
Application Configuration
Uses Pydantic Settings for environment variable management
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # App Info
    APP_NAME: str = "DEVA Career Guidance API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Database (SQLite legacy — kept for fallback)
    DATABASE_URL: str = "sqlite:///./data/career_guidance.db"

    # MongoDB Atlas
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "deva_career"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 16 * 1024 * 1024  # 16MB
    UPLOAD_DIR: str = "./data/uploads"
    
    # Email (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@deva.ai"
    
    # SMS (Optional - Fast2SMS)
    FAST2SMS_API_KEY: str = ""
    
    # ML Models
    ML_MODEL_PATH: str = "./ml_models"
    
    model_config = {
        "env_file": [".env", "../.env"],
        "case_sensitive": True,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Get settings instance — no cache so .env changes are picked up on reload"""
    return Settings()


# Create settings instance
settings = get_settings()
