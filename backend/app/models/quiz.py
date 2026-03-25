from pydantic import BaseModel, Field
from typing import List, Literal


Difficulty = Literal["easy", "medium", "hard"]


class QuizGenerateRequest(BaseModel):
    skill: str = Field(min_length=1, max_length=100)
    count: int = Field(default=4, ge=1, le=10)


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int
    difficulty: Difficulty
    explanation: str


class QuizGenerateResponse(BaseModel):
    skill: str
    questions: List[QuizQuestion]
