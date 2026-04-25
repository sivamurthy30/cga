"""
System 1: Enhanced LinUCB Contextual Bandit
- 11-dimensional context vector
- Reward = Click-through + Skill Completion Time + Assessment Score Improvement
"""

import numpy as np
import pandas as pd
import json
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))

from bandit.linucb import LinUCB
from bandit.multi_objective import MultiObjectiveRewardCalculator


class LinUCBSkillRecommender:
    """
    LinUCB Contextual Bandit with composite reward function.

    Reward = 0.3 * click_through
           + 0.4 * completion_efficiency   (ideal_time / actual_time, capped at 1)
           + 0.3 * assessment_improvement  (post_score - pre_score, normalised)
    """

    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.n_features = 11
        self._load_data()
        self.bandit = LinUCB(
            arms=self.all_skills,
            n_features=self.n_features,
            alpha=self.alpha
        )
        self.reward_calculator = MultiObjectiveRewardCalculator(self.skills_df)
        self.interaction_history: List[Dict] = []

    # ------------------------------------------------------------------
    # Data loading
    # ------------------------------------------------------------------
    def _load_data(self):
        try:
            root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
            self.skills_df = pd.read_csv(os.path.join(root, 'data', 'skill_metadata.csv'))
            self.all_skills = self.skills_df['skill'].tolist()
            roles_df = pd.read_csv(os.path.join(root, 'data', 'roles_skills.csv'))
            self.role_skills_map: Dict[str, List[str]] = {
                role: roles_df[roles_df['role'] == role]['skill'].tolist()
                for role in roles_df['role'].unique()
            }
        except Exception as e:
            print(f"⚠️  Data load fallback: {e}")
            self.all_skills = ['Python', 'JavaScript', 'React', 'SQL', 'Docker']
            self.skills_df = pd.DataFrame({
                'skill': self.all_skills,
                'difficulty': [0.3, 0.35, 0.5, 0.4, 0.5],
                'learning_time': [100, 90, 120, 80, 100],
                'category': ['Programming', 'Programming', 'Frontend', 'Database', 'DevOps'],
                'market_demand': [0.9, 0.95, 0.85, 0.8, 0.75],
            })
            self.role_skills_map = {
                'Full Stack Developer': self.all_skills
            }

    # ------------------------------------------------------------------
    # Context vector  (11 dimensions)
    # ------------------------------------------------------------------
    def create_context_vector(self, profile: Dict) -> np.ndarray:
        """
        Dimensions:
          0  role_encoded          (0-5)
          1  num_known_skills      (0-20, capped)
          2  has_ml_skills         (0/1)
          3  num_projects          (0-10, capped)
          4  experience_years      (0-10, capped)
          5  has_github            (0/1)
          6  has_portfolio         (0/1)
          7  has_certifications    (0/1)
          8  has_quantifiable_metrics (0/1)
          9  has_web_skills        (0/1)
          10 github_velocity       (0-1, normalised commits/week)
        """
        role_map = {
            'Frontend Developer': 0, 'Backend Developer': 1,
            'Full Stack Developer': 2, 'Data Scientist': 3,
            'DevOps Engineer': 4, 'Machine Learning Engineer': 5,
        }
        role_enc = role_map.get(profile.get('target_role', 'Full Stack Developer'), 2)

        known = [s.strip() for s in profile.get('known_skills', '').split(',') if s.strip()]
        kl = ' '.join(s.lower() for s in known)

        has_ml  = int(any(k in kl for k in ['machine learning', 'tensorflow', 'pytorch', 'ml']))
        has_web = int(any(k in kl for k in ['react', 'vue', 'angular', 'html', 'css', 'javascript']))

        # github_velocity: commits per week normalised to [0,1] (cap at 50/week)
        velocity = min(profile.get('github_velocity', 0) / 50.0, 1.0)

        ctx = np.array([
            role_enc,
            min(len(known), 20),
            has_ml,
            min(profile.get('num_projects', 0), 10),
            min(profile.get('experience_years', 0), 10),
            int(profile.get('has_github', False)),
            int(profile.get('has_portfolio', False)),
            int(profile.get('has_certifications', False)),
            int(profile.get('has_quantifiable_metrics', False)),
            has_web,
            velocity,
        ], dtype=float)
        return ctx.reshape(-1, 1)

    # ------------------------------------------------------------------
    # Composite reward function
    # ------------------------------------------------------------------
    def compute_composite_reward(
        self,
        interaction_type: str,
        time_spent: Optional[int] = None,
        ideal_time: Optional[int] = None,
        pre_score: Optional[float] = None,
        post_score: Optional[float] = None,
    ) -> float:
        """
        reward = 0.3 * click_through
               + 0.4 * completion_efficiency
               + 0.3 * assessment_improvement
        """
        # --- click-through component ---
        ctr_map = {
            'skipped': 0.0, 'clicked': 0.4, 'started': 0.7,
            'progress': 0.85, 'completed': 1.0,
        }
        ctr = ctr_map.get(interaction_type, 0.3)

        # --- completion efficiency ---
        if time_spent and ideal_time and ideal_time > 0:
            efficiency = min(ideal_time / time_spent, 1.0)
        elif interaction_type == 'completed':
            efficiency = 0.8
        else:
            efficiency = 0.0

        # --- assessment improvement ---
        if pre_score is not None and post_score is not None:
            improvement = max(0.0, min((post_score - pre_score) / 100.0, 1.0))
        else:
            improvement = 0.0

        reward = 0.3 * ctr + 0.4 * efficiency + 0.3 * improvement
        return round(float(reward), 4)

    # ------------------------------------------------------------------
    # Recommend
    # ------------------------------------------------------------------
    def recommend_skills(
        self,
        learner_profile: Dict,
        top_k: int = 5,
        exclude_known: bool = True,
    ) -> List[Dict]:
        ctx = self.create_context_vector(learner_profile)
        known = (
            [s.strip() for s in learner_profile.get('known_skills', '').split(',') if s.strip()]
            if exclude_known else []
        )
        candidates = [s for s in self.all_skills if s not in known]
        if not candidates:
            return []

        target_role = learner_profile.get('target_role', 'Full Stack Developer')
        role_skills = self.role_skills_map.get(target_role, [])
        contexts = {s: ctx for s in candidates}

        results = []
        for _ in range(min(top_k, len(contexts))):
            best = self.bandit.recommend(contexts)
            reward, objectives = self.reward_calculator.calculate_multi_objective_reward(
                skill=best, learner=learner_profile, target_role_skills=role_skills
            )
            row = self.skills_df[self.skills_df['skill'] == best]
            meta = row.iloc[0] if not row.empty else None

            results.append({
                'skill': best,
                'expected_reward': float(reward),
                'objectives': {k: float(v) for k, v in objectives.items()},
                'metadata': {
                    'difficulty': float(meta['difficulty']) if meta is not None else 0.5,
                    'learning_time': int(meta['learning_time']) if meta is not None else 60,
                    'category': meta['category'] if meta is not None else 'General',
                    'is_required': best in role_skills,
                },
            })
            del contexts[best]
            if not contexts:
                break
        return results

    # ------------------------------------------------------------------
    # Update
    # ------------------------------------------------------------------
    def update_with_feedback(self, learner_profile: Dict, skill: str, reward: float):
        ctx = self.create_context_vector(learner_profile)
        self.bandit.update(skill, reward, ctx)
        self.interaction_history.append({
            'timestamp': datetime.utcnow().isoformat(),
            'learner_id': learner_profile.get('id', 'anon'),
            'skill': skill,
            'reward': reward,
            'target_role': learner_profile.get('target_role', ''),
        })

    # ------------------------------------------------------------------
    # Stats / persistence
    # ------------------------------------------------------------------
    def get_statistics(self) -> Dict:
        if not self.interaction_history:
            return {'total_interactions': 0, 'average_reward': 0.0,
                    'median_reward': 0.0, 'total_skills_recommended': 0,
                    'reward_distribution': {}}
        rewards = [h['reward'] for h in self.interaction_history]
        return {
            'total_interactions': len(self.interaction_history),
            'average_reward': float(np.mean(rewards)),
            'median_reward': float(np.median(rewards)),
            'total_skills_recommended': len({h['skill'] for h in self.interaction_history}),
            'reward_distribution': {
                'excellent (0.8-1.0)': sum(1 for r in rewards if r >= 0.8),
                'good (0.6-0.8)':      sum(1 for r in rewards if 0.6 <= r < 0.8),
                'okay (0.3-0.6)':      sum(1 for r in rewards if 0.3 <= r < 0.6),
                'poor (0.0-0.3)':      sum(1 for r in rewards if r < 0.3),
            },
        }

    def save_model(self, filepath: str):
        state = {
            'A': {s: self.bandit.A[s].tolist() for s in self.bandit.arms},
            'b': {s: self.bandit.b[s].tolist() for s in self.bandit.arms},
            'alpha': self.bandit.alpha,
            'history': self.interaction_history[-1000:],
        }
        with open(filepath, 'w') as f:
            json.dump(state, f)

    def load_model(self, filepath: str):
        with open(filepath) as f:
            state = json.load(f)
        for s in self.bandit.arms:
            if s in state['A']:
                self.bandit.A[s] = np.array(state['A'][s])
                self.bandit.b[s] = np.array(state['b'][s])
        self.bandit.alpha = state.get('alpha', 1.0)
        self.interaction_history = state.get('history', [])


# Singleton
_instance: Optional[LinUCBSkillRecommender] = None

def get_linucb_recommender() -> LinUCBSkillRecommender:
    global _instance
    if _instance is None:
        _instance = LinUCBSkillRecommender(alpha=1.0)
        model_path = os.path.join(os.path.dirname(__file__), '../../../data/linucb_model.json')
        if os.path.exists(model_path):
            try:
                _instance.load_model(model_path)
            except Exception as e:
                print(f"⚠️  Could not load saved model: {e}")
    return _instance
