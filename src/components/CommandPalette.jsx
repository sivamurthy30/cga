import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMANDS = [
  { id:'dashboard',  label:'Go to Dashboard',            icon:'🏠', action:'navigate', hash:'#dashboard' },
  { id:'roadmap',    label:'Open Roadmap',                icon:'🗺️', action:'navigate', hash:'#roadmap' },
  { id:'advanced',   label:'Advanced Concepts',           icon:'🧠', action:'navigate', hash:'#advanced-concepts' },
  { id:'upgrade',    label:'Upgrade to DEVAsquare Pro',   icon:'⭐', action:'upgrade' },
  { id:'theme',      label:'Toggle Theme',                icon:'🌓', action:'theme' },
  { id:'assessment', label:'Retake Skill Assessment',     icon:'📝', action:'assessment' },
  { id:'code-review',label:'Open Code Reviewer',          icon:'🔍', action:'navigate', hash:'#code-review' },
  { id:'pitch',      label:'Practice Elevator Pitch',     icon:'🎙️', action:'navigate', hash:'#pitch-perfect' },
  { id:'salary',     label:'View Salary Heatmap',         icon:'💰', action:'navigate', hash:'#salary-heatmap' },
  { id:'vault',      label:'Executive Vault (Premium)',   icon:'💎', action:'navigate', hash:'#executive-vault' },
  { id:'resume',     label:'AI Resume Builder',           icon:'📄', action:'navigate', hash:'#resume-builder' },
  { id:'challenge',  label:'Daily Coding Challenge',      icon:'⚡', action:'navigate', hash:'#daily-challenge' },
  { id:'interview',  label:'Interview Prep Flash Cards',  icon:'🎯', action:'navigate', hash:'#interview-prep' },
  { id:'logout',     label:'Logout',                      icon:'🚪', action:'logout' },
];

export default function CommandPalette({ onNavigate, onUpgrade, onTheme, onLogout, onAssessment }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const execute = useCallback(cmd => {
    setOpen(false); setQuery('');
    if (cmd.action === 'navigate') { window.location.hash = cmd.hash; onNavigate?.(cmd.hash); }
    else if (cmd.action === 'upgrade')    onUpgrade?.();
    else if (cmd.action === 'theme')      onTheme?.();
    else if (cmd.action === 'logout')     onLogout?.();
    else if (cmd.action === 'assessment') onAssessment?.();
  }, [onNavigate, onUpgrade, onTheme, onLogout, onAssessment]);

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); setQuery(''); setSelected(0); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const handleKey = e => {
    if (e.key === 'ArrowDown') setSelected(s => Math.min(s+1, filtered.length-1));
    else if (e.key === 'ArrowUp') setSelected(s => Math.max(s-1, 0));
    else if (e.key === 'Enter' && filtered[selected]) execute(filtered[selected]);
  };

  return (
    <div className="deva-ui">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={s.overlay} onClick={() => setOpen(false)}>
            <motion.div initial={{ opacity:0, y:-20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-10, scale:0.97 }} transition={{ duration:0.15 }}
              style={s.palette} onClick={e => e.stopPropagation()}>

              <div style={s.inputRow}>
                <span style={s.searchIcon}>⌘</span>
                <input ref={inputRef} value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0); }}
                  onKeyDown={handleKey} placeholder="Type a command..." style={s.input} />
                <kbd style={s.esc}>ESC</kbd>
              </div>

              <div style={s.list}>
                {filtered.length === 0 && <div style={s.empty}>No commands found</div>}
                {filtered.map((cmd, i) => (
                  <div key={cmd.id}
                    style={{ ...s.item, ...(i === selected ? s.itemActive : {}) }}
                    onMouseEnter={() => setSelected(i)} onClick={() => execute(cmd)}>
                    <span style={s.icon}>{cmd.icon}</span>
                    <span style={s.label}>{cmd.label}</span>
                    {i === selected && <kbd style={s.enter}>↵</kbd>}
                  </div>
                ))}
              </div>

              <div style={s.footer}>
                <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  overlay: {
    position:'fixed', inset:0, zIndex:9999,
    background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)',
    display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'15vh',
  },
  palette: {
    width:'100%', maxWidth:560,
    background:'var(--bg-card)',
    border:'1px solid var(--border-secondary)',
    borderRadius:16, boxShadow:'var(--shadow-lg)', overflow:'hidden',
  },
  inputRow: {
    display:'flex', alignItems:'center', gap:10, padding:'14px 16px',
    borderBottom:'1px solid var(--border-primary)',
  },
  searchIcon: { fontSize:18, color:'var(--text-muted)' },
  input: {
    flex:1, background:'transparent', border:'none', outline:'none',
    color:'var(--text-primary)', fontSize:16, fontFamily:'var(--font-mono)',
  },
  esc: {
    padding:'2px 6px', borderRadius:4, fontSize:11,
    background:'var(--bg-hover)', color:'var(--text-muted)',
    border:'1px solid var(--border-primary)',
  },
  list: { maxHeight:320, overflowY:'auto', padding:'6px 0' },
  item: {
    display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
    cursor:'pointer', transition:'background 0.1s',
  },
  itemActive: { background:'rgba(245,158,11,0.1)' },
  icon: { fontSize:18, width:24, textAlign:'center' },
  label: { flex:1, color:'var(--text-primary)', fontSize:14 },
  enter: {
    padding:'2px 6px', borderRadius:4, fontSize:11,
    background:'rgba(245,158,11,0.15)', color:'var(--accent-amber)',
    border:'1px solid var(--accent-amber)',
  },
  empty: { padding:'20px 16px', color:'var(--text-muted)', textAlign:'center', fontSize:14 },
  footer: {
    display:'flex', gap:16, padding:'8px 16px',
    borderTop:'1px solid var(--border-primary)',
    color:'var(--text-muted)', fontSize:11,
  },
};
