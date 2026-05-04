import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_COLORS = {
  engineering: '#7c3aed', leadership: '#0891b2',
  productivity: '#4f46e5', finance: '#15803d',
};

export default function ExecutiveVault({ isPro = false, onUpgradeClick }) {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'resume'
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [tailored, setTailored] = useState(null);
  const [tailoring, setTailoring] = useState(false);

  useEffect(() => {
    fetch('/api/vault/books')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setBooks(d.books))
      .catch(() => {});
  }, []);

  const openBook = async (book) => {
    if (!isPro) { onUpgradeClick?.(); return; }
    setSelected(book);
    setSummary(null);
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/vault/books/${book.id}/summary`);
      const data = await res.json();
      setSummary(data);
    } catch { setSummary(null); }
    finally { setLoadingSummary(false); }
  };

  const tailorResume = async () => {
    if (!isPro) { onUpgradeClick?.(); return; }
    setTailoring(true);
    setTailored(null);
    try {
      const res = await fetch('/api/vault/resume/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, job_description: jobDesc }),
      });
      setTailored(await res.json());
    } catch { setTailored({ error: 'Tailoring failed. Try again.' }); }
    finally { setTailoring(false); }
  };

  return (
    <div style={s.container} className="deva-ui">
      <div style={s.header}>
        <div>
          <h2 style={s.title}>💎 Executive Vault</h2>
          <p style={s.subtitle}>Premium resources to accelerate your career trajectory</p>
        </div>
        {!isPro && (
          <button onClick={onUpgradeClick} style={s.upgradeBtn}>⭐ Unlock Pro</button>
        )}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[['library', '📚 Book Library'], ['resume', '📄 Resume Tailor']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ ...s.tab, ...(activeTab === id ? s.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* Book Library */}
      {activeTab === 'library' && (
        <div style={s.bookGrid}>
          {books.map(book => (
            <motion.div key={book.id} whileHover={{ y: -4, scale: 1.02 }}
              style={{ ...s.bookCard, borderColor: CATEGORY_COLORS[book.category] + '44' }}
              onClick={() => openBook(book)}>
              <div style={{ ...s.bookCover, background: book.cover || '#1e293b' }}>
                <span style={s.bookInitial}>{book.title[0]}</span>
              </div>
              <div style={s.bookInfo}>
                <div style={s.bookTitle}>{book.title}</div>
                <div style={s.bookAuthor}>{book.author}</div>
                <div style={{ ...s.bookCategory, color: CATEGORY_COLORS[book.category] || '#f59e0b' }}>
                  {book.category}
                </div>
              </div>
              {!isPro && <div style={s.lockOverlay}>🔒</div>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Resume Tailor */}
      {activeTab === 'resume' && (
        <div style={s.resumeSection} className="deva-ui">
          <div style={s.resumeGrid}>
            <div>
              <label style={s.label}>Your Resume (paste text)</label>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..." style={s.textarea} />
            </div>
            <div>
              <label style={s.label}>Job Description</label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description here..." style={s.textarea} />
            </div>
          </div>
          <button onClick={tailorResume} disabled={tailoring || !resumeText || !jobDesc}
            style={s.tailorBtn}>
            {tailoring ? '✨ Tailoring...' : '✨ Tailor My Resume with AI'}
          </button>

          {tailored && !tailored.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.tailoredResult}>
              <div style={s.atsScore}>
                ATS Match Score: <strong style={{ color: tailored.ats_score >= 70 ? '#10b981' : '#f59e0b' }}>
                  {tailored.ats_score}%
                </strong>
              </div>
              <div style={s.sectionTitle}>✨ Tailored Bullets</div>
              {tailored.tailored_bullets?.map((b, i) => (
                <div key={i} style={s.bullet}>• {b}</div>
              ))}
              <div style={s.sectionTitle}>🔑 Keywords Added</div>
              <div style={s.keywords}>
                {tailored.keywords_added?.map(k => (
                  <span key={k} style={s.keyword}>{k}</span>
                ))}
              </div>
              {tailored.note && <div style={s.note}>💡 {tailored.note}</div>}
            </motion.div>
          )}
        </div>
      )}

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={s.modalOverlay} onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }} style={s.modal} onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
              <div style={{ ...s.modalCover, background: selected.cover || '#1e293b' }}>
                <span style={s.modalInitial}>{selected.title[0]}</span>
              </div>
              <h3 style={s.modalTitle}>{selected.title}</h3>
              <p style={s.modalAuthor}>by {selected.author}</p>

              {loadingSummary && <div style={s.loading}>⏳ Generating 15-min summary...</div>}

              {summary && !loadingSummary && (
                <>
                  <p style={s.summaryText}>{summary.summary}</p>
                  <div style={s.sectionTitle}>Key Takeaways</div>
                  {summary.key_takeaways?.map((t, i) => (
                    <div key={i} style={s.takeaway}>
                      <span style={s.takeawayNum}>{i + 1}</span>
                      <span>{t}</span>
                    </div>
                  ))}
                  {summary.career_impact && (
                    <div style={s.careerImpact}>🚀 {summary.career_impact}</div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  container: { padding: 24, color: 'var(--text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' },
  upgradeBtn: { padding: '8px 18px', borderRadius: 8, background: 'var(--accent-amber)', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 },
  tabActive: { background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' },
  bookGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  bookCard: { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-primary)', overflow: 'hidden', cursor: 'pointer', position: 'relative' },
  bookCover: { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bookInitial: { fontSize: 40, fontWeight: 800, color: '#fff' },
  bookInfo: { padding: '10px 12px' },
  bookTitle: { fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 },
  bookAuthor: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 },
  bookCategory: { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  lockOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 },
  resumeSection: { display: 'flex', flexDirection: 'column', gap: 16 },
  resumeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase' },
  textarea: { width: '100%', height: 200, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'var(--font-mono)', resize: 'vertical', boxSizing: 'border-box' },
  tailorBtn: { padding: '12px 24px', borderRadius: 10, background: 'var(--accent-amber)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', alignSelf: 'flex-start' },
  tailoredResult: { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-primary)', padding: 16 },
  atsScore: { fontSize: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 12 },
  bullet: { fontSize: 13, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.5 },
  keywords: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  keyword: { padding: '3px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.25)' },
  note: { marginTop: 10, fontSize: 12, color: 'var(--accent-info)', padding: '8px 10px', background: 'rgba(59,130,246,0.08)', borderRadius: 8 },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-secondary)', padding: 28, maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' },
  modalCover: { height: 80, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalInitial: { fontSize: 36, fontWeight: 800, color: '#fff' },
  modalTitle: { margin: '0 0 4px', fontSize: 20, fontWeight: 800 },
  modalAuthor: { margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' },
  loading: { textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: 13 },
  summaryText: { fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 16 },
  takeaway: { display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, lineHeight: 1.5 },
  takeawayNum: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  careerImpact: { marginTop: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--accent-success)', border: '1px solid rgba(16,185,129,0.2)' },
};
