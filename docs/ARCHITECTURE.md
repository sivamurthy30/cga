# 🏗️ DEVA Architecture Guide

## System Architecture Overview

This document explains how all the pieces of DEVA work together.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              REACT FRONTEND (Port 3000)               │    │
│  │                                                       │    │
│  │  Components:                                          │    │
│  │  • Auth.jsx          (Login/Signup)                  │    │
│  │  • OnboardingFlow    (Career Selection)              │    │
│  │  • SkillAssessment   (Quiz)                          │    │
│  │  • InteractiveRoadmap (Results)                      │    │
│  └───────────────────┬───────────────────────────────────┘    │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ HTTP Requests (Axios)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (Port 5001)                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  API ENDPOINTS                          │  │
│  │                                                         │  │
│  │  /api/auth/*        → Authentication                   │  │
│  │  /resume/upload     → Resume Parser                    │  │
│  │  /github/analyze    → GitHub Analyzer                  │  │
│  │  /api/recommend     → ML Recommender                   │  │
│  │  /api/skill-gaps    → Gap Analysis                     │  │
│  │  /roadmap/*         → Roadmap Data                     │  │
│  └─────────────────────┬───────────────────────────────────┘  │
│                        │                                        │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────┴────────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│   SQLite DB      │            │   ML MODEL       │
│                  │            │                  │
│  • Users         │            │  • Random Forest │
│  • Profiles      │            │  • 99.9% Acc     │
│  • Skills        │            │  • 50k Samples   │
│  • Results       │            │                  │
└──────────────────┘            └──────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Registration & Login

```
User enters credentials
        │
        ▼
┌─────────────────┐
│  Auth.jsx       │  Validates input
└────────┬────────┘
         │ POST /api/auth/signup or /api/auth/login
         ▼
┌─────────────────┐
│  Flask Backend  │  Checks credentials
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite DB      │  Stores/retrieves user
└────────┬────────┘
         │
         ▼
Returns JWT token
         │
         ▼
Stored in localStorage
         │
         ▼
User logged in ✅
```

### Skill Assessment Flow

```
User selects role
        │
        ▼
┌─────────────────────┐
│ OnboardingFlow.jsx  │  Shows 33 roles
└──────────┬──────────┘
           │
           ▼
User adds skills (3 ways):
├─→ Manual input
├─→ Resume upload
└─→ GitHub connect
           │
           ▼
┌─────────────────────┐
│  Backend Processing │
│  • Parse resume     │
│  • Analyze GitHub   │
│  • Extract skills   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ML Model           │  Suggests best role
│  (Random Forest)    │  based on skills
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SkillAssessment.jsx │  Shows quiz
└──────────┬──────────┘
           │
           ▼
User answers questions
           │
           ▼
┌─────────────────────┐
│  Gap Analysis       │  Compares skills
│                     │  with role requirements
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ InteractiveRoadmap  │  Shows results
│  • Skill gaps       │  & learning path
│  • Recommendations  │
│  • Resources        │
└─────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Components

```
App.js (Root)
│
├─→ Auth.jsx
│   ├─→ Login Form
│   └─→ Signup Form
│
├─→ OnboardingFlow.jsx
│   ├─→ Interest Quiz
│   ├─→ Role Selection (33 roles)
│   └─→ Skills Input
│       ├─→ Manual Input
│       ├─→ Resume Upload
│       └─→ GitHub Connect
│
├─→ SkillAssessmentQuiz.jsx
│   ├─→ Question Display
│   ├─→ Answer Options
│   ├─→ Progress Bar
│   └─→ Timer
│
├─→ InteractiveRoadmap.jsx
│   ├─→ Results Overview
│   ├─→ Skill Gap Cards
│   ├─→ Learning Roadmap
│   └─→ Resources Panel
│
└─→ AdvancedFeatures.jsx
    ├─→ Resume Analyzer
    ├─→ GitHub Analyzer
    └─→ ML Insights
```

### Backend Structure

```
simple_app.py (Main Flask App)
│
├─→ Authentication Routes
│   ├─→ /api/auth/signup
│   ├─→ /api/auth/login
│   └─→ /api/auth/verify
│
├─→ Analysis Routes
│   ├─→ /resume/upload
│   ├─→ /github/analyze
│   └─→ /ai/suggest-role
│
├─→ Recommendation Routes
│   ├─→ /api/recommend
│   └─→ /api/skill-gaps
│
└─→ Roadmap Routes
    ├─→ /roadmap/available
    └─→ /roadmap/role/<role>
```

---

## 🤖 ML Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAINING PHASE                           │
└─────────────────────────────────────────────────────────────┘

Step 1: Data Generation
┌─────────────────────┐
│ generate_training_  │  Creates 50,000 samples
│ data.py             │  for 33 roles
└──────────┬──────────┘
           │
           ▼
Step 2: Feature Engineering
┌─────────────────────┐
│ Features:           │
│ • Role              │
│ • Skills (list)     │
│ • Projects (list)   │
│ • Experience (years)│
│ • Certifications    │
└──────────┬──────────┘
           │
           ▼
Step 3: Model Training
┌─────────────────────┐
│ Random Forest       │  Trains on 50k samples
│ Classifier          │  Achieves 99.9% accuracy
└──────────┬──────────┘
           │
           ▼
Step 4: Model Saving
┌─────────────────────┐
│ resume_tip_model.pkl│  Saved model file
└─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   PREDICTION PHASE                          │
└─────────────────────────────────────────────────────────────┘

User Input
    │
    ▼
┌─────────────────────┐
│ Extract Features    │  Parse user data
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Load Model          │  Load .pkl file
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Make Prediction     │  Predict best role
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Generate Tips       │  Personalized advice
└─────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    target_role TEXT,
    current_skills TEXT,  -- JSON array
    experience_years INTEGER,
    education TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Assessment Results Table
CREATE TABLE assessment_results (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    role TEXT,
    score INTEGER,
    skill_gaps TEXT,  -- JSON array
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Skills Table
CREATE TABLE skills (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    difficulty TEXT,
    learning_time_hours INTEGER
);

-- Role Skills Mapping
CREATE TABLE role_skills (
    id INTEGER PRIMARY KEY,
    role TEXT,
    skill_id INTEGER,
    importance INTEGER,  -- 1-10
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Authentication
┌─────────────────────┐
│ JWT Tokens          │  Secure token-based auth
│ • Expires in 24h    │
│ • Stored in         │
│   localStorage      │
└─────────────────────┘

Layer 2: Password Security
┌─────────────────────┐
│ bcrypt Hashing      │  Passwords never stored
│ • Salt rounds: 12   │  in plain text
└─────────────────────┘

Layer 3: API Security
┌─────────────────────┐
│ CORS Protection     │  Only allowed origins
│ Rate Limiting       │  Prevent abuse
│ Input Validation    │  Sanitize all inputs
└─────────────────────┘

Layer 4: Data Security
┌─────────────────────┐
│ SQL Injection       │  Parameterized queries
│ Prevention          │
│ XSS Protection      │  Escape user input
└─────────────────────┘
```

---

## 📡 API Communication

### Request/Response Flow

```
Frontend                    Backend
   │                           │
   │  1. POST /api/auth/login  │
   ├──────────────────────────>│
   │                           │
   │  { email, password }      │
   │                           │
   │                           │  2. Validate
   │                           │     credentials
   │                           │
   │  3. Response              │
   │<──────────────────────────┤
   │                           │
   │  { token, user }          │
   │                           │
   │  4. Store token           │
   │     in localStorage       │
   │                           │
   │  5. All future requests   │
   │     include token         │
   ├──────────────────────────>│
   │                           │
   │  Authorization: Bearer    │
   │  <token>                  │
   │                           │
```

### API Response Format

```json
Success Response:
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful"
}

Error Response:
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🎨 Frontend State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE FLOW                               │
└─────────────────────────────────────────────────────────────┘

App.js (Root State)
│
├─→ authState
│   ├─→ isAuthenticated: boolean
│   ├─→ user: object
│   └─→ token: string
│
├─→ profileState
│   ├─→ targetRole: string
│   ├─→ skills: array
│   ├─→ experience: number
│   └─→ assessmentComplete: boolean
│
├─→ quizState
│   ├─→ currentQuestion: number
│   ├─→ answers: array
│   ├─→ score: number
│   └─→ timeRemaining: number
│
└─→ resultsState
    ├─→ skillGaps: array
    ├─→ recommendations: array
    ├─→ roadmap: object
    └─→ resources: array
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                         │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
├─→ Build: npm run build
├─→ Output: build/ folder
└─→ Deploy to: Netlify, Vercel, or AWS S3

Backend (Flask)
├─→ Server: Gunicorn or uWSGI
├─→ Database: PostgreSQL (production)
└─→ Deploy to: Heroku, AWS EC2, or DigitalOcean

ML Model
├─→ Model file: resume_tip_model.pkl
├─→ Size: ~50MB
└─→ Loaded on server startup

Environment Variables
├─→ DATABASE_URL
├─→ SECRET_KEY
├─→ GITHUB_TOKEN
└─→ CORS_ORIGINS
```

---

## 📊 Performance Optimization

```
Frontend Optimizations:
├─→ Code Splitting (React.lazy)
├─→ Image Optimization
├─→ CSS Minification
├─→ Gzip Compression
└─→ CDN for static assets

Backend Optimizations:
├─→ Database Indexing
├─→ Query Optimization
├─→ Caching (Redis)
├─→ Connection Pooling
└─→ Load Balancing

ML Model Optimizations:
├─→ Model Compression
├─→ Batch Predictions
├─→ Feature Caching
└─→ Async Processing
```

---

## 🔍 Monitoring & Logging

```
Frontend Monitoring:
├─→ Error Tracking (Sentry)
├─→ Analytics (Google Analytics)
└─→ Performance (Lighthouse)

Backend Monitoring:
├─→ API Logs (Flask logging)
├─→ Error Tracking
├─→ Performance Metrics
└─→ Database Queries

ML Model Monitoring:
├─→ Prediction Accuracy
├─→ Response Time
└─→ Model Drift Detection
```

---

## 🧪 Testing Architecture

```
Frontend Tests:
├─→ Unit Tests (Jest)
├─→ Component Tests (React Testing Library)
└─→ E2E Tests (Cypress)

Backend Tests:
├─→ Unit Tests (pytest)
├─→ Integration Tests
└─→ API Tests (Postman)

ML Model Tests:
├─→ Model Accuracy Tests
├─→ Feature Engineering Tests
└─→ Prediction Tests
```

---

## 📈 Scalability Considerations

```
Current Setup (Development):
├─→ Single server
├─→ SQLite database
└─→ ~100 concurrent users

Scalable Setup (Production):
├─→ Load balancer
├─→ Multiple app servers
├─→ PostgreSQL with replication
├─→ Redis for caching
├─→ CDN for static files
└─→ ~10,000+ concurrent users
```

---

## 🎯 Key Takeaways

1. **Modular Design**: Each component has a single responsibility
2. **Clear Separation**: Frontend, Backend, and ML are independent
3. **RESTful API**: Standard HTTP methods and status codes
4. **Secure by Default**: Authentication, validation, and encryption
5. **Scalable**: Can grow from 100 to 10,000+ users
6. **Maintainable**: Clear structure and documentation

---

**For more details, see:**
- `GETTING_STARTED.md` - Quick start guide
- `README.md` - Full documentation
- `ML_MODELS_EXPLAINED.md` - ML details

Last Updated: February 16, 2026
