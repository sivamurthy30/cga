"""
NOVEL CONTRIBUTION: Multi-Objective Skill Recommendation
Optimize for career readiness, learning time, difficulty match, and market demand

Real learners care about multiple factors simultaneously!
"""

import numpy as np
from typing import Dict, List, Tuple
import pandas as pd

class MultiObjectiveRewardCalculator:
    """
    Calculate rewards considering multiple objectives
    
    OBJECTIVES:
    1. Career Readiness (primary)
    2. Learning Time (minimize)
    3. Difficulty Match (personalized)
    4. Market Demand (job opportunities)
    5. Prerequisite Satisfaction
    
    NOVEL ASPECTS:
    - Pareto-optimal skill selection
    - User-configurable objective weights
    - Dynamic objective balancing
    """
    
    def __init__(self, skills_df: pd.DataFrame):
        """
        Initialize multi-objective calculator
        
        Args:
            skills_df: DataFrame with skill metadata
        """
        self.skills_df = skills_df
        self.skill_metadata = skills_df.set_index('skill').to_dict('index')
        
        # Default objective weights (user-configurable)
        self.objective_weights = {
            'career_readiness': 0.40,     # Most important
            'time_efficiency': 0.20,       # Faster is better
            'difficulty_match': 0.20,      # Appropriate challenge
            'market_demand': 0.15,         # Job opportunities
            'prerequisite_fit': 0.05       # Has prerequisites
        }
        
        # Market demand scores (from job posting analysis)
        self.market_demand_scores = self._calculate_market_demand()
    
    def calculate_multi_objective_reward(
        self, 
        skill: str, 
        learner: Dict,
        resume_data: Dict = None,
        github_data: Dict = None,
        target_role_skills: List[str] = None
    ) -> Tuple[float, Dict]:
        """
        Calculate reward considering all objectives
        
        Returns:
            (total_reward, objective_breakdown)
        """
        objectives = {}
        
        # Objective 1: Career Readiness
        objectives['career_readiness'] = self._career_readiness_score(
            skill, learner, target_role_skills
        )
        
        # Objective 2: Time Efficiency
        objectives['time_efficiency'] = self._time_efficiency_score(
            skill, learner
        )
        
        # Objective 3: Difficulty Match
        objectives['difficulty_match'] = self._difficulty_match_score(
            skill, learner
        )
        
        # Objective 4: Market Demand
        objectives['market_demand'] = self._market_demand_score(skill)
        
        # Objective 5: Prerequisite Fit
        objectives['prerequisite_fit'] = self._prerequisite_fit_score(
            skill, learner, resume_data, github_data
        )
        
        # Weighted combination
        total_reward = sum(
            self.objective_weights[obj] * score
            for obj, score in objectives.items()
        )
        
        # Add noise for realistic simulation
        noise = np.random.normal(0, 0.05)
        total_reward = np.clip(total_reward + noise, 0, 1)
        
        return total_reward, objectives
    
    def _career_readiness_score(
        self, 
        skill: str, 
        learner: Dict,
        target_role_skills: List[str]
    ) -> float:
        """
        How much does this skill improve career readiness?
        
        Score based on:
        - Is it required for target role?
        - How critical is it? (frequency in job postings)
        """
        if target_role_skills is None:
            target_role_skills = []
        
        # Check if skill is required
        if skill not in target_role_skills:
            return 0.3  # Not required, but might be useful
        
        # Calculate criticality (position in skill list)
        # Earlier skills are more critical
        try:
            position = target_role_skills.index(skill)
            criticality = 1.0 - (position / len(target_role_skills))
        except:
            criticality = 0.5
        
        # Known skills ratio
        known_skills = set(learner.get('known_skills', '').split(','))
        known_count = len(known_skills & set(target_role_skills))
        total_count = len(target_role_skills)
        
        completeness = known_count / total_count if total_count > 0 else 0
        
        # Higher score if filling critical gap
        score = 0.5 + (0.3 * criticality) + (0.2 * (1 - completeness))
        
        return np.clip(score, 0, 1)
    
    def _time_efficiency_score(self, skill: str, learner: Dict) -> float:
        """
        Prefer skills that can be learned quickly
        
        Adjusted for learner's speed
        """
        metadata = self.skill_metadata.get(skill, {})
        learning_time = metadata.get('learning_time', 150)
        learning_speed = learner.get('learning_speed', 0.5)
        
        # Effective time = base_time / learner_speed
        effective_time = learning_time / max(learning_speed, 0.3)
        
        # Normalize (assume max 500 hours)
        # Lower time = higher score
        time_score = 1.0 - min(effective_time / 500, 1.0)
        
        return time_score
    
    def _difficulty_match_score(self, skill: str, learner: Dict) -> float:
        """
        Skill difficulty should match learner ability
        
        Too easy → boring
        Too hard → frustrating
        Just right → optimal learning (Flow state)
        """
        metadata = self.skill_metadata.get(skill, {})
        difficulty = metadata.get('difficulty', 0.5)
        learning_speed = learner.get('learning_speed', 0.5)
        
        # Optimal difficulty = slightly above current level
        # High-speed learner → can handle harder skills
        optimal_difficulty = learning_speed
        
        # Calculate match (Gaussian around optimal)
        diff = abs(difficulty - optimal_difficulty)
        
        # Best match at diff=0, decreases as diff increases
        match_score = np.exp(-(diff ** 2) / 0.2)
        
        return match_score
    
    def _market_demand_score(self, skill: str) -> float:
        """
        How in-demand is this skill in the job market?
        
        Based on job posting frequency analysis
        """
        return self.market_demand_scores.get(skill, 0.5)
    
    def _prerequisite_fit_score(
        self, 
        skill: str, 
        learner: Dict,
        resume_data: Dict,
        github_data: Dict
    ) -> float:
        """
        Does learner have prerequisites for this skill?
        
        Examples:
        - Machine Learning requires Python, Statistics
        - Deep Learning requires Machine Learning
        - React requires JavaScript
        """
        prerequisites = self._get_prerequisites(skill)
        
        if not prerequisites:
            return 1.0  # No prerequisites needed
        
        # Check which prerequisites learner has
        known_skills = set(learner.get('known_skills', '').split(','))
        
        if resume_data:
            resume_skills = set(resume_data.get('skills', []))
            known_skills.update(resume_skills)
        
        if github_data:
            github_skills = set(github_data.get('skills', []))
            known_skills.update(github_skills)
        
        # Calculate satisfaction rate
        satisfied = len(prerequisites & known_skills)
        total = len(prerequisites)
        
        return satisfied / total if total > 0 else 1.0
    
    def _get_prerequisites(self, skill: str) -> set:
        """
        Get prerequisite skills
        
        This could be loaded from a knowledge graph
        """
        prereq_map = {
            'Machine Learning': {'Python', 'Statistics', 'Mathematics'},
            'Deep Learning': {'Machine Learning', 'Python', 'Linear Algebra'},
            'TensorFlow': {'Deep Learning', 'Python'},
            'PyTorch': {'Deep Learning', 'Python'},
            'React': {'JavaScript', 'HTML', 'CSS'},
            'Angular': {'JavaScript', 'TypeScript', 'HTML', 'CSS'},
            'Django': {'Python'},
            'Flask': {'Python'},
            'Spring Boot': {'Java'},
            'Kubernetes': {'Docker', 'Linux'},
            'Terraform': {'Cloud Architecture', 'DevOps'},
        }
        
        return prereq_map.get(skill, set())
    
    def _calculate_market_demand(self) -> Dict[str, float]:
        """
        Calculate market demand scores from job posting analysis
        
        In production, this would analyze real job postings
        For now, use heuristic based on skill category
        """
        demand_scores = {}
        
        for _, row in self.skills_df.iterrows():
            skill = row['skill']
            category = row.get('category', 'Unknown')
            
            # Heuristic: certain categories are more in-demand
            category_demand = {
                'AI': 0.95,
                'Cloud': 0.90,
                'Programming': 0.85,
                'Data Science': 0.88,
                'Frontend': 0.75,
                'Backend': 0.82,
                'DevOps': 0.85,
                'Database': 0.70,
                'Mobile': 0.65,
                'Security': 0.80,
                'Management': 0.60,
                'Design': 0.55
            }
            
            base_demand = category_demand.get(category, 0.50)
            
            # Add randomness
            demand_scores[skill] = np.clip(
                base_demand + np.random.normal(0, 0.05),
                0, 1
            )
        
        return demand_scores
    
    def update_objective_weights(self, new_weights: Dict[str, float]):
        """
        Allow user to configure objective priorities
        
        Example:
        - Student → prioritize time_efficiency
        - Career switcher → prioritize market_demand
        - Enthusiast → prioritize difficulty_match
        """
        # Normalize weights
        total = sum(new_weights.values())
        self.objective_weights = {
            obj: weight / total
            for obj, weight in new_weights.items()
        }
    
    def pareto_optimal_selection(
        self, 
        candidate_skills: List[str],
        learner: Dict,
        top_k: int = 3
    ) -> List[Tuple[str, Dict]]:
        """
        Select Pareto-optimal skills
        
        A skill is Pareto-optimal if no other skill is better
        in ALL objectives
        
        Returns top_k Pareto-optimal skills
        """
        skill_objectives = []
        
        for skill in candidate_skills:
            reward, objectives = self.calculate_multi_objective_reward(
                skill, learner
            )
            skill_objectives.append((skill, objectives, reward))
        
        # Find Pareto front
        pareto_optimal = []
        
        for i, (skill_i, obj_i, reward_i) in enumerate(skill_objectives):
            is_dominated = False
            
            # Check if skill_i is dominated by any other skill
            for j, (skill_j, obj_j, reward_j) in enumerate(skill_objectives):
                if i == j:
                    continue
                
                # Check if skill_j dominates skill_i
                # (better in all objectives)
                all_better = all(
                    obj_j[obj] >= obj_i[obj]
                    for obj in obj_i.keys()
                )
                
                any_strictly_better = any(
                    obj_j[obj] > obj_i[obj]
                    for obj in obj_i.keys()
                )
                
                if all_better and any_strictly_better:
                    is_dominated = True
                    break
            
            if not is_dominated:
                pareto_optimal.append((skill_i, obj_i, reward_i))
        
        # Sort by total reward and return top_k
        pareto_optimal.sort(key=lambda x: x[2], reverse=True)
        
        return pareto_optimal[:top_k]


# Test
if __name__ == "__main__":
    # Load skills
    skills_df = pd.read_csv("data/skill_metadata.csv")
    
    # Initialize
    mo_calculator = MultiObjectiveRewardCalculator(skills_df)
    
    # Test learner
    learner = {
        'id': 1,
        'target_role': 'Data Scientist',
        'known_skills': 'Python,SQL',
        'learning_speed': 0.8
    }
    
    target_skills = ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Pandas']
    
    print("Multi-Objective Reward Calculation")
    print("=" * 60)
    
    # Calculate for different skills
    test_skills = ['Statistics', 'Machine Learning', 'Deep Learning', 'Tableau']
    
    for skill in test_skills:
        reward, objectives = mo_calculator.calculate_multi_objective_reward(
            skill, learner, target_role_skills=target_skills
        )
        
        print(f"\n{skill}:")
        print(f"  Total Reward: {reward:.3f}")
        print("  Objectives:")
        for obj, score in objectives.items():
            print(f"    {obj}: {score:.3f}")
    
    # Pareto-optimal selection
    print("\n" + "=" * 60)
    print("Pareto-Optimal Selection (Top 3):")
    print("=" * 60)
    
    candidate_skills = ['Statistics', 'Machine Learning', 'Pandas', 'NumPy', 'Matplotlib']
    pareto_skills = mo_calculator.pareto_optimal_selection(
        candidate_skills, learner, top_k=3
    )
    
    for i, (skill, objectives, reward) in enumerate(pareto_skills, 1):
        print(f"\n{i}. {skill} (Total: {reward:.3f})")
        print(f"   Career: {objectives['career_readiness']:.2f} | "
              f"Time: {objectives['time_efficiency']:.2f} | "
              f"Difficulty: {objectives['difficulty_match']:.2f}")
