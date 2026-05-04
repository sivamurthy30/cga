# DEVA FastAPI Backend

Modern, production-ready FastAPI backend for the DEVA Career Guidance Platform.

## 🚀 Features

### Core Features
- ✅ **FastAPI Framework** - High performance, async support
- ✅ **Pydantic Validation** - Automatic request/response validation
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens
- ✅ **OTP System** - Email-based OTP for signup/login
- ✅ **SQLAlchemy ORM** - Database abstraction layer
- ✅ **Dependency Injection** - Clean, testable code
- ✅ **Auto-generated Docs** - Swagger UI & ReDoc

### Advanced Features
- 🔐 **Security** - bcrypt password hashing, CORS, rate limiting
- 📧 **Email Service** - OTP delivery, notifications
- 📊 **ML Integration** - Skill recommendations, resume analysis
- 🎮 **Gamification** - XP, badges, streaks
- 📈 **Progress Tracking** - Roadmap completion, quiz results
- ⚡ **Background Tasks** - Async email sending, file processing
- 🔍 **GitHub Analysis** - Extract skills from GitHub profiles
- 📄 **Resume Parser** - Extract skills from PDF/DOCX/TXT

### Architecture
- **Clean Architecture** - Separation of concerns
- **Service Layer** - Business logic isolation
- **Repository Pattern** - Database access abstraction
- **Middleware** - Request timing, logging, error handling
- **Type Safety** - Full type hints with Pydantic

## 📁 Project Structure

```
backend_fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings & configuration
│   ├── models/              # Pydantic models (schemas)
│   │   ├── user.py          # User request/response models
│   │   ├── auth.py          # Auth models
│   │   └── ml.py            # ML models
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # Authentication routes
│   │   ├── user.py          # User profile routes
│   │   └── ml.py            # ML & recommendations
│   ├── services/            # Business logic
│   │   ├── auth_service.py  # Auth operations
│   │   ├── user_service.py  # User operations
│   │   └── ml_service.py    # ML operations
│   ├── database/            # Database layer
│   │   ├── db.py            # Connection & session
│   │   └── models.py        # SQLAlchemy models
│   └── utils/               # Utilities
│       ├── security.py      # Password hashing, JWT
│       ├── dependencies.py  # FastAPI dependencies
│       └── email_service.py # Email sending
├── requirements.txt
├── start.sh                 # Startup script
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Python 3.9+
- PostgreSQL (or SQLite for development)
- Redis (optional, for caching)

### Quick Start

1. **Clone and navigate**
```bash
cd backend_fastapi
```

2. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp ../.env.example .env
# Edit .env with your settings
```

5. **Run the server**
```bash
# Using the startup script
./start.sh

# Or manually
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. **Access the API**
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 📚 API Documentation

### Authentication Endpoints

#### Send OTP for Signup
```http
POST /api/auth/send-otp-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "1234567890",
  "password": "securepassword"
}
```

#### Verify OTP and Create Account
```http
POST /api/auth/verify-otp-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Send OTP for Login
```http
POST /api/auth/send-otp-login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP and Login
```http
POST /api/auth/verify-otp-login
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### Complete Onboarding
```http
POST /api/user/complete-onboarding
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "target_role": "Frontend Developer",
  "known_skills": ["JavaScript", "React", "CSS"],
  "learning_speed": "medium"
}
```

#### Save Quiz Results
```http
POST /api/user/quiz/save
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quiz_type": "skill_assessment",
  "score": 8,
  "total_questions": 10,
  "category": "JavaScript",
  "results_data": {}
}
```

#### Update Roadmap Progress
```http
POST /api/user/roadmap/progress
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "roadmap_id": "frontend-developer",
  "node_id": "html-basics",
  "completed": true
}
```

### ML Endpoints

#### Get Skill Recommendation
```http
POST /api/recommend
Content-Type: application/json

{
  "targetRole": "Frontend Developer",
  "knownSkills": ["HTML", "CSS"],
  "learningSpeed": "medium",
  "algorithm": "linucb"
}
```

#### Upload Resume
```http
POST /api/resume/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <resume.pdf>
learner_id: 123
```

#### Analyze GitHub Profile
```http
POST /api/github/analyze
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "github_username": "octocat",
  "learner_id": 123
}
```

## 🔐 Security

### Password Hashing
- Uses bcrypt with automatic salt generation
- Configurable work factor

### JWT Tokens
- Access tokens (30 days default)
- Refresh tokens (7 days default)
- HS256 algorithm
- Secure secret key required

### CORS
- Configurable allowed origins
- Credentials support
- Preflight request handling

### Rate Limiting
- Per-endpoint rate limits
- IP-based throttling
- Configurable limits

## 🗄️ Database

### Supported Databases
- **PostgreSQL** (recommended for production)
- **SQLite** (development/testing)

### Models
- **User** - User accounts
- **UserSkill** - User skills
- **QuizResult** - Assessment results
- **RoadmapProgress** - Learning progress
- **OTPRecord** - OTP verification
- **UserStats** - Gamification stats

### Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_auth.py
```

## 📊 Monitoring

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking
- Performance metrics

### Health Checks
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "environment": "development"
}
```

## 🚀 Deployment

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables
See `.env.example` for all configuration options.

### Production Checklist
- [ ] Change SECRET_KEY
- [ ] Use PostgreSQL
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up email service
- [ ] Enable Redis caching
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Enable error tracking
- [ ] Use production WSGI server

## 🔧 Development

### Code Style
- Follow PEP 8
- Use type hints
- Document functions
- Write tests

### Adding New Endpoints
1. Create Pydantic models in `app/models/`
2. Add route in `app/routes/`
3. Implement business logic in `app/services/`
4. Add tests in `tests/`

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues
- Email: support@deva.ai
- Documentation: /docs
