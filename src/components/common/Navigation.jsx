import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDashboard, MdMap, MdSchool, MdArrowBack, MdArrowForward,
         MdLogout, MdExpandMore, MdSettings } from 'react-icons/md';
import '../../styles/Navigation.css';

const Navigation = ({
  currentUser,
  onLogout,
  theme,
  toggleTheme,
  currentPage = 'dashboard',
  showBackButton = false,
  onBack = null,
  isPro = false,
  onUpgradeClick = null,
}) => {
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [fontSize, setFontSize]           = useState(() => localStorage.getItem('fontSize') || 'default');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('notifications') !== 'false');
  const [focusMode, setFocusMode]         = useState(() => localStorage.getItem('focusMode') === 'true');
  const [dailyGoal, setDailyGoal]         = useState(() => parseInt(localStorage.getItem('dailyGoal') || '3', 10));

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard />, path: '#dashboard' },
    { id: 'roadmap',   label: 'Roadmap',   icon: <MdMap />,       path: '#roadmap' },
    { id: 'advanced',  label: 'Advanced',  icon: <MdSchool />,    path: '#advanced-concepts' },
  ];

  const handleNavigation = (path) => {
    const hash = path.startsWith('#') ? path
      : path === '/' ? '#dashboard'
      : path === '/roadmap' ? '#roadmap'
      : null;
    if (hash) {
      if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
      else window.location.hash = hash;
    } else {
      window.location.href = path;
    }
  };

  const applyFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
  };

  const applyFocusMode = (val) => {
    setFocusMode(val);
    localStorage.setItem('focusMode', val);
    document.documentElement.setAttribute('data-focus-mode', val);
  };

  const applyNotifications = (val) => {
    setNotifications(val);
    localStorage.setItem('notifications', val);
  };

  const applyDailyGoal = (val) => {
    setDailyGoal(val);
    localStorage.setItem('dailyGoal', val);
  };

  const initial = (currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase();

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        {showBackButton && onBack ? (
          <button className="nav-back-btn" onClick={onBack}><MdArrowBack /> Back</button>
        ) : (
          <>
            <h1 className="nav-logo">DEV<sup>A</sup></h1>
            <div className="nav-browser-controls">
              <button className="nav-browser-btn" onClick={() => window.history.back()}  title="Back"><MdArrowBack /></button>
              <button className="nav-browser-btn" onClick={() => window.history.forward()} title="Forward"><MdArrowForward /></button>
            </div>
          </>
        )}

        {!['onboarding', 'assessment', 'analysis'].includes(currentPage) && (
          <div className="nav-links">
            {navLinks.map(link => (
              <button key={link.id}
                className={`nav-link ${currentPage === link.id || currentPage === link.id.replace('advanced','advanced-concepts') ? 'active' : ''}`}
                onClick={() => handleNavigation(link.path)}>
                <span className="nav-link-icon">{link.icon}</span>
                <span className="nav-link-label">{link.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="nav-right">
        {/* Go Pro button — only for non-pro users */}
        {!isPro && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            style={{
              padding: '0.4rem 0.875rem',
              background: '#f59e0b',
              color: '#000',
              border: 'none',
              borderRadius: '7px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⭐ Go Pro
          </button>
        )}

        {/* User button — settings panel opens inside this dropdown */}
        <div className="nav-user-section">
          <button className="nav-user-btn" onClick={() => setShowUserMenu(p => !p)}>
            <div className="nav-user-avatar">{initial}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{currentUser?.name || 'User'}</span>
              <span className="nav-user-email">{currentUser?.email}</span>
            </div>
            <MdExpandMore className={`nav-chevron ${showUserMenu ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="nav-menu-overlay" onClick={() => { setShowUserMenu(false); setShowSettings(false); }} />
                <motion.div className="nav-user-menu" style={{ width: showSettings ? 300 : 260 }}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}>

                  {!showSettings ? (
                    /* ── Profile view ── */
                    <>
                      <div className="nav-menu-header">
                        <div className="nav-menu-avatar">{initial}</div>
                        <div className="nav-menu-user-info">
                          <span className="nav-menu-name">{currentUser?.name || 'User'}</span>
                          <span className="nav-menu-email">{currentUser?.email}</span>
                        </div>
                      </div>

                      <div className="nav-menu-divider" />

                      <button className="nav-menu-item" onClick={() => setShowSettings(true)}>
                        <span className="nav-menu-icon"><MdSettings /></span>
                        <span>Settings</span>
                      </button>

                      <div className="nav-menu-divider" />

                      {onLogout && (
                        <button className="nav-menu-item logout" onClick={onLogout}>
                          <span className="nav-menu-icon"><MdLogout /></span>
                          <span>Logout</span>
                        </button>
                      )}
                    </>
                  ) : (
                    /* ── Settings view ── */
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px 8px' }}>
                        <button onClick={() => setShowSettings(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <MdArrowBack size={16} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Settings</span>
                      </div>

                      <div className="nav-menu-divider" />

                      {/* Theme */}
                      <div style={row}>
                        <div>
                          <div style={rowLabel}>Appearance</div>
                          <div style={rowSub}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
                        </div>
                        <Toggle value={theme === 'dark'} onChange={v => toggleTheme()} />
                      </div>

                      <div className="nav-menu-divider" />

                      {/* Font size */}
                      <div style={{ padding: '10px 14px' }}>
                        <div style={rowLabel}>Text size</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {[['small','S'],['default','M'],['large','L']].map(([val, label]) => (
                            <button key={val} onClick={() => applyFontSize(val)}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid var(--border-primary)',
                                background: fontSize === val ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: fontSize === val ? '#000' : 'var(--text-secondary)',
                                fontWeight: fontSize === val ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="nav-menu-divider" />

                      {/* Daily goal */}
                      <div style={{ padding: '10px 14px' }}>
                        <div style={rowLabel}>Daily learning goal</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {[1, 2, 3, 5].map(n => (
                            <button key={n} onClick={() => applyDailyGoal(n)}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: '1px solid var(--border-primary)',
                                background: dailyGoal === n ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                color: dailyGoal === n ? '#000' : 'var(--text-secondary)',
                                fontWeight: dailyGoal === n ? 700 : 400, fontSize: 12, cursor: 'pointer' }}>
                              {n}h
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="nav-menu-divider" />

                      {/* Focus mode */}
                      <div style={row}>
                        <div>
                          <div style={rowLabel}>Focus mode</div>
                          <div style={rowSub}>Hide distractions while studying</div>
                        </div>
                        <Toggle value={focusMode} onChange={applyFocusMode} />
                      </div>

                      {/* Reminders */}
                      <div style={row}>
                        <div>
                          <div style={rowLabel}>Reminders</div>
                          <div style={rowSub}>Daily study reminders</div>
                        </div>
                        <Toggle value={notifications} onChange={applyNotifications} />
                      </div>

                      <div className="nav-menu-divider" />

                      <div style={{ padding: '8px 14px 12px' }}>
                        <button onClick={() => {
                          if (window.confirm('Clear all local data? This cannot be undone.')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }} style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.06)', color: 'var(--accent-error)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                          Clear local data
                        </button>
                      </div>
                    </>
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

// Small toggle switch
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative',
        background: value ? 'var(--accent-primary)' : 'var(--border-secondary)', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

const row    = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' };
const rowLabel = { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' };
const rowSub   = { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 };

export default Navigation;
