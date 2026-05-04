import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import '../../styles/Auth.css';
import ScrambleText from '../common/ScrambleText';
import ThemeToggle from '../common/ThemeToggle';

const useGSAPAnimations = (containerRef, logoRef, formRef, taglineRef, featuresRef) => {
  useEffect(() => {
    if (!containerRef.current || !logoRef.current || !formRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      tl.fromTo(logoRef.current,
        { y: -80, opacity: 0, scale: 0.3, rotationX: 90 },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=0.1');
      if (taglineRef?.current) {
        tl.fromTo(taglineRef.current,
          { opacity: 0, y: 15, letterSpacing: '8px' },
          { opacity: 1, y: 0, letterSpacing: '1px', duration: 0.8, ease: 'power3.out' }, '-=0.6');
      }
      tl.fromTo(formRef.current,
        { y: 60, opacity: 0, scale: 0.95, filter: 'blur(8px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, '-=0.5');
      const formGroups = formRef.current.querySelectorAll('.form-group');
      if (formGroups.length) {
        tl.fromTo(formGroups,
          { x: (i) => (i % 2 === 0 ? -40 : 40), opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' }, '-=0.4');
      }
      const buttons = formRef.current.querySelectorAll('button');
      if (buttons.length) {
        tl.fromTo(buttons,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' }, '-=0.3');
      }
      if (featuresRef?.current) {
        const featureItems = featuresRef.current.querySelectorAll('.feature-item');
        if (featureItems.length) {
          tl.fromTo(featureItems,
            { y: 30, opacity: 0, scale: 0.5, rotation: -10 },
            { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(2.5)' }, '-=0.3');
        }
      }
      gsap.to(logoRef.current, { y: -5, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: tl.duration() });
    });
    return () => ctx.revert();
  }, []);
};

const Auth = ({ onAuthSuccess, theme, toggleTheme }) => {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const formRef = useRef(null);
  const taglineRef = useRef(null);
  const featuresRef = useRef(null);

  useGSAPAnimations(containerRef, logoRef, formRef, taglineRef, featuresRef);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const toggleMode = useCallback(() => {
    if (!formRef.current) { setIsLogin(!isLogin); return; }
    const tl = gsap.timeline();
    tl.to(formRef.current, {
      rotationY: 90, opacity: 0, scale: 0.9, duration: 0.25, ease: 'power2.in',
      onComplete: () => { setIsLogin(prev => !prev); setError(''); setFormData({ email: '', name: '', password: '', confirmPassword: '' }); }
    }).fromTo(formRef.current,
      { rotationY: -90, opacity: 0, scale: 0.9 },
      { rotationY: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out', delay: 0.05 });
  }, [isLogin]);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const demoUser = { id: 'demo-user-001', email: 'demo@deva.ai', name: 'Demo User', is_pro: false };
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      localStorage.setItem('userId', demoUser.id);
      localStorage.setItem('userEmail', demoUser.email);
      localStorage.setItem('userName', demoUser.name);
      const demoProfile = {
        userId: demoUser.id, targetRole: 'Full Stack Developer',
        knownSkills: ['JavaScript', 'React', 'Python', 'Node.js', 'SQL'],
        onboarding_complete: true, assessmentComplete: true,
        assessmentResults: {
          'JavaScript': { correct: 3, total: 4, weightedPercentage: 75, level: 'intermediate' },
          'React': { correct: 2, total: 4, weightedPercentage: 50, level: 'beginner' },
          'Python': { correct: 3, total: 4, weightedPercentage: 75, level: 'intermediate' },
          'Node.js': { correct: 2, total: 4, weightedPercentage: 50, level: 'beginner' },
          'SQL': { correct: 3, total: 4, weightedPercentage: 75, level: 'intermediate' },
        }
      };
      localStorage.setItem('learnerProfile', JSON.stringify(demoProfile));
      localStorage.setItem('onboardingComplete', 'true');
      gsap.to('.auth-form', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => onAuthSuccess(demoUser) });
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Try backend pro login first
      let proUser = null;
      try {
        const res = await fetch('/api/auth/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'pro@deva.dev' }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('userName', data.user.name);
          localStorage.setItem('isPro', 'true');
          proUser = data.user;
        }
      } catch { /* backend not available — use local pro demo */ }

      if (!proUser) {
        // Offline fallback
        proUser = { id: 'pro-demo-001', email: 'pro@deva.dev', name: 'Pro User', is_pro: true,
                    onboarding_complete: true, assessment_complete: true };
        localStorage.setItem('authToken', 'demo-token-pro-' + Date.now());
        localStorage.setItem('userId', proUser.id);
        localStorage.setItem('userEmail', proUser.email);
        localStorage.setItem('userName', proUser.name);
        localStorage.setItem('isPro', 'true');
      }

      const proProfile = {
        targetRole: 'Full Stack Developer',
        knownSkills: ['JavaScript', 'React', 'Python', 'Node.js', 'SQL', 'Docker', 'AWS'],
        onboarding_complete: true, assessmentComplete: true,
        assessmentResults: {
          'JavaScript': { correct: 4, total: 4, weightedPercentage: 100, level: 'expert' },
          'React':      { correct: 4, total: 4, weightedPercentage: 100, level: 'expert' },
          'Python':     { correct: 3, total: 4, weightedPercentage: 75,  level: 'advanced' },
          'Node.js':    { correct: 4, total: 4, weightedPercentage: 100, level: 'expert' },
          'SQL':        { correct: 3, total: 4, weightedPercentage: 75,  level: 'advanced' },
        }
      };
      localStorage.setItem('learnerProfile', JSON.stringify(proProfile));
      localStorage.setItem('onboardingComplete', 'true');

      gsap.to('.auth-form', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => onAuthSuccess(proUser) });
    } catch {
      setError('Pro demo login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateEmail(formData.email)) { setError('Please enter a valid email address'); setIsLoading(false); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return; }
    if (!isLogin) {
      if (!formData.name.trim()) { setError('Please enter your name'); setIsLoading(false); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      let response, data;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, name: formData.name || formData.email.split('@')[0] }),
          signal: AbortSignal.timeout(8000),
        });
        data = await response.json();
      } catch (fetchError) {
        // Backend not reachable — offline mode
        const localUser = { id: 'local-user-' + Date.now(), email: formData.email, name: formData.name || formData.email.split('@')[0] };
        localStorage.setItem('authToken', 'local-token-' + Date.now());
        localStorage.setItem('userId', localUser.id);
        localStorage.setItem('userEmail', localUser.email);
        localStorage.setItem('userName', localUser.name);
        gsap.to('.auth-form', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => onAuthSuccess(localUser) });
        return;
      }

      if (!response.ok) {
        const msg = data.detail || data.error || 'Authentication failed';
        // 503 = MongoDB still connecting — give a friendly message
        if (response.status === 503) {
          setError('Server is starting up, please try again in a few seconds.');
        } else {
          setError(msg);
        }
        setIsLoading(false);
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      if (data.user.is_pro) localStorage.setItem('isPro', 'true');

      gsap.to('.auth-form', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => onAuthSuccess(data.user) });

    } catch (err) {
      setError(err.message || 'Authentication failed');
      gsap.fromTo('.auth-form', { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" ref={containerRef}>
      <div className="auth-background"></div>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 1000 }}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-logo" ref={logoRef}>
            <ScrambleText text="DEV" duration={2000} /><sup>A</sup>
          </h1>
          <p className="auth-tagline" ref={taglineRef}>Intelligent Career Development Platform</p>
        </div>

        <div className="auth-form-container" ref={formRef}>
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Access your personalized learning dashboard' : 'Begin your journey to career excellence'}
            </p>

            {error && (
              <div className="auth-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" disabled={isLoading} required />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" disabled={isLoading} required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" disabled={isLoading} required />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                At least 6 characters
              </span>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" disabled={isLoading} required />
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <><span className="spinner"></span>{isLogin ? 'Signing In...' : 'Creating Account...'}</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="auth-demo-btn" onClick={handleDemoLogin} disabled={isLoading}
                style={{ flex: 1 }}>
                Try Demo
              </button>
              <button type="button" className="auth-demo-btn" onClick={handleProDemoLogin} disabled={isLoading}
                style={{ flex: 1, background: 'var(--accent-primary)', color: '#000', border: 'none' }}>
                ⭐ Try Pro
              </button>
            </div>

            <button type="button" className="auth-toggle-btn" onClick={toggleMode} disabled={isLoading}>
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </form>

          <div className="auth-features" ref={featuresRef}>
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span>Secure & Private</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span>Progress Tracking</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <span>AI-Driven Learning</span>
            </div>
          </div>

          <div className="auth-footer">
            <p>Personalized skill development powered by machine learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
