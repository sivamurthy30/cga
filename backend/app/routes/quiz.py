import random
import re
from fastapi import APIRouter, HTTPException
from app.models.quiz import QuizGenerateRequest, QuizGenerateResponse

router = APIRouter()


QUESTION_BANK = {
    "python": [
        {
            "question": "What is the average time complexity of dict.get() in Python?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correct": 0,
            "difficulty": "medium",
            "explanation": "Python dictionaries are hash maps with O(1) average lookup time."
        },
        {
            "question": "Which statement about Python's GIL is correct?",
            "options": [
                "It allows multiple native threads to execute Python bytecode in parallel",
                "It prevents multiple native threads from executing Python bytecode simultaneously",
                "It only affects multiprocessing",
                "It disables async/await"
            ],
            "correct": 1,
            "difficulty": "hard",
            "explanation": "The GIL serializes Python bytecode execution in CPython threads."
        },
        {
            "question": "What is the output type of list(range(3))?",
            "options": ["set", "tuple", "list", "generator"],
            "correct": 2,
            "difficulty": "easy",
            "explanation": "range() converted using list() returns a list."
        },
        {
            "question": "Which data structure preserves insertion order in modern Python dict?",
            "options": ["dict", "set", "frozenset", "heapq"],
            "correct": 0,
            "difficulty": "medium",
            "explanation": "Python dict preserves insertion order since Python 3.7 language guarantee."
        },
    ],
    "javascript": [
        {
            "question": "What is the result of 0.1 + 0.2 === 0.3 in JavaScript?",
            "options": ["true", "false", "null", "TypeError"],
            "correct": 1,
            "difficulty": "medium",
            "explanation": "Floating point precision means 0.1 + 0.2 is not exactly 0.3."
        },
        {
            "question": "What does Promise.all([]) return?",
            "options": [
                "A rejected promise",
                "A resolved promise with []",
                "undefined",
                "It throws"
            ],
            "correct": 1,
            "difficulty": "hard",
            "explanation": "An empty Promise.all resolves immediately with an empty array."
        },
        {
            "question": "Which keyword declares a block-scoped variable?",
            "options": ["var", "let", "function", "const and let"],
            "correct": 3,
            "difficulty": "easy",
            "explanation": "Both let and const are block scoped."
        },
        {
            "question": "What does async function always return?",
            "options": ["number", "string", "Promise", "callback"],
            "correct": 2,
            "difficulty": "medium",
            "explanation": "async functions always return a Promise."
        },
    ],
    "react": [
        {
            "question": "What is the primary purpose of React.memo?",
            "options": [
                "Persist state to localStorage",
                "Avoid unnecessary re-renders when props do not change",
                "Replace useEffect",
                "Improve bundle splitting"
            ],
            "correct": 1,
            "difficulty": "medium",
            "explanation": "React.memo memoizes component rendering based on props."
        },
        {
            "question": "When does useLayoutEffect run?",
            "options": [
                "Before DOM updates",
                "After paint only",
                "Synchronously after DOM mutations and before paint",
                "Only on server side"
            ],
            "correct": 2,
            "difficulty": "hard",
            "explanation": "useLayoutEffect runs after DOM mutations but before browser paint."
        },
        {
            "question": "Why is key important in list rendering?",
            "options": [
                "It secures components",
                "It helps React identify item changes efficiently",
                "It sets tab order",
                "It is required only in TypeScript"
            ],
            "correct": 1,
            "difficulty": "easy",
            "explanation": "Keys help React reconcile list items reliably."
        },
        {
            "question": "Which hook stores mutable values without causing rerender?",
            "options": ["useMemo", "useRef", "useEffect", "useState"],
            "correct": 1,
            "difficulty": "medium",
            "explanation": "useRef keeps mutable values across renders without triggering rerender."
        },
    ],
}


def _normalize_skill(skill: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", skill.strip().lower())


@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(payload: QuizGenerateRequest):
    normalized = _normalize_skill(payload.skill)
    bank = QUESTION_BANK.get(normalized)
    if not bank:
        alias_map = {
            "nodejs": "javascript",
            "typescript": "javascript",
            "py": "python",
            "jsx": "react",
        }
        bank = QUESTION_BANK.get(alias_map.get(normalized, ""))

    if bank:
        selected = random.sample(bank, k=min(payload.count, len(bank)))
    else:
        # Signal client to use richer local fallback bank when backend has no strong mapping.
        raise HTTPException(status_code=404, detail=f"No quiz bank found for skill '{payload.skill}'")

    return {"skill": payload.skill, "questions": selected}
