"""
Email Service
Send emails for OTP, notifications, etc.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def send_otp_email(email: str, otp: str, name: str) -> bool:
    """
    Send OTP via email
    In production, integrate with SendGrid, AWS SES, or similar
    """
    try:
        # For development, just log the OTP
        logger.info(f"📧 OTP Email for {email} ({name}): {otp}")
        logger.info(f"   OTP Code: {otp}")
        logger.info(f"   Valid for: 10 minutes")
        
        # In production, use actual email service:
        # from app.config import settings
        # import smtplib
        # from email.mime.text import MIMEText
        # 
        # msg = MIMEText(f"Your OTP is: {otp}")
        # msg['Subject'] = 'DEVA - Your OTP Code'
        # msg['From'] = settings.EMAILS_FROM_EMAIL
        # msg['To'] = email
        # 
        # with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        #     server.starttls()
        #     server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        #     server.send_message(msg)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
        return False


async def send_welcome_email(email: str, name: str) -> bool:
    """Send welcome email to new users"""
    try:
        logger.info(f"📧 Welcome Email sent to {email} ({name})")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        return False


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    """Send password reset email"""
    try:
        logger.info(f"📧 Password Reset Email sent to {email}")
        logger.info(f"   Reset Token: {reset_token}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        return False
