import React, { useState } from 'react';
import { gsap } from 'gsap';

const AdvancedFeatures = ({ learnerProfile, onFeaturesUpdate }) => {
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Resume Upload Handler
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a resume file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('learner_id', Date.now());

      const response = await fetch('/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resume upload failed');
      }

      const data = await response.json();
      
      setResults({
        type: 'resume',
        skills: data.skills_found || [],
        totalSkills: data.total_skills || 0,
        learningSpeed: data.learning_speed || 'medium',
        message: data.message
      });

      // Animate results
      setTimeout(() => {
        gsap.fromTo('.results-panel',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }, 100);

      // Notify parent component
      if (onFeaturesUpdate && data.skills_found) {
        onFeaturesUpdate({
          skills: data.skills_found,
          source: 'resume'
        });
      }

    } catch (err) {
      console.error('Resume upload error:', err);
      setError('Failed to analyze resume. Make sure the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // GitHub Analysis Handler
  const handleGithubAnalysis = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learner_id: Date.now(),
          github_username: githubUsername.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response from backend
        throw new Error(data.error || 'GitHub analysis failed');
      }
      
      setResults({
        type: 'github',
        skills: data.skills_found || [],
        activityScore: data.activity_score || 0,
        message: data.message
      });

      // Animate results
      setTimeout(() => {
        gsap.fromTo('.results-panel',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      }, 100);

      // Notify parent component
      if (onFeaturesUpdate && data.skills_found) {
        onFeaturesUpdate({
          skills: data.skills_found,
          source: 'github',
          activityScore: data.activity_score
        });
      }

    } catch (err) {
      console.error('GitHub analysis error:', err);
      setError(err.message || 'Failed to analyze GitHub profile. Make sure the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ML Algorithm Selection Handler
  const handleAlgorithmChange = async (algorithm) => {
    if (!learnerProfile) {
      setError('Please create a learner profile first');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetRole: learnerProfile.targetRole,
          knownSkills: learnerProfile.knownSkills,
          learningSpeed: learnerProfile.learningSpeed,
          algorithm: algorithm
        }),
      });

      if (!response.ok) {
        throw new Error('Algorithm recommendation failed');
      }

      const data = await response.json();
      
      setResults({
        type: 'algorithm',
        algorithm: algorithm,
        recommendation: data.skill,
        confidence: data.confidence,
        message: data.message
      });

    } catch (err) {
      console.error('Algorithm error:', err);
      setError('Failed to get recommendation. Make sure the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      if (['pdf', 'docx', 'txt'].includes(fileType)) {
        setResumeFile(file);
        setError('');
      } else {
        setError('Please upload a PDF, DOCX, or TXT file');
        setResumeFile(null);
      }
    }
  };

  return (
    <div className="advanced-features">
      <div className="features-header">
        <h3>🚀 Advanced Features</h3>
        <p className="features-subtitle">Unlock ML-powered insights and analysis</p>
        <button 
          className="explore-concepts-btn"
          onClick={() => window.location.hash = 'advanced-concepts'}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          🎓 Explore Advanced Concepts →
        </button>
      </div>

      {/* Tabs */}
      <div className="features-tabs">
        <button
          className={`feature-tab ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          📄 Resume Analysis
        </button>
        <button
          className={`feature-tab ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          🐙 GitHub Analysis
        </button>
        <button
          className={`feature-tab ${activeTab === 'algorithms' ? 'active' : ''}`}
          onClick={() => setActiveTab('algorithms')}
        >
          🤖 ML Algorithms
        </button>
      </div>

      {/* Tab Content */}
      <div className="features-content">
        {/* Resume Analysis Tab */}
        {activeTab === 'resume' && (
          <div className="feature-panel">
            <div className="panel-description">
              <h4>📄 Resume Analysis</h4>
              <p>Upload your resume to automatically extract skills, experience, and education using NLP.</p>
            </div>

            <div className="file-upload-area">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <label htmlFor="resume-upload" className="file-upload-label">
                <span className="upload-icon">📎</span>
                <span className="upload-text">
                  {resumeFile ? resumeFile.name : 'Choose Resume File'}
                </span>
              </label>
              <p className="file-hint">Supported: PDF, DOCX, TXT (Max 16MB)</p>
            </div>

            <button
              className="btn btn-primary feature-action-btn"
              onClick={handleResumeUpload}
              disabled={!resumeFile || isProcessing}
            >
              {isProcessing ? '⏳ Analyzing...' : '🔍 Analyze Resume'}
            </button>
          </div>
        )}

        {/* GitHub Analysis Tab */}
        {activeTab === 'github' && (
          <div className="feature-panel">
            <div className="panel-description">
              <h4>🐙 GitHub Profile Analysis</h4>
              <p>Analyze your GitHub profile to extract technical skills from repositories and contributions.</p>
            </div>

            <div className="github-input-area">
              <label htmlFor="github-username">GitHub Username</label>
              <input
                id="github-username"
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter your GitHub username"
                className="form-control"
                disabled={isProcessing}
              />
              <p className="input-hint">Example: octocat</p>
            </div>

            <button
              className="btn btn-primary feature-action-btn"
              onClick={handleGithubAnalysis}
              disabled={!githubUsername.trim() || isProcessing}
            >
              {isProcessing ? '⏳ Analyzing...' : '🔍 Analyze GitHub Profile'}
            </button>
          </div>
        )}

        {/* ML Algorithms Tab */}
        {activeTab === 'algorithms' && (
          <div className="feature-panel">
            <div className="panel-description">
              <h4>🤖 ML Recommendation Algorithms</h4>
              <p>Choose different machine learning algorithms for personalized skill recommendations.</p>
            </div>

            <div className="algorithms-grid">
              <div className="algorithm-card" onClick={() => handleAlgorithmChange('linucb')}>
                <div className="algorithm-icon">🎯</div>
                <h5>LinUCB</h5>
                <p>Linear Upper Confidence Bound - Balances exploration and exploitation</p>
                <span className="algorithm-badge">Recommended</span>
              </div>

              <div className="algorithm-card" onClick={() => handleAlgorithmChange('thompson')}>
                <div className="algorithm-icon">🎲</div>
                <h5>Thompson Sampling</h5>
                <p>Bayesian approach - Better for cold-start scenarios</p>
                <span className="algorithm-badge">Probabilistic</span>
              </div>

              <div className="algorithm-card" onClick={() => handleAlgorithmChange('neural')}>
                <div className="algorithm-icon">🧠</div>
                <h5>Neural UCB</h5>
                <p>Deep learning based - Handles complex patterns</p>
                <span className="algorithm-badge">Advanced</span>
              </div>

              <div className="algorithm-card" onClick={() => handleAlgorithmChange('hybrid')}>
                <div className="algorithm-icon">⚡</div>
                <h5>Hybrid Bandit</h5>
                <p>Ensemble approach - Best overall performance</p>
                <span className="algorithm-badge">Best</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="feature-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results Panel */}
        {results && (
          <div className="results-panel">
            <h4>✅ Analysis Results</h4>
            
            {results.type === 'resume' && (
              <div className="result-content">
                <div className="result-stat">
                  <span className="stat-label">Skills Extracted:</span>
                  <span className="stat-value">{results.totalSkills}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Learning Speed:</span>
                  <span className="stat-value">{results.learningSpeed}</span>
                </div>
                <div className="skills-extracted">
                  <h5>Extracted Skills:</h5>
                  <div className="skills-list-result">
                    {results.skills.map((skill, index) => (
                      <span key={index} className="skill-result-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {results.type === 'github' && (
              <div className="result-content">
                <div className="result-stat">
                  <span className="stat-label">Activity Score:</span>
                  <span className="stat-value">{results.activityScore}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Skills Found:</span>
                  <span className="stat-value">{results.skills.length}</span>
                </div>
                <div className="skills-extracted">
                  <h5>Technical Skills:</h5>
                  <div className="skills-list-result">
                    {results.skills.map((skill, index) => (
                      <span key={index} className="skill-result-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {results.type === 'algorithm' && (
              <div className="result-content">
                <div className="result-stat">
                  <span className="stat-label">Algorithm:</span>
                  <span className="stat-value">{results.algorithm}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Recommendation:</span>
                  <span className="stat-value">{results.recommendation}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Confidence:</span>
                  <span className="stat-value">{(results.confidence * 100).toFixed(1)}%</span>
                </div>
                <p className="result-message">{results.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backend Status Note */}
      <div className="features-note">
        <p>💡 <strong>Note:</strong> These features require the ML backend to be running on port 5001.</p>
        <p>Start backend: <code>python3 backend/simple_app.py</code></p>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
