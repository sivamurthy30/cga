import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoadmapCanvas from '../components/RoadmapCanvas';
import useRoadmapStore from '../store/roadmapStore';
import Navigation from '../components/Navigation';
import '../styles/RoadmapPage.css';

const RoadmapPage = ({ learnerProfile, currentUser, onLogout, theme, toggleTheme, fontSize, cycleFontSize }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [availableRoadmaps, setAvailableRoadmaps] = useState([]);

  const {
    currentRoadmap,
    setCurrentRoadmap,
    getCompletionPercentage,
    totalXP,
    streak,
    badges
  } = useRoadmapStore();

  // Default roadmaps (fallback if API fails)
  const defaultRoadmaps = [
    { id: 'frontend-developer', name: 'Frontend Developer', icon: '🎨' },
    { id: 'backend-developer', name: 'Backend Developer', icon: '⚙️' },
    { id: 'fullstack-developer', name: 'Full Stack Developer', icon: '🚀' },
    { id: 'devops-engineer', name: 'DevOps Engineer', icon: '🔧' },
    { id: 'ai-ml-engineer', name: 'AI/ML Engineer', icon: '🤖' },
    { id: 'data-engineer', name: 'Data Engineer', icon: '📊' },
    { id: 'mobile-developer', name: 'Mobile Developer', icon: '📱' },
    { id: 'system-design', name: 'System Design', icon: '🏗️' },
    { id: 'react-developer', name: 'React Developer', icon: '⚛️' },
    { id: 'nodejs-developer', name: 'Node.js Developer', icon: '🟢' },
    { id: 'python-developer', name: 'Python Developer', icon: '🐍' },
    { id: 'java-developer', name: 'Java Developer', icon: '☕' },
    { id: 'go-developer', name: 'Go Developer', icon: '🔵' },
    { id: 'docker', name: 'Docker', icon: '🐳' },
    { id: 'kubernetes', name: 'Kubernetes', icon: '☸️' },
    { id: 'postgresql', name: 'PostgreSQL', icon: '🐘' },
    { id: 'security-engineer', name: 'Security Engineer', icon: '🔒' }
  ];

  // Fetch available roadmaps on mount
  useEffect(() => {
    const fetchAvailableRoadmaps = async () => {
      try {
        const response = await fetch('/api/roadmap/list');
        if (response.ok) {
          const data = await response.json();
          if (data.roadmaps && data.roadmaps.length > 0) {
            setAvailableRoadmaps(data.roadmaps);
          } else {
            setAvailableRoadmaps(defaultRoadmaps);
          }
        } else {
          setAvailableRoadmaps(defaultRoadmaps);
        }
      } catch (error) {
        console.error('Error fetching roadmap list:', error);
        setAvailableRoadmaps(defaultRoadmaps);
      }
    };

    fetchAvailableRoadmaps();
  }, []);

  useEffect(() => {
    fetchRoadmapData(currentRoadmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoadmap]);

  const fetchRoadmapData = async (roadmapId) => {
    setLoading(true);
    try {
      // Fetch specific roadmap by ID
      const response = await fetch(`/api/roadmap/${roadmapId}`);
      
      if (!response.ok) {
        throw new Error(`Roadmap not found: ${roadmapId}`);
      }
      
      const data = await response.json();
      
      if (!data.error && data.nodes) {
        const transformedNodes = (data.nodes || []).map(node => ({
          id: node.id,
          type: 'custom',
          position: node.position || { x: 0, y: 0 },
          data: {
            title: node.data?.title || node.title || 'Untitled',
            description: node.data?.description || node.description || 'No description',
            learningTime: node.data?.learningTime || '2-3 hours',
            level: node.data?.level || node.level || 'beginner',
            resources: node.data?.resources || node.link || `/resources/${node.id}`,
            subtopics: node.data?.subtopics || [],
            tools: node.data?.tools || [],
            isCompleted: false,
            isRecommended: false
          }
        }));

        const roadmapInfo = availableRoadmaps.find(r => r.id === roadmapId) || 
                           defaultRoadmaps.find(r => r.id === roadmapId) ||
                           { name: 'Learning Roadmap', icon: '🗺️' };

        setRoadmapData({
          title: data.name || roadmapInfo.name,
          slug: roadmapId,
          description: data.description || `Complete roadmap for ${roadmapInfo.name}`,
          nodes: transformedNodes,
          edges: data.edges || [],
          totalNodes: transformedNodes.length
        });
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      
      const roadmapInfo = availableRoadmaps.find(r => r.id === roadmapId) || 
                         defaultRoadmaps.find(r => r.id === roadmapId) ||
                         { name: 'Learning Roadmap', icon: '🗺️' };
      
      // Show message that roadmap is not available
      setRoadmapData({
        title: roadmapInfo.name,
        slug: roadmapId,
        description: `Roadmap for ${roadmapInfo.name} - Coming Soon`,
        nodes: [],
        edges: [],
        totalNodes: 0
      });
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
      {/* Navigation */}
      <Navigation
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage="roadmap"
      />

      {/* Roadmap Controls Bar */}
      <div className="roadmap-controls-bar">
        <div className="controls-left">
          <select
            className="roadmap-selector"
            value={currentRoadmap}
            onChange={(e) => setCurrentRoadmap(e.target.value)}
          >
            {(availableRoadmaps.length > 0 ? availableRoadmaps : defaultRoadmaps).map(rm => (
              <option key={rm.id} value={rm.id}>
                {rm.icon} {rm.name}
              </option>
            ))}
          </select>
        </div>

        <div className="controls-center">
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

        <div className="controls-right">
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{totalXP} XP</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value">{streak} d</span>
            </div>
          </div>

          {learnerProfile && (
            <div className="user-role-badge">
              🎯 {learnerProfile.targetRole}
            </div>
          )}
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
