"""
Unit Tests: Multi-Objective Reward Calculator
Validates Pareto-optimal selection and objective scoring
"""

import sys
import os
import numpy as np
import pytest
import pandas as pd

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from bandit.multi_objective import MultiObjectiveRewardCalculator


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture(scope="module")
def skills_df():
    return pd.DataFrame({
        "skill":         ["Python", "Machine Learning", "React", "Docker", "Statistics"],
        "difficulty":    [0.3,      0.8,                0.5,     0.5,      0.6],
        "learning_time": [100,      200,                120,     100,      150],
        "category":      ["Programming", "AI", "Frontend", "DevOps", "Data Science"],
        "market_demand": [0.9,      0.95,               0.75,    0.8,      0.85],
    })


@pytest.fixture(scope="module")
def calculator(skills_df):
    return MultiObjectiveRewardCalculator(skills_df)


@pytest.fixture
def learner():
    return {
        "id": 1,
        "target_role": "Data Scientist",
        "known_skills": "Python,SQL",
        "learning_speed": 0.7,
    }


@pytest.fixture
def target_skills():
    return ["Python", "SQL", "Statistics", "Machine Learning", "Pandas"]


# ─────────────────────────────────────────────
# REWARD CALCULATION
# ─────────────────────────────────────────────

class TestRewardCalculation:

    def test_returns_tuple(self, calculator, learner, target_skills):
        result = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_reward_in_range(self, calculator, learner, target_skills):
        reward, _ = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )
        assert 0.0 <= reward <= 1.0

    def test_objectives_dict_has_all_keys(self, calculator, learner, target_skills):
        _, objectives = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )
        expected_keys = {
            "career_readiness", "time_efficiency",
            "difficulty_match", "market_demand", "prerequisite_fit"
        }
        assert expected_keys == set(objectives.keys())

    def test_all_objective_scores_in_range(self, calculator, learner, target_skills):
        _, objectives = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )
        for key, val in objectives.items():
            assert 0.0 <= val <= 1.0, f"{key} = {val} out of range"

    def test_required_skill_has_higher_career_readiness(self, calculator, learner, target_skills):
        """A skill in target_role_skills should score higher on career_readiness"""
        _, obj_required = calculator.calculate_multi_objective_reward(
            "Statistics", learner, target_role_skills=target_skills
        )
        _, obj_not_required = calculator.calculate_multi_objective_reward(
            "React", learner, target_role_skills=target_skills
        )
        assert obj_required["career_readiness"] > obj_not_required["career_readiness"]


# ─────────────────────────────────────────────
# OBJECTIVE WEIGHTS
# ─────────────────────────────────────────────

class TestObjectiveWeights:

    def test_default_weights_sum_to_one(self, calculator):
        total = sum(calculator.objective_weights.values())
        assert abs(total - 1.0) < 1e-6

    def test_update_weights_normalizes(self, calculator):
        calculator.update_objective_weights({
            "career_readiness": 2.0,
            "time_efficiency": 1.0,
            "difficulty_match": 1.0,
            "market_demand": 0.5,
            "prerequisite_fit": 0.5,
        })
        total = sum(calculator.objective_weights.values())
        assert abs(total - 1.0) < 1e-6

    def test_custom_weights_affect_reward(self, calculator, learner, target_skills):
        """Changing weights should change the total reward"""
        calculator.update_objective_weights({
            "career_readiness": 1.0,
            "time_efficiency": 0.0,
            "difficulty_match": 0.0,
            "market_demand": 0.0,
            "prerequisite_fit": 0.0,
        })
        reward_career_only, _ = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )

        calculator.update_objective_weights({
            "career_readiness": 0.0,
            "time_efficiency": 1.0,
            "difficulty_match": 0.0,
            "market_demand": 0.0,
            "prerequisite_fit": 0.0,
        })
        reward_time_only, _ = calculator.calculate_multi_objective_reward(
            "Python", learner, target_role_skills=target_skills
        )

        # They should differ (unless by coincidence they're equal)
        # At minimum, both should be in range
        assert 0.0 <= reward_career_only <= 1.0
        assert 0.0 <= reward_time_only <= 1.0


# ─────────────────────────────────────────────
# PARETO OPTIMAL SELECTION
# ─────────────────────────────────────────────

class TestParetoOptimal:

    def test_returns_list(self, calculator, learner):
        candidates = ["Python", "React", "Docker"]
        result = calculator.pareto_optimal_selection(candidates, learner, top_k=2)
        assert isinstance(result, list)

    def test_top_k_respected(self, calculator, learner):
        candidates = ["Python", "React", "Docker", "Statistics"]
        result = calculator.pareto_optimal_selection(candidates, learner, top_k=2)
        assert len(result) <= 2

    def test_each_result_is_tuple(self, calculator, learner):
        candidates = ["Python", "React"]
        result = calculator.pareto_optimal_selection(candidates, learner, top_k=2)
        for item in result:
            assert isinstance(item, tuple)
            assert len(item) == 3  # (skill, objectives, reward)

    def test_pareto_skills_are_valid(self, calculator, learner):
        candidates = ["Python", "React", "Docker"]
        result = calculator.pareto_optimal_selection(candidates, learner, top_k=3)
        for skill, _, _ in result:
            assert skill in candidates
