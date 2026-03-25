import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDashboard, MdMap, MdSchool, MdArrowBack, MdArrowForward, MdLightMode, MdDarkMode, MdLogout, MdExpandMore } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import '../styles/Navigation.css';

const Navigation = ({ 
  currentUser, 
  onLogout, 
  theme, 
  toggleTheme,
  currentPage = 'dashboard',
  showBackButton = false,
  onBack = null
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard />, path: '#dashboard' },
    { id: 'roadmap', label: 'Roadmap', icon: <MdMap />, path: '#roadmap' },
    { id: 'advanced', label: 'Advanced', icon: <MdSchool />, path: '#advanced-concepts' }
  ];

  const handleNavigation = (path) => {
    // Convert paths to hashtags to prevent full reloads
    if (path === '/') {
      window.location.hash = '#dashboard';
    } else if (path === '/roadmap') {
      window.location.hash = '#roadmap';
    } else if (path.startsWith('#')) {
      window.location.hash = path;
    } else {
      window.location.href = path;
    }
  };

  const handleBrowserBack = () => {
    window.history.back();
  };

  const handleBrowserForward = () => {
    window.history.forward();
  };

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        {showBackButton && onBack ? (
          <button className="nav-back-btn" onClick={onBack}>
            <MdArrowBack /> Back
          </button>
        ) : (
          <>
            <h1 className="nav-logo">DEV<sup>A</sup></h1>
            <div className="nav-browser-controls">
              <button 
                className="nav-browser-btn" 
                onClick={handleBrowserBack}
                title="Go back"
                aria-label="Go back"
              >
                <MdArrowBack />
              </button>
              <button 
                className="nav-browser-btn" 
                onClick={handleBrowserForward}
                title="Go forward"
                aria-label="Go forward"
              >
                <MdArrowForward />
              </button>
            </div>
          </>
        )}
        
        {!['onboarding', 'assessment', 'analysis'].includes(currentPage) && (
          <div className="nav-links">
            {navLinks.map(link => (
              <button
                key={link.id}
                className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
                onClick={() => handleNavigation(link.path)}
              >
                <span className="nav-link-icon">{link.icon}</span>
                <span className="nav-link-label">{link.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-right">
        <div className="theme-toggle-wrapper">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        
        <div className="nav-user-section">
          <button 
            className="nav-user-btn"
            onClick={() => setShowUserMenu(prev => !prev)}
          >
            <div className="nav-user-avatar">
              {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-name">{currentUser?.name || 'User'}</span>
              <span className="nav-user-email">{currentUser?.email}</span>
            </div>
            <MdExpandMore 
              className={`nav-chevron ${showUserMenu ? 'open' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div 
                  className="nav-menu-overlay" 
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  className="nav-user-menu"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="nav-menu-header">
                    <div className="nav-menu-avatar">
                      {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="nav-menu-user-info">
                      <span className="nav-menu-name">{currentUser?.name || 'User'}</span>
                      <span className="nav-menu-email">{currentUser?.email}</span>
                    </div>
                  </div>

                  <div className="nav-menu-divider" />

                  {onLogout && (
                    <button className="nav-menu-item logout" onClick={onLogout}>
                      <span className="nav-menu-icon"><MdLogout /></span>
                      <span>Logout</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
