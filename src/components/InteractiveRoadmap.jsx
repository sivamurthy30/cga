import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const InteractiveRoadmap = ({ learnerProfile }) => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [completedSkills, setCompletedSkills] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (learnerProfile?.targetRole) {
      fetchRoadmap(learnerProfile.targetRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerProfile?.targetRole]);

  useEffect(() => {
    // Mark user's known skills as completed
    if (learnerProfile?.knownSkills && roadmapData?.allSkills) {
      console.log('🔍 Matching user skills:', learnerProfile.knownSkills);
      console.log('📋 Against roadmap skills:', roadmapData.allSkills);
      
      const completed = new Set();
      
      learnerProfile.knownSkills.forEach(userSkill => {
        const userSkillLower = userSkill.toLowerCase().trim();
        
        roadmapData.allSkills.forEach(roadmapSkill => {
          const roadmapSkillLower = roadmapSkill.toLowerCase().trim();
          
          // Exact match
          if (userSkillLower === roadmapSkillLower) {
            completed.add(roadmapSkill);
            console.log('✅ Exact match:', userSkill, '→', roadmapSkill);
          }
          // Partial match (either contains the other)
          else if (roadmapSkillLower.includes(userSkillLower) || 
                   userSkillLower.includes(roadmapSkillLower)) {
            completed.add(roadmapSkill);
            console.log('✅ Partial match:', userSkill, '→', roadmapSkill);
          }
          // Handle common variations
          else {
            const variations = {
              'js': 'javascript',
              'ts': 'typescript',
              'html': 'html',
              'css': 'css',
              'react': 'react',
              'vue': 'vue',
              'angular': 'angular',
              'node': 'node.js',
              'nodejs': 'node.js',
              'python': 'python',
              'java': 'java',
              'sql': 'sql',
              'mongodb': 'mongodb',
              'postgres': 'postgresql',
              'postgresql': 'postgresql',
              'docker': 'docker',
              'kubernetes': 'kubernetes',
              'k8s': 'kubernetes',
              'git': 'git',
              'github': 'git',
              'api': 'api',
              'rest': 'rest api',
              'graphql': 'graphql',
            };
            
            const userVariation = variations[userSkillLower];
            const roadmapVariation = variations[roadmapSkillLower];
            
            if (userVariation && roadmapSkillLower.includes(userVariation)) {
              completed.add(roadmapSkill);
              console.log('✅ Variation match:', userSkill, '→', roadmapSkill);
            } else if (roadmapVariation && userSkillLower.includes(roadmapVariation)) {
              completed.add(roadmapSkill);
              console.log('✅ Variation match:', userSkill, '→', roadmapSkill);
            }
          }
        });
      });
      
      console.log('✅ Total matched skills:', completed.size);
      setCompletedSkills(completed);
    }
  }, [learnerProfile?.knownSkills, roadmapData?.allSkills]);

  const fetchRoadmap = async (role) => {
    setLoading(true);
    console.log('🗺️ Fetching roadmap for role:', role);
    try {
      const response = await fetch(`/roadmap/role/${encodeURIComponent(role)}`);
      const data = await response.json();
      
      console.log('📊 Roadmap data received:', data);
      
      if (data.error) {
        console.error('Roadmap error:', data.error);
        setRoadmapData(null);
      } else {
        // Organize skills into categories
        const organizedData = organizeSkills(data);
        setRoadmapData(organizedData);
        
        // Animate roadmap appearance
        setTimeout(() => {
          gsap.fromTo('.roadmap-node',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05 }
          );
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setRoadmapData(null);
    } finally {
      setLoading(false);
    }
  };

  const organizeSkills = (data) => {
    // Categorize skills based on common patterns
    const categories = {
      'Fundamentals': [],
      'Frontend': [],
      'Backend': [],
      'Database': [],
      'DevOps': [],
      'Testing': [],
      'Tools': [],
      'Advanced': [],
      'Other': []
    };

    const frontendKeywords = ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'ui', 'responsive', 'design'];
    const backendKeywords = ['api', 'server', 'backend', 'node', 'python', 'java', 'authentication', 'security'];
    const databaseKeywords = ['database', 'sql', 'mongodb', 'postgresql', 'redis', 'data'];
    const devopsKeywords = ['docker', 'kubernetes', 'ci/cd', 'deployment', 'cloud', 'aws', 'azure'];
    const testingKeywords = ['test', 'testing', 'qa', 'quality'];
    const toolsKeywords = ['git', 'version control', 'package', 'build'];
    const fundamentalKeywords = ['programming', 'basics', 'fundamentals', 'introduction'];

    data.skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      
      if (fundamentalKeywords.some(kw => skillLower.includes(kw))) {
        categories['Fundamentals'].push(skill);
      } else if (frontendKeywords.some(kw => skillLower.includes(kw))) {
        categories['Frontend'].push(skill);
      } else if (backendKeywords.some(kw => skillLower.includes(kw))) {
        categories['Backend'].push(skill);
      } else if (databaseKeywords.some(kw => skillLower.includes(kw))) {
        categories['Database'].push(skill);
      } else if (devopsKeywords.some(kw => skillLower.includes(kw))) {
        categories['DevOps'].push(skill);
      } else if (testingKeywords.some(kw => skillLower.includes(kw))) {
        categories['Testing'].push(skill);
      } else if (toolsKeywords.some(kw => skillLower.includes(kw))) {
        categories['Tools'].push(skill);
      } else if (skillLower.includes('advanced') || skillLower.includes('optimization')) {
        categories['Advanced'].push(skill);
      } else {
        categories['Other'].push(skill);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return {
      ...data,
      categories,
      allSkills: data.skills
    };
  };

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setShowResourcePanel(true);
    
    // Animate skill detail panel
    gsap.fromTo('.skill-detail-panel',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.3 }
    );
  };

  const getSkillResources = (skill) => {
    const skillLower = skill.toLowerCase();
    
    // Curated learning resources
    const resources = {
      documentation: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}`,
      tutorial: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial for beginners')}`,
      video: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`,
      practice: `https://www.google.com/search?q=${encodeURIComponent(skill + ' practice exercises')}`,
      github: `https://github.com/search?q=${encodeURIComponent(skill)}&type=repositories`,
    };

    // Add specific resources for popular technologies
    if (skillLower.includes('javascript') || skillLower.includes('js')) {
      resources.documentation = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
      resources.practice = 'https://javascript.info/';
    } else if (skillLower.includes('python')) {
      resources.documentation = 'https://docs.python.org/3/';
      resources.tutorial = 'https://www.learnpython.org/';
    } else if (skillLower.includes('react')) {
      resources.documentation = 'https://react.dev/';
      resources.tutorial = 'https://react.dev/learn';
    } else if (skillLower.includes('node')) {
      resources.documentation = 'https://nodejs.org/docs/';
    } else if (skillLower.includes('sql')) {
      resources.tutorial = 'https://www.w3schools.com/sql/';
      resources.practice = 'https://sqlzoo.net/';
    } else if (skillLower.includes('docker')) {
      resources.documentation = 'https://docs.docker.com/';
    } else if (skillLower.includes('git')) {
      resources.documentation = 'https://git-scm.com/doc';
      resources.tutorial = 'https://learngitbranching.js.org/';
    }

    return resources;
  };

  const toggleSkillCompletion = (skill) => {
    const newCompleted = new Set(completedSkills);
    if (newCompleted.has(skill)) {
      newCompleted.delete(skill);
    } else {
      newCompleted.add(skill);
    }
    setCompletedSkills(newCompleted);
  };

  const getCompletionPercentage = () => {
    if (!roadmapData?.allSkills) return 0;
    return Math.round((completedSkills.size / roadmapData.allSkills.length) * 100);
  };

  const getSkillIcon = (skill) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('html')) return '🌐';
    if (skillLower.includes('css')) return '🎨';
    if (skillLower.includes('javascript') || skillLower.includes('js')) return '🟨';
    if (skillLower.includes('react')) return '⚛️';
    if (skillLower.includes('vue')) return '🟢';
    if (skillLower.includes('angular')) return '🔺';
    if (skillLower.includes('python')) return '🐍';
    if (skillLower.includes('java')) return '☕';
    if (skillLower.includes('database') || skillLower.includes('sql')) return '🗄️';
    if (skillLower.includes('docker')) return '🐳';
    if (skillLower.includes('kubernetes')) return '☸️';
    if (skillLower.includes('git')) return '📦';
    if (skillLower.includes('test')) return '✅';
    if (skillLower.includes('api')) return '🔌';
    if (skillLower.includes('security')) return '🔒';
    if (skillLower.includes('cloud')) return '☁️';
    return '📌';
  };

  if (!learnerProfile?.targetRole) {
    return (
      <div className="interactive-roadmap" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="roadmap-header" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700 }}>🗺️ Interactive Learning Roadmap</h3>
          <p className="roadmap-subtitle" style={{ color: '#94a3b8', marginTop: '8px' }}>
            Visual guide to master your target role
          </p>
        </div>
        <div className="roadmap-empty" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '16px' }}>🗺️</div>
          <h4 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '12px' }}>Select Your Target Role</h4>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Choose a role in your Learning Profile to see the complete learning roadmap.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="interactive-roadmap" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="roadmap-header" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700 }}>🗺️ Interactive Learning Roadmap</h3>
        </div>
        <div className="roadmap-loading" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div className="loading-spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid #334155',
            borderTop: '4px solid #f59e0b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Loading roadmap for {learnerProfile.targetRole}...
          </p>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="interactive-roadmap" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="roadmap-header" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700 }}>🗺️ Interactive Learning Roadmap</h3>
        </div>
        <div className="roadmap-error" style={{
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div className="error-icon" style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
          <h4 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '12px' }}>Roadmap Not Available</h4>
          <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
            Could not load roadmap for {learnerProfile.targetRole}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-roadmap" style={{ 
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#0f172a'
    }}>
      <div className="roadmap-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '20px',
        background: '#1e293b',
        border: '2px solid #334155',
        borderRadius: '12px'
      }}>
        <div className="header-content">
          <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
            🗺️ Interactive Learning Roadmap
          </h3>
          <p className="roadmap-subtitle" style={{ color: '#94a3b8', fontSize: '1rem' }}>
            {roadmapData.role} - {roadmapData.total_skills} skills to master
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="view-toggle" style={{ 
            display: 'flex',
            gap: '8px',
            background: '#0f172a',
            padding: '4px',
            borderRadius: '8px'
          }}>
            <button
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'tree' ? '#f59e0b' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: viewMode === 'tree' ? '#0f172a' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🌳 Tree
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? '#f59e0b' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: viewMode === 'list' ? '#0f172a' : '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📋 List
            </button>
          </div>
          <a
            href={roadmapData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary roadmap-link"
            style={{
              padding: '8px 16px',
              background: '#334155',
              border: '2px solid #475569',
              borderRadius: '8px',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.background = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#475569';
              e.target.style.background = '#334155';
            }}
          >
            🔗 View on Roadmap.sh
          </a>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="roadmap-progress" style={{
        background: '#1e293b',
        border: '2px solid #334155',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div className="progress-header" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <span className="progress-label" style={{ color: '#ffffff', fontWeight: 600 }}>Your Progress</span>
          <span className="progress-percentage" style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.25rem' }}>
            {getCompletionPercentage()}%
          </span>
        </div>
        <div className="progress-bar" style={{
          width: '100%',
          height: '12px',
          background: '#0f172a',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div
            className="progress-fill"
            style={{ 
              width: `${getCompletionPercentage()}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }}
          />
        </div>
        <div className="progress-stats" style={{
          display: 'flex',
          gap: '12px',
          color: '#94a3b8',
          fontSize: '0.875rem',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#10b981' }}>✅ {completedSkills.size} completed (from your profile)</span>
          <span>•</span>
          <span style={{ color: '#64748b' }}>📚 {roadmapData.total_skills - completedSkills.size} to learn</span>
        </div>
        {learnerProfile?.knownSkills && learnerProfile.knownSkills.length > 0 && (
          <div className="progress-note" style={{
            padding: '12px',
            background: '#0f172a',
            borderRadius: '8px',
            marginTop: '12px'
          }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: 0 }}>
              💡 Skills marked as completed are based on your profile. 
              {completedSkills.size === 0 && ' No matches found - try adding more skills or check the console for details.'}
            </p>
          </div>
        )}
      </div>

      {/* Roadmap Content */}
      <div className="roadmap-content">
        {viewMode === 'tree' ? (
          <div className="roadmap-tree">
            <svg ref={svgRef} className="roadmap-connections" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0
            }}>
              {/* SVG paths will be drawn here */}
            </svg>
            {Object.entries(roadmapData.categories).map(([category, skills], catIndex) => (
              <div key={category} className="roadmap-category" style={{ position: 'relative', zIndex: 1 }}>
                <div className="category-header">
                  <h4 style={{ color: '#f59e0b', fontWeight: 600 }}>{category}</h4>
                  <span className="category-count" style={{ 
                    color: '#94a3b8',
                    background: '#1e293b',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem'
                  }}>
                    {skills.filter(s => completedSkills.has(s)).length}/{skills.length}
                  </span>
                </div>
                <div className="category-skills" style={{ position: 'relative' }}>
                  {skills.map((skill, index) => {
                    const isCompleted = completedSkills.has(skill);
                    const isSelected = selectedSkill === skill;
                    
                    return (
                      <div
                        key={skill}
                        className={`roadmap-node ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSkillClick(skill)}
                        style={{ 
                          animationDelay: `${index * 0.05}s`,
                          background: isCompleted ? '#10b981' : '#1e293b',
                          border: `2px solid ${isSelected ? '#f59e0b' : isCompleted ? '#10b981' : '#334155'}`,
                          color: '#ffffff',
                          position: 'relative'
                        }}
                      >
                        <div className="node-icon" style={{ fontSize: '1.5rem' }}>{getSkillIcon(skill)}</div>
                        <div className="node-content">
                          <span className="node-title" style={{ 
                            color: '#ffffff',
                            fontWeight: 500,
                            fontSize: '0.95rem'
                          }}>{skill}</span>
                          {isCompleted && <span className="node-check" style={{ color: '#ffffff' }}>✓</span>}
                        </div>
                        <button
                          className="node-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSkillCompletion(skill);
                          }}
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          style={{
                            background: isCompleted ? '#10b981' : 'transparent',
                            border: `2px solid ${isCompleted ? '#10b981' : '#64748b'}`,
                            color: isCompleted ? '#ffffff' : '#64748b',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {isCompleted ? '✓' : '○'}
                        </button>
                      </div>
                    );
                  })}
                  {/* Draw connecting lines between skills in same category */}
                  {skills.length > 1 && (
                    <svg style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}>
                      {skills.slice(0, -1).map((_, idx) => (
                        <line
                          key={idx}
                          x1="50%"
                          y1={`${(idx * 100 / skills.length) + (50 / skills.length)}%`}
                          x2="50%"
                          y2={`${((idx + 1) * 100 / skills.length) + (50 / skills.length)}%`}
                          stroke="#334155"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.5"
                        />
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="roadmap-list">
            {roadmapData.allSkills.map((skill, index) => {
              const isCompleted = completedSkills.has(skill);
              const isSelected = selectedSkill === skill;
              
              return (
                <div
                  key={skill}
                  className={`roadmap-list-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSkillClick(skill)}
                  style={{
                    background: isCompleted ? '#10b981' : '#1e293b',
                    border: `2px solid ${isSelected ? '#f59e0b' : isCompleted ? '#10b981' : '#334155'}`,
                    color: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="item-number" style={{ 
                    color: '#94a3b8',
                    fontWeight: 600,
                    minWidth: '32px'
                  }}>{index + 1}</span>
                  <span className="item-icon" style={{ fontSize: '1.5rem' }}>{getSkillIcon(skill)}</span>
                  <span className="item-title" style={{ 
                    flex: 1,
                    color: '#ffffff',
                    fontWeight: 500
                  }}>{skill}</span>
                  {isCompleted && <span className="item-check" style={{ color: '#ffffff' }}>✓</span>}
                  <button
                    className="item-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSkillCompletion(skill);
                    }}
                    style={{
                      background: isCompleted ? '#10b981' : 'transparent',
                      border: `2px solid ${isCompleted ? '#10b981' : '#64748b'}`,
                      color: isCompleted ? '#ffffff' : '#64748b',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isCompleted ? '✓' : '○'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Resource Panel - Replaces window.alert */}
        {showResourcePanel && selectedSkill && (
          <div className="resource-panel-overlay" onClick={() => setShowResourcePanel(false)} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="resource-panel" onClick={(e) => e.stopPropagation()} style={{
              background: '#0f172a',
              border: '2px solid #334155',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
              <button
                className="panel-close"
                onClick={() => setShowResourcePanel(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1e293b';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#94a3b8';
                }}
              >
                ×
              </button>
              
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <span className="panel-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>
                  {getSkillIcon(selectedSkill)}
                </span>
                <h3 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 600, marginBottom: '8px' }}>
                  {selectedSkill}
                </h3>
                <span className={`status-badge ${completedSkills.has(selectedSkill) ? 'completed' : 'pending'}`} style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: completedSkills.has(selectedSkill) ? '#10b981' : '#334155',
                  color: '#ffffff'
                }}>
                  {completedSkills.has(selectedSkill) ? '✓ Completed' : '○ Not Started'}
                </span>
              </div>
              
              <div className="panel-content">
                <div className="panel-info" style={{ marginBottom: '24px' }}>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: '12px' }}>
                    <strong style={{ color: '#f59e0b' }}>What to learn:</strong> Master the fundamentals and best practices of {selectedSkill}.
                  </p>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    <strong style={{ color: '#f59e0b' }}>Why it matters:</strong> This skill is essential for {roadmapData.role} roles.
                  </p>
                </div>

                <div className="resource-links" style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.125rem', marginBottom: '16px', fontWeight: 600 }}>
                    📚 Learning Resources
                  </h4>
                  {Object.entries(getSkillResources(selectedSkill)).map(([type, url]) => (
                    <a
                      key={type}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        background: '#1e293b',
                        border: '2px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        textDecoration: 'none',
                        marginBottom: '8px',
                        transition: 'all 0.2s',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#f59e0b';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#334155';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      {type === 'documentation' && '📖 Official Documentation'}
                      {type === 'tutorial' && '🎓 Interactive Tutorial'}
                      {type === 'video' && '🎥 Video Courses'}
                      {type === 'practice' && '💪 Practice Exercises'}
                      {type === 'github' && '💻 GitHub Projects'}
                    </a>
                  ))}
                </div>

                <div className="panel-actions" style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      toggleSkillCompletion(selectedSkill);
                      setShowResourcePanel(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: completedSkills.has(selectedSkill) ? '#334155' : '#f59e0b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {completedSkills.has(selectedSkill) ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Attribution */}
      <div className="roadmap-footer" style={{
        marginTop: '24px',
        padding: '16px',
        background: '#1e293b',
        border: '2px solid #334155',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.875rem' }}>
          Roadmap data from{' '}
          <a 
            href="https://roadmap.sh" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            roadmap.sh
          </a>
          {' '}• Community-driven learning paths
        </p>
      </div>
    </div>
  );
};

export default InteractiveRoadmap;
