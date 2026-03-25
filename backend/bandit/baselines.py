import random
import numpy as np


class BaselineRecommenders:
    def __init__(self, all_skills):
        self.all_skills = all_skills
        self.skill_scores = {skill: random.random() for skill in all_skills}

    # ================= RANDOM =================
    def random_recommend(self, skill_gap):
        if not skill_gap:
            return random.choice(self.all_skills)
        return random.choice(skill_gap)

    # ================= GREEDY =================
    def greedy_recommend(self, skill_gap, skill_metadata):
        if not skill_gap:
            return random.choice(self.all_skills)

        best_skill = None
        best_score = -1

        for skill in skill_gap:
            score = skill_metadata.get(skill, {}).get("market_demand", 0.5)
            if score > best_score:
                best_score = score
                best_skill = skill

        return best_skill or random.choice(skill_gap)

    # ================= RULE BASED =================
    def rule_based_recommend(
        self, learner, skill_gap, skill_metadata, resume_data
    ):
        if not skill_gap:
            return random.choice(self.all_skills)

        learning_speed = learner.get("learning_speed", 0.5)

        best_skill = None
        best_match = -1

        for skill in skill_gap:
            difficulty = skill_metadata.get(skill, {}).get("difficulty", 0.5)
            match = 1 - abs(difficulty - learning_speed)

            if match > best_match:
                best_match = match
                best_skill = skill

        return best_skill or random.choice(skill_gap)

    # ================= EPSILON GREEDY =================
    def epsilon_greedy_recommend(
        self, skill_gap, skill_metadata, epsilon=0.1
    ):
        if not skill_gap:
            return random.choice(self.all_skills)

        if random.random() < epsilon:
            return random.choice(skill_gap)

        return self.greedy_recommend(skill_gap, skill_metadata)

    # ================= COLLABORATIVE =================
    def collaborative_filtering_recommend(
        self, learner, skill_gap, all_learners, progress_data
    ):
        if not skill_gap:
            return random.choice(self.all_skills)

        similar_learners = []

        for other in all_learners:
            if other["target_role"] == learner["target_role"]:
                similar_learners.append(other)

        skill_counts = {skill: 0 for skill in skill_gap}

        for sim in similar_learners:
            known = sim["known_skills"].split(",")
            for skill in skill_gap:
                if skill in known:
                    skill_counts[skill] += 1

        best_skill = max(skill_counts, key=skill_counts.get)
        return best_skill or random.choice(skill_gap)
