import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Navigation from './Navigation';
import useRoadmapStore from '../store/roadmapStore';
import '../styles/Dashboard.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = ({ learnerProfile, currentUser, onLogout, onChangeRole, onOpenRoadmap, theme, toggleTheme }) => {
  // Debug logging
  console.log('[Dashboard] Rendering with props:', { 
    hasProfile: !!learnerProfile, 
    hasUser: !!currentUser,
    profileComplete: learnerProfile?.onboarding_complete,
    role: learnerProfile?.targetRole 
  });

  // Safety check removed to allow instant layout painting
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { totalXP, streak, badges, completedNodes, currentRoadmap } = useRoadmapStore();

  const availableRoles = [
    { id: 'frontend', name: 'Frontend Developer', icon: '🎨', description: 'Build beautiful user interfaces' },
    { id: 'backend', name: 'Backend Developer', icon: '⚙️', description: 'Create server-side logic & APIs' },
    { id: 'fullstack', name: 'Full Stack Developer', icon: '🚀', description: 'Master both frontend & backend' },
    { id: 'data', name: 'Data Scientist', icon: '📊', description: 'Analyze data & build ML models' },
    { id: 'ml', name: 'Machine Learning Engineer', icon: '🤖', description: 'Build & deploy ML systems' },
    { id: 'devops', name: 'DevOps Engineer', icon: '🔧', description: 'Automate deployment & infrastructure' },
    { id: 'mobile', name: 'Mobile Developer', icon: '📱', description: 'Build iOS & Android apps' },
    { id: 'security', name: 'Security Engineer', icon: '🔒', description: 'Protect systems & data' },
  ];

  const handleRoleChange = (roleId) => {
    const role = availableRoles.find(r => r.id === roleId);
    if (role) {
      onChangeRole(role.name);
      setShowRoleModal(false);
    }
  };

  const roleIcon = availableRoles.find(r => r.name === learnerProfile?.targetRole)?.icon || '🎯';
  const assessmentResults = learnerProfile?.assessmentResults || {};
  const assessedSkills = Object.entries(assessmentResults);
  const completedInCurrentRoadmap = completedNodes?.[currentRoadmap]?.size || 0;

  const averageScore = useMemo(() => {
    if (assessedSkills.length === 0) return 0;
    const total = assessedSkills.reduce((sum, [, score]) => sum + (score.weightedPercentage || 0), 0);
    return Math.round(total / assessedSkills.length);
  }, [assessedSkills]);

  const skillLevelCounts = useMemo(() => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    assessedSkills.forEach(([, score]) => {
      const level = (score.level || 'beginner').toLowerCase();
      if (counts[level] !== undefined) counts[level] += 1;
    });
    return counts;
  }, [assessedSkills]);

  const proficiencyData = useMemo(() => ({
    labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    datasets: [
      {
        data: [
          skillLevelCounts.beginner,
          skillLevelCounts.intermediate,
          skillLevelCounts.advanced,
          skillLevelCounts.expert
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
        borderColor: ['#991b1b', '#92400e', '#1d4ed8', '#065f46'],
        borderWidth: 1
      }
    ]
  }), [skillLevelCounts]);

  const skillScoreData = useMemo(() => {
    const topSkills = assessedSkills
      .map(([skill, score]) => ({ skill, value: score.weightedPercentage || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      labels: topSkills.map(item => item.skill),
      datasets: [
        {
          label: 'Skill Score',
          data: topSkills.map(item => item.value),
          backgroundColor: '#f59e0b'
        }
      ]
    };
  }, [assessedSkills]);

  const recommendedActions = useMemo(() => {
    const weakSkills = assessedSkills
      .map(([skill, score]) => ({ skill, value: score.weightedPercentage || 0 }))
      .filter(item => item.value < 60)
      .sort((a, b) => a.value - b.value)
      .slice(0, 3);

    if (weakSkills.length === 0) {
      return [
        'Open roadmap and complete your next milestone node',
        'Take another assessment to keep your benchmark fresh',
        'Add one portfolio project this week'
      ];
    }

    return weakSkills.map(item => `Improve ${item.skill} (current: ${item.value}%)`);
  }, [assessedSkills]);

  return (
    <div className="dashboard-container fade-in">
      {/* Navigation */}
      <Navigation
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage="dashboard"
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">

          {/* Welcome Header */}
          <header className="dashboard-hero">
            <div className="hero-text">
              <h2>Welcome back, {currentUser?.name?.split(' ')[0] || currentUser?.name}! 👋</h2>
              <p>Your journey to becoming a <span className="highlight">{learnerProfile?.targetRole || 'developer'}</span></p>
            </div>
            <div className="hero-actions">
              <button
                className="btn-glow"
                onClick={() => {
                  const roleSlug = learnerProfile?.targetRole?.toLowerCase().replace(/\s+/g, '-') || 'full-stack';
                  window.open(`https://roadmap.sh/${roleSlug}`, '_blank');
                }}
              >
                🗺️ Continue Roadmap
              </button>
            </div>
          </header>

          {/* TOP ROW: Prominent Streak & Core Stats */}
          <section className="top-metrics-row">
            {/* The Highly Requested Streak Card at the Top */}
            <div className="premium-card streak-showcase" style={{ flex: '1.5' }}>
              <div className="card-header-flex">
                <div className="flex-align">
                  <span className="card-icon">🔥</span>
                  <div>
                    <h3 className="card-title">Learning Streak</h3>
                    <span className="card-subtitle">{streak >= 7 ? '🎉 Amazing consistency!' : 'Keep building your habit!'}</span>
                  </div>
                </div>
                <div className="streak-big-number">
                  {streak} <span className="streak-label">Days</span>
                </div>
              </div>
              <div className="streak-calendar">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className={`streak-dot ${i < streak ? 'active' : ''}`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick KPI Stats Grouped */}
            <div className="kpi-group" style={{ flex: '1' }}>
              <div className="kpi-mini-card">
                <span className="kpi-icon">📊</span>
                <div className="kpi-info">
                  <span className="kpi-value">{averageScore}%</span>
                  <span className="kpi-label">Avg Skill Score</span>
                </div>
              </div>
              <div className="kpi-mini-card">
                <span className="kpi-icon">🎯</span>
                <div className="kpi-info">
                  <span className="kpi-value">{completedInCurrentRoadmap}</span>
                  <span className="kpi-label">Nodes Completed</span>
                </div>
              </div>
              <div className="kpi-mini-card">
                <span className="kpi-icon">⚡</span>
                <div className="kpi-info">
                  <span className="kpi-value">{totalXP}</span>
                  <span className="kpi-label">Total XP</span>
                </div>
              </div>
              <div className="kpi-mini-card">
                <span className="kpi-icon">🏅</span>
                <div className="kpi-info">
                  <span className="kpi-value">{badges.length}</span>
                  <span className="kpi-label">Badges Unlocked</span>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN CONTENT GRID: 2/3 Left, 1/3 Right */}
          <div className="dashboard-grid">

            {/* LEFT COLUMN: Deep Dive (Skills, Charts, Projects) */}
            <div className="grid-main">

              {/* Current Role Card */}
              <div className="premium-card profile-card">
                <div className="profile-header">
                  <div>
                    <h3 className="card-subtitle">Your Current Path</h3>
                    <div className="role-title-wrap">
                      <span className="role-emoji">{roleIcon}</span>
                      <h2 className="role-title">{learnerProfile?.targetRole || 'Not Set'}</h2>
                    </div>
                  </div>
                  <button className="btn-outline" onClick={() => setShowRoleModal(true)}>
                    Change Role
                  </button>
                </div>

                {learnerProfile?.knownSkills && learnerProfile.knownSkills.length > 0 && (
                  <div className="skills-showcase">
                    <h4 className="card-subtitle">Verified Skills</h4>
                    <div className="skills-wrap">
                      {learnerProfile.knownSkills.slice(0, 8).map((skill, idx) => (
                        <span key={idx} className="glass-pill">{skill}</span>
                      ))}
                      {learnerProfile.knownSkills.length > 8 && (
                        <span className="glass-pill more">+{learnerProfile.knownSkills.length - 8}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Charts Section */}
              <div className="charts-row">
                <div className="premium-card chart-container">
                  <h3 className="card-title">Skill Distribution</h3>
                  {assessedSkills.length > 0 ? (
                    <div className="chart-canvas">
                      <Doughnut
                        data={proficiencyData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-secondary)' } } }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="empty-state-glass">Complete an assessment to see breakdown.</div>
                  )}
                </div>

                <div className="premium-card chart-container">
                  <h3 className="card-title">Top Proficiencies</h3>
                  {assessedSkills.length > 0 ? (
                    <div className="chart-canvas">
                      <Bar
                        data={skillScoreData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: { beginAtZero: true, max: 100, ticks: { color: 'var(--text-muted)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                            x: { ticks: { color: 'var(--text-muted)' }, grid: { display: false } }
                          },
                          plugins: { legend: { display: false } }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="empty-state-glass">Scores appear after your first assessment.</div>
                  )}
                </div>
              </div>

              {/* Recommended Project */}
              <div className="premium-card project-card">
                <div className="flex-align mb-4">
                  <span className="card-icon">🚀</span>
                  <h3 className="card-title">Recommended Project</h3>
                </div>
                <p className="project-description">
                  {(() => {
                    const projects = {
                      'Frontend Developer': 'Build a responsive portfolio website with full dark mode integration, CSS grid layouts, and framer-motion animations.',
                      'Backend Developer': 'Create a scalable RESTful API with distinct authentication roles, JWT tokens, and rate limiting middleware.',
                      'Full Stack Developer': 'Develop an end-to-end full-stack blog platform handling user authentication, image uploads to S3, and real-time commenting.',
                      'Data Scientist': 'Build an interactive data visualization dashboard with live data streaming, regression models, and dynamic filtering.',
                      'Machine Learning Engineer': 'Train and deploy an image classification pipeline using transfer learning (ResNet) exposed via a FastAPI endpoint.',
                      'DevOps Engineer': 'Architect a complete CI/CD multi-stage pipeline utilizing Docker, setting up a Kubernetes cluster with auto-scaling.',
                      'Mobile Developer': 'Engineer a cross-platform React Native or Flutter mobile app ensuring absolute offline support with SQLite/AsyncStorage sync.',
                      'Security Engineer': 'Design and implement a secure monolithic architecture proving secure password hashing, OAuth2, and complete 2FA flow.'
                    };
                    return projects[learnerProfile?.targetRole] || 'Design and deploy a project that pushes the boundaries of your current skill set.';
                  })()}
                </p>
                <div className="project-actions">
                  <button className="btn-solid">Start Project</button>
                  <button className="btn-outline">View Details</button>
                </div>
              </div>

              {/* Action Plan Section */}
              <div className="premium-card action-plan-card" style={{ marginTop: '1.5rem' }}>
                <div className="flex-align mb-4">
                  <span className="card-icon">🚀</span>
                  <h3 className="card-title">Your Action Plan</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Immediate Actions */}
                  <div>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.5rem', fontWeight: 600 }}>Immediate Actions (This Week)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {assessedSkills.length > 0 ? assessedSkills.slice(0, 2).map((item, index) => (
                        <div key={index} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>{index + 1}</div>
                            <h5 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>Focus on {item.skill}</h5>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            {item.level === 'beginner' || item.level === 'novice' ? `Build fundamental knowledge in ${item.skill}. Time to level up!` : `Advance your real-world application of ${item.skill}. Excellent!`}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', marginTop: '2px' }} />
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Review core {item.skill} syntax and concepts</span>
                            </label>
                            <label style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                              <input type="checkbox" style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', marginTop: '2px' }} />
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Build 2-3 medium projects using {item.skill}</span>
                            </label>
                          </div>
                        </div>
                      )) : (
                        <div className="empty-state-glass">Complete an assessment to generate your personalized action plan.</div>
                      )}
                    </div>
                  </div>

                  {/* Short-term Goals */}
                  <div>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.5rem', fontWeight: 600 }}>Short-term Goals (This Month)</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {['Complete 3-5 projects using your target skills', 'Solve 20+ coding problems on LeetCode/HackerRank', 'Read documentation for all tested technologies', 'Join developer communities and contribute'].map((goal, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                          <input type="checkbox" style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }} />
                          <span style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar (Focus, Tips, Badges) */}
            <div className="grid-sidebar">

              {/* Focus Areas */}
              <div className="sidebar-card">
                <h3 className="card-title flex-align gap-2"><span className="text-xl">🎯</span> Focus Areas</h3>
                <ul className="modern-list">
                  {recommendedActions.map((action, idx) => (
                    <li key={idx}>
                      <div className="list-bullet"></div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Daily Developer Tip */}
              <div className="sidebar-card tip-card">
                <h3 className="card-title flex-align gap-2"><span className="text-xl">💡</span> Daily Tip</h3>
                <blockquote className="tip-quote">
                  {(() => {
                    const tips = [
                      "Write code that explains itself. Good variable names are infinitely better than comments.",
                      "Test your code in production-like environments. Localhost often lies.",
                      "Learn to read error stack traces carefully. They're trying to help you, not yell at you.",
                      "Refactor when you understand the problem better, not when you're overwhelmed and tired.",
                      "Version control everything, commit frequently. Your future self will eternally thank you.",
                      "Step away from the screen. The best architectural solutions come when your brain idles.",
                      "Always ask for code reviews. A fresh perspective easily catches what you inevitably overlook."
                    ];
                    return tips[new Date().getDay()];
                  })()}
                </blockquote>
              </div>

              {/* Achievements */}
              <div className="sidebar-card">
                <div className="flex-between">
                  <h3 className="card-title flex-align gap-2"><span className="text-xl">🏆</span> Achievements</h3>
                  <span className="count-badge">{badges.length}</span>
                </div>
                {badges.length > 0 ? (
                  <div className="badges-grid mt-4">
                    {badges.slice(0, 6).map((badge) => (
                      <div key={badge} className="badge-item" title={badge.replace(/-/g, ' ')}>
                        <span className="badge-medal">🏅</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-glass mt-4 text-sm">
                    Complete your first learning node to unlock a badge.
                  </div>
                )}
              </div>

              {/* Community Highlight */}
              <div className="sidebar-card">
                <h3 className="card-title flex-align gap-2"><span className="text-xl">👥</span> Community Hub</h3>
                <p className="community-text mt-3">
                  {(() => {
                    const highlights = [
                      "Join our Discord community to connect with 10,000+ developers, share code, and network.",
                      "Check out this week's featured project from a fellow learner and leave some constructive feedback.",
                      "Participate in our monthly coding challenge and win exclusive prizes and global recognition.",
                      "Attend our live Q&A session with industry experts this Friday to unlock senior insights.",
                      "Share your current learning journey and inspire others who are following behind you."
                    ];
                    return highlights[Math.floor(new Date().getDate() / 6) % highlights.length];
                  })()}
                </p>
                <button className="btn-text mt-2">Join Community →</button>
              </div>

              {/* Advanced Concepts Gradient Card */}
              <div className="sidebar-card gradient-glow-card">
                <h3 className="card-title flex-align gap-2 text-white"><span className="text-xl">🎓</span> Advanced Topics</h3>
                <p className="text-white opacity-80 mt-2 text-sm leading-relaxed">
                  Ready to transcend the basics? Explore deep technical architectures and advanced materials.
                </p>
                <button
                  className="btn-white-glass mt-4 w-full"
                  onClick={() => window.location.hash = 'advanced-concepts'}
                >
                  Explore Now
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Role Change Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <motion.div
            className="modal-content premium-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="modal-header">
              <h2>Select Career Path</h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>✕</button>
            </div>
            <p className="modal-subtitle">
              Pivot your dynamic learning journey. Note: Changing your role resets active progression paths.
            </p>
            <div className="roles-grid">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  className={`role-option ${learnerProfile?.targetRole === role.name ? 'current' : ''}`}
                  onClick={() => handleRoleChange(role.id)}
                >
                  <div className="role-icon">{role.icon}</div>
                  <div className="role-info">
                    <h4>{role.name}</h4>
                    <p>{role.description}</p>
                  </div>
                  {learnerProfile?.targetRole === role.name && (
                    <span className="current-badge">Active</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
