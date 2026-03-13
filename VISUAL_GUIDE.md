# 🎨 Visual Guide - DEVA Platform

## Quick Visual Overview

### 🎯 What is DEVA?

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   DEVA = AI Career Guidance for Tech Students      │
│                                                     │
│   Input: Your skills, interests, resume             │
│      ↓                                              │
│   AI Analysis                                       │
│      ↓                                              │
│   Output: Career path + Learning roadmap            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 📱 User Journey (5 Minutes)

```
START
  ↓
[Sign Up] → Enter name, email, password
  ↓
[Interest Quiz] → 5 quick questions
  ↓
[Choose Role] → Pick from 33 tech careers
  ↓
[Add Skills] → Type, upload resume, or GitHub
  ↓
[AI Analysis] → AI suggests best fit
  ↓
[Take Quiz] → Answer technical questions
  ↓
[View Results] → See gaps + roadmap
  ↓
END
```


### 🏗️ System Components

```
┌──────────────┐
│   BROWSER    │  ← What you see
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   REACT      │  ← Frontend (UI)
│   Frontend   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   FLASK      │  ← Backend (Server)
│   Backend    │
└──────┬───────┘
       │
       ├─→ [Database] ← Store user data
       │
       └─→ [ML Model] ← AI predictions
```

### 🎮 Main Features

```
┌─────────────────────────────────────────┐
│  1. Career Selection                    │
│     33 tech roles to choose from        │
│     ✓ Web Dev  ✓ Data Science          │
│     ✓ DevOps   ✓ Mobile Dev            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  2. Skill Assessment                    │
│     80+ technical questions             │
│     Real-world scenarios                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  3. AI Analysis                         │
│     99.9% accurate predictions          │
│     Resume + GitHub analysis            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  4. Learning Roadmap                    │
│     Step-by-step guidance               │
│     Resources + Projects                │
└─────────────────────────────────────────┘
```

### 📊 Tech Stack

```
Frontend:
  React → JavaScript library for UI
  CSS3 → Styling
  Axios → API calls

Backend:
  Flask → Python web framework
  SQLite → Database
  scikit-learn → Machine learning

AI/ML:
  Random Forest → Classification model
  spaCy → Natural language processing
  50,000 samples → Training data
```

### 🔄 Data Flow Example

```
User uploads resume
       ↓
Backend receives PDF
       ↓
Extract text from PDF
       ↓
Parse skills using NLP
       ↓
Send to ML model
       ↓
Model predicts best role
       ↓
Return to frontend
       ↓
Display to user
```

### 📁 File Organization

```
cga/
├── src/              ← Frontend code
│   ├── App.js        ← Main app
│   └── components/   ← UI pieces
│
├── backend/          ← Server code
│   └── simple_app.py ← API
│
├── ml_models/        ← AI brain
│   └── *.pkl         ← Trained model
│
└── data/             ← Training data
```

### 🎯 For Students

**Easy → Hard Learning Path:**

1. Start: Look at `src/App.js`
2. Next: Check `src/components/Auth.jsx`
3. Then: Read `backend/simple_app.py`
4. Finally: Study ML model

### 🚀 Quick Commands

```bash
# Start backend
python3 backend/simple_app.py

# Start frontend (new terminal)
npm start

# Open browser
http://localhost:3000
```

### ✅ Success Indicators

```
✓ Backend shows: "Running on http://localhost:5001"
✓ Frontend opens in browser automatically
✓ You can create an account
✓ Quiz loads without errors
✓ Results display correctly
```

---

**Need more details?**
- Simple guide: `GETTING_STARTED.md`
- Architecture: `ARCHITECTURE.md`
- Full docs: `README.md`
