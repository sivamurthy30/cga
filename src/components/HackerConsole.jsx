import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';

const HELP_TEXT = `Available commands:
  /status    — Show your XP, streak, and progress
  /skills    — List your assessed skills
  /roadmap   — Show current roadmap info
  /clear     — Clear the console
  /help      — Show this help
  /whoami    — Show your profile
  /theme     — Toggle dark/light mode
  /version   — Show DEVA version`;

export default function HackerConsole({ learnerProfile, currentUser, onTheme }) {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState('');
  const [history, setHistory]     = useState([{ type:'system', text:'DEVA Terminal v2.0 — Type /help for commands' }]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIdx, setCmdIdx]       = useState(-1);
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);
  const { totalXP, streak, completedNodes, currentRoadmap } = useRoadmapStore();

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [history]);

  const push = (text, type = 'output') => setHistory(h => [...h, { type, text }]);

  const execute = cmd => {
    const trimmed = cmd.trim().toLowerCase();
    push(`> ${cmd}`, 'input');
    if (!trimmed.startsWith('/')) { push('Unknown command. Type /help for available commands.', 'error'); return; }
    const [command] = trimmed.split(' ');
    switch (command) {
      case '/help':   push(HELP_TEXT, 'info'); break;
      case '/clear':  setHistory([{ type:'system', text:'Console cleared.' }]); break;
      case '/status': {
        const nodes = completedNodes?.[currentRoadmap]?.size || 0;
        push(`XP: ${totalXP||0} pts\nStreak: ${streak||0} days\nNodes: ${nodes}\nRoadmap: ${currentRoadmap||'None'}`, 'output');
        break;
      }
      case '/skills': {
        const skills = Object.entries(learnerProfile?.assessmentResults || {});
        if (!skills.length) { push('No skills assessed yet.', 'warn'); break; }
        push('Assessed Skills:\n' + skills.map(([s,r]) => `  ${s.padEnd(20)} ${r.level||'beginner'} (${r.weightedPercentage||0}%)`).join('\n'), 'output');
        break;
      }
      case '/roadmap':
        push(`Roadmap: ${currentRoadmap||'None'}\nRole: ${learnerProfile?.targetRole||'Not set'}\nNodes: ${completedNodes?.[currentRoadmap]?.size||0}`, 'output');
        break;
      case '/whoami':
        push(`Name: ${currentUser?.name||'Unknown'}\nEmail: ${currentUser?.email||'Unknown'}\nRole: ${learnerProfile?.targetRole||'Not set'}`, 'output');
        break;
      case '/theme':  onTheme?.(); push('Theme toggled.', 'output'); break;
      case '/version': push('DEVA v2.0.0 — Intelligent Career Development Platform\nBuild: 2026.04.22', 'info'); break;
      default: push(`Command not found: ${command}. Type /help.`, 'error');
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && input.trim()) {
      execute(input); setCmdHistory(h => [input,...h].slice(0,50)); setCmdIdx(-1); setInput('');
    } else if (e.key === 'ArrowUp') {
      const next = Math.min(cmdIdx+1, cmdHistory.length-1); setCmdIdx(next); setInput(cmdHistory[next]||'');
    } else if (e.key === 'ArrowDown') {
      const next = Math.max(cmdIdx-1, -1); setCmdIdx(next); setInput(next===-1?'':cmdHistory[next]);
    }
  };

  // Color map uses design-system-compatible values
  const typeColor = {
    system: 'var(--text-muted)',
    input:  'var(--accent-amber)',
    output: 'var(--text-primary)',
    error:  'var(--accent-error)',
    warn:   'var(--accent-amber)',
    info:   'var(--accent-info)',
  };

  return (
    <div className="deva-ui">
      <motion.button whileHover={{ scale:1.05 }} onClick={() => setOpen(o => !o)}
        style={s.toggle} title="Hacker Console">
        {open ? '▼ console' : '▲ console'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:220, opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }} style={s.console}>
            <div style={s.output}>
              {history.map((line, i) => (
                <div key={i} style={{ color: typeColor[line.type]||'var(--text-primary)', whiteSpace:'pre-wrap', fontSize:12, lineHeight:1.6 }}>
                  {line.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={s.inputRow}>
              <span style={s.prompt}>deva@career:~$</span>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey} style={s.input} placeholder="type /help"
                spellCheck={false} autoComplete="off" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  toggle: {
    position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
    zIndex:900, background:'var(--bg-card)',
    border:'1px solid var(--border-primary)',
    borderBottom:'none', borderRadius:'8px 8px 0 0',
    color:'var(--text-muted)', fontSize:11, padding:'4px 16px',
    cursor:'pointer', fontFamily:'var(--font-mono)', letterSpacing:'0.05em',
  },
  console: {
    position:'fixed', bottom:0, left:0, right:0, zIndex:899,
    background:'var(--bg-secondary)',
    borderTop:'2px solid var(--accent-amber)',
    display:'flex', flexDirection:'column', overflow:'hidden',
  },
  output: {
    flex:1, overflowY:'auto', padding:'10px 16px',
    fontFamily:'var(--font-mono)',
  },
  inputRow: {
    display:'flex', alignItems:'center', gap:8, padding:'6px 16px',
    borderTop:'1px solid var(--border-primary)',
    background:'var(--bg-card)',
  },
  prompt: { color:'var(--accent-amber)', fontSize:12, fontFamily:'var(--font-mono)', whiteSpace:'nowrap' },
  input: {
    flex:1, background:'transparent', border:'none', outline:'none',
    color:'var(--text-primary)', fontSize:12, fontFamily:'var(--font-mono)',
  },
};
