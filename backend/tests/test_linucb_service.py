"""
Unit Tests: LinUCBSkillRecommender Service
Tests the full recommendation pipeline including composite reward
"""

import sys
import os
import pytest
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.linucb_service import LinUCBSkillRecommender


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture(scope="module")
def recommender():
    return LinUCBSkillRecommender(alpha=1.0)


@pytest.fixture
def profile():
    return {
        "id": "test_user_1",
        "target_role": "Full Stack Developer",
        "known_skills": "HTML,CSS",
        "num_projects": 2,
        "experience_years": 1,
        "has_github": True,
        "has_portfolio": False,
        "has_certifications": False,
        "has_quantifiable_metrics": False,
        "learning_speed": 0.6,
        "github_velocity": 5,
    }


# ─────────────────────────────────────────────
# CONTEXT VECTOR
# ─────────────────────────────────────────────

class TestContextVector:

    def test_shape_is_11x1(self, recommender, profile):
        ctx = recommender.create_context_vector(profile)
        assert ctx.shape == (11, 1)

    def test_values_are_numeric(self, recommender, profile):
        ctx = recommender.create_context_vector(profile)
        assert not np.any(np.isnan(ctx))
        assert not np.any(np.isinf(ctx))

    def test_github_velocity_capped(self, recommender, profile):
        high_velocity_profile = {**profile, "github_velocity": 1000}
        ctx = recommender.create_context_vector(high_velocity_profile)
        # dim 10 = github_velocity, capped at 1.0
        assert ctx[10][0] <= 1.0

    def test_experience_capped_at_10(self, recommender, profile):
        senior_profile = {**profile, "experience_years": 50}
        ctx = recommender.create_context_vector(senior_profile)
        # dim 4 = experience_years, capped at 10
        assert ctx[4][0] == 10.0

    def test_known_skills_capped_at_20(self, recommender, profile):
        many_skills = ",".join([f"Skill{i}" for i in range(50)])
        profile_many = {**profile, "known_skills": many_skills}
        ctx = recommender.create_context_vector(profile_many)
        # dim 1 = num_known_skills, capped at 20
        assert ctx[1][0] == 20.0


# ─────────────────────────────────────────────
# COMPOSITE REWARD
# ─────────────────────────────────────────────

class TestCompositeReward:

    def test_completed_gives_high_reward(self, recommender):
        reward = recommender.compute_composite_reward(
            interaction_type="completed",
            time_spent=60,
            ideal_time=60,
            pre_score=40.0,
            post_score=80.0,
        )
        assert reward > 0.7

    def test_skipped_gives_low_reward(self, recommender):
        reward = recommender.compute_composite_reward(interaction_type="skipped")
        assert reward < 0.2

    def test_reward_in_range(self, recommender):
        for interaction in ["clicked", "started", "progress", "completed", "skipped"]:
            reward = recommender.compute_composite_reward(interaction_type=interaction)
            assert 0.0 <= reward <= 1.0, f"Reward out of range for {interaction}: {reward}"

    def test_assessment_improvement_increases_reward(self, recommender):
        reward_no_improvement = recommender.compute_composite_reward(
            interaction_type="completed",
            pre_score=50.0,
            post_score=50.0,
        )
        reward_with_improvement = recommender.compute_composite_reward(
            interaction_type="completed",
            pre_score=50.0,
            post_score=90.0,
        )
        assert reward_with_improvement > reward_no_improvement

    def test_time_efficiency_affects_reward(self, recommender):
        """Completing faster than ideal → higher efficiency component"""
        reward_fast = recommender.compute_composite_reward(
            interaction_type="completed",
            time_spent=30,
            ideal_time=60,
        )
        reward_slow = recommender.compute_composite_reward(
            interaction_type="completed",
            time_spent=120,
            ideal_time=60,
        )
        assert reward_fast >= reward_slow


# ─────────────────────────────────────────────
# RECOMMEND SKILLS
# ─────────────────────────────────────────────

class TestRecommendSkills:

    def test_returns_list(self, recommender, profile):
        results = recommender.recommend_skills(profile, top_k=3)
        assert isinstance(results, list)

    def test_top_k_respected(self, recommender, profile):
        results = recommender.recommend_skills(profile, top_k=3)
        assert len(results) <= 3

    def test_each_result_has_required_keys(self, recommender, profile):
        results = recommender.recommend_skills(profile, top_k=2)
        for r in results:
            assert "skill" in r
            assert "expected_reward" in r
            assert "objectives" in r
            assert "metadata" in r

    def test_excludes_known_skills(self, recommender, profile):
        results = recommender.recommend_skills(profile, top_k=5, exclude_known=True)
        known = [s.strip() for s in profile["known_skills"].split(",")]
        for r in results:
            assert r["skill"] not in known

    def test_reward_in_range(self, recommender, profile):
        results = recommender.recommend_skills(profile, top_k=3)
        for r in results:
            assert 0.0 <= r["expected_reward"] <= 1.0


# ─────────────────────────────────────────────
# UPDATE & STATISTICS
# ─────────────────────────────────────────────

class TestUpdateAndStats:

    def test_update_increases_interaction_count(self, recommender, profile):
        before = len(recommender.interaction_history)
        recommender.update_with_feedback(profile, "Python", 0.8)
        assert len(recommender.interaction_history) == before + 1

    def test_statistics_returns_dict(self, recommender, profile):
        recommender.update_with_feedback(profile, "SQL", 0.6)
        stats = recommender.get_statistics()
        assert isinstance(stats, dict)
        assert "total_interactions" in stats
        assert "average_reward" in stats

    def test_average_reward_is_numeric(self, recommender, profile):
        recommender.update_with_feedback(profile, "Docker", 0.5)
        stats = recommender.get_statistics()
        assert isinstance(stats["average_reward"], float)
        assert 0.0 <= stats["average_reward"] <= 1.0
