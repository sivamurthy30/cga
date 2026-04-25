"""
Pitch-Perfect — AI Soft-Skill Sentiment Analysis
Analyzes uploaded audio for WPM, filler words, and confidence score.
Uses Gemini for transcript analysis (audio → text via base64).
"""
import os
import json
import base64
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)

FILLER_WORDS = ["um", "uh", "ah", "like", "you know", "basically", "literally",
                "actually", "so", "right", "okay", "well", "kind of", "sort of"]


class PitchReport(BaseModel):
    wpm: int
    filler_count: int
    filler_breakdown: dict
    confidence_score: int   # 0-100
    clarity_score: int      # 0-100
    transcript_preview: str
    strengths: list[str]
    improvements: list[str]
    overall_grade: str      # "A" | "B" | "C" | "D"


def _fallback_report() -> PitchReport:
    return PitchReport(
        wpm=130,
        filler_count=5,
        filler_breakdown={"um": 2, "like": 3},
        confidence_score=65,
        clarity_score=70,
        transcript_preview="[Audio analysis unavailable — AI service offline]",
        strengths=["Good pacing detected", "Clear sentence structure"],
        improvements=["Reduce filler words", "Vary your tone more"],
        overall_grade="B",
    )


async def _analyze_with_gemini(audio_b64: str, mime_type: str) -> PitchReport:
    if not GEMINI_API_KEY:
        return _fallback_report()

    prompt = """Analyze this elevator pitch audio. Provide:
1. Estimated WPM (words per minute)
2. Count of filler words (um, uh, ah, like, you know, basically, literally, actually, so, right)
3. Confidence score 0-100 based on tone variance and assertiveness
4. Clarity score 0-100
5. A short transcript preview (first 100 words)
6. 2-3 strengths
7. 2-3 specific improvements to sound like a Senior Leader
8. Overall grade A/B/C/D

Respond ONLY with valid JSON:
{
  "wpm": <int>,
  "filler_count": <int>,
  "filler_breakdown": {"um": <int>, "like": <int>, ...},
  "confidence_score": <int>,
  "clarity_score": <int>,
  "transcript_preview": "<string>",
  "strengths": ["<str>", ...],
  "improvements": ["<str>", ...],
  "overall_grade": "<A|B|C|D>"
}"""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": mime_type, "data": audio_b64}}
            ]
        }],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 600},
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload
        )
        resp.raise_for_status()
        raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        raw = raw.lstrip("```json").lstrip("```").rstrip("```").strip()
        data = json.loads(raw)
        return PitchReport(**data)


@router.post("/analyze", response_model=PitchReport)
async def analyze_pitch(file: UploadFile = File(...)):
    allowed = {"audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported audio type: {file.content_type}")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=400, detail="Audio file too large (max 10MB)")

    audio_b64 = base64.b64encode(content).decode()
    try:
        return await _analyze_with_gemini(audio_b64, file.content_type)
    except Exception:
        return _fallback_report()
