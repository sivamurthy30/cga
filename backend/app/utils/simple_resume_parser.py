"""
Simple Resume Parser - No spaCy required
Works with any Python version
"""
import re
from typing import Dict, List, Set
import PyPDF2
import docx
from io import BytesIO

# Comprehensive skill keywords database
SKILL_KEYWORDS = {
    # Programming Languages
    'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'go', 'rust', 'typescript', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
    
    # Web Technologies
    'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django',
    'flask', 'fastapi', 'spring', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
    'sass', 'less', 'webpack', 'vite', 'next.js', 'nuxt.js', 'gatsby',
    
    # Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
    'dynamodb', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'couchdb',
    
    # Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
    'terraform', 'ansible', 'chef', 'puppet', 'ci/cd', 'linux', 'unix',
    
    # Data Science & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter',
    'data analysis', 'data visualization', 'nlp', 'computer vision',
    
    # Mobile
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin',
    
    # Testing
    'jest', 'mocha', 'pytest', 'junit', 'selenium', 'cypress', 'testing',
    
    # Other
    'git', 'agile', 'scrum', 'rest api', 'graphql', 'microservices', 'oauth',
    'jwt', 'websocket', 'grpc', 'rabbitmq', 'kafka', 'spark', 'hadoop'
}

# Role indicators
ROLE_INDICATORS = {
    'frontend': ['frontend', 'front-end', 'ui', 'ux', 'web designer', 'react developer'],
    'backend': ['backend', 'back-end', 'server', 'api developer', 'database'],
    'fullstack': ['full stack', 'fullstack', 'full-stack'],
    'data': ['data scientist', 'data analyst', 'machine learning', 'ml engineer', 'ai'],
    'devops': ['devops', 'sre', 'site reliability', 'infrastructure', 'cloud engineer'],
    'mobile': ['mobile developer', 'ios developer', 'android developer', 'app developer'],
    'security': ['security', 'cybersecurity', 'penetration tester', 'security analyst']
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(file_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = BytesIO(file_bytes)
        doc = docx.Document(doc_file)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        raise Exception(f"Error reading DOCX: {str(e)}")


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extract text from TXT file"""
    try:
        return file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            return file_bytes.decode('latin-1')
        except Exception as e:
            raise Exception(f"Error reading TXT: {str(e)}")


def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text using keyword matching"""
    text_lower = text.lower()
    found_skills = set()
    
    for skill in SKILL_KEYWORDS:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Capitalize properly
            found_skills.add(skill.title())
    
    return sorted(list(found_skills))


def extract_email(text: str) -> str:
    """Extract email address from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    """Extract phone number from text"""
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890 or 1234567890
        r'\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b',  # (123) 456-7890
        r'\b\+\d{1,3}\s*\d{3}[-.]?\d{3}[-.]?\d{4}\b'  # +1 123-456-7890
    ]
    
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return ""


def estimate_experience_years(text: str) -> int:
    """Estimate years of experience from resume text"""
    text_lower = text.lower()
    
    # Look for explicit mentions
    patterns = [
        r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
        r'experience[:\s]+(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s+in\s+(?:software|development|engineering)'
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            years = int(match)
            max_years = max(max_years, years)
    
    # If no explicit mention, estimate from date ranges
    if max_years == 0:
        # Look for year ranges (e.g., 2018-2023)
        year_pattern = r'(20\d{2})\s*[-–]\s*(20\d{2}|present|current)'
        matches = re.findall(year_pattern, text_lower)
        
        if matches:
            current_year = 2024
            total_experience = 0
            for start, end in matches:
                start_year = int(start)
                end_year = current_year if end in ['present', 'current'] else int(end)
                total_experience += (end_year - start_year)
            max_years = min(total_experience, 20)  # Cap at 20 years
    
    return max_years


def extract_projects(text: str) -> List[Dict[str, str]]:
    """Extract project information from resume"""
    projects = []
    text_lower = text.lower()
    
    # Look for project sections
    project_indicators = ['projects', 'portfolio', 'work samples']
    
    for indicator in project_indicators:
        if indicator in text_lower:
            # Simple extraction: look for bullet points or numbered items after "projects"
            idx = text_lower.find(indicator)
            section_text = text[idx:idx+1000]  # Get next 1000 chars
            
            # Extract lines that look like project descriptions
            lines = section_text.split('\n')
            for line in lines[1:6]:  # Get up to 5 projects
                line = line.strip()
                if line and len(line) > 20:  # Meaningful project description
                    # Remove bullet points and numbers
                    clean_line = re.sub(r'^[•\-\*\d\.]+\s*', '', line)
                    if clean_line:
                        projects.append({
                            'name': clean_line[:100],  # First 100 chars as name
                            'description': clean_line
                        })
            
            if projects:
                break
    
    return projects[:5]  # Return max 5 projects


def is_valid_resume(text: str, skills: List[str], email: str, phone: str) -> tuple[bool, str]:
    """
    Validate if the document is actually a resume
    Returns: (is_valid, error_message)
    """
    text_lower = text.lower()
    
    # Resume indicators - common words/sections in resumes
    resume_indicators = [
        'experience', 'education', 'skills', 'work', 'employment',
        'projects', 'certifications', 'objective', 'summary',
        'professional', 'career', 'qualifications', 'achievements',
        'responsibilities', 'university', 'college', 'degree',
        'bachelor', 'master', 'phd', 'internship', 'volunteer'
    ]
    
    # Count how many resume indicators are present
    indicator_count = sum(1 for indicator in resume_indicators if indicator in text_lower)
    
    # Check 1: Must have at least 3 resume indicators
    if indicator_count < 3:
        return False, "This doesn't appear to be a resume. Please upload a valid resume with sections like Experience, Education, and Skills."
    
    # Check 2: Must have at least email OR phone
    if not email and not phone:
        return False, "No contact information found. Please upload a valid resume with your email or phone number."
    
    # Check 3: Must have at least 2 technical skills
    if len(skills) < 2:
        return False, "No technical skills found. Please upload a resume that includes your technical skills and experience."
    
    # Check 4: Minimum text length (resumes are usually substantial)
    if len(text) < 200:
        return False, "Document is too short to be a resume. Please upload a complete resume."
    
    # Check 5: Should not be a generic document
    generic_doc_indicators = [
        'terms and conditions', 'privacy policy', 'user agreement',
        'license agreement', 'invoice', 'receipt', 'contract',
        'chapter', 'table of contents', 'bibliography', 'abstract'
    ]
    
    generic_count = sum(1 for indicator in generic_doc_indicators if indicator in text_lower)
    if generic_count >= 2:
        return False, "This appears to be a generic document, not a resume. Please upload your professional resume."
    
    return True, ""


def calculate_role_match_percentage(skills: List[str], target_role: str) -> int:
    """
    Calculate actual match percentage between user skills and target role requirements
    Returns percentage (0-100)
    """
    # Define required skills for each role
    role_requirements = {
        'Frontend Developer': ['html', 'css', 'javascript', 'react', 'typescript', 'git', 'rest api', 'responsive design'],
        'Backend Developer': ['python', 'node.js', 'sql', 'mongodb', 'rest api', 'authentication', 'docker', 'git'],
        'Full Stack Developer': ['html', 'css', 'javascript', 'react', 'node.js', 'sql', 'mongodb', 'rest api', 'git', 'docker'],
        'Data Scientist': ['python', 'pandas', 'numpy', 'machine learning', 'tensorflow', 'statistics', 'sql', 'data visualization'],
        'DevOps Engineer': ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws', 'terraform', 'monitoring', 'git', 'bash'],
        'Mobile Developer': ['react native', 'javascript', 'typescript', 'ios', 'android', 'rest api', 'git', 'mobile ui'],
        'Security Engineer': ['cybersecurity', 'penetration testing', 'cryptography', 'network security', 'owasp', 'linux', 'python']
    }
    
    required_skills = role_requirements.get(target_role, [])
    if not required_skills:
        return 50  # Default if role not found
    
    skills_lower = [s.lower() for s in skills]
    
    # Count matching skills
    matched_skills = 0
    for req_skill in required_skills:
        # Check if user has this skill (exact or partial match)
        if any(req_skill in user_skill or user_skill in req_skill for user_skill in skills_lower):
            matched_skills += 1
    
    # Calculate percentage
    match_percentage = int((matched_skills / len(required_skills)) * 100)
    
    return match_percentage


def suggest_role_from_resume(skills: List[str], text: str) -> Dict[str, any]:
    """Suggest role based on skills and resume content"""
    text_lower = text.lower()
    skills_lower = [s.lower() for s in skills]
    
    role_scores = {
        'Frontend Developer': 0,
        'Backend Developer': 0,
        'Full Stack Developer': 0,
        'Data Scientist': 0,
        'DevOps Engineer': 0,
        'Mobile Developer': 0,
        'Security Engineer': 0
    }
    
    # Score based on skills
    frontend_skills = {'html', 'css', 'javascript', 'react', 'angular', 'vue', 'typescript'}
    backend_skills = {'python', 'java', 'node.js', 'sql', 'mongodb', 'postgresql', 'api'}
    data_skills = {'python', 'machine learning', 'tensorflow', 'pandas', 'data analysis'}
    devops_skills = {'docker', 'kubernetes', 'aws', 'terraform', 'jenkins', 'linux'}
    mobile_skills = {'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'}
    
    for skill in skills_lower:
        if skill in frontend_skills:
            role_scores['Frontend Developer'] += 2
            role_scores['Full Stack Developer'] += 1
        if skill in backend_skills:
            role_scores['Backend Developer'] += 2
            role_scores['Full Stack Developer'] += 1
        if skill in data_skills:
            role_scores['Data Scientist'] += 2
        if skill in devops_skills:
            role_scores['DevOps Engineer'] += 2
        if skill in mobile_skills:
            role_scores['Mobile Developer'] += 2
    
    # Score based on role indicators in text
    for role, indicators in ROLE_INDICATORS.items():
        for indicator in indicators:
            if indicator in text_lower:
                if 'frontend' in role or 'front' in role:
                    role_scores['Frontend Developer'] += 3
                elif 'backend' in role or 'back' in role:
                    role_scores['Backend Developer'] += 3
                elif 'fullstack' in role or 'full' in role:
                    role_scores['Full Stack Developer'] += 3
                elif 'data' in role:
                    role_scores['Data Scientist'] += 3
                elif 'devops' in role:
                    role_scores['DevOps Engineer'] += 3
                elif 'mobile' in role:
                    role_scores['Mobile Developer'] += 3
                elif 'security' in role:
                    role_scores['Security Engineer'] += 3
    
    # Get top role
    suggested_role = max(role_scores, key=role_scores.get)
    max_score = role_scores[suggested_role]
    
    # Calculate confidence (0-1)
    total_score = sum(role_scores.values())
    confidence = max_score / total_score if total_score > 0 else 0.5
    
    # Generate reasoning
    reasoning = []
    if max_score > 0:
        reasoning.append(f"Found {len(skills)} relevant skills in your resume")
        reasoning.append(f"Your experience aligns with {suggested_role}")
        if confidence > 0.7:
            reasoning.append("Strong match based on your background")
        else:
            reasoning.append("Consider exploring this role further")
    else:
        suggested_role = "Full Stack Developer"
        confidence = 0.5
        reasoning.append("Based on general profile analysis")
    
    return {
        'suggested_role': suggested_role,
        'confidence': round(confidence, 2),
        'reasoning': reasoning,
        'all_scores': role_scores
    }


def parse_resume(file_bytes: bytes, filename: str) -> Dict:
    """Main function to parse resume and extract information"""
    
    # Extract text based on file type
    file_ext = filename.lower().split('.')[-1]
    
    if file_ext == 'pdf':
        text = extract_text_from_pdf(file_bytes)
    elif file_ext in ['docx', 'doc']:
        text = extract_text_from_docx(file_bytes)
    elif file_ext == 'txt':
        text = extract_text_from_txt(file_bytes)
    else:
        raise Exception(f"Unsupported file type: {file_ext}. Please upload PDF, DOCX, or TXT files only.")
    
    if not text or len(text) < 50:
        raise Exception("Could not extract meaningful text from the document. Please ensure the file is not corrupted.")
    
    # Extract information
    skills = extract_skills(text)
    email = extract_email(text)
    phone = extract_phone(text)
    
    # Validate if this is actually a resume
    is_valid, error_message = is_valid_resume(text, skills, email, phone)
    if not is_valid:
        raise Exception(error_message)
    
    experience_years = estimate_experience_years(text)
    projects = extract_projects(text)
    role_suggestion = suggest_role_from_resume(skills, text)
    
    # Calculate actual match percentage for the suggested role
    match_percentage = calculate_role_match_percentage(skills, role_suggestion['suggested_role'])
    
    return {
        'skills_found': skills,
        'total_skills': len(skills),
        'email': email,
        'phone': phone,
        'experience_years': experience_years,
        'projects': projects,
        'suggested_role': role_suggestion['suggested_role'],
        'confidence': role_suggestion['confidence'],
        'match_percentage': match_percentage,  # Actual match percentage
        'reasoning': role_suggestion['reasoning'],
        'text_length': len(text),
        'success': True
    }
