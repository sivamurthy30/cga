# DEVA - Intelligent Career Development Platform

## Overview
DEVA is a full-stack career guidance application that uses ML/AI to provide personalized learning roadmaps. It helps users identify skill gaps for target roles and recommends a learning path using a LinUCB bandit algorithm.

## Architecture

### Frontend (React / Create React App)
- **Location:** `src/`
- **Port:** 5000 (dev server)
- **Key libraries:** React 19, React Router 6, Zustand, Framer Motion, GSAP, ReactFlow
- **Workflow:** "Start application" — `PORT=5000 BROWSER=none npm start`

### Backend (Python / Flask)
- **Location:** `backend/simple_app.py`
- **Port:** 8000 (localhost only)
- **Workflow:** "Backend API" — `cd backend && python simple_app.py`
- **Database:** SQLite (auto-created at `data/career_guidance.db`), with PostgreSQL fallback
- **Proxy:** Frontend proxies `/api/*`, `/health`, etc. to `localhost:8000` via `package.json` proxy setting

## Key Directories
- `src/` — React frontend source
- `src/components/` — Auth, OnboardingFlow, InteractiveRoadmap, SkillAssessmentQuiz, etc.
- `src/services/apiService.js` — Uses relative URLs (proxied to backend)
- `backend/simple_app.py` — Flask API (1864 lines, handles auth, recommendations, roadmaps)
- `backend/database/` — SQLite and PostgreSQL DB wrappers
- `backend/data/roadmaps/` — JSON roadmap data files
- `data/roles_skills.csv` — Role-to-skills mapping for ML
- `ml_models/` — Resume tip recommender and ensemble models
- `preprocessing/` — Feature engineering, resume parser, GitHub analyzer
- `bandit/` — LinUCB bandit implementation

## Authentication
- OTP-based signup via SMS (Fast2SMS) or email
- Password-based login also supported
- Sessions stored in memory (active_sessions dict)
- SQLite stores user data (learners, skills, progress, quiz results)

## Environment Variables (.env)
- `POSTGRES_*` — PostgreSQL credentials (optional, falls back to SQLite)
- `FAST2SMS_API_KEY` — SMS OTP service (optional, falls back to console print)
- `GITHUB_TOKEN` — GitHub API (optional, for higher rate limits)
- `FLASK_ENV`, `FLASK_DEBUG`, `SECRET_KEY`

## Deployment
- Target: autoscale
- Build: `npm run build`
- Run: `bash -c "python backend/simple_app.py & npx serve -s build -l 5000"`
