# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### ❌ Issue 1: "Port 5001 already in use"

**Symptoms:**
```
Error: Address already in use
Port 5001 is already in use
```

**Solution:**
```bash
# Kill the process using port 5001
lsof -ti:5001 | xargs kill -9

# Then restart backend
python3 backend/simple_app.py
```

---

### ❌ Issue 2: "Module not found" Error

**Symptoms:**
```
ModuleNotFoundError: No module named 'flask'
ImportError: No module named 'sklearn'
```

**Solution:**
```bash
# Reinstall Python dependencies
pip install -r requirements.txt

# Or install specific package
pip install flask
pip install scikit-learn
```

---

### ❌ Issue 3: Frontend Won't Start

**Symptoms:**
```
npm ERR! code ELIFECYCLE
Error: Cannot find module
```

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Then start
npm start
```

---

### ❌ Issue 4: Backend Not Connecting

**Symptoms:**
- Frontend shows "Backend Offline"
- API calls fail
- Network errors in console

**Solution:**
```bash
# Check if backend is running
# You should see: "Running on http://localhost:5001"

# If not running, start it:
cd cga
python3 backend/simple_app.py

# Check if port is correct in frontend
# src/services/apiService.js should have:
# baseURL: 'http://localhost:5001'
```

---

### ❌ Issue 5: Quiz Questions Not Loading

**Symptoms:**
- Quiz page is blank
- "No questions available" error

**Solution:**
```bash
# Check if question bank exists
ls src/data/questionBank.json

# If missing, check git status
git status

# Restore if needed
git checkout src/data/questionBank.json
```

---

### ❌ Issue 6: ML Model Not Found

**Symptoms:**
```
FileNotFoundError: resume_tip_model.pkl not found
```

**Solution:**
```bash
# Retrain the model
python3 train_resume_tip_model.py

# Check if model file exists
ls -lh ml_models/resume_tip_model.pkl

# Should see a file ~50MB
```

---

### ❌ Issue 7: Database Errors

**Symptoms:**
```
sqlite3.OperationalError: no such table
Database is locked
```

**Solution:**
```bash
# Delete and recreate database
rm data/career_guidance.db

# Restart backend (will recreate DB)
python3 backend/simple_app.py
```

---

### ❌ Issue 8: CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```python
# In backend/simple_app.py, check CORS settings:
from flask_cors import CORS
CORS(app, origins=['http://localhost:3000'])
```

---

### ❌ Issue 9: Login/Signup Not Working

**Symptoms:**
- "Invalid credentials" error
- Can't create account
- Token errors

**Solution:**
```bash
# Check backend logs for errors
# Look in terminal where backend is running

# Clear browser localStorage
# In browser console:
localStorage.clear()

# Try again
```

---

### ❌ Issue 10: Resume Upload Fails

**Symptoms:**
- "Failed to parse resume"
- Upload button doesn't work

**Solution:**
```bash
# Check if file is PDF or DOCX
# Max file size: 5MB

# Install required packages
pip install PyPDF2 python-docx

# Restart backend
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend terminal shows all API calls
# Look for error messages in red
# Check status codes (200 = success, 500 = error)
```

### Check Frontend Console
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors in red
# Check Network tab for failed requests
```

### Test API Directly
```bash
# Test if backend is responding
curl http://localhost:5001/api/health

# Should return: {"status": "ok"}
```

---

## 🚨 Emergency Reset

If nothing works, try a complete reset:

```bash
# 1. Stop everything
# Press Ctrl+C in both terminals

# 2. Clean everything
rm -rf node_modules
rm -rf __pycache__
rm -rf backend/__pycache__
rm data/career_guidance.db

# 3. Reinstall
pip install -r requirements.txt
npm install

# 4. Restart
# Terminal 1:
python3 backend/simple_app.py

# Terminal 2:
npm start
```

---

## 📞 Still Having Issues?

### Checklist Before Asking for Help

- [ ] Tried the solutions above
- [ ] Checked both terminal outputs
- [ ] Checked browser console
- [ ] Restarted both backend and frontend
- [ ] Verified Python 3.8+ and Node 14+ installed

### Information to Provide

1. **Error message** (exact text)
2. **What you were doing** when error occurred
3. **Terminal output** from backend
4. **Browser console** errors
5. **Operating system** (Mac/Windows/Linux)

---

## 🎯 Prevention Tips

### Before Starting Work
```bash
# Always pull latest changes
git pull

# Check if dependencies updated
pip install -r requirements.txt
npm install
```

### During Development
```bash
# Save your work frequently
git add .
git commit -m "Your message"

# Keep terminals visible
# Watch for errors in real-time
```

### After Making Changes
```bash
# Test the app
# Go through main user flow
# Check for console errors
```

---

## 📚 Related Documentation

- **GETTING_STARTED.md** - Setup guide
- **QUICK_REFERENCE.md** - Common commands
- **ARCHITECTURE.md** - System design
- **README.md** - Full documentation

---

**Last Updated**: February 16, 2026
