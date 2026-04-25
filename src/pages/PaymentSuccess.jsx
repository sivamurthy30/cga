import React, { useEffect, useState } from 'react';
import { verifyPayUPayment } from '../utils/payuIntegration';
import '../styles/PaymentPages.css';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const responseParams = {
          status: urlParams.get('status'),
          txnid: urlParams.get('txnid'),
          amount: urlParams.get('amount'),
          productinfo: urlParams.get('productinfo'),
          firstname: urlParams.get('firstname'),
          email: urlParams.get('email'),
          hash: urlParams.get('hash'),
          key: urlParams.get('key')
        };

        const result = await verifyPayUPayment(responseParams);

        if (result.success) {
          // Activate Pro subscription
          localStorage.setItem('isPro', 'true');
          localStorage.setItem('proActivatedAt', Date.now());
          setVerified(true);
        } else {
          setError(result.error || 'Payment verification failed');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, []);

  if (verifying) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="spinner-large"></div>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-card error">
          <div className="icon-large">⚠️</div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card success">
        <div className="icon-large success-icon">✓</div>
        <h2>Welcome to DEVAsquare Pro! 🎉</h2>
        <p>Your payment was successful and your Pro subscription is now active.</p>
        
        <div className="benefits-list">
          <h3>You now have access to:</h3>
          <ul>
            <li>🤖 AI-Powered Career Coach</li>
            <li>📊 Advanced Analytics</li>
            <li>🎯 Custom Learning Paths</li>
            <li>💼 Interview Preparation</li>
            <li>🏆 Certification Tracking</li>
            <li>📚 Premium Resources</li>
            <li>👥 Mentor Matching</li>
            <li>🔔 Priority Support</li>
          </ul>
        </div>

        <button className="btn-primary" onClick={() => window.location.href = '/'}>
          Start Using DEVAsquare Pro
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
