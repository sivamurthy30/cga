import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# ================= PACKAGE IMPORTS =================
from bandit.linucb import LinUCB
from bandit.baselines import BaselineRecommenders
from preprocessing.feature_engineering import create_context
from database.db import get_db
from database.models import get_learners_from_db

print("=" * 60)
print("BASELINE COMPARISON: LinUCB vs Traditional Methods")
print("=" * 60)

# ================= LOAD DATA =================
db = get_db()
learners = get_learners_from_db()

roles = pd.read_csv("data/roles_skills.csv")
skills_df = pd.read_csv("data/skill_metadata.csv")

all_skills = roles.skill.unique().tolist()
skill_metadata = skills_df.set_index("skill").to_dict("index")

# ================= INITIALIZE MODELS =================
linucb = LinUCB(arms=all_skills, n_features=10, alpha=1.0)
baselines_obj = BaselineRecommenders(all_skills)

# ================= TRACKING =================
results = {
    method: {"rewards": [], "cumulative": []}
    for method in [
        "LinUCB",
        "Random",
        "Greedy",
        "Rule-Based",
        "Epsilon-Greedy",
        "Collaborative",
    ]
}

# ================= HELPER FUNCTIONS =================
def get_skill_gap(learner):
    required = roles[roles.role == learner["target_role"]].skill.tolist()
    known = learner["known_skills"].split(",")
    return list(set(required) - set(known))


def calculate_reward(skill, learner):
    skill_data = db.get_skill(skill)

    if not skill_data:
        return 0.3

    difficulty = skill_data["difficulty"]
    learning_speed = learner["learning_speed"]

    match_score = 1.0 - abs(difficulty - (1.0 - learning_speed))
    noise = np.random.normal(0, 0.1)

    return float(np.clip(match_score + noise, 0, 1))


# ================= TRAINING =================
print("\nRunning 50 epochs of comparison...")
NUM_EPOCHS = 50

for epoch in range(NUM_EPOCHS):
    for _, learner_row in learners.iterrows():
        learner = learner_row.to_dict()
        gap = get_skill_gap(learner)

        if not gap:
            continue

        # -------- LINUCB --------
        contexts = {
            skill: create_context(skill, learner)
            for skill in gap
        }

        linucb_skill = linucb.recommend(contexts)
        linucb_reward = calculate_reward(linucb_skill, learner)

        linucb.update(
            linucb_skill,
            linucb_reward,
            contexts[linucb_skill],
        )

        results["LinUCB"]["rewards"].append(linucb_reward)

        # -------- RANDOM --------
        random_skill = baselines_obj.random_recommend(gap)
        results["Random"]["rewards"].append(
            calculate_reward(random_skill, learner)
        )

        # -------- GREEDY --------
        greedy_skill = baselines_obj.greedy_recommend(
            gap, skill_metadata
        )
        results["Greedy"]["rewards"].append(
            calculate_reward(greedy_skill, learner)
        )

        # -------- RULE BASED --------
        rule_skill = baselines_obj.rule_based_recommend(
            learner, gap, skill_metadata, {}
        )
        results["Rule-Based"]["rewards"].append(
            calculate_reward(rule_skill, learner)
        )

        # -------- EPSILON GREEDY --------
        epsilon_skill = baselines_obj.epsilon_greedy_recommend(
            gap, skill_metadata, epsilon=0.1
        )
        results["Epsilon-Greedy"]["rewards"].append(
            calculate_reward(epsilon_skill, learner)
        )

        # -------- COLLABORATIVE --------
        collab_skill = baselines_obj.collaborative_filtering_recommend(
            learner,
            gap,
            learners.to_dict("records"),
            {},
        )
        results["Collaborative"]["rewards"].append(
            calculate_reward(collab_skill, learner)
        )

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}/{NUM_EPOCHS} complete")

# ================= CUMULATIVE =================
for method in results:
    results[method]["cumulative"] = np.cumsum(
        results[method]["rewards"]
    )

# ================= SUMMARY =================
print("\n" + "=" * 60)
print("RESULTS SUMMARY")
print("=" * 60)

for method in results:
    rewards = results[method]["rewards"]

    print(f"\n{method}:")
    print(f"  Average Reward: {np.mean(rewards):.4f}")
    print(f"  Total Reward: {np.sum(rewards):.2f}")
    print(f"  Final Cumulative: {results[method]['cumulative'][-1]:.2f}")

baseline_avg = np.mean(results["Random"]["rewards"])
linucb_avg = np.mean(results["LinUCB"]["rewards"])

improvement = (
    (linucb_avg - baseline_avg) / baseline_avg
) * 100

print("\n" + "=" * 60)
print(f"LinUCB Improvement over Random: {improvement:.2f}%")
print("=" * 60)

# ================= VISUALIZATION =================
plt.figure(figsize=(10, 6))

for method in results:
    plt.plot(
        results[method]["cumulative"],
        label=method,
        linewidth=2,
    )

plt.xlabel("Recommendations")
plt.ylabel("Cumulative Reward")
plt.title("Baseline Comparison")
plt.legend()
plt.grid(True, alpha=0.3)

plt.savefig(
    "baseline_comparison.png",
    dpi=300,
    bbox_inches="tight",
)

print("\n✅ Comparison plot saved as 'baseline_comparison.png'")
plt.show()

# ================= STATISTICAL TEST =================
print("\n" + "=" * 60)
print("STATISTICAL SIGNIFICANCE (t-test vs Random)")
print("=" * 60)

random_rewards = results["Random"]["rewards"]

for method in [
    "LinUCB",
    "Greedy",
    "Rule-Based",
    "Epsilon-Greedy",
    "Collaborative",
]:
    method_rewards = results[method]["rewards"]

    t_stat, p_value = stats.ttest_ind(
        method_rewards,
        random_rewards,
    )

    significant = (
        "✅ SIGNIFICANT"
        if p_value < 0.05
        else "❌ Not significant"
    )

    print(
        f"{method}: p-value = {p_value:.4f} {significant}"
    )

print("\n" + "=" * 60)

