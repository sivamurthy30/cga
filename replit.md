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

## User Data Persistence
All user data is persisted to SQLite and restored on every login — no stale localStorage-only state.

### Database Tables
| Table | Purpose |
|---|---|
| `learners` | Core user info: email, name, target_role, onboarding_complete, learning_speed |
| `learner_skills` | Known skills per user with proficiency level |
| `quiz_results` | Skill assessment results (score, category, full JSON results) |
| `roadmap_progress` | Per-user completed roadmap node IDs (roadmap_id + node_id) |
| `user_stats` | XP, badges, streak, last_completed_date per user |

### Login Flow (database-first)
1. Token verified via `GET /api/auth/verify`
2. Full profile fetched from `GET /api/user/profile` (skills + quiz + nodes + stats)
3. React state and Zustand roadmap store hydrated from DB response
4. localStorage used only as a fallback cache if DB is unreachable

### Key API Endpoints
- `GET /api/user/profile` — Full state restore (one call at login)
- `POST /api/user/complete-onboarding` — Save target role + skills + mark onboarding done
- `POST /api/user/roadmap/progress` — Mark a roadmap node complete/incomplete
- `GET /api/user/roadmap/progress` — Get all completed nodes + stats
- `POST /api/user/stats` — Save XP, badges, streak
- `POST /api/user/quiz/save` — Save skill assessment results

### Real-time Sync
- Every roadmap node toggle fires a background `POST /api/user/roadmap/progress` + `POST /api/user/stats`
- Skill assessment completion fires `POST /api/user/quiz/save`
- All syncs are fire-and-forget (non-blocking) so UI stays instant

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
