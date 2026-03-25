"""
Neural Contextual Bandit
Novel contribution: Deep learning for non-linear feature interactions
"""

import numpy as np
from typing import Dict, List
import json


class NeuralUCB:
    """
    Neural Upper Confidence Bound
    Uses neural network to learn reward function
    """

    def __init__(self, arms: List[str], n_features: int,
                 hidden_size: int = 128, learning_rate: float = 0.05):
        """
        Initialize Neural UCB with simple neural network

        Network: Input -> Hidden -> Output
        """
        self.arms = arms
        self.n_features = n_features
        self.hidden_size = hidden_size
        self.lr = learning_rate

        # Neural network parameters for each arm
        self.networks = {}
        for arm in arms:
            self.networks[arm] = {
                # Input -> Hidden
                'W1': np.random.randn(n_features, hidden_size) * 0.01,
                'b1': np.zeros((1, hidden_size)),

                # Hidden -> Output
                'W2': np.random.randn(hidden_size, 1) * 0.01,
                'b2': np.zeros((1, 1)),
            }

        # Track training history
        self.history = {arm: [] for arm in arms}
        self.updates = {arm: 0 for arm in arms}

    # ------------------------------------------------------------------
    # ACTIVATION
    # ------------------------------------------------------------------
    def _relu(self, x):
        """ReLU activation"""
        return np.maximum(0, x)

    # ------------------------------------------------------------------
    # FORWARD PASS
    # ------------------------------------------------------------------
    def _forward(self, x, arm):
        """Forward pass through network"""

        net = self.networks[arm]

        # Ensure input shape = (1, n_features)
        x = np.array(x).reshape(1, -1)

        # Hidden layer
        z1 = x @ net['W1'] + net['b1']
        a1 = self._relu(z1)

        # Output layer
        z2 = a1 @ net['W2'] + net['b2']

        pred = z2[0, 0]

        return pred, (x, z1, a1)

    # ------------------------------------------------------------------
    # RECOMMENDATION
    # ------------------------------------------------------------------
    def recommend(self, contexts: Dict, exploration_bonus: float = 1.0) -> str:
        """
        Recommend skill using Neural UCB

        UCB = predicted_reward + exploration_bonus * uncertainty
        """
        scores = {}

        for arm, context in contexts.items():
            pred_reward, _ = self._forward(context, arm)

            # Exploration uncertainty
            n_updates = max(self.updates[arm], 1)
            uncertainty = exploration_bonus / np.sqrt(n_updates)

            scores[arm] = pred_reward + uncertainty

        return max(scores, key=scores.get)

    # ------------------------------------------------------------------
    # UPDATE (BACKPROP TRAINING)
    # ------------------------------------------------------------------
    def update(self, arm: str, reward: float,
               context: np.ndarray, n_epochs: int = 10):
        """
        Update neural network using gradient descent

        Loss: Mean Squared Error
        """

        net = self.networks[arm]

        for _ in range(n_epochs):

            # Forward pass
            pred, (x, z1, a1) = self._forward(context, arm)

            # Loss
            loss = (pred - reward) ** 2

            # ----------------------------------------------------------
            # BACKPROP
            # ----------------------------------------------------------

            # Gradient of loss wrt prediction
            d_pred = np.array([[2 * (pred - reward)]])

            # Output layer gradients
            d_W2 = a1.T @ d_pred
            d_b2 = d_pred

            # Backprop into hidden layer
            d_a1 = d_pred @ net['W2'].T
            d_z1 = d_a1 * (z1 > 0)  # ReLU derivative

            d_W1 = x.T @ d_z1
            d_b1 = d_z1

            # ----------------------------------------------------------
            # UPDATE WEIGHTS
            # ----------------------------------------------------------

            net['W2'] -= self.lr * d_W2
            net['b2'] -= self.lr * d_b2
            net['W1'] -= self.lr * d_W1
            net['b1'] -= self.lr * d_b1

        # Track training
        self.history[arm].append(reward)
        self.updates[arm] += 1

    # ------------------------------------------------------------------
    # PREDICTION ONLY
    # ------------------------------------------------------------------
    def get_prediction(self, context: np.ndarray, arm: str) -> float:
        """Get predicted reward without exploration bonus"""
        pred, _ = self._forward(context, arm)
        return pred

    # ------------------------------------------------------------------
    # SAVE MODEL
    # ------------------------------------------------------------------
    def save_model(self, filepath: str):
        """Save neural network parameters"""

        model_data = {}

        for arm in self.arms:
            model_data[arm] = {
                'W1': self.networks[arm]['W1'].tolist(),
                'b1': self.networks[arm]['b1'].tolist(),
                'W2': self.networks[arm]['W2'].tolist(),
                'b2': self.networks[arm]['b2'].tolist(),
            }

        with open(filepath, 'w') as f:
            json.dump(model_data, f)

    # ------------------------------------------------------------------
    # LOAD MODEL
    # ------------------------------------------------------------------
    def load_model(self, filepath: str):
        """Load neural network parameters"""

        with open(filepath, 'r') as f:
            model_data = json.load(f)

        for arm in self.arms:
            if arm in model_data:
                self.networks[arm]['W1'] = np.array(model_data[arm]['W1'])
                self.networks[arm]['b1'] = np.array(model_data[arm]['b1'])
                self.networks[arm]['W2'] = np.array(model_data[arm]['W2'])
                self.networks[arm]['b2'] = np.array(model_data[arm]['b2'])


# ----------------------------------------------------------------------
# TEST BLOCK
# ----------------------------------------------------------------------
if __name__ == "__main__":

    arms = ['Skill_A', 'Skill_B']
    n_features = 5

    neural_ucb = NeuralUCB(arms, n_features)

    for i in range(100):

        contexts = {
            arm: np.random.randn(n_features)
            for arm in arms
        }

        recommended = neural_ucb.recommend(contexts)

        reward = np.random.rand()

        neural_ucb.update(recommended, reward, contexts[recommended])

    print("Training complete!")
    print(f"Skill_A updates: {neural_ucb.updates['Skill_A']}")
    print(f"Skill_B updates: {neural_ucb.updates['Skill_B']}")
