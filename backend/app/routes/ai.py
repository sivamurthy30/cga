from fastapi import APIRouter, Request, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from app.utils.simple_resume_parser import parse_resume
from typing import List, Optional
import json

router = APIRouter()

@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and parse resume to extract skills
    """
    try:
        # Validate file type
        filename = file.filename
        allowed_extensions = {'pdf', 'docx', 'doc', 'txt'}
        if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
            return JSONResponse(
                content={"error": "Invalid file type. Use PDF, DOCX, or TXT"}, 
                status_code=400
            )

        # Read file bytes
        file_bytes = await file.read()
        
        # Parse resume
        try:
            resume_data = parse_resume(file_bytes, filename)
            
            return JSONResponse(content={
                "message": "Resume analyzed successfully",
                "skills_found": resume_data['skills_found'],
                "total_skills": resume_data['total_skills'],
                "projects": resume_data['projects'],
                "total_projects": len(resume_data['projects']),
                "experience_years": resume_data['experience_years'],
                "suggested_role": resume_data['suggested_role'],
                "confidence": resume_data['confidence'],
                "match_percentage": resume_data.get('match_percentage', 70),
                "reasoning": resume_data['reasoning'],
                "email": resume_data.get('email', ''),
                "phone": resume_data.get('phone', ''),
                "learning_speed": "medium",
                "success": True
            })
            
        except Exception as parse_error:
            return JSONResponse(content={
                "error": f"Failed to parse resume: {str(parse_error)}",
                "hint": "Make sure the file is a valid PDF, DOCX, or TXT file"
            }, status_code=500)
            
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/ai/suggest-role")
async def suggest_role(request: Request):
    """
    Suggest a role based on skills, projects, and quiz results
    """
    try:
        data = await request.json()
        skills = data.get('skills', [])
        projects = data.get('projects', [])
        quiz_results = data.get('quiz_results', {})
        experience_years = data.get('experience_years', 0)
        source = data.get('source', 'unknown')

        # Simple logic for role suggestion if ML is not fully connected
        # In a real app, this would call your ML bandit or a larger model
        
        # Role requirements mapping for fallback logic
        role_keywords = {
            'Frontend Developer': ['javascript', 'react', 'html', 'css', 'vue', 'angular', 'typescript', 'ui', 'ux'],
            'Backend Developer': ['python', 'java', 'node', 'sql', 'api', 'database', 'server', 'django', 'flask', 'express'],
            'Full Stack Developer': ['javascript', 'python', 'react', 'node', 'fullstack', 'html', 'css'],
            'Data Scientist': ['python', 'machine learning', 'data', 'pandas', 'numpy', 'statistics', 'ml', 'ai'],
            'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux', 'cloud', 'devops'],
            'Mobile Developer': ['flutter', 'react native', 'swift', 'kotlin', 'android', 'ios', 'mobile']
        }

        # Calculate scores
        scores = {role: 0 for role in role_keywords}
        skills_text = " ".join([str(s).lower() for s in skills])
        
        for role, keywords in role_keywords.items():
            for kw in keywords:
                if kw in skills_text:
                    scores[role] += 1
        
        # Add quiz bias
        quiz_category = quiz_results.get('category', '').lower()
        if quiz_category == 'frontend':
            scores['Frontend Developer'] += 2
        elif quiz_category == 'backend':
            scores['Backend Developer'] += 2
        elif quiz_category == 'data':
            scores['Data Scientist'] += 2
        elif quiz_category == 'devops':
            scores['DevOps Engineer'] += 2

        # Get top role
        suggested_role = max(scores, key=scores.get)
        confidence = 0.8 if scores[suggested_role] > 2 else 0.6

        # Generate reasoning
        reasoning = [f"Aligned with {len(skills)} technical skills found"]
        if quiz_results:
            reasoning.append(f"Matches your interest in {quiz_category}")
        reasoning.append(f"Historical trends favor {suggested_role} for your profile")

        return {
            "suggestedRole": suggested_role,
            "confidence": confidence,
            "reasoning": reasoning,
            "source": source
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
