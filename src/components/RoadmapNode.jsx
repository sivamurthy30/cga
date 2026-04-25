import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';
import '../styles/RoadmapNode.css';

const RoadmapNode = ({ data, id }) => {
  const { completeNode, uncompleteNode, currentRoadmap } = useRoadmapStore();

  // Market Radar: trend tier passed via data.trend
  const trend = data.trend || null;
  const salaryPremium = data.salaryPremium || 0;

  const TREND_GLOW = {
    hot: '0 0 18px rgba(239,68,68,0.6), 0 0 36px rgba(239,68,68,0.25)',
    rising: '0 0 18px rgba(245,158,11,0.6), 0 0 36px rgba(245,158,11,0.25)',
  };

  const getLevelColor = (level) => {
    const colors = {
      'foundation': { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
      'beginner': { bg: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
      'intermediate': { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
      'advanced': { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
      'expert': { bg: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }
    };
    return colors[level] || colors.beginner;
  };

  const levelColor = getLevelColor(data.level);

  const handleClick = (e) => {
    e.stopPropagation();
    if (data.resources) {
      // Open resources in new tab
      window.open(data.resources, '_blank');
    }
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    if (data.isCompleted) {
      uncompleteNode(currentRoadmap, id);
    } else {
      completeNode(currentRoadmap, id);
      // Prompt user to add skill to resume
      if (data.title) {
        const key = `resume_notif_${id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          setTimeout(() => {
            const add = window.confirm(
              `🎉 "${data.title}" completed!\n\nWould you like to add this skill to your AI Resume?`
            );
            if (add) window.location.hash = '#resume-builder';
          }, 600);
        }
      }
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <motion.div
        className={`roadmap-node ${data.isCompleted ? 'completed' : ''} ${data.isRecommended ? 'recommended' : ''} ${trend ? `trend-${trend}` : ''}`}
        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.2 }}
        style={{
          '--level-color': levelColor.bg,
          '--level-glow': levelColor.glow,
          ...(trend && TREND_GLOW[trend] ? { boxShadow: TREND_GLOW[trend] } : {}),
        }}
      >
        {/* Market Radar badge */}
        {trend === 'hot' && (
          <div style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, zIndex: 10 }}>
            🔥 HOT
          </div>
        )}
        {trend === 'rising' && (
          <div style={{ position: 'absolute', top: -8, right: -8, background: '#f59e0b', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, zIndex: 10 }}>
            📈 RISING
          </div>
        )}
        {salaryPremium > 0 && (
          <div style={{ position: 'absolute', top: -8, left: -8, background: '#10b981', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, zIndex: 10 }}>
            +{salaryPremium}% 💰
          </div>
        )}
        
        {data.isRecommended && !data.isCompleted && (
          <div className="node-recommended-badge">
            ⭐
          </div>
        )}
        
        <div className="node-header">
          <span className="level-badge" style={{ background: levelColor.bg }}>
            {data.level}
          </span>
        </div>
        
        <h3 className="node-title">{data.title}</h3>
        
        <p className="node-description">{data.description}</p>
        
        <div className="node-footer">
          <span className="learning-time">⏱️ {data.learningTime}</span>
          <button
            className="complete-btn"
            onClick={handleComplete}
            title={data.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {data.isCompleted ? '✓' : '○'}
          </button>
        </div>
      </motion.div>


      
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default memo(RoadmapNode);
