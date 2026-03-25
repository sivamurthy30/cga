import pandas as pd
import numpy as np
from typing import Dict, Optional
import os

# -------------------------------------------------- #
# 📊 LOAD SKILL METADATA
# -------------------------------------------------- #
# Get absolute path to data directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
DATA_PATH = os.path.join(PROJECT_ROOT, "data", "skill_metadata.csv")

skills_df = pd.read_csv(DATA_PATH)


# -------------------------------------------------- #
# ✅ SAFE METADATA FETCH FUNCTION
# -------------------------------------------------- #
def get_skill_metadata(skill: str) -> Dict:
    """
    Safely fetch skill metadata
    Prevents IndexError when skill not found
    """

    row = skills_df[
        skills_df["skill"].str.lower() == str(skill).lower()
    ]

    if row.empty:
        # Default fallback metadata
        return {
            "difficulty": 0.5,
            "learning_time": 100,
            "market_demand": 0.5
        }

    meta = row.iloc[0]

    return {
        "difficulty": float(meta.get("difficulty", 0.5)),
        "learning_time": float(meta.get("learning_time", 100)),
        "market_demand": float(meta.get("market_demand", 0.5))
    }


# -------------------------------------------------- #
# 🧠 CONTEXT CREATION
# -------------------------------------------------- #
def create_context(
    skill: str,
    learner: Dict,
    resume_data: Optional[Dict] = None,
    github_data: Optional[Dict] = None
) -> np.ndarray:
    """
    Create context vector for LinUCB / Neural Bandit
    """

    # -------------------------------------------------- #
    # BASE METADATA FEATURES
    # -------------------------------------------------- #
    meta = get_skill_metadata(skill)

    difficulty = meta["difficulty"]
    learning_time = meta["learning_time"] / 150  # Normalize
    learning_speed = learner.get("learning_speed", 0.5)

    features = [difficulty, learning_time, learning_speed]

    # -------------------------------------------------- #
    # RESUME FEATURES (4)
    # -------------------------------------------------- #
    if resume_data:

        # Skill present
        skill_in_resume = 1.0 if skill in resume_data.get("skills", []) else 0.0
        features.append(skill_in_resume)

        # Related skill overlap
        resume_skills = set(
            [s.lower() for s in resume_data.get("skills", [])]
        )
        related_skills = get_related_skills(skill)

        overlap = len(resume_skills.intersection(related_skills))
        related_score = overlap / max(len(related_skills), 1)
        features.append(related_score)

        # Experience
        exp_years = resume_data.get("experience_years", 0)
        exp_normalized = min(exp_years / 10, 1.0)
        features.append(exp_normalized)

        # Education
        education = resume_data.get("education", [])
        edu_score = 0.0

        if any("phd" in e.lower() for e in education):
            edu_score = 1.0
        elif any("master" in e.lower() for e in education):
            edu_score = 0.7
        elif any("bachelor" in e.lower() for e in education):
            edu_score = 0.4

        features.append(edu_score)

    else:
        features.extend([0.0, 0.0, 0.0, 0.0])

    # -------------------------------------------------- #
    # GITHUB FEATURES (3)
    # -------------------------------------------------- #
    if github_data:

        activity_score = github_data.get("activity_score", 0.0)
        features.append(activity_score)

        languages = github_data.get("languages", {})
        lang_proficiency = 0.0

        skill_lang_map = {
            "Python": "Python",
            "JavaScript": "JavaScript",
            "Java": "Java",
            "Machine Learning": "Python",
            "Deep Learning": "Python",
            "Web Development": "JavaScript",
        }

        primary_lang = skill_lang_map.get(skill)

        if primary_lang and primary_lang in languages:
            lang_proficiency = languages[primary_lang] / 100

        features.append(lang_proficiency)

        contrib_years = github_data.get("contribution_years", 0)
        contrib_normalized = min(contrib_years / 10, 1.0)
        features.append(contrib_normalized)

    else:
        features.extend([0.0, 0.0, 0.0])

    # -------------------------------------------------- #
    # FINAL CONTEXT VECTOR
    # -------------------------------------------------- #
    context = np.array(features, dtype=float)

    return context.reshape(-1, 1)


# -------------------------------------------------- #
# 🔗 RELATED SKILLS
# -------------------------------------------------- #
def get_related_skills(skill: str) -> set:

    skill_relationships = {
        "Python": {"programming", "coding", "software"},
        "Machine Learning": {"python", "statistics", "math", "data science"},
        "Deep Learning": {"machine learning", "python", "tensorflow", "pytorch"},
        "SQL": {"database", "data", "postgresql", "mysql"},
        "Statistics": {"math", "data analysis", "r"},
        "Data Structures": {"algorithms", "programming", "coding"},
        "JavaScript": {"web development", "html", "css", "react"},
        "Web Development": {"javascript", "html", "css", "frontend"},
    }

    related = skill_relationships.get(skill, set())
    return {s.lower() for s in related}


# -------------------------------------------------- #
# 👤 ENHANCED LEARNER PROFILE
# -------------------------------------------------- #
def create_enhanced_learner_profile(
    base_profile: Dict,
    resume_data: Optional[Dict] = None,
    github_data: Optional[Dict] = None
) -> Dict:

    enhanced = base_profile.copy()

    all_skills = set(
        [s.strip() for s in enhanced.get("known_skills", "").split(",") if s]
    )

    if resume_data:
        all_skills.update(resume_data.get("skills", []))

        resume_speed = resume_data.get("learning_speed")
        if resume_speed:
            enhanced["learning_speed"] = max(
                enhanced.get("learning_speed", 0.5),
                resume_speed
            )

    if github_data:
        all_skills.update(github_data.get("skills", []))

        github_speed = github_data.get("learning_speed")
        if github_speed:
            enhanced["learning_speed"] = max(
                enhanced.get("learning_speed", 0.5),
                github_speed
            )

    enhanced["known_skills"] = ",".join(sorted(all_skills))

    enhanced["data_sources"] = []
    if resume_data:
        enhanced["data_sources"].append("resume")
    if github_data:
        enhanced["data_sources"].append("github")

    return enhanced


# -------------------------------------------------- #
# 🎯 SKILL MATCH SCORE
# -------------------------------------------------- #
def calculate_skill_match_score(
    skill: str,
    learner: Dict,
    resume_data: Optional[Dict] = None,
    github_data: Optional[Dict] = None
) -> float:

    score = 0.0

    meta = get_skill_metadata(skill)

    difficulty = meta["difficulty"]
    learning_speed = learner.get("learning_speed", 0.5)

    base_match = 1.0 - abs(difficulty - (1.0 - learning_speed))
    score += base_match * 0.3

    if resume_data:
        resume_skills = set(
            [s.lower() for s in resume_data.get("skills", [])]
        )
        related = get_related_skills(skill)

        if resume_skills.intersection(related):
            score += 0.25

        exp_years = resume_data.get("experience_years", 0)

        if difficulty < 0.5 and exp_years < 2:
            score += 0.15
        elif difficulty > 0.7 and exp_years > 3:
            score += 0.15

    if github_data:
        github_langs = set(
            [l.lower() for l in github_data.get("languages", {}).keys()]
        )
        skill_langs = get_skill_languages(skill)

        if github_langs.intersection(skill_langs):
            score += 0.3

    return min(score, 1.0)


# -------------------------------------------------- #
# 💻 SKILL → LANGUAGE MAP
# -------------------------------------------------- #
def get_skill_languages(skill: str) -> set:

    skill_lang_map = {
        "Python": {"python"},
        "Machine Learning": {"python", "r"},
        "Deep Learning": {"python"},
        "JavaScript": {"javascript", "typescript"},
        "Web Development": {"javascript", "html", "css"},
        "Java": {"java"},
        "SQL": {"sql"},
    }

    return skill_lang_map.get(skill, set())


# -------------------------------------------------- #
# 🧪 TEST
# -------------------------------------------------- #
if __name__ == "__main__":

    learner = {
        "id": 1,
        "learning_speed": 0.8,
        "known_skills": "Python,SQL"
    }

    resume_data = {
        "skills": ["Python", "SQL", "Statistics"],
        "experience_years": 3.5,
        "education": ["BS Computer Science"]
    }

    github_data = {
        "skills": ["Python", "Machine Learning"],
        "languages": {"Python": 75, "JavaScript": 25},
        "activity_score": 0.7,
        "contribution_years": 2.5
    }

    context = create_context(
        "Machine Learning",
        learner,
        resume_data,
        github_data
    )

    print("Context shape:", context.shape)
    print("Context values:", context.flatten())
