import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';
import '../styles/RoadmapNode.css';

const RoadmapNode = ({ data, id }) => {
  const { completeNode, uncompleteNode, currentRoadmap } = useRoadmapStore();

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
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <motion.div
        className={`roadmap-node ${data.isCompleted ? 'completed' : ''} ${data.isRecommended ? 'recommended' : ''}`}

        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ duration: 0.2 }}
        style={{
          '--level-color': levelColor.bg,
          '--level-glow': levelColor.glow
        }}
      >
        {data.isCompleted && (
          <div className="completion-badge">
            ✓
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
