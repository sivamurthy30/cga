"""
Hybrid Ensemble Resume Tip Recommender
Combines multiple ML algorithms using Stacking Ensemble approach:
- XGBoost (Gradient Boosting)
- Gradient Boosting Classifier
- Logistic Regression
- Support Vector Machine (SVM)
- Meta-learner: Random Forest

This unique approach provides better accuracy and robustness than single models.
"""
import numpy as np
import json
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
import joblib

try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except (ImportError, Exception) as e:
    XGBOOST_AVAILABLE = False
    print(f"⚠️  XGBoost not available: {str(e)[:50]}... Using alternative algorithms")


class HybridEnsembleRecommender:
    """
    Hybrid Ensemble Model for Resume Tip Recommendation
    Uses stacking of multiple algorithms for superior performance
    """
    
    def __init__(self):
        self.models = []  # One ensemble per tip
        self.scalers = []  # Feature scaling for each tip
        self.accuracies = []
        self.model_names = []
        
    def _create_ensemble_model(self):
        """Create a stacking ensemble with multiple base models"""
        
        # Base models (Level 0)
        base_models = []
        
        if XGBOOST_AVAILABLE:
            # XGBoost - Powerful gradient boosting
            base_models.append(
                ('xgboost', XGBClassifier(
                    n_estimators=50,
                    max_depth=5,
                    learning_rate=0.1,
                    random_state=42,
                    use_label_encoder=False,
                    eval_metric='logloss'
                ))
            )
        
        # Gradient Boosting - Sequential ensemble
        base_models.append(
            ('gb', GradientBoostingClassifier(
                n_estimators=50,
                max_depth=4,
                learning_rate=0.1,
                random_state=42
            ))
        )
        
        # Logistic Regression - Linear model
        base_models.append(
            ('lr', LogisticRegression(
                max_iter=1000,
                random_state=42,
                C=1.0
            ))
        )
        
        # Support Vector Machine - Kernel-based
        base_models.append(
            ('svm', SVC(
                kernel='rbf',
                probability=True,
                random_state=42,
                C=1.0
            ))
        )
        
        # Meta-learner (Level 1) - Random Forest combines base predictions
        meta_learner = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Create stacking ensemble
        ensemble = StackingClassifier(
            estimators=base_models,
            final_estimator=meta_learner,
            cv=5,  # 5-fold cross-validation for meta-features
            stack_method='predict_proba'
        )
        
        return ensemble
    
    def extract_features(self, resume_profile):
        """Extract numerical features from resume profile"""
        features = []
        
        # Role encoding (one-hot)
        roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 
                'Data Scientist', 'DevOps Engineer', 'Mobile Developer']
        role = resume_profile.get('role', '')
        role_encoded = [1 if role == r else 0 for r in roles]
        features.extend(role_encoded)
        
        # Skill features
        skills = resume_profile.get('skills', [])
        features.append(len(skills))  # Number of skills
        
        # Check for ML/AI skills
        ml_keywords = ['machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'deep learning']
        has_ml = any(any(kw in skill.lower() for kw in ml_keywords) for skill in skills)
        features.append(1 if has_ml else 0)
        
        # Project features
        projects = resume_profile.get('projects', [])
        features.append(len(projects))  # Number of projects
        
        # Experience
        features.append(resume_profile.get('experience_years', 0))
        
        # Boolean features
        features.append(1 if resume_profile.get('has_github', False) else 0)
        features.append(1 if resume_profile.get('has_portfolio', False) else 0)
        features.append(1 if resume_profile.get('has_certifications', False) else 0)
        features.append(1 if resume_profile.get('has_quantifiable_metrics', False) else 0)
        
        return np.array(features)
    
    def train(self, training_data_path):
        """Train the hybrid ensemble model"""
        # Load training data
        with open(training_data_path, 'r') as f:
            data = json.load(f)
        
        training_samples = data['training_data']
        
        # Extract features and labels
        X = []
        y = {i: [] for i in range(1, 13)}
        
        for sample in training_samples:
            features = self.extract_features(sample['resume_features'])
            X.append(features)
            
            for tip_id in range(1, 13):
                y[tip_id].append(1 if tip_id in sample['recommended_tips'] else 0)
        
        X = np.array(X)
        
        # Train one ensemble model per tip
        print("Training Hybrid Ensemble Models...")
        print("=" * 60)
        
        for tip_id in range(1, 13):
            # Create scaler for this tip
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Create and train ensemble
            ensemble = self._create_ensemble_model()
            y_tip = np.array(y[tip_id])
            
            ensemble.fit(X_scaled, y_tip)
            
            # Calculate training accuracy
            y_pred = ensemble.predict(X_scaled)
            accuracy = np.mean(y_pred == y_tip)
            
            self.models.append(ensemble)
            self.scalers.append(scaler)
            self.accuracies.append(accuracy)
            
            # Get model composition
            if XGBOOST_AVAILABLE:
                composition = "XGBoost + GB + LR + SVM → RF"
            else:
                composition = "GB + LR + SVM → RF"
            
            print(f"Tip {tip_id:2d} - Accuracy: {accuracy:.3f} | Ensemble: {composition}")
        
        avg_accuracy = np.mean(self.accuracies)
        print("=" * 60)
        print(f"Average Accuracy: {avg_accuracy:.3f}")
        print(f"Model Type: Stacking Ensemble (4-5 base models + meta-learner)")
        print("=" * 60)
    
    def predict(self, resume_profile):
        """Predict tip recommendations using ensemble"""
        features = self.extract_features(resume_profile)
        features = features.reshape(1, -1)
        
        predictions = []
        
        for tip_id, (model, scaler) in enumerate(zip(self.models, self.scalers), 1):
            # Scale features
            features_scaled = scaler.transform(features)
            
            # Get probability from ensemble
            proba = model.predict_proba(features_scaled)[0]
            probability = proba[1] if len(proba) > 1 else proba[0]
            
            # Predict
            prediction = model.predict(features_scaled)[0]
            
            predictions.append({
                'tip_id': tip_id,
                'probability': float(probability),
                'recommended': bool(prediction == 1),
                'priority_score': float(probability * self.accuracies[tip_id - 1])
            })
        
        # Sort by priority score
        predictions.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return predictions
    
    def save_model(self, path):
        """Save the trained ensemble model"""
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'accuracies': self.accuracies,
            'model_type': 'Hybrid Stacking Ensemble',
            'base_models': 'XGBoost, GradientBoosting, LogisticRegression, SVM' if XGBOOST_AVAILABLE else 'GradientBoosting, LogisticRegression, SVM',
            'meta_learner': 'RandomForest'
        }
        joblib.dump(model_data, path)
        print(f"\nModel saved to {path}")
        print(f"Average Accuracy: {np.mean(self.accuracies):.3f}")
    
    def load_model(self, path):
        """Load a trained ensemble model"""
        model_data = joblib.load(path)
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.accuracies = model_data['accuracies']
        
        print(f"Model loaded from {path}")
        print(f"Model Type: {model_data.get('model_type', 'Unknown')}")
        print(f"Base Models: {model_data.get('base_models', 'Unknown')}")
        print(f"Meta-learner: {model_data.get('meta_learner', 'Unknown')}")
        print(f"Average Accuracy: {np.mean(self.accuracies):.3f}")
