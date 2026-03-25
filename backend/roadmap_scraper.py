"""
Roadmap.sh Scraper
Fetches role-based roadmaps from roadmap.sh GitHub repository
"""

import requests
import json
from typing import Dict, List, Optional
import re

class RoadmapScraper:
    """Scraper for roadmap.sh data"""
    
    def __init__(self):
        self.base_url = "https://api.github.com/repos/kamranahmedse/developer-roadmap"
        self.raw_content_url = "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master"
        self.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Career-Guidance-App'
        }
    
    def get_available_roadmaps(self) -> List[Dict]:
        """Get list of all available roadmaps"""
        roadmaps = [
            # Role-based Roadmaps
            {'id': 'frontend', 'name': 'Frontend Developer', 'category': 'role', 'path': 'frontend'},
            {'id': 'backend', 'name': 'Backend Developer', 'category': 'role', 'path': 'backend'},
            {'id': 'devops', 'name': 'DevOps Engineer', 'category': 'role', 'path': 'devops'},
            {'id': 'full-stack', 'name': 'Full Stack Developer', 'category': 'role', 'path': 'full-stack'},
            {'id': 'android', 'name': 'Android Developer', 'category': 'role', 'path': 'android'},
            {'id': 'ios', 'name': 'iOS Developer', 'category': 'role', 'path': 'ios'},
            {'id': 'qa', 'name': 'QA Engineer', 'category': 'role', 'path': 'qa'},
            {'id': 'software-architect', 'name': 'Software Architect', 'category': 'role', 'path': 'software-architect'},
            {'id': 'game-developer', 'name': 'Game Developer', 'category': 'role', 'path': 'game-developer'},
            {'id': 'ai-data-scientist', 'name': 'AI and Data Scientist', 'category': 'role', 'path': 'ai-data-scientist'},
            {'id': 'data-analyst', 'name': 'Data Analyst', 'category': 'role', 'path': 'data-analyst'},
            {'id': 'data-engineer', 'name': 'Data Engineer', 'category': 'role', 'path': 'data-engineer'},
            {'id': 'mlops', 'name': 'MLOps Engineer', 'category': 'role', 'path': 'mlops'},
            {'id': 'product-manager', 'name': 'Product Manager', 'category': 'role', 'path': 'product-manager'},
            {'id': 'engineering-manager', 'name': 'Engineering Manager', 'category': 'role', 'path': 'engineering-manager'},
            
            # Skill-based Roadmaps
            {'id': 'javascript', 'name': 'JavaScript', 'category': 'skill', 'path': 'javascript'},
            {'id': 'typescript', 'name': 'TypeScript', 'category': 'skill', 'path': 'typescript'},
            {'id': 'python', 'name': 'Python', 'category': 'skill', 'path': 'python'},
            {'id': 'java', 'name': 'Java', 'category': 'skill', 'path': 'java'},
            {'id': 'golang', 'name': 'Go', 'category': 'skill', 'path': 'golang'},
            {'id': 'rust', 'name': 'Rust', 'category': 'skill', 'path': 'rust'},
            {'id': 'cpp', 'name': 'C++', 'category': 'skill', 'path': 'cpp'},
            {'id': 'react', 'name': 'React', 'category': 'skill', 'path': 'react'},
            {'id': 'vue', 'name': 'Vue', 'category': 'skill', 'path': 'vue'},
            {'id': 'angular', 'name': 'Angular', 'category': 'skill', 'path': 'angular'},
            {'id': 'nodejs', 'name': 'Node.js', 'category': 'skill', 'path': 'nodejs'},
            {'id': 'docker', 'name': 'Docker', 'category': 'skill', 'path': 'docker'},
            {'id': 'kubernetes', 'name': 'Kubernetes', 'category': 'skill', 'path': 'kubernetes'},
            {'id': 'sql', 'name': 'SQL', 'category': 'skill', 'path': 'sql'},
            {'id': 'postgresql', 'name': 'PostgreSQL', 'category': 'skill', 'path': 'postgresql'},
            {'id': 'mongodb', 'name': 'MongoDB', 'category': 'skill', 'path': 'mongodb'},
            {'id': 'graphql', 'name': 'GraphQL', 'category': 'skill', 'path': 'graphql'},
            {'id': 'system-design', 'name': 'System Design', 'category': 'skill', 'path': 'system-design'},
            {'id': 'computer-science', 'name': 'Computer Science', 'category': 'skill', 'path': 'computer-science'},
        ]
        return roadmaps
    
    def fetch_roadmap_content(self, roadmap_id: str) -> Optional[Dict]:
        """Fetch roadmap content from GitHub"""
        try:
            # Try to fetch the roadmap JSON file
            url = f"{self.raw_content_url}/src/data/roadmaps/{roadmap_id}/{roadmap_id}.json"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                # Fallback to roadmap.json just in case
                backup_url = f"{self.raw_content_url}/src/data/roadmaps/{roadmap_id}/roadmap.json"
                response = requests.get(backup_url, headers=self.headers, timeout=10)
                if response.status_code == 200:
                    return response.json()
                
                print(f"Could not fetch {roadmap_id}: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching {roadmap_id}: {str(e)}")
            return None
    
    def parse_roadmap_skills(self, roadmap_data: Dict) -> List[str]:
        """Extract skills from roadmap data"""
        skills = set()
        
        def extract_from_node(node):
            if isinstance(node, dict):
                # Extract title/label as skill
                if 'title' in node:
                    skills.add(node['title'])
                if 'label' in node:
                    skills.add(node['label'])
                
                # Recursively process children
                if 'children' in node:
                    for child in node['children']:
                        extract_from_node(child)
                
                # Process other nested structures
                for key, value in node.items():
                    if isinstance(value, (dict, list)):
                        extract_from_node(value)
            
            elif isinstance(node, list):
                for item in node:
                    extract_from_node(item)
        
        extract_from_node(roadmap_data)
        return sorted(list(skills))
    
    def get_roadmap_for_role(self, role_name: str) -> Dict:
        """Get complete roadmap data for a specific role"""
        # Map common role names to roadmap IDs
        role_mapping = {
            'frontend developer': 'frontend',
            'frontend': 'frontend',
            'backend developer': 'backend',
            'backend': 'backend',
            'full stack developer': 'full-stack',
            'fullstack developer': 'full-stack',
            'full stack': 'full-stack',
            'fullstack': 'full-stack',
            'devops engineer': 'devops',
            'devops': 'devops',
            'data scientist': 'ai-data-scientist',
            'ai data scientist': 'ai-data-scientist',
            'data analyst': 'data-analyst',
            'data engineer': 'data-engineer',
            'android developer': 'android',
            'ios developer': 'ios',
            'mobile developer': 'react-native',
            'qa engineer': 'qa',
            'qa': 'qa',
            'software architect': 'software-architect',
            'product manager': 'product-manager',
            'engineering manager': 'engineering-manager',
            'game developer': 'game-developer',
            'mlops engineer': 'mlops',
            'mlops': 'mlops',
        }
        
        roadmap_id = role_mapping.get(role_name.lower())
        
        if not roadmap_id:
            # Try to find a partial match
            for key, value in role_mapping.items():
                if key in role_name.lower() or role_name.lower() in key:
                    roadmap_id = value
                    break
        
        if not roadmap_id:
            # Default to frontend if no match found
            print(f"Warning: No exact roadmap match for '{role_name}', using fallback")
            return self.get_fallback_roadmap('frontend', role_name)
        
        # Fetch roadmap content
        content = self.fetch_roadmap_content(roadmap_id)
        
        if content:
            skills = self.parse_roadmap_skills(content)
            return {
                'role': role_name,
                'roadmap_id': roadmap_id,
                'skills': skills,
                'total_skills': len(skills),
                'source': 'roadmap.sh',
                'url': f'https://roadmap.sh/{roadmap_id}'
            }
        else:
            # Return fallback data if fetch fails
            return self.get_fallback_roadmap(roadmap_id, role_name)
    
    def get_fallback_roadmap(self, roadmap_id: str, role_name: str) -> Dict:
        """Provide fallback roadmap data when API fetch fails"""
        fallback_roadmaps = {
            'frontend': {
                'skills': [
                    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
                    'Responsive Design', 'CSS Preprocessors', 'Build Tools', 'Package Managers',
                    'Version Control', 'Web APIs', 'Testing', 'Performance Optimization',
                    'Accessibility', 'SEO', 'Progressive Web Apps', 'GraphQL', 'REST APIs'
                ]
            },
            'backend': {
                'skills': [
                    'Programming Language', 'Database', 'API Design', 'Authentication',
                    'Caching', 'Testing', 'CI/CD', 'Docker', 'Web Security', 'Design Patterns',
                    'Message Brokers', 'Search Engines', 'GraphQL', 'REST APIs', 'Microservices',
                    'Scalability', 'Monitoring', 'Logging', 'Cloud Services', 'Server Management'
                ]
            },
            'full-stack': {
                'skills': [
                    'HTML', 'CSS', 'JavaScript', 'Frontend Framework', 'Backend Language',
                    'Database', 'API Design', 'Version Control', 'Testing', 'DevOps Basics',
                    'Cloud Services', 'Security', 'Performance', 'System Design', 'Deployment'
                ]
            },
            'devops': {
                'skills': [
                    'Linux', 'Networking', 'Scripting', 'Version Control', 'CI/CD',
                    'Docker', 'Kubernetes', 'Infrastructure as Code', 'Monitoring', 'Logging',
                    'Cloud Platforms', 'Security', 'Automation', 'Configuration Management',
                    'Container Orchestration', 'Service Mesh', 'GitOps'
                ]
            },
            'ai-data-scientist': {
                'skills': [
                    'Python', 'Statistics', 'Machine Learning', 'Deep Learning', 'Data Analysis',
                    'Data Visualization', 'SQL', 'Big Data', 'Feature Engineering', 'Model Deployment',
                    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter',
                    'Mathematics', 'Probability', 'Linear Algebra', 'Calculus'
                ]
            },
            'data-engineer': {
                'skills': [
                    'Python', 'SQL', 'Data Warehousing', 'ETL', 'Big Data', 'Spark', 'Hadoop',
                    'Kafka', 'Airflow', 'Cloud Platforms', 'Data Modeling', 'Data Pipelines',
                    'NoSQL', 'Data Lakes', 'Stream Processing', 'Batch Processing', 'Docker'
                ]
            }
        }
        
        skills = fallback_roadmaps.get(roadmap_id, {}).get('skills', [])
        
        return {
            'role': role_name,
            'roadmap_id': roadmap_id,
            'skills': skills,
            'total_skills': len(skills),
            'source': 'roadmap.sh (fallback)',
            'url': f'https://roadmap.sh/{roadmap_id}',
            'note': 'Using fallback data. Visit roadmap.sh for complete interactive roadmap.'
        }
    
    def save_roadmap_to_file(self, roadmap_data: Dict, filename: str):
        """Save roadmap data to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(roadmap_data, f, indent=2)
            print(f"Roadmap saved to {filename}")
        except Exception as e:
            print(f"Error saving roadmap: {str(e)}")


# CLI usage
if __name__ == "__main__":
    scraper = RoadmapScraper()
    
    print("🗺️  Roadmap.sh Scraper")
    print("=" * 50)
    
    # Show available roadmaps
    print("\n📋 Available Roadmaps:")
    roadmaps = scraper.get_available_roadmaps()
    for rm in roadmaps[:10]:  # Show first 10
        print(f"  - {rm['name']} ({rm['category']})")
    print(f"  ... and {len(roadmaps) - 10} more")
    
    # Example: Fetch Frontend roadmap
    print("\n🔍 Fetching Frontend Developer roadmap...")
    frontend_roadmap = scraper.get_roadmap_for_role('Frontend Developer')
    
    print(f"\n✅ Found {frontend_roadmap['total_skills']} skills:")
    for skill in frontend_roadmap['skills'][:15]:  # Show first 15
        print(f"  • {skill}")
    if len(frontend_roadmap['skills']) > 15:
        print(f"  ... and {len(frontend_roadmap['skills']) - 15} more")
    
    print(f"\n🔗 View full roadmap: {frontend_roadmap['url']}")
    
    # Save to file
    scraper.save_roadmap_to_file(frontend_roadmap, 'frontend_roadmap.json')
