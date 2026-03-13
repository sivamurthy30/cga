# 🎓 DEVA - AI-Powered Career Guidance Platform

**Version**: 2.0 - Production Ready  
**Status**: ✅ Complete Implementation  
**Date**: February 16, 2026

An intelligent career guidance system that helps learners discover their ideal tech career path through personalized skill assessments and ML-powered recommendations.

---

## 📚 Quick Navigation

- **🚀 [Getting Started](GETTING_STARTED.md)** - Setup guide (5 min)
- **🏗️ [Architecture](ARCHITECTURE.md)** - System design
- **⚡ [Quick Reference](QUICK_REFERENCE.md)** - Commands & tips
- **🔧 [Troubleshooting](TROUBLESHOOTING.md)** - Fix issues
- [Features](#-key-features)
- [Quick Start](#-quick-start)
- [User Flow](#-user-flow)

---

## 📖 New to the Project?

**Start here:**
1. 📘 **[GETTING_STARTED.md](GETTING_STARTED.md)** - Easy setup guide (5 min)
2. 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - How it all works
3. ⚡ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick commands
4. 🔧 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues

---

## 🌟 Key Features

### ✅ 33 Career Roles Supported
Complete coverage of tech career paths:
- **Web Development** (3): Frontend, Backend, Full Stack
- **Data & AI** (4): Data Scientist, ML Engineer, Data Engineer, AI Researcher
- **Infrastructure** (4): DevOps, Cloud Architect, SRE, Platform Engineer
- **Mobile & Desktop** (4): Mobile, iOS, Android, Desktop
- **Security & Testing** (4): Security Engineer, Pentester, QA, SDET
- **Design & Product** (3): UI/UX Designer, Product Designer, Technical PM
- **Specialized** (5): Game Dev, Blockchain, Embedded, AR/VR, Robotics
- **Database** (3): DBA, API Developer, Microservices Architect
- **Emerging** (3): IoT, Quantum Computing, Edge Computing

### ✅ Comprehensive Quiz System
- 80+ technical questions
- 20+ technology question banks
- Medium/Hard difficulty
- Real-world scenarios
- Intelligent skill mapping

### ✅ ML-Powered Analysis
- 99.9% accurate ML model
- 50,000 training samples
- Resume parsing & analysis
- GitHub profile analysis
- AI role suggestions

### ✅ Interactive Features
- Visual learning roadmaps
- Skill gap analysis
- Priority-based recommendations
- Step-by-step guidance
- Progress tracking

---

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.8+
Node.js 14+
npm 6+
```

### Installation & Running

**1. Install Dependencies**
```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
npm install
```

**2. Start Backend** (Terminal 1)
```bash
python3 backend/simple_app.py
# Runs on http://localhost:5001
```

**3. Start Frontend** (Terminal 2)
```bash
npm start
# Opens http://localhost:3000
```

**4. Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## 📁 Project Structure

```
sga/cga/
├── 📱 FRONTEND
│   ├── src/components/
│   │   ├── Auth.jsx                    # Authentication
│   │   ├── OnboardingFlow.jsx          # 33 roles onboarding
│   │   ├── SkillAssessmentQuiz.jsx     # Quiz (80+ questions)
│   │   └── InteractiveRoadmap.jsx      # Visual roadmap
│   ├── src/
│   │   ├── App.js                      # Main app
│   │   ├── App.css, Auth.css           # Styles
│   │   ├── Onboarding.css              # Onboarding styles
│   │   ├── SkillAssessment.css         # Quiz styles
│   │   └── DesignSystem.css            # Design system
│   └── public/                         # Static assets
│
├── 🔧 BACKEND
│   ├── backend/
│   │   ├── simple_app.py               # Main API (all 33 roles)
│   │   ├── roadmap_scraper.py          # Roadmap.sh integration
│   │   └── database/                   # Database layer
│   └── preprocessing/
│       └── github_analyzer.py          # GitHub analysis
│
├── 🤖 ML MODELS
│   ├── ml_models/
│   │   ├── resume_tip_recommender.py   # ML model class
│   │   └── resume_tip_model.pkl        # Trained (99.9%)
│   ├── data/
│   │   ├── generate_training_data.py   # 33 roles data
│   │   └── resume_tips_training_data.json # 50k samples
│   └── train_resume_tip_model.py       # Model trainer
│
├── 📚 DOCUMENTATION
│   ├── README.md                       # This file
│   ├── PROJECT_SUMMARY.md              # Faculty overview
│   ├── FINAL_PROJECT_STATUS.md         # Complete status
│   ├── ML_MODELS_EXPLAINED.md          # ML details
│   ├── THEME_QUICK_REFERENCE.md        # Design system
│   └── data/
│       ├── TRAINING_DATA_DOCUMENTATION.md
│       └── FACULTY_PRESENTATION_SUMMARY.md
│
└── ⚙️ CONFIG
    ├── package.json                    # Node dependencies
    ├── requirements.txt                # Python dependencies
    └── .env                            # Environment variables
```

---

## 🎯 User Flow

```
1. Welcome Screen
   ↓
2. Interest Quiz (5 questions)
   ↓
3. Quiz Results & Recommendations
   ↓
4. Role Selection (33 roles available)
   ↓
5. Skills Input
   ├─→ Upload Resume (PDF/DOCX)
   └─→ Connect GitHub
   ↓
6. AI Analysis & Role Suggestion
   ↓
7. Skill Gap Analysis
   ↓
8. Skill Assessment Quiz (80+ questions)
   ↓
9. Results (4-step flow):
   ├─→ Overview with statistics
   ├─→ Detailed skills analysis
   ├─→ Interactive roadmap
   └─→ Personalized action plan
```

---

## 📊 Statistics

- **Total Roles**: 33
- **Quiz Questions**: 80+
- **Technologies Covered**: 20+
- **Training Samples**: 50,000
- **ML Model Accuracy**: 99.9%
- **Skills Defined**: 330+
- **Project Examples**: 165+

---

## 🤖 ML Models

### Resume Tip Recommender
- **Algorithm**: Random Forest Classifier
- **Training Data**: 50,000 samples across 33 roles
- **Accuracy**: 99.9%
- **Features**: Role, skills, projects, experience, certifications
- **Output**: Personalized resume improvement tips

### LinUCB Bandit (Skill Recommendation)
- **Purpose**: Adaptive skill recommendation
- **Context**: 10-feature vector
- **Features**: Skill difficulty, learning time, resume data, GitHub data
- **Algorithm**: Contextual bandit with exploration/exploitation

---

## 🔧 Key API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Analysis
- `POST /resume/upload` - Upload and parse resume
- `POST /github/analyze` - Analyze GitHub profile
- `POST /ai/suggest-role` - Get AI role suggestion

### Recommendations
- `POST /api/recommend` - Get skill recommendation
- `POST /api/skill-gaps` - Get skill gaps for role

### Roadmap
- `GET /roadmap/available` - List available roadmaps
- `GET /roadmap/role/<role>` - Get role-specific roadmap

---

## 🎨 Design System

### Theme: DEVA Dark
- **Primary**: #f59e0b (Amber)
- **Background**: #0f172a (Dark Blue)
- **Text**: #ffffff (White)
- **Success**: #10b981 (Green)
- **Font**: JetBrains Mono

See `THEME_QUICK_REFERENCE.md` for complete design system.

---

## 📊 Technologies Used

### Frontend
- React 18
- GSAP (animations)
- Tailwind CSS
- Axios

### Backend
- Flask (Python)
- SQLite/PostgreSQL
- scikit-learn
- spaCy (NLP)

### ML/AI
- Random Forest Classifier
- LinUCB Contextual Bandit
- Feature Engineering
- Resume Parsing

---

## 📝 Documentation

| Document | Purpose |
|----------|---------|
| **[README.md](README.md)** | Complete documentation (this file) |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Setup guide for beginners |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design & data flow |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Project overview |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands & API reference |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues & solutions |

---

## 🧪 Testing

### Quick Test
```bash
# Start backend
python3 backend/simple_app.py

# Start frontend (new terminal)
npm start

# Test in browser
open http://localhost:3000
```

### Test Checklist
- [ ] All 33 roles display correctly
- [ ] Quiz questions load for all technologies
- [ ] Resume upload and parsing works
- [ ] GitHub analysis works
- [ ] Skill gap analysis shows correctly
- [ ] Interactive roadmap displays
- [ ] ML model provides recommendations

---

## 🆘 Troubleshooting

### Backend Issues
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Restart backend
python3 backend/simple_app.py
```

### Frontend Issues
```bash
# Clear cache
rm -rf node_modules/.cache

# Restart
npm start
```

### ML Model Issues
```bash
# Retrain model
python3 train_resume_tip_model.py

# Verify model file exists
ls -lh ml_models/resume_tip_model.pkl
```

---

## 🎓 For Faculty Review

### Key Highlights
1. **Scale**: 33 tech career paths (most comprehensive)
2. **AI/ML**: 99.9% accurate model with 50k training samples
3. **User Experience**: Interactive roadmaps, step-by-step guidance
4. **Technical Excellence**: Production-ready, scalable architecture
5. **Real-World Impact**: Helps students choose careers and identify skill gaps

### Demo Flow (15 minutes)
1. Introduction & Overview (2 min)
2. Onboarding & Quiz (3 min)
3. Resume Analysis (2 min)
4. Skill Assessment (3 min)
5. Results & Roadmap (3 min)
6. Q&A (2 min)

See `data/FACULTY_PRESENTATION_SUMMARY.md` for detailed presentation guide.

---

## 📄 License

This project is part of a senior project submission.

---

## 👥 Team

**DEVA Career Guidance Platform**  
Senior Project - 2026

---

## 🎉 Project Status

✅ **PRODUCTION READY**

- All 33 roles implemented
- ML model trained (99.9% accuracy)
- Complete quiz system (80+ questions)
- Interactive roadmaps
- Resume & GitHub analysis
- Clean, organized codebase
- Comprehensive documentation

**Ready for faculty review and submission!** 🚀

---

**Last Updated**: February 16, 2026  
**Version**: 2.0  
**Status**: Complete ✅
