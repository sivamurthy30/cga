import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScrambleText from './ScrambleText';
import '../styles/SmoothAnimations.css';

const LoadingScreen = ({ message = "Analyzing your professional profile..." }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const scanRef = useRef(null);
  const codeLinesRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pulsing effect for the card
      gsap.to(cardRef.current, {
        scale: 1.02,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Scanning line effect
      gsap.fromTo(scanRef.current, 
        { top: '-10%' }, 
        { 
          top: '110%', 
          duration: 2.2, 
          ease: "power2.inOut",
          repeat: -1
        }
      );

      // Staggered code lines pulsing
      const lines = codeLinesRef.current.querySelectorAll('.code-line');
      if (lines.length) {
        gsap.fromTo(lines, 
          { opacity: 0.1, x: -5 },
          { 
            opacity: 0.6, 
            x: 0, 
            duration: 0.5, 
            stagger: 0.15, 
            repeat: -1, 
            yoyo: true,
            repeatDelay: 0.2
          }
        );
      }

      // Floating particles/icons
      const particles = containerRef.current.querySelectorAll('.floating-particle');
      if (particles.length) {
        particles.forEach((p, i) => {
          gsap.to(p, {
            x: (i % 2 === 0 ? 50 : -50),
            y: (i % 2 === 0 ? -30 : 30),
            duration: 3 + i,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'Inter', sans-serif",
      flexDirection: 'column',
    },
    content: {
      width: '90%',
      maxWidth: '420px',
      textAlign: 'center',
      color: '#fff',
    },
    logoContainer: {
      marginBottom: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    logoText: {
      fontSize: '1rem',
      fontWeight: '800',
      letterSpacing: '6px',
      color: 'var(--accent-primary)',
      margin: 0,
      textTransform: 'uppercase',
      opacity: 0.8,
    },
    icon: {
      fontSize: '2.5rem',
      marginTop: '1rem',
      filter: 'drop-shadow(0 0 15px var(--accent-primary))',
      animation: 'smoothSpin 10s linear infinite',
    },
    card: {
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '28px',
      padding: '2.5rem',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)',
      marginBottom: '2.5rem',
    },
    scanLine: {
      position: 'absolute',
      left: 0,
      width: '100%',
      height: '3px',
      background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
      boxShadow: '0 0 20px var(--accent-primary)',
      zIndex: 2,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    skeletonCircle: {
      width: '52px',
      height: '52px',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      marginRight: '1rem',
    },
    headerText: {
      flex: 1,
      textAlign: 'left',
    },
    skeletonBar: {
      borderRadius: '4px',
      background: 'rgba(255, 255, 255, 0.08)',
    },
    cardBody: {
      marginBottom: '2rem',
    },
    codeContainer: {
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    cardFooter: {
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      paddingTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    message: {
      fontSize: '1.2rem',
      fontWeight: '500',
      color: '#f8fafc',
      marginBottom: '2rem',
      letterSpacing: '0.5px',
    },
    statusContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      alignItems: 'center',
    },
    statusItem: {
      fontSize: '0.9rem',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      animation: 'smoothFadeIn 0.8s ease forwards',
    },
    statusDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: 'var(--accent-primary)',
      boxShadow: '0 0 10px var(--accent-primary)',
    },
    particle: {
      position: 'absolute',
      fontSize: '1.5rem',
      opacity: 0.1,
      pointerEvents: 'none',
      filter: 'blur(2px)',
    }
  };

  return (
    <div className="premium-loading-overlay" ref={containerRef} style={styles.overlay}>
      {/* Background Particles */}
      <div className="floating-particle" style={{...styles.particle, top: '20%', left: '15%'}}>⚙️</div>
      <div className="floating-particle" style={{...styles.particle, top: '15%', right: '20%'}}>⚡</div>
      <div className="floating-particle" style={{...styles.particle, bottom: '25%', left: '20%'}}>🔍</div>
      <div className="floating-particle" style={{...styles.particle, bottom: '15%', right: '15%'}}>🧠</div>

      <div className="premium-loading-content" style={styles.content}>
        
        {/* Animated Logo */}
        <div style={styles.logoContainer}>
          <h2 style={styles.logoText}>
            <ScrambleText text="AI ANALYSIS" duration={2000} />
          </h2>
          <div className="loading-icon" style={styles.icon}>🎯</div>
        </div>

        {/* Mock Analysis Card (Skeleton) */}
        <div className="skeleton-card" ref={cardRef} style={styles.card}>
          <div className="scan-line" ref={scanRef} style={styles.scanLine}></div>
          
          <div style={styles.cardHeader}>
            <div className="skeleton-circle" style={styles.skeletonCircle}></div>
            <div style={styles.headerText}>
              <div className="skeleton-bar" style={{...styles.skeletonBar, width: '140px', height: '20px'}}></div>
              <div className="skeleton-bar" style={{...styles.skeletonBar, width: '90px', height: '12px', marginTop: '10px', opacity: 0.4}}></div>
            </div>
          </div>

          <div style={styles.cardBody}>
            <div className="code-lines" ref={codeLinesRef} style={styles.codeContainer}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="code-line">
                  <div className="skeleton-bar" style={{...styles.skeletonBar, width: `${20 + (Math.random() * 60)}%`, height: '8px', opacity: 0.4}}></div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.cardFooter}>
            <div className="skeleton-bar" style={{...styles.skeletonBar, width: '100%', height: '10px', opacity: 0.2}}></div>
            <div className="skeleton-bar" style={{...styles.skeletonBar, width: '80%', height: '10px', opacity: 0.1}}></div>
          </div>
        </div>

        <p className="loading-message pulse" style={styles.message}>
          {message}
        </p>

        {/* Data processing stream info */}
        <div style={styles.statusContainer}>
          <div className="stagger-item" style={{...styles.statusItem, animationDelay: '0.2s'}}>
            <span style={styles.statusDot}></span>
            Parsing skill hierarchy
          </div>
          <div className="stagger-item" style={{...styles.statusItem, animationDelay: '0.6s'}}>
            <span style={styles.statusDot}></span>
            Identifying project impact
          </div>
          <div className="stagger-item" style={{...styles.statusItem, animationDelay: '1s'}}>
            <span style={styles.statusDot}></span>
            Generating AI role match
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
