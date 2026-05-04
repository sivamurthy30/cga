import React, { useEffect } from 'react';
import '../styles/PaymentPages.css';

const PaymentSuccess = () => {
  useEffect(() => {
    // Activate Pro on successful payment redirect
    localStorage.setItem('isPro', 'true');
    localStorage.setItem('proActivatedAt', Date.now().toString());
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-card success">
        <div className="icon-large success-icon">✓</div>
        <h2>Welcome to DEVA Pro! 🎉</h2>
        <p>Your payment was successful. Your Pro subscription is now active.</p>

        <div className="benefits-list">
          <h3>You now have access to:</h3>
          <ul>
            <li>📄 Resume Builder</li>
            <li>💰 Salary Heatmap</li>
            <li>🔍 Code Reviewer</li>
            <li>🎤 Pitch Perfect</li>
            <li>📚 Book Library</li>
            <li>⚡ Daily Challenges</li>
            <li>🎯 Interview Prep</li>
            <li>🧠 Advanced Concepts</li>
          </ul>
        </div>

        <button
          className="btn-primary"
          onClick={() => { window.location.href = '/'; }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
