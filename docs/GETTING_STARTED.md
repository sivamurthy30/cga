# 🚀 Getting Started - Simple Guide

## For Students & Developers

This guide will help you understand and run the DEVA Career Guidance Platform in 5 minutes.

---

## 📖 What Does This App Do?

**DEVA helps students find their ideal tech career path:**

1. 🎯 Take a quick interest quiz
2. 📝 Choose from 33 tech career roles
3. 🤖 Get AI-powered skill analysis
4. 📊 See your skill gaps
5. 🗺️ Get a personalized learning roadmap

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Everything

Open your terminal and run:

```bash
# Go to the project folder
cd cga

# Install Python packages
pip install -r requirements.txt

# Install Node packages
npm install
```

### Step 2: Start the Backend

Open a terminal and run:

```bash
cd cga
python3 backend/simple_app.py
```

You should see: `✅ Backend running on http://localhost:5001`

### Step 3: Start the Frontend

Open a NEW terminal and run:

```bash
cd cga
npm start
```

Your browser will open automatically at `http://localhost:3000`

---

## 🎮 How to Use the App

### 1️⃣ Create an Account
- Click "Sign Up"
- Enter your name, email, and password
- Click "Create Account"

### 2️⃣ Take the Interest Quiz
- Answer 5 simple questions about your interests
- Get personalized role recommendations

### 3️⃣ Choose Your Career Path
- Browse 33 different tech roles
- Examples: Frontend Developer, Data Scientist, DevOps Engineer
- Click on the role that interests you

### 4️⃣ Add Your Skills
- Type in skills you already know (e.g., "Python", "React")
- OR upload your resume (PDF/DOCX)
- OR connect your GitHub account

### 5️⃣ Take the Skill Assessment
- Answer technical questions about your chosen role
- Questions are based on real-world scenarios
- Takes about 10-15 minutes

### 6️⃣ View Your Results
- See your skill gaps
- Get a personalized learning roadmap
- See recommended resources and projects

---

## 📁 Project Structure (Simplified)

```
cga/
│
├── 🎨 FRONTEND (What users see)
│   ├── src/
│   │   ├── App.js                  ← Main app file
│   │   ├── components/
│   │   │   ├── Auth.jsx            ← Login/Signup
│   │   │   ├── OnboardingFlow.jsx  ← Career selection
│   │   │   ├── SkillAssessmentQuiz.jsx ← Quiz
│   │   │   └── InteractiveRoadmap.jsx  ← Roadmap
│   │   └── App.css                 ← Styles
│   └── public/                     ← Images, icons
│
├── ⚙️ BACKEND (Server & API)
│   ├── backend/
│   │   ├── simple_app.py           ← Main server file
│   │   └── database/               ← Database code
│   └── preprocessing/
│       └── github_analyzer.py      ← GitHub analysis
│
├── 🤖 ML MODELS (AI Brain)
│   ├── ml_models/
│   │   ├── resume_tip_recommender.py ← AI model
│   │   └── resume_tip_model.pkl      ← Trained model
│   └── data/
│       └── resume_tips_training_data.json ← Training data
│
└── 📚 DOCS (Documentation)
    ├── README.md                   ← Full documentation
    ├── GETTING_STARTED.md          ← This file!
    └── PROJECT_SUMMARY.md          ← Project overview
```

---

## 🔄 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     START: Welcome Screen                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 1: Sign Up / Login                         │
│              Enter name, email, password                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 2: Interest Quiz                           │
│              5 questions about your interests                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 3: Choose Career Role                      │
│              33 roles: Frontend, Data Science, etc.          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 4: Add Your Skills                         │
│              • Type skills manually                          │
│              • Upload resume (PDF/DOCX)                      │
│              • Connect GitHub                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 5: AI Analysis                             │
│              AI analyzes your skills & suggests best role    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 6: Skill Assessment Quiz                   │
│              Answer technical questions (10-15 min)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Step 7: View Results                            │
│              • Skill gaps identified                         │
│              • Learning roadmap                              │
│              • Recommended resources                         │
│              • Next steps                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Common Issues & Solutions

### ❌ "Port 5001 already in use"

**Solution:**
```bash
# Kill the process using port 5001
lsof -ti:5001 | xargs kill -9

# Then restart backend
python3 backend/simple_app.py
```

### ❌ "Module not found" error

**Solution:**
```bash
# Reinstall Python packages
pip install -r requirements.txt

# Reinstall Node packages
rm -rf node_modules
npm install
```

### ❌ Backend not connecting

**Solution:**
1. Make sure backend is running (check Terminal 1)
2. Check if you see "Backend running on http://localhost:5001"
3. Try restarting both backend and frontend

### ❌ Quiz questions not loading

**Solution:**
```bash
# Check if question bank file exists
ls src/data/questionBank.json

# If missing, the file should be in src/data/
```

---

## 📊 Key Features Explained

### 1. 33 Career Roles
We support all major tech careers:
- **Web**: Frontend, Backend, Full Stack
- **Data**: Data Scientist, ML Engineer, Data Analyst
- **Cloud**: DevOps, Cloud Architect, SRE
- **Mobile**: iOS, Android, React Native
- **Security**: Security Engineer, Penetration Tester
- **And 18 more!**

### 2. AI-Powered Analysis
- **99.9% accurate** ML model
- Trained on **50,000 samples**
- Analyzes your resume and GitHub
- Suggests best career fit

### 3. Skill Assessment
- **80+ technical questions**
- **20+ technology areas**
- Real-world scenarios
- Instant feedback

### 4. Interactive Roadmap
- Visual learning path
- Step-by-step guidance
- Recommended resources
- Project ideas

---

## 🎯 For Developers

### Tech Stack

**Frontend:**
- React 18
- CSS3 (custom design system)
- Axios for API calls

**Backend:**
- Flask (Python)
- SQLite database
- RESTful API

**ML/AI:**
- scikit-learn (Random Forest)
- spaCy (NLP)
- Custom feature engineering

### API Endpoints

```
Authentication:
POST /api/auth/signup       - Create account
POST /api/auth/login        - Login
GET  /api/auth/verify       - Verify token

Analysis:
POST /resume/upload         - Upload resume
POST /github/analyze        - Analyze GitHub
POST /ai/suggest-role       - Get AI suggestion

Recommendations:
POST /api/recommend         - Get recommendations
POST /api/skill-gaps        - Get skill gaps

Roadmap:
GET  /roadmap/available     - List roadmaps
GET  /roadmap/role/<role>   - Get role roadmap
```

### File Structure for Developers

```
Key Files to Understand:

Frontend:
- src/App.js                    ← Main component
- src/components/Auth.jsx       ← Authentication logic
- src/components/OnboardingFlow.jsx ← Role selection
- src/components/SkillAssessmentQuiz.jsx ← Quiz logic
- src/services/apiService.js    ← API calls

Backend:
- backend/simple_app.py         ← All API endpoints
- backend/database/sqlite_db.py ← Database operations
- preprocessing/github_analyzer.py ← GitHub API

ML:
- ml_models/resume_tip_recommender.py ← ML model class
- train_resume_tip_model.py     ← Model training
- data/generate_training_data.py ← Data generation
```

---

## 🎓 For Students

### Understanding the Code

**Start with these files in order:**

1. **src/App.js** - See how the app is structured
2. **src/components/Auth.jsx** - Learn authentication
3. **backend/simple_app.py** - Understand the API
4. **ml_models/resume_tip_recommender.py** - See ML in action

### Learning Path

1. **Week 1**: Understand React basics and component structure
2. **Week 2**: Learn Flask and API development
3. **Week 3**: Study ML model and training process
4. **Week 4**: Explore database and data flow

### Key Concepts

- **React Components**: Reusable UI pieces
- **State Management**: How data flows in the app
- **API Calls**: Frontend ↔ Backend communication
- **ML Pipeline**: Data → Training → Prediction
- **Database**: Storing user data and results

---

## 📞 Need Help?

### Quick Checks

1. ✅ Is backend running? (Check Terminal 1)
2. ✅ Is frontend running? (Check Terminal 2)
3. ✅ Are both on correct ports? (5001 and 3000)
4. ✅ Did you install all dependencies?

### Debug Mode

Add this to see detailed logs:

```bash
# Backend with debug
python3 backend/simple_app.py --debug

# Frontend with verbose
REACT_APP_DEBUG=true npm start
```

---

## 🎉 Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Can create an account
- [ ] Can take interest quiz
- [ ] Can select a career role
- [ ] Can add skills
- [ ] Can take skill assessment
- [ ] Can view results and roadmap

---

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`
- **ML Details**: See `ML_MODELS_EXPLAINED.md`
- **Design System**: See `THEME_QUICK_REFERENCE.md`

---

**Made with ❤️ for students and developers**

Last Updated: February 16, 2026
