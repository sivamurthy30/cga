import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import RoadmapNode from './RoadmapNode';
import useRoadmapStore from '../../store/roadmapStore';
import '../../styles/RoadmapCanvas.css';

const nodeTypes = {
  custom: RoadmapNode
};

const RoadmapCanvas = ({ roadmapData, getTrend, getSalaryPremium, radarLoaded }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const { isNodeCompleted, getRecommendedNodes, completedNodes } = useRoadmapStore();

  useEffect(() => {
    if (roadmapData) {
      
      // Transform nodes with completion status + market radar
      const transformedNodes = roadmapData.nodes.map(node => {
        const title = node.data?.title || node.title || 'Untitled';
        const trend = getTrend ? getTrend(title) : null;
        const salaryPremium = getSalaryPremium ? getSalaryPremium(title) : 0;

        const nodeData = {
          title,
          description: node.data?.description || node.description || 'No description',
          learningTime: node.data?.learningTime || '2-3 hours',
          level: node.data?.level || node.level || 'beginner',
          resources: node.data?.resources || node.link || `/resources/${node.id}`,
          isCompleted: isNodeCompleted(roadmapData.slug, node.id),
          isRecommended: false,
          trend,
          salaryPremium,
        };
        
        return {
          id: node.id,
          type: 'custom',
          position: node.position || { x: 0, y: 0 },
          data: nodeData
        };
      });
      
      // Get recommended nodes
      const recommended = getRecommendedNodes(
        roadmapData.slug,
        transformedNodes,
        roadmapData.edges
      );
      
      // Mark recommended nodes
      const recommendedIds = new Set(recommended.map(n => n.id));
      transformedNodes.forEach(node => {
        if (recommendedIds.has(node.id)) {
          node.data.isRecommended = true;
        }
      });
      
      setNodes(transformedNodes);
      
      // Transform edges with styling
      const transformedEdges = (roadmapData.edges || []).map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8'
        }
      }));
      
      setEdges(transformedEdges);
    }
  }, [roadmapData, completedNodes, getTrend, getSalaryPremium, isNodeCompleted, getRecommendedNodes, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="roadmap-canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="var(--border-secondary)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isCompleted) return '#10b981';
            if (node.data?.isRecommended) return '#f59e0b';
            return '#94a3b8';
          }}
          maskColor="rgba(0,0,0,0.3)"
        />
      </ReactFlow>
    </div>
  );
};

export default RoadmapCanvas;
