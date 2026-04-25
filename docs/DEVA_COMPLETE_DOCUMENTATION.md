# DEV^A — Complete Platform Documentation
# Version 3.0 | April 2026
# Full UI + Feature Reference from Start to End

---

## DESIGN SYSTEM — Global Visual Language

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#000000` | Page backgrounds |
| `--bg-secondary` | `#0a0a0a` | Section backgrounds |
| `--bg-card` | `#0a0a0a` | Cards, panels, modals |
| `--bg-hover` | `#1a1a1a` | Hover states |
| `--text-primary` | `#ffffff` | Headings, body text |
| `--text-secondary` | `#e0e0e0` | Subtitles, labels |
| `--text-muted` | `#a0a0a0` | Placeholders, hints |
| `--accent-primary` | `#ffffff` | Primary buttons |
| `--accent-amber` | `#f59e0b` | Highlights, XP, scores |
| `--accent-success` | `#34d399` | Completed states |
| `--accent-error` | `#f87171` | Errors, warnings |
| `--border-primary` | `#2a2a2a` | Card borders |

### Typography
- **Font**: JetBrains Mono (monospace) — loaded from Google Fonts
- **Base size**: 1.25rem (20px)
- **Line height**: 1.8
- **Headings**: Bold 700–800 weight
- **Scale**: xs → sm → base → lg → xl → 2xl → 3xl → 4xl → 5xl

### Spacing Scale
- xs: 0.25rem | sm: 0.5rem | md: 1rem | lg: 1.5rem | xl: 2rem | 2xl: 3rem

### Border Radius
- sm: 6px | md: 8px | lg: 12px | xl: 16px | 2xl: 24px | full: 9999px

### Animations
- **GSAP**: Entrance animations, elastic bounces, floating logo
- **Framer Motion**: Page transitions, modal open/close, card reveals
- **CSS**: Shimmer, pulse, spin, gradient flow keyframes
- **Transition speed**: fast 150ms | base 300ms | slow 500ms

### Theme Modes
- **Void Black** (default + dark): Pure `#000000` background, white text
- **Arctic Light**: Light backgrounds, dark text
- Toggled via the pill switch in the Navigation bar
- Persisted in `localStorage` under key `theme`
- Applied as `data-theme="dark"` or `data-theme="light"` on `<html>`

---

## SCREEN 1 — AUTH PAGE (Landing)

### What the user sees first

```
┌─────────────────────────────────────────────────────────┐
│                                          [☀/🌙 Toggle]  │
│                                                          │
│              ╔═══════════════╗                           │
│              ║   DEV^A       ║  ← elastic bounce in     │
│              ╚═══════════════╝     from top, then floats │
│                                                          │
│     "Intelligent Career Development Platform"            │
│      ← slides in with letter-spacing animation           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Sign In]          [Sign Up]                    │   │
│  │  ─────────────────────────────────────────────   │   │
│  │  Email: ________________________________         │   │
│  │  Password: _____________________________         │   │
│  │                                                  │   │
│  │  [         Sign In          ]  ← white button    │   │
│  │                                                  │   │
│  │  ──────────── or ────────────                    │   │
│  │                                                  │   │
│  │  [    ⚡ Demo Login (No signup needed)    ]       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│   🔒 Secure    📊 Progress    🤖 AI-Driven               │
└─────────────────────────────────────────────────────────┘
```

### UI Details
- **Background**: Pure black `#000000` with subtle animated gradient overlay
- **Logo "DEV^A"**: 5rem bold white text, `^A` superscript in amber `#f59e0b`
  - Drops from y:-80 with elastic.out(1, 0.5) GSAP animation
  - Continuously floats: y:-5px → y:0 on 2.5s sine.inOut loop
- **Tagline**: Slides up from y:15, letter-spacing collapses from 8px → 1px
- **Form card**: Flies up from y:60 with blur-to-sharp effect (filter: blur(8px) → 0)
- **Form groups**: Stagger in from alternating left/right sides
- **Buttons**: Scale pop from 0.8 → 1 with back.out(2) easing
- **Toggle**: Sign In ↔ Sign Up with 3D card-flip animation (rotateY 180°)

### Sign In Form
- Email field: dark input `#0a0a0a`, white text, amber focus ring
- Password field: same styling, min 8 characters enforced
- "Sign In" button: white background, black text, full width
- Error states: red border + error message below field

### Sign Up Form
- Full Name, Email, Password, Confirm Password
- Real-time validation: passwords must match
- "Create Account" button: same white style

### Demo Login
- Amber gradient button `#f59e0b → #d97706`
- Bypasses backend entirely
- Creates local profile: Full Stack Developer, demo skills pre-filled
- Goes straight to Dashboard

### Auth Logic
1. Submit → POST `/api/auth/login` or `/api/auth/signup`
2. Success → store `authToken`, `userId`, `userEmail`, `userName` in localStorage
3. 401 on login → auto-attempt signup (Magic Auth)
4. Backend offline → create local account, continue offline
5. Token stored → call `/api/auth/verify` on next visit

### Bottom Feature Icons
Three icons in a row at the bottom of the card:
- 🔒 **Secure & Private** — JWT auth, bcrypt passwords
- 📊 **Progress Tracking** — XP, streaks, badges
- 🤖 **AI-Driven Learning** — LinUCB recommendations

---

## SCREEN 2 — NAVIGATION BAR (Persistent)

Appears on every page after login. Sticky at top, z-index 200.

```
┌─────────────────────────────────────────────────────────────┐
│ DEV^A  [←][→]  [Dashboard] [Roadmap] [Advanced]    [☀🌙] [U▾]│
└─────────────────────────────────────────────────────────────┘
```

### UI Details
- **Background**: `var(--bg-card)` = `#0a0a0a` with `backdrop-filter: blur(10px)`
- **Border bottom**: 1px solid `#2a2a2a`
- **Height**: ~64px, padding 1rem 2rem

### Left Section
- **DEV^A logo**: 1.5rem bold, amber superscript, hover → amber color
- **Browser controls**: Back `←` and Forward `→` buttons
  - 32×32px, transparent background, `#2a2a2a` border, rounded-md
  - Hover: `#1a1a1a` background
- **Nav links** (hidden during onboarding/assessment):
  - Dashboard | Roadmap | Advanced
  - Each: transparent bg, `#e0e0e0` text, rounded-md
  - Active: amber background tint, white text
  - Hover: `#1a1a1a` background

### Right Section
- **Theme Toggle**: Pill-shaped 70×36px switch
  - Light mode: amber gradient track `#fbbf24 → #f59e0b`, sun icon ☀️ on left
  - Dark mode: dark track `#1e293b → #0f172a`, moon icon 🌙 on right
  - Thumb slides with cubic-bezier(0.4, 0, 0.2, 1) transition
- **User Avatar**: Circle with first letter of name, amber background
  - Click → dropdown menu slides down with AnimatePresence
  - Dropdown shows: full name, email, Logout button

### Dropdown Menu
```
┌──────────────────┐
│ Shiva Kumar      │
│ shiva@email.com  │
│ ──────────────── │
│ 🚪 Logout        │
└──────────────────┘
```
- Background: `#0a0a0a`, border `#2a2a2a`, border-radius 12px
- Logout: red text on hover, calls `/api/auth/logout` then clears localStorage

---

## SCREEN 3 — ONBOARDING FLOW (New Users Only)

6-step wizard. Progress saved at each step.

---

### Step 0 — Welcome Screen

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│              Welcome to DEV^A                            │
│     Your AI-Powered Career Guidance Platform             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │🎯 Discover│  │📊 Track  │  │🤖 Get    │              │
│  │Your Path  │  │Progress  │  │Personalized│            │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│           [    Get Started →    ]                        │
└─────────────────────────────────────────────────────────┘
```

- Full-screen dark background
- 3 feature cards with icons, titles, descriptions
- Cards animate in with stagger (slideUp + fade)
- "Get Started" button: amber gradient, full-width on mobile

---

### Step 1 — Interest Quiz (10 Questions)

```
┌─────────────────────────────────────────────────────────┐
│  Question 3 of 10                    ████████░░░░  30%  │
│                                                          │
│  "Which technical challenge sounds most interesting?"    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🎨 Making a website load in under 1 second       │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ⚙️  Handling 10,000 concurrent API requests      │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🤖 Building a recommendation system              │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🔧 Deploying updates to 100 servers              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

- **Progress bar**: amber fill, animates with each answer
- **Question card**: dark card, large text, centered
- **Option buttons**: full-width, dark bg, white border, hover → amber tint
- Clicking an option immediately advances to next question (no confirm needed)
- 10 questions total, each maps to: frontend / backend / data / devops
- Auto-calculates results after question 10

---

### Step 2 — Quiz Results

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│   Your Recommended Role:                                 │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  🎨  Frontend Developer          Match: 70%      │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│   Breakdown:                                             │
│   Frontend  ████████████████████  70%                   │
│   Backend   ████████░░░░░░░░░░░░  30%                   │
│   Data      ████░░░░░░░░░░░░░░░░  20%                   │
│   DevOps    ██░░░░░░░░░░░░░░░░░░  10%                   │
│                                                          │
│   [  Choose My Role →  ]                                 │
└─────────────────────────────────────────────────────────┘
```

- Role card: amber border glow, role icon + name + match %
- Bar chart: colored bars (amber, blue, green, purple) with percentages
- If match < 40%: yellow warning banner "Consider exploring Full Stack"
- Framer Motion: card slides up, bars animate width from 0

---

### Step 3 — Role Selection (33 Roles)

```
┌─────────────────────────────────────────────────────────┐
│  Choose Your Career Path                                  │
│                                                          │
│  Web Development                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │🎨Frontend│ │⚙️ Backend │ │🚀FullStack│ ← RECOMMENDED │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  Data & AI                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │📊 Data   │ │🤖 ML Eng │ │📈 Data   │ │🔬 AI Res │  │
│  │Scientist │ │          │ │Engineer  │ │earcher   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  [  I Need Help Deciding  ]                              │
└─────────────────────────────────────────────────────────┘
```

- **33 roles** in 9 categories: Web, Data & AI, Infrastructure, Mobile, Security, Design, Specialized, Database, Emerging
- Recommended role has amber "Recommended" badge + glowing border
- Selected role: amber fill background
- Cards: 120×120px, icon + name, hover scale(1.05)
- "I Need Help Deciding" → goes to Step 4 (AI Help)

---

### Step 4 — AI Help (Resume / GitHub)

```
┌─────────────────────────────────────────────────────────┐
│  Let AI Analyze Your Background                          │
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  📄 Upload Resume    │  │  🐙 Connect GitHub   │    │
│  │                      │  │                      │    │
│  │  PDF, DOCX, TXT      │  │  Enter username      │    │
│  │  [  Choose File  ]   │  │  [________________]  │    │
│  │                      │  │  [  Analyze  ]       │    │
│  └──────────────────────┘  └──────────────────────┘    │
│                                                          │
│  ── After Analysis ──                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AI Suggests: Full Stack Developer  (82% match)  │   │
│  │  Skills found: React, Node.js, PostgreSQL, Git   │   │
│  │  Reasoning: Strong frontend + backend experience │   │
│  │                                                  │   │
│  │  [Accept Suggestion]    [Choose Manually]        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

- Two side-by-side option cards
- Resume upload: drag-and-drop zone, file type validation
- GitHub: text input for username, calls `/github/analyze`
- Results card: slides in with Framer Motion after analysis
- Loading state: spinning amber circle with "Analyzing..." text

---

### Step 5 — Skills Input

```
┌─────────────────────────────────────────────────────────┐
│  What skills do you already know?                        │
│                                                          │
│  [  Add a skill...  ] [+ Add]                           │
│                                                          │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐       │
│  │ React ✕│ │JavaScript✕│ │ SQL  ✕ │ │ Docker ✕ │       │
│  └────────┘ └──────────┘ └────────┘ └──────────┘       │
│                                                          │
│  (Pre-populated from resume/GitHub if available)         │
│                                                          │
│  [  Skip  ]              [  Complete Setup →  ]          │
└─────────────────────────────────────────────────────────┘
```

- Skill tags: amber-tinted pills with ✕ remove button
- Input: type skill name + Enter or click Add
- Pre-populated from resume/GitHub analysis
- "Skip" → proceeds without skills
- "Complete Setup" → saves to backend, moves to Skill Assessment

---

## SCREEN 4 — SKILL ASSESSMENT QUIZ

Technical quiz testing the user on 5 role-specific skills, 4 questions each = 20 total.

```
┌─────────────────────────────────────────────────────────┐
│  Skill Assessment Quiz                                   │
│  Testing: React                                          │
│  ████████████████░░░░░░░░░░░░░░  Question 9 of 20       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MEDIUM                                          │   │
│  │                                                  │   │
│  │  What is the purpose of React.memo()?            │   │
│  │                                                  │   │
│  │  A  Prevents re-renders if props unchanged       │   │
│  │  B  Stores component state in memory             │   │
│  │  C  Caches API responses                         │   │
│  │  D  Optimizes bundle size                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Dynamic Difficulty System
- Starts at Medium difficulty
- If user answers **2 Medium questions correctly in under 30 seconds** → next 2 questions are forced to **Hard**
- Difficulty badge shows: `🔥 HARD (Difficulty Boost Active)` with amber banner
- Banner text: "⚡ You answered 2 medium questions correctly in under 30s — difficulty increased!"
- Difficulty path tracked: `["medium", "medium", "hard", "hard", ...]`

### Question Card UI
- **Difficulty badge**: top-left, color-coded
  - Easy: green | Medium: amber | Hard: red
- **Question text**: large, centered, white
- **4 option buttons**: full-width, dark bg, white border
  - Hover: amber left border + slight background tint
  - Selected correct: green flash
  - Selected wrong: red flash + correct answer highlighted
- **Explanation**: slides in below after answering

### After All 20 Questions
- Calculates per-skill weighted scores
- Assigns levels: beginner / intermediate / advanced / expert
- Generates **Proof of Skill** cryptographic hash (HMAC-SHA256)
- Saves to backend via `/api/user/quiz/save`

### Results Screen (3 Steps)

**Step 1 — Score Overview**
```
┌─────────────────────────────────────────────────────────┐
│  Your Skill Assessment Results                           │
│                                                          │
│  React          ████████████████░░░░  78%  Advanced     │
│  JavaScript     ████████████████████  95%  Expert       │
│  Node.js        ████████░░░░░░░░░░░░  45%  Intermediate │
│  SQL            ██████░░░░░░░░░░░░░░  32%  Beginner     │
│  Docker         ████████████░░░░░░░░  60%  Advanced     │
│                                                          │
│  🔐 Proof: a3f9b2c1d4e5... (HMAC-SHA256 verified)       │
│                                                          │
│  [← Back]                          [Next: Resources →]  │
└─────────────────────────────────────────────────────────┘
```

**Step 2 — Learning Resources**
- Per-skill resource cards: articles, videos, courses
- Each resource: type badge (VIDEO/ARTICLE/COURSE), platform name, link
- "Verify Mastery" button on video resources
- Completion tracking saved to localStorage

**Step 3 — Action Plan**
- Immediate Actions (This Week): 2 tasks with checkboxes
- Short-term Goals (This Month): 4 goals
- Long-term Goals (3 Months): 4 goals
- "Save Results & Continue" → goes to celebration screen

---

## SCREEN 5 — ASSESSMENT COMPLETE (Celebration)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                      🎉                                  │
│              Assessment Complete!                        │
│                                                          │
│   Incredible job! We've successfully analyzed your       │
│   skills and forged your personalized dashboard.         │
│                                                          │
│   [  Retake Assessment  ]   [  Launch Dashboard 🚀  ]   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### UI Details
- **Background**: radial amber glow pulse animation (4s infinite)
- **🎉 emoji**: pop-in scale 0.5 → 1.15 → 1 with elastic easing
- **Title**: gradient text (white → amber), 2.75rem, 800 weight
- **Card**: glassmorphism — `backdrop-filter: blur(20px)`, amber border glow
- **Buttons**: primary (amber gradient) + secondary (transparent, white border)
- Both buttons animate in with 0.6s delay stagger

---

## SCREEN 6 — DASHBOARD (Main Hub)

The central page. Full layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV: DEV^A  [←][→]  Dashboard | Roadmap | Advanced   [☀🌙] [U▾]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Welcome back, Shiva! 👋                                         │
│  Your journey to becoming a Full Stack Developer                 │
│                          [🗺️ Continue Roadmap]                   │
│                                                                  │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  🔥 7 Days   │  Avg Score   │  Nodes Done  │  Total XP          │
│  Streak      │    72%       │     14       │   1,240            │
│  ██████████  │              │              │                    │
│  (calendar)  │              │              │                    │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐  │
│  │ 🚀 Full Stack Developer         │  │ Focus Areas          │  │
│  │ [Change Role]                   │  │ • Improve SQL (32%)  │  │
│  │ React  Node.js  SQL  Docker +3  │  │ • Learn Docker       │  │
│  ├─────────────────────────────────┤  │ • Practice Node.js   │  │
│  │ [Doughnut Chart] [Bar Chart]    │  ├──────────────────────┤  │
│  │  Skill Distribution  Top Skills │  │ Daily Tip            │  │
│  ├─────────────────────────────────┤  │ "Write code that     │  │
│  │ Recommended Project             │  │  explains itself."   │  │
│  │ Build a blog platform with auth │  ├──────────────────────┤  │
│  │ [Start Project] [View Details]  │  │ Achievements 🏅      │  │
│  ├─────────────────────────────────┤  │ 3 badges earned      │  │
│  │ Action Plan                     │  ├──────────────────────┤  │
│  │ ☐ Complete React advanced       │  │ Community Hub        │  │
│  │ ☐ Build REST API project        │  │ "Join 12,000+ devs"  │  │
│  │ ☐ Solve 20+ LeetCode problems   │  └──────────────────────┘  │
│  └─────────────────────────────────┘                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📈 Predictive Career Trajectory                         │    │
│  │  ──────────────────────────────────────────────────     │    │
│  │  [3mo]──────[6mo]──────[9mo]──────[12mo]  slider        │    │
│  │  At 6 months: Mid Full Stack Dev  $98k/year              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Streak Card
- Large card spanning full width of left column top
- Current streak number: 3rem bold amber
- 14-dot calendar grid: filled dots = active days, empty = missed
- Message: "Amazing consistency! 🔥" if ≥ 7 days
- "Keep it up!" if 3–6 days, "Start your streak!" if 0–2 days

### KPI Mini Cards (4 cards)
Each card: dark bg, amber accent number, label below
- **Avg Skill Score**: percentage from assessment results
- **Nodes Completed**: from Zustand roadmapStore
- **Total XP**: accumulated from node completions
- **Badges Unlocked**: count of earned badges array

### Current Role Card
- Role icon (emoji) + role name in large text
- "Change Role" button → opens animated modal
- Skill pills: up to 8 shown, "+X more" if overflow
- Pills: `#1a1a1a` bg, `#2a2a2a` border, white text

### Charts Section
Two Chart.js charts side by side:
- **Doughnut**: Beginner(red) / Intermediate(amber) / Advanced(blue) / Expert(green)
- **Bar**: Top 6 skills by weighted score, amber bars, dark grid

### Recommended Project Card
Role-specific project suggestions:
- Frontend: "Build a design system with Storybook"
- Backend: "Create a microservices API with Docker"
- Full Stack: "End-to-end blog with auth, S3, real-time comments"
- ML: "Train and deploy a sentiment analysis model"
- DevOps: "Set up a full CI/CD pipeline with Kubernetes"

### Action Plan Card
- **This Week** section: 2 checkboxes, skill-specific tasks
- **This Month** section: 4 checkboxes, general goals
- Checkboxes: custom styled, amber check on completion

### Predictive Career Slider
- Range slider: 1–12 months
- Shows milestone card for selected month:
  - Title (e.g., "Mid Full Stack Dev")
  - Salary estimate (e.g., "$98k/year") in green
  - 3 skills to acquire
  - Month badge in amber
- Velocity badge: nodes/week rate in top-right
- Progress bar: amber → green gradient
- 4 milestone dots below bar, clickable

### Right Sidebar
- **Focus Areas**: 3 weakest skills with improvement suggestions
- **Daily Tip**: rotates by day of week, 7 tips total
- **Achievements**: badge grid, empty state if none
- **Community Hub**: rotating messages, "Join Community →" link
- **Advanced Topics**: gradient glow card, "Explore Now" button

### Role Change Modal
```
┌──────────────────────────────────────────┐
│  Change Your Career Path                  │
│                                           │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │🎨Front │ │⚙️ Back │ │🚀Full  │ ACTIVE │
│  └────────┘ └────────┘ └────────┘        │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │📊 Data │ │🤖 ML   │ │🔧DevOps│        │
│  └────────┘ └────────┘ └────────┘        │
│                                           │
│  [  Cancel  ]                             │
└──────────────────────────────────────────┘
```
- Framer Motion: scale 0.95 → 1, opacity 0 → 1
- Backdrop: `rgba(0,0,0,0.6)` blur overlay
- Current role: amber "Active" badge
- Selecting new role: resets roadmap progress, updates profile

---

## SCREEN 7 — ROADMAP PAGE

Accessed via Navigation → "Roadmap" or hash `#roadmap`.

```
┌─────────────────────────────────────────────────────────────────┐
│ NAV BAR                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Frontend Developer ▾]  [🔍 Search nodes...]                   │
│  [All] [Foundation] [Beginner] [Intermediate] [Advanced]        │
│  XP: 1,240  🔥 7  Role: Full Stack Developer                    │
│                                                                  │
│  Progress: ████████████████░░░░░░░░  62% Complete               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐                                                   │
│   │  HTML    │──────┐                                            │
│   │ ✅ Done  │      │                                            │
│   └──────────┘      ▼                                            │
│                ┌──────────┐                                      │
│                │   CSS    │──────┐                               │
│                │ ✅ Done  │      │                               │
│                └──────────┘      ▼                               │
│                           ┌──────────────┐                      │
│                           │  JavaScript  │                       │
│                           │ 🔵 In Progress│                      │
│                           └──────────────┘                       │
│                                  │                               │
│                           ┌──────────────┐                       │
│                           │    React     │                       │
│                           │ 🔒 Locked    │                       │
│                           └──────────────┘                       │
│                                                                  │
│  (drag to pan, scroll to zoom — ReactFlow canvas)                │
└─────────────────────────────────────────────────────────────────┘
```

### Controls Bar
- **Roadmap Selector**: dropdown with 17 roadmaps
  - Frontend, Backend, Full Stack, DevOps, AI/ML, Data Engineer, Mobile, System Design, React, Node.js, Python, Java, Go, Docker, Kubernetes, PostgreSQL, Security Engineer
- **Search**: filters nodes by title/description in real-time
- **Difficulty filters**: pill buttons, active = amber fill
- **Stats**: XP count + streak flame + role badge

### Progress Bar
- Full-width amber fill bar
- Percentage text overlay
- Framer Motion width animation on load

### ReactFlow Canvas
- **Draggable**: click and drag to pan
- **Zoomable**: scroll wheel or pinch
- **Node states** (color-coded):
  - 🔒 **Locked** (gray): prerequisites not met
  - 🔵 **In Progress** (blue): currently learning
  - ✅ **Completed** (green): done, XP earned
  - ⭐ **Recommended** (amber glow): AI-suggested next step

### Node Detail Panel (on click)
```
┌──────────────────────────────────────────┐
│  JavaScript Fundamentals                  │
│  ─────────────────────────────────────── │
│  Foundation  •  Est. 40 hours             │
│                                           │
│  Master the core language of the web.    │
│  Variables, functions, closures, async.  │
│                                           │
│  Subtopics: Variables, Functions,         │
│  Closures, Promises, ES6+                 │
│                                           │
│  Tools: VSCode, Node.js, Chrome DevTools  │
│                                           │
│  [📚 Resources]  [✅ Mark Complete]       │
└──────────────────────────────────────────┘
```
- Slides in from right side
- "Mark Complete" → awards XP, updates node color, syncs to backend
- XP earned: Easy=10, Medium=20, Hard=30 points
- Badge awarded at milestones: 5, 10, 25, 50 nodes

### Deep Work Player (floating, bottom-right)
```
         [🎧]  ← FAB button, fixed position
```
Opens panel:
```
┌──────────────────────────────┐
│ 🎧 Deep Work Player          │[✕]│
│ ─────────────────────────── │
│ 🎵 Lo-Fi Study Beats         │
│ 🌊 Deep Focus Flow           │
│ 🌙 Midnight Coding           │
│ ─────────────────────────── │
│    [⏮]  [▶/⏸]  [⏭]          │
│ 🔈 ──────────────── 🔊       │
│ ─────────────────────────── │
│ 🍅 Focus Session             │
│                              │
│      ┌──────────┐            │
│      │  24:35   │ ← SVG ring │
│      └──────────┘            │
│                              │
│  [▶ Start]  [↺ Reset]        │
│  ✓ Synced with 14 nodes      │
└──────────────────────────────┘
```
- FAB: 52×52px circle, dark gradient, fixed bottom-right
- Shows timer badge on FAB when Pomodoro active
- SVG ring: amber for work, green for break
- Syncs with roadmap: completing a node resets timer as reward
- Audio: 3 lo-fi tracks from SoundHelix (loop)

---

## SCREEN 8 — ADVANCED CONCEPTS PAGE

Accessed via `#advanced-concepts` hash or Dashboard sidebar.

```
┌─────────────────────────────────────────────────────────┐
│ NAV BAR                                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Advanced Concepts                                       │
│  Deep technical content for senior-level mastery         │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ System Design│ │  Algorithms  │ │ Architecture │    │
│  │              │ │              │ │  Patterns    │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │  ML/AI Deep  │ │  Blog Reader │                      │
│  │   Dives      │ │   Modal      │                      │
│  └──────────────┘ └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

- Topic cards with icons, titles, descriptions
- Click → opens **Blog Reader Modal** (in-app article reader)
- Blog Reader: full-screen modal, article content, scroll, close button
- Content covers: CAP theorem, SOLID principles, neural networks, etc.

---

## SCREEN 9 — GHOST-HUNTER CODE REVIEWER

Accessed via `#code-review` hash or Command Palette.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Ghost-Hunter Code Reviewer          [✏️ Custom Code]          │
│ Submit code for Security & Efficiency audit                      │
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│  [Two Sum] [Reverse] [Find   │  👻                              │
│   Duplicates] [LRU Cache]    │                                  │
│                              │  Submit your code to hunt for    │
│  Two Sum — Easy              │  ghosts — hidden bugs,           │
│  Return indices of two nums  │  security holes, inefficiencies  │
│  that add up to target.      │                                  │
│  Expected: O(n)              │                                  │
│                              │                                  │
│  ┌──────────────────────┐    │                                  │
│  │def two_sum(nums, t): │    │                                  │
│  │  for i in range(...):│    │                                  │
│  │    for j in range(..):    │                                  │
│  │      if nums[i]+nums[j]   │                                  │
│  │        == t:              │                                  │
│  │        return [i,j]  │    │                                  │
│  └──────────────────────┘    │                                  │
│                              │                                  │
│  [🚀 Run Ghost-Hunter Review]│                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### After Review
```
┌──────────────────────────────────────────┐
│  ┌──────┐  Complexity: O(n²)             │
│  │ 45   │  This nested loop approach     │
│  │ /100 │  works but is inefficient.     │
│  └──────┘  Refactor to use a hash map.   │
│                                          │
│  ISSUES FOUND (2)                        │
│  ┌──────────────────────────────────┐   │
│  │ ⚡ efficiency  WARNING           │   │
│  │ 📍 Lines 3-6                     │   │
│  │ Nested loop creates O(n²)        │   │
│  │ 💡 Use a dict for O(n) lookup    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ ✨ style  INFO                   │   │
│  │ Variable names could be clearer  │   │
│  │ 💡 Use 'complement' instead of j │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ✨ SUGGESTED REFACTOR                   │
│  ┌──────────────────────────────────┐   │
│  │def two_sum(nums, target):        │   │
│  │  seen = {}                       │   │
│  │  for i, n in enumerate(nums):    │   │
│  │    if target-n in seen:          │   │
│  │      return [seen[target-n], i]  │   │
│  │    seen[n] = i                   │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### UI Details
- **Left panel**: challenge selector + code textarea
  - Textarea: `#0d1117` bg, `#e2e8f0` text, JetBrains Mono font
  - Challenge buttons: dark cards, difficulty color badges
  - Custom mode: language selector pills (python/js/java/cpp/go)
- **Right panel**: review results
  - Score badge: circular, color-coded (green ≥80, amber ≥60, red <60)
  - Issue cards: left border color = severity (red/amber/blue)
  - Refactor block: dark code block with monospace font
- **Review button**: amber gradient, full-width, disabled during loading
- Powered by Gemini AI backend (`/api/code/review`)
- Fallback: generic feedback if AI unavailable

---

## SCREEN 10 — PITCH-PERFECT (Voice Analysis)

Accessed via `#pitch-perfect` hash or Command Palette.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎙️ Pitch-Perfect                                                 │
│ Practice your elevator pitch. AI analyzes WPM, fillers, tone.   │
├──────────────────────────────┬──────────────────────────────────┤
│                              │                                  │
│  Record Your Pitch           │  🎤                              │
│                              │                                  │
│  Aim for 30-60 seconds.      │  Record and analyze your pitch   │
│  Introduce yourself, skills, │  to get a detailed report.       │
│  and career goal.            │                                  │
│                              │                                  │
│  [🎙️ Start Recording]        │                                  │
│                              │                                  │
│  ● Recording in progress...  │                                  │
│                              │                                  │
│  ▶ [audio player]            │                                  │
│  [🚀 Analyze My Pitch]       │                                  │
│                              │                                  │
│  💡 Tips:                    │                                  │
│  • Speak at 120-150 WPM      │                                  │
│  • Avoid "um", "uh", "like"  │                                  │
│  • Vary your tone            │                                  │
│  • End with a call-to-action │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

### After Analysis
```
┌──────────────────────────────────────────┐
│  ┌────┐  Senior Leader                   │
│  │ B  │  Overall Assessment              │
│  └────┘                                  │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │  72  │  │  81  │  │  88  │           │
│  │Conf. │  │Clarity│  │ Pace │           │
│  └──────┘  └──────┘  └──────┘           │
│  (SVG ring gauges, color-coded)          │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │  134 WPM │  │  3 Fillers│            │
│  │ Perfect  │  │Great ctrl │            │
│  └──────────┘  └──────────┘             │
│                                          │
│  Filler breakdown: "um" ×1  "like" ×2   │
│                                          │
│  Transcript: "Hi, I'm Shiva, a full     │
│  stack developer with 3 years..."       │
│                                          │
│  ✅ Strengths        🎯 Improvements    │
│  Good pacing         Reduce filler words │
│  Clear structure     Vary tone more      │
└──────────────────────────────────────────┘
```

### UI Details
- **Record button**: red gradient circle, pulse animation when recording
- **Red dot indicator**: blinks during recording
- **Audio player**: native HTML5 `<audio controls>` element
- **Grade badge**: circular, color-coded (A=green, B=blue, C=amber, D=red)
- **Score rings**: SVG circles with stroke-dashoffset animation
- **Stat cards**: dark bg, large number, label, note
- **Filler tags**: red-tinted pills showing word + count
- Powered by Gemini AI (`/api/pitch/analyze`)
- Fallback report if AI unavailable

---

## SCREEN 11 — SALARY HEATMAP

Accessed via `#salary-heatmap` hash or Command Palette.

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Salary Heatmap              [Full Stack Developer ▾] │
│ Live salary data for your target role across cities      │
│                                                          │
│ 📈 Demand for Full Stack Developers is up 4.8% YoY.     │
│    Remote roles command a 15% premium.                   │
│                                                          │
│ San Francisco  ████████████████████  $174k  ↑5.4%       │
│ New York       ████████████████░░░░  $162k  ↑5.1%       │
│ Seattle        ███████████████░░░░░  $156k  ↑4.9%       │
│ Remote         ████████████░░░░░░░░  $138k  ↑4.7%       │
│ Austin         ██████████░░░░░░░░░░  $132k  ↑4.5%       │
│ London         ████████████░░░░░░░░  $144k  ↑4.3%       │
│ Chicago        █████████░░░░░░░░░░░  $126k  ↑4.2%       │
│ Bangalore      ███░░░░░░░░░░░░░░░░░  $42k   ↑7.2%       │
│                                                          │
│ 🚀 Skills that command a premium salary:                 │
│ [TypeScript] [React] [Next.js] [System Design]           │
│                                                          │
│ Last updated: 2026-04-22 • Data in USD                   │
└─────────────────────────────────────────────────────────┘
```

### UI Details
- **Role selector**: dropdown, 8 roles available
- **Trend banner**: green-tinted, `#10b981` text
- **Bar rows**: each row = city name + animated bar + salary + YoY %
  - Bar color: HSL gradient (green = high, red = low) based on % of max
  - Bars animate from width:0 with Framer Motion on load
  - Rows stagger in from left with 50ms delay each
- **YoY badge**: green ↑ or red ↓ with percentage
- **Premium skills**: amber pill tags
- Data from `/api/salary/heatmap?role=...`
- Full static fallback if backend offline

---

## SCREEN 12 — LINUCB RECOMMENDATIONS (AI Skill Engine)

Available as a panel/section within the app.

```
┌─────────────────────────────────────────────────────────┐
│  🎯 AI Skill Recommendations          Avg Reward: 78%   │
│  Powered by LinUCB Contextual Bandit                     │
│                                                          │
│  #1  TypeScript                              [Skip] [→]  │
│      Frontend  •  80hrs  •  Difficulty: 6/10             │
│      Career Readiness: 92%  Market Demand: 88%           │
│      ████████████████████░░  Expected: 85%               │
│                                                          │
│  #2  Node.js                                 [Skip] [→]  │
│      Backend  •  120hrs  •  Difficulty: 7/10             │
│      Career Readiness: 88%  Market Demand: 91%           │
│      ████████████████████░░  Expected: 82%               │
│                                                          │
│  #3  Docker  ★ REQUIRED                      [Skip] [→]  │
│      DevOps  •  60hrs  •  Difficulty: 5/10               │
│      Career Readiness: 79%  Market Demand: 85%           │
│      ████████████████░░░░░░  Expected: 76%               │
└─────────────────────────────────────────────────────────┘
```

### Explanation Modal (on click)
```
┌──────────────────────────────────────────┐
│  TypeScript                               │
│  ─────────────────────────────────────── │
│                                           │
│         ┌──────────┐                     │
│         │   85%    │  ← circular gauge   │
│         └──────────┘                     │
│                                           │
│  Career Readiness  40%  ████████████     │
│  Time Efficiency   20%  ████████         │
│  Difficulty Match  20%  ██████████       │
│  Market Demand     15%  ████████████     │
│  Prerequisite Fit   5%  ██████           │
│                                           │
│  Learning Time: 80 hours                  │
│  Difficulty: 6/10                         │
│  Category: Frontend                       │
│  Status: Required for your role           │
│                                           │
│  [  Skip  ]    [  Start Learning →  ]    │
└──────────────────────────────────────────┘
```

### How LinUCB Works
- 11-dimensional context vector per user
- Composite reward = 0.3×click + 0.4×completion_efficiency + 0.3×assessment_improvement
- Updates model after every interaction (clicked/started/completed/skipped)
- Gets smarter over time — personalized to each user's learning pattern

---

## SCREEN 13 — DEVASQUARE PREMIUM (Pricing Modal)

Triggered by "⭐ Upgrade to DEVAsquare" button (fixed top-right).

```
┌─────────────────────────────────────────────────────────┐
│  Elevate Your Professional Trajectory                    │
│  DEVAsquare Premium                                      │
│                                                          │
│         [Monthly $29]  [Yearly $249 — Save 30%]         │
│                                                          │
│  📚 The Intellectual Edge                                │
│  ✓ Executive Library — curated leadership books         │
│  ✓ 15-Min Power Summaries                               │
│  ✓ Dynamic Learning Paths                               │
│                                                          │
│  🎯 The Placement Engine                                 │
│  ✓ Precision Resume Architect (ATS-optimized)           │
│  ✓ Virtual Interview Lab — AI body language feedback    │
│  ✓ Skill-Gap Blueprint                                  │
│                                                          │
│  🧭 The Insider Circle                                   │
│  ✓ Inner Circle Hub — private webinars                  │
│  ✓ Milestone Dashboard                                  │
│  ✓ Mentor Matchmaker                                    │
│                                                          │
│  ✨ Gemini-Infused AI                                    │
│  ✓ Shadow Mentor AI — 24/7 career coaching              │
│  ✓ Salary Heatmaps — live hiring data                   │
│  ✓ Portfolio Ghostwriter — GitHub → showcases           │
│                                                          │
│  [  Upgrade to DEVAsquare Pro  ]                        │
│                                                          │
│  Cancel anytime • 30-day money-back • Secure payment    │
└─────────────────────────────────────────────────────────┘
```

### UI Details
- **Modal**: max-width 680px, dark card, amber top border gradient
- **Billing toggle**: pill switch, monthly/yearly, yearly shows savings badge
- **Feature sections**: 4 sections with icons, each feature has ✓ checkmark
- **Upgrade button**: amber gradient, full-width, hover lifts with shadow
- **Footer**: small muted text, trust signals
- Framer Motion: scale 0.95 → 1 entrance animation

### Payment Flow (PayU)
1. Click "Upgrade" → collect name, email, phone
2. POST to backend → create PayU order
3. Redirect to PayU gateway
4. Success → `/payment/success` → `isPro = true` in localStorage
5. Failure → `/payment/failure` → retry option

---

## SCREEN 14 — COMMAND PALETTE (Ctrl+K)

Global search bar, available on every page.

```
┌─────────────────────────────────────────────────────────┐
│  ⌘  Type a command...                          [ESC]    │
│  ─────────────────────────────────────────────────────  │
│  🏠  Go to Dashboard                                     │
│  🗺️  Open Roadmap                                        │
│  🧠  Advanced Concepts                                   │
│  ⭐  Upgrade to DEVAsquare Pro                           │
│  🌓  Toggle Theme                              ↵         │
│  📝  Retake Skill Assessment                             │
│  🔍  Open Code Reviewer                                  │
│  🎙️  Practice Elevator Pitch                             │
│  💰  View Salary Heatmap                                 │
│  🚪  Logout                                              │
│  ─────────────────────────────────────────────────────  │
│  ↑↓ navigate    ↵ select    ESC close                   │
└─────────────────────────────────────────────────────────┘
```

### UI Details
- **Trigger**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- **Overlay**: `rgba(0,0,0,0.6)` backdrop with `blur(4px)`
- **Palette**: max-width 560px, centered, 15vh from top
- **Input**: transparent bg, JetBrains Mono, 16px
- **Items**: hover = amber tint `rgba(245,158,11,0.12)`
- **Active item**: amber `↵` badge on right
- **Keyboard**: ↑↓ to navigate, Enter to execute, Esc to close
- **Filter**: real-time as you type
- Framer Motion: y:-20 → 0, scale 0.97 → 1 entrance

---

## SCREEN 15 — HACKER CONSOLE (CLI)

Fixed at bottom of screen, toggle button always visible.

```
                    [▲ console]  ← fixed bottom-center
```

When open:
```
┌─────────────────────────────────────────────────────────┐
│ DEVA Terminal v2.0 — Type /help for commands             │
│ > /status                                                │
│ XP: 1,240 pts                                            │
│ Streak: 7 days                                           │
│ Nodes Completed: 14                                      │
│ Roadmap: frontend-developer                              │
│ > /skills                                                │
│ Assessed Skills:                                         │
│   React               advanced (78%)                     │
│   JavaScript          expert (95%)                       │
│   Node.js             intermediate (45%)                 │
│ > _                                                      │
│ ─────────────────────────────────────────────────────── │
│ deva@career:~$ [                                       ] │
└─────────────────────────────────────────────────────────┘
```

### Available Commands
| Command | Output |
|---|---|
| `/help` | Lists all commands |
| `/status` | XP, streak, nodes, roadmap |
| `/skills` | Assessed skills with levels |
| `/roadmap` | Current roadmap info |
| `/whoami` | Name, email, role, speed |
| `/theme` | Toggles dark/light mode |
| `/version` | DEVA v2.0.0 build info |
| `/clear` | Clears console output |

### UI Details
- **Toggle button**: fixed bottom-center, `#0f172a` bg, amber border top
- **Console**: full-width, 220px height, `#0a0f1a` bg
- **Output colors**: system=gray, input=amber, output=white, error=red, info=blue
- **Font**: JetBrains Mono throughout
- **Prompt**: `deva@career:~$` in amber
- **History**: ↑↓ arrows cycle through command history (last 50)
- Framer Motion: height 0 → 220 slide animation

---

## SCREEN 16 — AI CHAT WIDGET (Floating)

Always visible after login, bottom-right corner.

```
                              [🤖]  ← floating button
```

When open:
```
┌──────────────────────────────┐
│ 🤖 DEVA AI Assistant    [✕] │
│ ─────────────────────────── │
│                              │
│  How can I help your         │
│  career today?               │
│                              │
│  [User]: How do I learn      │
│  React fast?                 │
│                              │
│  [AI]: Start with the        │
│  official docs, then build   │
│  3 small projects...         │
│                              │
│ ─────────────────────────── │
│ [Type your question...  ] [→]│
└──────────────────────────────┘
```

- Powered by Gemini API (`GEMINI_API_KEY`)
- Fallback to HuggingFace if Gemini unavailable
- Persists conversation across page navigation
- Minimizable to floating button
- Positioned: fixed bottom-right, z-index 1000

---

## COMPLETE USER JOURNEY — Start to End

```
VISIT SITE (first time)
│
▼
┌─────────────────────────────────────────────────────────┐
│  AUTH PAGE                                               │
│  Logo bounces in → tagline slides → form flies up        │
│  Options: Sign In | Sign Up | Demo Login                 │
└─────────────────────────────────────────────────────────┘
│
▼ (new user)
┌─────────────────────────────────────────────────────────┐
│  ONBOARDING (6 steps)                                    │
│  0. Welcome Screen                                       │
│  1. Interest Quiz (10 questions → frontend/backend/etc)  │
│  2. Quiz Results (recommended role + match %)            │
│  3. Role Selection (33 roles grid)                       │
│  4. AI Help — Resume upload OR GitHub analysis           │
│  5. Skills Input (manual + pre-populated)                │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│  SKILL ASSESSMENT QUIZ                                   │
│  5 skills × 4 questions = 20 total                       │
│  Dynamic difficulty: 2 medium correct <30s → force hard  │
│  Proof of Skill hash generated on completion             │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│  ASSESSMENT COMPLETE (celebration screen)                │
│  🎉 animation → Launch Dashboard button                  │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD (main hub)                                    │
│  Streak + KPIs + Charts + Project + Action Plan          │
│  Predictive Career Slider (1-12 month trajectory)        │
│  Sidebar: Focus Areas + Tips + Badges + Community        │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [Roadmap tab]
▼
┌─────────────────────────────────────────────────────────┐
│  ROADMAP PAGE                                            │
│  17 roadmaps, ReactFlow canvas, node completion          │
│  Deep Work Player (lo-fi + Pomodoro timer)               │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [Advanced tab]
▼
┌─────────────────────────────────────────────────────────┐
│  ADVANCED CONCEPTS                                       │
│  System design, algorithms, ML deep dives                │
│  In-app blog reader modal                                │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [Ctrl+K → Code Reviewer]
▼
┌─────────────────────────────────────────────────────────┐
│  GHOST-HUNTER CODE REVIEWER                              │
│  4 challenges + custom mode                              │
│  AI security & efficiency audit via Gemini               │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [Ctrl+K → Pitch Perfect]
▼
┌─────────────────────────────────────────────────────────┐
│  PITCH-PERFECT                                           │
│  Record elevator pitch → AI analyzes WPM/fillers/tone    │
│  Grade A-D + detailed improvement report                 │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [Ctrl+K → Salary Heatmap]
▼
┌─────────────────────────────────────────────────────────┐
│  SALARY HEATMAP                                          │
│  8 cities × 8 roles, animated bars, YoY trends          │
│  Premium skills that boost salary                        │
└─────────────────────────────────────────────────────────┘
│
├──────────────────────────────────────────────────────────
│  [⭐ Upgrade button]
▼
┌─────────────────────────────────────────────────────────┐
│  DEVASQUARE PREMIUM                                      │
│  $29/mo or $249/yr → PayU payment → Pro unlocked         │
└─────────────────────────────────────────────────────────┘
│
└── ALWAYS AVAILABLE ──────────────────────────────────────
    🤖 AI Chat Widget (floating, every page)
    🎧 Deep Work Player (roadmap page)
    ▲ Hacker Console (every page, Ctrl+` toggle)
    ⌘K Command Palette (every page, Ctrl+K)
    🌙 Theme Toggle (navigation bar)
    🌐 Dynamic Favicon (green dot = mentor notification)
```

---

## BACKEND API REFERENCE

### Auth Routes (`/api/auth/`)
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Create account, returns JWT |
| POST | `/login` | Login, returns JWT |
| GET | `/verify` | Validate JWT token |
| POST | `/logout` | Invalidate session |

### User Routes (`/api/user/`)
| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Full user profile + skills + stats |
| POST | `/complete-onboarding` | Save role, skills, speed |
| POST | `/quiz/save` | Save assessment results |
| POST | `/roadmap/progress` | Update node completion |
| POST | `/stats` | Update XP, badges, streak |

### Quiz Routes (`/api/quiz/`)
| Method | Path | Description |
|---|---|---|
| POST | `/generate` | Generate questions for a skill |

### Roadmap Routes (`/api/roadmap/`)
| Method | Path | Description |
|---|---|---|
| GET | `/list` | All available roadmaps |
| GET | `/{id}` | Specific roadmap data |
| GET | `/{id}/nodes` | Nodes for a roadmap |

### AI Routes
| Method | Path | Description |
|---|---|---|
| POST | `/resume/upload` | Parse resume, extract skills |
| POST | `/github/analyze` | Analyze GitHub profile |
| POST | `/ai/suggest-role` | AI role recommendation |

### LinUCB Routes (`/api/linucb/`)
| Method | Path | Description |
|---|---|---|
| POST | `/recommend` | Get top 5 skill recommendations |
| POST | `/feedback` | Submit interaction feedback |
| GET | `/statistics` | Model performance stats |
| POST | `/explain` | Detailed skill explanation |

### Knowledge Graph (`/api/graph/`)
| Method | Path | Description |
|---|---|---|
| POST | `/backtrace` | Find skill gaps from failed assessment |
| GET | `/prerequisites/{skill}` | Get prerequisites for a skill |

### Shadow Mentor (`/api/mentor/`)
| Method | Path | Description |
|---|---|---|
| GET | `/notifications/{user_id}` | Get pending AI nudges |
| POST | `/login` | Record user login for stagnation tracking |

### New X-Factor Routes
| Method | Path | Description |
|---|---|---|
| POST | `/api/proof/generate` | Generate HMAC-SHA256 Proof of Skill |
| POST | `/api/proof/verify` | Verify a proof hash |
| POST | `/api/code/review` | Ghost-Hunter AI code audit |
| POST | `/api/pitch/analyze` | Pitch-Perfect audio analysis |
| GET | `/api/salary/heatmap` | Salary data by role + city |

---

## TECH STACK — Complete Reference

### Frontend
| Technology | Version | Usage |
|---|---|---|
| React | 18 | UI framework |
| GSAP | 3.14 | Entrance animations, floating logo |
| Framer Motion | 10 | Page transitions, modals, cards |
| Chart.js | 4.5 | Doughnut + bar charts |
| ReactFlow | 11.10 | Interactive roadmap canvas |
| Zustand | 4.4 | Global state (roadmap, XP, streak) |
| react-icons | 5.6 | Navigation icons |

### Backend
| Technology | Usage |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLite | Development database |
| PostgreSQL | Production database |
| Redis | Caching + Celery broker |
| Celery | Async task queue |
| spaCy | NLP resume parsing |
| scikit-learn | LinUCB, ML models |
| NumPy / Pandas | Data processing |
| httpx | Async HTTP client |
| python-jose | JWT tokens |
| passlib + bcrypt | Password hashing |
| google-generativeai | Gemini AI integration |

### AI/ML Systems
| System | Technology | Purpose |
|---|---|---|
| System 1 | LinUCB Contextual Bandit | Skill recommendations |
| System 2 | Knowledge Graph (BFS) | Prerequisite backtrace |
| System 3 | Gemini Flash | Shadow Mentor nudges |
| System 4 | Celery + Redis | Async analytics |
| Ghost-Hunter | Gemini Flash | Code security audit |
| Pitch-Perfect | Gemini Flash | Audio sentiment analysis |

### Infrastructure
| Component | Technology |
|---|---|
| Auth | JWT (HS256), bcrypt |
| Payments | PayU gateway |
| File uploads | multipart/form-data |
| WebSockets | FastAPI + websockets lib |
| Favicon | Canvas API (dynamic) |

---

## DATABASE SCHEMA

### `learners` table
```
id, email, name, password_hash, target_role,
learning_speed, onboarding_complete, created_at
```

### `learner_skills` table
```
id, learner_id, skill, proficiency_level, added_at
```

### `quiz_results` table
```
id, learner_id, quiz_type, score, total_questions,
category, results_data (JSON), created_at
```

### `roadmap_progress` table
```
id, learner_id, roadmap_id, node_id,
completed, completed_at, xp_earned
```

### `user_stats` table
```
id, user_id, total_xp, streak, badges (JSON),
last_completed_date, updated_at
```

### `otp_records` table
```
id, user_id, email, otp, otp_type, verified,
expires_at, temp_name, temp_phone, temp_password_hash
```

---

## ENVIRONMENT VARIABLES (.env)

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=career_guidance
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password

# AI
GEMINI_API_KEY=your_gemini_key
REACT_APP_HF_TOKEN=your_huggingface_token

# GitHub
GITHUB_TOKEN=your_github_token

# Redis / Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Auth
SECRET_KEY=your_secret_key

# PayU Payments
REACT_APP_PAYU_MERCHANT_KEY=your_key
REACT_APP_PAYU_MERCHANT_SALT=your_salt
REACT_APP_PAYU_ENV=test

# SMS (Fast2SMS)
FAST2SMS_API_KEY=your_key
```

---

## HOW TO START THE APP

### Backend
```powershell
# From cga/backend/
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```powershell
# From cga/
npm install
npm start
```

### With Redis + Celery (optional, for async features)
```powershell
# Start Redis (WSL or Docker)
redis-server

# Start Celery worker
celery -A app.services.async_tasks.celery_app worker --loglevel=info

# Start Celery beat (Shadow Mentor scheduler)
celery -A app.services.async_tasks.celery_app beat --loglevel=info
```

---

*DEV^A — Intelligent Career Development Platform*
*Version 3.0 | Built April 2026*
*Full Stack: React 18 + FastAPI + LinUCB + Gemini AI*
