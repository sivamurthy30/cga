import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/DetailedSkillsAnalysis.css';

const LearningRoadmapVisualization = ({ learnerProfile }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  useEffect(() => {
    // Mark user's known skills as completed
    if (learnerProfile?.knownSkills && roadmapData?.nodes) {
      const completed = new Set();
      
      learnerProfile.knownSkills.forEach(userSkill => {
        const userSkillLower = userSkill.toLowerCase().trim();
        
        roadmapData.nodes.forEach(node => {
          const nodeTitleLower = node.title.toLowerCase().trim();
          
          if (nodeTitleLower.includes(userSkillLower) || userSkillLower.includes(nodeTitleLower)) {
            completed.add(node.id);
          }
        });
      });
      
      setCompletedNodes(completed);
    }
  }, [learnerProfile?.knownSkills, roadmapData?.nodes]);

  const fetchRoadmapData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/roadmap/complete');
      const data = await response.json();
      
      if (data.error) {
        console.error('Roadmap error:', data.error);
      } else {
        setRoadmapData(data);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setShowModal(true);
  };

  const toggleNodeCompletion = (nodeId) => {
    const newCompleted = new Set(completedNodes);
    if (newCompleted.has(nodeId)) {
      newCompleted.delete(nodeId);
    } else {
      newCompleted.add(nodeId);
    }
    setCompletedNodes(newCompleted);
  };

  const getCompletionPercentage = () => {
    if (!roadmapData?.nodes) return 0;
    return Math.round((completedNodes.size / roadmapData.nodes.length) * 100);
  };

  const getLevelColor = (level) => {
    const colors = {
      'foundation': '#3b82f6',
      'beginner': '#9c27b0',
      'intermediate': '#ff9800',
      'advanced': '#f44336'
    };
    return colors[level] || '#64748b';
  };

  const getLevelLabel = (level) => {
    const labels = {
      'foundation': 'Foundation',
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return labels[level] || level;
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
        <h3>Loading Interactive Roadmap...</h3>
        <p>Preparing your personalized learning path</p>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="detailed-analysis-loading">
        <h3>Roadmap Not Available</h3>
        <p>Could not load roadmap data</p>
      </div>
    );
  }

  // Group nodes by level
  const nodesByLevel = roadmapData.nodes.reduce((acc, node) => {
    if (!acc[node.level]) {
      acc[node.level] = [];
    }
    acc[node.level].push(node);
    return acc;
  }, {});

  const levelOrder = ['foundation', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="detailed-skills-analysis">
      {/* Progress Steps */}
      <div className="progress-steps">
        <div className="step completed">
          <div className="step-number">✓</div>
          <span>Overview</span>
        </div>
        <div className="step completed">
          <div className="step-number">✓</div>
          <span>Skills Analysis</span>
        </div>
        <div className="step active">
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
        <h2>🗺️ Interactive Learning Roadmap</h2>
        <p>Your personalized path to becoming a {learnerProfile?.targetRole || 'Frontend Developer'}</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="modal-section" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>📊 Your Progress</h3>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
            {getCompletionPercentage()}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: '6px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${getCompletionPercentage()}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p style={{ marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
          {completedNodes.size} of {roadmapData.nodes.length} topics completed
        </p>
      </div>

      {/* Roadmap Visualization */}
      <div className="roadmap-visualization">
        {levelOrder.map((level, levelIndex) => {
          const nodes = nodesByLevel[level];
          if (!nodes || nodes.length === 0) return null;

          return (
            <motion.div
              key={level}
              className="roadmap-level"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: levelIndex * 0.1 }}
              style={{
                marginBottom: '3rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '40px',
                  background: getLevelColor(level),
                  borderRadius: '4px'
                }} />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: getLevelColor(level),
                  margin: 0
                }}>
                  {getLevelLabel(level)}
                </h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  {nodes.filter(n => completedNodes.has(n.id)).length}/{nodes.length}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {nodes.map((node, index) => {
                  const isCompleted = completedNodes.has(node.id);
                  
                  return (
                    <motion.div
                      key={node.id}
                      className="roadmap-node-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNodeClick(node)}
                      style={{
                        background: isCompleted 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      {isCompleted && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          width: '32px',
                          height: '32px',
                          background: '#10b981',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700
                        }}>
                          ✓
                        </div>
                      )}
                      
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        marginBottom: '0.75rem',
                        color: '#ffffff',
                        paddingRight: isCompleted ? '2.5rem' : 0
                      }}>
                        {node.title}
                      </h4>
                      
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '1rem',
                        lineHeight: 1.5
                      }}>
                        {node.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        {node.data.subtopics?.slice(0, 3).map((subtopic, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.8)'
                            }}
                          >
                            {subtopic}
                          </span>
                        ))}
                        {node.data.subtopics?.length > 3 && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}>
                            +{node.data.subtopics.length - 3} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {showModal && selectedNode && (
          <motion.div
            className="skill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="skill-modal-content"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>

              <div className="modal-header">
                <div className="modal-title-section">
                  <div>
                    <h2>{selectedNode.title}</h2>
                    <p className="modal-subtitle">{getLevelLabel(selectedNode.level)} Level</p>
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  background: completedNodes.has(selectedNode.id) 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {completedNodes.has(selectedNode.id) ? '✓' : '○'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {completedNodes.has(selectedNode.id) ? 'Completed' : 'Not Started'}
                  </div>
                </div>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <h3>📝 Description</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                    {selectedNode.description}
                  </p>
                </div>

                {selectedNode.data.subtopics && selectedNode.data.subtopics.length > 0 && (
                  <div className="modal-section">
                    <h3>📚 Topics to Learn</h3>
                    <div className="checklist">
                      {selectedNode.data.subtopics.map((subtopic, i) => (
                        <div key={i} className="checklist-item">
                          <span className="checkbox">○</span>
                          <span>{subtopic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data.tools && selectedNode.data.tools.length > 0 && (
                  <div className="modal-section">
                    <h3>🛠️ Tools & Technologies</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {selectedNode.data.tools.map((tool, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#3b82f6',
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-section">
                  <h3>🎯 Action</h3>
                  <button
                    onClick={() => {
                      toggleNodeCompletion(selectedNode.id);
                      setShowModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: completedNodes.has(selectedNode.id)
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {completedNodes.has(selectedNode.id) 
                      ? '↩️ Mark as Incomplete' 
                      : '✓ Mark as Complete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="analysis-navigation">
        <button className="nav-btn secondary" onClick={() => window.history.back()}>
          ← Back
        </button>
        <button className="nav-btn primary" onClick={() => alert('Action plan coming soon!')}>
          Continue to Action Plan →
        </button>
      </div>
    </div>
  );
};

export default LearningRoadmapVisualization;
