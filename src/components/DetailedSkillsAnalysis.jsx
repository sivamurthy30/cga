import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/DetailedSkillsAnalysis.css';

const DetailedSkillsAnalysis = ({ skills, targetRole, onNext, onBack }) => {
  const [analyzedSkills, setAnalyzedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate skill analysis
    setTimeout(() => {
      const analyzed = analyzeSkills(skills, targetRole);
      setAnalyzedSkills(analyzed);
      setLoading(false);
    }, 1500);
  }, [skills, targetRole]);

  const analyzeSkills = (userSkills, role) => {
    // Mock skill analysis with detailed data
    const skillDatabase = {
      'JavaScript': {
        proficiency: 100,
        level: 'Expert',
        status: 'Mastered',
        icon: '🟢',
        color: '#10b981',
        achievements: [
          'ES6+ Features Mastered',
          'Async Programming Expert',
          'Ready for Framework Learning'
        ],
        interviewChecklist: [
          { item: 'Closures and Scope', checked: true },
          { item: 'Promises and Async/Await', checked: true },
          { item: 'Event Loop', checked: true },
          { item: 'Prototypes', checked: true }
        ],
        recommendedResources: [
          { type: 'Course', name: 'Advanced JavaScript Patterns', platform: 'Frontend Masters', difficulty: 'Advanced' },
          { type: 'Book', name: 'You Don\'t Know JS', platform: 'GitHub', difficulty: 'Intermediate' },
          { type: 'Practice', name: 'JavaScript Algorithms', platform: 'LeetCode', difficulty: 'Medium' }
        ],
        nextSteps: [
          'Learn TypeScript for type safety',
          'Master React.js framework',
          'Study design patterns'
        ],
        marketDemand: 'Very High',
        avgSalary: '$95,000 - $140,000',
        jobOpenings: '50,000+'
      },
      'Python': {
        proficiency: 100,
        level: 'Expert',
        status: 'Mastered',
        icon: '🟢',
        color: '#10b981',
        achievements: [
          'Data Structures Mastered',
          'OOP Concepts Clear',
          'Ready for Advanced Topics'
        ],
        interviewChecklist: [
          { item: 'List Comprehensions', checked: true },
          { item: 'Decorators', checked: true },
          { item: 'Generators', checked: true },
          { item: 'Context Managers', checked: true }
        ],
        recommendedResources: [
          { type: 'Course', name: 'Python for Data Science', platform: 'Coursera', difficulty: 'Intermediate' },
          { type: 'Book', name: 'Fluent Python', platform: 'O\'Reilly', difficulty: 'Advanced' },
          { type: 'Practice', name: 'Python Challenges', platform: 'HackerRank', difficulty: 'Medium' }
        ],
        nextSteps: [
          'Learn Django or Flask',
          'Study data science libraries',
          'Master async programming'
        ],
        marketDemand: 'Very High',
        avgSalary: '$90,000 - $135,000',
        jobOpenings: '45,000+'
      },
      'React': {
        proficiency: 100,
        level: 'Expert',
        status: 'Mastered',
        icon: '🟢',
        color: '#10b981',
        achievements: [
          'Hooks Mastered',
          'State Management Expert',
          'Performance Optimization Ready'
        ],
        interviewChecklist: [
          { item: 'Component Lifecycle', checked: true },
          { item: 'Hooks (useState, useEffect)', checked: true },
          { item: 'Context API', checked: true },
          { item: 'Performance Optimization', checked: true }
        ],
        recommendedResources: [
          { type: 'Course', name: 'Advanced React Patterns', platform: 'Epic React', difficulty: 'Advanced' },
          { type: 'Documentation', name: 'React Official Docs', platform: 'React.dev', difficulty: 'All Levels' },
          { type: 'Practice', name: 'Build Real Projects', platform: 'Frontend Mentor', difficulty: 'Intermediate' }
        ],
        nextSteps: [
          'Learn Next.js for SSR',
          'Master Redux or Zustand',
          'Study React Native'
        ],
        marketDemand: 'Extremely High',
        avgSalary: '$100,000 - $150,000',
        jobOpenings: '60,000+'
      }
    };

    return userSkills.map(skill => {
      const skillData = skillDatabase[skill] || {
        proficiency: Math.floor(Math.random() * 40) + 30,
        level: 'Learning',
        status: 'In Progress',
        icon: '🟡',
        color: '#f59e0b',
        achievements: ['Getting Started'],
        interviewChecklist: [
          { item: 'Basic Concepts', checked: false },
          { item: 'Intermediate Topics', checked: false }
        ],
        recommendedResources: [
          { type: 'Course', name: `Learn ${skill}`, platform: 'Udemy', difficulty: 'Beginner' }
        ],
        nextSteps: [`Master ${skill} fundamentals`],
        marketDemand: 'High',
        avgSalary: '$70,000 - $110,000',
        jobOpenings: '10,000+'
      };

      return {
        name: skill,
        ...skillData
      };
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Mastered': '#10b981',
      'In Progress': '#f59e0b',
      'Needs Work': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="detailed-analysis-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          ⚙️
        </motion.div>
        <h3>Analyzing Your Skills...</h3>
        <p>Generating personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="detailed-skills-analysis">
      {/* Progress Steps */}
      <div className="progress-steps">
        <div className="step completed">
          <div className="step-number">✓</div>
          <span>Overview</span>
        </div>
        <div className="step active">
          <div className="step-number">2</div>
          <span>Skills Analysis</span>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <span>Learning Roadmap</span>
        </div>
        <div className="step">
          <div className="step-number">4</div>
          <span>Action Plan</span>
        </div>
      </div>

      {/* Header */}
      <motion.div
        className="analysis-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Detailed Skills Analysis</h2>
        <p>Deep dive into each skill with personalized recommendations</p>
      </motion.div>

      {/* Skills Grid */}
      <div className="skills-grid-detailed">
        {analyzedSkills.map((skill, index) => (
          <motion.div
            key={skill.name}
            className="skill-card-detailed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedSkill(skill)}
          >
            <div className="skill-card-header">
              <div className="skill-title-section">
                <span className="skill-icon">{skill.icon}</span>
                <h3>{skill.name}</h3>
              </div>
              <div className="proficiency-badge" style={{ background: skill.color }}>
                {skill.proficiency}%
              </div>
            </div>

            <div className="skill-progress-bar">
              <motion.div
                className="progress-fill"
                style={{ background: skill.color }}
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>

            <div className="skill-status">
              <span className="status-badge" style={{ background: getStatusColor(skill.status) }}>
                {skill.status}
              </span>
              <span className="skill-level">{skill.level}</span>
            </div>

            <div className="skill-achievements">
              <h4>🏆 Achievements</h4>
              <ul>
                {skill.achievements.slice(0, 2).map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            </div>

            <div className="skill-market-info">
              <div className="market-stat">
                <span className="stat-label">Market Demand</span>
                <span className="stat-value">{skill.marketDemand}</span>
              </div>
              <div className="market-stat">
                <span className="stat-label">Avg Salary</span>
                <span className="stat-value">{skill.avgSalary}</span>
              </div>
            </div>

            <button className="view-details-btn">
              View Full Analysis →
            </button>
          </motion.div>
        ))}
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className="skill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              className="skill-modal-content"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedSkill(null)}>
                ✕
              </button>

              <div className="modal-header">
                <div className="modal-title-section">
                  <span className="modal-icon">{selectedSkill.icon}</span>
                  <div>
                    <h2>{selectedSkill.name}</h2>
                    <p className="modal-subtitle">{selectedSkill.level} Level</p>
                  </div>
                </div>
                <div className="modal-proficiency">
                  <div className="circular-progress">
                    <svg width="120" height="120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={selectedSkill.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={339.292}
                        initial={{ strokeDashoffset: 339.292 }}
                        animate={{ strokeDashoffset: 339.292 - (339.292 * selectedSkill.proficiency) / 100 }}
                        transition={{ duration: 1 }}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="progress-text">
                      <span className="progress-number">{selectedSkill.proficiency}%</span>
                      <span className="progress-label">Proficiency</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-body">
                {/* Interview Checklist */}
                <div className="modal-section">
                  <h3>📋 Interview Readiness Checklist</h3>
                  <div className="checklist">
                    {selectedSkill.interviewChecklist.map((item, i) => (
                      <div key={i} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                        <span className="checkbox">{item.checked ? '✓' : '○'}</span>
                        <span>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Resources */}
                <div className="modal-section">
                  <h3>📚 Recommended Resources</h3>
                  <div className="resources-list">
                    {selectedSkill.recommendedResources.map((resource, i) => (
                      <div key={i} className="resource-card">
                        <div className="resource-type">{resource.type}</div>
                        <div className="resource-info">
                          <h4>{resource.name}</h4>
                          <p>{resource.platform}</p>
                        </div>
                        <span className={`difficulty-badge ${resource.difficulty.toLowerCase()}`}>
                          {resource.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="modal-section">
                  <h3>🎯 Next Steps</h3>
                  <div className="next-steps-list">
                    {selectedSkill.nextSteps.map((step, i) => (
                      <div key={i} className="next-step-item">
                        <span className="step-number">{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Info */}
                <div className="modal-section market-info-section">
                  <h3>💼 Market Information</h3>
                  <div className="market-info-grid">
                    <div className="market-info-card">
                      <span className="info-icon">📈</span>
                      <div>
                        <p className="info-label">Market Demand</p>
                        <p className="info-value">{selectedSkill.marketDemand}</p>
                      </div>
                    </div>
                    <div className="market-info-card">
                      <span className="info-icon">💰</span>
                      <div>
                        <p className="info-label">Average Salary</p>
                        <p className="info-value">{selectedSkill.avgSalary}</p>
                      </div>
                    </div>
                    <div className="market-info-card">
                      <span className="info-icon">💼</span>
                      <div>
                        <p className="info-label">Job Openings</p>
                        <p className="info-value">{selectedSkill.jobOpenings}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="analysis-navigation">
        <button className="nav-btn secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="nav-btn primary" onClick={onNext}>
          Continue to Roadmap →
        </button>
      </div>
    </div>
  );
};

export default DetailedSkillsAnalysis;
