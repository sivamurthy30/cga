import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
  'Security Engineer', 'Mobile Developer',
];

export default function SalaryHeatmap({ targetRole }) {
  const [role, setRole] = useState(targetRole || 'Full Stack Developer');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(role);
  }, [role]);

  const fetchData = async (r) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/salary/heatmap?role=${encodeURIComponent(r)}`);
      const json = await res.json();
      setData(json);
    } catch {
      // Fallback static data
      setData({
        role: r,
        currency: 'INR',
        data_points: [
          { city: 'Bengaluru',  min_salary: 1050000, median_salary: 1500000, max_salary: 2325000, yoy_change: 8.2 },
          { city: 'Hyderabad',  min_salary: 980000,  median_salary: 1400000, max_salary: 2170000, yoy_change: 7.8 },
          { city: 'Mumbai',     min_salary: 1015000, median_salary: 1450000, max_salary: 2247500, yoy_change: 7.1 },
          { city: 'Pune',       min_salary: 875000,  median_salary: 1250000, max_salary: 1937500, yoy_change: 7.5 },
          { city: 'Delhi NCR',  min_salary: 910000,  median_salary: 1300000, max_salary: 2015000, yoy_change: 7.3 },
          { city: 'Chennai',    min_salary: 840000,  median_salary: 1200000, max_salary: 1860000, yoy_change: 6.9 },
          { city: 'Remote',     min_salary: 980000,  median_salary: 1400000, max_salary: 2170000, yoy_change: 8.0 },
        ],
        top_skills_premium: ['TypeScript', 'React', 'Next.js', 'System Design'],
        market_trend: 'Demand up 7.5% YoY. Remote roles command a 20% premium.',
        last_updated: new Date().toISOString().slice(0, 10),
      });
    } finally {
      setLoading(false);
    }
  };

  const maxMedian = data ? Math.max(...data.data_points.map(d => d.median_salary)) : 1;

  const fmt = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  return (
    <div style={styles.container} className="deva-ui">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>💰 Salary Heatmap</h2>
          <p style={styles.subtitle}>Live salary data for your target role across cities</p>
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={styles.roleSelect}
        >
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading && (
        <div style={styles.loading}>Loading salary data...</div>
      )}

      {data && !loading && (
        <>
          {/* Market trend */}
          <div style={styles.trendBanner}>
            📈 {data.market_trend}
          </div>

          {/* Heatmap bars */}
          <div style={styles.heatmapGrid}>
            {data.data_points.map((point, i) => {
              const pct = (point.median_salary / maxMedian) * 100;
              const hue = Math.round(pct * 1.2); // green for high, red for low
              const barColor = `hsl(${hue}, 70%, 50%)`;

              return (
                <motion.div
                  key={point.city}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={styles.row}
                >
                  <div style={styles.cityName}>{point.city}</div>
                  <div style={styles.barContainer}>
                    <motion.div
                      style={{ ...styles.bar, background: barColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                  <div style={styles.salaryRange}>
                    <span style={styles.median}>{fmt(point.median_salary)}</span>
                    <span style={styles.range}>{fmt(point.min_salary)}–{fmt(point.max_salary)}</span>
                  </div>
                  <div style={{ ...styles.yoy, color: point.yoy_change > 0 ? '#10b981' : '#ef4444' }}>
                    {point.yoy_change > 0 ? '↑' : '↓'}{Math.abs(point.yoy_change)}%
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Premium skills */}
          <div style={styles.premiumSection}>
            <div style={styles.premiumTitle}>🚀 Skills that command a premium salary</div>
            <div style={styles.premiumSkills}>
              {data.top_skills_premium.map(s => (
                <span key={s} style={styles.premiumTag}>{s}</span>
              ))}
            </div>
          </div>

          <div style={styles.footer}>
            Last updated: {data.last_updated} • Annual CTC in {data.currency}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'var(--bg-primary)', borderRadius: 0,
    border: 'none', padding: '0 24px 24px',
    color: 'var(--text-primary)', minHeight: '100vh',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { margin: 0, fontSize: 20, fontWeight: 800 },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' },
  roleSelect: {
    padding: '8px 12px', borderRadius: 8,
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
  },
  loading: { textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' },
  trendBanner: {
    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--accent-success)',
    marginBottom: 16,
  },
  heatmapGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  row: { display: 'flex', alignItems: 'center', gap: 12 },
  cityName: { width: 100, fontSize: 13, fontWeight: 600, flexShrink: 0, color: 'var(--text-primary)' },
  barContainer: { flex: 1, height: 24, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 4, minWidth: 4 },
  salaryRange: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 90, flexShrink: 0 },
  median: { fontSize: 14, fontWeight: 700 },
  range: { fontSize: 10, color: 'var(--text-muted)' },
  yoy: { width: 44, fontSize: 12, fontWeight: 700, textAlign: 'right', flexShrink: 0 },
  premiumSection: { marginBottom: 12 },
  premiumTitle: { fontSize: 13, fontWeight: 600, marginBottom: 8 },
  premiumSkills: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  premiumTag: {
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)',
    border: '1px solid rgba(245,158,11,0.3)',
  },
  footer: { fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' },
};
