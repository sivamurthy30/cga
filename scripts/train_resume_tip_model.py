#!/usr/bin/env python3
"""
Train Resume Tip Recommendation ML Model
Run this script to train the model before starting the backend
"""

import sys
import os

# Add ml_models to path
current_dir = os.path.dirname(os.path.abspath(__file__))
ml_models_path = os.path.join(current_dir, 'ml_models')
sys.path.append(ml_models_path)

from resume_tip_recommender import train_and_save_model

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  DEVA - Resume Tip Recommendation Model Training")
    print("="*70 + "\n")
    
    try:
        # Train and save model
        recommender = train_and_save_model()
        
        print("\n" + "="*70)
        print("  ✅ SUCCESS! Model is ready to use")
        print("="*70)
        print("\nNext steps:")
        print("1. Start the backend: python3 backend/simple_app.py")
        print("2. The ML model will be automatically loaded")
        print("3. Resume tips will now use ML predictions!\n")
        
    except Exception as e:
        print("\n" + "="*70)
        print("  ❌ ERROR during training")
        print("="*70)
        print(f"\nError: {e}\n")
        sys.exit(1)
