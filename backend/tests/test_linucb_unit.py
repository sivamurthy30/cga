"""
Unit Tests: LinUCB Contextual Bandit
Academic validation of core ML algorithm
"""

import sys
import os
import numpy as np
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from bandit.linucb import LinUCB


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture
def arms():
    return ["Python", "JavaScript", "SQL", "Docker", "React"]


@pytest.fixture
def bandit(arms):
    return LinUCB(arms=arms, n_features=5, alpha=1.0)


@pytest.fixture
def context():
    """Fixed 5-dim context column vector"""
    return np.array([[0.5], [0.3], [0.8], [0.2], [0.6]])


# ─────────────────────────────────────────────
# INITIALISATION TESTS
# ─────────────────────────────────────────────

class TestLinUCBInit:

    def test_arms_stored(self, bandit, arms):
        assert bandit.arms == arms

    def test_A_matrices_identity(self, bandit, arms):
        for arm in arms:
            assert bandit.A[arm].shape == (5, 5)
            np.testing.assert_array_equal(bandit.A[arm], np.identity(5))

    def test_b_vectors_zero(self, bandit, arms):
        for arm in arms:
            assert bandit.b[arm].shape == (5, 1)
            np.testing.assert_array_equal(bandit.b[arm], np.zeros((5, 1)))

    def test_alpha_stored(self, bandit):
        assert bandit.alpha == 1.0


# ─────────────────────────────────────────────
# RECOMMENDATION TESTS
# ─────────────────────────────────────────────

class TestLinUCBRecommend:

    def test_returns_valid_arm(self, bandit, arms, context):
        contexts = {arm: context for arm in arms}
        result = bandit.recommend(contexts)
        assert result in arms

    def test_recommend_single_arm(self, bandit, context):
        """With one arm, must return that arm"""
        single_bandit = LinUCB(arms=["Python"], n_features=5, alpha=1.0)
        result = single_bandit.recommend({"Python": context})
        assert result == "Python"

    def test_recommend_is_deterministic_after_update(self, bandit, arms, context):
        """After strong reward signal, bandit should prefer that arm"""
        # Give Python a very high reward many times
        for _ in range(30):
            bandit.update("Python", 1.0, context)

        # Give all others zero reward
        for arm in arms:
            if arm != "Python":
                for _ in range(30):
                    bandit.update(arm, 0.0, context)

        contexts = {arm: context for arm in arms}
        result = bandit.recommend(contexts)
        assert result == "Python"

    def test_ucb_score_is_scalar(self, bandit, arms, context):
        """UCB score computation should not raise and return a number"""
        arm = arms[0]
        A_inv = np.linalg.inv(bandit.A[arm])
        theta = A_inv @ bandit.b[arm]
        p = theta.T @ context + bandit.alpha * np.sqrt(context.T @ A_inv @ context)
        assert np.isscalar(p[0][0]) or isinstance(p[0][0], (float, np.floating))


# ─────────────────────────────────────────────
# UPDATE TESTS
# ─────────────────────────────────────────────

class TestLinUCBUpdate:

    def test_A_matrix_changes_after_update(self, bandit, context):
        A_before = bandit.A["Python"].copy()
        bandit.update("Python", 1.0, context)
        assert not np.array_equal(bandit.A["Python"], A_before)

    def test_b_vector_changes_after_update(self, bandit, context):
        b_before = bandit.b["Python"].copy()
        bandit.update("Python", 1.0, context)
        assert not np.array_equal(bandit.b["Python"], b_before)

    def test_A_update_formula(self, bandit, context):
        """A_a += x * x^T"""
        A_before = bandit.A["Python"].copy()
        bandit.update("Python", 1.0, context)
        expected = A_before + context @ context.T
        np.testing.assert_array_almost_equal(bandit.A["Python"], expected)

    def test_b_update_formula(self, bandit, context):
        """b_a += reward * x"""
        b_before = bandit.b["Python"].copy()
        reward = 0.75
        bandit.update("Python", reward, context)
        expected = b_before + reward * context
        np.testing.assert_array_almost_equal(bandit.b["Python"], expected)

    def test_update_only_affects_selected_arm(self, bandit, arms, context):
        """Updating one arm must not change others"""
        A_others_before = {arm: bandit.A[arm].copy() for arm in arms if arm != "Python"}
        bandit.update("Python", 1.0, context)
        for arm, A_before in A_others_before.items():
            np.testing.assert_array_equal(bandit.A[arm], A_before)

    def test_zero_reward_update(self, bandit, context):
        """Zero reward: A changes but b stays zero"""
        bandit.update("Python", 0.0, context)
        np.testing.assert_array_equal(bandit.b["Python"], np.zeros((5, 1)))
        # A should still change
        assert not np.array_equal(bandit.A["Python"], np.identity(5))

    def test_multiple_updates_accumulate(self, bandit, context):
        """Multiple updates should accumulate correctly"""
        for _ in range(5):
            bandit.update("SQL", 0.8, context)
        expected_A = np.identity(5) + 5 * (context @ context.T)
        np.testing.assert_array_almost_equal(bandit.A["SQL"], expected_A)


# ─────────────────────────────────────────────
# EXPLORATION-EXPLOITATION TESTS
# ─────────────────────────────────────────────

class TestExplorationExploitation:

    def test_high_alpha_increases_exploration(self, arms, context):
        """Higher alpha → wider UCB bounds → more exploration"""
        bandit_low = LinUCB(arms=arms, n_features=5, alpha=0.01)
        bandit_high = LinUCB(arms=arms, n_features=5, alpha=10.0)

        contexts = {arm: context for arm in arms}

        # With high alpha, UCB scores should be higher
        scores_low = {}
        scores_high = {}

        for arm in arms:
            A_inv = np.linalg.inv(bandit_low.A[arm])
            theta = A_inv @ bandit_low.b[arm]
            scores_low[arm] = (theta.T @ context + 0.01 * np.sqrt(context.T @ A_inv @ context))[0][0]

            A_inv_h = np.linalg.inv(bandit_high.A[arm])
            theta_h = A_inv_h @ bandit_high.b[arm]
            scores_high[arm] = (theta_h.T @ context + 10.0 * np.sqrt(context.T @ A_inv_h @ context))[0][0]

        assert max(scores_high.values()) > max(scores_low.values())

    def test_cumulative_reward_improves_over_time(self, arms, context):
        """Bandit should improve cumulative reward over 100 rounds"""
        bandit = LinUCB(arms=arms, n_features=5, alpha=1.0)

        # True rewards: Python=0.9, others=0.1
        true_rewards = {"Python": 0.9, "JavaScript": 0.1, "SQL": 0.1, "Docker": 0.1, "React": 0.1}

        early_rewards = []
        late_rewards = []

        for i in range(200):
            contexts = {arm: context for arm in arms}
            chosen = bandit.recommend(contexts)
            reward = true_rewards[chosen] + np.random.normal(0, 0.05)
            reward = float(np.clip(reward, 0, 1))
            bandit.update(chosen, reward, context)

            if i < 20:
                early_rewards.append(reward)
            elif i > 150:
                late_rewards.append(reward)

        assert np.mean(late_rewards) > np.mean(early_rewards)
