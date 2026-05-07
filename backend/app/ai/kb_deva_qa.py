"""
DEVA Q&A Knowledge Base — built from the 999-row training dataset.
Each entry maps a topic keyword → answer + category + intent.
The chat route uses this for direct keyword matching before falling back to TF-IDF.
"""

# (topic_keyword, answer, category, intent)
DEVA_QA = [
    # ── Motivation ──────────────────────────────────────────────────────────────
    ("student motivation",    "Stay consistent. Small daily progress in skills, projects, and practice can create a strong career transformation over time.", "motivation", "confidence_building"),
    ("placement confidence",  "Focus on one roadmap, build real projects, revise fundamentals, and track your growth regularly.", "motivation", "confidence_building"),
    ("study consistency",     "Stay consistent. Small daily progress in skills, projects, and practice can create a strong career transformation over time.", "motivation", "student_support"),
    ("career confusion",      "Career confusion is normal. DEVA helps you break the journey into clear steps so you can move forward with confidence.", "motivation", "student_support"),
    ("skill improvement",     "Career confusion is normal. DEVA helps you break the journey into clear steps so you can move forward with confidence.", "motivation", "student_support"),
    ("learning discipline",   "Focus on one roadmap, build real projects, revise fundamentals, and track your growth regularly.", "motivation", "motivation"),

    # ── Career Guidance ──────────────────────────────────────────────────────────
    ("mobile app developer",  "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("frontend developer",    "DEVA recommends career paths by analyzing your assessment score, preferred domain, and progress history.", "career_guidance", "career_path_help"),
    ("backend developer",     "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("full stack developer",  "This career path requires a strong foundation, practical projects, and consistent skill improvement. DEVA can create a roadmap for it.", "career_guidance", "career_path_help"),
    ("data scientist",        "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("devops engineer",       "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("cloud engineer",        "This career path requires a strong foundation, practical projects, and consistent skill improvement. DEVA can create a roadmap for it.", "career_guidance", "career_recommendation"),
    ("ai engineer",           "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("cybersecurity analyst", "DEVA can help you choose this path by checking your interests, current skills, project experience, and learning goals.", "career_guidance", "career_recommendation"),
    ("software engineer",     "This career path requires a strong foundation, practical projects, and consistent skill improvement. DEVA can create a roadmap for it.", "career_guidance", "career_recommendation"),

    # ── Skill Assessment ─────────────────────────────────────────────────────────
    ("technical quiz",   "After completing the assessment, DEVA uses your score to recommend skills, projects, and career paths.", "skill_assessment", "assessment_help"),
    ("coding assessment","The DEVA skill assessment evaluates your technical knowledge and helps identify your strengths, weaknesses, and suitable learning path.", "skill_assessment", "skill_evaluation"),
    ("domain assessment","After completing the assessment, DEVA uses your score to recommend skills, projects, and career paths.", "skill_assessment", "quiz_information"),
    ("knowledge test",   "The DEVA skill assessment evaluates your technical knowledge and helps identify your strengths, weaknesses, and suitable learning path.", "skill_assessment", "quiz_information"),
    ("skill assessment", "The DEVA skill assessment evaluates your technical knowledge and helps identify your strengths, weaknesses, and suitable learning path.", "skill_assessment", "assessment_help"),
    ("skill score",      "After completing the assessment, DEVA uses your score to recommend skills, projects, and career paths.", "skill_assessment", "assessment_help"),

    # ── Resume ───────────────────────────────────────────────────────────────────
    ("resume analysis",   "DEVA can analyze your resume and suggest improvements in structure, keywords, projects, skills, and ATS compatibility.", "resume", "resume_review"),
    ("resume improvement","DEVA helps improve your resume by comparing your profile with your target career path and identifying missing skills.", "resume", "ats_optimization"),
    ("ats resume",        "DEVA can analyze your resume and suggest improvements in structure, keywords, projects, skills, and ATS compatibility.", "resume", "profile_improvement"),
    ("resume keywords",   "For better ATS performance, include relevant keywords, measurable project results, clean formatting, and role-specific skills.", "resume", "ats_optimization"),
    ("resume score",      "DEVA helps improve your resume by comparing your profile with your target career path and identifying missing skills.", "resume", "resume_review"),
    ("project description","For better ATS performance, include relevant keywords, measurable project results, clean formatting, and role-specific skills.", "resume", "profile_improvement"),

    # ── Roadmap ──────────────────────────────────────────────────────────────────
    ("placement roadmap",   "DEVA generates personalized roadmaps based on your current skill level, target career, assessment performance, and learning preferences.", "roadmap", "roadmap_generation"),
    ("career roadmap",      "A roadmap in DEVA gives you step-by-step skills, projects, resources, and milestones to follow for your chosen career path.", "roadmap", "study_path"),
    ("learning roadmap",    "Your roadmap updates as you complete tasks, improve skills, and interact with DEVA recommendations.", "roadmap", "roadmap_generation"),
    ("skill roadmap",       "A roadmap in DEVA gives you step-by-step skills, projects, resources, and milestones to follow for your chosen career path.", "roadmap", "roadmap_generation"),
    ("personalized roadmap","DEVA generates personalized roadmaps based on your current skill level, target career, assessment performance, and learning preferences.", "roadmap", "study_path"),
    ("project roadmap",     "Your roadmap updates as you complete tasks, improve skills, and interact with DEVA recommendations.", "roadmap", "learning_plan"),

    # ── Interview ────────────────────────────────────────────────────────────────
    ("interview preparation","For interviews, focus on fundamentals, projects, problem-solving, communication, and practical implementation experience.", "interview", "question_practice"),
    ("mock interview",       "DEVA helps with interview preparation by generating role-specific questions, coding practice, explanations, and improvement suggestions.", "interview", "mock_interview"),
    ("coding interview",     "DEVA can guide you through technical, HR, coding, and project-based interview preparation.", "interview", "mock_interview"),
    ("technical interview",  "DEVA helps with interview preparation by generating role-specific questions, coding practice, explanations, and improvement suggestions.", "interview", "mock_interview"),
    ("hr interview",         "For interviews, focus on fundamentals, projects, problem-solving, communication, and practical implementation experience.", "interview", "interview_help"),
    ("system design interview","DEVA helps with interview preparation by generating role-specific questions, coding practice, explanations, and improvement suggestions.", "interview", "question_practice"),

    # ── Coding Skills ────────────────────────────────────────────────────────────
    ("python",     "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "programming_support"),
    ("javascript", "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "programming_support"),
    ("react",      "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "technical_guidance"),
    ("java",       "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "coding_help"),
    ("sql",        "DEVA can help you learn this skill with concepts, practice tasks, project ideas, and interview-focused guidance.", "coding", "programming_support"),
    ("dsa",        "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "programming_support"),
    ("git",        "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "coding_help"),
    ("apis",       "DEVA can help you learn this skill with concepts, practice tasks, project ideas, and interview-focused guidance.", "coding", "programming_support"),
    ("fastapi",    "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "coding_help"),
    ("debugging",  "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "technical_guidance"),
    ("typescript", "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "programming_support"),
    ("node.js",    "Start with fundamentals, build small projects, solve problems, and then move to advanced real-world use cases.", "coding", "programming_support"),
    ("docker",     "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "technical_guidance"),
    ("kubernetes", "This skill is important for software development and can improve your placement readiness when practiced consistently.", "coding", "technical_guidance"),

    # ── Dashboard ────────────────────────────────────────────────────────────────
    ("dashboard",           "The dashboard is designed to give a clear overview of your career journey and learning performance.", "dashboard", "dashboard_help"),
    ("progress tracking",   "Progress tracking helps you understand how much you have improved and what you should focus on next.", "dashboard", "progress_tracking"),
    ("analytics",           "The DEVA dashboard shows your learning progress, roadmap status, skill scores, AI recommendations, and completed tasks.", "dashboard", "analytics_help"),
    ("skill graph",         "The dashboard is designed to give a clear overview of your career journey and learning performance.", "dashboard", "dashboard_help"),
    ("streak",              "The DEVA dashboard shows your learning progress, roadmap status, skill scores, AI recommendations, and completed tasks.", "dashboard", "progress_tracking"),
    ("completed tasks",     "The dashboard is designed to give a clear overview of your career journey and learning performance.", "dashboard", "analytics_help"),
    ("recommendations panel","The DEVA dashboard shows your learning progress, roadmap status, skill scores, AI recommendations, and completed tasks.", "dashboard", "analytics_help"),

    # ── Authentication ───────────────────────────────────────────────────────────
    ("login",           "If you have login issues, check your email and password, reset your password, or try signing in again.", "authentication", "login_issue"),
    ("signup",          "You can create an account on DEVA using signup, complete onboarding, and then access your personalized dashboard.", "authentication", "account_support"),
    ("forgot password", "DEVA uses authentication to protect your profile, assessment results, roadmap, and progress data.", "authentication", "login_issue"),
    ("google login",    "If you have login issues, check your email and password, reset your password, or try signing in again.", "authentication", "login_issue"),
    ("account creation","You can create an account on DEVA using signup, complete onboarding, and then access your personalized dashboard.", "authentication", "account_support"),
    ("profile setup",   "DEVA uses authentication to protect your profile, assessment results, roadmap, and progress data.", "authentication", "auth_help"),

    # ── General / Platform ───────────────────────────────────────────────────────
    ("deva platform",          "DEVA is an AI-powered career guidance platform that helps students and developers discover career paths, improve skills, and follow personalized learning roadmaps.", "general", "platform_information"),
    ("ai career guidance",     "DEVA helps learners understand their current skill level, choose a suitable tech career path, and get AI-driven recommendations for growth.", "general", "platform_information"),
    ("developer career planning","DEVA helps learners understand their current skill level, choose a suitable tech career path, and get AI-driven recommendations for growth.", "general", "general_help"),
    ("student career growth",  "DEVA is an AI-powered career guidance platform that helps students and developers discover career paths, improve skills, and follow personalized learning roadmaps.", "general", "introduction"),
    ("what is deva",           "DEVA acts like a career copilot by combining skill assessment, roadmap generation, resume guidance, and interview preparation.", "general", "general_help"),

    # ── Support / Errors ─────────────────────────────────────────────────────────
    ("resume upload error",    "Please refresh the page, check your internet connection, and try again. If the issue continues, contact DEVA support.", "support", "troubleshooting"),
    ("page not loading",       "Please refresh the page, check your internet connection, and try again. If the issue continues, contact DEVA support.", "support", "technical_support"),
    ("server error",           "This issue may happen due to network problems, incomplete inputs, or backend delay. Try again after checking all required fields.", "support", "error_handling"),
    ("slow response",          "DEVA is designed to recover from common errors, but persistent issues should be reported through the support section.", "support", "error_handling"),
    ("assessment not submitting","This issue may happen due to network problems, incomplete inputs, or backend delay. Try again after checking all required fields.", "support", "error_handling"),
    ("recommendations missing","This issue may happen due to network problems, incomplete inputs, or backend delay. Try again after checking all required fields.", "support", "technical_support"),
]

# Build lookup dict for fast access: keyword → (answer, category, intent)
QA_LOOKUP = {kw.lower(): (ans, cat, intent) for kw, ans, cat, intent in DEVA_QA}

# Also build as KB chunks for TF-IDF fallback
QA_CHUNKS = [
    {
        "id": f"qa_{i}",
        "content": f"{kw}. {ans}",
        "response": ans,
        "category": cat,
        "intents": [intent, cat, "general"],
        "tags": [kw] + kw.split(),
    }
    for i, (kw, ans, cat, intent) in enumerate(DEVA_QA)
]
