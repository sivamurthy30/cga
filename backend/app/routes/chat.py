"""
DEVA Smart Chat — intent-based router with navigation, news, coding, career, and KB fallback.
Fixes: same-answer-every-time by routing to specific handlers before KB lookup.
"""
from fastapi import APIRouter, Request
from app.ai.knowledge_base import KNOWLEDGE_BASE
from app.ai.intent_engine import classify_intent, find_best_match
from app.ai.kb_deva_qa import QA_LOOKUP
from app.cache import cache
import re

router = APIRouter()
_sessions: dict = {}

# ── Smart redirect / action responses ────────────────────────────────────────
SMART_RESPONSES = {
    # Tech news
    "tech_news": {
        "response": "Here are the latest tech news sources:\n\n📰 **TechCrunch** → https://techcrunch.com\n📰 **The Verge** → https://www.theverge.com/tech\n🔥 **Hacker News** → https://news.ycombinator.com\n⭐ **GitHub Trending** → https://github.com/trending",
        "action_type": "redirect", "target": "https://techcrunch.com"
    },
    "ai_news": {
        "response": "Latest AI news sources:\n\n🤖 **OpenAI Blog** → https://openai.com/news\n🧠 **Google DeepMind** → https://deepmind.google\n🤗 **Hugging Face Blog** → https://huggingface.co/blog\n🔬 **Anthropic** → https://www.anthropic.com/news",
        "action_type": "redirect", "target": "https://openai.com/news"
    },
    "github_trending": {
        "response": "🔥 Explore trending GitHub repositories:\n\n👉 https://github.com/trending\n\nFilter by language, daily/weekly/monthly trends.",
        "action_type": "redirect", "target": "https://github.com/trending"
    },
    # Coding practice
    "coding_practice": {
        "response": "Best platforms to practice coding:\n\n💻 **LeetCode** → https://leetcode.com\n🏆 **HackerRank** → https://hackerrank.com\n⚡ **Codeforces** → https://codeforces.com\n📚 **GeeksforGeeks** → https://geeksforgeeks.org\n🎯 **CodeChef** → https://codechef.com",
        "action_type": "redirect", "target": "https://leetcode.com"
    },
    "learn_react": {
        "response": "Best resources to learn React:\n\n⚛️ **Official Docs** → https://react.dev\n🎓 **Frontend Masters** → https://frontendmasters.com\n🆓 **freeCodeCamp** → https://freecodecamp.org\n🎮 **Scrimba** → https://scrimba.com",
        "action_type": "redirect", "target": "https://react.dev"
    },
    "learn_python": {
        "response": "Best resources to learn Python:\n\n🐍 **Official Docs** → https://docs.python.org\n🎓 **Real Python** → https://realpython.com\n🆓 **freeCodeCamp** → https://freecodecamp.org/learn/scientific-computing-with-python\n📺 **CS50P** → https://cs50.harvard.edu/python",
        "action_type": "redirect", "target": "https://realpython.com"
    },
    # Jobs
    "jobs": {
        "response": "Top job platforms for developers:\n\n💼 **LinkedIn Jobs** → https://linkedin.com/jobs\n🚀 **Wellfound (AngelList)** → https://wellfound.com\n🎓 **Internshala** → https://internshala.com\n📋 **Naukri** → https://naukri.com\n🌐 **Indeed** → https://indeed.com",
        "action_type": "redirect", "target": "https://linkedin.com/jobs"
    },
    "remote_jobs": {
        "response": "Best remote developer job platforms:\n\n🌍 **RemoteOK** → https://remoteok.com\n💻 **WeWorkRemotely** → https://weworkremotely.com\n🔧 **Turing** → https://turing.com\n⚡ **Toptal** → https://toptal.com",
        "action_type": "redirect", "target": "https://remoteok.com"
    },
    # Navigation
    "open_youtube": {
        "response": "Opening YouTube 📺\n\n👉 https://youtube.com",
        "action_type": "redirect", "target": "https://youtube.com"
    },
    "open_github": {
        "response": "Opening GitHub 🐙\n\n👉 https://github.com",
        "action_type": "redirect", "target": "https://github.com"
    },
    "open_chatgpt": {
        "response": "Opening ChatGPT 🤖\n\n👉 https://chat.openai.com",
        "action_type": "redirect", "target": "https://chat.openai.com"
    },
    "open_stackoverflow": {
        "response": "Opening Stack Overflow 📚\n\n👉 https://stackoverflow.com",
        "action_type": "redirect", "target": "https://stackoverflow.com"
    },
    # Internal navigation
    "go_roadmap": {
        "response": "Opening your personalized roadmap 🗺️\n\nYour roadmap shows step-by-step skills, projects, and milestones for your target career.",
        "action_type": "navigate_internal", "target": "#roadmap"
    },
    "go_interview": {
        "response": "Opening Interview Preparation 🎯\n\nPractice role-specific questions, coding problems, and HR interview tips.",
        "action_type": "navigate_internal", "target": "#interview-prep"
    },
    "go_resume": {
        "response": "Opening Resume Builder 📄\n\nGet ATS-optimized resume suggestions tailored to your target role.",
        "action_type": "navigate_internal", "target": "#resume-builder"
    },
    "go_salary": {
        "response": "Opening Salary Heatmap 💰\n\nSee real salary data across Indian cities for your target role.",
        "action_type": "navigate_internal", "target": "#salary-heatmap"
    },
    "go_advanced": {
        "response": "Opening Advanced Concepts 🧠\n\nDeep-dive into system design, architecture, and expert-level topics.",
        "action_type": "navigate_internal", "target": "#advanced-concepts"
    },
    # Projects
    "project_ideas": {
        "response": "Here are high-impact project ideas for your portfolio:\n\n🤖 AI Resume Analyzer\n💬 Real-Time Chat App\n📊 Stock Prediction Dashboard\n🎯 Interview Preparation Platform\n🗺️ AI Roadmap Generator\n💰 Smart Expense Tracker\n👨‍💻 Developer Portfolio Analyzer\n🔒 Cybersecurity Vulnerability Scanner\n📱 Cross-Platform Mobile App\n🌐 Full-Stack E-Commerce Platform",
        "action_type": "show_projects"
    },
    # Productivity
    "productivity": {
        "response": "Productivity tips for developers:\n\n✅ Focus on one roadmap at a time\n🏗️ Build real projects consistently\n🚫 Avoid tutorial addiction — code more\n📊 Track daily progress\n💻 Practice coding every day (even 30 min)\n😴 Maintain sleep schedule and discipline\n🎯 Set weekly goals and review them\n⏱️ Use Pomodoro technique for deep work",
        "action_type": "show_tips"
    },
    # Support
    "backend_error": {
        "response": "Backend troubleshooting steps:\n\n1. Check if the backend server is running\n2. Verify the API endpoint URL\n3. Restart the backend service\n4. Check CORS configuration\n5. Verify database connection\n6. Check environment variables (.env file)\n7. Look at server logs for errors",
        "action_type": "support"
    },
}

# ── Intent detection patterns ─────────────────────────────────────────────────
SMART_PATTERNS = [
    # Tech news
    (r"(latest|show|get).*(tech|technology).*(news|update)", "tech_news"),
    (r"tech news|technology news|trending tech", "tech_news"),
    (r"(latest|show|get|open).*(ai|artificial intelligence).*(news|update|blog)", "ai_news"),
    (r"ai news|openai news|deepmind|hugging face", "ai_news"),
    (r"(trending|popular).*(github|repo|repository)", "github_trending"),
    (r"github trending", "github_trending"),

    # Coding practice
    (r"(practice|improve|learn).*(coding|programming|dsa|algorithm)", "coding_practice"),
    (r"(where|how).*(practice|solve).*(code|problem|leetcode)", "coding_practice"),
    (r"leetcode|hackerrank|codeforces|competitive programming", "coding_practice"),
    (r"(learn|study|best.*for).*(react|reactjs)", "learn_react"),
    (r"(learn|study|best.*for).*(python)", "learn_python"),

    # Jobs
    (r"(find|apply|search|get).*(job|internship|placement|work)", "jobs"),
    (r"(job|internship).*(platform|site|portal|board)", "jobs"),
    (r"linkedin|naukri|internshala|wellfound|indeed", "jobs"),
    (r"remote.*(job|work|developer|engineer)", "remote_jobs"),
    (r"work from home|wfh job|freelance job", "remote_jobs"),

    # Navigation — external
    (r"open youtube|go to youtube|youtube", "open_youtube"),
    (r"open github|go to github", "open_github"),
    (r"open chatgpt|go to chatgpt|chatgpt", "open_chatgpt"),
    (r"open stack overflow|stackoverflow", "open_stackoverflow"),

    # Navigation — internal
    (r"(open|show|go to|take me to).*(roadmap)", "go_roadmap"),
    (r"(open|show|go to).*(interview prep|interview preparation)", "go_interview"),
    (r"(open|show|go to).*(resume builder|resume)", "go_resume"),
    (r"(open|show|go to).*(salary|heatmap)", "go_salary"),
    (r"(open|show|go to).*(advanced|concepts|system design)", "go_advanced"),

    # Projects
    (r"(project idea|project suggestion|what.*build|build.*project)", "project_ideas"),
    (r"(give|show|suggest).*(project|idea)", "project_ideas"),

    # Productivity
    (r"(stay|be|become).*(productive|focused|consistent)", "productivity"),
    (r"productivity tip|study tip|how.*focus|time management", "productivity"),

    # Support
    (r"backend.*(not|error|fail|down|respond)", "backend_error"),
    (r"(server|api).*(error|down|not working|fail)", "backend_error"),
]


def detect_smart_intent(message: str):
    """Check if message matches any smart pattern. Returns key or None."""
    m = message.lower().strip()
    for pattern, key in SMART_PATTERNS:
        if re.search(pattern, m):
            return key
    return None


@router.post("/chat")
async def chat(body: dict, request: Request):
    session_id = body.get("session_id", "default")
    message    = body.get("message", "").strip()
    context    = body.get("context", {})

    if not message:
        return {"response": "Please ask me something! I can help with careers, coding, jobs, roadmaps, and more."}

    # Cache identical messages within same session for 30s
    cache_key = f"chat:{session_id}:{hash(message)}"
    cached = await cache.get(cache_key)
    if cached:
        return cached

    ctx = _sessions.setdefault(session_id, {
        "year": None, "background": None, "goal": None,
        "history": [], "name": None, "role": None,
    })
    _update_context(ctx, message, context)

    # ── Step 1: Smart intent detection (navigation, news, jobs, etc.) ──────────
    smart_key = detect_smart_intent(message)
    if smart_key and smart_key in SMART_RESPONSES:
        result = {**SMART_RESPONSES[smart_key], "intent": smart_key}
        ctx["history"].append({"user": message, "bot": result["response"]})
        await cache.set(cache_key, result, ttl=30)
        return result

    # ── Step 2: Direct QA keyword lookup (from 999-row training dataset) ───────
    msg_lower = message.lower()
    best_qa_match = None
    best_qa_len = 0
    for keyword, (answer, category, intent) in QA_LOOKUP.items():
        if keyword in msg_lower and len(keyword) > best_qa_len:
            best_qa_match = (answer, category, intent)
            best_qa_len = len(keyword)

    if best_qa_match:
        answer, category, intent = best_qa_match
        result = {"response": answer, "intent": intent, "action_type": "text"}
        ctx["history"].append({"user": message, "bot": answer})
        await cache.set(cache_key, result, ttl=60)
        return result

    # ── Step 3: KB-based semantic matching (TF-IDF fallback) ──────────────────
    intent   = classify_intent(message, ctx)
    response = find_best_match(message, intent, ctx, KNOWLEDGE_BASE)

    # ── Step 4: Personalize with context ──────────────────────────────────────
    role = ctx.get("role") or context.get("role", "")
    if role and "{role}" in response:
        response = response.replace("{role}", role)

    result = {"response": response, "intent": intent, "action_type": "text"}
    ctx["history"].append({"user": message, "bot": response})
    if len(ctx["history"]) > 20:
        ctx["history"] = ctx["history"][-20:]

    await cache.set(cache_key, result, ttl=30)
    return result


def _update_context(ctx: dict, msg: str, profile: dict):
    m = msg.lower()
    if "1st year" in m or "first year" in m:   ctx["year"] = 1
    elif "2nd year" in m or "second year" in m: ctx["year"] = 2
    elif "3rd year" in m or "third year" in m:  ctx["year"] = 3
    elif "4th year" in m or "final year" in m:  ctx["year"] = 4
    elif "fresher" in m or "just graduated" in m: ctx["year"] = 0
    if "cse" in m or "computer science" in m:   ctx["background"] = "CSE"
    elif "ece" in m or "electronics" in m:       ctx["background"] = "ECE"
    elif "mechanical" in m or "mech" in m:       ctx["background"] = "Mechanical"
    if "job" in m or "placement" in m:           ctx["goal"] = "job"
    elif "higher studies" in m or "ms " in m:    ctx["goal"] = "higher_studies"
    if profile.get("role"):        ctx["role"]   = profile["role"]
    if profile.get("targetRole"):  ctx["role"]   = profile["targetRole"]
    if profile.get("knownSkills"): ctx["skills"] = profile["knownSkills"]
