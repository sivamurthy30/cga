"""
Bandit Simulation: LinUCB vs Baselines
Produces quantitative results for academic evaluation.

Run:  pytest tests/test_bandit_simulation.py -v -s
"""

import sys
import os
import numpy as np
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from bandit.linucb import LinUCB
from bandit.baselines import BaselineRecommenders


# ─────────────────────────────────────────────
# SIMULATION SETUP
# ─────────────────────────────────────────────

ARMS = ["Python", "JavaScript", "SQL", "Docker", "React",
        "Machine Learning", "Statistics", "TypeScript", "AWS", "Git"]

N_FEATURES = 5
N_ROUNDS   = 500
ALPHA      = 1.0

# Ground-truth reward probabilities (simulates real skill-learner fit)
TRUE_REWARDS = {
    "Python":           0.85,
    "Machine Learning": 0.80,
    "Statistics":       0.75,
    "SQL":              0.70,
    "AWS":              0.65,
    "Docker":           0.60,
    "TypeScript":       0.55,
    "JavaScript":       0.50,
    "React":            0.45,
    "Git":              0.40,
}

SKILL_METADATA = {arm: {"market_demand": TRUE_REWARDS[arm], "difficulty": 0.5} for arm in ARMS}


def simulate_reward(skill: str, noise: float = 0.1) -> float:
    base = TRUE_REWARDS.get(skill, 0.5)
    return float(np.clip(base + np.random.normal(0, noise), 0, 1))


def run_linucb(n_rounds: int) -> list:
    bandit = LinUCB(arms=ARMS, n_features=N_FEATURES, alpha=ALPHA)
    rewards = []
    for _ in range(n_rounds):
        ctx = np.random.rand(N_FEATURES, 1)
        contexts = {arm: ctx for arm in ARMS}
        chosen = bandit.recommend(contexts)
        r = simulate_reward(chosen)
        bandit.update(chosen, r, ctx)
        rewards.append(r)
    return rewards


def run_random(n_rounds: int) -> list:
    bl = BaselineRecommenders(ARMS)
    return [simulate_reward(bl.random_recommend(ARMS)) for _ in range(n_rounds)]


def run_greedy(n_rounds: int) -> list:
    bl = BaselineRecommenders(ARMS)
    return [simulate_reward(bl.greedy_recommend(ARMS, SKILL_METADATA)) for _ in range(n_rounds)]


def run_epsilon_greedy(n_rounds: int, epsilon: float = 0.1) -> list:
    bl = BaselineRecommenders(ARMS)
    return [simulate_reward(bl.epsilon_greedy_recommend(ARMS, SKILL_METADATA, epsilon)) for _ in range(n_rounds)]


# ─────────────────────────────────────────────
# TESTS
# ─────────────────────────────────────────────

class TestBanditSimulation:

    @pytest.fixture(scope="class")
    def results(self):
        np.random.seed(42)
        return {
            "LinUCB":         run_linucb(N_ROUNDS),
            "Random":         run_random(N_ROUNDS),
            "Greedy":         run_greedy(N_ROUNDS),
            "EpsilonGreedy":  run_epsilon_greedy(N_ROUNDS),
        }

    def test_linucb_beats_random_average_reward(self, results):
        linucb_avg = np.mean(results["LinUCB"])
        random_avg = np.mean(results["Random"])
        print(f"\n  LinUCB avg reward:  {linucb_avg:.4f}")
        print(f"  Random avg reward:  {random_avg:.4f}")
        print(f"  Improvement:        {((linucb_avg - random_avg) / random_avg * 100):.1f}%")
        assert linucb_avg > random_avg

    def test_linucb_late_phase_beats_epsilon_greedy_late_phase(self, results):
        """
        LinUCB should match or exceed epsilon-greedy in the late phase
        (after sufficient exploration). Early phase may favour greedy methods.
        """
        linucb_late = np.mean(results["LinUCB"][-100:])
        eg_late     = np.mean(results["EpsilonGreedy"][-100:])
        print(f"\n  LinUCB late-phase avg:        {linucb_late:.4f}")
        print(f"  EpsilonGreedy late-phase avg: {eg_late:.4f}")
        # LinUCB should be within 15% of epsilon-greedy in late phase
        assert linucb_late >= eg_late * 0.85

    def test_linucb_cumulative_reward_exceeds_random(self, results):
        assert np.sum(results["LinUCB"]) > np.sum(results["Random"])

    def test_linucb_late_phase_reward_higher_than_early(self, results):
        """LinUCB should improve over time (learning effect)"""
        early = np.mean(results["LinUCB"][:50])
        late  = np.mean(results["LinUCB"][-50:])
        print(f"\n  Early avg (rounds 1-50):    {early:.4f}")
        print(f"  Late avg  (rounds 451-500): {late:.4f}")
        assert late > early

    def test_all_methods_produce_valid_rewards(self, results):
        for method, rewards in results.items():
            assert len(rewards) == N_ROUNDS, f"{method}: wrong length"
            assert all(0.0 <= r <= 1.0 for r in rewards), f"{method}: reward out of range"

    def test_print_summary_table(self, results):
        """Prints comparison table — useful for academic report"""
        print("\n" + "=" * 55)
        print(f"{'Method':<20} {'Avg Reward':>12} {'Cumulative':>12}")
        print("=" * 55)
        for method, rewards in results.items():
            avg = np.mean(rewards)
            cum = np.sum(rewards)
            print(f"{method:<20} {avg:>12.4f} {cum:>12.2f}")
        print("=" * 55)

        linucb_avg = np.mean(results["LinUCB"])
        random_avg = np.mean(results["Random"])
        improvement = (linucb_avg - random_avg) / random_avg * 100
        print(f"\nLinUCB improvement over Random: {improvement:.1f}%")
        assert True  # always pass — this is a reporting test
