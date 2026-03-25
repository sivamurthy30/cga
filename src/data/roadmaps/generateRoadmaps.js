// Run: node src/data/roadmaps/generateRoadmaps.js

const fs = require('fs');
const path = require('path');

// Helper to generate positions in a vertical flow
const generatePosition = (index, level, branchIndex = 0) => {
  const levelY = {
    'foundation': 100,
    'beginner': 500,
    'intermediate': 1200,
    'advanced': 2000,
    'expert': 2800
  };
  
  const baseY = levelY[level] || 100;
  const x = 400 + (branchIndex * 350);
  const y = baseY + (index * 180);
  
  return { x, y };
};

// Generate Frontend Roadmap (120+ nodes)
const generateFrontendRoadmap = () => {
  const nodes = [];
  const edges = [];
  let nodeIndex = 0;
  
  // Foundation Level (15 nodes)
  const foundationTopics = [
    { id: 'internet-basics', title: 'How the Internet Works', desc: 'HTTP, DNS, browsers', time: '3-4 hours' },
    { id: 'html-basics', title: 'HTML Fundamentals', desc: 'Structure, semantic elements', time: '4-6 hours' },
    { id: 'html-forms', title: 'HTML Forms', desc: 'Input types, validation', time: '2-3 hours' },
    { id: 'html-accessibility', title: 'HTML Accessibility', desc: 'ARIA, semantic HTML', time: '3-4 hours' },
    { id: 'css-basics', title: 'CSS Fundamentals', desc: 'Selectors, box model', time: '5-7 hours' },
    { id: 'css-layouts', title: 'CSS Layouts', desc: 'Flexbox, Grid', time: '6-8 hours' },
    { id: 'css-responsive', title: 'Responsive Design', desc: 'Media queries, mobile-first', time: '4-5 hours' },
    { id: 'css-animations', title: 'CSS Animations', desc: 'Transitions, keyframes', time: '3-4 hours' },
    { id: 'css-preprocessors', title: 'CSS Preprocessors', desc: 'Sass, Less', time: '4-5 hours' },
    { id: 'js-basics', title: 'JavaScript Basics', desc: 'Variables, data types, functions', time: '8-10 hours' },
    { id: 'js-dom', title: 'DOM Manipulation', desc: 'Selecting, modifying elements', time: '5-6 hours' },
    { id: 'js-events', title: 'Event Handling', desc: 'Event listeners, delegation', time: '4-5 hours' },
    { id: 'js-async', title: 'Async JavaScript', desc: 'Promises, async/await', time: '6-8 hours' },
    { id: 'js-fetch', title: 'Fetch API', desc: 'HTTP requests, REST APIs', time: '4-5 hours' },
    { id: 'js-es6', title: 'ES6+ Features', desc: 'Arrow functions, destructuring', time: '5-6 hours' }
  ];
  
  foundationTopics.forEach((topic, i) => {
    nodes.push({
      id: topic.id,
      type: 'custom',
      data: {
        title: topic.title,
        description: topic.desc,
        learningTime: topic.time,
        level: 'foundation',
        resources: `/resources/${topic.id}`
      },
      position: generatePosition(i, 'foundation')
    });
    
    if (i > 0) {
      edges.push({
        id: `e-foundation-${i}`,
        source: foundationTopics[i - 1].id,
        target: topic.id,
        animated: true
      });
    }
  });
  
  // Continue with more levels...
  // This is a template - full implementation would have 120+ nodes
  
  return {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    description: 'Complete roadmap for modern frontend development',
    nodes,
    edges,
    totalNodes: nodes.length
  };
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateFrontendRoadmap };
}
