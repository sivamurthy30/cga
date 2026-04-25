import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const GRADE_COLORS = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' };
const GRADE_LABELS = { A: 'Senior Leader', B: 'Confident Pro', C: 'Developing', D: 'Needs Work' };

export default function PitchPerfect() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError(null);
    setReport(null);
    setAudioBlob(null);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', audioBlob, 'pitch.webm');
      const res = await fetch('/api/pitch/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setReport(data);
    } catch (e) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ScoreRing = ({ value, label, color }) => {
    const r = 28, c = 2 * Math.PI * r;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ position: 'relative', width: 72, height: 72 }}>
          <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={36} cy={36} r={r} fill="none" stroke="var(--border-secondary)" strokeWidth={5} />
            <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color }}>{value}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
    );
  };

  return (
    <div style={styles.container} className="deva-ui">
      <div style={styles.header}>
        <h2 style={styles.title}>🎙️ Pitch-Perfect</h2>
        <p style={styles.subtitle}>Practice your elevator pitch. AI analyzes your WPM, filler words, and confidence.</p>
      </div>

      <div style={styles.layout}>
        {/* Recorder */}
        <div style={styles.recorderCard}>
          <div style={styles.recorderTitle}>Record Your Pitch</div>
          <p style={styles.recorderHint}>
            Aim for 30–60 seconds. Introduce yourself, your skills, and your career goal.
          </p>

          <div style={styles.recorderControls}>
            {!recording ? (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                style={styles.recordBtn}
              >
                🎙️ Start Recording
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                style={{ ...styles.recordBtn, background: '#ef4444', animation: 'pulse 1.5s infinite' }}
              >
                ⏹ Stop Recording
              </motion.button>
            )}
          </div>

          {recording && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={styles.recordingIndicator}
            >
              <span style={styles.redDot} />
              Recording in progress...
            </motion.div>
          )}

          {audioUrl && (
            <div style={styles.audioSection}>
              <audio controls src={audioUrl} style={styles.audioPlayer} />
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={analyzeAudio}
                disabled={loading}
                style={styles.analyzeBtn}
              >
                {loading ? '🔍 Analyzing...' : '🚀 Analyze My Pitch'}
              </motion.button>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.tips}>
            <div style={styles.tipsTitle}>💡 Tips for a great pitch:</div>
            <ul style={styles.tipsList}>
              <li>Speak at 120–150 WPM (conversational pace)</li>
              <li>Avoid "um", "uh", "like" — pause instead</li>
              <li>Vary your tone — monotone = low confidence</li>
              <li>End with a clear call-to-action</li>
            </ul>
          </div>
        </div>

        {/* Report */}
        <div style={styles.reportCard}>
          {!report && !loading && (
            <div style={styles.emptyReport}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎤</div>
              <p>Record and analyze your pitch to get a detailed report.</p>
            </div>
          )}

          {loading && (
            <div style={styles.emptyReport}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
              <p>AI is analyzing your pitch...</p>
            </div>
          )}

          {report && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Grade */}
              <div style={styles.gradeSection}>
                <div style={{ ...styles.gradeBadge, background: GRADE_COLORS[report.overall_grade] + '22', color: GRADE_COLORS[report.overall_grade], borderColor: GRADE_COLORS[report.overall_grade] }}>
                  {report.overall_grade}
                </div>
                <div>
                  <div style={styles.gradeLabel}>{GRADE_LABELS[report.overall_grade]}</div>
                  <div style={styles.gradeSubtitle}>Overall Assessment</div>
                </div>
              </div>

              {/* Score rings */}
              <div style={styles.scoresRow}>
                <ScoreRing value={report.confidence_score} label="Confidence" color="#f59e0b" />
                <ScoreRing value={report.clarity_score} label="Clarity" color="#3b82f6" />
                <ScoreRing value={Math.min(100, Math.round((report.wpm / 150) * 100))} label="Pace" color="#10b981" />
              </div>

              {/* WPM + Fillers */}
              <div style={styles.statsRow}>
                <div style={styles.statCard}>
                  <div style={styles.statNum}>{report.wpm}</div>
                  <div style={styles.statLabel}>WPM</div>
                  <div style={styles.statNote}>{report.wpm < 100 ? 'Too slow' : report.wpm > 160 ? 'Too fast' : 'Perfect pace'}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ ...styles.statNum, color: report.filler_count > 5 ? '#ef4444' : '#10b981' }}>{report.filler_count}</div>
                  <div style={styles.statLabel}>Filler Words</div>
                  <div style={styles.statNote}>{report.filler_count > 5 ? 'Reduce these' : 'Great control'}</div>
                </div>
              </div>

              {/* Filler breakdown */}
              {Object.keys(report.filler_breakdown || {}).length > 0 && (
                <div style={styles.fillerBreakdown}>
                  {Object.entries(report.filler_breakdown).map(([word, count]) => (
                    <span key={word} style={styles.fillerTag}>"{word}" ×{count}</span>
                  ))}
                </div>
              )}

              {/* Transcript preview */}
              {report.transcript_preview && (
                <div style={styles.transcript}>
                  <div style={styles.transcriptLabel}>Transcript Preview</div>
                  <p style={styles.transcriptText}>"{report.transcript_preview}"</p>
                </div>
              )}

              {/* Strengths & Improvements */}
              <div style={styles.feedbackGrid}>
                <div>
                  <div style={styles.feedbackTitle}>✅ Strengths</div>
                  {report.strengths?.map((s, i) => (
                    <div key={i} style={styles.feedbackItem}>{s}</div>
                  ))}
                </div>
                <div>
                  <div style={styles.feedbackTitle}>🎯 Improvements</div>
                  {report.improvements?.map((s, i) => (
                    <div key={i} style={styles.feedbackItem}>{s}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '0 24px 24px', color: 'var(--text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subtitle: { margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  recorderCard: {
    background: 'var(--bg-card)', borderRadius: 16,
    border: '1px solid var(--border-primary)', padding: '20px',
  },
  recorderTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  recorderHint: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 },
  recorderControls: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  recordBtn: {
    padding: '14px 28px', borderRadius: 50,
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: 'none', color: 'white', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
  },
  recordingIndicator: {
    display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
    color: '#ef4444', fontSize: 13, marginBottom: 12,
  },
  redDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
    animation: 'pulse 1s infinite',
  },
  audioSection: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  audioPlayer: { width: '100%', borderRadius: 8 },
  analyzeBtn: {
    padding: '12px', borderRadius: 10,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
    cursor: 'pointer',
  },
  error: { color: 'var(--accent-error)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 },
  tips: { background: 'var(--bg-hover)', borderRadius: 10, padding: '12px' },
  tipsTitle: { fontSize: 13, fontWeight: 600, marginBottom: 8 },
  tipsList: { margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.8 },
  reportCard: {
    background: 'var(--bg-card)', borderRadius: 16,
    border: '1px solid var(--border-primary)', padding: '20px',
    overflowY: 'auto',
  },
  emptyReport: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 300,
    color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14,
  },
  gradeSection: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  gradeBadge: {
    width: 64, height: 64, borderRadius: '50%', border: '3px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 900, flexShrink: 0,
  },
  gradeLabel: { fontSize: 18, fontWeight: 700 },
  gradeSubtitle: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
  scoresRow: { display: 'flex', justifyContent: 'space-around', marginBottom: 20 },
  statsRow: { display: 'flex', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, background: 'var(--bg-hover)', borderRadius: 10,
    padding: '12px', textAlign: 'center',
  },
  statNum: { fontSize: 28, fontWeight: 800, color: '#f59e0b' },
  statLabel: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
  statNote: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 },
  fillerBreakdown: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  fillerTag: {
    padding: '3px 8px', borderRadius: 6, fontSize: 11,
    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  transcript: { marginBottom: 16 },
  transcriptLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' },
  transcriptText: { fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  feedbackTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8 },
  feedbackItem: {
    fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6,
    padding: '6px 10px', background: 'var(--bg-hover)',
    borderRadius: 6, lineHeight: 1.4,
  },
};
