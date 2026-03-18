import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoadmapCanvas from '../components/RoadmapCanvas';
import useRoadmapStore from '../store/roadmapStore';
import '../styles/RoadmapPage.css';

const RoadmapPage = ({ learnerProfile, currentUser, onLogout }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const {
    currentRoadmap,
    setCurrentRoadmap,
    getCompletionPercentage,
    totalXP,
    streak,
    badges
  } = useRoadmapStore();

  const roadmaps = [
    { id: 'frontend-developer', name: 'Frontend Developer', icon: '🎨' },
    { id: 'backend-developer', name: 'Backend Developer', icon: '⚙️' },
    { id: 'fullstack-developer', name: 'Full Stack Developer', icon: '🚀' },
    { id: 'devops-engineer', name: 'DevOps Engineer', icon: '🔧' },
    { id: 'ai-ml-engineer', name: 'AI/ML Engineer', icon: '🤖' },
    { id: 'data-engineer', name: 'Data Engineer', icon: '📊' },
    { id: 'mobile-developer', name: 'Mobile Developer', icon: '📱' },
    { id: 'system-design', name: 'System Design', icon: '🏗️' }
  ];

  useEffect(() => {
    fetchRoadmapData(currentRoadmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoadmap]);

  const fetchRoadmapData = async (roadmapId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/roadmap/complete`);
      const data = await response.json();

      if (!data.error) {
        const transformedNodes = (data.nodes || []).map(node => ({
          id: node.id,
          type: 'custom',
          position: node.position || { x: 0, y: 0 },
          data: {
            title: node.title || node.data?.title || 'Untitled',
            description: node.description || node.data?.description || 'No description',
            learningTime: node.data?.learningTime || '2-3 hours',
            level: node.level || node.data?.level || 'beginner',
            resources: node.link || node.data?.link || `/resources/${node.id}`,
            subtopics: node.data?.subtopics || [],
            tools: node.data?.tools || [],
            isCompleted: false,
            isRecommended: false
          }
        }));

        setRoadmapData({
          title: roadmaps.find(r => r.id === roadmapId)?.name || 'Learning Roadmap',
          slug: roadmapId,
          description: 'Complete roadmap for modern development',
          nodes: transformedNodes,
          edges: data.edges || [],
          totalNodes: transformedNodes.length
        });
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = roadmapData?.nodes.filter(node => {
    const matchesSearch = node.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.data.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || node.data.level === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const completionPercentage = roadmapData
    ? getCompletionPercentage(currentRoadmap, roadmapData.totalNodes)
    : 0;

  if (loading) {
    return (
      <div className="roadmap-loading">
        <motion.div
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          🗺️
        </motion.div>
        <h3>Loading Roadmap...</h3>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      {/* Top Navigation Bar */}
      <div className="roadmap-navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">DEV<sup>A</sup></h1>

          <select
            className="roadmap-selector"
            value={currentRoadmap}
            onChange={(e) => setCurrentRoadmap(e.target.value)}
          >
            {roadmaps.map(rm => (
              <option key={rm.id} value={rm.id}>
                {rm.icon} {rm.name}
              </option>
            ))}
          </select>
        </div>

        <div className="navbar-center">
          <input
            type="text"
            className="search-input"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="difficulty-filter">
            {['all', 'foundation', 'beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`filter-btn ${difficultyFilter === level ? 'active' : ''}`}
                onClick={() => setDifficultyFilter(level)}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{totalXP} XP</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value">{streak} day streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <span className="stat-value">{badges.length} badges</span>
            </div>
          </div>

          {learnerProfile && (
            <div className="user-role-badge">
              🎯 {learnerProfile.targetRole}
            </div>
          )}

          <div className="user-menu">
            {currentUser && (
              <span className="user-name-label">
                {currentUser.name || currentUser.email}
              </span>
            )}
            {onLogout && (
              <button className="logout-btn" onClick={onLogout} title="Logout">
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-info">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-percentage">{completionPercentage}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Roadmap Canvas */}
      {roadmapData && roadmapData.nodes.length > 0 ? (
        <RoadmapCanvas
          roadmapData={{
            ...roadmapData,
            nodes: filteredNodes || roadmapData.nodes
          }}
        />
      ) : (
        <div className="roadmap-empty">
          <div className="empty-icon">🗺️</div>
          <h3>No roadmap data available</h3>
          <p>The roadmap data could not be loaded. Please try selecting a different path.</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
