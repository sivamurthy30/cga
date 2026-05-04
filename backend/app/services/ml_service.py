"""
ML Service
Business logic for ML recommendations and analysis
"""

from sqlalchemy.orm import Session
from typing import List
import random
import httpx
from pathlib import Path

from app.models.ml import RecommendationResponse, ResumeUploadResponse, GitHubAnalysisResponse


class MLService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_recommendation(
        self,
        target_role: str,
        known_skills: List[str],
        learning_speed: str,
        algorithm: str = "linucb"
    ) -> RecommendationResponse:
        """Get skill recommendation using specified algorithm"""
        
        # Role-based skill recommendations
        role_skills = {
            "frontend": ["React", "TypeScript", "CSS", "Webpack", "Testing"],
            "backend": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
            "fullstack": ["React", "Node.js", "MongoDB", "GraphQL", "AWS"],
            "data": ["Python", "Pandas", "SQL", "Machine Learning", "Visualization"],
            "ml": ["TensorFlow", "PyTorch", "MLOps", "Model Deployment", "Feature Engineering"],
            "devops": ["Kubernetes", "Terraform", "CI/CD", "Monitoring", "Security"],
            "mobile": ["React Native", "Swift", "Kotlin", "Mobile UI", "App Store"],
            "security": ["OWASP", "Penetration Testing", "Cryptography", "Network Security", "Compliance"]
        }
        
        # Find matching role
        role_key = next((k for k in role_skills.keys() if k in target_role.lower()), "frontend")
        available_skills = role_skills[role_key]
        
        # Filter out known skills
        unknown_skills = [s for s in available_skills if s not in known_skills]
        
        if not unknown_skills:
            unknown_skills = available_skills
        
        # Select skill based on algorithm (simplified)
        if algorithm == "linucb":
            skill = unknown_skills[0] if unknown_skills else available_skills[0]
            confidence = 0.85
        elif algorithm == "thompson":
            skill = random.choice(unknown_skills) if unknown_skills else random.choice(available_skills)
            confidence = 0.78
        elif algorithm == "neural":
            skill = unknown_skills[0] if unknown_skills else available_skills[0]
            confidence = 0.92
        else:  # hybrid
            skill = unknown_skills[0] if unknown_skills else available_skills[0]
            confidence = 0.88
        
        return RecommendationResponse(
            skill=skill,
            confidence=confidence,
            algorithm=algorithm,
            message=f"Recommended skill for {target_role} using {algorithm} algorithm"
        )
    
    async def analyze_resume(self, file_path: str, user_id: int) -> ResumeUploadResponse:
        """Analyze resume and extract skills"""
        file_ext = Path(file_path).suffix.lower()

        try:
            content = ""
            if file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            elif file_ext == '.pdf':
                import pdfplumber
                with pdfplumber.open(file_path) as pdf:
                    content = "\n".join(page.extract_text() or "" for page in pdf.pages)
            elif file_ext in ('.docx', '.doc'):
                import docx
                doc = docx.Document(file_path)
                content = "\n".join(p.text for p in doc.paragraphs)

            skill_keywords = [
                "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular",
                "Node.js", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
                "Docker", "Kubernetes", "AWS", "Azure", "GCP", "FastAPI",
                "Django", "Flask", "Spring", "Java", "C++", "C#", "Go", "Rust",
                "Machine Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
                "Git", "CI/CD", "Testing", "Agile", "REST API", "GraphQL",
                "Linux", "Terraform", "Ansible", "Kafka", "Elasticsearch",
            ]

            found_skills = [s for s in skill_keywords if s.lower() in content.lower()]

            learning_speed = "medium"
            if len(found_skills) > 10:
                learning_speed = "fast"
            elif len(found_skills) < 5:
                learning_speed = "slow"

            return ResumeUploadResponse(
                skills_found=found_skills,
                total_skills=len(found_skills),
                learning_speed=learning_speed,
                message=f"Successfully analyzed resume. Found {len(found_skills)} skills."
            )

        except Exception as e:
            return ResumeUploadResponse(
                skills_found=[],
                total_skills=0,
                learning_speed="medium",
                message=f"Error analyzing resume: {str(e)}"
            )
    
    async def analyze_github(self, github_username: str, user_id: int) -> GitHubAnalysisResponse:
        """Analyze GitHub profile"""
        
        try:
            # Fetch GitHub user data
            async with httpx.AsyncClient() as client:
                # Get user info
                user_response = await client.get(
                    f"https://api.github.com/users/{github_username}",
                    headers={"Accept": "application/vnd.github.v3+json"}
                )
                
                if user_response.status_code != 200:
                    raise Exception("GitHub user not found")
                
                user_data = user_response.json()
                
                # Get repositories
                repos_response = await client.get(
                    f"https://api.github.com/users/{github_username}/repos?per_page=100",
                    headers={"Accept": "application/vnd.github.v3+json"}
                )
                
                repos = repos_response.json() if repos_response.status_code == 200 else []
            
            # Extract languages/skills
            languages = set()
            for repo in repos:
                if repo.get("language"):
                    languages.add(repo["language"])
            
            # Calculate activity score
            public_repos = user_data.get("public_repos", 0)
            followers = user_data.get("followers", 0)
            activity_score = min(100, (public_repos * 2) + (followers // 10))
            
            return GitHubAnalysisResponse(
                skills_found=list(languages),
                activity_score=activity_score,
                message=f"Successfully analyzed GitHub profile for {github_username}"
            )
            
        except Exception as e:
            return GitHubAnalysisResponse(
                skills_found=[],
                activity_score=0,
                message=f"Error analyzing GitHub profile: {str(e)}"
            )
