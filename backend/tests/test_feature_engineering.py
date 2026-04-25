"""
Unit Tests: Feature Engineering & Context Vector
Validates the 10-dimensional context vector used by LinUCB
"""

import sys
import os
import numpy as np
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from preprocessing.feature_engineering import (
    create_context,
    get_skill_metadata,
    get_related_skills,
    calculate_skill_match_score,
)


# ─────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────

@pytest.fixture
def learner():
    return {"id": 1, "learning_speed": 0.7, "known_skills": "Python,SQL"}


@pytest.fixture
def resume_data():
    return {
        "skills": ["Python", "SQL", "Statistics"],
        "experience_years": 3.0,
        "education": ["BS Computer Science"],
    }


@pytest.fixture
def github_data():
    return {
        "skills": ["Python"],
        "languages": {"Python": 80, "JavaScript": 20},
        "activity_score": 0.75,
        "contribution_years": 2.0,
    }


# ─────────────────────────────────────────────
# CONTEXT VECTOR SHAPE & TYPE
# ─────────────────────────────────────────────

class TestContextVector:

    def test_shape_without_optional_data(self, learner):
        ctx = create_context("Python", learner)
        assert ctx.shape == (10, 1)

    def test_shape_with_resume(self, learner, resume_data):
        ctx = create_context("Python", learner, resume_data=resume_data)
        assert ctx.shape == (10, 1)

    def test_shape_with_github(self, learner, github_data):
        ctx = create_context("Python", learner, github_data=github_data)
        assert ctx.shape == (10, 1)

    def test_shape_with_all_data(self, learner, resume_data, github_data):
        ctx = create_context("Python", learner, resume_data, github_data)
        assert ctx.shape == (10, 1)

    def test_values_are_non_negative(self, learner, resume_data, github_data):
        ctx = create_context("Machine Learning", learner, resume_data, github_data)
        flat = ctx.flatten()
        assert all(v >= 0.0 for v in flat), f"Negative value found: {flat}"

    def test_dtype_is_float(self, learner):
        ctx = create_context("Python", learner)
        assert ctx.dtype == float

    def test_unknown_skill_uses_defaults(self, learner):
        ctx = create_context("NonExistentSkill_XYZ", learner)
        assert ctx.shape == (10, 1)
        # difficulty defaults to 0.5
        assert ctx[0][0] == pytest.approx(0.5, abs=0.01)


# ─────────────────────────────────────────────
# SKILL METADATA
# ─────────────────────────────────────────────

class TestSkillMetadata:

    def test_known_skill_returns_dict(self):
        meta = get_skill_metadata("Python")
        assert isinstance(meta, dict)
        assert "difficulty" in meta
        assert "learning_time" in meta
        assert "market_demand" in meta

    def test_unknown_skill_returns_defaults(self):
        meta = get_skill_metadata("SkillThatDoesNotExist_999")
        assert meta["difficulty"] == 0.5
        assert meta["learning_time"] == 100
        assert meta["market_demand"] == 0.5

    def test_difficulty_in_range(self):
        meta = get_skill_metadata("Python")
        assert 0.0 <= meta["difficulty"] <= 1.0

    def test_learning_time_positive(self):
        meta = get_skill_metadata("Python")
        assert meta["learning_time"] > 0


# ─────────────────────────────────────────────
# RELATED SKILLS
# ─────────────────────────────────────────────

class TestRelatedSkills:

    def test_python_has_related_skills(self):
        related = get_related_skills("Python")
        assert len(related) > 0

    def test_returns_set(self):
        related = get_related_skills("JavaScript")
        assert isinstance(related, set)

    def test_unknown_skill_returns_empty_set(self):
        related = get_related_skills("SkillXYZ_Unknown")
        assert related == set()

    def test_related_skills_are_lowercase(self):
        related = get_related_skills("Python")
        for skill in related:
            assert skill == skill.lower()


# ─────────────────────────────────────────────
# SKILL MATCH SCORE
# ─────────────────────────────────────────────

class TestSkillMatchScore:

    def test_score_in_range(self, learner):
        score = calculate_skill_match_score("Python", learner)
        assert 0.0 <= score <= 1.0

    def test_score_with_resume_higher(self, learner, resume_data):
        score_no_resume = calculate_skill_match_score("Python", learner)
        score_with_resume = calculate_skill_match_score("Python", learner, resume_data=resume_data)
        # Having resume data should generally increase or maintain score
        assert score_with_resume >= score_no_resume - 0.01  # allow tiny float noise

    def test_score_with_github_higher(self, learner, github_data):
        score_no_github = calculate_skill_match_score("Python", learner)
        score_with_github = calculate_skill_match_score("Python", learner, github_data=github_data)
        assert score_with_github >= score_no_github - 0.01

    def test_returns_float(self, learner):
        score = calculate_skill_match_score("SQL", learner)
        assert isinstance(score, float)
