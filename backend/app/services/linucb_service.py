"""
LinUCB Reinforcement Learning Service for Skill Recommendations
Implements contextual bandit algorithm for personalized learning paths
"""

import numpy as np
import pandas as pd
import json
import os
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Import LinUCB and multi-objective calculator
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from bandit.linucb import LinUCB
from bandit.multi_objective import MultiObjectiveRewardCalculator


class LinUCBSkillRecommender:
    """
    LinUCB-based skill recommendation system with multi-objective rewards
    
    Features:
    - Contextual bandit learning
    - Multi-objective reward calculation
    - Personalized skill recommendations
    - Exploration-exploitation balance
    """
    
    def __init__(self, alpha: float = 1.0):
        """
        Initialize LinUCB recommender
        
        Args:
            alpha: Exploration parameter (higher = more exploration)
        """
        self.alpha = alpha
        self.n_features = 11  # Context vector dimension
        
        # Load skill and role data
        self._load_data()
        
        # Initialize LinUCB bandit
        self.bandit = LinUCB(
            arms=self.all_skills,
            n_features=self.n_features,
            alpha=self.alpha
        )
        
        # Initialize multi-objective reward calculator
        self.reward_calculator = MultiObjectiveRewardCalculator(self.skills_df)
        
        # Interaction history for analytics
        self.interaction_history = []
    
    def _load_data(self):
        """Load skill metadata and role mappings"""
        try:
            # Get project root
            current_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.abspath(os.path.join(current_dir, '../../../'))
            
            # Load skill metadata
            skills_path = os.path.join(project_root, 'data', 'skill_metadata.csv')
            self.skills_df = pd.read_csv(skills_path)
            self.all_skills = self.skills_df['skill'].tolist()
            
            # Load role-skill mappings
            roles_path = os.path.join(project_root, 'data', 'roles_skills.csv')
            self.roles_df = pd.read_csv(roles_path)
            
            # Create role-to-skills mapping
            self.role_skills_map = {}
            for role in self.roles_df['role'].unique():
                skills = self.roles_df[self.roles_df['role'] == role]['skill'].tolist()
                self.role_skills_map[role] = skills
            
            print(f"✅ Loaded {len(self.all_skills)} skills and {len(self.role_skills_map)} roles")
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            # Fallback to minimal data
            self.all_skills = ['Python', 'JavaScript', 'React', 'SQL', 'Docker']
            self.skills_df = pd.DataFrame({
                'skill': self.all_skills,
                'difficulty': [0.3, 0.35, 0.5, 0.4, 0.5],
                'learning_time': [100, 90, 120, 80, 100],
                'category': ['Programming', 'Programming', 'Frontend', 'Database', 'DevOps']
            })
            self.role_skills_map = {
                'Full Stack Developer': ['Python', 'JavaScript', 'React', 'SQL', 'Docker']
            }
    
    def create_context_vector(self, learner_profile: Dict) -> np.ndarray:
        """
        Create context vector from learner profile
        
        Args:
            learner_profile: Dict with keys:
                - target_role: str
                - known_skills: str (comma-separated)
                - num_projects: int
                - experience_years: int
                - has_github: bool
                - has_portfolio: bool
                - has_certifications: bool
                - has_quantifiable_metrics: bool
        
        Returns:
            11-dimensional context vector
        """
        # Role encoding (0-5 for 6 main roles)
        role_map = {
            'Frontend Developer': 0,
            'Backend Engineer': 1,
            'Full Stack Developer': 2,
            'Data Scientist': 3,
            'DevOps Engineer': 4,
            'ML Engineer': 5
        }
        role_encoded = role_map.get(learner_profile.get('target_role', 'Full Stack Developer'), 2)
        
        # Parse known skills
        known_skills_str = learner_profile.get('known_skills', '')
        known_skills = [s.strip() for s in known_skills_str.split(',') if s.strip()]
        num_skills = len(known_skills)
        
        # Check for specific skill categories
        known_skills_lower = [s.lower() for s in known_skills]
        has_ml_skills = any(kw in ' '.join(known_skills_lower) for kw in ['machine learning', 'ml', 'tensorflow', 'pytorch'])
        has_web_skills = any(kw in ' '.join(known_skills_lower) for kw in ['react', 'vue', 'angular', 'html', 'css', 'javascript'])
        has_cloud_skills = any(kw in ' '.join(known_skills_lower) for kw in ['aws', 'azure', 'gcp', 'docker', 'kubernetes'])
        
        # Create context vector
        context = np.array([
            role_encoded,
            min(num_skills, 20),  # Cap at 20
            int(has_ml_skills),
            min(learner_profile.get('num_projects', 0), 10),  # Cap at 10
            min(learner_profile.get('experience_years', 0), 10),  # Cap at 10
            int(learner_profile.get('has_github', False)),
            int(learner_profile.get('has_portfolio', False)),
            int(learner_profile.get('has_certifications', False)),
            int(learner_profile.get('has_quantifiable_metrics', False)),
            int(has_web_skills),
            int(has_cloud_skills)
        ], dtype=float)
        
        return context.reshape(-1, 1)
    
    def recommend_skills(
        self, 
        learner_profile: Dict, 
        top_k: int = 5,
        exclude_known: bool = True
    ) -> List[Dict]:
        """
        Recommend top-k skills using LinUCB
        
        Args:
            learner_profile: Learner information
            top_k: Number of skills to recommend
            exclude_known: Whether to exclude already known skills
        
        Returns:
            List of recommended skills with scores
        """
        # Create context vector
        context = self.create_context_vector(learner_profile)
        
        # Get known skills to exclude
        known_skills = []
        if exclude_known:
            known_skills_str = learner_profile.get('known_skills', '')
            known_skills = [s.strip() for s in known_skills_str.split(',') if s.strip()]
        
        # Get target role skills
        target_role = learner_profile.get('target_role', 'Full Stack Developer')
        target_role_skills = self.role_skills_map.get(target_role, [])
        
        # Create contexts for all candidate skills
        candidate_skills = [s for s in self.all_skills if s not in known_skills]
        
        if not candidate_skills:
            return []
        
        # Get LinUCB scores for all candidates
        contexts = {skill: context for skill in candidate_skills}
        
        # Get recommendations from bandit
        recommendations = []
        for _ in range(min(top_k, len(candidate_skills))):
            # Get best skill
            best_skill = self.bandit.recommend(contexts)
            
            # Calculate multi-objective reward for this skill
            reward, objectives = self.reward_calculator.calculate_multi_objective_reward(
                skill=best_skill,
                learner=learner_profile,
                target_role_skills=target_role_skills
            )
            
            # Get skill metadata
            skill_info = self.skills_df[self.skills_df['skill'] == best_skill]
            if not skill_info.empty:
                skill_data = skill_info.iloc[0]
                difficulty = skill_data['difficulty']
                learning_time = skill_data['learning_time']
                category = skill_data['category']
            else:
                difficulty = 0.5
                learning_time = 100
                category = 'Unknown'
            
            # Calculate UCB score
            ucb_matrix = contexts[best_skill].T @ self.bandit.A[best_skill] @ contexts[best_skill]
            ucb_score = float(ucb_matrix[0, 0]) if ucb_matrix.shape == (1, 1) else float(ucb_matrix)
            
            recommendations.append({
                'skill': best_skill,
                'ucb_score': ucb_score,
                'expected_reward': float(reward),
                'objectives': {
                    'career_readiness': float(objectives['career_readiness']),
                    'time_efficiency': float(objectives['time_efficiency']),
                    'difficulty_match': float(objectives['difficulty_match']),
                    'market_demand': float(objectives['market_demand']),
                    'prerequisite_fit': float(objectives['prerequisite_fit'])
                },
                'metadata': {
                    'difficulty': float(difficulty),
                    'learning_time': int(learning_time),
                    'category': category,
                    'is_required': best_skill in target_role_skills
                }
            })
            
            # Remove from candidates
            del contexts[best_skill]
            
            if not contexts:
                break
        
        return recommendations
    
    def update_with_feedback(
        self,
        learner_profile: Dict,
        skill: str,
        reward: float
    ):
        """
        Update LinUCB model with user feedback
        
        Args:
            learner_profile: Learner information
            skill: Skill that was recommended
            reward: Observed reward (0.0 to 1.0)
        """
        # Create context vector
        context = self.create_context_vector(learner_profile)
        
        # Update bandit
        self.bandit.update(skill, reward, context)
        
        # Log interaction
        self.interaction_history.append({
            'timestamp': datetime.now().isoformat(),
            'learner_id': learner_profile.get('id', 'unknown'),
            'skill': skill,
            'reward': reward,
            'target_role': learner_profile.get('target_role', 'unknown')
        })
    
    def calculate_reward_from_interaction(
        self,
        interaction_type: str,
        time_spent: Optional[int] = None,
        completed: bool = False
    ) -> float:
        """
        Calculate reward from user interaction
        
        Args:
            interaction_type: Type of interaction
                - 'clicked': User clicked on skill
                - 'started': User started learning
                - 'progress': User made progress
                - 'completed': User completed skill
                - 'skipped': User skipped skill
            time_spent: Time spent in minutes
            completed: Whether skill was completed
        
        Returns:
            Reward value (0.0 to 1.0)
        """
        if interaction_type == 'skipped':
            return 0.0
        
        if interaction_type == 'clicked':
            return 0.2
        
        if interaction_type == 'started':
            return 0.4
        
        if interaction_type == 'progress':
            if time_spent:
                # Reward based on time spent (cap at 120 minutes)
                return min(0.3 + (time_spent / 120) * 0.4, 0.7)
            return 0.5
        
        if interaction_type == 'completed' or completed:
            return 1.0
        
        return 0.3  # Default
    
    def get_statistics(self) -> Dict:
        """Get recommendation statistics"""
        if not self.interaction_history:
            return {
                'total_interactions': 0,
                'average_reward': 0.0,
                'total_skills_recommended': 0
            }
        
        rewards = [h['reward'] for h in self.interaction_history]
        skills = set(h['skill'] for h in self.interaction_history)
        
        return {
            'total_interactions': len(self.interaction_history),
            'average_reward': float(np.mean(rewards)),
            'median_reward': float(np.median(rewards)),
            'total_skills_recommended': len(skills),
            'reward_distribution': {
                'excellent (0.8-1.0)': sum(1 for r in rewards if r >= 0.8),
                'good (0.6-0.8)': sum(1 for r in rewards if 0.6 <= r < 0.8),
                'okay (0.3-0.6)': sum(1 for r in rewards if 0.3 <= r < 0.6),
                'poor (0.0-0.3)': sum(1 for r in rewards if r < 0.3)
            }
        }
    
    def save_model(self, filepath: str):
        """Save LinUCB model state"""
        model_state = {
            'A': {skill: self.bandit.A[skill].tolist() for skill in self.bandit.arms},
            'b': {skill: self.bandit.b[skill].tolist() for skill in self.bandit.arms},
            'alpha': self.bandit.alpha,
            'interaction_history': self.interaction_history[-1000:]  # Keep last 1000
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_state, f)
        
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load LinUCB model state"""
        with open(filepath, 'r') as f:
            model_state = json.load(f)
        
        # Restore A and b matrices
        for skill in self.bandit.arms:
            if skill in model_state['A']:
                self.bandit.A[skill] = np.array(model_state['A'][skill])
                self.bandit.b[skill] = np.array(model_state['b'][skill])
        
        self.bandit.alpha = model_state.get('alpha', 1.0)
        self.interaction_history = model_state.get('interaction_history', [])
        
        print(f"✅ Model loaded from {filepath}")


# Global instance
_linucb_recommender = None

def get_linucb_recommender() -> LinUCBSkillRecommender:
    """Get or create global LinUCB recommender instance"""
    global _linucb_recommender
    
    if _linucb_recommender is None:
        _linucb_recommender = LinUCBSkillRecommender(alpha=1.0)
        
        # Try to load saved model
        try:
            model_path = os.path.join(
                os.path.dirname(__file__),
                '../../../data/linucb_model.json'
            )
            if os.path.exists(model_path):
                _linucb_recommender.load_model(model_path)
        except Exception as e:
            print(f"⚠️ Could not load saved model: {e}")
    
    return _linucb_recommender
