import re
import os
from typing import List, Dict, Set
import PyPDF2
import pdfplumber
from docx import Document
import json

class ResumeParser:
    """
    Extract skills, experience, and education from resumes
    Supports: PDF, DOCX, TXT
    """
    
    def __init__(self, skills_database_path=None):
        """Initialize with known skills list"""
        import pandas as pd
        
        # Get absolute path to data directory
        if skills_database_path is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.abspath(os.path.join(current_dir, ".."))
            skills_database_path = os.path.join(project_root, "data", "skill_metadata.csv")
        
        # Load known skills
        skills_df = pd.read_csv(skills_database_path)
        self.known_skills = set(skills_df['skill'].str.lower())
        
        # Common skill keywords and patterns
        self.skill_patterns = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'go', 'rust', 
                          'php', 'swift', 'kotlin', 'typescript', 'scala', 'r'],
            'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express',
                         'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy'],
            'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra',
                        'oracle', 'sqlite', 'dynamodb', 'elasticsearch'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
                     'ansible', 'cloudformation'],
            'data_science': ['machine learning', 'deep learning', 'nlp', 'computer vision',
                           'statistics', 'data analysis', 'data visualization', 'tableau',
                           'power bi', 'spark', 'hadoop'],
            'soft_skills': ['leadership', 'communication', 'teamwork', 'problem solving',
                          'agile', 'scrum', 'project management']
        }
        
        # Compile skill regex patterns
        self.skill_regex = re.compile(
            r'\b(' + '|'.join([s.replace(' ', r'\s+') for cat in self.skill_patterns.values() 
                              for s in cat]) + r')\b',
            re.IGNORECASE
        )
        
        # Section headers
        self.section_headers = {
            'skills': ['skills', 'technical skills', 'core competencies', 'expertise'],
            'experience': ['experience', 'work experience', 'employment', 'professional experience'],
            'education': ['education', 'academic background', 'qualifications'],
            'projects': ['projects', 'personal projects', 'portfolio']
        }
    
    def parse_resume(self, file_path: str) -> Dict:
        """
        Main method to parse resume
        
        Returns:
        {
            'skills': ['Python', 'Machine Learning', ...],
            'experience_years': 3.5,
            'education': ['BS Computer Science', ...],
            'projects': [...],
            'raw_text': '...',
            'metadata': {...}
        }
        """
        extension = os.path.splitext(file_path)[1].lower()
        
        # Extract text based on file type
        if extension == '.pdf':
            text = self._extract_from_pdf(file_path)
        elif extension == '.docx':
            text = self._extract_from_docx(file_path)
        elif extension == '.txt':
            text = self._extract_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {extension}")
        
        # Parse sections
        skills = self._extract_skills(text)
        experience_years = self._extract_experience_years(text)
        education = self._extract_education(text)
        projects = self._extract_projects(text)
        
        return {
            'skills': list(skills),
            'experience_years': experience_years,
            'education': education,
            'projects': projects,
            'raw_text': text[:500],  # First 500 chars for preview
            'metadata': {
                'total_skills_found': len(skills),
                'file_type': extension,
                'text_length': len(text)
            }
        }
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        
        try:
            # Try pdfplumber first (better for complex layouts)
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except:
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() or ""
            except Exception as e:
                raise Exception(f"Failed to parse PDF: {e}")
        
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            return file.read()
    
    def _extract_skills(self, text: str) -> Set[str]:
        """Extract skills using pattern matching and NLP"""
        skills = set()
        text_lower = text.lower()
        
        # Method 1: Direct pattern matching
        matches = self.skill_regex.findall(text_lower)
        skills.update([m.strip() for m in matches])
        
        # Method 2: Look in skills section
        skills_section = self._extract_section(text, 'skills')
        if skills_section:
            # Split by common delimiters
            items = re.split(r'[,;•\n\|]', skills_section)
            for item in items:
                item = item.strip().lower()
                # Check if it's a known skill
                if item in self.known_skills:
                    skills.add(item)
                # Check for multi-word skills
                for known_skill in self.known_skills:
                    if known_skill in item:
                        skills.add(known_skill)
        
        # Method 3: Check against known skills database
        for skill in self.known_skills:
            if skill.lower() in text_lower:
                skills.add(skill)
        
        # Normalize capitalization
        normalized_skills = set()
        for skill in skills:
            # Find proper capitalization from known_skills
            for known in self.known_skills:
                if skill.lower() == known.lower():
                    normalized_skills.add(known.title())
                    break
            else:
                normalized_skills.add(skill.title())
        
        return normalized_skills
    
    def _extract_experience_years(self, text: str) -> float:
        """Extract years of experience"""
        
        # Pattern 1: "X years of experience"
        pattern1 = r'(\d+\.?\d*)\s*(?:\+)?\s*years?\s+(?:of\s+)?experience'
        matches = re.findall(pattern1, text, re.IGNORECASE)
        if matches:
            return float(matches[0])
        
        # Pattern 2: Date ranges in experience section
        experience_section = self._extract_section(text, 'experience')
        if experience_section:
            years = self._calculate_years_from_dates(experience_section)
            if years > 0:
                return years
        
        # Pattern 3: Count job entries
        job_indicators = len(re.findall(r'\b(20\d{2})\s*[-–]\s*(?:20\d{2}|present|current)', 
                                       text, re.IGNORECASE))
        if job_indicators > 0:
            return min(job_indicators * 2.0, 15)  # Assume 2 years per job, cap at 15
        
        return 0.0
    
    def _calculate_years_from_dates(self, text: str) -> float:
        """Calculate total years from date ranges"""
        # Find all date ranges (2019 - 2021, Jan 2019 - Present, etc.)
        date_pattern = r'(\w+\s+)?(\d{4})\s*[-–]\s*(?:(\w+\s+)?(\d{4})|present|current)'
        matches = re.findall(date_pattern, text, re.IGNORECASE)
        
        total_years = 0
        for match in matches:
            start_year = int(match[1])
            end_year = int(match[3]) if match[3] else 2025  # Current year
            total_years += (end_year - start_year)
        
        return min(total_years, 20)  # Cap at 20 years
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education details"""
        education = []
        
        education_section = self._extract_section(text, 'education')
        if not education_section:
            return education
        
        # Look for degree patterns
        degree_patterns = [
            r'\b(Ph\.?D\.?|Doctorate)\b.*?(?:in\s+)?([A-Z][a-zA-Z\s]+)',
            r'\b(Master\'?s?|M\.?S\.?|M\.?A\.?|MBA)\b.*?(?:in\s+)?([A-Z][a-zA-Z\s]+)',
            r'\b(Bachelor\'?s?|B\.?S\.?|B\.?A\.?|B\.?Tech)\b.*?(?:in\s+)?([A-Z][a-zA-Z\s]+)',
        ]
        
        for pattern in degree_patterns:
            matches = re.findall(pattern, education_section, re.IGNORECASE)
            for match in matches:
                degree = f"{match[0]} {match[1].strip()}"
                education.append(degree)
        
        return education[:3]  # Return top 3
    
    def _extract_projects(self, text: str) -> List[Dict]:
        """Extract project information"""
        projects = []
        
        projects_section = self._extract_section(text, 'projects')
        if not projects_section:
            return projects
        
        # Split by common project delimiters
        project_blocks = re.split(r'\n\s*\n', projects_section)
        
        for block in project_blocks[:5]:  # Limit to 5 projects
            # Extract project name (usually first line or bold)
            lines = block.strip().split('\n')
            if lines:
                name = lines[0].strip()
                description = ' '.join(lines[1:]).strip()[:200]  # First 200 chars
                
                # Extract skills from project description
                project_skills = self._extract_skills(block)
                
                projects.append({
                    'name': name,
                    'description': description,
                    'skills': list(project_skills)
                })
        
        return projects
    
    def _extract_section(self, text: str, section_type: str) -> str:
        """Extract a specific section from resume"""
        headers = self.section_headers.get(section_type, [])
        
        for header in headers:
            # Look for section header (case insensitive, with various formatting)
            pattern = r'\n\s*' + re.escape(header) + r'\s*[\n:]'
            match = re.search(pattern, text, re.IGNORECASE)
            
            if match:
                start = match.end()
                
                # Find next section or end of document
                next_section_pattern = r'\n\s*(?:' + '|'.join(
                    [h for cat in self.section_headers.values() for h in cat]
                ) + r')\s*[\n:]'
                
                next_match = re.search(next_section_pattern, text[start:], re.IGNORECASE)
                end = start + next_match.start() if next_match else len(text)
                
                return text[start:end].strip()
        
        return ""
    
    def calculate_learning_speed(self, resume_data: Dict) -> float:
        """
        Estimate learning speed based on resume analysis
        
        Returns: float between 0 and 1
        """
        base_speed = 0.5
        
        # Factor 1: Number of skills (more skills = faster learner)
        skill_count = len(resume_data.get('skills', []))
        skill_factor = min(skill_count / 20, 0.3)  # Cap at 0.3
        
        # Factor 2: Experience (more experience = faster)
        exp_years = resume_data.get('experience_years', 0)
        exp_factor = min(exp_years / 10, 0.2)  # Cap at 0.2
        
        # Factor 3: Education level
        education = resume_data.get('education', [])
        edu_factor = 0
        if any('phd' in e.lower() or 'doctorate' in e.lower() for e in education):
            edu_factor = 0.3
        elif any('master' in e.lower() for e in education):
            edu_factor = 0.2
        elif any('bachelor' in e.lower() for e in education):
            edu_factor = 0.1
        
        # Calculate final speed
        learning_speed = min(base_speed + skill_factor + exp_factor + edu_factor, 1.0)
        
        return round(learning_speed, 2)


# Utility function for API/CLI usage
def parse_resume_file(file_path: str) -> Dict:
    """Convenience function to parse a resume"""
    parser = ResumeParser()
    return parser.parse_resume(file_path)