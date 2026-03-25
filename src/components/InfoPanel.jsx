import React from 'react';

const InfoPanel = () => {
  return (
    <div className="info-panel">
      <div className="info-header">
        <h3>About DEV<sup>A</sup></h3>
        <p className="info-subtitle">Advanced Career Gap Analyzer</p>
      </div>

      <div className="info-content">
        <div className="info-section">
          <h4>🎯 Key Features</h4>
          
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h5>Modern UI/UX</h5>
              <p>Beautiful full-page design with GSAP animations and dark gradient header</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🧠</div>
              <h5>AI-Powered Analysis</h5>
              <p>Smart skill gap detection using baseline importance ranking algorithm</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <h5>Learning Resources</h5>
              <p>Curated courses, books, and practice platforms for each skill</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🗺️</div>
              <h5>Visual Roadmap</h5>
              <p>Week-by-week timeline with priority phases and duration estimates</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <h5>Data Persistence</h5>
              <p>Your profile and progress saved locally in browser storage</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📥</div>
              <h5>Export Analysis</h5>
              <p>Download your complete analysis as JSON for future reference</p>
            </div>
          </div>

          <div className="capabilities-section">
            <h4>🎯 What You Can Do</h4>
            <ul className="capabilities-list">
              <li>✅ Choose from 8 predefined career roles</li>
              <li>✅ Add your current skills with intelligent matching</li>
              <li>✅ Get personalized skill recommendations</li>
              <li>✅ View detailed learning roadmap</li>
              <li>✅ Browse curated learning resources</li>
              <li>✅ Track your progress over time</li>
              <li>✅ Export your analysis data</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="info-footer">
        <p>Made with ❤️ for career growth and continuous learning</p>
        <p className="github-link">
          <a href="https://github.com/sivamurthy30/SkillGap" target="_blank" rel="noopener noreferrer">
            🐙 View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default InfoPanel;
