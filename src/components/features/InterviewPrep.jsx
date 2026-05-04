import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = {
  'Frontend Developer': [
    { q: 'What is the virtual DOM and how does React use it?', a: 'The virtual DOM is a lightweight in-memory representation of the real DOM. React uses it to batch and minimise actual DOM mutations — it diffs the new virtual tree against the previous one and only applies the minimal set of changes to the real DOM.', category: 'React', difficulty: 'Medium' },
    { q: 'Explain the difference between `useMemo` and `useCallback`.', a: '`useMemo` memoises a computed value; `useCallback` memoises a function reference. Both accept a dependency array and only recompute when deps change. Use `useMemo` for expensive calculations, `useCallback` to stabilise function props passed to child components.', category: 'React', difficulty: 'Medium' },
    { q: 'What is CSS specificity and how is it calculated?', a: 'Specificity determines which CSS rule wins when multiple rules target the same element. It is calculated as (inline styles, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Higher specificity wins; equal specificity defers to source order.', category: 'CSS', difficulty: 'Easy' },
    { q: 'What are Core Web Vitals and why do they matter?', a: 'LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). They measure loading, interactivity, and visual stability. Google uses them as ranking signals and they directly impact user experience.', category: 'Performance', difficulty: 'Medium' },
    { q: 'Explain event delegation in JavaScript.', a: 'Instead of attaching listeners to every child element, you attach one listener to a parent and use `event.target` to determine which child was clicked. This is more memory-efficient and works for dynamically added elements.', category: 'JavaScript', difficulty: 'Easy' },
    { q: 'What is the difference between `null` and `undefined` in JavaScript?', a: '`undefined` means a variable has been declared but not assigned. `null` is an explicit assignment meaning "no value". `typeof null === "object"` is a historical bug. Use `=== null` or `=== undefined` for strict checks.', category: 'JavaScript', difficulty: 'Easy' },
    { q: 'How does the browser render a webpage? Walk through the critical rendering path.', a: 'Parse HTML → build DOM. Parse CSS → build CSSOM. Combine into Render Tree. Layout (calculate geometry). Paint (fill pixels). Composite (layer ordering). JS can block parsing; async/defer attributes help. Minimise render-blocking resources.', category: 'Performance', difficulty: 'Hard' },
    { q: 'What is a closure and give a practical use case.', a: 'A closure is a function that retains access to its outer scope even after the outer function has returned. Practical uses: data privacy (module pattern), factory functions, memoisation, event handlers that capture loop variables.', category: 'JavaScript', difficulty: 'Medium' },
  ],
  'Backend Developer': [
    { q: 'What is the difference between SQL and NoSQL databases?', a: 'SQL databases are relational, schema-based, ACID-compliant, and use structured query language. NoSQL databases (document, key-value, graph, column) are schema-flexible, often eventually consistent, and optimised for specific access patterns. Choose based on data structure and consistency requirements.', category: 'Databases', difficulty: 'Easy' },
    { q: 'Explain database indexing and when you would use a composite index.', a: 'An index is a data structure (usually B-tree) that speeds up reads at the cost of write overhead and storage. A composite index covers multiple columns and is useful when queries filter or sort by multiple columns together. Column order matters — the leftmost prefix rule applies.', category: 'Databases', difficulty: 'Medium' },
    { q: 'What is the N+1 query problem and how do you solve it?', a: 'N+1 occurs when you fetch N records then issue one query per record to fetch related data. Solutions: eager loading (JOIN or ORM `include`), DataLoader batching, or denormalisation. Always check query counts in development.', category: 'Databases', difficulty: 'Medium' },
    { q: 'Explain REST vs GraphQL. When would you choose each?', a: 'REST uses fixed endpoints per resource; GraphQL uses a single endpoint with client-specified queries. REST is simpler, cacheable, and widely understood. GraphQL excels when clients need flexible data shapes, multiple resources in one request, or rapid iteration. REST for public APIs; GraphQL for complex client-driven apps.', category: 'API Design', difficulty: 'Medium' },
    { q: 'What is JWT and what are its security considerations?', a: 'JSON Web Token is a signed (and optionally encrypted) token containing claims. Security: use short expiry, store in httpOnly cookies (not localStorage), validate signature server-side, use RS256 for distributed systems, implement token revocation (blacklist or short-lived tokens + refresh).', category: 'Security', difficulty: 'Hard' },
    { q: 'How does database connection pooling work?', a: 'A pool maintains a set of open connections that are reused across requests, avoiding the overhead of creating/closing connections per request. Key settings: min/max pool size, connection timeout, idle timeout. Tune based on DB max_connections and expected concurrency.', category: 'Databases', difficulty: 'Medium' },
    { q: 'Explain the CAP theorem.', a: 'In a distributed system you can only guarantee two of: Consistency (all nodes see the same data), Availability (every request gets a response), Partition tolerance (system works despite network splits). Since partitions are inevitable, you choose CP (e.g. HBase) or AP (e.g. Cassandra).', category: 'System Design', difficulty: 'Hard' },
    { q: 'What is idempotency and why is it important in APIs?', a: 'An operation is idempotent if applying it multiple times produces the same result as applying it once. GET, PUT, DELETE are idempotent; POST is not by default. Critical for retry logic — if a network failure occurs, clients can safely retry idempotent requests without side effects.', category: 'API Design', difficulty: 'Medium' },
  ],
  'Full Stack Developer': [
    { q: 'What is the difference between SSR, SSG, and CSR?', a: 'CSR: browser fetches JS and renders. SSR: server renders HTML per request (fresh data, slower TTFB). SSG: HTML generated at build time (fastest, stale data). ISR (Next.js): SSG with periodic revalidation. Choose based on data freshness vs performance requirements.', category: 'Architecture', difficulty: 'Medium' },
    { q: 'How do you handle authentication in a full-stack app?', a: 'Issue JWT or session token on login. Store in httpOnly cookie (XSS-safe). Send with every request. Server validates token. Implement refresh token rotation. Use HTTPS everywhere. Add CSRF protection for cookie-based auth. Consider OAuth for third-party login.', category: 'Security', difficulty: 'Hard' },
    { q: 'Explain the event loop in Node.js.', a: 'Node.js is single-threaded but non-blocking via the event loop. Phases: timers → I/O callbacks → idle/prepare → poll (wait for I/O) → check (setImmediate) → close callbacks. `process.nextTick` runs before each phase. Avoid blocking the event loop with CPU-intensive synchronous code.', category: 'Node.js', difficulty: 'Hard' },
    { q: 'What is CORS and how do you configure it?', a: 'Cross-Origin Resource Sharing is a browser security mechanism that restricts cross-origin HTTP requests. Configure on the server with `Access-Control-Allow-Origin`, `Allow-Methods`, `Allow-Headers`. For credentials, set `Allow-Credentials: true` and specify exact origin (not *). Preflight OPTIONS requests are sent for non-simple requests.', category: 'Security', difficulty: 'Medium' },
    { q: 'How would you optimise a slow React application?', a: 'Profile with React DevTools. Common fixes: memoisation (React.memo, useMemo, useCallback), code splitting (React.lazy + Suspense), virtualise long lists (react-window), avoid unnecessary re-renders (stable references), optimise images, reduce bundle size (tree shaking, dynamic imports).', category: 'Performance', difficulty: 'Hard' },
    { q: 'What is database migration and how do you manage it?', a: 'Migrations are versioned scripts that evolve the database schema. Tools: Alembic (Python), Flyway, Liquibase, Prisma Migrate. Best practices: never edit existing migrations, make migrations reversible, run in CI/CD before deployment, test on a copy of production data.', category: 'Databases', difficulty: 'Medium' },
  ],
  'Data Scientist': [
    { q: 'What is the bias-variance tradeoff?', a: 'Bias is error from wrong assumptions (underfitting). Variance is error from sensitivity to training data (overfitting). High bias → model too simple. High variance → model too complex. Regularisation, cross-validation, and ensemble methods help find the sweet spot.', category: 'ML Theory', difficulty: 'Medium' },
    { q: 'Explain the difference between L1 and L2 regularisation.', a: 'L1 (Lasso) adds sum of absolute weights — produces sparse models by driving some weights to zero (feature selection). L2 (Ridge) adds sum of squared weights — shrinks all weights but rarely to zero. ElasticNet combines both. Use L1 when you suspect many irrelevant features.', category: 'ML Theory', difficulty: 'Hard' },
    { q: 'How do you handle class imbalance?', a: 'Resampling: oversample minority (SMOTE) or undersample majority. Algorithm-level: class_weight parameter, cost-sensitive learning. Evaluation: use F1, AUC-ROC, precision-recall instead of accuracy. Threshold tuning. Ensemble methods like BalancedRandomForest.', category: 'ML Practice', difficulty: 'Medium' },
    { q: 'What is cross-validation and why is it important?', a: 'CV estimates model performance on unseen data by splitting data into k folds, training on k-1 and validating on 1, rotating k times. Prevents overfitting to a single train/test split. Stratified CV preserves class distribution. Time-series CV respects temporal order.', category: 'ML Practice', difficulty: 'Easy' },
  ],
  'DevOps Engineer': [
    { q: 'What is the difference between Docker and a VM?', a: 'VMs virtualise hardware and run a full OS per instance (heavy, slow to start). Docker containers share the host OS kernel, isolating only the process and filesystem (lightweight, fast). Containers are not as isolated as VMs — use VMs for stronger security boundaries.', category: 'Containers', difficulty: 'Easy' },
    { q: 'Explain blue-green deployment.', a: 'Maintain two identical production environments (blue = live, green = idle). Deploy new version to green, run smoke tests, then switch traffic (DNS or load balancer). Instant rollback by switching back to blue. Requires double infrastructure but zero downtime.', category: 'Deployment', difficulty: 'Medium' },
    { q: 'What is Kubernetes and what problems does it solve?', a: 'Kubernetes is a container orchestration platform. It solves: scheduling containers across nodes, self-healing (restart failed pods), scaling (HPA), service discovery, rolling updates, config/secret management, and resource allocation. Abstracts infrastructure from application teams.', category: 'Kubernetes', difficulty: 'Medium' },
    { q: 'What is Infrastructure as Code and why use it?', a: 'IaC manages infrastructure through code (Terraform, Pulumi, CloudFormation) rather than manual processes. Benefits: version control, reproducibility, peer review, automated testing, disaster recovery, and eliminating configuration drift between environments.', category: 'IaC', difficulty: 'Easy' },
  ],
};

// Fallback for roles not in the map
const DEFAULT_QUESTIONS = QUESTIONS['Full Stack Developer'];

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

export default function InterviewPrep({ targetRole }) {
  const questions = useMemo(() => {
    const key = Object.keys(QUESTIONS).find(k => k === targetRole) || 'Full Stack Developer';
    return QUESTIONS[key] || DEFAULT_QUESTIONS;
  }, [targetRole]);

  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState({});
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(questions.map(q => q.category))];
  const filtered = filter === 'All' ? questions : questions.filter(q => q.category === filter);
  const q = filtered[current] || filtered[0];

  const rate = (r) => {
    setRatings(prev => ({ ...prev, [q.q]: r }));
  };

  const next = () => {
    setRevealed(false);
    setCurrent(c => (c + 1) % filtered.length);
  };

  const prev = () => {
    setRevealed(false);
    setCurrent(c => (c - 1 + filtered.length) % filtered.length);
  };

  const mastered = Object.values(ratings).filter(r => r === 'good').length;
  const progress = questions.length > 0 ? Math.round((mastered / questions.length) * 100) : 0;

  return (
    <div style={s.page} className="deva-ui">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🎯 Interview Prep</h2>
          <p style={s.sub}>Flash cards for {targetRole || 'your target role'}. Rate each answer to track mastery.</p>
        </div>
        <div style={s.progressBox}>
          <div style={s.progressLabel}>{mastered}/{questions.length} Mastered</div>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={s.filters}>
        {categories.map(cat => (
          <button key={cat} onClick={() => { setFilter(cat); setCurrent(0); setRevealed(false); }}
            style={{ ...s.filterBtn, ...(filter === cat ? s.filterActive : {}) }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Card counter */}
      <div style={s.counter}>{current + 1} / {filtered.length}</div>

      {/* Flash card */}
      <AnimatePresence mode="wait">
        <motion.div key={q?.q} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }} style={s.card}>

          {/* Badges */}
          <div style={s.cardTop}>
            <span style={{ ...s.diffBadge, color: DIFF_COLOR[q?.difficulty], borderColor: DIFF_COLOR[q?.difficulty] }}>
              {q?.difficulty}
            </span>
            <span style={s.catBadge}>{q?.category}</span>
            {ratings[q?.q] && (
              <span style={{ ...s.ratingBadge, background: ratings[q?.q] === 'good' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: ratings[q?.q] === 'good' ? '#10b981' : '#ef4444' }}>
                {ratings[q?.q] === 'good' ? '✓ Mastered' : '↺ Review'}
              </span>
            )}
          </div>

          {/* Question */}
          <div style={s.question}>{q?.q}</div>

          {/* Reveal button */}
          {!revealed ? (
            <button onClick={() => setRevealed(true)} style={s.revealBtn}>
              💡 Reveal Answer
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <div style={s.answerLabel}>Answer</div>
              <div style={s.answer}>{q?.a}</div>

              {/* Self-rating */}
              <div style={s.ratingRow}>
                <span style={s.ratingLabel}>How well did you know this?</span>
                <button onClick={() => rate('bad')} style={{ ...s.rateBtn, ...s.rateBad }}>
                  😅 Needs Work
                </button>
                <button onClick={() => rate('good')} style={{ ...s.rateBtn, ...s.rateGood }}>
                  ✅ Got It
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={s.nav}>
        <button onClick={prev} style={s.navBtn}>← Previous</button>
        <button onClick={() => { setRevealed(false); setCurrent(Math.floor(Math.random() * filtered.length)); }}
          style={s.shuffleBtn}>🔀 Shuffle</button>
        <button onClick={next} style={s.navBtn}>Next →</button>
      </div>

      {/* All questions list */}
      <div style={s.listSection}>
        <div style={s.listTitle}>All Questions ({filtered.length})</div>
        <div style={s.list}>
          {filtered.map((item, i) => (
            <button key={i} onClick={() => { setCurrent(i); setRevealed(false); }}
              style={{ ...s.listItem, ...(i === current ? s.listItemActive : {}), ...(ratings[item.q] === 'good' ? s.listItemMastered : {}) }}>
              <span style={s.listNum}>{i + 1}</span>
              <span style={s.listQ}>{item.q}</span>
              <span style={{ ...s.listDiff, color: DIFF_COLOR[item.difficulty] }}>{item.difficulty}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: '0 24px 40px', color: 'var(--text-primary)', background: 'var(--bg-primary)', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  sub: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' },
  progressBox: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 },
  progressLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  progressBar: { height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 4, transition: 'width 0.4s ease' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  filterActive: { background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', fontWeight: 700 },
  counter: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 20, padding: '28px 32px', marginBottom: 20, boxShadow: 'var(--shadow-md)' },
  cardTop: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  diffBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1px solid' },
  catBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' },
  ratingBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  question: { fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: 'var(--text-primary)' },
  revealBtn: { padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' },
  answerLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 },
  answer: { fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-primary)', marginBottom: 20 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  ratingLabel: { fontSize: 13, color: 'var(--text-secondary)', marginRight: 4 },
  rateBtn: { padding: '8px 18px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  rateBad: { background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  rateGood: { background: 'rgba(16,185,129,0.12)', color: '#10b981' },
  nav: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 },
  navBtn: { padding: '10px 24px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  shuffleBtn: { padding: '10px 20px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--accent-amber)', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  listSection: { marginTop: 8 },
  listTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  listItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  listItemActive: { borderColor: 'var(--accent-amber)', background: 'rgba(245,158,11,0.06)' },
  listItemMastered: { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' },
  listNum: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', width: 20, flexShrink: 0 },
  listQ: { flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 },
  listDiff: { fontSize: 11, fontWeight: 700, flexShrink: 0 },
};
