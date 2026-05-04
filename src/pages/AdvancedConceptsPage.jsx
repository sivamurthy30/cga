import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AdvancedConceptsPage.css';

const AdvancedConceptsPage = ({ 
  learnerProfile, 
  currentUser, 
  onBack,
  onLogout, 
  theme, 
  toggleTheme,
  initialTopic = null 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialTopic || 'all');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Topics', icon: '🌐' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '⚡' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'backend', name: 'Backend', icon: '⚙️' },
    { id: 'devops', name: 'DevOps', icon: '🔧' },
    { id: 'ml', name: 'Machine Learning', icon: '🤖' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'architecture', name: 'Architecture', icon: '🏗️' }
  ];

  const advancedConcepts = [
    // Python Advanced
    {
      id: 'python-async',
      category: 'python',
      title: 'Async/Await & Concurrency',
      difficulty: 'Advanced',
      icon: '🐍',
      description: 'Master asynchronous programming with asyncio, coroutines, and concurrent execution patterns.',
      topics: ['asyncio', 'coroutines', 'event loops', 'concurrent.futures', 'threading vs async'],
      resources: [
        { type: 'article', title: 'Real Python: Async IO', url: 'https://realpython.com/async-io-python/' },
        { type: 'video', title: 'AsyncIO Tutorial', url: 'https://www.youtube.com/watch?v=t5Bo1Je9EmE' }
      ]
    },
    {
      id: 'python-metaclasses',
      category: 'python',
      title: 'Metaclasses & Descriptors',
      difficulty: 'Expert',
      icon: '🐍',
      description: 'Deep dive into Python\'s object model with metaclasses, descriptors, and class creation.',
      topics: ['metaclasses', 'descriptors', '__new__ vs __init__', 'class decorators', 'ABCs'],
      resources: [
        { type: 'article', title: 'Python Metaclasses', url: 'https://realpython.com/python-metaclasses/' }
      ]
    },

    // JavaScript Advanced
    {
      id: 'js-closures',
      category: 'javascript',
      title: 'Closures & Scope Chain',
      difficulty: 'Advanced',
      icon: '⚡',
      description: 'Understand lexical scope, closures, and how JavaScript manages execution contexts.',
      topics: ['lexical scope', 'closure patterns', 'IIFE', 'module pattern', 'memory leaks'],
      resources: [
        { type: 'article', title: 'MDN: Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures' }
      ]
    },
    {
      id: 'js-event-loop',
      category: 'javascript',
      title: 'Event Loop & Microtasks',
      difficulty: 'Advanced',
      icon: '⚡',
      description: 'Master the JavaScript runtime: call stack, event loop, microtasks, and macrotasks.',
      topics: ['call stack', 'event loop', 'microtasks', 'macrotasks', 'promise queue'],
      resources: [
        { type: 'video', title: 'What the heck is the event loop?', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ' }
      ]
    },

    // React Advanced
    {
      id: 'react-fiber',
      category: 'react',
      title: 'React Fiber Architecture',
      difficulty: 'Expert',
      icon: '⚛️',
      description: 'Understand React\'s reconciliation algorithm and how Fiber enables concurrent rendering.',
      topics: ['fiber reconciliation', 'work units', 'priority scheduling', 'time slicing', 'concurrent mode'],
      resources: [
        { type: 'article', title: 'React Fiber Architecture', url: 'https://github.com/acdlite/react-fiber-architecture' }
      ]
    },
    {
      id: 'react-patterns',
      category: 'react',
      title: 'Advanced React Patterns',
      difficulty: 'Advanced',
      icon: '⚛️',
      description: 'Compound components, render props, HOCs, and custom hooks patterns.',
      topics: ['compound components', 'render props', 'HOCs', 'custom hooks', 'context patterns'],
      resources: [
        { type: 'article', title: 'React Patterns', url: 'https://www.patterns.dev/posts/react-patterns' }
      ]
    },

    // Backend Advanced
    {
      id: 'backend-caching',
      category: 'backend',
      title: 'Caching Strategies',
      difficulty: 'Advanced',
      icon: '⚙️',
      description: 'Redis, CDN, database query caching, and cache invalidation patterns.',
      topics: ['Redis', 'Memcached', 'CDN caching', 'cache invalidation', 'cache-aside pattern'],
      resources: [
        { type: 'article', title: 'Caching Best Practices', url: 'https://aws.amazon.com/caching/best-practices/' }
      ]
    },
    {
      id: 'backend-microservices',
      category: 'backend',
      title: 'Microservices Architecture',
      difficulty: 'Advanced',
      icon: '⚙️',
      description: 'Service decomposition, API gateways, service mesh, and distributed systems.',
      topics: ['service decomposition', 'API gateway', 'service mesh', 'saga pattern', 'event sourcing'],
      resources: [
        { type: 'article', title: 'Microservices Patterns', url: 'https://microservices.io/patterns/' }
      ]
    },

    // DevOps Advanced
    {
      id: 'devops-k8s',
      category: 'devops',
      title: 'Kubernetes Deep Dive',
      difficulty: 'Advanced',
      icon: '🔧',
      description: 'Container orchestration, pods, services, ingress, and cluster management.',
      topics: ['pods', 'services', 'deployments', 'ingress', 'helm', 'operators'],
      resources: [
        { type: 'article', title: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/home/' }
      ]
    },
    {
      id: 'devops-cicd',
      category: 'devops',
      title: 'CI/CD Pipeline Design',
      difficulty: 'Advanced',
      icon: '🔧',
      description: 'Build robust deployment pipelines with testing, security scanning, and rollback strategies.',
      topics: ['pipeline stages', 'blue-green deployment', 'canary releases', 'GitOps', 'ArgoCD'],
      resources: [
        { type: 'article', title: 'CI/CD Best Practices', url: 'https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment' }
      ]
    },

    // ML Advanced
    {
      id: 'ml-transformers',
      category: 'ml',
      title: 'Transformer Architecture',
      difficulty: 'Expert',
      icon: '🤖',
      description: 'Attention mechanisms, BERT, GPT, and modern NLP architectures.',
      topics: ['self-attention', 'multi-head attention', 'positional encoding', 'BERT', 'GPT'],
      resources: [
        { type: 'article', title: 'Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/' }
      ]
    },
    {
      id: 'ml-optimization',
      category: 'ml',
      title: 'Model Optimization',
      difficulty: 'Advanced',
      icon: '🤖',
      description: 'Quantization, pruning, distillation, and deployment optimization techniques.',
      topics: ['quantization', 'pruning', 'knowledge distillation', 'ONNX', 'TensorRT'],
      resources: [
        { type: 'article', title: 'Model Optimization', url: 'https://www.tensorflow.org/model_optimization' }
      ]
    },

    // Security Advanced
    {
      id: 'security-oauth',
      category: 'security',
      title: 'OAuth 2.0 & OpenID Connect',
      difficulty: 'Advanced',
      icon: '🔒',
      description: 'Modern authentication flows, JWT tokens, and secure API authorization.',
      topics: ['OAuth 2.0 flows', 'JWT', 'OpenID Connect', 'PKCE', 'refresh tokens'],
      resources: [
        { type: 'article', title: 'OAuth 2.0 Simplified', url: 'https://www.oauth.com/' }
      ]
    },
    {
      id: 'security-cryptography',
      category: 'security',
      title: 'Applied Cryptography',
      difficulty: 'Expert',
      icon: '🔒',
      description: 'Encryption algorithms, hashing, digital signatures, and PKI.',
      topics: ['AES', 'RSA', 'SHA-256', 'digital signatures', 'TLS/SSL', 'PKI'],
      resources: [
        { type: 'article', title: 'Practical Cryptography', url: 'https://cryptography.io/en/latest/' }
      ]
    },

    // Architecture Advanced
    {
      id: 'arch-ddd',
      category: 'architecture',
      title: 'Domain-Driven Design',
      difficulty: 'Advanced',
      icon: '🏗️',
      description: 'Bounded contexts, aggregates, entities, and strategic design patterns.',
      topics: ['bounded contexts', 'aggregates', 'entities', 'value objects', 'domain events'],
      resources: [
        { type: 'article', title: 'DDD Reference', url: 'https://www.domainlanguage.com/ddd/reference/' }
      ]
    },
    {
      id: 'arch-cqrs',
      category: 'architecture',
      title: 'CQRS & Event Sourcing',
      difficulty: 'Expert',
      icon: '🏗️',
      description: 'Command Query Responsibility Segregation and event-driven architectures.',
      topics: ['CQRS', 'event sourcing', 'event store', 'projections', 'sagas'],
      resources: [
        { type: 'article', title: 'CQRS Pattern', url: 'https://martinfowler.com/bliki/CQRS.html' }
      ]
    }
  ];

  const filteredConcepts = advancedConcepts.filter(concept => {
    const matchesCategory = selectedCategory === 'all' || concept.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="advanced-concepts-page fade-in">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search concepts, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Concepts Grid */}
      <div className="concepts-grid">
        <AnimatePresence mode="wait">
          {filteredConcepts.map(concept => (
            <motion.div
              key={concept.id}
              className="concept-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedConcept(concept)}
            >
              <div className="concept-header">
                <span className="concept-icon">{concept.icon}</span>
                <span className={`difficulty-badge ${concept.difficulty.toLowerCase()}`}>
                  {concept.difficulty}
                </span>
              </div>
              <h3 className="concept-title">{concept.title}</h3>
              <p className="concept-description">{concept.description}</p>
              <div className="concept-topics">
                {concept.topics.slice(0, 3).map((topic, idx) => (
                  <span key={idx} className="topic-tag">{topic}</span>
                ))}
                {concept.topics.length > 3 && (
                  <span className="topic-tag more">+{concept.topics.length - 3}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredConcepts.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No concepts found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Concept Detail Modal */}
      <AnimatePresence>
        {selectedConcept && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedConcept(null)}
          >
            <motion.div
              className="concept-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="modal-icon">{selectedConcept.icon}</span>
                  <h2>{selectedConcept.title}</h2>
                </div>
                <button className="modal-close" onClick={() => setSelectedConcept(null)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-meta">
                  <span className={`difficulty-badge ${selectedConcept.difficulty.toLowerCase()}`}>
                    {selectedConcept.difficulty}
                  </span>
                  <span className="category-badge">
                    {categories.find(c => c.id === selectedConcept.category)?.name}
                  </span>
                </div>

                <p className="modal-description">{selectedConcept.description}</p>

                <div className="modal-section">
                  <h3>📚 Key Topics</h3>
                  <div className="topics-list">
                    {selectedConcept.topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag-large">{topic}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-section">
                  <h3>🔗 Learning Resources</h3>
                  <div className="resources-list">
                    {selectedConcept.resources.map((resource, idx) => (
                      <div key={idx} className="resource-item">
                        <span className="resource-type">
                          {resource.type === 'article' ? '📄' : '🎥'}
                        </span>
                        <div className="resource-info">
                          <h4>{resource.title}</h4>
                          <button 
                            className="resource-link"
                            onClick={() => handleOpenResource(resource.url)}
                          >
                            Read in DEV<sup>A</sup> Reader →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdvancedConceptsPage;
