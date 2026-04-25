import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useRoadmapStore from '../store/roadmapStore';

const ROLE_MILESTONES = {
  'Frontend Developer': [
    { month: 3, title: 'Junior Frontend Dev', salary: '$65k', skills: ['HTML/CSS', 'JavaScript', 'React basics'] },
    { month: 6, title: 'Mid Frontend Dev', salary: '$85k', skills: ['TypeScript', 'State Management', 'Testing'] },
    { month: 9, title: 'Senior Frontend Dev', salary: '$110k', skills: ['Performance', 'Architecture', 'Mentoring'] },
    { month: 12, title: 'Lead Frontend Engineer', salary: '$135k', skills: ['System Design', 'Team Lead', 'Full ownership'] },
  ],
  'Backend Developer': [
    { month: 3, title: 'Junior Backend Dev', salary: '$70k', skills: ['Python/Node.js', 'REST APIs', 'SQL'] },
    { month: 6, title: 'Mid Backend Dev', salary: '$95k', skills: ['Microservices', 'Docker', 'Redis'] },
    { month: 9, title: 'Senior Backend Dev', salary: '$125k', skills: ['System Design', 'Kafka', 'gRPC'] },
    { month: 12, title: 'Staff Engineer', salary: '$155k', skills: ['Architecture', 'Cross-team', 'Scalability'] },
  ],
  'Full Stack Developer': [
    { month: 3, title: 'Junior Full Stack', salary: '$72k', skills: ['React', 'Node.js', 'PostgreSQL'] },
    { month: 6, title: 'Mid Full Stack', salary: '$98k', skills: ['TypeScript', 'Docker', 'CI/CD'] },
    { month: 9, title: 'Senior Full Stack', salary: '$128k', skills: ['Cloud', 'Architecture', 'Performance'] },
    { month: 12, title: 'Tech Lead', salary: '$158k', skills: ['Team Lead', 'Product Thinking', 'Hiring'] },
  ],
  'Machine Learning Engineer': [
    { month: 3, title: 'ML Intern/Junior', salary: '$85k', skills: ['Python', 'scikit-learn', 'Pandas'] },
    { month: 6, title: 'ML Engineer', salary: '$115k', skills: ['PyTorch', 'MLOps', 'Feature Engineering'] },
    { month: 9, title: 'Senior ML Engineer', salary: '$150k', skills: ['LLMs', 'Distributed Training', 'Research'] },
    { month: 12, title: 'ML Lead / Researcher', salary: '$190k', skills: ['Novel Architectures', 'Publications', 'Team'] },
  ],
};

const DEFAULT_MILESTONES = [
  { month: 3, title: 'Junior Developer', salary: '$68k', skills: ['Core Language', 'Version Control', 'Basics'] },
  { month: 6, title: 'Mid-Level Developer', salary: '$90k', skills: ['Frameworks', 'Testing', 'Collaboration'] },
  { month: 9, title: 'Senior Developer', salary: '$120k', skills: ['Architecture', 'Mentoring', 'Leadership'] },
  { month: 12, title: 'Tech Lead / Staff', salary: '$150k', skills: ['Strategy', 'Cross-functional', 'Ownership'] },
];

export default function PredictiveCareerSlider({ targetRole, learnerProfile }) {
  const [month, setMonth] = useState(6);
  const { completedNodes, currentRoadmap, totalXP } = useRoadmapStore();

  const nodesCompleted = completedNodes?.[currentRoadmap]?.size || 0;

  // Velocity: nodes per week (assume 4 weeks per month of usage)
  const velocity = useMemo(() => {
    const weeks = Math.max(1, nodesCompleted / 2);
    return Math.round((nodesCompleted / weeks) * 10) / 10;
  }, [nodesCompleted]);

  const milestones = ROLE_MILESTONES[targetRole] || DEFAULT_MILESTONES;

  // Find the milestone closest to selected month
  const current = milestones.reduce((prev, curr) =>
    Math.abs(curr.month - month) < Math.abs(prev.month - month) ? curr : prev
  );

  // Adjust salary based on velocity
  const velocityBonus = Math.min(velocity * 2, 20);

  const progressPct = (month / 12) * 100;

  return (
    <div style={styles.container} className="deva-ui">
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>📈 Predictive Career Trajectory</h3>
          <p style={styles.subtitle}>Where you'll be in {month} months at your current velocity</p>
        </div>
        <div style={styles.velocityBadge}>
          <span style={styles.velocityNum}>{velocity}</span>
          <span style={styles.velocityLabel}>nodes/week</span>
        </div>
      </div>

      {/* Timeline slider */}
      <div style={styles.sliderSection}>
        <div style={styles.sliderLabels}>
          {[3, 6, 9, 12].map(m => (
            <span key={m} style={{ ...styles.sliderLabel, ...(m === month ? styles.sliderLabelActive : {}) }}>
              {m}mo
            </span>
          ))}
        </div>
        <input
          type="range" min={1} max={12} step={1} value={month}
          onChange={e => setMonth(+e.target.value)}
          style={styles.slider}
        />
      </div>

      {/* Milestone card */}
      <motion.div
        key={current.month}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.milestoneCard}
      >
        <div style={styles.milestoneTop}>
          <div>
            <div style={styles.milestoneTitle}>{current.title}</div>
            <div style={styles.milestoneSalary}>{current.salary} / year</div>
          </div>
          <div style={styles.monthBadge}>{current.month} months</div>
        </div>

        <div style={styles.skillsRow}>
          {current.skills.map(s => (
            <span key={s} style={styles.skillTag}>{s}</span>
          ))}
        </div>

        {velocityBonus > 5 && (
          <div style={styles.velocityNote}>
            🚀 At your pace, you're {Math.round(velocityBonus)}% ahead of average learners
          </div>
        )}
      </motion.div>

      {/* Progress bar */}
      <div style={styles.progressBar}>
        <motion.div
          style={styles.progressFill}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Milestones row */}
      <div style={styles.milestonesRow}>
        {milestones.map((m, i) => (
          <div
            key={m.month}
            style={{ ...styles.dot, ...(month >= m.month ? styles.dotActive : {}) }}
            onClick={() => setMonth(m.month)}
            title={m.title}
          />
        ))}
      </div>

      <div style={styles.footer}>
        <span>Based on {nodesCompleted} nodes completed • {totalXP || 0} XP earned</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-primary)',
    borderRadius: 16, padding: '20px', marginBottom: 20,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' },
  velocityBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: 10, padding: '6px 12px',
  },
  velocityNum: { fontSize: 20, fontWeight: 800, color: 'var(--accent-amber)', lineHeight: 1 },
  velocityLabel: { fontSize: 10, color: 'var(--text-muted)', marginTop: 2 },
  sliderSection: { marginBottom: 16 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', marginBottom: 4, padding: '0 2px' },
  sliderLabel: { fontSize: 11, color: 'var(--text-secondary)' },
  sliderLabelActive: { color: 'var(--accent-amber)', fontWeight: 700 },
  slider: { width: '100%', accentColor: 'var(--accent-amber)' },
  milestoneCard: {
    background: 'rgba(245,158,11,0.06)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 12, padding: '14px', marginBottom: 12,
  },
  milestoneTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  milestoneTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' },
  milestoneSalary: { fontSize: 13, color: 'var(--accent-success)', fontWeight: 600, marginTop: 2 },
  monthBadge: {
    background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)',
    borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600,
  },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skillTag: {
    padding: '3px 8px', borderRadius: 6, fontSize: 11,
    background: 'var(--bg-hover)', color: 'var(--text-secondary)',
    border: '1px solid var(--border-primary)',
  },
  velocityNote: {
    marginTop: 10, fontSize: 12, color: 'var(--accent-success)',
    background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '6px 10px',
  },
  progressBar: {
    height: 4, background: 'var(--bg-hover)',
    borderRadius: 2, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-success))',
    borderRadius: 2,
  },
  milestonesRow: { display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginBottom: 10 },
  dot: {
    width: 10, height: 10, borderRadius: '50%',
    background: 'var(--border-secondary)', cursor: 'pointer', transition: 'all 0.2s',
  },
  dotActive: { background: 'var(--accent-amber)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' },
  footer: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' },
};
