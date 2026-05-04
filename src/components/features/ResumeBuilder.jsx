import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdUpload, MdAutoFixHigh, MdPictureAsPdf, MdCheck, MdEdit } from 'react-icons/md';
import useRoadmapStore from '../../store/roadmapStore';

const ROLES = [
  'Frontend Developer','Backend Developer','Full Stack Developer',
  'Data Scientist','Machine Learning Engineer','DevOps Engineer',
  'Security Engineer','Mobile Developer',
];

// ─── PDF Export ───────────────────────────────────────────────────────────────
function exportToPDF(r) {
  const skillsHtml = (r.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
  const toolsHtml  = (r.tools  || []).map(s => `<span class="skill-tag tool">${s}</span>`).join('');
  const projHtml   = (r.projected_skills || []).map(s => `<span class="skill-tag proj">${s}</span>`).join('');
  const expHtml    = (r.experience || []).map(e => `
    <div class="exp-block">
      <div class="exp-header">
        <div><strong>${e.role}</strong> &nbsp;·&nbsp; <span class="company">${e.company}</span></div>
        <span class="period">${e.period}</span>
      </div>
      <ul>${(e.bullets||[]).map(b=>`<li>${b}</li>`).join('')}</ul>
    </div>`).join('');
  const certsHtml = (r.certifications||[]).map(c=>`<li>${c}</li>`).join('');
  const kwHtml    = (r.ats_keywords||[]).map(k=>`<span class="kw">${k}</span>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${r.name} — Resume</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:10.5pt;color:#1a1a1a;padding:36px 44px;max-width:820px;margin:0 auto}
  .header{border-bottom:3px solid #f59e0b;padding-bottom:14px;margin-bottom:18px}
  h1{font-size:22pt;font-weight:800;letter-spacing:-0.5px;color:#0f172a}
  .title{font-size:12pt;color:#f59e0b;font-weight:700;margin:3px 0 6px}
  .contact{font-size:9pt;color:#64748b}
  .summary{font-size:10pt;line-height:1.65;color:#334155;margin-bottom:18px;padding:12px 14px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0}
  .section-title{font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#f59e0b;margin:16px 0 8px;border-bottom:1px solid #fde68a;padding-bottom:4px}
  .exp-block{margin-bottom:14px}
  .exp-header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px}
  .exp-header strong{font-size:11pt;color:#0f172a}
  .company{color:#475569;font-size:10pt}
  .period{font-size:9pt;color:#94a3b8;white-space:nowrap}
  ul{padding-left:16px}
  li{font-size:10pt;line-height:1.6;margin-bottom:3px;color:#334155}
  .skill-tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:9pt;margin:2px 3px 2px 0;background:#f1f5f9;color:#334155;border:1px solid #e2e8f0}
  .skill-tag.tool{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}
  .skill-tag.proj{background:#fef3c7;color:#92400e;border-color:#fde68a;font-style:italic}
  .kw{display:inline-block;padding:2px 7px;border-radius:3px;font-size:8.5pt;margin:2px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}
  .edu-row{display:flex;justify-content:space-between;font-size:10pt}
  .ats-badge{display:inline-block;margin-top:10px;padding:4px 12px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:9pt;font-weight:700;border:1px solid #fde68a}
  @media print{body{padding:20px 28px}}
</style></head><body>
  <div class="header">
    <h1>${r.name}</h1>
    <div class="title">${r.title}</div>
    <div class="contact">${r.email || ''}</div>
  </div>
  <div class="summary">${r.summary}</div>
  <div class="section-title">Experience</div>
  ${expHtml}
  <div class="section-title">Technical Skills</div>
  <div>${skillsHtml}</div>
  ${toolsHtml ? `<div class="section-title">Tools & Technologies</div><div>${toolsHtml}</div>` : ''}
  ${projHtml  ? `<div class="section-title">Upskilling (In Progress)</div><div>${projHtml}</div>` : ''}
  ${r.education ? `<div class="section-title">Education</div>
    <div class="edu-row"><span><strong>${r.education.degree}</strong> in ${r.education.field}</span><span class="period">${r.education.year}</span></div>
    <div style="color:#475569;font-size:10pt">${r.education.institution}</div>` : ''}
  ${certsHtml ? `<div class="section-title">Certifications</div><ul>${certsHtml}</ul>` : ''}
  ${kwHtml ? `<div class="section-title">ATS Keywords</div><div>${kwHtml}</div>` : ''}
  <div class="ats-badge">ATS Score: ${r.ats_score || '—'}%</div>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
}

// ─── Resume Preview ───────────────────────────────────────────────────────────
function ResumePreview({ resume, placeholder }) {
  if (!resume) return (
    <div style={p.empty}>
      <MdUpload size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{placeholder}</p>
    </div>
  );

  return (
    <div style={p.card}>
      {/* Header */}
      <div style={p.header}>
        <div style={p.name}>{resume.name}</div>
        <div style={p.role}>{resume.title}</div>
        {resume.email && <div style={p.email}>{resume.email}</div>}
      </div>

      {/* ATS Score */}
      {resume.ats_score && (
        <div style={p.atsBadge}>
          <span style={{ color: resume.ats_score >= 80 ? '#10b981' : resume.ats_score >= 65 ? '#f59e0b' : '#ef4444', fontWeight: 800 }}>
            {resume.ats_score}%
          </span>
          {' '}ATS Match Score
        </div>
      )}

      {/* Summary */}
      <div style={p.sectionLabel}>Professional Summary</div>
      <p style={p.summary}>{resume.summary}</p>

      {/* Experience */}
      {(resume.experience || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>Experience</div>
          {resume.experience.map((exp, i) => (
            <div key={i} style={p.expBlock}>
              <div style={p.expHeader}>
                <div>
                  <span style={p.expRole}>{exp.role}</span>
                  <span style={p.expCompany}> · {exp.company}</span>
                </div>
                <span style={p.expPeriod}>{exp.period}</span>
              </div>
              <ul style={p.bulletList}>
                {(exp.bullets || []).map((b, j) => (
                  <li key={j} style={p.bullet}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {(resume.skills || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>Technical Skills</div>
          <div style={p.tagsRow}>
            {resume.skills.map(s => <span key={s} style={p.skillTag}>{s}</span>)}
          </div>
        </>
      )}

      {/* Tools */}
      {(resume.tools || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>Tools & Technologies</div>
          <div style={p.tagsRow}>
            {resume.tools.map(s => <span key={s} style={{ ...p.skillTag, ...p.toolTag }}>{s}</span>)}
          </div>
        </>
      )}

      {/* Projected */}
      {(resume.projected_skills || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>Upskilling (In Progress)</div>
          <div style={p.tagsRow}>
            {resume.projected_skills.map(s => <span key={s} style={{ ...p.skillTag, ...p.projTag }}>{s}</span>)}
          </div>
        </>
      )}

      {/* Education */}
      {resume.education && (
        <>
          <div style={p.sectionLabel}>Education</div>
          <div style={p.eduRow}>
            <div>
              <span style={p.expRole}>{resume.education.degree}</span>
              <span style={p.expCompany}> in {resume.education.field}</span>
            </div>
            <span style={p.expPeriod}>{resume.education.year}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{resume.education.institution}</div>
        </>
      )}

      {/* Certifications */}
      {(resume.certifications || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>Certifications</div>
          <ul style={p.bulletList}>
            {resume.certifications.map((c, i) => <li key={i} style={p.bullet}>{c}</li>)}
          </ul>
        </>
      )}

      {/* ATS Keywords */}
      {(resume.ats_keywords || []).length > 0 && (
        <>
          <div style={p.sectionLabel}>ATS Keywords Injected</div>
          <div style={p.tagsRow}>
            {resume.ats_keywords.map(k => <span key={k} style={p.kwTag}>{k}</span>)}
          </div>
        </>
      )}
    </div>
  );
}

const p = {
  empty:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 300 },
  card:        { flex: 1, overflowY: 'auto', padding: '20px 22px' },
  header:      { borderBottom: '3px solid var(--accent-primary)', paddingBottom: 12, marginBottom: 14 },
  name:        { fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' },
  role:        { fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', marginTop: 2 },
  email:       { fontSize: 11, color: 'var(--text-muted)', marginTop: 3 },
  atsBadge:    { display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', fontSize: 12, marginBottom: 12 },
  sectionLabel:{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent-primary)', marginTop: 14, marginBottom: 6, borderBottom: '1px solid var(--border-primary)', paddingBottom: 3 },
  summary:     { fontSize: 12, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0, padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderLeft: '3px solid var(--accent-primary)', borderRadius: '0 6px 6px 0' },
  expBlock:    { marginBottom: 14 },
  expHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, flexWrap: 'wrap', gap: 4 },
  expRole:     { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' },
  expCompany:  { fontSize: 12, color: 'var(--text-secondary)' },
  expPeriod:   { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  bulletList:  { paddingLeft: 16, margin: 0 },
  bullet:      { fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 3 },
  tagsRow:     { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  skillTag:    { padding: '3px 8px', borderRadius: 5, fontSize: 11, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' },
  toolTag:     { background: 'rgba(59,130,246,0.08)', color: 'var(--accent-info)', borderColor: 'rgba(59,130,246,0.2)' },
  projTag:     { background: 'rgba(245,158,11,0.08)', color: 'var(--accent-primary)', borderColor: 'rgba(245,158,11,0.2)', fontStyle: 'italic' },
  kwTag:       { padding: '2px 7px', borderRadius: 4, fontSize: 10, background: 'rgba(16,185,129,0.08)', color: 'var(--accent-success)', border: '1px solid rgba(16,185,129,0.2)' },
  eduRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeBuilder({ isPro, onUpgradeClick, learnerProfile }) {
  const [file, setFile]                     = useState(null);
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [targetRole, setTargetRole]         = useState(learnerProfile?.targetRole || 'Full Stack Developer');
  const [tone, setTone]                     = useState(50);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [skillNotif, setSkillNotif]         = useState(null);
  const fileRef = useRef(null);
  const { completedNodes, currentRoadmap }  = useRoadmapStore();
  const completedList = Array.from(completedNodes?.[currentRoadmap] || []);
  const toneLabel = tone < 35 ? '🎨 Creative' : tone < 65 ? '⚖️ Balanced' : '💼 Professional';

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setOptimizedResume(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const transform = async () => {
    if (!file) { setError('Please upload your resume file first.'); return; }
    if (!isPro) { onUpgradeClick?.(); return; }
    setLoading(true);
    setError(null);
    setOptimizedResume(null);

    const form = new FormData();
    form.append('file', file);
    form.append('target_role', targetRole);
    form.append('tone', tone >= 60 ? 'professional' : 'creative');
    form.append('completed_nodes', JSON.stringify(completedList));

    try {
      const authToken = localStorage.getItem('authToken');
      const headers   = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const res       = await fetch('/api/resume/transform', { method: 'POST', body: form, headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      setOptimizedResume(await res.json());
    } catch (e) {
      setError(e.message || 'Transformation failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skill) => {
    if (!optimizedResume) return;
    const form = new FormData();
    form.append('skill', skill);
    form.append('current_resume_json', JSON.stringify(optimizedResume));
    const authToken = localStorage.getItem('authToken');
    try {
      const res  = await fetch('/api/resume/add-skill', { method: 'POST', body: form, headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {} });
      const data = await res.json();
      setOptimizedResume(data.updated_resume);
      setSkillNotif(`✓ "${skill}" added`);
      setTimeout(() => setSkillNotif(null), 2500);
    } catch { /* silent */ }
  };

  return (
    <div style={s.page} className="deva-ui">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Resume Builder</h2>
          <p style={s.sub}>Upload your resume and we'll rewrite it for your target role — with better bullets, ATS keywords, and projected skills.</p>
        </div>
        {!isPro && <button onClick={onUpgradeClick} style={s.proBtn}>⭐ Unlock Pro</button>}
      </div>

      {/* Controls */}
      <div style={s.controls}>
        <div style={s.ctrlGroup}>
          <label style={s.ctrlLabel}>Target Role</label>
          <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={s.select}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={s.ctrlGroup}>
          <label style={s.ctrlLabel}>Tone: <span style={{ color: 'var(--accent-primary)' }}>{toneLabel}</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={s.toneEnd}>Creative</span>
            <input type="range" min={0} max={100} value={tone} onChange={e => setTone(+e.target.value)} style={{ width: 140, accentColor: 'var(--accent-primary)' }} />
            <span style={s.toneEnd}>Professional</span>
          </div>
        </div>
        <button onClick={transform} disabled={loading} style={{ ...s.transformBtn, ...(loading ? { opacity: 0.7 } : {}) }}>
          {loading ? <><span style={s.spinner} /> Transforming...</> : <><MdAutoFixHigh size={17} /> Transform Resume</>}
        </button>
        {optimizedResume && (
          <button onClick={() => exportToPDF(optimizedResume)} style={s.exportBtn}>
            <MdPictureAsPdf size={17} /> Export PDF
          </button>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {skillNotif && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={s.toast}>
            <MdCheck size={14} /> {skillNotif}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && <div style={s.error}>{error}</div>}

      {/* Split screen */}
      <div style={s.split}>
        {/* Left — upload */}
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>📄 Your Resume</span>
            {file && <span style={s.fileTag}>{file.name}</span>}
          </div>
          {!file ? (
            <div style={s.dropZone} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}>
              <MdUpload size={44} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                Drop your resume here or <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>click to browse</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>PDF, DOCX, TXT — max 16MB</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={s.fileReady}>
              <div style={s.fileIcon}>📄</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{(file.size / 1024).toFixed(0)} KB · Ready to transform</div>
              </div>
              <button onClick={() => { setFile(null); setOptimizedResume(null); }} style={s.removeBtn}>✕</button>
            </div>
          )}

          {loading && (
            <div style={s.loadingSteps}>
              {['Reading your resume...', 'Matching skills to role...', 'Writing experience bullets...', 'Building your profile...'].map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} style={s.loadStep}>
                  <span style={s.loadDot} /> {msg}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={s.arrow}>
          <motion.div animate={{ x: loading ? [0, 6, 0] : 0 }} transition={{ repeat: loading ? Infinity : 0, duration: 0.5 }} style={{ fontSize: 22, color: 'var(--accent-primary)' }}>
            {loading ? '⚡' : '→'}
          </motion.div>
        </div>

        {/* Right — result */}
        <div style={s.panel}>
          <div style={s.panelHead}>
            <span style={s.panelTitle}>✨ AI-Optimised Resume</span>
            {optimizedResume && <span style={{ fontSize: 11, color: 'var(--accent-success)', fontWeight: 600 }}>Ready</span>}
          </div>
          <ResumePreview resume={optimizedResume} placeholder="Transform your resume to see the AI-optimised version here." />
        </div>
      </div>

      {/* Add roadmap skills */}
      {optimizedResume && completedList.length > 0 && (
        <div style={s.skillsSection}>
          <div style={s.skillsSectionTitle}>📚 Add completed roadmap skills to your resume</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {completedList.slice(0, 10).map(node => (
              <button key={node} onClick={() => addSkill(node)} style={s.addSkillBtn}>+ {node}</button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes dot{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
}

const s = {
  page:        { padding: '0 24px 32px', color: 'var(--text-primary)', minHeight: '100vh', background: 'var(--bg-primary)' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title:       { margin: 0, fontSize: 22, fontWeight: 800 },
  sub:         { margin: '5px 0 0', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 580 },
  proBtn:      { padding: '8px 18px', borderRadius: 8, background: 'var(--accent-primary)', border: 'none', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  controls:    { display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 16, flexWrap: 'wrap' },
  ctrlGroup:   { display: 'flex', flexDirection: 'column', gap: 5 },
  ctrlLabel:   { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select:      { padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', minWidth: 200 },
  toneEnd:     { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  transformBtn:{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, background: 'var(--accent-primary)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  exportBtn:   { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-success)', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  spinner:     { display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  toast:       { position: 'fixed', top: 76, right: 24, zIndex: 9000, background: 'var(--accent-success)', color: '#fff', padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 },
  error:       { padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: 'var(--accent-error)', fontSize: 13, marginBottom: 14 },
  split:       { display: 'grid', gridTemplateColumns: '1fr 48px 1fr', minHeight: 560, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-primary)', overflow: 'hidden' },
  panel:       { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  panelHead:   { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', flexShrink: 0 },
  panelTitle:  { fontSize: 13, fontWeight: 700, flex: 1, color: 'var(--text-primary)' },
  fileTag:     { fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 7px', borderRadius: 4 },
  dropZone:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, cursor: 'pointer', border: '2px dashed var(--border-secondary)', margin: 16, borderRadius: 12 },
  fileReady:   { display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px', margin: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-primary)' },
  fileIcon:    { fontSize: 36 },
  removeBtn:   { marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', padding: '4px 8px' },
  loadingSteps:{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  loadStep:    { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' },
  loadDot:     { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'dot 1.2s ease-in-out infinite', flexShrink: 0 },
  arrow:       { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)' },
  skillsSection:     { marginTop: 18, padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-primary)' },
  skillsSectionTitle:{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' },
  addSkillBtn:       { padding: '5px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
