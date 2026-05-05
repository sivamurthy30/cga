import React, { useState } from 'react';
import '../../styles/PricingModal.css';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SleEQLkLLSLagGR';

const PricingModal = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const plans = {
    monthly: { price: 9,  period: 'month', note: null,                         paise: 900  },
    yearly:  { price: 90, period: 'year',  note: '₹9/month · billed annually', paise: 9000 },
  };

  const features = [
    { icon: '🗺️', title: 'Learning Roadmaps',    desc: 'Structured paths for your target role' },
    { icon: '📄', title: 'Resume Builder',        desc: 'Rewrite your resume for any job' },
    { icon: '💰', title: 'Salary Heatmap',        desc: 'Real salary data across Indian cities' },
    { icon: '🔍', title: 'Code Reviewer',         desc: 'Complexity and security audit' },
    { icon: '🎤', title: 'Pitch Perfect',         desc: 'Record and get delivery feedback' },
    { icon: '📚', title: 'Book Library',          desc: 'Engineering and leadership books' },
    { icon: '⚡', title: 'Daily Challenges',      desc: 'One coding problem a day, earn XP' },
    { icon: '🎯', title: 'Interview Prep',        desc: 'Flash cards for your target role' },
    { icon: '📊', title: 'Skill Gap Analysis',    desc: 'See exactly what you need to learn' },
    { icon: '🧠', title: 'Advanced Concepts',     desc: 'System design deep-dives' },
    { icon: '🏆', title: 'Progress Tracking',     desc: 'Milestones, XP, and badges' },
    { icon: '🤖', title: 'AI Career Chat',        desc: 'Ask anything about your career' },
  ];

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    const userEmail = localStorage.getItem('userEmail') || '';
    const userName  = localStorage.getItem('userName')  || 'User';
    const plan      = selectedPlan;

    try {
      // Step 1: Create order on backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: userEmail }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.detail || 'Failed to create payment order');
      }

      const order = await orderRes.json();

      // Step 2: Open Razorpay checkout modal
      const options = {
        key:          order.key_id || RAZORPAY_KEY_ID,
        amount:       order.amount,
        currency:     order.currency,
        name:         'DEVA Pro',
        description:  `${plan === 'yearly' ? 'Yearly' : 'Monthly'} subscription`,
        order_id:     order.order_id,
        prefill: {
          name:  userName,
          email: userEmail,
        },
        theme: { color: '#f59e0b' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled.');
          },
        },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                email: userEmail,
                plan,
              }),
            });

            const result = await verifyRes.json();

            if (!verifyRes.ok || !result.success) {
              throw new Error(result.detail || 'Payment verification failed');
            }

            // Grant pro access
            localStorage.setItem('isPro', 'true');
            setLoading(false);
            onUpgrade({ plan, payment_id: response.razorpay_payment_id });

          } catch (verifyErr) {
            setLoading(false);
            setError(verifyErr.message || 'Payment verification failed. Contact support.');
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout not loaded. Please refresh and try again.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setLoading(false);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>

        <button className="pm-close" onClick={onClose} aria-label="Close">×</button>

        {/* Header */}
        <div className="pm-header">
          <div className="pm-badge">PRO</div>
          <h2 className="pm-title">DEVA Pro</h2>
          <p className="pm-subtitle">Every tool you need to land your next role.</p>
        </div>

        {/* Plan toggle */}
        <div className="pm-toggle">
          <button
            className={`pm-toggle-btn ${selectedPlan === 'monthly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            Monthly
          </button>
          <button
            className={`pm-toggle-btn ${selectedPlan === 'yearly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('yearly')}
          >
            Yearly
            {selectedPlan === 'yearly' && <span className="pm-save-tag">Save 33%</span>}
          </button>
          {selectedPlan === 'monthly' && (
            <span className="pm-save-hint">Switch to yearly and save ₹4,000</span>
          )}
        </div>

        {/* Price */}
        <div className="pm-price-row">
          <span className="pm-currency">₹</span>
          <span className="pm-amount">{plans[selectedPlan].price}</span>
          <span className="pm-period">/{plans[selectedPlan].period}</span>
        </div>
        {selectedPlan === 'yearly' && (
          <p className="pm-price-note">{plans.yearly.note}</p>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid var(--accent-error)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--accent-error)' }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          className="pm-cta"
          onClick={handlePayment}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Pay with Razorpay'}
        </button>
        <p className="pm-cta-note">Secure payment · Cancel anytime · Instant access</p>

        {/* Features */}
        <div className="pm-divider"><span>What's included</span></div>
        <div className="pm-features">
          {features.map((f, i) => (
            <div key={i} className="pm-feature">
              <span className="pm-feature-check">✓</span>
              <span className="pm-feature-icon">{f.icon}</span>
              <div className="pm-feature-text">
                <span className="pm-feature-title">{f.title}</span>
                <span className="pm-feature-desc">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="pm-footer">Powered by Razorpay · 256-bit SSL encryption</p>
      </div>
    </div>
  );
};

export default PricingModal;
