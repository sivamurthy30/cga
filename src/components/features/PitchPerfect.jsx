import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PitchPerfect() {
  const [recording, setRecording]   = useState(false);
  const [audioBlob, setAudioBlob]   = useState(null);
  const [audioUrl, setAudioUrl]     = useState(null);
  const [report, setReport]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [seconds, setSeconds]       = useState(0);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);

  const startRecording = async () => {
    setError(null);
    setReport(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const analyze = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', audioBlob, 'pitch.webm');
      const res  = await fetch('/api/pitch/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Analysis failed');
      setReport(await res.json());
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const SCORE_COLOR = v => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';

  const Ring = ({ value, label }) => {
    const r = 26, c = 2 * Math.PI * r;
    const color = SCORE_COLOR(value);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={32} cy={32} r={r} fill="none" stroke="var(--border-primary)" strokeWidth={5} />
            <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color }}>{value}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={s.page} className="deva-ui">
      <div style={s.header}>
        <h2 style={s.title}>🎙️ Pitch Perfect</h2>
        <p style={s.sub}>Record your elevator pitch and get feedback on pace, clarity, and delivery.</p>
      </div>

      <div style={s.layout}>
        {/* ── Left: Recorder ── */}
        <div style={s.card}>
          <div style={s.cardTitle}>Record Your Pitch</div>
          <p style={s.cardSub}>Keep it 30–60 seconds. Cover who you are, what you do, and what you're looking for.</p>

          {/* Record button */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 16px' }}>
            {!recording ? (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={startRecording} style={s.recordBtn}>
                🎙️ Start Recording
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={stopRecording} style={{ ...s.recordBtn, background: '#ef4444', boxShadow: '0 4px 20px rgba(239,68,68,0.35)' }}>
                ⏹ Stop &nbsp;{fmt(seconds)}
              </motion.button>
            )}
          </div>

          {recording && (
            <div style={s.recordingBar}>
              <span style={s.redDot} />
              <span style={{ fontSize: 13, color: '#ef4444' }}>Recording — {fmt(seconds)}</span>
            </div>
          )}

          {/* Audio player */}
          {audioUrl && (
            <div style={s.audioSection}>
              <audio controls src={audioUrl} style={{ width: '100%', borderRadius: 8 }} />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={analyze} disabled={loading} style={s.analyzeBtn}>
                {loading ? '⏳ Analysing...' : '🚀 Analyse My Pitch'}
              </motion.button>
            </div>
          )}

          {error && <div style={s.errorBox}>{error}</div>}

          {/* Tips */}
          <div style={s.tips}>
            <div style={s.tipsTitle}>Quick tips</div>
            <ul style={s.tipsList}>
              <li>Aim for 120–150 words per minute</li>
              <li>Pause instead of saying "um" or "uh"</li>
              <li>Vary your tone — flat delivery loses attention</li>
              <li>End with a clear next step or ask</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Report ── */}
        <div style={s.card}>
          {!report && !loading && (
            <div style={s.emptyReport}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎤</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
                Record and analyse your pitch to see your results here.
              </p>
            </div>
          )}

          {loading && (
            <div style={s.emptyReport}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ fontSize: 40, marginBottom: 12 }}>⏳</motion.div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Analysing your pitch...</p>
            </div>
          )}

          {report && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Grade */}
              <div style={s.gradeRow}>
                <div style={{ ...s.gradeBadge, background: SCORE_COLOR(report.overall) + '18', color: SCORE_COLOR(report.overall), borderColor: SCORE_COLOR(report.overall) }}>
                  {report.overall_grade}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {{ A: 'Excellent delivery', B: 'Good delivery', C: 'Needs practice', D: 'Keep working at it' }[report.overall_grade]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Overall score: {report.overall}/100</div>
                </div>
              </div>

              {/* Score rings */}
              <div style={s.rings}>
                <Ring value={report.confidence_score} label="Confidence" />
                <Ring value={report.clarity_score}    label="Clarity" />
                <Ring value={Math.min(100, Math.round((report.wpm / 150) * 100))} label="Pace" />
              </div>

              {/* WPM + Fillers */}
              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: SCORE_COLOR(Math.min(100, Math.round((report.wpm / 150) * 100))) }}>{report.wpm}</div>
                  <div style={s.statLabel}>WPM</div>
                  <div style={s.statNote}>{report.wpm < 100 ? 'Too slow' : report.wpm > 160 ? 'Too fast' : 'Good pace'}</div>
                </div>
                <div style={s.statBox}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: report.filler_count > 5 ? '#ef4444' : '#10b981' }}>{report.filler_count}</div>
                  <div style={s.statLabel}>Filler words</div>
                  <div style={s.statNote}>{report.filler_count > 5 ? 'Try to reduce' : 'Well controlled'}</div>
                </div>
              </div>

              {/* Filler breakdown */}
              {Object.keys(report.filler_breakdown || {}).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {Object.entries(report.filler_breakdown).map(([w, n]) => (
                    <span key={w} style={s.fillerTag}>"{w}" ×{n}</span>
                  ))}
                </div>
              )}

              {/* Transcript */}
              {report.transcript_preview && (
                <div style={s.transcript}>
                  <div style={s.transcriptLabel}>Transcript preview</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                    "{report.transcript_preview}"
                  </p>
                </div>
              )}

              {/* Feedback */}
              <div style={s.feedbackGrid}>
                <div>
                  <div style={s.feedbackTitle}>What worked</div>
                  {(report.strengths || []).map((s, i) => (
                    <div key={i} style={s2.feedItem}>✓ {s}</div>
                  ))}
                </div>
                <div>
                  <div style={s.feedbackTitle}>To improve</div>
                  {(report.improvements || []).map((s, i) => (
                    <div key={i} style={s2.feedItem}>→ {s}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

const s = {
  page:         { padding: '0 24px 32px', color: 'var(--text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' },
  header:       { marginBottom: 24 },
  title:        { margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' },
  sub:          { margin: '5px 0 0', fontSize: 13, color: 'var(--text-secondary)' },
  layout:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card:         { background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 16, padding: 22 },
  cardTitle:    { fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' },
  cardSub:      { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 },
  recordBtn:    { padding: '12px 28px', borderRadius: 50, background: 'var(--accent-error, #ef4444)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.25)' },
  recordingBar: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 },
  redDot:       { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' },
  audioSection: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  analyzeBtn:   { padding: '11px', borderRadius: 10, background: 'var(--accent-primary)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' },
  errorBox:     { padding: '9px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: 'var(--accent-error)', fontSize: 13, marginBottom: 12 },
  tips:         { background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', marginTop: 8 },
  tipsTitle:    { fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 7 },
  tipsList:     { margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.9 },
  emptyReport:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  gradeRow:     { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  gradeBadge:   { width: 56, height: 56, borderRadius: '50%', border: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 },
  rings:        { display: 'flex', justifyContent: 'space-around', marginBottom: 18 },
  statsRow:     { display: 'flex', gap: 12, marginBottom: 14 },
  statBox:      { flex: 1, background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px', textAlign: 'center', border: '1px solid var(--border-primary)' },
  statLabel:    { fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 },
  statNote:     { fontSize: 11, color: 'var(--text-muted)', marginTop: 3 },
  fillerTag:    { padding: '3px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' },
  transcript:   { background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: '1px solid var(--border-primary)' },
  transcriptLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  feedbackTitle:{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
};

const s2 = {
  feedItem: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 7, lineHeight: 1.4, border: '1px solid var(--border-primary)' },
};
