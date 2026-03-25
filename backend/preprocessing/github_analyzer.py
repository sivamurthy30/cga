import requests
import re
from typing import Dict, List, Set
from collections import Counter
import json

class GitHubAnalyzer:
    """
    Analyze GitHub profiles to extract:
    - Programming languages used
    - Projects and repositories
    - Contribution activity
    - Inferred skills
    """
    
    def __init__(self, github_token: str = None):
        """
        Initialize GitHub analyzer
        
        Args:
            github_token: Optional GitHub personal access token for higher rate limits
        """
        self.base_url = "https://api.github.com"
        self.headers = {
            'Accept': 'application/vnd.github.v3+json'
        }
        
        if github_token:
            self.headers['Authorization'] = f'token {github_token}'
        
        # Language to skill mapping
        self.language_skill_map = {
            'Python': ['Python', 'Data Science', 'Machine Learning'],
            'JavaScript': ['JavaScript', 'Web Development', 'Frontend'],
            'TypeScript': ['TypeScript', 'Web Development'],
            'Java': ['Java', 'Backend Development'],
            'C++': ['C++', 'System Programming'],
            'C#': ['C#', '.NET'],
            'Go': ['Go', 'Cloud Development'],
            'Rust': ['Rust', 'System Programming'],
            'Ruby': ['Ruby', 'Web Development'],
            'PHP': ['PHP', 'Web Development'],
            'Swift': ['Swift', 'iOS Development'],
            'Kotlin': ['Kotlin', 'Android Development'],
            'R': ['R', 'Statistics', 'Data Analysis'],
            'SQL': ['SQL', 'Database'],
            'HTML': ['HTML', 'Web Development'],
            'CSS': ['CSS', 'Web Development', 'Frontend'],
        }
        
        # Framework/tech detection in repo names and descriptions
        self.tech_patterns = {
            'react': 'React',
            'vue': 'Vue.js',
            'angular': 'Angular',
            'django': 'Django',
            'flask': 'Flask',
            'tensorflow': 'TensorFlow',
            'pytorch': 'PyTorch',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'aws': 'AWS',
            'azure': 'Azure',
            'mongodb': 'MongoDB',
            'postgresql': 'PostgreSQL',
            'redis': 'Redis',
            'elasticsearch': 'Elasticsearch',
        }
    
    def analyze_profile(self, username: str) -> Dict:
        """
        Analyze a GitHub profile comprehensively
        
        Returns:
        {
            'username': str,
            'skills': List[str],
            'languages': Dict[str, int],
            'top_repos': List[Dict],
            'activity_score': float,
            'contribution_years': float,
            'metadata': Dict
        }
        """
        try:
            # Get user info
            user_data = self._get_user_data(username)
            
            if not user_data:
                raise Exception("Failed to fetch user data")
            
            # Get repositories
            repos = self._get_user_repos(username)
            
            # Analyze languages across all repos
            languages = self._analyze_languages(repos)
            
            # Extract skills from repos
            skills = self._extract_skills_from_repos(repos, languages)
            
            # Get contribution activity
            activity_score = self._calculate_activity_score(user_data, repos)
            
            # Calculate years of experience
            contribution_years = self._calculate_contribution_years(user_data)
            
            # Get top repositories
            top_repos = self._get_top_repos(repos, limit=5)
            
            return {
                'username': username,
                'skills': list(skills) if skills else [],
                'languages': languages if languages else {},
                'top_repos': top_repos if top_repos else [],
                'activity_score': activity_score,
                'contribution_years': contribution_years,
                'metadata': {
                    'public_repos': user_data.get('public_repos', 0) or 0,
                    'followers': user_data.get('followers', 0) or 0,
                    'total_stars': sum((r.get('stargazers_count') or 0) for r in repos if r) if repos else 0,
                    'total_forks': sum((r.get('forks_count') or 0) for r in repos if r) if repos else 0,
                }
            }
        
        except requests.exceptions.RequestException as e:
            raise Exception(f"GitHub API error: {e}")
    
    def _get_user_data(self, username: str) -> Dict:
        """Get user profile data"""
        url = f"{self.base_url}/users/{username}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def _get_user_repos(self, username: str, max_repos: int = 100) -> List[Dict]:
        """Get user's repositories"""
        repos = []
        page = 1
        per_page = 30
        
        while len(repos) < max_repos:
            url = f"{self.base_url}/users/{username}/repos"
            params = {
                'page': page,
                'per_page': per_page,
                'sort': 'updated',
                'direction': 'desc'
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            batch = response.json()
            if not batch:
                break
            
            repos.extend(batch)
            page += 1
        
        return repos[:max_repos]
    
    def _analyze_languages(self, repos: List[Dict]) -> Dict[str, int]:
        """
        Analyze programming languages across repositories
        
        Returns: Dict of language -> total bytes
        """
        language_stats = Counter()
        
        if not repos:
            return {}
        
        for repo in repos:
            if not repo or repo.get('fork'):  # Skip forked repos and None repos
                continue
            
            # Get language breakdown for this repo
            languages_url = repo.get('languages_url')
            if languages_url:
                try:
                    response = requests.get(languages_url, headers=self.headers)
                    response.raise_for_status()
                    lang_data = response.json()
                    
                    if lang_data:
                        for lang, bytes_count in lang_data.items():
                            if lang and bytes_count:
                                language_stats[lang] += bytes_count
                
                except:
                    # Fallback to primary language
                    primary_lang = repo.get('language')
                    if primary_lang:
                        language_stats[primary_lang] += 1000  # Arbitrary weight
        
        # Convert to percentages
        total_bytes = sum(language_stats.values())
        if total_bytes > 0:
            language_percentages = {
                lang: round((count / total_bytes) * 100, 2)
                for lang, count in language_stats.items()
            }
            return dict(sorted(language_percentages.items(), 
                             key=lambda x: x[1], 
                             reverse=True))
        
        return {}
    
    def _extract_skills_from_repos(self, repos: List[Dict], languages: Dict) -> Set[str]:
        """Extract skills from repository analysis"""
        skills = set()
        
        # Add skills from languages
        if languages:
            for language, percentage in languages.items():
                if percentage > 5:  # Only if significant usage (>5%)
                    mapped_skills = self.language_skill_map.get(language, [language])
                    skills.update(mapped_skills)
        
        # Scan repo names and descriptions for tech keywords
        if repos:
            for repo in repos:
                if not repo or repo.get('fork'):
                    continue
                
                # Safely get name and description with None checks
                name = repo.get('name') or ''
                description = repo.get('description') or ''
                text = f"{name} {description}".lower()
                
                for pattern, skill in self.tech_patterns.items():
                    if pattern in text:
                        skills.add(skill)
        
        # Analyze topics/tags
        if repos:
            for repo in repos:
                if not repo:
                    continue
                    
                topics = repo.get('topics') or []
                if topics:
                    for topic in topics:
                        if topic:  # Check topic is not None
                            # Capitalize topic as potential skill
                            capitalized_topic = topic.replace('-', ' ').title()
                            if len(capitalized_topic.split()) <= 3:  # Avoid long phrases
                                skills.add(capitalized_topic)
        
        return skills
    
    def _calculate_activity_score(self, user_data: Dict, repos: List[Dict]) -> float:
        """
        Calculate activity score (0-1) based on GitHub activity
        
        Factors:
        - Number of repos
        - Stars received
        - Followers
        - Recent activity
        """
        score = 0.0
        
        if not user_data:
            return 0.0
        
        # Repos (max 0.3)
        repo_count = user_data.get('public_repos', 0) or 0
        score += min(repo_count / 50, 0.3)
        
        # Stars (max 0.3)
        if repos:
            total_stars = sum(r.get('stargazers_count', 0) or 0 for r in repos if r)
            score += min(total_stars / 100, 0.3)
        
        # Followers (max 0.2)
        followers = user_data.get('followers', 0) or 0
        score += min(followers / 50, 0.2)
        
        # Recent activity (max 0.2)
        if repos:
            recent_repos = sum(1 for r in repos if r and self._is_recently_updated(r))
            score += min(recent_repos / 10, 0.2)
        
        return round(min(score, 1.0), 2)
    
    def _is_recently_updated(self, repo: Dict) -> bool:
        """Check if repo was updated in last 6 months"""
        if not repo:
            return False
            
        from datetime import datetime, timedelta
        
        updated_at = repo.get('updated_at', '')
        if not updated_at:
            return False
        
        try:
            updated_date = datetime.strptime(updated_at, '%Y-%m-%dT%H:%M:%SZ')
            six_months_ago = datetime.now() - timedelta(days=180)
            return updated_date > six_months_ago
        except:
            return False
    
    def _calculate_contribution_years(self, user_data: Dict) -> float:
        """Calculate years since account creation"""
        from datetime import datetime
        
        created_at = user_data.get('created_at', '')
        if not created_at:
            return 0.0
        
        try:
            created_date = datetime.strptime(created_at, '%Y-%m-%dT%H:%M:%SZ')
            years = (datetime.now() - created_date).days / 365.25
            return round(years, 1)
        except:
            return 0.0
    
    def _get_top_repos(self, repos: List[Dict], limit: int = 5) -> List[Dict]:
        """Get top repositories by stars and activity"""
        if not repos:
            return []
        
        # Filter out forks and None values
        original_repos = [r for r in repos if r and not r.get('fork')]
        
        if not original_repos:
            return []
        
        # Sort by stars and recent updates
        sorted_repos = sorted(
            original_repos,
            key=lambda r: (
                (r.get('stargazers_count') or 0) * 2 +  # Weight stars more
                (1 if self._is_recently_updated(r) else 0)
            ),
            reverse=True
        )
        
        # Return essential info
        top = []
        for repo in sorted_repos[:limit]:
            if repo:
                top.append({
                    'name': repo.get('name') or 'Unknown',
                    'description': (repo.get('description') or '')[:100],
                    'language': repo.get('language') or 'Unknown',
                    'stars': repo.get('stargazers_count') or 0,
                    'forks': repo.get('forks_count') or 0,
                    'url': repo.get('html_url') or '',
                    'topics': repo.get('topics') or []
                })
        
        return top
    
    def calculate_learning_speed(self, github_data: Dict) -> float:
        """
        Estimate learning speed from GitHub activity
        
        Returns: float between 0 and 1
        """
        base_speed = 0.5
        
        # Factor 1: Activity score
        activity_factor = github_data.get('activity_score', 0) * 0.2
        
        # Factor 2: Language diversity (more languages = faster learner)
        num_languages = len(github_data.get('languages', {}))
        language_factor = min(num_languages / 10, 0.2)
        
        # Factor 3: Years of experience
        years = github_data.get('contribution_years', 0)
        exp_factor = min(years / 10, 0.3)
        
        learning_speed = min(base_speed + activity_factor + language_factor + exp_factor, 1.0)
        
        return round(learning_speed, 2)


# Utility functions
def analyze_github_profile(username: str, token: str = None) -> Dict:
    """Convenience function to analyze a GitHub profile"""
    analyzer = GitHubAnalyzer(github_token=token)
    return analyzer.analyze_profile(username)


def get_github_skills(username: str, token: str = None) -> List[str]:
    """Quick function to just get skills from GitHub"""
    analyzer = GitHubAnalyzer(github_token=token)
    profile = analyzer.analyze_profile(username)
    return profile.get('skills', [])