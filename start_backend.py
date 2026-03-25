#!/usr/bin/env python3
"""
DEVA Backend with LinUCB Integration
Starts Flask server with all routes including LinUCB recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

app = Flask(__name__)
CORS(app)

# Import LinUCB service
from backend.app.services.linucb_service import get_linucb_recommender


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "healthy",
            "features": {"linucb": "enabled", "reinforcement_learning": "active"},
        }
    )


@app.route("/api/linucb/recommend", methods=["POST"])
def linucb_recommend():
    """Get LinUCB skill recommendations"""
    try:
        data = request.json
        top_k = request.args.get("top_k", 5, type=int)
        exclude_known = request.args.get("exclude_known", "true").lower() == "true"

        recommender = get_linucb_recommender()
        recommendations = recommender.recommend_skills(
            learner_profile=data, top_k=top_k, exclude_known=exclude_known
        )

        known_skills = [
            s.strip() for s in data.get("known_skills", "").split(",") if s.strip()
        ]
        total_candidates = (
            len(recommender.all_skills) - len(known_skills)
            if exclude_known
            else len(recommender.all_skills)
        )

        return jsonify(
            {
                "recommendations": recommendations,
                "total_candidates": total_candidates,
                "algorithm": "LinUCB",
                "exploration_parameter": recommender.alpha,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/linucb/feedback", methods=["POST"])
def linucb_feedback():
    """Submit user feedback"""
    try:
        data = request.json
        recommender = get_linucb_recommender()

        reward = recommender.calculate_reward_from_interaction(
            interaction_type=data["interaction_type"],
            time_spent=data.get("time_spent"),
            completed=data.get("completed", False),
        )

        recommender.update_with_feedback(
            learner_profile=data["learner_profile"], skill=data["skill"], reward=reward
        )

        # Save model periodically
        if len(recommender.interaction_history) % 10 == 0:
            try:
                model_path = os.path.join(
                    os.path.dirname(__file__), "data", "linucb_model.json"
                )
                recommender.save_model(model_path)
            except Exception as e:
                print(f"⚠️ Could not save model: {e}")

        return jsonify(
            {
                "success": True,
                "reward": reward,
                "message": f"Feedback recorded. Reward: {reward:.2f}",
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/linucb/statistics", methods=["GET"])
def linucb_statistics():
    """Get recommendation statistics"""
    try:
        recommender = get_linucb_recommender()
        stats = recommender.get_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/linucb/skills", methods=["GET"])
def linucb_skills():
    """Get all skills"""
    try:
        recommender = get_linucb_recommender()
        return jsonify(
            {
                "skills": recommender.all_skills,
                "total": len(recommender.all_skills),
                "categories": recommender.skills_df["category"].unique().tolist(),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/linucb/roles", methods=["GET"])
def linucb_roles():
    """Get all roles"""
    try:
        recommender = get_linucb_recommender()
        return jsonify(
            {
                "roles": recommender.role_skills_map,
                "total": len(recommender.role_skills_map),
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/linucb/explain", methods=["POST"])
def linucb_explain():
    """Explain recommendation"""
    try:
        data = request.json
        skill = request.args.get("skill")

        if not skill:
            return jsonify({"error": "skill parameter required"}), 400

        recommender = get_linucb_recommender()
        target_role = data.get("target_role", "Full Stack Developer")
        target_role_skills = recommender.role_skills_map.get(target_role, [])

        reward, objectives = (
            recommender.reward_calculator.calculate_multi_objective_reward(
                skill=skill, learner=data, target_role_skills=target_role_skills
            )
        )

        skill_info = recommender.skills_df[recommender.skills_df["skill"] == skill]
        if skill_info.empty:
            return jsonify({"error": f'Skill "{skill}" not found'}), 404

        skill_data = skill_info.iloc[0]

        return jsonify(
            {
                "skill": skill,
                "total_reward": float(reward),
                "objectives": {
                    "career_readiness": {
                        "score": float(objectives["career_readiness"]),
                        "weight": 0.40,
                        "description": "How much this skill helps reach career goal",
                    },
                    "time_efficiency": {
                        "score": float(objectives["time_efficiency"]),
                        "weight": 0.20,
                        "description": "How quickly this skill can be learned",
                    },
                    "difficulty_match": {
                        "score": float(objectives["difficulty_match"]),
                        "weight": 0.20,
                        "description": "How well difficulty matches learner ability",
                    },
                    "market_demand": {
                        "score": float(objectives["market_demand"]),
                        "weight": 0.15,
                        "description": "Job market demand for this skill",
                    },
                    "prerequisite_fit": {
                        "score": float(objectives["prerequisite_fit"]),
                        "weight": 0.05,
                        "description": "Whether learner has prerequisites",
                    },
                },
                "metadata": {
                    "difficulty": float(skill_data["difficulty"]),
                    "learning_time": int(skill_data["learning_time"]),
                    "category": skill_data["category"],
                    "is_required_for_role": skill in target_role_skills,
                },
                "explanation": f"This skill is recommended because it has a {reward:.1%} overall fit score. "
                f"It's {'required' if skill in target_role_skills else 'beneficial'} for {target_role}.",
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/resume/upload", methods=["POST"])
def upload_resume():
    """Upload and parse resume"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Read file content
        content = file.read()

        # Simple resume parsing - extract text
        try:
            text = content.decode("utf-8")
        except Exception:
            # Try other encodings
            text = content.decode("latin-1")

        # Extract skills (simple keyword matching)
        skills_keywords = {
            "python": ["python", "py"],
            "javascript": ["javascript", "js", "node.js", "nodejs"],
            "react": ["react", "reactjs"],
            "java": ["java"],
            "sql": ["sql", "mysql", "postgresql", "oracle"],
            "docker": ["docker", "kubernetes", "k8s"],
            "aws": ["aws", "amazon web services", "ec2", "s3"],
            "git": ["git", "github", "gitlab", "bitbucket"],
            "html": ["html", "css", "html5", "css3"],
            "typescript": ["typescript", "ts"],
            "nodejs": ["node.js", "nodejs", "node"],
            "fastapi": ["fastapi", "fast api"],
            "flask": ["flask"],
            "django": ["django"],
        }

        text_lower = text.lower()
        found_skills = []

        for skill, keywords in skills_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_skills.append(skill)
                    break

        # Remove duplicates
        found_skills = list(set(found_skills))

        return jsonify(
            {
                "success": True,
                "skills": found_skills,
                "message": f"Found {len(found_skills)} skills in resume",
            }
        )

    except Exception as e:
        return jsonify({"error": f"Resume parsing failed: {str(e)}"}), 500


@app.route("/api/linucb/health", methods=["GET"])
def linucb_health():
    """LinUCB health check"""
    try:
        recommender = get_linucb_recommender()
        stats = recommender.get_statistics()
        return jsonify(
            {
                "status": "healthy",
                "algorithm": "LinUCB",
                "total_skills": len(recommender.all_skills),
                "total_roles": len(recommender.role_skills_map),
                "total_interactions": stats["total_interactions"],
                "average_reward": stats["average_reward"],
            }
        )
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Starting DEVA Backend with LinUCB Integration")
    print("=" * 70)
    print("\n✅ LinUCB Reinforcement Learning: ENABLED")
    print("✅ Multi-Objective Rewards: ACTIVE")
    print("✅ Skill Recommendations: READY")
    print("\n📡 Server running on: http://localhost:5001")
    print("📊 LinUCB Health: http://localhost:5001/api/linucb/health")
    print("\n" + "=" * 70)

    app.run(host="0.0.0.0", port=5001, debug=True)
