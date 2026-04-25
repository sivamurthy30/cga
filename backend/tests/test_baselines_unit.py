"""
Unit Tests: Baseline Recommenders
Validates all 5 baseline methods used in comparison study
"""

import sys
import os
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from bandit.baselines import BaselineRecommenders


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture
def all_skills():
    return ["Python", "JavaScript", "SQL", "Docker", "React", "Machine Learning"]


@pytest.fixture
def baselines(all_skills):
    return BaselineRecommenders(all_skills)


@pytest.fixture
def skill_metadata():
    return {
        "Python":           {"market_demand": 0.9, "difficulty": 0.3},
        "JavaScript":       {"market_demand": 0.85, "difficulty": 0.35},
        "SQL":              {"market_demand": 0.8, "difficulty": 0.4},
        "Docker":           {"market_demand": 0.75, "difficulty": 0.5},
        "React":            {"market_demand": 0.7, "difficulty": 0.5},
        "Machine Learning": {"market_demand": 0.95, "difficulty": 0.8},
    }


@pytest.fixture
def learner():
    return {
        "id": 1,
        "target_role": "Data Scientist",
        "known_skills": "Python,SQL",
        "learning_speed": 0.5,
    }


@pytest.fixture
def all_learners(learner):
    return [
        learner,
        {"id": 2, "target_role": "Data Scientist", "known_skills": "Python,Machine Learning", "learning_speed": 0.7},
        {"id": 3, "target_role": "Frontend Developer", "known_skills": "JavaScript,React", "learning_speed": 0.6},
    ]


# ─────────────────────────────────────────────
# RANDOM RECOMMENDER
# ─────────────────────────────────────────────

class TestRandomRecommender:

    def test_returns_skill_from_gap(self, baselines, all_skills):
        gap = ["Docker", "React"]
        result = baselines.random_recommend(gap)
        assert result in gap

    def test_empty_gap_returns_any_skill(self, baselines, all_skills):
        result = baselines.random_recommend([])
        assert result in all_skills

    def test_returns_string(self, baselines):
        result = baselines.random_recommend(["Python"])
        assert isinstance(result, str)


# ─────────────────────────────────────────────
# GREEDY RECOMMENDER
# ─────────────────────────────────────────────

class TestGreedyRecommender:

    def test_returns_highest_demand_skill(self, baselines, skill_metadata):
        gap = ["Python", "Docker", "Machine Learning"]
        result = baselines.greedy_recommend(gap, skill_metadata)
        # Machine Learning has highest market_demand (0.95)
        assert result == "Machine Learning"

    def test_empty_gap_returns_any_skill(self, baselines, all_skills, skill_metadata):
        result = baselines.greedy_recommend([], skill_metadata)
        assert result in all_skills

    def test_single_skill_gap(self, baselines, skill_metadata):
        result = baselines.greedy_recommend(["SQL"], skill_metadata)
        assert result == "SQL"

    def test_missing_metadata_uses_default(self, baselines):
        result = baselines.greedy_recommend(["UnknownSkill"], {})
        assert result == "UnknownSkill"


# ─────────────────────────────────────────────
# RULE-BASED RECOMMENDER
# ─────────────────────────────────────────────

class TestRuleBasedRecommender:

    def test_returns_skill_from_gap(self, baselines, learner, skill_metadata):
        gap = ["Docker", "React", "Machine Learning"]
        result = baselines.rule_based_recommend(learner, gap, skill_metadata, {})
        assert result in gap

    def test_matches_difficulty_to_learning_speed(self, baselines, skill_metadata):
        """Learner with speed=0.3 should prefer easier skills"""
        slow_learner = {"learning_speed": 0.3}
        gap = ["Python", "Machine Learning"]  # Python difficulty=0.3, ML=0.8
        result = baselines.rule_based_recommend(slow_learner, gap, skill_metadata, {})
        assert result == "Python"

    def test_empty_gap_returns_any_skill(self, baselines, all_skills, learner, skill_metadata):
        result = baselines.rule_based_recommend(learner, [], skill_metadata, {})
        assert result in all_skills


# ─────────────────────────────────────────────
# EPSILON-GREEDY RECOMMENDER
# ─────────────────────────────────────────────

class TestEpsilonGreedyRecommender:

    def test_returns_skill_from_gap(self, baselines, skill_metadata):
        gap = ["Python", "Docker"]
        result = baselines.epsilon_greedy_recommend(gap, skill_metadata, epsilon=0.0)
        assert result in gap

    def test_zero_epsilon_is_pure_greedy(self, baselines, skill_metadata):
        """epsilon=0 → always greedy → highest demand"""
        gap = ["Python", "Machine Learning"]
        result = baselines.epsilon_greedy_recommend(gap, skill_metadata, epsilon=0.0)
        assert result == "Machine Learning"

    def test_high_epsilon_still_returns_valid_skill(self, baselines, skill_metadata, all_skills):
        gap = ["Python", "Docker"]
        result = baselines.epsilon_greedy_recommend(gap, skill_metadata, epsilon=1.0)
        assert result in gap

    def test_empty_gap_returns_any_skill(self, baselines, all_skills, skill_metadata):
        result = baselines.epsilon_greedy_recommend([], skill_metadata)
        assert result in all_skills


# ─────────────────────────────────────────────
# COLLABORATIVE FILTERING RECOMMENDER
# ─────────────────────────────────────────────

class TestCollaborativeRecommender:

    def test_returns_skill_from_gap(self, baselines, learner, all_learners):
        gap = ["Machine Learning", "Docker"]
        result = baselines.collaborative_filtering_recommend(
            learner, gap, all_learners, {}
        )
        assert result in gap

    def test_prefers_skill_known_by_similar_users(self, baselines, learner, all_learners):
        """Machine Learning is known by similar Data Scientist users"""
        gap = ["Machine Learning", "Docker"]
        result = baselines.collaborative_filtering_recommend(
            learner, gap, all_learners, {}
        )
        # Similar users (Data Scientists) know Machine Learning
        assert result == "Machine Learning"

    def test_empty_gap_returns_any_skill(self, baselines, learner, all_learners, all_skills):
        result = baselines.collaborative_filtering_recommend(
            learner, [], all_learners, {}
        )
        assert result in all_skills
