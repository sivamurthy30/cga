import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/common/Navigation';
import useRoadmapStore from '../store/roadmapStore';
import useMarketRadar from '../hooks/useMarketRadar';

const LEVEL_COLORS = {
  foundation:   { bg: '#3b82f6', light: 'rgba(59,130,246,0.12)',  text: '#3b82f6' },
  beginner:     { bg: '#10b981', light: 'rgba(16,185,129,0.12)',  text: '#10b981' },
  intermediate: { bg: '#f59e0b', light: 'rgba(245,158,11,0.12)', text: '#d97706' },
  advanced:     { bg: '#ef4444', light: 'rgba(239,68,68,0.12)',   text: '#ef4444' },
  expert:       { bg: '#8b5cf6', light: 'rgba(139,92,246,0.12)', text: '#8b5cf6' },
};

const DEFAULT_ROADMAPS = [
  { id: 'frontend-developer',  name: 'Frontend Developer',        icon: '🎨' },
  { id: 'backend-developer',   name: 'Backend Developer',         icon: '⚙️' },
  { id: 'fullstack-developer', name: 'Full Stack Developer',      icon: '🚀' },
  { id: 'devops-engineer',     name: 'DevOps Engineer',           icon: '🔧' },
  { id: 'ai-ml-engineer',      name: 'AI/ML Engineer',            icon: '🤖' },
  { id: 'mobile-developer',    name: 'Mobile Developer',          icon: '📱' },
  { id: 'security-engineer',   name: 'Security Engineer',         icon: '🔒' },
  { id: 'react-developer',     name: 'React Developer',           icon: '⚛️' },
  { id: 'python-developer',    name: 'Python Developer',          icon: '🐍' },
  { id: 'system-design',       name: 'System Design',             icon: '🏗️' },
];

export default function RoadmapPage({ learnerProfile, currentUser, onLogout, theme, toggleTheme }) {
  const [roadmapData, setRoadmapData]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState('');
  const [levelFilter, setLevelFilter]       = useState('all');
  const [selectedNode, setSelectedNode]     = useState(null);
  const [availableRoadmaps, setAvailableRoadmaps] = useState(DEFAULT_ROADMAPS);

  const { currentRoadmap, setCurrentRoadmap, completeNode, uncompleteNode,
          isNodeCompleted, getCompletionPercentage, totalXP, streak } = useRoadmapStore();
  const { getTrend, getSalaryPremium } = useMarketRadar();

  // Auto-select roadmap based on learner's target role
  useEffect(() => {
    if (!learnerProfile?.targetRole) return;
    const roleMap = {
      'Frontend Developer':        'frontend-developer',
      'Backend Developer':         'backend-developer',
      'Full Stack Developer':      'fullstack-developer',
      'DevOps Engineer':           'devops-engineer',
      'Machine Learning Engineer': 'ai-ml-engineer',
      'Data Scientist':            'ai-ml-engineer',
      'Mobile Developer':          'mobile-developer',
      'Security Engineer':         'security-engineer',
    };
    const mapped = roleMap[learnerProfile.targetRole];
    if (mapped && mapped !== currentRoadmap) {
      setCurrentRoadmap(mapped);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerProfile?.targetRole]);

  // Load roadmap list
  useEffect(() => {
    fetch('/api/roadmap/list')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.roadmaps?.length && setAvailableRoadmaps(d.roadmaps))
      .catch(() => {});
  }, []);

  // Load roadmap data
  useEffect(() => {
    setLoading(true);
    setSelectedNode(null);
    fetch(`/api/roadmap/${currentRoadmap}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.nodes) {
          setRoadmapData({
            name: data.name,
            description: data.description,
            slug: currentRoadmap,
            nodes: data.nodes.map(n => ({
              id: n.id,
              title: n.data?.title || n.title,
              description: n.data?.description || n.description,
              level: n.data?.level || n.level || 'beginner',
              learningTime: n.data?.learningTime || '2–4 hours',
              resources: n.data?.resources || 'https://roadmap.sh',
            })),
            edges: data.edges || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentRoadmap]);

  const nodes = roadmapData?.nodes || [];
  const filtered = nodes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    const matchLevel  = levelFilter === 'all' || n.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const completionPct = roadmapData ? getCompletionPercentage(currentRoadmap, nodes.length) : 0;
  const completedCount = nodes.filter(n => isNodeCompleted(currentRoadmap, n.id)).length;

  const currentInfo = availableRoadmaps.find(r => r.id === currentRoadmap) || { icon: '🗺️', name: 'Roadmap' };

  return (
    <div style={s.page} data-theme={theme}>
      <Navigation currentUser={currentUser} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} currentPage="roadmap" />

      {/* ── Top bar ── */}
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <select style={s.selector} value={currentRoadmap} onChange={e => setCurrentRoadmap(e.target.value)}>
            {availableRoadmaps.map(r => (
              <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
            ))}
          </select>
        </div>

        <div style={s.topCenter}>
          <input style={s.searchBox} placeholder="🔍 Search topics..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={s.filterRow}>
            {['all','beginner','intermediate','advanced'].map(l => (
              <button key={l} onClick={() => setLevelFilter(l)}
                style={{ ...s.filterBtn, ...(levelFilter === l ? s.filterActive : {}) }}>
                {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={s.topRight}>
          <div style={s.statChip}><span>⚡</span><strong>{totalXP}</strong><span style={s.statLbl}>XP</span></div>
          <div style={s.statChip}><span>🔥</span><strong>{streak}</strong><span style={s.statLbl}>streak</span></div>
          <div style={s.statChip}><span>✅</span><strong>{completedCount}/{nodes.length}</strong><span style={s.statLbl}>done</span></div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={s.progressWrap}>
        <div style={s.progressMeta}>
          <span style={s.progressTitle}>{currentInfo.icon} {currentInfo.name}</span>
          <span style={s.progressPct}>{completionPct}% complete</span>
        </div>
        <div style={s.progressTrack}>
          <motion.div style={s.progressFill} initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.6 }} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={s.body}>
        {loading ? (
          <div style={s.center}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ fontSize: 48 }}>🗺️</motion.div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 16 }}>Loading roadmap...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.center}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>No topics match your filter.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((node, idx) => {
              const done      = isNodeCompleted(currentRoadmap, node.id);
              const lc        = LEVEL_COLORS[node.level] || LEVEL_COLORS.beginner;
              const trend     = getTrend(node.title);
              const premium   = getSalaryPremium(node.title);
              const isSelected = selectedNode?.id === node.id;

              return (
                <motion.div key={node.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{
                    ...s.card,
                    borderColor: done ? 'var(--accent-success)' : isSelected ? lc.bg : 'var(--border-primary)',
                    background: done ? 'var(--bg-card)' : 'var(--bg-card)',
                    borderLeftColor: lc.bg,
                    borderLeftWidth: 4,
                  }}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                >
                  {/* Badges row */}
                  <div style={s.cardTop}>
                    <span style={{ ...s.levelBadge, background: lc.light, color: lc.text }}>{node.level}</span>
                    {trend === 'hot'    && <span style={s.hotBadge}>🔥 HOT</span>}
                    {trend === 'rising' && <span style={s.risingBadge}>📈 RISING</span>}
                    {premium > 0        && <span style={s.premiumBadge}>+{premium}% 💰</span>}
                    {done               && <span style={s.doneBadge}>✓ Done</span>}
                  </div>

                  {/* Title */}
                  <h3 style={s.cardTitle}>{node.title}</h3>
                  <p style={s.cardDesc}>{node.description}</p>

                  {/* Footer */}
                  <div style={s.cardFooter}>
                    <span style={s.timeTag}>⏱ {node.learningTime}</span>
                    <div style={s.cardActions}>
                      <button style={s.resourceBtn} onClick={e => { e.stopPropagation(); window.open(node.resources, '_blank'); }}>
                        📖 Resources
                      </button>
                      <button
                        style={{ ...s.completeBtn, ...(done ? s.completeBtnDone : {}) }}
                        onClick={e => {
                          e.stopPropagation();
                          done ? uncompleteNode(currentRoadmap, node.id) : completeNode(currentRoadmap, node.id);
                        }}
                      >
                        {done ? '✓ Completed' : '○ Mark Done'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} style={s.expandedDetail}>
                        <div style={s.detailDivider} />
                        <p style={s.detailText}>
                          Click <strong>Resources</strong> to open curated learning material for <strong>{node.title}</strong>.
                          Once you've studied this topic, mark it as done to track your progress and earn XP.
                        </p>
                        <div style={s.detailMeta}>
                          <span style={{ ...s.levelBadge, background: lc.light, color: lc.text }}>Level: {node.level}</span>
                          <span style={s.timeTag}>⏱ {node.learningTime}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 64,
    color: 'var(--text-primary)',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 24px',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-primary)',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  topLeft:   { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  topCenter: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, flexWrap: 'wrap' },
  topRight:  { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  selector: {
    padding: '7px 12px', borderRadius: 8,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 200,
  },
  searchBox: {
    padding: '7px 12px', borderRadius: 8, flex: 1, minWidth: 160,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', fontSize: 13,
  },
  filterRow: { display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 3, borderRadius: 8, border: '1px solid var(--border-primary)' },
  filterBtn: {
    padding: '4px 10px', borderRadius: 6, border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
  },
  filterActive: { background: 'var(--accent-primary)', color: '#000', fontWeight: 700 },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', borderRadius: 8,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
  },
  statLbl: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 },

  progressWrap: {
    padding: '10px 24px',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  progressMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' },
  progressPct:   { fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' },
  progressTrack: { height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', background: 'var(--accent-primary)', borderRadius: 4 },

  body: { flex: 1, overflowY: 'auto', padding: '24px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 16,
    maxWidth: 1400,
    margin: '0 auto',
  },

  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-primary)',
    borderLeft: '4px solid',
    borderRadius: 14,
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },

  cardTop: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  levelBadge: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' },
  hotBadge:     { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  risingBadge:  { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  premiumBadge: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#10b981' },
  doneBadge:    { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981', marginLeft: 'auto' },

  cardTitle: { fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', lineHeight: 1.3 },
  cardDesc:  { fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 },

  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  timeTag: { fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 },
  cardActions: { display: 'flex', gap: 6 },

  resourceBtn: {
    padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
  },
  completeBtn: {
    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    background: 'transparent', border: '1.5px solid var(--border-secondary)',
    color: 'var(--text-muted)',
  },
  completeBtnDone: {
    background: 'rgba(16,185,129,0.12)', borderColor: '#10b981', color: '#10b981',
  },

  expandedDetail: { overflow: 'hidden' },
  detailDivider: { height: 1, background: 'var(--border-primary)', margin: '12px 0' },
  detailText: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' },
  detailMeta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
};
