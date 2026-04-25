import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function SplashScreen({ message = 'Restoring your session...' }) {
  const logoRef = useRef(null);
  const ringRef = useRef(null);
  const scanRef = useRef(null);
  const msgRef  = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(logoRef.current, { scale:1.08, duration:1.2, ease:'sine.inOut', yoyo:true, repeat:-1 });
      gsap.to(ringRef.current, { rotation:360, duration:2.4, ease:'none', repeat:-1 });
      gsap.fromTo(scanRef.current,
        { top:'-10%', opacity:0.8 },
        { top:'110%', opacity:0, duration:1.8, ease:'power2.inOut', repeat:-1, repeatDelay:0.4 });
      gsap.fromTo(msgRef.current, { opacity:0, y:10 }, { opacity:1, y:0, duration:0.6, delay:0.3 });
      const dots = dotsRef.current?.querySelectorAll('.splash-dot');
      if (dots?.length) gsap.fromTo(dots, { opacity:0.2, scale:0.8 }, { opacity:1, scale:1, duration:0.4, stagger:0.15, repeat:-1, yoyo:true });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div ref={scanRef} style={s.scanLine} />

        <div ref={logoRef} style={s.logoWrap}>
          <div style={s.ring} ref={ringRef}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={44} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth={3} />
              <circle cx={50} cy={50} r={44} fill="none" stroke="#f59e0b" strokeWidth={3}
                strokeDasharray="60 220" strokeLinecap="round" />
            </svg>
          </div>
          <div style={s.logoText}>DEV<sup style={s.sup}>A</sup></div>
        </div>

        <p ref={msgRef} style={s.message}>{message}</p>

        <div ref={dotsRef} style={s.dots}>
          {[0,1,2].map(i => <span key={i} className="splash-dot" style={s.dot} />)}
        </div>

        <div style={s.statusList}>
          {['Verifying session','Loading profile','Syncing progress'].map((item, i) => (
            <div key={i} style={s.statusItem}>
              <span style={{ ...s.statusDot, animationDelay:`${i*0.3}s` }} />
              <span style={s.statusText}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes statusPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

const s = {
  overlay: {
    position:'fixed', inset:0, zIndex:9999,
    background:'var(--bg-primary)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  card: {
    position:'relative', overflow:'hidden',
    background:'var(--bg-card)',
    border:'1px solid var(--border-primary)',
    borderRadius:24, padding:'48px 56px',
    display:'flex', flexDirection:'column', alignItems:'center', gap:20,
    boxShadow:'var(--shadow-glow)',
    minWidth:320,
  },
  scanLine: {
    position:'absolute', left:0, right:0, height:2,
    background:'linear-gradient(90deg, transparent, var(--accent-amber), transparent)',
    pointerEvents:'none',
  },
  logoWrap: {
    position:'relative', width:100, height:100,
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  ring: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' },
  logoText: {
    fontSize:28, fontWeight:800, color:'var(--text-primary)',
    fontFamily:'var(--font-mono)', position:'relative', zIndex:1,
  },
  sup: { color:'var(--accent-amber)', fontSize:'0.55em', verticalAlign:'super' },
  message: { color:'var(--text-muted)', fontSize:13, fontFamily:'var(--font-mono)', margin:0, letterSpacing:'0.05em' },
  dots: { display:'flex', gap:8 },
  dot: { display:'inline-block', width:6, height:6, borderRadius:'50%', background:'var(--accent-amber)' },
  statusList: { display:'flex', flexDirection:'column', gap:8, width:'100%' },
  statusItem: { display:'flex', alignItems:'center', gap:10 },
  statusDot: {
    display:'inline-block', width:6, height:6, borderRadius:'50%',
    background:'var(--accent-amber)', animation:'statusPulse 1.2s ease-in-out infinite',
  },
  statusText: { color:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-mono)' },
};
