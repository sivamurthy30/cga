"""
Assembled knowledge base — all chunks combined
"""
from app.ai.kb_career import CAREER_CHUNKS
from app.ai.kb_coding import CODING_CHUNKS
from app.ai.kb_jobs import JOBS_CHUNKS

KNOWLEDGE_BASE = CAREER_CHUNKS + CODING_CHUNKS + JOBS_CHUNKS
