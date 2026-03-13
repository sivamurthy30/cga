# 📁 Project Structure

```
cga/
├── 📄 Documentation (Root Level)
│   ├── README.md                    # Main documentation
│   ├── GETTING_STARTED.md           # Setup guide
│   ├── ARCHITECTURE.md              # System design
│   ├── PROJECT_SUMMARY.md           # Overview
│   ├── QUICK_REFERENCE.md           # Commands
│   └── TROUBLESHOOTING.md           # Solutions
│
├── 🎨 Frontend (React App)
│   ├── public/                      # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   └── src/                         # Source code
│       ├── components/              # React components
│       │   ├── Auth.jsx
│       │   ├── OnboardingFlow.jsx
│       │   ├── SkillAssessmentQuiz.jsx
│       │   ├── InteractiveRoadmap.jsx
│       │   ├── AdvancedFeatures.jsx
│       │   └── InfoPanel.jsx
│       │
│       ├── services/                # API services
│       │   └── apiService.js
│       │
│       ├── data/                    # Static data
│       │   └── questionBank.json
│       │
│       ├── styles/                  # CSS files
│       │   ├── App.css
│       │   ├── Auth.css
│       │   ├── Onboarding.css
│       │   ├── SkillAssessment.css
│       │   └── DesignSystem.css
│       │
│       ├── App.js                   # Main app
│       ├── index.js                 # Entry point
│       └── index.css                # Global styles
│
├── ⚙️ Backend (Flask API)
│   └── backend/
│       ├── simple_app.py            # Main API server
│       ├── roadmap_scraper.py       # Roadmap integration
│       ├── requirements.txt         # Python dependencies
│       │
│       ├── database/                # Database layer
│       │   ├── __init__.py
│       │   ├── sqlite_db.py
│       │   └── postgres_db.py
│       │
│       └── data/                    # Backend data
│           └── career_guidance.db
│
├── 🤖 Machine Learning
│   ├── ml_models/                   # ML models
│   │   ├── resume_tip_recommender.py
│   │   ├── hybrid_ensemble_recommender.py
│   │   ├── resume_tip_model.pkl     # Trained model
│   │   ├── training_metrics.json
│   │   └── model_comparison_report.json
│   │
│   ├── bandit/                      # Recommendation algorithms
│   │   ├── linucb.py
│   │   ├── baselines.py
│   │   ├── cold_start.py
│   │   ├── multi_objective.py
│   │   └── neural_ucb.py
│   │
│   ├── preprocessing/               # Data preprocessing
│   │   ├── feature_engineering.py
│   │   ├── github_analyzer.py
│   │   └── resume_parser.py
│   │
│   └── train_resume_tip_model.py   # Model training script
│
├── 📊 Data
│   └── data/
│       ├── career_guidance.db       # Main database
│       ├── generate_training_data.py
│       ├── resume_tips_training_data.json
│       ├── roles_skills.csv
│       ├── skill_metadata.csv
│       ├── learner_profiles.csv
│       └── uploads/                 # User uploads
│
├── ⚙️ Configuration
│   ├── package.json                 # Node dependencies
│   ├── package-lock.json
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   └── start-backend.sh             # Backend startup script
│
└── 🧪 Tests (Future)
    └── tests/
        ├── frontend/
        ├── backend/
        └── ml/
```

## 📂 Directory Purposes

### Frontend (`src/`)
- **components/**: Reusable React components
- **services/**: API communication layer
- **data/**: Static data files (quiz questions, etc.)
- **styles/**: CSS stylesheets

### Backend (`backend/`)
- **simple_app.py**: Main Flask application with all API endpoints
- **database/**: Database connection and queries
- **data/**: Backend-specific data storage

### ML (`ml_models/`, `bandit/`, `preprocessing/`)
- **ml_models/**: Trained models and model classes
- **bandit/**: Recommendation algorithms
- **preprocessing/**: Data cleaning and feature extraction

### Data (`data/`)
- Training data, databases, and user uploads
- CSV files with role and skill information

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `src/App.js` | Main React component |
| `backend/simple_app.py` | Flask API server |
| `ml_models/resume_tip_model.pkl` | Trained ML model |
| `src/data/questionBank.json` | Quiz questions |
| `data/resume_tips_training_data.json` | Training data |

## 🚀 Quick Navigation

**Starting the app:**
- Frontend: `npm start` (from root)
- Backend: `python3 backend/simple_app.py`

**Key entry points:**
- Frontend: `src/index.js` → `src/App.js`
- Backend: `backend/simple_app.py`
- ML: `ml_models/resume_tip_recommender.py`
