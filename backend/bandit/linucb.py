import numpy as np

class LinUCB:

    def __init__(self, arms, n_features, alpha=1.0):

        self.alpha = alpha
        self.arms = arms

        self.A = {
            arm: np.identity(n_features)
            for arm in arms
        }

        self.b = {
            arm: np.zeros((n_features, 1))
            for arm in arms
        }

    def recommend(self, contexts):

        scores = {}

        for arm, x in contexts.items():

            A_inv = np.linalg.inv(self.A[arm])
            theta = A_inv @ self.b[arm]

            p = (
                theta.T @ x +
                self.alpha *
                np.sqrt(x.T @ A_inv @ x)
            )

            scores[arm] = p[0][0]

        return max(scores, key=scores.get)

    def update(self, arm, reward, context):

        self.A[arm] += context @ context.T
        self.b[arm] += reward * context
