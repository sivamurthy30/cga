"""
ML Model for Resume Tip Recommendation
Uses Random Forest Classifier to predict which tips will be most effective
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import json
import os

class ResumeTipRecommender:
    """
    ML-powered resume tip recommender
    Predicts which tips will be most effective for a given resume profile
    """
    
    def __init__(self, model_path=None):
        self.model = None
        self.scaler = StandardScaler()
        self.role_encoder = LabelEncoder()
        self.feature_names = [
            'role_encoded',
            'num_skills',
            'num_projects',
            'experience_years',
            'has_github',
            'has_portfolio',
            'has_certifications',
            'has_quantifiable_metrics',
            'has_ml_skills',
            'has_web_skills',
            'has_cloud_skills'
        ]
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def extract_features(self, resume_profile):
        """
        Extract features from resume profile
        
        Args:
            resume_profile: dict with keys:
                - role: str
                - skills: list
                - projects: list
                - experience_years: int
                - has_github: bool
                - has_portfolio: bool
                - has_certifications: bool
        
        Returns:
            numpy array of features
        """
        skills = resume_profile.get('skills', [])
        projects = resume_profile.get('projects', [])
        
        # Convert skills to lowercase for matching
        skills_lower = [str(s).lower() for s in skills]
        skills_text = ' '.join(skills_lower)
        
        # Check for specific skill categories
        ml_keywords = ['machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'deep learning']
        web_keywords = ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'frontend', 'backend']
        cloud_keywords = ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes']
        
        has_ml_skills = any(keyword in skills_text for keyword in ml_keywords)
        has_web_skills = any(keyword in skills_text for keyword in web_keywords)
        has_cloud_skills = any(keyword in skills_text for keyword in cloud_keywords)
        
        # Check for quantifiable metrics in projects
        has_quantifiable_metrics = False
        if projects:
            for project in projects:
                project_text = str(project.get('description', '')).lower()
                # Look for numbers and percentage signs
                if any(char.isdigit() for char in project_text) and ('%' in project_text or 'users' in project_text or 'performance' in project_text):
                    has_quantifiable_metrics = True
                    break
        
        features = {
            'role_encoded': self._encode_role(resume_profile.get('role', 'Full Stack Developer')),
            'num_skills': len(skills),
            'num_projects': len(projects),
            'experience_years': resume_profile.get('experience_years', 0),
            'has_github': int(resume_profile.get('has_github', False)),
            'has_portfolio': int(resume_profile.get('has_portfolio', False)),
            'has_certifications': int(resume_profile.get('has_certifications', False)),
            'has_quantifiable_metrics': int(has_quantifiable_metrics),
            'has_ml_skills': int(has_ml_skills),
            'has_web_skills': int(has_web_skills),
            'has_cloud_skills': int(has_cloud_skills)
        }
        
        return np.array([features[name] for name in self.feature_names])
    
    def _encode_role(self, role):
        """Encode role to numeric value"""
        role_mapping = {
            'Frontend Developer': 0,
            'Backend Developer': 1,
            'Full Stack Developer': 2,
            'Data Scientist': 3,
            'DevOps Engineer': 4,
            'Mobile Developer': 5
        }
        return role_mapping.get(role, 2)  # Default to Full Stack
    
    def train(self, training_data_path):
        """
        Train the model on resume tip data
        
        Args:
            training_data_path: path to JSON file with training data
        """
        # Load training data
        with open(training_data_path, 'r') as f:
            data = json.load(f)
        
        training_samples = data['training_data']
        
        # Prepare features and labels
        X = []
        y = []
        
        for sample in training_samples:
            features = self.extract_features(sample['resume_features'])
            X.append(features)
            
            # Create multi-label target (which tips are recommended)
            tip_vector = [0] * 12  # 12 tips total
            for tip_id in sample['recommended_tips']:
                tip_vector[tip_id - 1] = 1
            y.append(tip_vector)
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train separate classifier for each tip
        self.models = []
        self.accuracies = []
        
        for tip_idx in range(12):
            # Train binary classifier for this tip
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=2,
                random_state=42
            )
            
            model.fit(X_scaled, y[:, tip_idx])
            self.models.append(model)
            
            # Calculate accuracy
            predictions = model.predict(X_scaled)
            accuracy = accuracy_score(y[:, tip_idx], predictions)
            self.accuracies.append(accuracy)
            
            print(f"Tip {tip_idx + 1} - Accuracy: {accuracy:.3f}")
        
        print(f"\nAverage Accuracy: {np.mean(self.accuracies):.3f}")
        
        return self.models
    
    def predict(self, resume_profile):
        """
        Predict which tips are most relevant for a resume
        
        Args:
            resume_profile: dict with resume information
        
        Returns:
            list of tuples (tip_id, probability, priority)
        """
        if not self.models:
            raise ValueError("Model not trained. Call train() first or load a trained model.")
        
        # Extract features
        features = self.extract_features(resume_profile)
        features_scaled = self.scaler.transform(features.reshape(1, -1))
        
        # Get predictions from all models
        predictions = []
        for tip_idx, model in enumerate(self.models):
            # Get probability of tip being relevant
            proba = model.predict_proba(features_scaled)[0][1]
            
            # Calculate priority score (probability * tip impact score)
            tip_id = tip_idx + 1
            impact_score = self._get_tip_impact_score(tip_id)
            priority_score = proba * impact_score
            
            predictions.append({
                'tip_id': tip_id,
                'probability': float(proba),
                'priority_score': float(priority_score),
                'recommended': proba > 0.5
            })
        
        # Sort by priority score
        predictions.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return predictions
    
    def _get_tip_impact_score(self, tip_id):
        """Get impact score for a tip"""
        impact_scores = {
            1: 0.95, 2: 0.90, 3: 0.85, 4: 0.92,
            5: 0.80, 6: 0.93, 7: 0.82, 8: 0.78,
            9: 0.88, 10: 0.91, 11: 0.94, 12: 0.96
        }
        return impact_scores.get(tip_id, 0.80)
    
    def save_model(self, model_path):
        """Save trained model to disk"""
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'accuracies': self.accuracies,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path):
        """Load trained model from disk"""
        model_data = joblib.load(model_path)
        self.models = model_data['models']
        self.scaler = model_data.get('scaler', None)  # Handle old models without scaler
        self.accuracies = model_data.get('accuracies', [])
        self.feature_names = model_data.get('feature_names', self.feature_names)
        print(f"Model loaded from {model_path}")
        if self.accuracies:
            print(f"Average Accuracy: {np.mean(self.accuracies):.3f}")


def train_and_save_model():
    """Train model and save it"""
    import os
    
    # Get paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, ".."))
    
    training_data_path = os.path.join(project_root, "data", "resume_tips_training_data.json")
    model_save_path = os.path.join(current_dir, "resume_tip_model.pkl")
    
    # Create and train model
    print("Training Resume Tip Recommender Model...")
    print("=" * 60)
    
    recommender = ResumeTipRecommender()
    recommender.train(training_data_path)
    
    # Save model
    recommender.save_model(model_save_path)
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print(f"Model saved to: {model_save_path}")
    
    return recommender


if __name__ == "__main__":
    # Train and save the model
    recommender = train_and_save_model()
    
    # Test prediction
    print("\n" + "=" * 60)
    print("Testing Model Prediction...")
    print("=" * 60)
    
    test_profile = {
        'role': 'Frontend Developer',
        'skills': ['HTML', 'CSS', 'JavaScript', 'React'],
        'projects': [
            {'name': 'Portfolio Website', 'description': 'Built a responsive portfolio'},
            {'name': 'E-commerce App', 'description': 'React-based shopping app'}
        ],
        'experience_years': 1,
        'has_github': True,
        'has_portfolio': False,
        'has_certifications': False
    }
    
    predictions = recommender.predict(test_profile)
    
    print("\nTop 5 Recommended Tips:")
    for i, pred in enumerate(predictions[:5], 1):
        print(f"{i}. Tip #{pred['tip_id']} - Priority: {pred['priority_score']:.3f} (Probability: {pred['probability']:.3f})")
