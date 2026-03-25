"""
NOVEL CONTRIBUTION: Explainable AI for Skill Recommendations
Make bandit decisions interpretable and transparent
"""

import numpy as np
from typing import Dict, List
import pandas as pd


class ExplainableRecommender:
    """
    Generate human-readable explanations for skill recommendations
    """

    def __init__(self, skills_df: pd.DataFrame):
        self.skills_df = skills_df
        self.skill_metadata = skills_df.set_index('skill').to_dict('index')
        self.templates = self._load_templates()

    # ------------------------------------------------------------------ #
    # 🔧 UTILITY: SAFE SCORE CONVERSION
    # ------------------------------------------------------------------ #
    def _safe_scores(self, scores: Dict) -> Dict[str, float]:
        """
        Convert all scores to float safely
        """
        safe_dict = {}

        for k, v in scores.items():
            try:
                safe_dict[k] = float(v)
            except (ValueError, TypeError):
                safe_dict[k] = 0.0

        return safe_dict

    # ------------------------------------------------------------------ #
    # 🎯 MAIN EXPLANATION FUNCTION
    # ------------------------------------------------------------------ #
    def explain_recommendation(
        self,
        recommended_skill: str,
        learner: Dict,
        all_candidate_scores: Dict[str, float],
        objectives: Dict[str, float] = None,
        confidence: float = None,
        level: str = 'simple'
    ) -> Dict:

        # ✅ Ensure numeric scores
        all_candidate_scores = self._safe_scores(all_candidate_scores)

        explanation = {
            'recommended_skill': recommended_skill,
            'confidence': float(confidence) if confidence else 0.8,
            'level': level
        }

        if level == 'simple':
            explanation.update(
                self._simple_explanation(recommended_skill, learner, objectives)
            )

        elif level == 'detailed':
            explanation.update(
                self._detailed_explanation(
                    recommended_skill,
                    learner,
                    all_candidate_scores,
                    objectives
                )
            )

        elif level == 'technical':
            explanation.update(
                self._technical_explanation(
                    recommended_skill,
                    learner,
                    all_candidate_scores,
                    objectives
                )
            )

        explanation['alternatives'] = self._get_alternatives(
            recommended_skill,
            all_candidate_scores
        )

        explanation['why_not'] = self._counterfactual_explanation(
            recommended_skill,
            all_candidate_scores
        )

        return explanation

    # ------------------------------------------------------------------ #
    # 🧠 SIMPLE EXPLANATION
    # ------------------------------------------------------------------ #
    def _simple_explanation(self, skill, learner, objectives):

        target_role = learner.get('target_role', 'your career')
        learning_speed = learner.get('learning_speed', 0.5)

        metadata = self.skill_metadata.get(skill, {})
        difficulty = float(metadata.get('difficulty', 0.5))
        learning_time = float(metadata.get('learning_time', 100))

        reasons = []

        if objectives and objectives.get('career_readiness', 0) > 0.7:
            reasons.append(f"Essential for {target_role} roles")

        if abs(difficulty - learning_speed) < 0.2:
            reasons.append("Perfectly matches your skill level")
        elif difficulty < learning_speed:
            reasons.append("Easy to learn given your background")

        if learning_time < 120:
            reasons.append(f"Can be learned in ~{int(learning_time)} hours")

        if objectives and objectives.get('market_demand', 0) > 0.8:
            reasons.append("High demand in job market")

        summary = f"We recommend **{skill}** because: " + "; ".join(reasons)

        return {
            'summary': summary,
            'reasons': reasons,
            'estimated_time': f"{int(learning_time)} hours",
            'difficulty_rating': self._difficulty_label(difficulty)
        }

    # ------------------------------------------------------------------ #
    # 📊 DETAILED EXPLANATION
    # ------------------------------------------------------------------ #
    def _detailed_explanation(self, skill, learner, all_scores, objectives):

        simple = self._simple_explanation(skill, learner, objectives)
        metadata = self.skill_metadata.get(skill, {})

        detailed_breakdown = {
            'career_impact': self._impact_description(
                objectives.get('career_readiness', 0) if objectives else 0.5
            ),
            'learning_curve': self._learning_curve_description(
                metadata.get('difficulty', 0.5),
                learner.get('learning_speed', 0.5)
            ),
            'time_commitment': f"{metadata.get('learning_time', 100)} hours",
            'job_opportunities': self._job_opportunities_description(
                objectives.get('market_demand', 0) if objectives else 0.5
            ),
            'prerequisites': list(self._get_prerequisites(skill))
        }

        alternatives = sorted(
            all_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        if len(alternatives) > 1:
            runner_up = alternatives[1][0]
            detailed_breakdown['vs_alternative'] = \
                self._compare_skills(skill, runner_up, learner)

        return {
            **simple,
            'detailed_breakdown': detailed_breakdown
        }

    # ------------------------------------------------------------------ #
    # ⚙️ TECHNICAL EXPLANATION
    # ------------------------------------------------------------------ #
    def _technical_explanation(self, skill, learner, all_scores, objectives):

        detailed = self._detailed_explanation(
            skill, learner, all_scores, objectives
        )

        technical_details = {
            'ucb_score': all_scores.get(skill, 0),
            'expected_reward': all_scores.get(skill, 0),
            'exploration_bonus': 0.15,
            'objective_scores': objectives if objectives else {},
            'rank': self._get_rank(skill, all_scores),
            'score_percentile': self._get_percentile(skill, all_scores)
        }

        return {
            **detailed,
            'technical_details': technical_details
        }

    # ------------------------------------------------------------------ #
    # 🔄 ALTERNATIVES
    # ------------------------------------------------------------------ #
    def _get_alternatives(self, recommended, all_scores, top_k=3):

        sorted_skills = sorted(
            all_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        alternatives = []

        for skill, score in sorted_skills:
            if skill == recommended:
                continue

            metadata = self.skill_metadata.get(skill, {})

            alternatives.append({
                'skill': skill,
                'score': float(score),
                'difficulty': metadata.get('difficulty', 0.5),
                'learning_time': metadata.get('learning_time', 100),
                'reason': "Alternative learning path"
            })

            if len(alternatives) >= top_k:
                break

        return alternatives

    # ------------------------------------------------------------------ #
    # ❓ COUNTERFACTUAL EXPLANATION (FIXED)
    # ------------------------------------------------------------------ #
    def _counterfactual_explanation(self, recommended, all_scores):

        counterfactuals = []

        rec_score = float(all_scores.get(recommended, 0))

        lower_scored = [
            (skill, float(score))
            for skill, score in all_scores.items()
            if skill != recommended and float(score) < rec_score
        ]

        lower_scored.sort(key=lambda x: x[1], reverse=True)

        for skill, score in lower_scored[:2]:

            metadata = self.skill_metadata.get(skill, {})
            reasons = []

            if score < rec_score - 0.2:
                reasons.append("lower relevance to your goals")

            if float(metadata.get('learning_time', 0)) > 200:
                reasons.append("requires more time investment")

            if reasons:
                counterfactuals.append(
                    f"{skill} was not selected due to: {', '.join(reasons)}"
                )

        return counterfactuals

    # ------------------------------------------------------------------ #
    # 🧩 SUPPORT FUNCTIONS
    # ------------------------------------------------------------------ #
    def _compare_skills(self, a, b, learner):

        meta_a = self.skill_metadata.get(a, {})
        meta_b = self.skill_metadata.get(b, {})

        time_a = meta_a.get('learning_time', 0)
        time_b = meta_b.get('learning_time', 0)

        diff_a = meta_a.get('difficulty', 0.5)
        diff_b = meta_b.get('difficulty', 0.5)

        if time_a < time_b:
            faster = a
        else:
            faster = b

        easier = a if diff_a < diff_b else b

        return f"{faster} is faster to learn; {easier} is easier."

    def _get_prerequisites(self, skill):

        prereq_map = {
            'Machine Learning': {'Python', 'Statistics'},
            'Deep Learning': {'Machine Learning'},
            'React': {'JavaScript'},
        }

        return prereq_map.get(skill, set())

    def _difficulty_label(self, difficulty):

        if difficulty < 0.3:
            return "Beginner"
        elif difficulty < 0.6:
            return "Intermediate"
        return "Advanced"

    def _impact_description(self, score):

        if score > 0.8:
            return "Critical for career advancement"
        elif score > 0.6:
            return "High impact"
        return "Moderate impact"

    def _learning_curve_description(self, difficulty, speed):

        if abs(difficulty - speed) < 0.2:
            return "Well matched to your level"
        elif difficulty > speed:
            return "Challenging"
        return "Comfortable"

    def _job_opportunities_description(self, demand):

        if demand > 0.8:
            return "Very high demand"
        elif demand > 0.6:
            return "High demand"
        return "Moderate demand"

    def _get_rank(self, skill, scores):

        sorted_skills = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        for i, (s, _) in enumerate(sorted_skills, 1):
            if s == skill:
                return i

        return len(scores)

    def _get_percentile(self, skill, scores):

        skill_score = scores.get(skill, 0)
        better = sum(1 for s in scores.values() if s > skill_score)

        return 1 - (better / len(scores))

    def _load_templates(self):

        return {
            'career_critical': "{skill} is critical for {role}"
        }
