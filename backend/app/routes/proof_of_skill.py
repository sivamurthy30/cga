"""
Proof of Skill — Cryptographic hash generation upon quiz completion.
Prevents cheating by signing the result server-side with HMAC-SHA256.
"""
import hashlib
import hmac
import json
import time
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

_SECRET = os.getenv("SECRET_KEY", "deva-proof-secret-2026").encode()


class ProofRequest(BaseModel):
    user_id: str
    skill: str
    score: int          # 0-100
    total_questions: int
    correct_answers: int
    time_taken_ms: int  # total quiz time in ms
    difficulty_path: list[str]  # e.g. ["medium","medium","hard","hard"]


class ProofResponse(BaseModel):
    proof_hash: str
    issued_at: int
    payload: Dict[str, Any]


@router.post("/generate", response_model=ProofResponse)
async def generate_proof(req: ProofRequest):
    if req.total_questions == 0:
        raise HTTPException(status_code=400, detail="total_questions must be > 0")

    issued_at = int(time.time())
    payload = {
        "user_id": req.user_id,
        "skill": req.skill,
        "score": req.score,
        "total_questions": req.total_questions,
        "correct_answers": req.correct_answers,
        "time_taken_ms": req.time_taken_ms,
        "difficulty_path": req.difficulty_path,
        "issued_at": issued_at,
    }
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    proof_hash = hmac.new(_SECRET, canonical.encode(), hashlib.sha256).hexdigest()

    return ProofResponse(proof_hash=proof_hash, issued_at=issued_at, payload=payload)


@router.post("/verify")
async def verify_proof(proof_hash: str, payload: Dict[str, Any]):
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    expected = hmac.new(_SECRET, canonical.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(proof_hash, expected):
        raise HTTPException(status_code=400, detail="Invalid proof hash")
    return {"valid": True, "payload": payload}
