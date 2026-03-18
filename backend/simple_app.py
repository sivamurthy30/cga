"""
Simplified Backend API for Frontend Integration
Works without database - accepts profile data directly
"""

import os
import sys
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import hashlib
import secrets
from datetime import datetime, timedelta

# Add project root to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.append(PROJECT_ROOT)

try:
    from bandit.linucb import LinUCB
    from preprocessing.feature_engineering import create_context
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("⚠️  ML modules not available, using baseline only")

try:
    from preprocessing.resume_parser import ResumeParser
    RESUME_PARSER_AVAILABLE = True
except ImportError:
    RESUME_PARSER_AVAILABLE = False
    print("⚠️  Resume parser not available")

try:
    from preprocessing.github_analyzer import GitHubAnalyzer
    GITHUB_ANALYZER_AVAILABLE = True
except ImportError:
    GITHUB_ANALYZER_AVAILABLE = False
    print("⚠️  GitHub analyzer not available")

try:
    from ml_models.resume_tip_recommender import ResumeTipRecommender
    RESUME_TIP_ML_AVAILABLE = True
    resume_tip_model = ResumeTipRecommender()
    model_path = os.path.join(PROJECT_ROOT, 'ml_models', 'resume_tip_model.pkl')
    if os.path.exists(model_path):
        resume_tip_model.load_model(model_path)
        print("✅ Resume Tip ML Model loaded successfully!")
    else:
        print("⚠️  Resume Tip ML Model file not found, will use rule-based fallback")
        RESUME_TIP_ML_AVAILABLE = False
except ImportError as e:
    RESUME_TIP_ML_AVAILABLE = False
    resume_tip_model = None
    print(f"⚠️  Resume Tip ML Model not available: {e}")

try:
    from database import get_db
    DATABASE_AVAILABLE = True
    db = get_db()
except ImportError as e:
    DATABASE_AVAILABLE = False
    db = None
    print(f"⚠️  Database not available: {e}")
except Exception as e:
    DATABASE_AVAILABLE = False
    db = None
    print(f"⚠️  Database connection failed: {e}")
    print("💡 Install PostgreSQL or the system will use SQLite")

# Flask App
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Session storage (in-memory for simplicity, use Redis in production)
active_sessions = {}
otp_storage = {}  # Store OTPs temporarily {email: {otp, expires, name}}

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Generate secure random token"""
    return secrets.token_urlsafe(32)

def generate_otp():
    """Generate 6-digit OTP"""
    import random
    return str(random.randint(100000, 999999))

def send_otp_sms(phone, otp, name="User"):
    """
    Send OTP via SMS using Fast2SMS (FREE for India)
    Get API key from: https://www.fast2sms.com/dashboard/dev-api
    """
    import requests
    
    # Get Fast2SMS API key from environment
    api_key = os.getenv('FAST2SMS_API_KEY')
    
    if not api_key:
        # Fallback: Print to console if no API key
        print("\n" + "🔥" * 50)
        print("🔥" + " " * 98 + "🔥")
        print("🔥" + " " * 30 + "📱 OTP GENERATED (NO SMS SERVICE) 📱" + " " * 30 + "🔥")
        print("🔥" + " " * 98 + "🔥")
        print(f"🔥     👤 Name: {name:<50}     🔥")
        print(f"🔥     📱 Phone: {phone:<50}     🔥")
        print("🔥" + " " * 98 + "🔥")
        print(f"🔥     🔑 OTP CODE: {otp}  (Valid for 10 minutes)" + " " * 40 + "🔥")
        print("🔥" + " " * 98 + "🔥")
        print("🔥     ⚠️  Add FAST2SMS_API_KEY to .env to send real SMS" + " " * 30 + "🔥")
        print("🔥" + " " * 98 + "🔥")
        print("🔥" * 50 + "\n")
        return False
    
    try:
        # Fast2SMS API endpoint
        url = "https://www.fast2sms.com/dev/bulkV2"
        
        # Message payload
        payload = {
            "route": "v3",
            "sender_id": "FSTSMS",
            "message": f"Your DEVA verification code is {otp}. Valid for 10 minutes. Do not share this code with anyone.",
            "language": "english",
            "flash": 0,
            "numbers": phone
        }
        
        headers = {
            'authorization': api_key,
            'Content-Type': "application/x-www-form-urlencoded",
            'Cache-Control': "no-cache",
        }
        
        response = requests.post(url, data=payload, headers=headers)
        result = response.json()
        
        if result.get('return') == True:
            print(f"✅ SMS sent successfully to {phone}")
            return True
        else:
            print(f"❌ Failed to send SMS: {result.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ SMS sending error: {e}")
        return False

def verify_token(token):
    """Verify authentication token"""
    if token in active_sessions:
        session = active_sessions[token]
        # Check if token expired (24 hours)
        if datetime.now() < session['expires']:
            return session['user_id']
    return None

# Upload configuration
UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, "data/uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

# Load roles data
try:
    roles_df = pd.read_csv(os.path.join(PROJECT_ROOT, "data/roles_skills.csv"))
    ROLES_AVAILABLE = True
except:
    ROLES_AVAILABLE = False
    print("⚠️  Roles data not available")

# Initialize Bandit if available
if ML_AVAILABLE and ROLES_AVAILABLE:
    all_skills = roles_df.skill.unique().tolist()
    bandit = LinUCB(arms=all_skills, n_features=10, alpha=1.0)
else:
    bandit = None

# Initialize Resume Parser if available
if RESUME_PARSER_AVAILABLE:
    resume_parser = ResumeParser()
else:
    resume_parser = None

# Initialize GitHub Analyzer if available
if GITHUB_ANALYZER_AVAILABLE:
    github_analyzer = GitHubAnalyzer()
else:
    github_analyzer = None

# Initialize Roadmap Scraper
try:
    from roadmap_scraper import RoadmapScraper
    roadmap_scraper = RoadmapScraper()
    ROADMAP_SCRAPER_AVAILABLE = True
except ImportError:
    roadmap_scraper = None
    ROADMAP_SCRAPER_AVAILABLE = False
    print("⚠️  Roadmap scraper not available")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "ml_available": ML_AVAILABLE,
        "roles_available": ROLES_AVAILABLE,
        "resume_parser_available": RESUME_PARSER_AVAILABLE,
        "github_analyzer_available": GITHUB_ANALYZER_AVAILABLE,
        "database_available": DATABASE_AVAILABLE
    })


# ============================================
# OTP AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/auth/send-otp-signup', methods=['POST'])
def send_otp_signup():
    """Send OTP for signup - requires email, name, phone, password"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', '')
        
        if not email or not name or not phone or not password:
            return jsonify({'error': 'Email, name, phone, and password are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if not DATABASE_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 503
        
        # Check if user already exists
        existing_user = db.get_learner_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already registered. Please login instead.'}), 409
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP and signup data (expires in 10 minutes)
        otp_storage[email] = {
            'otp': otp,
            'expires': datetime.now() + timedelta(minutes=10),
            'name': name,
            'phone': phone,
            'password': password,
            'type': 'signup'
        }
        
        # Send OTP via SMS to phone
        sms_sent = send_otp_sms(phone, otp, name)
        
        return jsonify({
            'message': 'OTP sent successfully to your phone' if sms_sent else 'OTP generated (check console)',
            'email': email,
            'phone': phone,
            'sms_sent': sms_sent
            # Note: OTP is NOT sent in response for security
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/send-otp-login', methods=['POST'])
def send_otp_login():
    """Send OTP for login"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not DATABASE_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 503
        
        # Check if user exists
        user = db.get_learner_by_email(email)
        if not user:
            return jsonify({'error': 'Email not registered. Please sign up first.'}), 404
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP (expires in 10 minutes)
        otp_storage[email] = {
            'otp': otp,
            'expires': datetime.now() + timedelta(minutes=10),
            'type': 'login'
        }
        
        # Send OTP via email
        send_otp_email(email, otp)
        
        return jsonify({
            'message': 'OTP sent successfully',
            'email': email
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/verify-otp-signup', methods=['POST'])
def verify_otp_signup():
    """Verify OTP and create account with password"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Check if OTP exists
        if email not in otp_storage:
            return jsonify({'error': 'OTP expired or not found. Please request a new one.'}), 404
        
        stored_data = otp_storage[email]
        
        # Check if OTP expired
        if datetime.now() > stored_data['expires']:
            del otp_storage[email]
            return jsonify({'error': 'OTP expired. Please request a new one.'}), 401
        
        # Verify OTP
        if stored_data['otp'] != otp:
            return jsonify({'error': 'Invalid OTP. Please try again.'}), 401
        
        # Get stored signup data
        name = stored_data.get('name')
        phone = stored_data.get('phone')
        password = stored_data.get('password')
        
        # Create user account with password
        learner_id = db.create_learner(
            email=email,
            name=name,
            target_role='',  # Will be set during onboarding
            learning_speed='medium'
        )
        
        # Store hashed password
        db.update_learner(learner_id, password_hash=hash_password(password))
        
        # Store phone number (you may need to add this field to database)
        # For now, we'll skip storing phone in DB
        
        # Clear OTP
        del otp_storage[email]
        
        # Generate token
        token = generate_token()
        active_sessions[token] = {
            'user_id': learner_id,
            'email': email,
            'expires': datetime.now() + timedelta(days=7)
        }
        
        return jsonify({
            'token': token,
            'user': {
                'id': learner_id,
                'email': email,
                'name': name
            },
            'message': 'Account created successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/verify-otp-login', methods=['POST'])
def verify_otp_login():
    """Verify OTP and login"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Check if OTP exists
        if email not in otp_storage:
            return jsonify({'error': 'OTP expired or not found. Please request a new one.'}), 404
        
        stored_data = otp_storage[email]
        
        # Check if OTP expired
        if datetime.now() > stored_data['expires']:
            del otp_storage[email]
            return jsonify({'error': 'OTP expired. Please request a new one.'}), 401
        
        # Verify OTP
        if stored_data['otp'] != otp:
            return jsonify({'error': 'Invalid OTP. Please try again.'}), 401
        
        # Get user
        user = db.get_learner_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Clear OTP
        del otp_storage[email]
        
        # Generate token
        token = generate_token()
        active_sessions[token] = {
            'user_id': user['id'],
            'email': email,
            'expires': datetime.now() + timedelta(days=7)
        }
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'target_role': user.get('target_role'),
                'onboarding_complete': user.get('onboarding_complete', 0)
            },
            'message': 'Login successful'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# AUTHENTICATION ENDPOINTS (OLD - KEEP FOR COMPATIBILITY)
# ============================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Create new user account"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if not DATABASE_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 503
        
        # Check if user exists
        existing_user = db.get_learner_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create user (no role yet, will be set during onboarding)
        learner_id = db.create_learner(
            email=email,
            name=name,
            target_role='',  # Will be set during onboarding
            learning_speed='medium'
        )
        
        # Store hashed password
        db.update_learner(learner_id, password_hash=hash_password(password))
        
        # Generate token
        token = generate_token()
        active_sessions[token] = {
            'user_id': learner_id,
            'email': email,
            'expires': datetime.now() + timedelta(days=7)
        }
        
        return jsonify({
            'token': token,
            'user': {
                'id': learner_id,
                'email': email,
                'name': name
            },
            'message': 'Account created successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if not DATABASE_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 503
        
        # Get user
        user = db.get_learner_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if user.get('password_hash') != hash_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token()
        active_sessions[token] = {
            'user_id': user['id'],
            'email': email,
            'expires': datetime.now() + timedelta(days=7)
        }
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'target_role': user.get('target_role'),
                'onboarding_complete': user.get('onboarding_complete', 0)
            },
            'message': 'Login successful'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if token in active_sessions:
            del active_sessions[token]
        
        return jsonify({'message': 'Logged out successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/verify', methods=['GET'])
def verify():
    """Verify authentication token"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        user = db.get_learner(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'target_role': user.get('target_role'),
                'onboarding_complete': user.get('onboarding_complete', 0)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/api/recommend", methods=["POST"])
def recommend():
    """
    Accept learner profile and return ML-based recommendation
    Request body:
    {
        "targetRole": "data_scientist",
        "knownSkills": ["python", "sql"],
        "learningSpeed": "medium"
    }
    """
    try:
        data = request.json
        target_role = data.get("targetRole")
        known_skills = data.get("knownSkills", [])
        learning_speed = data.get("learningSpeed", "medium")
        
        if not target_role:
            return jsonify({"error": "targetRole required"}), 400
        
        # Get required skills for role
        if not ROLES_AVAILABLE:
            return jsonify({"error": "Roles data not available"}), 500
            
        required = roles_df[roles_df.role == target_role].skill.tolist()
        
        # Normalize known skills (convert to lowercase, handle variations)
        known_normalized = [s.lower().replace(" ", "_") for s in known_skills]
        
        # Find skill gaps
        gap = [s for s in required if s not in known_normalized]
        
        if not gap:
            return jsonify({
                "skill": None,
                "message": "No skill gaps found!",
                "confidence": 1.0,
                "allSkillsLearned": True
            })
        
        # Use ML if available, otherwise use baseline
        if ML_AVAILABLE and bandit:
            # Create simple context for each skill
            learner_context = {
                "target_role": target_role,
                "known_skills": ",".join(known_normalized),
                "learning_speed": learning_speed
            }
            
            contexts = {}
            for skill in gap:
                # Simple context vector (10 features)
                contexts[skill] = create_context(skill, learner_context, None, None)
            
            # Get recommendation from bandit
            recommended_skill = bandit.recommend(contexts)
            
            # Calculate confidence (UCB score)
            x = contexts[recommended_skill]
            A_inv = np.linalg.inv(bandit.A[recommended_skill])
            theta = A_inv @ bandit.b[recommended_skill]
            confidence = float(theta.T @ x)
            
        else:
            # Baseline: recommend by importance
            skill_importance = {}
            for skill in gap:
                row = roles_df[(roles_df.role == target_role) & (roles_df.skill == skill)]
                if not row.empty:
                    skill_importance[skill] = float(row.iloc[0].importance)
            
            recommended_skill = max(skill_importance, key=skill_importance.get)
            confidence = skill_importance[recommended_skill]
        
        # Get skill details
        skill_row = roles_df[(roles_df.role == target_role) & (roles_df.skill == recommended_skill)]
        
        if skill_row.empty:
            return jsonify({"error": "Skill not found"}), 404
        
        skill_info = skill_row.iloc[0]
        
        return jsonify({
            "skill": recommended_skill,
            "displayName": recommended_skill.replace("_", " ").title(),
            "importance": float(skill_info.importance),
            "category": skill_info.category,
            "confidence": confidence,
            "message": f"Focus on {recommended_skill.replace('_', ' ').title()}",
            "algorithm": "LinUCB" if ML_AVAILABLE else "Baseline",
            "skillGaps": gap,
            "totalGaps": len(gap)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/skill-gaps", methods=["POST"])
def get_skill_gaps():
    """
    Get all skill gaps with importance scores
    """
    try:
        data = request.json
        target_role = data.get("targetRole")
        known_skills = data.get("knownSkills", [])
        
        if not target_role or not ROLES_AVAILABLE:
            return jsonify({"error": "Invalid request"}), 400
        
        # Get required skills
        required = roles_df[roles_df.role == target_role]
        
        # Normalize known skills
        known_normalized = [s.lower().replace(" ", "_") for s in known_skills]
        
        # Find gaps
        gaps = []
        for _, row in required.iterrows():
            if row.skill not in known_normalized:
                gaps.append({
                    "skill": row.skill,
                    "displayName": row.skill.replace("_", " ").title(),
                    "importance": float(row.importance),
                    "category": row.category
                })
        
        # Sort by importance
        gaps.sort(key=lambda x: x["importance"], reverse=True)
        
        return jsonify({
            "gaps": gaps,
            "totalGaps": len(gaps)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/resume/upload", methods=["POST"])
def upload_resume():
    """
    Upload and parse resume to extract skills
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Use PDF, DOCX, or TXT"}), 400
        
        # Save file
        filename = secure_filename(f"resume_{int(pd.Timestamp.now().timestamp())}_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        
        # Parse resume if parser available
        if RESUME_PARSER_AVAILABLE and resume_parser:
            try:
                resume_data = resume_parser.parse_resume(filepath)
                skills = resume_data.get("skills", [])
                projects = resume_data.get("projects", [])
                experience_years = resume_data.get("experience_years", 0)
                education = resume_data.get("education", [])
                
                # Clean up file after parsing
                try:
                    os.remove(filepath)
                except:
                    pass
                
                return jsonify({
                    "message": "Resume analyzed successfully",
                    "skills_found": skills,
                    "total_skills": len(skills),
                    "projects": projects,
                    "total_projects": len(projects),
                    "experience_years": experience_years,
                    "education": education,
                    "learning_speed": resume_data.get("learning_speed", "medium")
                })
            except Exception as parse_error:
                # Clean up file
                try:
                    os.remove(filepath)
                except:
                    pass
                return jsonify({"error": f"Failed to parse resume: {str(parse_error)}"}), 500
        else:
            # Clean up file
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify({
                "error": "Resume parser not available. Install required dependencies.",
                "hint": "pip install spacy PyPDF2 python-docx pdfplumber"
            }), 503
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/github/analyze", methods=["POST"])
def analyze_github():
    """
    Analyze GitHub profile to extract skills
    """
    try:
        data = request.json
        
        if not data or "github_username" not in data:
            return jsonify({"error": "github_username required"}), 400
        
        github_username = data.get("github_username", "").strip()
        
        if not github_username:
            return jsonify({"error": "Invalid GitHub username"}), 400
        
        # Check if GitHub analyzer is available
        if not GITHUB_ANALYZER_AVAILABLE or not github_analyzer:
            return jsonify({
                "error": "GitHub analyzer not available. Install required dependencies.",
                "hint": "pip install requests"
            }), 503
        
        # Analyze GitHub profile
        try:
            profile_data = github_analyzer.analyze_profile(github_username)
            
            # Extract skills
            skills = profile_data.get("skills", [])
            activity_score = profile_data.get("activity_score", 0)
            languages = profile_data.get("languages", {})
            top_repos = profile_data.get("top_repos", [])
            metadata = profile_data.get("metadata", {})
            
            return jsonify({
                "message": f"Successfully analyzed GitHub profile for {github_username}",
                "skills_found": skills,
                "activity_score": activity_score,
                "languages": languages,
                "top_repos": top_repos,
                "metadata": metadata,
                "total_skills": len(skills)
            })
            
        except Exception as analyze_error:
            error_msg = str(analyze_error)
            
            # Handle specific GitHub API errors
            if "404" in error_msg or "Not Found" in error_msg:
                return jsonify({
                    "error": f"GitHub user '{github_username}' not found. Please check the username."
                }), 404
            elif "403" in error_msg or "rate limit" in error_msg.lower():
                return jsonify({
                    "error": "GitHub API rate limit exceeded. Please try again later or add a GitHub token.",
                    "hint": "Set GITHUB_TOKEN environment variable for higher rate limits"
                }), 429
            else:
                return jsonify({
                    "error": f"Failed to analyze GitHub profile: {error_msg}"
                }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Continue with more endpoints below...


# ============================================
# ROADMAP.SH INTEGRATION
# ============================================

@app.route('/roadmap/available', methods=['GET'])
def get_available_roadmaps():
    """Get list of all available roadmaps from roadmap.sh"""
    if not ROADMAP_SCRAPER_AVAILABLE:
        return jsonify({
            'error': 'Roadmap scraper not available',
            'message': 'Install required dependencies'
        }), 503
    
    try:
        roadmaps = roadmap_scraper.get_available_roadmaps()
        return jsonify({
            'roadmaps': roadmaps,
            'total': len(roadmaps),
            'source': 'roadmap.sh'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/roadmap/role/<role_name>', methods=['GET'])
def get_roadmap_for_role(role_name):
    """Get complete roadmap for a specific role"""
    if not ROADMAP_SCRAPER_AVAILABLE:
        return jsonify({
            'error': 'Roadmap scraper not available',
            'message': 'Install required dependencies'
        }), 503
    
    try:
        roadmap_data = roadmap_scraper.get_roadmap_for_role(role_name)
        
        if 'error' in roadmap_data:
            return jsonify(roadmap_data), 404
        
        return jsonify(roadmap_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/roadmap/skills', methods=['POST'])
def get_roadmap_skills():
    """Get skills from roadmap for a role"""
    if not ROADMAP_SCRAPER_AVAILABLE:
        return jsonify({
            'error': 'Roadmap scraper not available',
            'message': 'Install required dependencies'
        }), 503
    
    try:
        data = request.get_json()
        role = data.get('role')
        
        if not role:
            return jsonify({'error': 'Role is required'}), 400
        
        roadmap_data = roadmap_scraper.get_roadmap_for_role(role)
        
        if 'error' in roadmap_data:
            return jsonify(roadmap_data), 404
        
        return jsonify({
            'role': role,
            'skills': roadmap_data['skills'],
            'total_skills': roadmap_data['total_skills'],
            'url': roadmap_data['url']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/ai/suggest-role', methods=['POST'])
def suggest_role():
    """AI-powered role suggestion based on skills, quiz results, projects, and experience"""
    try:
        data = request.get_json()
        
        skills = data.get('skills', [])
        quiz_results = data.get('quiz_results', {})
        experience_years = data.get('experience_years', 0)
        projects = data.get('projects', [])
        source = data.get('source', 'unknown')  # 'resume', 'github', or 'quiz'
        
        # Calculate role match scores (now includes project analysis)
        role_scores = calculate_role_match_with_projects(skills, quiz_results, experience_years, projects)
        
        # Get top role
        suggested_role = max(role_scores, key=role_scores.get)
        confidence = role_scores[suggested_role]
        
        # Get alternative roles (top 3)
        sorted_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)
        alternative_roles = [
            {'role': role, 'confidence': round(score, 2)}
            for role, score in sorted_roles[1:4]
        ]
        
        # Generate reasoning (now includes project insights)
        reasoning = generate_reasoning_with_projects(skills, quiz_results, suggested_role, source, projects)
        
        return jsonify({
            'suggestedRole': suggested_role,
            'confidence': round(confidence, 2),
            'reasoning': reasoning,
            'alternativeRoles': alternative_roles,
            'allScores': {k: round(v, 2) for k, v in role_scores.items()},
            'source': source,
            'projects_analyzed': len(projects)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def calculate_role_match(skills, quiz_results, experience):
    """Calculate match score for each role based on skills, quiz, and experience"""
    return calculate_role_match_with_projects(skills, quiz_results, experience, [])


def calculate_role_match_with_projects(skills, quiz_results, experience, projects):
    """Calculate match score for each role based on skills, quiz, experience, AND projects"""
    
    # Define role skill requirements (keywords to look for)
    role_requirements = {
        'Frontend Developer': {
            'skills': ['javascript', 'react', 'html', 'css', 'vue', 'angular', 'typescript', 'sass', 'webpack', 'ui', 'ux'],
            'project_keywords': ['website', 'web app', 'frontend', 'ui', 'dashboard', 'responsive', 'landing page']
        },
        'Backend Developer': {
            'skills': ['python', 'java', 'node', 'sql', 'api', 'database', 'server', 'rest', 'graphql', 'express', 'django', 'flask'],
            'project_keywords': ['api', 'backend', 'server', 'database', 'microservice', 'rest', 'authentication']
        },
        'Data Scientist': {
            'skills': ['python', 'machine learning', 'statistics', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'data', 'ml', 'ai', 'r', 'jupyter'],
            'project_keywords': ['ml', 'machine learning', 'data analysis', 'prediction', 'model', 'dataset', 'visualization', 'classification']
        },
        'DevOps Engineer': {
            'skills': ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux', 'jenkins', 'terraform', 'ansible', 'cloud', 'devops', 'k8s'],
            'project_keywords': ['deployment', 'automation', 'infrastructure', 'pipeline', 'cloud', 'ci/cd', 'docker']
        },
        'Full Stack Developer': {
            'skills': ['javascript', 'python', 'react', 'node', 'database', 'api', 'frontend', 'backend', 'fullstack', 'full-stack'],
            'project_keywords': ['full stack', 'web application', 'mern', 'mean', 'end-to-end', 'fullstack']
        },
        'Mobile Developer': {
            'skills': ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios', 'mobile', 'app'],
            'project_keywords': ['mobile app', 'ios app', 'android app', 'cross-platform', 'mobile']
        }
    }
    
    role_scores = {}
    
    # Normalize skills to lowercase for matching
    normalized_skills = [str(skill).lower() for skill in skills]
    skills_text = ' '.join(normalized_skills)
    
    for role, requirements in role_requirements.items():
        score = 0.0
        required_skills = requirements['skills']
        project_keywords = requirements['project_keywords']
        
        # 1. Skill Match Score (40% weight - reduced from 50% to make room for projects)
        skill_matches = sum(1 for req in required_skills if req in skills_text)
        skill_score = min(skill_matches / len(required_skills), 1.0) * 0.4
        score += skill_score
        
        # 2. Project Match Score (30% weight - NEW!)
        if projects:
            project_matches = 0
            for project in projects:
                project_text = f"{project.get('name', '')} {project.get('description', '')}".lower()
                project_skills = [str(s).lower() for s in project.get('skills', [])]
                project_all_text = f"{project_text} {' '.join(project_skills)}"
                
                # Check if project matches role keywords
                if any(keyword in project_all_text for keyword in project_keywords):
                    project_matches += 1
            
            # Score based on relevant projects (max 3 projects considered)
            project_score = min(project_matches / 3, 1.0) * 0.3
            score += project_score
        
        # 3. Quiz Results Score (20% weight - reduced from 30%)
        quiz_category = quiz_results.get('category', '').lower()
        quiz_score_value = quiz_results.get('score', 0) / 100
        
        # Map quiz categories to roles
        category_role_map = {
            'frontend': ['Frontend Developer', 'Full Stack Developer'],
            'backend': ['Backend Developer', 'Full Stack Developer'],
            'data': ['Data Scientist'],
            'devops': ['DevOps Engineer']
        }
        
        if quiz_category in category_role_map:
            if role in category_role_map[quiz_category]:
                score += quiz_score_value * 0.2
            elif 'Full Stack Developer' in category_role_map[quiz_category] and role == 'Full Stack Developer':
                score += quiz_score_value * 0.15
        
        # 4. Experience Bonus (10% weight)
        exp_bonus = min(experience / 5, 1.0) * 0.1
        score += exp_bonus
        
        role_scores[role] = min(score, 1.0)
    
    # Ensure at least one role has a decent score
    if max(role_scores.values()) < 0.3:
        # Boost Full Stack as default if no clear match
        role_scores['Full Stack Developer'] = 0.5
    
    return role_scores


def generate_reasoning(skills, quiz_results, role, source):
    """Generate human-readable reasoning for the role suggestion"""
    return generate_reasoning_with_projects(skills, quiz_results, role, source, [])


def generate_reasoning_with_projects(skills, quiz_results, role, source, projects):
    """Generate human-readable reasoning for the role suggestion including project analysis"""
    reasoning = []
    
    # Normalize skills
    skills_lower = [str(s).lower() for s in skills]
    skills_text = ' '.join(skills_lower)
    
    # Source-specific reasoning
    if source == 'resume':
        reasoning.append(f"Based on your resume analysis with {len(skills)} skills")
    elif source == 'github':
        reasoning.append(f"Based on your GitHub activity")
    else:
        reasoning.append(f"Based on your profile")
    
    # Project-based reasoning (NEW!)
    if projects:
        relevant_projects = 0
        project_skills_found = set()
        
        for project in projects:
            project_text = f"{project.get('name', '')} {project.get('description', '')}".lower()
            project_skills = project.get('skills', [])
            
            # Check if project is relevant to the role
            role_keywords = {
                'Frontend Developer': ['frontend', 'ui', 'website', 'react', 'vue', 'angular'],
                'Backend Developer': ['backend', 'api', 'server', 'database', 'rest'],
                'Data Scientist': ['ml', 'machine learning', 'data', 'analysis', 'model'],
                'DevOps Engineer': ['devops', 'deployment', 'docker', 'kubernetes', 'ci/cd'],
                'Full Stack Developer': ['full stack', 'fullstack', 'web app', 'mern', 'mean'],
                'Mobile Developer': ['mobile', 'ios', 'android', 'app']
            }
            
            if role in role_keywords:
                if any(keyword in project_text for keyword in role_keywords[role]):
                    relevant_projects += 1
                    project_skills_found.update(project_skills)
        
        if relevant_projects > 0:
            reasoning.append(f"Found {relevant_projects} relevant project(s) demonstrating {role} experience")
    
    # Skill-based reasoning
    if 'react' in skills_text or 'vue' in skills_text or 'angular' in skills_text:
        reasoning.append("Strong frontend framework experience detected")
    
    if 'python' in skills_text:
        reasoning.append("Python proficiency identified")
    
    if 'javascript' in skills_text or 'typescript' in skills_text:
        reasoning.append("JavaScript/TypeScript skills present")
    
    if 'sql' in skills_text or 'database' in skills_text:
        reasoning.append("Database experience found")
    
    if 'docker' in skills_text or 'kubernetes' in skills_text or 'aws' in skills_text:
        reasoning.append("DevOps/Cloud infrastructure skills detected")
    
    if 'machine learning' in skills_text or 'tensorflow' in skills_text or 'data' in skills_text:
        reasoning.append("Data science and ML capabilities identified")
    
    # Quiz-based reasoning
    quiz_category = quiz_results.get('category', '')
    quiz_score = quiz_results.get('score', 0)
    
    if quiz_score >= 60:
        reasoning.append(f"Strong interest in {quiz_category} ({quiz_score}% match)")
    elif quiz_score >= 40:
        reasoning.append(f"Moderate interest in {quiz_category} ({quiz_score}% match)")
    
    # Role-specific reasoning
    if role == 'Full Stack Developer' and len(skills) > 5:
        reasoning.append("Diverse skill set suitable for full-stack development")
    
    # Ensure at least 2 reasons
    if len(reasoning) < 2:
        reasoning.append(f"Skills align well with {role} requirements")
    
    return reasoning[:5]  # Return max 5 reasons


@app.route('/ai/analyze-github-role', methods=['POST'])
def analyze_github_for_role():
    """Analyze GitHub profile and suggest role"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        quiz_results = data.get('quiz_results', {})
        
        if not username:
            return jsonify({'error': 'Username required'}), 400
        
        if not GITHUB_ANALYZER_AVAILABLE or not github_analyzer:
            return jsonify({'error': 'GitHub analyzer not available'}), 503
        
        # Analyze GitHub profile
        github_data = github_analyzer.analyze_profile(username)
        
        # Extract skills and languages
        skills = github_data.get('skills', [])
        languages = github_data.get('languages', {})
        
        # Combine skills and languages
        all_skills = skills + list(languages.keys())
        
        # Get role suggestion
        role_scores = calculate_role_match(all_skills, quiz_results, 0)
        suggested_role = max(role_scores, key=role_scores.get)
        confidence = role_scores[suggested_role]
        
        # Generate reasoning
        reasoning = generate_reasoning(all_skills, quiz_results, suggested_role, 'github')
        
        # Add GitHub-specific reasoning
        if languages:
            top_langs = list(languages.keys())[:3]
            reasoning.insert(1, f"Primary languages: {', '.join(top_langs)}")
        
        return jsonify({
            'suggestedRole': suggested_role,
            'confidence': round(confidence, 2),
            'reasoning': reasoning,
            'skills': skills,
            'languages': languages,
            'github_data': github_data
        })
        
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg:
            return jsonify({'error': f"GitHub user '{username}' not found"}), 404
        elif "403" in error_msg or "rate limit" in error_msg.lower():
            return jsonify({'error': 'GitHub API rate limit exceeded'}), 429
        else:
            return jsonify({'error': error_msg}), 500


# ============================================
# ENHANCED RESUME ANALYSIS WITH PROJECT SCORING
# ============================================

@app.route('/resume/analyze-enhanced', methods=['POST'])
def analyze_resume_enhanced():
    """
    Enhanced resume analysis with:
    1. Skills extraction
    2. Projects analysis
    3. Role scoring based on skills + projects
    4. Confidence boost for 100% matches
    5. Roadmap.sh integration
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        target_role = request.form.get('target_role', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not RESUME_PARSER_AVAILABLE:
            return jsonify({'error': 'Resume parser not available'}), 503
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join('/tmp', filename)
        file.save(temp_path)
        
        try:
            # Parse resume
            resume_parser = ResumeParser()
            resume_data = resume_parser.parse_resume(temp_path)
            
            # Extract data
            skills = resume_data.get('skills', [])
            projects = resume_data.get('projects', [])
            experience = resume_data.get('experience', [])
            education = resume_data.get('education', [])
            
            # Calculate role scores based on skills AND projects
            role_scores = calculate_role_score_with_projects(
                skills=skills,
                projects=projects,
                experience=experience,
                target_role=target_role
            )
            
            # Find best matching role
            best_role = max(role_scores, key=role_scores.get)
            best_score = role_scores[best_role]
            
            # Check for 100% match (confidence boost!)
            confidence_boost = None
            if best_score >= 95:  # 95%+ is considered 100% match
                confidence_boost = {
                    'message': f'🎉 Congratulations! You are 100% ready for {best_role}!',
                    'achievements': [
                        f'✅ You have all required skills for {best_role}',
                        f'✅ Your projects demonstrate {best_role} expertise',
                        f'✅ You are interview-ready for {best_role} positions',
                        '✅ Consider applying to companies now!'
                    ],
                    'next_steps': [
                        'Practice mock interviews',
                        'Update LinkedIn profile',
                        'Start applying to companies',
                        'Prepare your portfolio/GitHub',
                        'Network with professionals in the field'
                    ],
                    'interview_prep': {
                        'technical': f'Review {best_role} interview questions',
                        'behavioral': 'Prepare STAR method responses',
                        'system_design': 'Practice system design problems' if 'Engineer' in best_role else None,
                        'coding': 'Practice LeetCode medium/hard problems' if 'Developer' in best_role or 'Engineer' in best_role else None
                    }
                }
            
            # Get roadmap from roadmap.sh
            roadmap_url = get_roadmap_url(best_role)
            
            # Generate detailed analysis
            analysis = {
                'role_scores': role_scores,
                'best_match': {
                    'role': best_role,
                    'score': round(best_score, 2),
                    'percentage': f'{round(best_score)}%'
                },
                'skills_found': skills,
                'total_skills': len(skills),
                'projects_found': projects,
                'total_projects': len(projects),
                'experience_years': calculate_experience_years(experience),
                'confidence_boost': confidence_boost,
                'roadmap': {
                    'url': roadmap_url,
                    'title': f'{best_role} Roadmap',
                    'source': 'roadmap.sh'
                },
                'recommendations': generate_recommendations_from_score(
                    best_role, best_score, skills, projects
                ),
                'skill_gaps': identify_skill_gaps(best_role, skills),
                'project_suggestions': suggest_projects(best_role, projects)
            }
            
            return jsonify(analysis)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def calculate_role_score_with_projects(skills, projects, experience, target_role=''):
    """Calculate role match score based on skills, projects, and experience"""
    
    # Define role requirements
    role_requirements = {
        'Frontend Developer': {
            'required_skills': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular'],
            'bonus_skills': ['TypeScript', 'Webpack', 'Redux', 'SASS', 'Tailwind'],
            'project_keywords': ['website', 'web app', 'UI', 'frontend', 'responsive', 'dashboard']
        },
        'Backend Developer': {
            'required_skills': ['Python', 'Java', 'Node.js', 'API', 'Database', 'SQL'],
            'bonus_skills': ['MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
            'project_keywords': ['API', 'backend', 'server', 'database', 'microservice', 'REST']
        },
        'Full Stack Developer': {
            'required_skills': ['JavaScript', 'React', 'Node.js', 'Database', 'API'],
            'bonus_skills': ['TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
            'project_keywords': ['full stack', 'web application', 'MERN', 'MEAN', 'end-to-end']
        },
        'Data Scientist': {
            'required_skills': ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy'],
            'bonus_skills': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Tableau'],
            'project_keywords': ['ML', 'data analysis', 'prediction', 'model', 'dataset', 'visualization']
        },
        'DevOps Engineer': {
            'required_skills': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
            'bonus_skills': ['Terraform', 'Ansible', 'Jenkins', 'Git', 'Monitoring'],
            'project_keywords': ['deployment', 'automation', 'infrastructure', 'pipeline', 'cloud']
        },
        'Mobile Developer': {
            'required_skills': ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile'],
            'bonus_skills': ['Swift', 'Kotlin', 'Firebase', 'API Integration'],
            'project_keywords': ['mobile app', 'iOS app', 'Android app', 'cross-platform']
        }
    }
    
    scores = {}
    
    for role, requirements in role_requirements.items():
        score = 0
        max_score = 100
        
        # Skills matching (60% weight)
        required_skills = requirements['required_skills']
        bonus_skills = requirements['bonus_skills']
        
        matched_required = sum(1 for skill in skills if any(req.lower() in skill.lower() for req in required_skills))
        matched_bonus = sum(1 for skill in skills if any(bonus.lower() in skill.lower() for bonus in bonus_skills))
        
        skills_score = (matched_required / len(required_skills)) * 40  # 40 points for required
        skills_score += (matched_bonus / len(bonus_skills)) * 20  # 20 points for bonus
        
        # Projects matching (30% weight)
        project_keywords = requirements['project_keywords']
        project_matches = 0
        
        for project in projects:
            project_text = str(project).lower()
            if any(keyword.lower() in project_text for keyword in project_keywords):
                project_matches += 1
        
        projects_score = min(project_matches / 3, 1.0) * 30  # 30 points for projects (max 3 relevant projects)
        
        # Experience bonus (10% weight)
        experience_score = min(len(experience) / 2, 1.0) * 10  # 10 points for experience
        
        # Total score
        total_score = skills_score + projects_score + experience_score
        scores[role] = min(total_score, max_score)
    
    return scores


def calculate_experience_years(experience):
    """Calculate total years of experience"""
    # Simple calculation - count number of experience entries
    # In real implementation, parse dates and calculate actual years
    return len(experience)


def get_roadmap_url(role):
    """Get roadmap.sh URL for the role"""
    roadmap_mapping = {
        'Frontend Developer': 'https://roadmap.sh/frontend',
        'Backend Developer': 'https://roadmap.sh/backend',
        'Full Stack Developer': 'https://roadmap.sh/full-stack',
        'Data Scientist': 'https://roadmap.sh/python',  # Python roadmap for data science
        'DevOps Engineer': 'https://roadmap.sh/devops',
        'Mobile Developer': 'https://roadmap.sh/react-native'
    }
    return roadmap_mapping.get(role, 'https://roadmap.sh')


def generate_recommendations_from_score(role, score, skills, projects):
    """Generate personalized recommendations based on score"""
    recommendations = []
    
    if score >= 95:
        recommendations = [
            f'You are fully qualified for {role} positions!',
            'Focus on interview preparation and job applications',
            'Build a strong portfolio showcasing your projects',
            'Network with professionals in your field',
            'Consider contributing to open-source projects'
        ]
    elif score >= 75:
        recommendations = [
            f'You are almost ready for {role} positions!',
            'Work on 1-2 more projects to strengthen your portfolio',
            'Fill skill gaps identified in the analysis',
            'Practice coding interviews and system design',
            'Update your resume and LinkedIn profile'
        ]
    elif score >= 50:
        recommendations = [
            f'You have a good foundation for {role}',
            'Focus on building more relevant projects',
            'Learn the missing required skills',
            'Take online courses to fill knowledge gaps',
            'Join coding communities and forums'
        ]
    else:
        recommendations = [
            f'Start your journey towards {role}',
            'Follow the roadmap.sh guide for structured learning',
            'Build foundational projects',
            'Learn core technologies step by step',
            'Join beginner-friendly communities'
        ]
    
    return recommendations


def identify_skill_gaps(role, current_skills):
    """Identify missing skills for the role"""
    role_skills = {
        'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Webpack'],
        'Backend Developer': ['Python', 'Node.js', 'SQL', 'API Design', 'Docker', 'MongoDB'],
        'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Database', 'API', 'Docker'],
        'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'SQL', 'Visualization'],
        'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform'],
        'Mobile Developer': ['React Native', 'Flutter', 'iOS', 'Android', 'API Integration']
    }
    
    required = role_skills.get(role, [])
    current_lower = [s.lower() for s in current_skills]
    
    gaps = [skill for skill in required if not any(skill.lower() in curr for curr in current_lower)]
    
    return gaps


def suggest_projects(role, current_projects):
    """Suggest projects to build based on role"""
    project_suggestions = {
        'Frontend Developer': [
            'Build a responsive e-commerce website',
            'Create a weather dashboard with API integration',
            'Develop a task management app with React',
            'Build a portfolio website with animations'
        ],
        'Backend Developer': [
            'Create a RESTful API with authentication',
            'Build a microservices architecture',
            'Develop a real-time chat application',
            'Create a blog platform with database'
        ],
        'Full Stack Developer': [
            'Build a full-stack social media app',
            'Create an e-commerce platform (MERN/MEAN)',
            'Develop a project management tool',
            'Build a real-time collaboration app'
        ],
        'Data Scientist': [
            'Build a machine learning model for prediction',
            'Create a data visualization dashboard',
            'Develop a recommendation system',
            'Build a sentiment analysis tool'
        ],
        'DevOps Engineer': [
            'Set up a CI/CD pipeline',
            'Deploy a containerized application',
            'Create infrastructure as code with Terraform',
            'Build a monitoring and logging system'
        ],
        'Mobile Developer': [
            'Build a cross-platform mobile app',
            'Create a social media mobile app',
            'Develop a fitness tracking app',
            'Build an e-commerce mobile app'
        ]
    }
    
    suggestions = project_suggestions.get(role, [])
    
    # Filter out projects user might already have
    if current_projects:
        # Simple filtering - in real implementation, use NLP to match
        return suggestions[:3]  # Return top 3 suggestions
    
    return suggestions


# ============================================
# ML-POWERED RESUME TIP RECOMMENDATION
# ============================================

# Initialize Resume Tip Recommender
try:
    import sys
    ml_models_path = os.path.join(PROJECT_ROOT, 'ml_models')
    sys.path.append(ml_models_path)
    
    from resume_tip_recommender import ResumeTipRecommender
    
    model_path = os.path.join(ml_models_path, 'resume_tip_model.pkl')
    
    if os.path.exists(model_path):
        resume_tip_recommender = ResumeTipRecommender(model_path=model_path)
        RESUME_TIP_ML_AVAILABLE = True
        print("✅ Resume Tip ML Model loaded successfully")
    else:
        resume_tip_recommender = None
        RESUME_TIP_ML_AVAILABLE = False
        print("⚠️  Resume Tip ML Model not found. Run training script first.")
except Exception as e:
    resume_tip_recommender = None
    RESUME_TIP_ML_AVAILABLE = False
    print(f"⚠️  Resume Tip ML Model not available: {e}")


@app.route('/api/resume-tips/predict', methods=['POST'])
def predict_resume_tips():
    """
    ML-powered resume tip prediction
    
    Request body:
    {
        "role": "Frontend Developer",
        "skills": ["HTML", "CSS", "JavaScript"],
        "projects": [...],
        "experience_years": 1,
        "has_github": true,
        "has_portfolio": false,
        "has_certifications": false
    }
    
    Returns:
    {
        "predictions": [
            {
                "tip_id": 1,
                "probability": 0.85,
                "priority_score": 0.81,
                "recommended": true
            },
            ...
        ],
        "top_tips": [1, 6, 11],
        "model_accuracy": 0.92,
        "ml_powered": true
    }
    """
    try:
        data = request.get_json()
        
        if not RESUME_TIP_ML_AVAILABLE or not resume_tip_recommender:
            return jsonify({
                'error': 'ML model not available',
                'ml_powered': False,
                'fallback': 'Using rule-based recommendations'
            }), 503
        
        # Extract resume profile
        resume_profile = {
            'role': data.get('role', 'Full Stack Developer'),
            'skills': data.get('skills', []),
            'projects': data.get('projects', []),
            'experience_years': data.get('experience_years', 0),
            'has_github': data.get('has_github', False),
            'has_portfolio': data.get('has_portfolio', False),
            'has_certifications': data.get('has_certifications', False)
        }
        
        # Get ML predictions
        predictions = resume_tip_recommender.predict(resume_profile)
        
        # Get top recommended tips (probability > 0.5)
        top_tips = [pred['tip_id'] for pred in predictions if pred['recommended']][:5]
        
        # Calculate average model accuracy
        avg_accuracy = np.mean(resume_tip_recommender.accuracies) if resume_tip_recommender.accuracies else 0.0
        
        return jsonify({
            'predictions': predictions,
            'top_tips': top_tips,
            'model_accuracy': float(avg_accuracy),
            'ml_powered': True,
            'total_tips_analyzed': len(predictions),
            'recommended_count': len(top_tips)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'ml_powered': False
        }), 500


@app.route('/api/resume-tips/train', methods=['POST'])
def train_resume_tip_model():
    """
    Train or retrain the resume tip ML model
    Requires admin access in production
    """
    try:
        import sys
        ml_models_path = os.path.join(PROJECT_ROOT, 'ml_models')
        sys.path.append(ml_models_path)
        
        from resume_tip_recommender import train_and_save_model
        
        # Train model
        recommender = train_and_save_model()
        
        # Reload global model
        global resume_tip_recommender, RESUME_TIP_ML_AVAILABLE
        model_path = os.path.join(ml_models_path, 'resume_tip_model.pkl')
        resume_tip_recommender = ResumeTipRecommender(model_path=model_path)
        RESUME_TIP_ML_AVAILABLE = True
        
        return jsonify({
            'message': 'Model trained successfully',
            'accuracy': float(np.mean(recommender.accuracies)),
            'model_path': model_path
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/resume-tips/status', methods=['GET'])
def resume_tip_model_status():
    """Check if ML model is available"""
    return jsonify({
        'ml_available': RESUME_TIP_ML_AVAILABLE,
        'model_loaded': resume_tip_recommender is not None,
        'accuracy': float(np.mean(resume_tip_recommender.accuracies)) if resume_tip_recommender and resume_tip_recommender.accuracies else 0.0
    })


# ============================================
# ROADMAP DATA API ENDPOINTS
# ============================================

@app.route('/api/roadmap/nodes', methods=['GET'])
def get_roadmap_nodes():
    """Get all roadmap nodes for visualization"""
    try:
        import json
        nodes_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/roadmap_nodes.json')
        
        if not os.path.exists(nodes_path):
            return jsonify({'error': 'Roadmap nodes not found'}), 404
        
        with open(nodes_path, 'r') as f:
            nodes = json.load(f)
        
        return jsonify({
            'nodes': nodes,
            'total': len(nodes)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/roadmap/edges', methods=['GET'])
def get_roadmap_edges():
    """Get all roadmap edges for visualization"""
    try:
        import json
        edges_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/roadmap_edges.json')
        
        if not os.path.exists(edges_path):
            return jsonify({'error': 'Roadmap edges not found'}), 404
        
        with open(edges_path, 'r') as f:
            edges = json.load(f)
        
        return jsonify({
            'edges': edges,
            'total': len(edges)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/roadmap/topics', methods=['GET'])
def get_roadmap_topics():
    """Get all topic details"""
    try:
        import json
        topics_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/topics.json')
        
        if not os.path.exists(topics_path):
            return jsonify({'error': 'Topics not found'}), 404
        
        with open(topics_path, 'r') as f:
            topics = json.load(f)
        
        return jsonify({
            'topics': topics,
            'total': len(topics)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/roadmap/topic/<slug>', methods=['GET'])
def get_topic_detail(slug):
    """Get detailed information for a specific topic"""
    try:
        import json
        topics_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/topics.json')
        
        if not os.path.exists(topics_path):
            return jsonify({'error': 'Topics not found'}), 404
        
        with open(topics_path, 'r') as f:
            topics = json.load(f)
        
        # Find topic by slug
        topic = next((t for t in topics if t['slug'] == slug), None)
        
        if not topic:
            return jsonify({'error': f'Topic {slug} not found'}), 404
        
        return jsonify(topic)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/roadmap/complete', methods=['GET'])
def get_complete_roadmap():
    """Get complete roadmap data (nodes + edges + topics)"""
    try:
        import json
        
        nodes_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/roadmap_nodes.json')
        edges_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/roadmap_edges.json')
        topics_path = os.path.join(PROJECT_ROOT, 'backend/data/roadmaps/topics.json')
        
        nodes = []
        edges = []
        topics = []
        
        if os.path.exists(nodes_path):
            with open(nodes_path, 'r') as f:
                nodes = json.load(f)
        
        if os.path.exists(edges_path):
            with open(edges_path, 'r') as f:
                edges = json.load(f)
        
        if os.path.exists(topics_path):
            with open(topics_path, 'r') as f:
                topics = json.load(f)
        
        return jsonify({
            'nodes': nodes,
            'edges': edges,
            'topics': topics,
            'roadmap': 'frontend-developer',
            'total_nodes': len(nodes),
            'total_edges': len(edges),
            'total_topics': len(topics)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Career Guidance Backend API")
    print("="*50)
    print(f"✅ ML Available: {ML_AVAILABLE}")
    print(f"✅ Resume Parser: {RESUME_PARSER_AVAILABLE}")
    print(f"✅ GitHub Analyzer: {GITHUB_ANALYZER_AVAILABLE}")
    print(f"✅ Roadmap Scraper: {ROADMAP_SCRAPER_AVAILABLE}")
    print(f"✅ Roles Data: {ROLES_AVAILABLE}")
    print("="*50)
    print("📡 Starting server on http://localhost:8000")
    print("="*50 + "\n")
    
    app.run(debug=True, host='localhost', port=8000)
