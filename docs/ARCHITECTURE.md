# DEVA - Architecture Documentation

## Project Structure

```
cga/
├── 📄 docs/                          # All documentation
│   ├── README.md                     # Main project overview
│   ├── GETTING_STARTED.md            # Setup instructions
│   ├── ARCHITECTURE.md               # This file
│   ├── START_HERE.md                 # Quick start guide
│   ├── LINUCB_INTEGRATION.md         # ML integration docs
│   └── PRESENTATION_PROMPT.md        # Presentation guidelines
│
├── 🎨 src/                           # Frontend React application
│   ├── components/                   # Feature-organized components
│   │   ├── common/                   # Shared UI components
│   │   │   ├── Navigation.jsx        # Main navigation
│   │   │   ├── ErrorBoundary.jsx     # Error handling
│   │   │   ├── LoadingScreen.jsx     # Loading states
│   │   │   ├── ThemeToggle.jsx       # Theme switching
│   │   │   ├── SplashScreen.jsx      # App loading screen
│   │   │   ├── CommandPalette.jsx    # Quick actions
│   │   │   ├── InfoPanel.jsx         # Information display
│   │   │   └── ScrambleText.jsx      # Text animations
│   │   ├── auth/                     # Authentication
│   │   │   └── Auth.jsx              # Login/signup
│   │   ├── onboarding/               # User onboarding
│   │   │   └── OnboardingFlow.jsx    # Multi-step onboarding
│   │   ├── assessment/               # Skill assessment
│   │   │   ├── SkillAssessmentQuiz.jsx
│   │   │   └── DetailedSkillsAnalysis.jsx
│   │   ├── roadmap/                  # Career roadmaps
│   │   │   ├── InteractiveRoadmap.jsx
│   │   │   ├── RoadmapCanvas.jsx
│   │   │   ├── LearningRoadmap.jsx
│   │   │   ├── LearningRoadmapVisualization.jsx
│   │   │   └── RoadmapNode.jsx
│   │   ├── features/                 # Core features
│   │   │   ├── ResumeBuilder.jsx     # Resume creation
│   │   │   ├── InterviewPrep.jsx     # Interview practice
│   │   │   ├── PitchPerfect.jsx      # Pitch practice
│   │   │   ├── SalaryHeatmap.jsx     # Salary insights
│   │   │   ├── GhostHunterReviewer.jsx # Code review
│   │   │   ├── DailyChallenge.jsx    # Daily coding challenges
│   │   │   ├── GitHubHeatmap.jsx     # GitHub activity
│   │   │   ├── PredictiveCareerSlider.jsx
│   │   │   ├── BlogReaderModal.jsx   # Blog reading
│   │   │   ├── DeepWorkPlayer.jsx    # Focus sessions
│   │   │   └── HackerConsole.jsx     # Developer console
│   │   ├── ai/                       # AI-powered features
│   │   │   ├── AIChatWidget.jsx      # AI chat interface
│   │   │   ├── ChatMessage.jsx       # Chat message component
│   │   │   ├── ChatWindow.jsx        # Chat window
│   │   │   └── LinUCBRecommendations.jsx # ML recommendations
│   │   └── premium/                  # Premium features
│   │       ├── PricingModal.jsx      # Subscription pricing
│   │       ├── ProBadge.jsx          # Premium indicators
│   │       ├── ExecutiveVault.jsx    # Executive features
│   │       └── AdvancedFeatures.jsx  # Advanced premium features
│   ├── pages/                        # Main application pages
│   │   ├── Dashboard.jsx             # Main dashboard
│   │   ├── RoadmapPage.jsx           # Roadmap view
│   │   ├── AdvancedConceptsPage.jsx  # Learning concepts
│   │   ├── PaymentSuccess.jsx        # Payment success
│   │   └── PaymentFailure.jsx        # Payment failure
│   ├── services/                     # API and external services
│   ├── hooks/                        # Custom React hooks
│   │   ├── useDynamicFavicon.js
│   │   ├── useBehaviorTracker.js
│   │   └── useMarketRadar.js
│   ├── store/                        # State management
│   │   └── roadmapStore.js           # Zustand store
│   ├── constants/                    # Application constants
│   │   ├── questionBank.json         # Quiz questions
│   │   └── roadmaps/                 # Roadmap definitions
│   ├── utils/                        # Utility functions
│   │   ├── payuIntegration.js        # Payment integration
│   │   ├── adaptiveQuizEngine.js     # Quiz logic
│   │   └── aiClient.js               # AI service client
│   ├── styles/                       # CSS styling
│   │   ├── DesignSystem.css          # Design tokens
│   │   ├── SmoothAnimations.css      # Animations
│   │   ├── Layout.css                # Layout utilities
│   │   └── [component].css           # Component-specific styles
│   ├── App.js                        # Main application component
│   └── index.js                      # Application entry point
│
├── ⚙️ backend/                       # FastAPI backend
│   ├── app/                          # Main application
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.py               # Authentication routes
│   │   │   ├── user.py               # User management
│   │   │   ├── features.py           # Feature routes
│   │   │   └── health.py             # Health checks
│   │   ├── services/                 # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   └── ml_service.py
│   │   ├── models/                   # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   └── features.py
│   │   ├── database/                 # Database layer
│   │   │   ├── db.py                 # Database connection
│   │   │   └── models.py             # SQLAlchemy models
│   │   ├── utils/                    # Backend utilities
│   │   │   ├── security.py           # Security functions
│   │   │   └── email.py              # Email services
│   │   ├── config.py                 # Configuration
│   │   └── main.py                   # FastAPI app
│   ├── ml/                           # Machine Learning
│   │   ├── models/                   # ML model implementations
│   │   ├── preprocessing/            # Data preprocessing
│   │   ├── data/                     # ML datasets
│   │   └── utils/                    # ML utilities
│   ├── requirements.txt              # Python dependencies
│   ├── run.sh                        # Startup script
│   └── README.md                     # Backend documentation
│
├── 📊 data/                          # Shared application data
│   ├── roles_skills.csv              # Role-skill mappings
│   ├── skill_metadata.csv            # Skill information
│   └── README.md                     # Data documentation
│
├── 🎯 public/                        # Static assets
│   ├── index.html                    # HTML template
│   └── assets/                       # Images, icons, etc.
│
├── 📦 Configuration Files
│   ├── package.json                  # Node.js dependencies
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git ignore rules
│   └── README.md                     # Project overview
```

## Key Architecture Decisions

### 1. **Feature-Based Component Organization**
- Components grouped by domain (auth, roadmap, features, etc.)
- Each feature folder has an index.js for clean imports
- Shared components in common/ folder

### 2. **Consolidated Backend**
- Single FastAPI backend (removed old Flask backend)
- Clear separation: routes → services → database
- ML models integrated under backend/ml/

### 3. **State Management**
- Zustand for lightweight state management
- Custom hooks for reusable logic
- Local state for component-specific data

### 4. **Styling Strategy**
- CSS modules with component co-location
- Design system with consistent tokens
- Smooth animations for better UX

### 5. **API Architecture**
- RESTful API design
- JWT authentication
- Feature-based route organization

## Development Workflow

1. **Frontend Development**: `npm start`
2. **Backend Development**: `cd backend && bash run.sh`
3. **Full Stack**: Run both commands in separate terminals

## Key Features

- 🗺️ **Interactive Roadmaps**: Visual career path planning
- 🎯 **Skill Assessment**: Adaptive quiz engine
- 🤖 **AI Recommendations**: LinUCB bandit algorithms
- 💼 **Premium Features**: Resume builder, interview prep
- 📊 **Analytics**: GitHub integration, salary insights
- 🎓 **Learning**: Advanced concepts and daily challenges

## Technology Stack

- **Frontend**: React.js, Zustand, GSAP, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite (development), PostgreSQL (production)
- **ML**: scikit-learn, LinUCB algorithms
- **Deployment**: Docker, Nginx (planned)