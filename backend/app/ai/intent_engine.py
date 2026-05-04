"""
Intent classifier + semantic matcher using TF-IDF cosine similarity
No external dependencies beyond Python stdlib + math
"""
import re, math
from collections import Counter

# ── Intent patterns (regex-based, fast) ──────────────────────────────────────
INTENTS = [
    ("greeting",         r"\b(hi|hello|hey|namaste|good morning|good evening|hii+|sup)\b"),
    ("thanks",           r"\b(thank|thanks|thx|ty|appreciate)\b"),
    ("career_options",   r"(career option|what career|which career|career after|career for cse|career path|career choice|career in 2025|career in 2026|future.proof|high.paying career|trending career|best career|career confusion|confused about career|what to do after|what should i do after|career switch|switch career|change career|it career|is it good)"),
    ("higher_studies",   r"(higher stud|mtech|m\.tech|ms |mba|gate exam|gre|study abroad|top universit|phd|research|should i do masters|masters or job)"),
    ("learn_coding",     r"(start cod|learn cod|learn programming|how to code|coding for beginner|programming language|which language|first language|python or java|best language|coding from scratch|beginner programming|coding roadmap|improve coding|coding skill)"),
    ("dsa",              r"(dsa|data structure|algorithm|time complexity|space complexity|leetcode|competitive programming|coding interview|problem.solving|how many problem|faang|crack interview|hard problem|easy problem|medium problem)"),
    ("resume",           r"(resume|cv |curriculum vitae|ats|portfolio|github profile|what to include|resume mistake|resume length|resume summary|resume format|resume tip|build resume|make resume|write resume)"),
    ("projects",         r"(project idea|what project|build project|final year project|beginner project|real.world project|tech stack|deploy|host website|api integration|project for resume|project for portfolio)"),
    ("jobs_internships", r"(get job|first job|find job|job search|internship|placement|off.campus|on.campus|startup job|crack job|apply for job|where to find job|job portal|naukri|linkedin job|negotiate salary|salary hike|appraisal|job offer)"),
    ("web_dev",          r"(web dev|frontend|backend|full.?stack|react|node\.?js|html|css|javascript|rest api|database|website|web application|mern|mean stack|next\.?js|vue|angular)"),
    ("ai_ml",            r"(machine learning|deep learning|artificial intelligence|\bai\b|nlp|computer vision|data science|neural network|llm|gpt|tensorflow|pytorch|kaggle|ml career|is ai good)"),
    ("soft_skills",      r"(communication skill|speak confident|english|presentation|teamwork|leadership|interpersonal|body language|public speaking|improve english|professional skill)"),
    ("productivity",     r"(motivat|procrastinat|focus|discipline|time management|study habit|consistency|burnout|stress|mental health|stay on track|productive|distract|lazy|wasted time|wasted year)"),
    ("exam_study",       r"(exam|study tip|revise|revision|score high|marks|study fast|memorize|concentrate|study schedule|study plan)"),
    ("career_switch",    r"(switch from|non.cs|non cs|mechanical to it|ece to software|i don.t like coding|hate coding|no skill|wasted year|start fresh|it.s too late|am i too old|background change|career change)"),
    ("skill_gap",        r"(skill gap|what skill|missing skill|which skill|skill required|skill needed|skill for job|skill for ml|skill for web|skill for data)"),
    ("roadmap_request",  r"(roadmap|learning path|step by step|where to start|how to start|guide me|plan for|what to learn first|learning order)"),
    ("tech_question",    r"(what is|how does|explain|difference between|vs |versus|define|meaning of|how to use|when to use)"),
    ("general",          r".*"),
]

def classify_intent(message: str, ctx: dict) -> str:
    m = message.lower()
    for intent, pattern in INTENTS:
        if re.search(pattern, m):
            return intent
    return "general"


# ── TF-IDF cosine similarity ──────────────────────────────────────────────────
def _tokenize(text: str) -> list:
    return re.findall(r'\b[a-z]{2,}\b', text.lower())

def _tfidf_vector(tokens: list, idf: dict) -> dict:
    tf = Counter(tokens)
    total = len(tokens) or 1
    return {t: (c / total) * idf.get(t, 1.0) for t, c in tf.items()}

def _cosine(v1: dict, v2: dict) -> float:
    common = set(v1) & set(v2)
    if not common: return 0.0
    dot = sum(v1[t] * v2[t] for t in common)
    mag1 = math.sqrt(sum(x*x for x in v1.values()))
    mag2 = math.sqrt(sum(x*x for x in v2.values()))
    return dot / (mag1 * mag2 + 1e-9)

def _build_idf(chunks: list) -> dict:
    df: Counter = Counter()
    N = len(chunks)
    for c in chunks:
        tokens = set(_tokenize(c.get("content", "") + " " + " ".join(c.get("tags", []))))
        df.update(tokens)
    return {t: math.log(N / (1 + df[t])) for t in df}


def find_best_match(message: str, intent: str, ctx: dict, kb: list) -> str:
    # Filter by intent first
    candidates = [c for c in kb if intent in c.get("intents", [])]
    if not candidates:
        candidates = kb  # fallback to full search

    idf = _build_idf(candidates)
    q_tokens = _tokenize(message)
    q_vec = _tfidf_vector(q_tokens, idf)

    best_score = -1
    best_chunk = None
    for chunk in candidates:
        doc = chunk.get("content", "") + " " + " ".join(chunk.get("tags", []))
        d_tokens = _tokenize(doc)
        d_vec = _tfidf_vector(d_tokens, idf)
        score = _cosine(q_vec, d_vec)
        if score > best_score:
            best_score = score
            best_chunk = chunk

    if best_chunk:
        return _personalize(best_chunk["response"], ctx)

    return _default_response(intent, ctx)


def _personalize(response: str, ctx: dict) -> str:
    """Inject user context into response."""
    year = ctx.get("year")
    bg = ctx.get("background")
    role = ctx.get("role", "")

    prefix = ""
    if year == 1: prefix = "As a 1st year student, "
    elif year == 2: prefix = "As a 2nd year student, "
    elif year == 3: prefix = "As a 3rd year student, "
    elif year == 4: prefix = "As a final year student, "
    elif year == 0: prefix = "As a fresher, "

    if bg and bg != "CSE" and "non-CS" not in response:
        response = f"[Coming from {bg} background]\n\n" + response

    if prefix and not response.startswith("["):
        response = prefix + response[0].lower() + response[1:]

    return response


def _default_response(intent: str, ctx: dict) -> str:
    defaults = {
        "greeting": "Hey! 👋 I'm DEVA, your career AI. Ask me anything about careers, coding, jobs, DSA, projects, or personal growth!",
        "thanks": "You're welcome! 😊 Keep going — consistency is everything.",
        "general": "I can help with careers, coding, DSA, resume, jobs, projects, AI/ML, and more. What would you like to know?",
    }
    return defaults.get(intent, defaults["general"])
