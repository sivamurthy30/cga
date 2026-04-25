import { useState } from 'react';
import { motion } from 'framer-motion';

const CHALLENGES = [
  { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', language: 'python', expectedComplexity: 'O(n)',
    description: 'Given an array of integers, return indices of the two numbers that add up to a target.',
    starter: `def two_sum(nums, target):\n    # Your solution here\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n` },
  { id: 'reverse-string', title: 'Reverse a String', difficulty: 'Easy', language: 'javascript', expectedComplexity: 'O(n)',
    description: 'Write a function that reverses a string in-place.',
    starter: `function reverseString(s) {\n  // Your solution here\n  return s.split('').reverse().join('');\n}` },
  { id: 'find-duplicates', title: 'Find Duplicates', difficulty: 'Medium', language: 'python', expectedComplexity: 'O(n)',
    description: 'Find all duplicates in an array where elements are in range [1, n].',
    starter: `def find_duplicates(nums):\n    result = []\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] == nums[j] and nums[i] not in result:\n                result.append(nums[i])\n    return result\n` },
  { id: 'lru-cache', title: 'LRU Cache', difficulty: 'Hard', language: 'python', expectedComplexity: 'O(1)',
    description: 'Implement an LRU (Least Recently Used) cache with O(1) get and put.',
    starter: `class LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = {}\n    \n    def get(self, key):\n        # Your solution here\n        pass\n    \n    def put(self, key, value):\n        # Your solution here\n        pass\n` },
];

const SEVERITY_COLORS = { critical: '#ef4444', warning: '#f59e0b', info: '#60a5fa' };
const TYPE_ICONS = { security: '🛡️', efficiency: '⚡', style: '✨' };

export default function GhostHunterReviewer() {
  const [selectedChallenge, setSelectedChallenge] = useState(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starter);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customLang, setCustomLang] = useState('python');

  const handleReview = async () => {
    setLoading(true);
    setReview(null);
    try {
      const res = await fetch('/api/code/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: customMode ? customLang : selectedChallenge.language,
          challenge_title: customMode ? null : selectedChallenge.title,
          expected_complexity: customMode ? null : selectedChallenge.expectedComplexity,
        }),
      });
      const data = await res.json();
      setReview(data);
    } catch {
      setReview({
        overall_score: 0,
        complexity: 'Unknown',
        issues: [{ type: 'info', severity: 'warning', line_hint: null, message: 'Backend unavailable', suggestion: 'Check your server connection.' }],
        refactored_snippet: null,
        summary: 'Could not reach the code review service.',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectChallenge = (c) => {
    setSelectedChallenge(c);
    setCode(c.starter);
    setReview(null);
    setCustomMode(false);
  };

  const scoreColor = review ? (review.overall_score >= 80 ? '#10b981' : review.overall_score >= 60 ? '#f59e0b' : '#ef4444') : '#64748b';

  return (
    <div style={styles.container} className="deva-ui">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔍 Ghost-Hunter Code Reviewer</h2>
          <p style={styles.subtitle}>Submit code for a Security & Efficiency audit. Build production-ready habits.</p>
        </div>
        <button onClick={() => setCustomMode(m => !m)} style={styles.customBtn}>
          {customMode ? '📋 Use Challenge' : '✏️ Custom Code'}
        </button>
      </div>

      <div style={styles.layout}>
        {/* Left: Challenge selector + editor */}
        <div style={styles.left}>
          {!customMode && (
            <div style={styles.challenges}>
              {CHALLENGES.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectChallenge(c)}
                  style={{ ...styles.challengeBtn, ...(c.id === selectedChallenge.id ? styles.challengeActive : {}) }}
                >
                  <span style={styles.challengeTitle}>{c.title}</span>
                  <span style={{
                    ...styles.diffBadge,
                    background: c.difficulty === 'Easy' ? 'rgba(16,185,129,0.15)' : c.difficulty === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: c.difficulty === 'Easy' ? '#10b981' : c.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                  }}>{c.difficulty}</span>
                </button>
              ))}
            </div>
          )}

          {!customMode && (
            <div style={styles.challengeDesc}>
              <strong>{selectedChallenge.title}</strong> — {selectedChallenge.description}
              <span style={styles.expectedComplexity}>Expected: {selectedChallenge.expectedComplexity}</span>
            </div>
          )}

          {customMode && (
            <div style={styles.langRow}>
              <label style={styles.langLabel}>Language:</label>
              {['python', 'javascript', 'java', 'cpp', 'go'].map(l => (
                <button key={l} onClick={() => setCustomLang(l)}
                  style={{ ...styles.langBtn, ...(l === customLang ? styles.langActive : {}) }}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={styles.editorWrapper}>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={styles.codeTextarea}
            />
          </div>

          <button onClick={handleReview} disabled={loading} style={styles.reviewBtn}>
            {loading ? '🔍 Analyzing...' : '🚀 Run Ghost-Hunter Review'}
          </button>
        </div>

        {/* Right: Review results */}
        <div style={styles.right}>
          {!review && !loading && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👻</div>
              <p>Submit your code to hunt for ghosts — hidden bugs, security holes, and inefficiencies.</p>
            </div>
          )}

          {loading && (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12, animation: 'spin 1s linear infinite' }}>🔍</div>
              <p>Analyzing your code...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {review && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Score */}
              <div style={styles.scoreRow}>
                <div style={{ ...styles.scoreBadge, borderColor: scoreColor, color: scoreColor }}>
                  {review.overall_score}/100
                </div>
                <div>
                  <div style={styles.complexityLabel}>Complexity: <strong>{review.complexity}</strong></div>
                  <div style={styles.summary}>{review.summary}</div>
                </div>
              </div>

              {/* Issues */}
              <div style={styles.issuesSection}>
                <div style={styles.sectionTitle}>Issues Found ({review.issues?.length || 0})</div>
                {review.issues?.map((issue, i) => (
                  <div key={i} style={{ ...styles.issueCard, borderLeftColor: SEVERITY_COLORS[issue.severity] }}>
                    <div style={styles.issueHeader}>
                      <span>{TYPE_ICONS[issue.type] || '⚠️'} {issue.type}</span>
                      <span style={{ ...styles.severityBadge, color: SEVERITY_COLORS[issue.severity] }}>
                        {issue.severity}
                      </span>
                    </div>
                    {issue.line_hint && <div style={styles.lineHint}>📍 {issue.line_hint}</div>}
                    <div style={styles.issueMsg}>{issue.message}</div>
                    <div style={styles.issueSuggestion}>💡 {issue.suggestion}</div>
                  </div>
                ))}
              </div>

              {/* Refactored snippet */}
              {review.refactored_snippet && (
                <div style={styles.refactorSection}>
                  <div style={styles.sectionTitle}>✨ Suggested Refactor</div>
                  <pre style={styles.codeBlock}>{review.refactored_snippet}</pre>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-primary)', minHeight: '100vh',
    padding: '0 24px 24px', color: 'var(--text-primary)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subtitle: { margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 },
  customBtn: {
    padding: '8px 16px', borderRadius: 8,
    background: 'var(--bg-hover)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  left: { display: 'flex', flexDirection: 'column', gap: 12 },
  challenges: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  challengeBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderRadius: 8,
    background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
    transition: 'all 0.15s',
  },
  challengeActive: {
    background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)',
    color: 'var(--text-primary)',
  },
  challengeTitle: { fontWeight: 600 },
  diffBadge: { padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
  challengeDesc: {
    padding: '10px 14px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
  },
  expectedComplexity: {
    display: 'block', marginTop: 6, color: '#f59e0b', fontWeight: 600, fontSize: 12,
  },
  langRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  langLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  langBtn: {
    padding: '4px 10px', borderRadius: 6, fontSize: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  langActive: { background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' },
  editorWrapper: { borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-primary)' },
  codeTextarea: {
    width: '100%', height: 320, background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', border: 'none', outline: 'none',
    fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
    lineHeight: 1.6, padding: '12px', resize: 'vertical',
    boxSizing: 'border-box', tabSize: 2,
  },
  reviewBtn: {
    padding: '12px', borderRadius: 10,
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none', color: 'white', fontWeight: 700, fontSize: 15,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  right: {
    background: 'var(--bg-card)', borderRadius: 12,
    border: '1px solid var(--border-primary)',
    padding: '16px', overflowY: 'auto', maxHeight: '80vh',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', minHeight: 300,
    color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14,
  },
  scoreRow: {
    display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16,
  },
  scoreBadge: {
    width: 72, height: 72, borderRadius: '50%',
    border: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, flexShrink: 0,
  },
  complexityLabel: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 },
  summary: { fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 },
  issuesSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  issueCard: {
    padding: '10px 12px', borderRadius: 8, marginBottom: 8,
    background: 'var(--bg-hover)', borderLeft: '3px solid',
  },
  issueHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  severityBadge: { fontSize: 11, fontWeight: 700 },
  lineHint: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 },
  issueMsg: { fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 },
  issueSuggestion: { fontSize: 12, color: 'var(--accent-info)' },
  refactorSection: { marginTop: 8 },
  codeBlock: {
    background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px',
    fontSize: 12, color: 'var(--text-primary)', overflowX: 'auto',
    fontFamily: 'var(--font-mono)', lineHeight: 1.6,
    border: '1px solid var(--border-primary)',
  },
};
