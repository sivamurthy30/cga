import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';

const TRACKS = [
  { id: 'lofi1', label: 'Lo-Fi Study Beats', emoji: '🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'lofi2', label: 'Deep Focus Flow',   emoji: '🌊', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'lofi3', label: 'Midnight Coding',   emoji: '🌙', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const POMODORO_WORK  = 25 * 60;
const POMODORO_BREAK =  5 * 60;

export default function DeepWorkPlayer() {
  const [open, setOpen]               = useState(false);
  const [playing, setPlaying]         = useState(false);
  const [trackIdx, setTrackIdx]       = useState(0);
  const [volume, setVolume]           = useState(0.4);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime]     = useState(POMODORO_WORK);
  const [isBreak, setIsBreak]         = useState(false);
  const [sessions, setSessions]       = useState(0);
  const audioRef  = useRef(null);
  const timerRef  = useRef(null);
  const { completedNodes, currentRoadmap } = useRoadmapStore();

  const totalCompleted = completedNodes?.[currentRoadmap]?.size || 0;
  const prevCompleted  = useRef(totalCompleted);

  useEffect(() => {
    if (totalCompleted > prevCompleted.current && pomodoroActive) {
      setPomodoroTime(POMODORO_WORK);
      setIsBreak(false);
      setSessions(s => s + 1);
    }
    prevCompleted.current = totalCompleted;
  }, [totalCompleted, pomodoroActive]);

  useEffect(() => {
    if (!pomodoroActive) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setPomodoroTime(t => {
        if (t <= 1) {
          setIsBreak(b => {
            const next = !b;
            setPomodoroTime(next ? POMODORO_BREAK : POMODORO_WORK);
            if (!next) setSessions(s => s + 1);
            return next;
          });
          return isBreak ? POMODORO_WORK : POMODORO_BREAK;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [pomodoroActive, isBreak]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing, volume, trackIdx]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const pct = pomodoroTime / (isBreak ? POMODORO_BREAK : POMODORO_WORK);
  const circumference = 2 * Math.PI * 28;

  return (
    <div className="deva-ui">
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)} style={s.fab} title="Deep Work Player">
        {playing ? '🎵' : '🎧'}
        {pomodoroActive && <span style={s.fabBadge}>{fmt(pomodoroTime)}</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:20, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.95 }} transition={{ duration:0.2 }} style={s.panel}>

            <div style={s.header}>
              <span style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>🎧 Deep Work Player</span>
              <button onClick={() => setOpen(false)} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.tracks}>
              {TRACKS.map((t, i) => (
                <button key={t.id} onClick={() => { setTrackIdx(i); setPlaying(true); }}
                  style={{ ...s.trackBtn, ...(i === trackIdx ? s.trackActive : {}) }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            <div style={s.controls}>
              <button onClick={() => setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length)} style={s.ctrlBtn}>⏮</button>
              <button onClick={() => setPlaying(p => !p)} style={s.playBtn}>{playing ? '⏸' : '▶'}</button>
              <button onClick={() => setTrackIdx(i => (i + 1) % TRACKS.length)} style={s.ctrlBtn}>⏭</button>
            </div>

            <div style={s.volumeRow}>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>🔈</span>
              <input type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => setVolume(+e.target.value)} style={s.slider} />
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>🔊</span>
            </div>

            <div style={s.pomodoroSection}>
              <div style={s.pomodoroHeader}>
                <span style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>
                  {isBreak ? '☕ Break Time' : '🍅 Focus Session'}
                </span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{sessions} sessions today</span>
              </div>

              <div style={s.timerRing}>
                <svg width={72} height={72} style={{ transform:'rotate(-90deg)' }}>
                  <circle cx={36} cy={36} r={28} fill="none" stroke="var(--border-secondary)" strokeWidth={4} />
                  <circle cx={36} cy={36} r={28} fill="none"
                    stroke={isBreak ? 'var(--accent-success)' : 'var(--accent-amber)'}
                    strokeWidth={4} strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct)} strokeLinecap="round"
                    style={{ transition:'stroke-dashoffset 1s linear' }} />
                </svg>
                <span style={s.timerText}>{fmt(pomodoroTime)}</span>
              </div>

              <div style={s.pomodoroActions}>
                <button onClick={() => setPomodoroActive(a => !a)}
                  style={{ ...s.pomBtn, background: pomodoroActive ? 'var(--accent-error)' : 'var(--accent-amber)', color: '#000' }}>
                  {pomodoroActive ? '⏹ Stop' : '▶ Start'}
                </button>
                <button onClick={() => { setPomodoroTime(POMODORO_WORK); setIsBreak(false); setPomodoroActive(false); }}
                  style={s.pomBtnSecondary}>↺ Reset</button>
              </div>

              {totalCompleted > 0 && (
                <div style={s.syncNote}>✓ Synced with {totalCompleted} node{totalCompleted !== 1 ? 's' : ''}</div>
              )}
            </div>

            <audio ref={audioRef} src={TRACKS[trackIdx].url} loop preload="none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  fab: {
    position:'fixed', bottom:100, right:24, zIndex:1000,
    width:52, height:52, borderRadius:'50%',
    background:'var(--bg-card)',
    border:'1px solid var(--border-primary)',
    fontSize:22, cursor:'pointer',
    boxShadow:'var(--shadow-md)',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexDirection:'column', gap:0,
  },
  fabBadge: { fontSize:8, color:'var(--accent-amber)', fontFamily:'var(--font-mono)', lineHeight:1, marginTop:-2 },
  panel: {
    position:'fixed', bottom:164, right:24, zIndex:1001, width:280,
    background:'var(--bg-card)',
    border:'1px solid var(--border-primary)',
    borderRadius:16, boxShadow:'var(--shadow-lg)', overflow:'hidden',
  },
  header: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 14px', borderBottom:'1px solid var(--border-primary)',
  },
  closeBtn: { background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:14 },
  tracks: { padding:'8px 10px', display:'flex', flexDirection:'column', gap:4 },
  trackBtn: {
    padding:'6px 10px', borderRadius:8, border:'1px solid var(--border-primary)',
    background:'transparent', color:'var(--text-secondary)', cursor:'pointer',
    fontSize:12, textAlign:'left', transition:'all 0.15s',
  },
  trackActive: { background:'rgba(245,158,11,0.12)', color:'var(--accent-amber)', borderColor:'var(--accent-amber)' },
  controls: { display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'8px 0' },
  ctrlBtn: { background:'none', border:'none', color:'var(--text-secondary)', fontSize:18, cursor:'pointer' },
  playBtn: {
    width:44, height:44, borderRadius:'50%',
    background:'var(--accent-amber)', border:'none', fontSize:18, cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center', color:'#000',
    boxShadow:'0 4px 12px rgba(245,158,11,0.35)',
  },
  volumeRow: { display:'flex', alignItems:'center', gap:8, padding:'0 14px 10px' },
  slider: { flex:1, accentColor:'var(--accent-amber)' },
  pomodoroSection: { padding:'12px 14px', borderTop:'1px solid var(--border-primary)' },
  pomodoroHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  timerRing: {
    position:'relative', width:72, height:72, margin:'0 auto 12px',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  timerText: {
    position:'absolute', fontSize:14, fontWeight:700,
    fontFamily:'var(--font-mono)', color:'var(--text-primary)',
  },
  pomodoroActions: { display:'flex', gap:8, justifyContent:'center' },
  pomBtn: { padding:'6px 16px', borderRadius:8, border:'none', fontWeight:600, fontSize:12, cursor:'pointer' },
  pomBtnSecondary: {
    padding:'6px 12px', borderRadius:8,
    background:'var(--bg-hover)', border:'1px solid var(--border-primary)',
    color:'var(--text-secondary)', fontSize:12, cursor:'pointer',
  },
  syncNote: { marginTop:8, fontSize:11, color:'var(--accent-success)', textAlign:'center' },
};
