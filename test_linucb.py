#!/usr/bin/env python3
"""
Test script for LinUCB integration
Verifies that the LinUCB service works correctly
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.app.services.linucb_service import LinUCBSkillRecommender

def test_linucb():
    """Test LinUCB recommender"""
    
    print("=" * 70)
    print("🤖 Testing LinUCB Reinforcement Learning Integration")
    print("=" * 70)
    
    # Initialize recommender
    print("\n1️⃣ Initializing LinUCB recommender...")
    try:
        recommender = LinUCBSkillRecommender(alpha=1.0)
        print(f"   ✅ Loaded {len(recommender.all_skills)} skills")
        print(f"   ✅ Loaded {len(recommender.role_skills_map)} roles")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test learner profile
    print("\n2️⃣ Creating test learner profile...")
    learner_profile = {
        'id': 'test_user_1',
        'target_role': 'Full Stack Developer',
        'known_skills': 'Python, JavaScript, HTML, CSS',
        'num_projects': 3,
        'experience_years': 2,
        'has_github': True,
        'has_portfolio': False,
        'has_certifications': False,
        'has_quantifiable_metrics': True,
        'learning_speed': 0.7
    }
    print(f"   ✅ Profile: {learner_profile['target_role']}")
    print(f"   ✅ Known skills: {learner_profile['known_skills']}")
    print(f"   ✅ Experience: {learner_profile['experience_years']} years")
    
    # Test context vector creation
    print("\n3️⃣ Creating context vector...")
    try:
        context = recommender.create_context_vector(learner_profile)
        print(f"   ✅ Context shape: {context.shape}")
        print(f"   ✅ Context values: {context.flatten()}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test recommendations
    print("\n4️⃣ Getting skill recommendations...")
    try:
        recommendations = recommender.recommend_skills(
            learner_profile=learner_profile,
            top_k=5,
            exclude_known=True
        )
        print(f"   ✅ Got {len(recommendations)} recommendations")
        
        print("\n   📊 Top 5 Recommended Skills:")
        print("   " + "-" * 66)
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec['skill']:<20} | Reward: {rec['expected_reward']:.2f} | "
                  f"Category: {rec['metadata']['category']}")
            print(f"      Career: {rec['objectives']['career_readiness']:.2f} | "
                  f"Time: {rec['objectives']['time_efficiency']:.2f} | "
                  f"Match: {rec['objectives']['difficulty_match']:.2f}")
        print("   " + "-" * 66)
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test feedback
    print("\n5️⃣ Testing feedback mechanism...")
    try:
        test_skill = recommendations[0]['skill']
        reward = recommender.calculate_reward_from_interaction(
            interaction_type='started',
            time_spent=None,
            completed=False
        )
        print(f"   ✅ Calculated reward for 'started': {reward}")
        
        recommender.update_with_feedback(
            learner_profile=learner_profile,
            skill=test_skill,
            reward=reward
        )
        print(f"   ✅ Updated model with feedback for '{test_skill}'")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test statistics
    print("\n6️⃣ Getting statistics...")
    try:
        stats = recommender.get_statistics()
        print(f"   ✅ Total interactions: {stats['total_interactions']}")
        print(f"   ✅ Average reward: {stats['average_reward']:.2f}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test multi-objective reward
    print("\n7️⃣ Testing multi-objective reward calculation...")
    try:
        target_role_skills = recommender.role_skills_map.get('Full Stack Developer', [])
        test_skill = 'Docker'
        
        reward, objectives = recommender.reward_calculator.calculate_multi_objective_reward(
            skill=test_skill,
            learner=learner_profile,
            target_role_skills=target_role_skills
        )
        
        print(f"   ✅ Skill: {test_skill}")
        print(f"   ✅ Total reward: {reward:.3f}")
        print(f"   ✅ Objectives breakdown:")
        for obj_name, obj_score in objectives.items():
            print(f"      - {obj_name}: {obj_score:.3f}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 70)
    print("✅ All tests passed! LinUCB integration is working correctly.")
    print("=" * 70)
    
    return True


if __name__ == "__main__":
    success = test_linucb()
    sys.exit(0 if success else 1)
