# ⚡ Quick Reference Card

## 🚀 Start the App (2 Commands)

```bash
# Terminal 1: Backend
cd cga && python3 backend/simple_app.py

# Terminal 2: Frontend
cd cga && npm start
```

## 🌐 URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/App.js` | Main app component |
| `backend/simple_app.py` | API server |
| `ml_models/resume_tip_model.pkl` | AI model |
| `src/data/questionBank.json` | Quiz questions |

## 🔧 Common Commands

```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Kill port 5001
lsof -ti:5001 | xargs kill -9

# Clear cache
rm -rf node_modules/.cache

# Retrain ML model
python3 train_resume_tip_model.py
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `lsof -ti:5001 \| xargs kill -9` |
| Module not found | `pip install -r requirements.txt` |
| Frontend won't start | `rm -rf node_modules && npm install` |
| Backend error | Check if Python 3.8+ installed |

## 📊 Project Stats

- **Roles**: 33 tech careers
- **Questions**: 80+ technical
- **ML Accuracy**: 99.9%
- **Training Data**: 50,000 samples

## 🎯 User Flow (7 Steps)

1. Sign Up
2. Interest Quiz
3. Choose Role
4. Add Skills
5. AI Analysis
6. Take Assessment
7. View Results

## 🔑 API Endpoints

```
POST /api/auth/signup       - Create account
POST /api/auth/login        - Login
POST /resume/upload         - Upload resume
POST /github/analyze        - Analyze GitHub
POST /api/recommend         - Get recommendations
GET  /roadmap/role/<role>   - Get roadmap
```

## 📚 Documentation

- 🚀 **GETTING_STARTED.md** - Beginner guide
- 🏗️ **ARCHITECTURE.md** - System design
- 🎨 **VISUAL_GUIDE.md** - Visual overview
- 📖 **README.md** - Full documentation

## 💡 Quick Tips

- Always start backend before frontend
- Check both terminals for errors
- Use Chrome DevTools for debugging
- Check browser console for errors

## 🎓 For Developers

```javascript
// Frontend: Make API call
import axios from 'axios';
const response = await axios.post('/api/endpoint', data);

// Backend: Create endpoint
@app.route('/api/endpoint', methods=['POST'])
def endpoint():
    return jsonify({'success': True})
```

## 🔐 Environment Variables

```bash
# .env file
DATABASE_URL=sqlite:///data/career_guidance.db
SECRET_KEY=your-secret-key
GITHUB_TOKEN=your-github-token
```

## ✅ Pre-Launch Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Can create account
- [ ] Quiz loads
- [ ] ML model responds
- [ ] Results display

---

**Last Updated**: February 16, 2026
