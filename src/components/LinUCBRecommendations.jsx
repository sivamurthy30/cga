import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../styles/LinUCBRecommendations.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const LinUCBRecommendations = ({ userProfile, onSkillSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/linucb/recommend`, {
        id: userProfile.id || 'user_' + Date.now(),
        target_role: userProfile.targetRole || 'Full Stack Developer',
        known_skills: userProfile.skills?.join(', ') || '',
        num_projects: userProfile.projects?.length || 0,
        experience_years: userProfile.experienceYears || 0,
        has_github: userProfile.hasGithub || false,
        has_portfolio: userProfile.hasPortfolio || false,
        has_certifications: userProfile.hasCertifications || false,
        has_quantifiable_metrics: userProfile.hasQuantifiableMetrics || false,
        learning_speed: userProfile.learningSpeed || 0.5
      }, {
        params: {
          top_k: 5,
          exclude_known: true
        }
      });

      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/linucb/statistics`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Explain recommendation
  const explainRecommendation = async (skill) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/linucb/explain`, {
        id: userProfile.id || 'user_' + Date.now(),
        target_role: userProfile.targetRole || 'Full Stack Developer',
        known_skills: userProfile.skills?.join(', ') || '',
        num_projects: userProfile.projects?.length || 0,
        experience_years: userProfile.experienceYears || 0,
        has_github: userProfile.hasGithub || false,
        has_portfolio: userProfile.hasPortfolio || false,
        has_certifications: userProfile.hasCertifications || false,
        has_quantifiable_metrics: userProfile.hasQuantifiableMetrics || false,
        learning_speed: userProfile.learningSpeed || 0.5
      }, {
        params: { skill }
      });

      setExplanation(response.data);
      setSelectedSkill(skill);
    } catch (err) {
      console.error('Error explaining recommendation:', err);
    }
  };

  // Submit feedback
  const submitFeedback = async (skill, interactionType, timeSpent = null) => {
    try {
      await axios.post(`${API_BASE_URL}/api/linucb/feedback`, {
        learner_profile: {
          id: userProfile.id || 'user_' + Date.now(),
          target_role: userProfile.targetRole || 'Full Stack Developer',
          known_skills: userProfile.skills?.join(', ') || '',
          num_projects: userProfile.projects?.length || 0,
          experience_years: userProfile.experienceYears || 0,
          has_github: userProfile.hasGithub || false,
          has_portfolio: userProfile.hasPortfolio || false,
          has_certifications: userProfile.hasCertifications || false,
          has_quantifiable_metrics: userProfile.hasQuantifiableMetrics || false,
          learning_speed: userProfile.learningSpeed || 0.5
        },
        skill,
        interaction_type: interactionType,
        time_spent: timeSpent,
        completed: interactionType === 'completed'
      });

      // Refresh recommendations after feedback
      if (interactionType === 'completed' || interactionType === 'skipped') {
        fetchRecommendations();
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  // Handle skill click
  const handleSkillClick = (skill) => {
    submitFeedback(skill, 'clicked');
    explainRecommendation(skill);
    if (onSkillSelect) {
      onSkillSelect(skill);
    }
  };

  // Handle start learning
  const handleStartLearning = (skill) => {
    submitFeedback(skill, 'started');
    setSelectedSkill(null);
    setExplanation(null);
  };

  // Handle skip
  const handleSkip = (skill) => {
    submitFeedback(skill, 'skipped');
    setSelectedSkill(null);
    setExplanation(null);
  };

  useEffect(() => {
    fetchRecommendations();
    fetchStats();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="linucb-container">
        <div className="linucb-loading">
          <div className="spinner"></div>
          <p>Loading AI-powered recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="linucb-container">
        <div className="linucb-error">
          <p>{error}</p>
          <button onClick={fetchRecommendations} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="linucb-container">
      <div className="linucb-header">
        <div className="linucb-title">
          <h2>🤖 AI-Powered Skill Recommendations</h2>
          <p className="linucb-subtitle">
            Personalized using LinUCB Reinforcement Learning
          </p>
        </div>
        {stats && (
          <div className="linucb-stats-badge">
            <span className="stat-label">Avg Reward:</span>
            <span className="stat-value">{(stats.average_reward * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="linucb-recommendations">
        <AnimatePresence>
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.skill}
              className={`recommendation-card ${selectedSkill === rec.skill ? 'selected' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSkillClick(rec.skill)}
            >
              <div className="rec-header">
                <div className="rec-rank">#{index + 1}</div>
                <div className="rec-info">
                  <h3 className="rec-skill">{rec.skill}</h3>
                  <span className="rec-category">{rec.metadata.category}</span>
                </div>
                {rec.metadata.is_required && (
                  <span className="rec-badge required">Required</span>
                )}
              </div>

              <div className="rec-scores">
                <div className="score-item">
                  <span className="score-label">Expected Reward</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${rec.expected_reward * 100}%` }}
                    />
                  </div>
                  <span className="score-value">{(rec.expected_reward * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="rec-objectives">
                <div className="objective">
                  <span className="obj-icon">🎯</span>
                  <span className="obj-label">Career</span>
                  <span className="obj-value">{(rec.objectives.career_readiness * 100).toFixed(0)}%</span>
                </div>
                <div className="objective">
                  <span className="obj-icon">⚡</span>
                  <span className="obj-label">Time</span>
                  <span className="obj-value">{(rec.objectives.time_efficiency * 100).toFixed(0)}%</span>
                </div>
                <div className="objective">
                  <span className="obj-icon">📊</span>
                  <span className="obj-label">Match</span>
                  <span className="obj-value">{(rec.objectives.difficulty_match * 100).toFixed(0)}%</span>
                </div>
                <div className="objective">
                  <span className="obj-icon">💼</span>
                  <span className="obj-label">Demand</span>
                  <span className="obj-value">{(rec.objectives.market_demand * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="rec-metadata">
                <span className="meta-item">
                  ⏱️ {rec.metadata.learning_time}h
                </span>
                <span className="meta-item">
                  📈 Difficulty: {(rec.metadata.difficulty * 10).toFixed(1)}/10
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {explanation && selectedSkill && (
          <motion.div
            className="explanation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedSkill(null);
              setExplanation(null);
            }}
          >
            <motion.div
              className="explanation-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Why {explanation.skill}?</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setSelectedSkill(null);
                    setExplanation(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="explanation-score">
                  <div className="score-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" className="score-bg" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        className="score-progress"
                        style={{
                          strokeDasharray: `${explanation.total_reward * 283} 283`
                        }}
                      />
                    </svg>
                    <div className="score-text">
                      {(explanation.total_reward * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="explanation-text">{explanation.explanation}</p>
                </div>

                <div className="objectives-breakdown">
                  <h4>Multi-Objective Breakdown</h4>
                  {Object.entries(explanation.objectives).map(([key, obj]) => (
                    <div key={key} className="objective-detail">
                      <div className="obj-detail-header">
                        <span className="obj-detail-name">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="obj-detail-score">
                          {(obj.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="obj-detail-bar">
                        <div 
                          className="obj-detail-fill"
                          style={{ width: `${obj.score * 100}%` }}
                        />
                      </div>
                      <p className="obj-detail-desc">{obj.description}</p>
                      <span className="obj-detail-weight">Weight: {(obj.weight * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>

                <div className="skill-metadata-detail">
                  <h4>Skill Details</h4>
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="meta-label">Learning Time</span>
                      <span className="meta-value">{explanation.metadata.learning_time} hours</span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-label">Difficulty</span>
                      <span className="meta-value">{(explanation.metadata.difficulty * 10).toFixed(1)}/10</span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{explanation.metadata.category}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="meta-label">Required</span>
                      <span className="meta-value">
                        {explanation.metadata.is_required_for_role ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => handleSkip(selectedSkill)}
                >
                  Skip
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => handleStartLearning(selectedSkill)}
                >
                  Start Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="linucb-footer">
        <button onClick={fetchRecommendations} className="btn-refresh">
          🔄 Refresh Recommendations
        </button>
        <p className="linucb-info">
          Powered by LinUCB • Learns from your interactions
        </p>
      </div>
    </div>
  );
};

export default LinUCBRecommendations;
