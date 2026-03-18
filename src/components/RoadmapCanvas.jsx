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
import useRoadmapStore from '../store/roadmapStore';
import '../styles/RoadmapCanvas.css';

const nodeTypes = {
  custom: RoadmapNode
};

const RoadmapCanvas = ({ roadmapData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const { isNodeCompleted, getRecommendedNodes } = useRoadmapStore();

  useEffect(() => {
    if (roadmapData) {
      // Transform nodes with completion status
      const transformedNodes = roadmapData.nodes.map(node => {
        // Ensure node has proper structure
        const nodeData = {
          title: node.data?.title || node.title || 'Untitled',
          description: node.data?.description || node.description || 'No description',
          learningTime: node.data?.learningTime || '2-3 hours',
          level: node.data?.level || node.level || 'beginner',
          resources: node.data?.resources || node.link || `/resources/${node.id}`,
          isCompleted: isNodeCompleted(roadmapData.slug, node.id),
          isRecommended: false
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
        style: { stroke: '#475569', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#475569'
        }
      }));
      
      setEdges(transformedEdges);
    }
  }, [roadmapData, isNodeCompleted, getRecommendedNodes, setNodes, setEdges]);

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
          color="#334155"
          style={{ backgroundColor: '#0f172a' }}
        />
        <Controls
          style={{
            button: {
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderColor: '#334155'
            }
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isCompleted) return '#10b981';
            if (node.data.isRecommended) return '#f59e0b';
            return '#475569';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          style={{
            backgroundColor: '#1e293b',
            border: '2px solid #334155'
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default RoadmapCanvas;
