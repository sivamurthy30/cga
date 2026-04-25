import { useState, useEffect } from 'react';

/**
 * Phase 5 — Market Radar
 * Fetches trending skills and returns a lookup function.
 * Roadmap nodes use this to show a glow if the skill is trending.
 */
export default function useMarketRadar() {
  const [trending, setTrending] = useState({ hot: [], rising: [], stable: [], salary_premium: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/market/trending')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) { setTrending(data); setLoaded(true); }
      })
      .catch(() => {});
  }, []);

  const getTrend = (skillName) => {
    if (!skillName || !loaded) return null;
    const name = skillName.toLowerCase();
    if (trending.hot.some(s => s.toLowerCase() === name)) return 'hot';
    if (trending.rising.some(s => s.toLowerCase() === name)) return 'rising';
    if (trending.stable.some(s => s.toLowerCase() === name)) return 'stable';
    return null;
  };

  const getSalaryPremium = (skillName) => {
    if (!skillName) return 0;
    return trending.salary_premium[skillName] || 0;
  };

  return { trending, getTrend, getSalaryPremium, loaded };
}
