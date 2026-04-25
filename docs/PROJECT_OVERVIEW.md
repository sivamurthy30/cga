# DEV^A — AI-Powered Career Guidance Platform
## Complete Project Overview | BTech Final Year Project

---

## 1. PROJECT ABSTRACT

DEV^A (pronounced "Deva") is an intelligent, full-stack career development platform built for software engineering students and professionals. It combines Reinforcement Learning (LinUCB Contextual Bandit), Natural Language Processing (spaCy), and Generative AI (Google Gemini) to deliver a personalized, adaptive learning experience.

The platform guides users from skill assessment → personalized roadmap → job readiness through an interactive, gamified interface. It solves the core problem of "I know I need to learn, but I don't know what to learn next" by using a multi-armed bandit algorithm that learns from user behavior and continuously improves its recommendations.

**Project Type:** Full-Stack Web Application with ML Backend  
**Domain:** EdTech / Career Guidance / AI-ML  
**Tech Stack:** React 18, FastAPI (Python), SQLite/PostgreSQL, LinUCB, Gemini AI  
**Team Size:** Individual / Small Team  

---

## 2. PROBLEM STATEMENT

Software engineering students face three critical challenges:

1. **Information Overload** — Thousands of resources exist but no personalized path
2. **Skill Gap Blindness** — Students don't know which skills employers actually want
3. **Motivation Decay** — Without feedback loops, learners quit within weeks

Existing platforms (Coursera, Udemy) provide content but no intelligent guidance. DEV^A fills this gap with an AI system that adapts to each user's profile, learning speed, and career goals.

---

## 3. OBJECTIVES

1. Build an adaptive skill recommendation engine using LinUCB Contextual Bandit
2. Implement NLP-based resume parsing to extract skills automatically
3. Create an interactive visual roadmap with 17 career paths
4. Develop a gamification system (XP, badges, streaks) to sustain motivation
5. Integrate Gemini AI for real-time career coaching (Shadow Mentor)
6. Provide a complete job-readiness toolkit (Resume Builder, Interview Prep, Salary Data)

---

## 4. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                       │
│  Auth → Onboarding → Assessment → Dashboard → Roadmap → Tools   │
│  GSAP Animations | Framer Motion | ReactFlow | Chart.js | Zustand│
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│                     BACKEND (FastAPI Python)                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  System 1    │  │  System 2    │  │      System 3        │  │
│  │  LinUCB      │  │  Knowledge   │  │   Shadow Mentor AI   │  │
│  │  Contextual  │  │  Graph       │  │   (Gemini Flash)     │  │
│  │  Bandit      │  │  (BFS/DFS)   │  │   Stagnation Detect  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  System 4    │  │  NLP Engine  │  │   REST API (90+      │  │
│  │  Celery +    │  │  spaCy       │  │   endpoints)         │  │
│  │  Redis Async │  │  Resume Parse│  │   JWT Auth           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    DATABASE LAYER                                │
│         SQLite (Development) / PostgreSQL (Production)           │
│  Tables: learners, skills, quiz_results, roadmap_progress,       │
│          user_stats, otp_records, bandit_state                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. COMPLETE USER FLOW (Start to End)

### Step 1 — Authentication Page
- User visits the site and sees the DEV^A logo with GSAP elastic bounce animation
- Options: Sign In | Sign Up | Demo Login (offline mode)
- JWT tokens stored in localStorage
- Magic Auth fallback: if login fails, auto-attempts signup
- Offline mode: creates local account if backend unavailable

### Step 2 — Onboarding Flow (6 Steps)
**Step 0:** Welcome screen with feature cards  
**Step 1:** Interest Quiz (10 questions) → maps to frontend/backend/data/devops  
**Step 2:** Quiz Results → recommended role with match percentage  
**Step 3:** Role Selection → 33 career roles across 9 categories  
**Step 4:** AI Help → Resume upload (spaCy NLP) or GitHub analysis  
**Step 5:** Skills Input → manual entry or pre-populated from resume/GitHub  

Every step is atomically saved to the database (`/api/user/status/step`).

### Step 3 — Skill Assessment Quiz
- 20 questions across 5 role-specific skills (4 per skill)
- **Dynamic Difficulty:** If 2 Medium questions answered correctly in <30 seconds → next 2 forced to Hard
- **Proof of Skill:** HMAC-SHA256 cryptographic hash generated on completion (anti-cheat)
- Results: per-skill weighted scores, levels (beginner/intermediate/advanced/expert)
- Saved to database via `/api/user/quiz/save`

### Step 4 — Dashboard (Main Hub)
- Welcome header with role and "Continue Roadmap" button
- **Streak tracking** with 14-day calendar visualization
- **4 KPI cards:** Avg Score, Nodes Completed, Total XP, Badges
- **Skill charts:** Doughnut (distribution) + Bar (top proficiencies) via Chart.js
- **Recommended Project** based on target role
- **Action Plan** with weekly and monthly goals
- **Predictive Career Slider** — shows role/salary at 1-12 months based on XP velocity
- **Focus Areas** — 3 weakest skills with improvement suggestions
- **Daily Developer Tip** — rotates by day of week

### Step 5 — Roadmap Page
- 17 interactive roadmaps (Frontend, Backend, Full Stack, DevOps, AI/ML, etc.)
- **ReactFlow canvas** — draggable, zoomable, node-based visualization
- Node states: Locked | In-Progress | Completed | Recommended
- **Market Radar** — nodes glow if skill is trending (🔥 HOT / 📈 RISING)
- Completing a node → earns XP → syncs to backend
- **Deep Work Player** — floating lo-fi music player with Pomodoro timer synced to nodes

### Step 6 — Advanced Features (X-Factor Tools)

| Feature | Description | Access |
|---------|-------------|--------|
| Ghost-Hunter Code Reviewer | AI security & efficiency audit via Gemini | `#code-review` |
| Pitch-Perfect Voice Lab | Records elevator pitch, analyzes WPM/fillers/confidence | `#pitch-perfect` |
| Salary Heatmap | Live salary data across 8 cities for 8 roles | `#salary-heatmap` |
| AI Resume Builder | Split-screen resume transformer with ATS optimization | `#resume-builder` |
| Executive Vault | 40+ role-specific books with 15-min AI summaries | `#executive-vault` |
| Daily Coding Challenge | 60 rotating LeetCode-style problems with XP rewards | `#daily-challenge` |
| Interview Prep | Flash cards (25+ per role) with mastery tracking | `#interview-prep` |
| Command Palette | Ctrl+K global search — navigate entire app instantly | Ctrl+K |
| Hacker Console | CLI at bottom — `/status`, `/skills`, `/roadmap` commands | ▲ console |

### Step 7 — DEVAsquare Premium
- $29/month or $249/year
- PayU payment gateway integration
- Pro features: Executive Vault, Resume Builder, Shadow Mentor AI, Salary Heatmaps
- Webhook self-healing for payment status updates

---

## 6. ML SYSTEMS (Core Innovation)

### System 1 — LinUCB Contextual Bandit (Skill Recommender)

**Algorithm:** Linear Upper Confidence Bound (LinUCB)  
**Purpose:** Recommends the optimal next skill to learn

**Context Vector (11 dimensions):**
```
[role_encoded, num_known_skills, has_ml_skills, num_projects,
 experience_years, has_github, has_portfolio, has_certifications,
 has_quantifiable_metrics, has_web_skills, github_velocity]
```

**Composite Reward Function:**
```
Reward = 0.3 × click_through
       + 0.4 × completion_efficiency (ideal_time / actual_time)
       + 0.3 × assessment_improvement (post_score - pre_score)
```

**Multi-Objective Scoring:**
- Career Readiness: 40%
- Time Efficiency: 20%
- Difficulty Match: 20%
- Market Demand: 15%
- Prerequisite Fit: 5%

The model updates after every user interaction (clicked/started/completed/skipped), becoming more personalized over time.

### System 2 — Knowledge Graph (Prerequisite Engine)

**Structure:** Directed weighted graph (50+ skills as nodes, prerequisites as edges)  
**Algorithm:** BFS backtrace — given a failed assessment, walks the graph backwards to find root skill gaps  
**Example:** React fails → traces back to JavaScript → HTML/CSS  

### System 3 — Shadow Mentor (Agentic AI)

**Trigger:** User inactive for 3+ days (stagnation detection)  
**Action:** Calls Gemini Flash to generate a personalized market insight notification  
**Delivery:** Push notification via `/api/mentor/notifications/{user_id}`  

### System 4 — Async Analytics (Celery + Redis)

**Resume Processing:** PDF/DOCX → spaCy NLP → skill extraction → role suggestion  
**GitHub Analysis:** Fetches repos → analyzes languages → calculates contribution velocity  
**WebSocket Streaming:** Real-time progress events during background processing  
**Celery Beat:** Periodic stagnation sweep every 6 hours  

---

## 7. API REFERENCE (Key Endpoints)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/verify` | Validate JWT token |

### User & Session
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/status` | Anti-Amnesia Shield — returns exact step |
| POST | `/api/user/status/step` | Atomic save of onboarding step |
| GET | `/api/user/profile` | Full profile with skills, stats, quiz results |
| POST | `/api/user/complete-onboarding` | Save role, skills, learning speed |
| POST | `/api/user/quiz/save` | Save assessment results |
| POST | `/api/user/roadmap/progress` | Update node completion |

### ML & Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/linucb/recommend` | Get top 5 skill recommendations |
| POST | `/api/linucb/feedback` | Submit interaction feedback |
| POST | `/api/graph/backtrace` | Find skill gaps from failed assessment |
| GET | `/api/mentor/notifications/{id}` | Get Shadow Mentor nudges |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/code/review` | Ghost-Hunter AI code audit |
| POST | `/api/pitch/analyze` | Pitch-Perfect audio analysis |
| GET | `/api/salary/heatmap` | Salary data by role + city |
| GET | `/api/market/trending` | Trending skills with salary premium |
| POST | `/api/resume/transform` | AI Resume Transformation Engine |
| GET | `/api/vault/books` | Role-filtered book library |
| GET | `/api/vault/books/{id}/summary` | 15-min AI book summary |
| POST | `/api/proof/generate` | HMAC-SHA256 Proof of Skill |

---

## 8. DATABASE SCHEMA

```sql
-- Core user table
CREATE TABLE learners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    password_hash TEXT,
    target_role TEXT,
    learning_speed TEXT DEFAULT 'medium',
    onboarding_complete BOOLEAN DEFAULT 0,
    last_saved_step INTEGER DEFAULT 0,
    is_pro BOOLEAN DEFAULT 0,
    quiz_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills per user
CREATE TABLE learner_skills (
    id INTEGER PRIMARY KEY,
    learner_id INTEGER REFERENCES learners(id),
    skill TEXT,
    proficiency_level TEXT DEFAULT 'beginner'
);

-- Quiz/Assessment results
CREATE TABLE quiz_results (
    id INTEGER PRIMARY KEY,
    learner_id INTEGER REFERENCES learners(id),
    quiz_type TEXT,
    score INTEGER,
    total_questions INTEGER,
    results_data TEXT,  -- JSON
    taken_at TIMESTAMP
);

-- Roadmap node completion
CREATE TABLE roadmap_progress (
    id INTEGER PRIMARY KEY,
    learner_id INTEGER REFERENCES learners(id),
    roadmap_id TEXT,
    node_id TEXT,
    completed BOOLEAN,
    completed_at TIMESTAMP,
    UNIQUE(learner_id, roadmap_id, node_id)
);

-- XP, badges, streak
CREATE TABLE user_stats (
    learner_id INTEGER PRIMARY KEY REFERENCES learners(id),
    total_xp INTEGER DEFAULT 0,
    badges TEXT DEFAULT '[]',
    streak INTEGER DEFAULT 0,
    last_completed_date TEXT
);

-- LinUCB bandit state per skill
CREATE TABLE bandit_state (
    skill TEXT UNIQUE,
    pulls INTEGER DEFAULT 0,
    total_reward REAL DEFAULT 0,
    A_matrix TEXT,  -- JSON serialized numpy array
    b_vector TEXT   -- JSON serialized numpy array
);
```

---

## 9. TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Animations | GSAP 3.14 + Framer Motion | Cinematic transitions |
| Charts | Chart.js 4.5 | Skill distribution charts |
| Roadmap | ReactFlow 11 | Interactive node canvas |
| State | Zustand 4.4 | Global state + persistence |
| Backend | FastAPI (Python) | REST API framework |
| ML | scikit-learn, NumPy | LinUCB implementation |
| NLP | spaCy 3.7 | Resume parsing |
| AI | Google Gemini Flash | Chat, code review, summaries |
| Database | SQLite (dev) / PostgreSQL (prod) | Data persistence |
| Cache | Redis | Celery broker + result backend |
| Queue | Celery 5.3 | Async task processing |
| Auth | JWT (python-jose) + bcrypt | Secure authentication |
| Payments | PayU Gateway | Premium subscriptions |

---

## 10. KEY INNOVATIONS

### 1. Anti-Amnesia Shield
The `/api/user/status` endpoint returns the user's exact position in the flow on every refresh. The frontend uses this to route directly to the correct step — no "back to start" bug.

### 2. Dynamic Difficulty Assessment
If a user answers 2 Medium questions correctly in under 30 seconds, the next 2 questions are automatically escalated to Hard. This creates a more accurate skill-gap heatmap.

### 3. Proof of Skill (Anti-Cheat)
On quiz completion, the backend generates an HMAC-SHA256 cryptographic hash of the results. This hash can be verified to prove the assessment was completed legitimately.

### 4. Market Radar
Roadmap nodes glow with colored halos if the skill is currently trending in the job market. Hot skills show 🔥 HOT badges; rising skills show 📈 RISING badges with salary premium percentages.

### 5. Offline-First Architecture
The app works without a backend. Local tokens, localStorage persistence, and graceful fallbacks ensure users never lose progress even when the server is down.

### 6. Composite Reward Function
Unlike simple click-through optimization, the LinUCB reward combines three signals: engagement (click), efficiency (time vs ideal), and learning (score improvement). This prevents the model from recommending easy but useless content.

---

## 11. GAMIFICATION SYSTEM

| Element | Trigger | Value |
|---------|---------|-------|
| XP Points | Complete roadmap node | 10-30 XP |
| XP Points | Daily challenge solved | 50-200 XP |
| Streak | Login + activity daily | +1 day |
| Badge | 5 nodes completed | 🏅 Starter |
| Badge | 25 nodes completed | 🥈 Learner |
| Badge | 50 nodes completed | 🥇 Expert |
| Proof Hash | Assessment completed | Cryptographic certificate |

---

## 12. SECURITY

- **Passwords:** bcrypt hashing with automatic SHA-256 → bcrypt migration
- **Auth:** JWT tokens (HS256), 30-day expiry
- **API:** Bearer token on all protected endpoints
- **Proof of Skill:** HMAC-SHA256 signed by server secret
- **Rate Limiting:** slowapi middleware on AI endpoints
- **Input Validation:** Pydantic models on all request bodies
- **CORS:** Explicit origin whitelist

---

## 13. HOW TO RUN

### Backend
```bash
cd cga/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd cga
npm install
npm start
```

### With Full Features (Redis + Celery)
```bash
# Terminal 1 — Redis
redis-server

# Terminal 2 — Celery Worker
cd cga/backend
celery -A app.services.async_tasks.celery_app worker --loglevel=info

# Terminal 3 — Backend
uvicorn app.main:app --port 8000 --reload

# Terminal 4 — Frontend
cd cga && npm start
```

### Environment Variables (.env)
```
GEMINI_API_KEY=your_key          # AI features
GITHUB_TOKEN=your_token          # GitHub analysis
REACT_APP_PAYU_MERCHANT_KEY=key  # Payments
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_jwt_secret
```

---

## 14. PROJECT METRICS

| Metric | Value |
|--------|-------|
| Total API Endpoints | 90+ |
| Frontend Components | 35+ |
| Career Roadmaps | 17 |
| Book Library | 40+ books across 8 roles |
| Daily Challenges | 60 rotating problems |
| Interview Cards | 25+ per role (8 roles) |
| ML Context Dimensions | 11 |
| Reward Function Components | 3 |
| Database Tables | 10 |
| Lines of Code (approx.) | 15,000+ |

---

## 15. FUTURE SCOPE

1. **Mobile App** — React Native port for iOS/Android
2. **Peer Learning** — Multiplayer roadmaps with Git contribution tracking
3. **LLM Fine-tuning** — Fine-tune Gemini on career guidance data
4. **Company Partnerships** — Direct job placement integration
5. **Quantitative Trading Module** — Algorithmic trading roadmap with LSTM models
6. **AR/VR Interview Simulation** — Immersive mock interview environment
7. **Blockchain Certificates** — NFT-based skill certificates on completion

---

## 16. CONCLUSION

DEV^A demonstrates the practical application of Reinforcement Learning (LinUCB), NLP (spaCy), and Generative AI (Gemini) in solving a real-world educational problem. The platform successfully combines:

- **Academic rigor** — LinUCB with multi-objective reward, knowledge graph BFS, HMAC cryptography
- **Engineering depth** — 90+ API endpoints, async task processing, WebSocket streaming
- **User experience** — GSAP animations, ReactFlow canvas, gamification, offline-first design
- **Business viability** — Premium tier, PayU payments, salary data, resume tools

The system is production-ready, scalable, and demonstrates mastery of full-stack development, machine learning integration, and modern software engineering practices.

---

*DEV^A v3.0 | Built April 2026 | BTech Final Year Project*  
*React 18 + FastAPI + LinUCB Contextual Bandit + Google Gemini AI*
