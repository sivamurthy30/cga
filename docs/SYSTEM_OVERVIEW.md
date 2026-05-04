# DEVA — Complete System Overview
# Every feature, every file, every line explained

---

## HOW THE APP STARTS

### 1. User opens localhost:3000
- `src/index.js` renders `<ErrorBoundary><App /></ErrorBoundary>`
- `ErrorBoundary` (src/components/common/ErrorBoundary.jsx) catches any crash and shows the "Oops" screen instead of a blank page

### 2. App.js boots up (src/App.js)
- Imports all 30+ components
- Registers GSAP TextPlugin for animated text
- Reads `authToken` from localStorage
- If token exists → calls `fetchUserStatus(token)` → GET /api/user/status
- If no token → shows Auth page
- `fetchUserStatus()` also checks localStorage as fallback if backend is offline
- Based on status returned, routes to one of 4 screens:
  - `onboarding_step_0` → OnboardingFlow
  - `assessment` → SkillAssessmentQuiz
  - `dashboard` → Dashboard
  - No token → Auth

---

## AUTHENTICATION (src/components/auth/Auth.jsx)

### What it does
- Shows login/signup form with cinematic GSAP animations
- 5-stage animation: background fade → logo bounce → tagline slide → form fly-up → fields stagger in

### Sign Up flow
1. User fills name, email, password, confirm password
2. Frontend validates: passwords match, min 8 chars
3. POST /api/auth/signup → backend creates user in MongoDB
4. Backend returns `{ token, user }` (NOT access_token — frontend expects `token`)
5. Frontend stores: `authToken`, `userId`, `userEmail`, `userName` in localStorage
6. Calls `onAuthSuccess(user)` → App.js routes to onboarding

### Sign In flow
1. User fills email + password
2. POST /api/auth/login → backend verifies password with bcrypt
3. If user doesn't exist → auto-creates account (magic auth)
4. Returns `{ token, user }`
5. Same localStorage storage as signup

### Dev Login (pro@deva.dev button)
1. POST /api/auth/dev-login with email=pro@deva.dev
2. Backend auto-creates pro user if not exists with 8 skills
3. Returns token with is_pro=true
4. Skips onboarding → goes straight to dashboard

### Offline mode
- If fetch throws (backend down) → creates `local-token-{timestamp}`
- Stores fake user in localStorage
- App works fully offline with localStorage data

---

## BACKEND AUTH (backend/app/routes/auth.py + services/auth_service.py)

### POST /api/auth/login
- Finds user by email in MongoDB `users` collection
- If not found → creates new user (auto-signup)
- Verifies password with `passlib.bcrypt`
- Creates JWT: `create_access_token({user_id, email})` — 30 day expiry
- Returns `{ token, user }` (token = access_token)

### POST /api/auth/signup
- Checks if email already exists → 400 if yes
- Hashes password with bcrypt
- Inserts into MongoDB `users` collection
- Returns JWT + user data

### POST /api/auth/dev-login
- Only works for pro@deva.dev
- Auto-seeds user with 8 skills if not exists
- Returns is_pro=true in user object

### OTP routes (send-otp-signup, verify-otp-signup, etc.)
- Alternative auth flow using email OTP
- OTP stored in `otp_records` collection with 10-min TTL
- Sends email via `send_otp_email()` utility
- On verify → creates user + returns JWT

### JWT Security (backend/app/utils/security.py)
- `create_access_token()` — signs with SECRET_KEY, HS256, 30 day expiry
- `create_refresh_token()` — 7 day expiry
- `decode_token()` — verifies signature + expiry
- `hash_password()` — bcrypt with auto-generated salt
- `verify_password()` — bcrypt compare

---

## MONGODB DATABASE (backend/app/database/mongo.py)

### Connection
- Motor (async MongoDB driver) connects to Atlas on startup
- `init_mongo()` called in FastAPI lifespan → pings Atlas → creates indexes
- `close_mongo()` called on shutdown

### Collections

**users**
- `_id` (ObjectId), `email` (unique), `name`, `password_hash`
- `target_role`, `learning_speed` (slow/medium/fast)
- `onboarding_complete` (bool), `is_pro` (bool)
- `created_at`, `last_login`

**user_skills**
- `user_id`, `skill` (e.g. "React"), `proficiency` (beginner/intermediate/advanced/expert)
- `added_at`

**quiz_results**
- `user_id`, `quiz_type` (skill_assessment), `score`, `total_questions`
- `category` (target role), `results_data` (full JSON of per-skill scores)
- `created_at`

**roadmap_progress**
- `user_id`, `roadmap_id` (e.g. "frontend-developer"), `node_id` (e.g. "react")
- `completed` (bool), `completed_at`, `xp_earned` (10 per node)

**user_stats**
- `user_id` (unique), `total_xp`, `streak` (days), `badges` (array)
- `last_completed_date` (YYYY-MM-DD)

**otp_records**
- `email`, `otp` (6-digit), `otp_type` (signup/login)
- `verified` (bool), `expires_at` (TTL index — auto-deleted after expiry)
- `temp_name`, `temp_phone`, `temp_password_hash` (for signup OTP)

### Indexes
- `users.email` — unique, fast lookup
- `otp_records.expires_at` — TTL, auto-deletes expired OTPs
- `roadmap_progress` — compound (user_id + roadmap_id + node_id)
- `user_stats.user_id` — unique

---

## ONBOARDING (src/components/onboarding/OnboardingFlow.jsx)

### 10-step flow
1. Welcome screen
2. Role selection (30+ roles with icons)
3. Resume upload (optional) → POST /api/resume/upload → extracts skills
4. GitHub analysis (optional) → POST /api/github/analyze → extracts skills
5. Learning speed selection (slow/medium/fast)
6. Interest quiz (10 questions)
7. Skill self-assessment
8. Goal setting
9. Summary review
10. Complete → POST /api/user/complete-onboarding

### Resume upload (step 3)
- Sends file to POST /api/resume/upload
- Backend parses PDF/DOCX with pdfplumber/python-docx
- Extracts skills from 50+ skill pool using text matching
- Suggests role based on skill frequency
- Returns: `{ skills_found, suggested_role, confidence, experience_years }`

### GitHub analysis (step 4)
- Sends username to POST /api/github/analyze
- Backend calls GitHub API to get repos
- Extracts languages and frameworks from repo data
- Returns skill list

### On complete
- Saves profile to localStorage: `onboardingComplete=true`, `learnerProfile={...}`
- POST /api/user/complete-onboarding with target_role, known_skills, learning_speed
- Transitions to SkillAssessmentQuiz

---

## SKILL ASSESSMENT (src/components/assessment/SkillAssessmentQuiz.jsx)

### How it works
- Gets list of skills from learner profile (role-specific, 5 skills)
- For each skill: fetches questions from POST /api/quiz/generate (returns empty → uses local bank)
- Local question bank has 4 questions per skill (Python, JavaScript, React, etc.)
- Adaptive difficulty: 2 medium correct in <30s → forces next 2 to be hard
- Tracks: time per question, difficulty path, correct/incorrect

### Scoring
- Per skill: `{ correct, total, weightedPercentage, level }`
- Level assigned: <40% = beginner, 40-60% = intermediate, 60-80% = advanced, 80%+ = expert
- Results saved to localStorage + POST /api/user/quiz/save

### After quiz
- Shows celebration screen
- "Launch Dashboard" → sets `assessmentComplete=true` in localStorage
- POST /api/user/complete-onboarding to sync to backend
- Transitions to Dashboard

---

## DASHBOARD (src/pages/Dashboard.jsx)

### What renders
- Navigation bar at top
- Welcome header: "Welcome back, [name]! Working towards [role]"
- "Continue Roadmap" button → navigates to #roadmap
- Streak showcase: 14-day dot calendar, streak count
- KPI mini-cards: Avg Skill Score %, Nodes Completed, Total XP, Badges
- Skill distribution: Doughnut chart (beginner/intermediate/advanced/expert counts)
- Top proficiencies: Bar chart of per-skill scores
- Premium features grid: 8 clickable cards
- Recommended project card (role-specific)
- Action plan: immediate + short-term goals
- Focus areas sidebar
- Daily tip
- Achievements section
- Community section

### Data sources
- `learnerProfile` prop → assessment results, target role
- `useRoadmapStore()` → totalXP, streak, badges, completedNodes
- `completedInCurrentRoadmap` = `completedNodes[currentRoadmap]?.size`

### Feature card navigation
- Each card calls `navigateTo(hash)` → sets window.location.hash
- App.js `handleHashChange()` listens → sets `activePage` state
- App.js renders the correct feature component

---

## HASH ROUTING (src/App.js — handleHashChange)

### How navigation works
- No React Router — uses window.location.hash
- `useEffect` listens to `hashchange` event
- Only fires when `showRoadmap=true` (user is authenticated + onboarded)

### Routes
- `#dashboard` → clears all, shows Dashboard
- `#roadmap` → `setShowRoadmapCanvas(true)` → RoadmapPage
- `#advanced-concepts` → `setShowAdvancedConcepts(true)` → AdvancedConceptsPage
- `#code-review` → `setActivePage('code-review')` → GhostHunterReviewer
- `#pitch-perfect` → `setActivePage('pitch-perfect')` → PitchPerfect
- `#salary-heatmap` → `setActivePage('salary-heatmap')` → SalaryHeatmap
- `#executive-vault` → `setActivePage('executive-vault')` → ExecutiveVault
- `#resume-builder` → `setActivePage('resume-builder')` → ResumeBuilder
- `#daily-challenge` → `setActivePage('daily-challenge')` → DailyChallenge
- `#interview-prep` → `setActivePage('interview-prep')` → InterviewPrep

---

## ROADMAP SYSTEM

### Frontend Store (src/store/roadmapStore.js — Zustand)
- `completedNodes: {}` — `{ "frontend-developer": Set(["html", "css", "react"]) }`
- `totalXP: 0` — increases by 10 per completed node
- `streak: 0` — days in a row with at least 1 completion
- `badges: []` — earned at XP milestones (50, 100, 250, 500 XP)
- `currentRoadmap: "frontend-developer"` — active roadmap ID

### completeNode(roadmapId, nodeId)
1. Adds nodeId to `completedNodes[roadmapId]` Set
2. `newXP = totalXP + 10`
3. Checks streak: if last completion was yesterday → streak+1, else reset to 1
4. Calls `checkBadges()` → awards badges at XP milestones
5. Calls `syncNodeToBackend()` → POST /api/user/roadmap/progress
6. Calls `syncStatsToBackend()` → POST /api/user/stats

### Persistence
- Zustand `persist` middleware → saves to localStorage automatically
- On login, `loadFromDB()` called → GET /api/user/profile → restores from MongoDB

### RoadmapPage (src/pages/RoadmapPage.jsx)
- Fetches roadmap list: GET /api/roadmap/list
- Fetches selected roadmap: GET /api/roadmap/{id}
- Fetches market trends: GET /api/market/trending
- Renders nodes with level colors, trend badges, salary premiums
- Checkbox click → `completeNode()` or `uncompleteNode()`
- Progress bar = completed / total nodes

### RoadmapCanvas (src/components/roadmap/RoadmapCanvas.jsx)
- Uses React Flow for interactive graph
- Nodes re-render when `completedNodes` changes (dependency array fix)
- `isCompleted` passed as node data → changes node color/style
- MiniMap shows green for completed, amber for recommended

### Backend Roadmaps (backend/app/routes/features.py)
- 5 full roadmaps: frontend-developer, backend-developer, fullstack-developer, devops-engineer, ai-ml-engineer
- Each has nodes (id, title, description, level, position) + edges (source, target)
- `GET /api/roadmap/{id}` transforms nodes into React Flow format

---

## PREMIUM FEATURES

### Code Reviewer — GhostHunterReviewer (src/components/features/GhostHunterReviewer.jsx)
- User pastes code + selects language
- POST /api/code/review
- Backend `_analyze_code()`:
  - Detects nested loops → O(n²) warning
  - Finds magic numbers → style issue
  - Checks for missing docstrings (Python)
  - Calculates complexity: O(1)/O(n)/O(n²)/O(n log n)
  - Returns: `{ overall_score, complexity, issues[], summary }`
- Frontend shows score, complexity badge, issue list with suggestions

### Pitch Perfect (src/components/features/PitchPerfect.jsx)
- Records audio via MediaRecorder API (browser)
- Sends audio blob to POST /api/pitch/analyze
- Backend returns: `{ overall_grade, confidence_score, clarity_score, wpm, filler_count, strengths[], improvements[] }`
- Frontend shows grade card, metrics, transcript preview, feedback

### Salary Heatmap (src/components/features/SalaryHeatmap.jsx)
- GET /api/salary/heatmap?role={targetRole}
- Backend has salary data for 8 roles × 9 cities
- Returns: min/median/max salary per city, YoY change, top skills premium
- Frontend renders city cards with salary ranges

### Executive Vault (src/components/premium/ExecutiveVault.jsx)
- GET /api/vault/books → 8 curated books
- GET /api/vault/books/{id}/summary → key takeaways + career impact
- POST /api/vault/resume/tailor → ATS score + tailored bullets + keywords added

### Resume Builder (src/components/features/ResumeBuilder.jsx)
- User fills form: name, role, skills, experience, projects
- POST /api/resume/transform → ATS-optimized version
- PDF export via browser print API
- Skill suggestions based on target role

### Daily Challenge (src/components/features/DailyChallenge.jsx)
- 60 coding problems stored locally
- Difficulty: Easy/Medium/Hard
- XP rewards: Easy=10, Medium=25, Hard=50
- Streak tracking per day
- Code editor with syntax highlighting

### Interview Prep (src/components/features/InterviewPrep.jsx)
- Flash cards for target role
- Categories: Technical, Behavioral, System Design
- Flip animation on card click
- Progress tracking per category

### Deep Work Player (src/components/features/DeepWorkPlayer.jsx)
- Floating widget (bottom-right, 🎧 icon)
- 3 ambient tracks (Lo-Fi, Deep Focus, Midnight Coding)
- Pomodoro timer: 25 min work / 5 min break
- Volume control slider
- Session counter
- Syncs with roadmap: auto-increments session when node completed

---

## AI CHAT SYSTEM

### Frontend (src/utils/aiClient.js)
- `SESSION_ID` — random ID stored in sessionStorage, persists per browser tab
- `getProfile()` — reads learnerProfile from localStorage
- `getAIResponse({ question })`:
  1. Reads user profile (targetRole, knownSkills)
  2. POST /api/chat with `{ message, session_id, profile }`
  3. If backend fails → falls back to LOCAL_KB (10 regex patterns)
  4. Returns response string

### Local fallback KB
- 10 patterns: greeting, thanks, react, python, DSA, roadmap, career, resume, jobs, motivation, non-CS
- Each pattern is a regex + response function
- Response functions receive `profile` → personalize based on targetRole

### Backend Chat (backend/app/routes/chat.py)
- `POST /api/chat` receives `{ message, session_id, profile }`
- Loads/creates session context in `_sessions` dict (in-memory)
- `_update_context()` extracts: year (1st/2nd/3rd/4th/fresher), background (CSE/ECE/Mechanical), goal (job/higher_studies/startup)
- Calls `classify_intent(message, ctx)` → returns intent string
- Calls `find_best_match(message, intent, ctx, KNOWLEDGE_BASE)` → returns response
- Stores in session history (last 20 messages)

### Intent Engine (backend/app/ai/intent_engine.py)
- `classify_intent()` — tries 19 regex patterns in order, returns first match
- 19 intents: greeting, thanks, career_options, higher_studies, learn_coding, dsa, resume, projects, jobs_internships, web_dev, ai_ml, soft_skills, productivity, exam_study, career_switch, skill_gap, roadmap_request, tech_question, general

### Semantic Matching (TF-IDF cosine similarity)
- `_tokenize()` — extracts words 2+ chars, lowercase
- `_tfidf_vector()` — TF × IDF weight per token
- `_build_idf()` — log(N / (1 + df)) for each token across all chunks
- `_cosine()` — dot product / (mag1 × mag2)
- `find_best_match()`:
  1. Filters chunks by intent
  2. Builds IDF from filtered chunks
  3. Vectorizes query
  4. Scores each chunk
  5. Returns highest scoring chunk's response
  6. Calls `_personalize()` to inject year/background prefix

### Knowledge Base (backend/app/ai/)
- `kb_career.py` — 6 chunks: career options, high-paying careers, IT career 2026, career confusion, career switch, wasted years, higher studies
- `kb_coding.py` — 8 chunks: start coding, Python vs Java, learning timeline, DSA prep, time complexity, LeetCode strategy, web dev explained, AI/ML roadmap
- `kb_jobs.py` — 9 chunks: resume building, fresher resume, project ideas, getting first job, internships, salary negotiation, communication skills, productivity, skill gap analysis
- Total: 23 chunks, each with `intents[]`, `tags[]`, `content` (for matching), `response` (formatted answer)

---

## STATE MANAGEMENT FLOW

### App-level state (src/App.js useState)
- `isAuthenticated` — bool, controls auth gate
- `currentUser` — `{ id, name, email, target_role }`
- `learnerProfile` — `{ targetRole, knownSkills, learningSpeed, assessmentResults }`
- `showOnboarding / showAssessment / showRoadmap` — which screen to show
- `showRoadmapCanvas / showAdvancedConcepts` — sub-screens
- `activePage` — which premium feature is active
- `theme` — 'light' or 'dark'
- `isPro` — bool, controls premium access
- `showPricingModal` — upgrade modal visibility
- `appLoading` — shows SplashScreen while restoring session

### Zustand store (src/store/roadmapStore.js)
- Persisted to localStorage via `persist` middleware
- Shared across all components via `useRoadmapStore()` hook
- Dashboard reads: `totalXP, streak, badges, completedNodes, currentRoadmap`
- RoadmapCanvas reads: `completedNodes` (triggers re-render on change)
- DeepWorkPlayer reads: `completedNodes, currentRoadmap` (syncs sessions)

---

## NAVIGATION COMPONENT (src/components/common/Navigation.jsx)

### What it renders
- Left: Logo "DEV^A", back/forward browser buttons, nav links (Dashboard/Roadmap/Advanced)
- Right: Theme toggle, user avatar button → dropdown menu
- Dropdown: user name, email, logout button

### Props
- `currentPage` — highlights active nav link
- `showBackButton` — shows "← Back" button (used on feature pages)
- `onBack` — callback for back button
- `onLogout` — clears localStorage + resets App state

### Styling
- `position: sticky; top: 0` — stays at top while scrolling
- `height: var(--nav-height)` = 64px (defined in Layout.css)
- `backdrop-filter: blur(12px)` — frosted glass effect

---

## THEME SYSTEM (src/styles/DesignSystem.css)

### CSS Variables
- Light mode (default): white backgrounds, dark text, blue accent
- Dark mode: `[data-theme='dark']` — slate backgrounds, light text, blue accent
- `--nav-height: 64px` — used for sticky nav clearance
- `--accent-primary` — main brand color (blue)
- `--bg-card, --bg-primary, --bg-secondary` — layered backgrounds
- `--border-primary` — subtle borders
- `--shadow-sm/md/lg` — elevation system

### Theme toggle
- `ThemeToggle.jsx` calls `toggleTheme()` in App.js
- App.js sets `document.documentElement.setAttribute('data-theme', theme)`
- Saves to localStorage

---

## PAYMENT SYSTEM (src/utils/payuIntegration.js)

### Flow
1. User clicks "Upgrade to Pro" → `setShowPricingModal(true)`
2. PricingModal shows monthly/annual plans
3. User selects plan → `handleUpgrade(planDetails)`
4. App.js calls `initiatePayUPayment(planDetails, userDetails)`
5. PayU redirects to payment page
6. On success → PaymentSuccess.jsx → verifies payment → sets `isPro=true`
7. On failure → PaymentFailure.jsx

---

## COMMAND PALETTE (src/components/common/CommandPalette.jsx)

- Opens with Cmd/Ctrl + K
- Search through all features
- Quick navigation to any page
- Theme toggle shortcut
- Logout shortcut

---

## HACKER CONSOLE (src/components/features/HackerConsole.jsx)

- Terminal-style floating widget
- Commands: `help`, `status`, `roadmap`, `xp`, `skills`, `clear`
- Reads from roadmapStore for live data
- Keyboard shortcut to open/close

---

## BACKEND STARTUP (backend/app/main.py)

### Lifespan
1. `init_mongo()` → ping Atlas → create indexes → log success/failure
2. App serves requests
3. On shutdown: `close_mongo()` → clean disconnect

### Middleware
- CORS: allows localhost:3000 (frontend)
- Request timing: adds `X-Process-Time` header to every response
- Rate limiting via slowapi

### Route mounting
- `/api/auth/*` → auth.router
- `/api/user/*` → user.router
- `/api/*` → features.router (roadmaps, code review, salary, etc.)
- `/api/*` → ml.router (recommendations, resume transform)
- `/api/chat` → chat.router

### Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## DEVELOPMENT MODE (src/App.js)

### FORCE_DEV flag
- `process.NODE_ENV === 'development'` → `ENABLE_DEV = true`
- Pre-fills: `isAuthenticated=true`, `showRoadmap=true`
- Mock learnerProfile: Full Stack Developer, 3 skills
- Skips auth + onboarding → goes straight to dashboard
- Green "🔧 DEV MODE" badge in top-right corner of Dashboard

---

## FILE STRUCTURE SUMMARY

```
cga/
├── src/                          # React frontend
│   ├── App.js                    # Root: routing, auth, state
│   ├── index.js                  # Entry point + ErrorBoundary
│   ├── components/
│   │   ├── auth/Auth.jsx         # Login/signup with GSAP
│   │   ├── onboarding/OnboardingFlow.jsx  # 10-step onboarding
│   │   ├── assessment/SkillAssessmentQuiz.jsx  # Adaptive quiz
│   │   ├── common/               # Navigation, CommandPalette, etc.
│   │   ├── roadmap/              # RoadmapCanvas, RoadmapNode, etc.
│   │   ├── features/             # DeepWork, CodeReview, Resume, etc.
│   │   ├── premium/              # ExecutiveVault, PricingModal
│   │   └── ai/                   # AIChatWidget, ChatWindow
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── RoadmapPage.jsx       # Interactive roadmap
│   │   └── AdvancedConceptsPage.jsx
│   ├── store/roadmapStore.js     # Zustand: XP, streak, progress
│   ├── utils/
│   │   ├── aiClient.js           # Chat: backend call + local fallback
│   │   └── payuIntegration.js    # Payment
│   └── styles/
│       ├── DesignSystem.css      # CSS variables, themes
│       ├── Layout.css            # Nav height, page layout
│       └── *.css                 # Component styles
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI app, lifespan, middleware
│   │   ├── config.py             # Settings from .env
│   │   ├── routes/
│   │   │   ├── auth.py           # /api/auth/* (login, signup, OTP)
│   │   │   ├── user.py           # /api/user/* (profile, progress, stats)
│   │   │   ├── features.py       # /api/* (roadmaps, code review, salary)
│   │   │   ├── ml.py             # /api/* (recommendations, resume)
│   │   │   └── chat.py           # /api/chat (AI chatbot)
│   │   ├── services/
│   │   │   ├── auth_service.py   # OTP logic, user creation
│   │   │   └── user_service.py   # Profile, skills, progress CRUD
│   │   ├── database/
│   │   │   └── mongo.py          # Motor client, collections, indexes
│   │   ├── ai/
│   │   │   ├── intent_engine.py  # Regex intent + TF-IDF cosine match
│   │   │   ├── knowledge_base.py # Assembled KB
│   │   │   ├── kb_career.py      # Career guidance chunks
│   │   │   ├── kb_coding.py      # Coding/DSA chunks
│   │   │   └── kb_jobs.py        # Jobs/resume chunks
│   │   ├── models/               # Pydantic request/response schemas
│   │   └── utils/
│   │       ├── security.py       # JWT, bcrypt
│   │       └── dependencies.py   # get_current_user dependency
│   ├── requirements.txt
│   └── run.sh                    # Starts uvicorn with venv
│
├── .env                          # MongoDB URL, JWT secret, API keys
└── docs/
    └── SYSTEM_OVERVIEW.md        # This file
```

---

## QUICK REFERENCE — API ENDPOINTS

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | /api/auth/login | Email+password login |
| POST | /api/auth/signup | Create account |
| POST | /api/auth/dev-login | Dev bypass (pro@deva.dev) |
| GET | /api/user/status | Get routing status |
| GET | /api/user/profile | Full profile + skills + progress |
| POST | /api/user/complete-onboarding | Save onboarding data |
| POST | /api/user/quiz/save | Save assessment results |
| POST | /api/user/roadmap/progress | Mark node complete/incomplete |
| POST | /api/user/stats | Update XP/streak/badges |
| GET | /api/roadmap/list | All available roadmaps |
| GET | /api/roadmap/{id} | Roadmap nodes + edges |
| GET | /api/market/trending | Hot/rising/stable skills |
| POST | /api/code/review | Analyze code quality |
| POST | /api/pitch/analyze | Analyze audio pitch |
| GET | /api/salary/heatmap | Salary by city + role |
| GET | /api/vault/books | Book library |
| POST | /api/vault/resume/tailor | ATS-optimize resume |
| POST | /api/resume/upload | Parse resume file |
| POST | /api/chat | AI career chatbot |
| POST | /api/github/analyze | Analyze GitHub profile |
