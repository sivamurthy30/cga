import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDescription, MdPictureAsPdf, MdAutoFixHigh, MdUpload, MdCheck, MdTune } from 'react-icons/md';
import { AiOutlineFileSync } from 'react-icons/ai';
import useRoadmapStore from '../store/roadmapStore';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Security Engineer', 'Mobile Developer',
];

// ─── PDF Export (browser print) ──────────────────────────────────────────────
function exportToPDF(resume) {
  const html = buildPDFHTML(resume);
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

function buildPDFHTML(r) {
  const skills = (r.skills || []).join(' • ');
  const projected = (r.projected_skills || []).join(' • ');
  const exp = (r.experience || []).map(e => `
    <div class="exp">
      <div class="exp-header">
        <strong>${e.role}</strong> — ${e.company}
        <span class="period">${e.period}</span>
      </div>
      <ul>${(e.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>
    </div>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${r.name} — Resume</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Georgia', serif; font-size: 11pt; color: #1a1a1a; padding: 40px 48px; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; }
  .title { font-size: 12pt; color: #555; margin: 4px 0 16px; }
  .divider { border: none; border-top: 2px solid #f59e0b; margin: 12px 0; }
  .section-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b; margin: 16px 0 6px; }
  .summary { font-size: 10.5pt; line-height: 1.6; color: #333; }
  .exp { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 4px; }
  .period { color: #777; font-size: 9.5pt; }
  ul { padding-left: 18px; }
  li { font-size: 10pt; line-height: 1.55; margin-bottom: 3px; color: #333; }
  .skills { font-size: 10pt; line-height: 1.7; color: #333; }
  .projected { font-size: 10pt; color: #777; font-style: italic; }
  .ats-badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 9pt; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
  @media print { body { padding: 20px 28px; } }
</style></head><body>
  <h1>${r.name}</h1>
  <div class="title">${r.title}</div>
  <hr class="divider">
  <div class="section-label">Professional Summary</div>
  <p class="summary">${r.summary}</p>
  <div class="section-label">Experience</div>
  ${exp}
  <div class="section-label">Technical Skills</div>
  <p class="skills">${skills}</p>
  ${projected ? `<div class="section-label">Projected Skills (In Progress)</div><p class="projected">${projected}</p>` : ''}
  <div class="ats-badge">ATS Score: ${r.ats_score || '—'}%</div>
</body></html>`;
}

// ─── Resume Preview Card ──────────────────────────────────────────────────────
function ResumePreview({ resume, label, dim }) {
  if (!resume) return (
    <div style={{ ...s.previewEmpty, ...(dim ? { opacity: 0.4 } : {}) }}>
      <MdDescription size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
      <p>{label}</p>
    </div>
  );

  return (
    <div style={{ ...s.previewCard, ...(dim ? { opacity: 0.55 } : {}) }}>
      <div style={s.previewName}>{resume.name}</div>
      <div style={s.previewRole}>{resume.title}</div>
      <div style={s.previewDivider} />

      <div style={s.previewSection}>Summary</div>
      <p style={s.previewText}>{resume.summary}</p>

      {(resume.experience || []).map((exp, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={s.expHeader}>
            <span style={s.expRole}>{exp.role} — {exp.company}</span>
            <span style={s.expPeriod}>{exp.period}</span>
          </div>
          <ul style={s.bulletList}>
            {(exp.bullets || []).map((b, j) => (
              <li key={j} style={s.bullet}>{b}</li>
            ))}
          </ul>
        </div>
      ))}

      <div style={s.previewSection}>Skills</div>
      <div style={s.skillsWrap}>
        {(resume.skills || []).map(sk => (
          <span key={sk} style={s.skillTag}>{sk}</span>
        ))}
      </div>

      {(resume.projected_skills || []).length > 0 && (
        <>
          <div style={s.previewSection}>Projected Skills (In Progress)</div>
          <div style={s.skillsWrap}>
            {resume.projected_skills.map(sk => (
              <span key={sk} style={{ ...s.skillTag, ...s.projectedTag }}>{sk}</span>
            ))}
          </div>
        </>
      )}

      {resume.ats_score && (
        <div style={s.atsBadge}>
          ATS Score: <strong style={{ color: resume.ats_score >= 75 ? '#10b981' : '#f59e0b' }}>
            {resume.ats_score}%
          </strong>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeBuilder({ isPro, onUpgradeClick, learnerProfile }) {
  const [file, setFile] = useState(null);
  const [originalResume, setOriginalResume] = useState(null);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [targetRole, setTargetRole] = useState(learnerProfile?.targetRole || 'Full Stack Developer');
  const [tone, setTone] = useState(50); // 0=creative, 100=professional
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'done'
  const [skillNotif, setSkillNotif] = useState(null);
  const fileRef = useRef(null);
  const { completedNodes, currentRoadmap } = useRoadmapStore();

  const completedList = Array.from(completedNodes?.[currentRoadmap] || []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
    // Parse original for left panel preview
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalResume({
        name: 'Your Name',
        title: 'Current Role',
        summary: 'Original resume content will appear here after upload.',
        experience: [],
        skills: [],
        projected_skills: [],
        ats_score: null,
      });
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const transform = async () => {
    if (!file) return;
    if (!isPro) { onUpgradeClick?.(); return; }
    setLoading(true);
    setError(null);
    setStep('preview');

    const form = new FormData();
    form.append('file', file);
    form.append('target_role', targetRole);
    form.append('tone', tone >= 60 ? 'professional' : 'creative');
    form.append('completed_nodes', JSON.stringify(completedList));

    try {
      const res = await fetch('/api/resume/transform', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setOptimizedResume(data);
      // Set original preview from extracted text
      setOriginalResume(prev => ({
        ...prev,
        summary: data.original_text?.slice(0, 200) + '...' || prev.summary,
      }));
      setStep('done');
    } catch (e) {
      setError('Transformation failed. Check your connection or try again.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const addSkillToResume = async (skill) => {
    if (!optimizedResume) return;
    const form = new FormData();
    form.append('skill', skill);
    form.append('current_resume_json', JSON.stringify(optimizedResume));
    try {
      const res = await fetch('/api/resume/add-skill', { method: 'POST', body: form });
      const data = await res.json();
      setOptimizedResume(data.updated_resume);
      setSkillNotif(`✓ "${skill}" added to your resume`);
      setTimeout(() => setSkillNotif(null), 3000);
    } catch { /* silent */ }
  };

  const toneLabel = tone < 35 ? '🎨 Creative' : tone < 65 ? '⚖️ Balanced' : '💼 Professional';

  return (
    <div style={s.container} className="deva-ui">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>
            <AiOutlineFileSync style={{ marginRight: 10, color: '#f59e0b' }} />
            AI Resume Transformation Engine
          </h2>
          <p style={s.subtitle}>
            Upload your old resume → AI bridges the gap to your target role with ATS optimization,
            quantified achievements, and projected skills.
          </p>
        </div>
        {!isPro && (
          <button onClick={onUpgradeClick} style={s.proBtn}>⭐ Unlock Pro</button>
        )}
      </div>

      {/* Controls row */}
      <div style={s.controls}>
        {/* Role selector */}
        <div style={s.controlGroup}>
          <label style={s.label}>Target Role</label>
          <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={s.select}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Tone slider */}
        <div style={s.controlGroup}>
          <label style={s.label}>Tone: <span style={{ color: '#f59e0b' }}>{toneLabel}</span></label>
          <div style={s.sliderRow}>
            <span style={s.sliderLabel}>Creative</span>
            <input type="range" min={0} max={100} value={tone}
              onChange={e => setTone(+e.target.value)} style={s.slider} />
            <span style={s.sliderLabel}>Professional</span>
          </div>
        </div>

        {/* Transform button */}
        <button
          onClick={transform}
          disabled={!file || loading}
          style={{ ...s.transformBtn, ...((!file || loading) ? s.btnDisabled : {}) }}
        >
          {loading
            ? <><span style={s.spinner} /> Transforming...</>
            : <><MdAutoFixHigh size={18} /> Transform Resume</>}
        </button>

        {/* Export button */}
        {optimizedResume && (
          <button onClick={() => exportToPDF(optimizedResume)} style={s.exportBtn}>
            <MdPictureAsPdf size={18} /> Export PDF
          </button>
        )}
      </div>

      {/* Skill notification toast */}
      <AnimatePresence>
        {skillNotif && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} style={s.toast}>
            <MdCheck size={16} /> {skillNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split-screen editor */}
      <div style={s.splitScreen}>
        {/* LEFT — Original */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <MdDescription size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={s.panelTitle}>Original Resume</span>
            {file && <span style={s.fileTag}>{file.name}</span>}
          </div>

          {/* Drop zone */}
          {!file && (
            <div
              style={s.dropZone}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
            >
              <MdUpload size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Drop your resume here or <span style={{ color: 'var(--accent-amber)' }}>click to browse</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>PDF, DOCX, TXT — max 8MB</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt"
                style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          {file && <ResumePreview resume={originalResume} label="Parsing original..." dim />}
        </div>

        {/* Divider with arrow */}
        <div style={s.divider}>
          <motion.div
            animate={{ x: loading ? [0, 6, 0] : 0 }}
            transition={{ repeat: loading ? Infinity : 0, duration: 0.6 }}
            style={s.arrow}
          >
            {loading ? '⚡' : '→'}
          </motion.div>
          <div style={s.dividerLine} />
        </div>

        {/* RIGHT — Optimized */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <MdAutoFixHigh size={16} style={{ color: 'var(--accent-amber)' }} />
            <span style={s.panelTitle}>AI-Optimized Version</span>
            {optimizedResume?.ats_keywords_injected?.length > 0 && (
              <span style={s.atsTag}>
                +{optimizedResume.ats_keywords_injected.length} ATS keywords
              </span>
            )}
          </div>

          {loading && (
            <div style={s.loadingPanel}>
              <div style={s.loadingSteps}>
                {['Parsing resume...', 'Injecting ATS keywords...', 'Quantifying achievements...', 'Adding projected skills...'].map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }}
                    style={s.loadingStep}>
                    <span style={s.loadingDot} />
                    {msg}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {!loading && <ResumePreview resume={optimizedResume} label="Transform your resume to see the AI-optimized version here." />}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={s.error}>{error}</div>
      )}

      {/* Completed nodes — add to resume */}
      {optimizedResume && completedList.length > 0 && (
        <div style={s.nodesSection}>
          <div style={s.nodesSectionTitle}>
            📚 Add completed roadmap skills to your resume
          </div>
          <div style={s.nodesRow}>
            {completedList.slice(0, 8).map(node => (
              <button key={node} onClick={() => addSkillToResume(node)} style={s.nodeBtn}>
                + {node}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  container: { padding: 24, color: 'var(--text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center' },
  subtitle: { margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 600 },
  proBtn: { padding: '8px 18px', borderRadius: 8, background: 'var(--accent-amber)', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 },

  controls: { display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  controlGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', minWidth: 200 },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 8 },
  sliderLabel: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  slider: { width: 160, accentColor: 'var(--accent-amber)' },
  transformBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--accent-amber)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-success)', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  spinner: { display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  toast: { position: 'fixed', top: 80, right: 24, zIndex: 9000, background: 'var(--accent-success)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(16,185,129,0.4)' },

  splitScreen: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, minHeight: 600, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-primary)', overflow: 'hidden' },
  panel: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  panelHeader: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' },
  panelTitle: { fontSize: 13, fontWeight: 600, flex: 1 },
  fileTag: { fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 4 },
  atsTag: { fontSize: 11, color: 'var(--accent-success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(16,185,129,0.25)' },

  dropZone: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, cursor: 'pointer', border: '2px dashed var(--border-secondary)', margin: 16, borderRadius: 12, transition: 'border-color 0.2s' },

  divider: { width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)' },
  arrow: { fontSize: 20, color: 'var(--accent-amber)' },
  dividerLine: { width: 1, flex: 1, background: 'var(--border-primary)' },

  loadingPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingSteps: { display: 'flex', flexDirection: 'column', gap: 14 },
  loadingStep: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' },
  loadingDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)', animation: 'dotPulse 1.2s ease-in-out infinite' },

  previewEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' },
  previewCard: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  previewName: { fontSize: 20, fontWeight: 800, marginBottom: 2 },
  previewRole: { fontSize: 13, color: 'var(--accent-amber)', fontWeight: 600, marginBottom: 12 },
  previewDivider: { height: 2, background: 'linear-gradient(90deg, var(--accent-amber), transparent)', marginBottom: 14, borderRadius: 1 },
  previewSection: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-amber)', marginBottom: 6, marginTop: 14 },
  previewText: { fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 },
  expHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  expRole: { fontSize: 13, fontWeight: 600 },
  expPeriod: { fontSize: 11, color: 'var(--text-muted)' },
  bulletList: { paddingLeft: 16, margin: 0 },
  bullet: { fontSize: 12, lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: 3 },
  skillsWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skillTag: { padding: '3px 8px', borderRadius: 6, fontSize: 11, background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' },
  projectedTag: { background: 'rgba(245,158,11,0.08)', color: 'var(--accent-amber)', borderColor: 'rgba(245,158,11,0.25)', fontStyle: 'italic' },
  atsBadge: { marginTop: 14, fontSize: 12, padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 8, display: 'inline-block' },

  error: { marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: 'var(--accent-error)', fontSize: 13 },

  nodesSection: { marginTop: 20, padding: '16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-primary)' },
  nodesSectionTitle: { fontSize: 13, fontWeight: 600, marginBottom: 10 },
  nodesRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  nodeBtn: { padding: '5px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--accent-amber)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
