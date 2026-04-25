import React, { useState } from 'react';
import '../styles/PricingModal.css';

const PricingModal = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  if (!isOpen) return null;

  const plans = {
    monthly: {
      price: 29,
      period: 'month',
      savings: null
    },
    yearly: {
      price: 249,
      period: 'year',
      savings: '30% OFF'
    }
  };

  const proFeatures = [
    { icon: '📚', title: 'Executive Library', description: 'Curated books on leadership & strategy', category: 'learning' },
    { icon: '⚡', title: '15-Min Power Summaries', description: 'Master 300-page books in minutes', category: 'learning' },
    { icon: '🎯', title: 'Dynamic Learning Paths', description: 'AI suggests your next book based on goals', category: 'learning' },
    { icon: '📄', title: 'Precision Resume Architect', description: 'ATS-optimized resume builder', category: 'growth' },
    { icon: '🎤', title: 'Virtual Interview Lab', description: 'AI feedback on body language & tone', category: 'growth' },
    { icon: '📊', title: 'Skill-Gap Blueprint', description: 'Map abilities against real job descriptions', category: 'growth' },
    { icon: '👥', title: 'Inner Circle Hub', description: 'Private webinars with industry titans', category: 'exclusive' },
    { icon: '🏆', title: 'Milestone Dashboard', description: 'Track certifications & career XP', category: 'exclusive' },
    { icon: '🤝', title: 'Mentor Matchmaker', description: 'Algorithm-driven networking hub', category: 'exclusive' },
    { icon: '🤖', title: 'Shadow Mentor AI', description: 'Real-time AI companion for career guidance', category: 'ai' },
    { icon: '💰', title: 'Salary Heatmaps', description: 'Live data on hiring trends & salaries', category: 'ai' },
    { icon: '✍️', title: 'Portfolio Ghostwriter', description: 'Document wins for instant resume updates', category: 'ai' }
  ];

  const handleUpgrade = () => {
    const plan = plans[selectedPlan];
    onUpgrade({
      plan: selectedPlan,
      price: plan.price,
      period: plan.period
    });
  };

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="pricing-modal-close" onClick={onClose}>×</button>
        
        <div className="pricing-header">
          <h2>Elevate Your Professional Trajectory</h2>
          <h3><span className="devasquare-logo">DEVAsquare Premium</span></h3>
          <p>The gap between where you are and where you want to be just got smaller</p>
        </div>

        <div className="pricing-toggle">
          <button 
            className={`toggle-btn ${selectedPlan === 'monthly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`toggle-btn ${selectedPlan === 'yearly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('yearly')}
          >
            Yearly
            {plans.yearly.savings && <span className="savings-badge">{plans.yearly.savings}</span>}
          </button>
        </div>

        <div className="pricing-card">
          <div className="price-display">
            <span className="currency">$</span>
            <span className="amount">{plans[selectedPlan].price}</span>
            <span className="period">/{plans[selectedPlan].period}</span>
          </div>
          {selectedPlan === 'yearly' && (
            <p className="price-note">Just $20.75/month billed annually</p>
          )}
        </div>

        <div className="features-grid">
          <div className="feature-category">
            <h4 className="category-title">📚 The Intellectual Edge</h4>
            {proFeatures.filter(f => f.category === 'learning').map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-category">
            <h4 className="category-title">🎯 The Placement Engine</h4>
            {proFeatures.filter(f => f.category === 'growth').map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-category">
            <h4 className="category-title">🧭 The Insider Circle</h4>
            {proFeatures.filter(f => f.category === 'exclusive').map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-category">
            <h4 className="category-title">✨ Gemini-Infused AI Features</h4>
            {proFeatures.filter(f => f.category === 'ai').map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-content">
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="upgrade-btn" onClick={handleUpgrade}>
          Upgrade to DEVAsquare Pro
        </button>

        <p className="pricing-footer">
          Cancel anytime • 30-day money-back guarantee • Secure payment
        </p>
      </div>
    </div>
  );
};

export default PricingModal;
