import React, { useState } from 'react';
import '../../styles/PricingModal.css';

const PricingModal = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  if (!isOpen) return null;

  const plans = {
    monthly: { price: 99,  period: 'month', note: null },
    yearly:  { price: 600, period: 'year',  note: '₹50/month · billed annually', savings: 'Save 33%' }
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

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>

        {/* Close */}
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

        {/* CTA */}
        <button className="pm-cta" onClick={() => onUpgrade({ plan: selectedPlan, price: plans[selectedPlan].price })}>
          Start 7-day free trial
        </button>
        <p className="pm-cta-note">Cancel anytime · No credit card required to start</p>

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

        <p className="pm-footer">Secure payment · Cancel anytime · Instant access</p>
      </div>
    </div>
  );
};

export default PricingModal;
