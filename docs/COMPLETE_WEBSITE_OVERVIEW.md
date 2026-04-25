# DEVA — Complete Website Description (Pin to Pin)

---

## 1. LANDING / AUTH PAGE — The First Thing Users See

When a user visits the site, they land on the **Authentication Screen**.

**Visual Design:**
- Dark background with an animated gradient
- The logo **"DEV^A"** drops in from the top with an elastic bounce animation (GSAP powered), then gently floats up and down continuously
- Tagline slides in: *"Intelligent Career Development Platform"*
- A theme toggle (light/dark) sits in the top-right corner

**What the user can do:**
- **Sign In** — enter email + password (min 8 chars), click "Sign In"
- **Sign Up** — enter full name, email, password, confirm password, click "Create Account"
- **Demo Login** — one click, creates a demo user locally, skips backend, goes straight to dashboard with a pre-filled Full Stack Developer profile
- Toggle between Sign In / Sign Up with a smooth 3D card-flip animation

**Validation:**
- Email format check
- Password minimum 8 characters
- Passwords must match on signup
- If email already registered during signup → prompts to switch to login
- If login fails with 401 → auto-attempts signup (Magic Auth fallback)
- If backend is completely offline → creates a local account and continues

**After success:** Stores `authToken`, `userId`, `userEmail`, `userName` in localStorage, then moves to the next screen.

**Bottom of auth page shows 3 feature icons:**
- Secure & Private
- Progress Tracking
- AI-Driven Learning

---

## 2. SESSION RESTORE — Returning Users

When a returning user opens the app:
1. App checks `authToken` and `userId` in localStorage
2. Calls `/api/auth/verify` with the token
3. If valid → fetches full profile from `/api/user/profile`
4. If `onboarding_complete = true` AND `target_role` exists → goes straight to **Dashboard**
5. If incomplete → goes to **Onboarding**
6. If backend is down → shows Onboarding for new user flow

---

## 3. ONBOARDING FLOW — New Users (6 Steps)

### Step 0 — Welcome Screen
- Big heading: **"Welcome to DEV^A"**
- Subtitle: *"Your AI-Powered Career Guidance Platform"*
- 3 feature cards: Discover Your Path, Track Progress, Get Personalized
- Big "Get Started" button

---

### Step 1 — Interest Quiz (10 Questions)
A quiz to discover what kind of developer the user is.

**Progress bar** shows how far along they are (Question X of 10).

Each question has 4 options mapping to categories:
- `frontend` — UI, design, browser tools
- `backend` — APIs, databases, server logic
- `data` — ML, analytics, Jupyter
- `devops` — CI/CD, Kubernetes, automation

**Sample questions:**
- "You're starting a new project. What excites you most?"
- "A critical bug appears in production. What's your first instinct?"
- "Which technical challenge sounds most interesting?"
- "What would make you feel most accomplished at end of day?"

After all 10 answers → calculates results automatically.

---

### Step 2 — Quiz Results
- Shows the **recommended role** (e.g., "Frontend Developer")
- Shows a **match score** (e.g., 70%)
- Shows a **breakdown bar chart** of all 4 categories
- If score < 40% → shows a warning suggesting Full Stack or more exploration
- Button: "Choose My Role →"

---

### Step 3 — Role Selection
- Grid of **33 career roles** to choose from, organized by category:
  - Web: Frontend, Backend, Full Stack
  - Data & AI: Data Scientist, ML Engineer, Data Engineer, AI Researcher
  - Infrastructure: DevOps, Cloud Architect, SRE, Platform Engineer
  - Mobile: Mobile, iOS, Android, Desktop
  - Security: Security Engineer, Pentester, QA, SDET
  - Design: UI/UX, Product Designer, Technical PM
  - Specialized: Game Dev, Blockchain, Embedded, AR/VR, Robotics
  - Database: DBA, API Developer, Microservices Architect
  - Emerging: IoT, Quantum Computing, Edge Computing
- The quiz-recommended role is highlighted with a "Recommended" badge
- Button at bottom: "I Need Help Deciding" → goes to Step 4

---

### Step 4 — AI Help (Resume / GitHub)
For users who aren't sure which role to pick.

**Two options:**

**Option A — Upload Resume:**
- Accepts PDF, DOCX, TXT
- Sends to `/resume/upload`
- Backend parses skills, experience, projects using NLP
- Then calls `/ai/suggest-role` to get AI role suggestion
- Shows: skills found, suggested role, confidence %, reasoning
- If backend unavailable → shows error, suggests skipping

**Option B — Connect GitHub:**
- User enters GitHub username
- Sends to `/github/analyze`
- Backend analyzes repositories, languages, contributions
- Then calls `/ai/suggest-role`
- Shows: skills found, activity score, suggested role
- If backend unavailable → shows error, suggests skipping

Both options show:
- AI suggested role with confidence percentage
- Match percentage
- Reasoning bullets (why this role was suggested)
- "Accept Suggestion" or "Choose Manually" buttons

---

### Step 5 — Skills Input
After role is selected:
- User can add their known skills manually
- Or skip this step entirely
- Skills extracted from resume/GitHub are pre-populated if available
- "Complete Setup" button → saves everything and moves on

---

### Onboarding Completion
- Saves profile to localStorage
- Calls `/api/user/complete-onboarding` with target role, skills, learning speed
- Moves to **Skill Assessment Quiz**

---

## 4. SKILL ASSESSMENT QUIZ

A technical quiz that tests the user on their chosen skills.

**How it works:**
1. App determines which skills to test based on the target role (5 skills, role-prioritized)
2. For each skill → tries to fetch questions from `/api/quiz/generate`
3. If backend unavailable → uses a rich local question bank (80+ questions)
4. 4 questions per skill = up to 20 questions total

**Question bank covers:**
Python, JavaScript, SQL, React, Java, Node.js, Docker, Git, Swift, Kotlin, Solidity, Unity, AWS, Kubernetes, Terraform, TypeScript, REST APIs, Machine Learning, and more.

**Question format:**
- Multiple choice (4 options)
- Difficulty: medium or hard
- Shows explanation after answering
- Tracks correct/incorrect per skill

**After completing all questions:**
- Calculates per-skill scores (weighted percentage)
- Assigns skill levels: beginner / intermediate / advanced / expert
- Saves results to backend via `/api/user/quiz/save`

---

## 5. ASSESSMENT COMPLETE SCREEN

A celebration screen with:
- Big 🎉 emoji with pop-in animation
- "Assessment Complete!" heading with gradient text
- Subtitle: *"We've successfully analyzed your skills and forged your personalized dashboard"*
- Two buttons:
  - "Retake Assessment" → goes back to quiz
  - "Launch Dashboard 🚀" → saves onboarding completion and goes to Dashboard

---

## 6. NAVIGATION BAR — Persistent on All Pages

Appears on every page after login.

**Left side:**
- DEVA logo (DEV^A)
- Browser back/forward buttons
- Nav links: Dashboard | Roadmap | Advanced

**Right side:**
- Theme toggle (light/dark)
- User avatar (first letter of name)
- Dropdown menu showing name, email, and Logout button

**On mobile:** Collapses appropriately, nav links hidden during onboarding/assessment.

---

## 7. DASHBOARD — The Main Hub

The central page users spend most time on.

### Welcome Header
- "Welcome back, [Name]! 👋"
- "Your journey to becoming a [Target Role]"
- Button: "🗺️ Continue Roadmap" → opens roadmap.sh for their role

---

### Top Metrics Row

**Learning Streak Card (large):**
- Shows current streak in days (e.g., "7 Days")
- 14-dot calendar showing active days
- Message: "Amazing consistency!" if ≥ 7 days

**4 KPI Mini Cards:**
- Average Skill Score (%)
- Nodes Completed (from roadmap)
- Total XP earned
- Badges Unlocked

---

### Main Content Grid (2/3 left + 1/3 right)

**LEFT COLUMN:**

**Current Role Card:**
- Shows role icon + name (e.g., 🚀 Full Stack Developer)
- "Change Role" button → opens role change modal
- Shows verified skills as pill tags (up to 8, with "+X more")

**Charts Section (2 charts side by side):**
- Doughnut chart: Skill Distribution (Beginner/Intermediate/Advanced/Expert)
- Bar chart: Top Proficiencies (top 6 skills by score)
- Both use Chart.js with dark theme styling

**Recommended Project Card:**
- Role-specific project suggestion
- e.g., for Full Stack: "Develop an end-to-end blog platform with auth, S3 uploads, and real-time commenting"
- "Start Project" and "View Details" buttons

**Action Plan Card:**
- Immediate Actions (This Week): 2 skill-specific tasks with checkboxes
- Short-term Goals (This Month): 4 general goals with checkboxes
  - Complete 3-5 projects
  - Solve 20+ LeetCode problems
  - Read documentation
  - Join developer communities

---

**RIGHT COLUMN (Sidebar):**

**Focus Areas:**
- 3 recommended actions based on weakest skills
- e.g., "Improve React (current: 45%)"

**Daily Developer Tip:**
- Rotates daily (7 tips, one per day of week)
- e.g., "Write code that explains itself. Good variable names are infinitely better than comments."

**Achievements:**
- Shows badge count
- Grid of earned badges (🏅 icons)
- Empty state if no badges yet

**Community Hub:**
- Rotating community highlights (5 messages, changes every 6 days)
- "Join Community →" button

**Advanced Topics Card (gradient glow):**
- "Ready to transcend the basics?"
- "Explore Now" button → navigates to `#advanced-concepts`

---

### Role Change Modal
- Triggered by "Change Role" button
- Animated modal with framer-motion
- Grid of 8 main roles to choose from
- Current role highlighted with "Active" badge
- Selecting a new role resets the learning path

---

## 8. ROADMAP PAGE — Visual Learning Path

Accessed via Navigation → "Roadmap" or `#roadmap` hash.

### Controls Bar (top)
- **Roadmap Selector dropdown** — 17 available roadmaps:
  Frontend, Backend, Full Stack, DevOps, AI/ML, Data Engineer, Mobile, System Design, React, Node.js, Python, Java, Go, Docker, Kubernetes, PostgreSQL, Security Engineer
- **Search bar** — filter nodes by title or description
- **Difficulty filter buttons** — All / Foundation / Beginner / Intermediate / Advanced
- **User stats** — XP and streak shown
- **Role badge** — shows current target role

### Progress Bar
- Shows overall completion percentage for current roadmap
- Animated fill with framer-motion

### Roadmap Canvas (ReactFlow)
- Interactive node-based visual roadmap
- Each node shows:
  - Topic title
  - Description
  - Learning time estimate
  - Difficulty level
  - Resources link
  - Subtopics and tools
  - Completion status
  - "Recommended" highlight
- Nodes connected by edges showing learning order
- Click a node → opens detail panel
- Mark nodes as complete → earns XP and badges
- Drag to pan, scroll to zoom

### If roadmap data unavailable:
- Shows "No roadmap data available" empty state
- Suggests selecting a different path

---

## 9. ADVANCED CONCEPTS PAGE

Accessed via Dashboard sidebar card or `#advanced-concepts` hash.

Contains deep technical content for users ready to go beyond basics:
- System design concepts
- Advanced algorithms
- Architecture patterns
- ML/AI deep dives
- Blog reader modal for reading articles in-app

---

## 10. AI CHAT WIDGET — Always Available

A floating chat widget visible on all pages after login.

- Powered by AI (Gemini/OpenAI integration via `aiClient.js`)
- Users can ask career questions, get skill advice, request explanations
- Persists across page navigation
- Minimizable

---

## 11. LINUCB RECOMMENDATIONS — AI Skill Engine

The core ML feature of DEVA. Uses **LinUCB Reinforcement Learning** (Contextual Bandit algorithm).

**How it works:**
- Takes 11-dimensional user profile as context:
  - Target role, known skills, number of projects, experience years, has GitHub, has portfolio, has certifications, has quantifiable metrics, learning speed
- Recommends top 5 skills to learn next
- Each recommendation shows:
  - Rank (#1, #2, etc.)
  - Skill name + category
  - Expected reward score (%)
  - 4 objective scores: Career Readiness, Time Efficiency, Difficulty Match, Market Demand
  - Learning time (hours) and difficulty (out of 10)
  - "Required" badge if skill is mandatory for the role

**Explanation Modal:**
- Click any recommendation → opens detailed explanation
- Circular score gauge
- Full breakdown of all 5 objectives with weights:
  - Career Readiness: 40%
  - Time Efficiency: 20%
  - Difficulty Match: 20%
  - Market Demand: 15%
  - Prerequisite Fit: 5%
- Skill metadata: learning time, difficulty, category, required status
- "Skip" or "Start Learning" buttons

**Feedback loop:**
- Clicking a skill → sends "clicked" feedback
- Starting learning → sends "started" feedback
- Skipping → sends "skipped" feedback
- Completing → sends "completed" feedback
- Model updates after each interaction → gets smarter over time

**Stats badge:** Shows average reward % from the model.

---

## 12. DEVASQUARE PREMIUM — Upgrade System

### Pro Badge
- Fixed button in top-right corner (only for non-premium users)
- "⭐ Upgrade to DEVAsquare" button
- Clicking opens the Pricing Modal

### Pricing Modal
**Header:** "Elevate Your Professional Trajectory" / "DEVAsquare Premium"

**Billing toggle:** Monthly ($29/month) or Yearly ($249/year — saves 30%, just $20.75/month)

**Features organized in 4 categories:**

**📚 The Intellectual Edge (Learning):**
- Executive Library — curated books on leadership & strategy
- 15-Min Power Summaries — master 300-page books in minutes
- Dynamic Learning Paths — AI suggests next book based on goals

**🎯 The Placement Engine (Growth Tools):**
- Precision Resume Architect — ATS-optimized resume builder
- Virtual Interview Lab — AI feedback on body language & tone
- Skill-Gap Blueprint — map abilities against real job descriptions

**🧭 The Insider Circle (Exclusive):**
- Inner Circle Hub — private webinars with industry titans
- Milestone Dashboard — track certifications & career XP
- Mentor Matchmaker — algorithm-driven networking hub

**✨ Gemini-Infused AI Features:**
- Shadow Mentor AI — real-time AI companion for career guidance
- Salary Heatmaps — live data on hiring trends & salaries
- Portfolio Ghostwriter — document wins for instant resume updates

**Upgrade button** → triggers PayU payment integration

**Footer:** "Cancel anytime • 30-day money-back guarantee • Secure payment"

---

## 13. PAYMENT FLOW — PayU Integration

When user clicks "Upgrade to DEVAsquare Pro":
1. Collects user name, email, phone
2. Calls backend to create payment order
3. Redirects to PayU payment gateway
4. After payment:
   - **Success** → `/payment/success` page → sets `isPro = true` in localStorage
   - **Failure** → `/payment/failure` page → shows error, option to retry

---

## 14. ADVANCED FEATURES PANEL

Available inside the app (AdvancedFeatures component):

**3 tabs:**

**Resume Analysis tab:**
- Upload PDF/DOCX/TXT resume
- Sends to `/resume/upload`
- Shows: skills extracted, total skill count, learning speed
- Displays all extracted skills as tags

**GitHub Analysis tab:**
- Enter GitHub username
- Sends to `/github/analyze`
- Shows: activity score, skills found from repositories
- Displays technical skills as tags

**ML Algorithms tab:**
- 4 algorithm cards to choose from:
  - 🎯 LinUCB — "Recommended" — balances exploration/exploitation
  - 🎲 Thompson Sampling — "Probabilistic" — better for cold-start
  - 🧠 Neural UCB — "Advanced" — handles complex patterns
  - ⚡ Hybrid Bandit — "Best" — ensemble approach
- Clicking any card runs that algorithm and shows recommendation + confidence %

---

## 15. THEME SYSTEM

- Light and Dark mode toggle available on every page
- Persisted in localStorage
- Applied via CSS variables on `document.documentElement`
- Font size also adjustable (Default / Large / Small), cycles on click
- Design system uses CSS variables: `--bg-primary`, `--text-primary`, `--accent-primary`, etc.
- Primary accent color: Amber `#f59e0b`
- Dark background: `#0f172a`
- Font: JetBrains Mono

---

## 16. COMPLETE USER JOURNEY — Start to End

```
Visit Site
    ↓
Auth Page (Login / Signup / Demo)
    ↓
[New User] → Onboarding Flow
    ├── Welcome Screen
    ├── Interest Quiz (10 questions)
    ├── Quiz Results (recommended role)
    ├── Role Selection (33 roles)
    ├── [Optional] AI Help (Resume / GitHub upload)
    └── Skills Input
    ↓
Skill Assessment Quiz (20 questions, 5 skills)
    ↓
Assessment Complete Celebration Screen
    ↓
Dashboard (Main Hub)
    ├── Streak + KPI Stats
    ├── Skill Charts (Doughnut + Bar)
    ├── Recommended Project
    ├── Action Plan (weekly + monthly)
    ├── Focus Areas (weakest skills)
    ├── Daily Tip
    ├── Achievements / Badges
    └── Community Hub
    ↓
[Navigate to] Roadmap Page
    ├── Select from 17 roadmaps
    ├── Search + filter nodes
    ├── Interactive visual roadmap (ReactFlow)
    └── Mark nodes complete → earn XP + badges
    ↓
[Navigate to] Advanced Concepts Page
    └── Deep technical content + blog reader
    ↓
[Floating] AI Chat Widget (always available)
    ↓
[Optional] LinUCB Recommendations
    └── Top 5 AI-recommended skills with explanations
    ↓
[Optional] Upgrade to DEVAsquare Premium
    ├── Pricing Modal (Monthly $29 / Yearly $249)
    ├── PayU Payment Gateway
    └── Premium Features Unlocked
```

---

## 17. TECH STACK SUMMARY

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18, GSAP, Framer Motion, Chart.js, ReactFlow  |
| Styling    | Tailwind CSS + custom CSS variables                 |
| State      | Zustand (roadmap store)                             |
| Backend    | FastAPI (Python)                                    |
| Database   | SQLite (dev) / PostgreSQL (prod)                    |
| ML Engine  | LinUCB Contextual Bandit, Hybrid Ensemble (scikit-learn) |
| NLP        | spaCy (resume parsing)                              |
| Auth       | JWT tokens                                          |
| Payment    | PayU integration                                    |
| AI         | Gemini / OpenAI (chat widget)                       |

---

*Last Updated: April 22, 2026*
*Version: 2.0 — Production Ready*
