"""
Ghost-Hunter Code Reviewer
Performs Security & Efficiency audit on user-submitted code via Gemini.
"""
import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"
    challenge_title: Optional[str] = None
    expected_complexity: Optional[str] = None  # e.g. "O(n)"


class ReviewIssue(BaseModel):
    type: str        # "security" | "efficiency" | "style"
    severity: str    # "critical" | "warning" | "info"
    line_hint: Optional[str]
    message: str
    suggestion: str


class CodeReviewResponse(BaseModel):
    overall_score: int   # 0-100
    complexity: str
    issues: list[ReviewIssue]
    refactored_snippet: Optional[str]
    summary: str


_FALLBACK = CodeReviewResponse(
    overall_score=70,
    complexity="O(n)",
    issues=[
        ReviewIssue(
            type="efficiency",
            severity="warning",
            line_hint=None,
            message="Could not reach AI reviewer — showing generic feedback.",
            suggestion="Ensure no nested loops iterate over the same data structure.",
        )
    ],
    refactored_snippet=None,
    summary="AI review unavailable. Check your code manually for nested loops and SQL injection risks.",
)


async def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return ""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload
        )
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


@router.post("/review", response_model=CodeReviewResponse)
async def review_code(req: CodeReviewRequest):
    if len(req.code) > 8000:
        raise HTTPException(status_code=400, detail="Code too long (max 8000 chars)")

    prompt = f"""You are a senior code reviewer. Analyze this {req.language} code for:
1. Time/space complexity (Big-O)
2. Security vulnerabilities (injection, XSS, hardcoded secrets, etc.)
3. Efficiency issues (nested loops, redundant operations)
4. Style issues

Code:
```{req.language}
{req.code}
```
{"Challenge: " + req.challenge_title if req.challenge_title else ""}
{"Expected complexity: " + req.expected_complexity if req.expected_complexity else ""}

Respond ONLY with valid JSON matching this schema:
{{
  "overall_score": <0-100>,
  "complexity": "<Big-O string>",
  "issues": [
    {{"type": "security|efficiency|style", "severity": "critical|warning|info",
      "line_hint": "<optional line reference>", "message": "<what's wrong>",
      "suggestion": "<how to fix>"}}
  ],
  "refactored_snippet": "<optional improved code snippet or null>",
  "summary": "<2-sentence overall assessment>"
}}"""

    try:
        raw = await _call_gemini(prompt)
        # Strip markdown fences if present
        raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        data = json.loads(raw)
        return CodeReviewResponse(**data)
    except Exception:
        return _FALLBACK
