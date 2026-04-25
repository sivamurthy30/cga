import React, { useState } from 'react';
import BookLibrary from './BookLibrary';
import '../../styles/premium/PremiumDashboard.css';

const PremiumDashboard = ({ isPremium = false, onUpgradeClick }) => {
  const [activeFeature, setActiveFeature] = useState('overview');

  const premiumFeatures = [
    {
      id: 'overview',
      icon: '🏠',
      title: 'Overview',
      description: 'Your premium dashboard',
      component: null
    },
    {
      id: 'library',
      icon: '📚',
      title: 'Executive Library',
      description: '15-min book summaries',
      component: BookLibrary,
      available: true
    },
    {
      id: 'resume',
      icon: '📄',
      title: 'Resume Architect',
      description: 'ATS-optimized builder',
      available: false,
      comingSoon: true
    },
    {
      id: 'interview',
      icon: '🎤',
      title: 'Interview Lab',
      description: 'AI mock interviews',
      available: false,
      comingSoon: true
    },
    {
      id: 'mentor',
      icon: '🤖',
      title: 'Shadow Mentor',
      description: 'Real-time AI guidance',
      available: false,
      comingSoon: true
    },
    {
      id: 'salary',
      icon: '💰',
      title: 'Salary Heatmaps',
      description: 'Market insights',
      available: false,
      comingSoon: true
    },
    {
      id: 'portfolio',
      icon: '✍️',
      title: 'Portfolio Builder',
      description: 'Document your wins',
      available: false,
      comingSoon: true
    },
    {
      id: 'webinars',
      icon: '👥',
      title: 'Inner Circle',
      description: 'Exclusive webinars',
      available: false,
      comingSoon: true
    }
  ];

  const handleFeatureClick = (featureId) => {
    const feature = premiumFeatures.find(f => f.id === featureId);
    
    if (!isPremium) {
      onUpgradeClick?.();
      return;
    }

    if (feature.comingSoon) {
      alert('This feature is coming soon! Stay tuned for updates.');
      return;
    }

    setActiveFeature(featureId);
  };

  const renderOverview = () => (
    <div className="premium-overview">
      <div className="welcome-section">
        <h1>Welcome to DEVAsquare Premium 🎉</h1>
        {isPremium ? (
          <p className="welcome-text">
            You have access to all premium features. Explore the tools below to elevate your career.
          </p>
        ) : (
          <div className="upgrade-prompt">
            <p className="welcome-text">
              Unlock the full potential of your career with premium features.
            </p>
            <button className="upgrade-cta" onClick={onUpgradeClick}>
              🚀 Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>50+</h3>
            <p>Book Summaries</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>100+</h3>
            <p>Interview Questions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>24/7</h3>
            <p>AI Mentor Access</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>Live</h3>
            <p>Market Data</p>
          </div>
        </div>
      </div>

      <div className="features-showcase">
        <h2>Premium Features</h2>
        <div className="showcase-grid">
          {premiumFeatures.filter(f => f.id !== 'overview').map(feature => (
            <div
              key={feature.id}
              className={`showcase-card ${!isPremium ? 'locked' : ''} ${feature.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => handleFeatureClick(feature.id)}
            >
              {!isPremium && <div className="card-lock">🔒</div>}
              {feature.comingSoon && <div className="coming-soon-badge">Coming Soon</div>}
              <div className="showcase-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.available && isPremium && (
                <button className="explore-btn">Explore →</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="benefits-section">
        <h2>Why Premium?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h4>Accelerate Learning</h4>
            <p>Master key concepts in 15 minutes with curated book summaries</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <h4>Land Your Dream Job</h4>
            <p>ATS-optimized resumes and AI-powered interview preparation</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📈</span>
            <h4>Stay Ahead</h4>
            <p>Real-time market insights and salary data for strategic decisions</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🤝</span>
            <h4>Network Smarter</h4>
            <p>Connect with mentors and industry leaders in exclusive webinars</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveFeature = () => {
    if (activeFeature === 'overview') {
      return renderOverview();
    }

    const feature = premiumFeatures.find(f => f.id === activeFeature);
    
    if (!feature || !feature.component) {
      return renderOverview();
    }

    const FeatureComponent = feature.component;
    return <FeatureComponent isPremium={isPremium} />;
  };

  return (
    <div className="premium-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>DEVAsquare</h2>
          <span className="premium-badge">Premium</span>
        </div>

        <nav className="sidebar-nav">
          {premiumFeatures.map(feature => (
            <button
              key={feature.id}
              className={`nav-item ${activeFeature === feature.id ? 'active' : ''} ${!isPremium ? 'locked' : ''} ${feature.comingSoon ? 'coming-soon' : ''}`}
              onClick={() => handleFeatureClick(feature.id)}
            >
              <span className="nav-icon">{feature.icon}</span>
              <span className="nav-label">{feature.title}</span>
              {!isPremium && feature.id !== 'overview' && <span className="nav-lock">🔒</span>}
              {feature.comingSoon && <span className="nav-soon">Soon</span>}
            </button>
          ))}
        </nav>

        {!isPremium && (
          <div className="sidebar-upgrade">
            <button className="sidebar-upgrade-btn" onClick={onUpgradeClick}>
              ⭐ Upgrade Now
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        {renderActiveFeature()}
      </div>
    </div>
  );
};

export default PremiumDashboard;
