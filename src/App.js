import { useState, useEffect, useRef } from 'react';
import './styles/DesignSystem.css';
import './styles/SmoothAnimations.css';
import './styles/Layout.css';
import './App.css';
import Auth from './components/Auth';
import OnboardingFlow from './components/OnboardingFlow';
import SkillAssessmentQuiz from './components/SkillAssessmentQuiz';
import Dashboard from './components/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import AdvancedConceptsPage from './pages/AdvancedConceptsPage';
import AIChatWidget from './components/ai/AIChatWidget';
import Navigation from './components/Navigation';
import PricingModal from './components/PricingModal';
import ProBadge from './components/ProBadge';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import CommandPalette from './components/CommandPalette';
import DeepWorkPlayer from './components/DeepWorkPlayer';
import HackerConsole from './components/HackerConsole';
import GhostHunterReviewer from './components/GhostHunterReviewer';
import PitchPerfect from './components/PitchPerfect';
import SalaryHeatmap from './components/SalaryHeatmap';
import PredictiveCareerSlider from './components/PredictiveCareerSlider';
import SplashScreen from './components/SplashScreen';
import ExecutiveVault from './components/premium/ExecutiveVault';
import ResumeBuilder from './components/ResumeBuilder';
import DailyChallenge from './components/DailyChallenge';
import InterviewPrep from './components/InterviewPrep';
import GitHubHeatmap from './components/GitHubHeatmap';
import useDynamicFavicon from './hooks/useDynamicFavicon';
import useRoadmapStore from './store/roadmapStore';
import { initiatePayUPayment } from './utils/payuIntegration';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

// ─── Atomic save helper ───────────────────────────────────────────────────────
export async function atomicSaveStep(step) {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  try {
    await fetch('/api/user/status/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ step }),
    });
  } catch { /* silent — offline mode */ }
}

async function fetchUserStatus(authToken) {
  // Local/demo tokens can't hit the backend — restore from localStorage
  if (!authToken || authToken.startsWith('local-token-') || authToken.startsWith('demo-token-')) {
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem('learnerProfile') || 'null'); } catch { return null; }
    })();
    const onboardingDone = localStorage.getItem('onboardingComplete') === 'true';
    return {
      // Once onboarding is done, always go to dashboard — never block on assessment
      status: onboardingDone ? 'dashboard' : 'onboarding_step_0',
      last_saved_step: 0,
      onboarding_complete: onboardingDone,
      is_pro: localStorage.getItem('isPro') === 'true',
      target_role: profile?.targetRole || '',
      user_id: localStorage.getItem('userId') || '',
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      _local: true,
      _profile: profile,
    };
  }
  try {
    const res = await fetch('/api/user/status', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchFullProfile(authToken) {
  const res = await fetch('/api/user/profile', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.profile || null;
}

function buildLearnerProfile(dbProfile) {
  return {
    targetRole: dbProfile.target_role || '',
    knownSkills: (dbProfile.skills || []).map(s => s.skill),
    learningSpeed: dbProfile.learning_speed || 'medium',
    onboarding_complete: dbProfile.onboarding_complete === true || dbProfile.onboarding_complete === 1,
    assessmentResults: dbProfile.latest_quiz || null,
    assessmentComplete: !!dbProfile.latest_quiz,
    timestamp: dbProfile.created_at
  };
}

function getRoleBasedAssessmentSkills(targetRole = '') {
  const role = String(targetRole || '').toLowerCase();

  if (role.includes('frontend') || role.includes('ui') || role.includes('ux')) {
    return ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'];
  }
  if (role.includes('backend') || role.includes('api')) {
    return ['Python', 'Node.js', 'SQL', 'Docker', 'REST APIs'];
  }
  if (role.includes('full stack') || role.includes('fullstack')) {
    return ['JavaScript', 'React', 'Node.js', 'SQL', 'Docker'];
  }
  if (role.includes('data scientist') || role.includes('machine learning') || role.includes('ai')) {
    return ['Python', 'Pandas', 'Machine Learning', 'SQL', 'TensorFlow'];
  }
  if (role.includes('devops') || role.includes('sre') || role.includes('platform')) {
    return ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'];
  }
  if (role.includes('mobile') || role.includes('ios') || role.includes('android')) {
    return ['React Native', 'JavaScript', 'TypeScript', 'REST APIs', 'Testing'];
  }
  if (role.includes('security') || role.includes('penetration')) {
    return ['Cybersecurity', 'OWASP', 'Linux', 'Python', 'Network Security'];
  }

  return ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'];
}

function normalizeSkillName(skill = '') {
  return String(skill).trim().toLowerCase();
}

function buildRolePrioritizedSkills(targetRole, knownSkills = []) {
  const roleSkills = getRoleBasedAssessmentSkills(targetRole);
  const normalizedRole = roleSkills.map(normalizeSkillName);

  // Keep user known skills that are close to role skills.
  const relevantKnown = knownSkills.filter((skill) => {
    const s = normalizeSkillName(skill);
    return normalizedRole.some((roleSkill) => s.includes(roleSkill) || roleSkill.includes(s));
  });

  // Role skills first for consistency, then relevant known skills, deduped.
  const combined = [...roleSkills, ...relevantKnown];
  return [...new Set(combined)].slice(0, 5);
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSkillsAnalysis, setShowSkillsAnalysis] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showRoadmapCanvas, setShowRoadmapCanvas] = useState(false);
  const [showAdvancedConcepts, setShowAdvancedConcepts] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'default');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isPro, setIsPro] = useState(localStorage.getItem('isPro') === 'true');
  const titleRef = useRef(null);

  const { loadFromDB } = useRoadmapStore();

  // Dynamic favicon — show green dot when mentor has notification
  const [hasMentorNotification, setHasMentorNotification] = useState(false);
  useDynamicFavicon(hasMentorNotification);

  // Active feature page (for X-factor routes)
  const [activePage, setActivePage] = useState(null); // 'code-review' | 'pitch-perfect' | 'salary-heatmap'

  // All hooks must be declared before any conditional returns
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('[App] Hash changed:', hash);
      
      if (hash === '#advanced-concepts') {
        setShowAdvancedConcepts(true);
        setShowRoadmapCanvas(false);
        setActivePage(null);
      } else if (hash === '#roadmap') {
        setShowRoadmapCanvas(true);
        setShowAdvancedConcepts(false);
        setActivePage(null);
      } else if (hash === '#code-review') {
        setActivePage('code-review');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#pitch-perfect') {
        setActivePage('pitch-perfect');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#salary-heatmap') {
        setActivePage('salary-heatmap');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#executive-vault') {
        setActivePage('executive-vault');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#resume-builder') {
        setActivePage('resume-builder');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#daily-challenge') {
        setActivePage('daily-challenge');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#interview-prep') {
        setActivePage('interview-prep');
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
      } else if (hash === '#dashboard' || hash === '') {
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
        setActivePage(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
  }, [theme, fontSize]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'default') return 'large';
      if (prev === 'large') return 'small';
      return 'default';
    });
  };

  // ─── Phase 1: Anti-Amnesia Shield ─────────────────────────────────────────
  // On mount: show splash, call /api/user/status, route to exact step
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!authToken || !userId) {
      setAppLoading(false);
      return;
    }

    // Use /status endpoint — single call that tells us exactly where to go
    fetchUserStatus(authToken)
      .then(async (statusData) => {
        if (!statusData) { handleLogout(); return; }

        setIsAuthenticated(true);
        setIsPro(statusData.is_pro || localStorage.getItem('isPro') === 'true');
        const baseUser = {
          id: statusData.user_id,
          name: statusData.name,
          email: statusData.email,
          target_role: statusData.target_role,
          onboarding_complete: statusData.onboarding_complete,
        };
        setCurrentUser(baseUser);

        const { status, last_saved_step } = statusData;

        if (status === 'dashboard') {
          // Fully onboarded — go straight to dashboard
          let profile = null;
          if (statusData._local && statusData._profile) {
            // Offline mode — restore from localStorage
            profile = statusData._profile;
            setLearnerProfile(profile);
          } else {
            const dbProfile = await fetchFullProfile(authToken).catch(() => null);
            if (dbProfile) {
              profile = buildLearnerProfile(dbProfile);
              setLearnerProfile(profile);
              loadFromDB(
                dbProfile.roadmap_id || 'frontend-developer',
                dbProfile.completed_nodes || [],
                dbProfile.stats || {}
              );
            } else {
              setLearnerProfile({
                targetRole: statusData.target_role,
                knownSkills: [],
                learningSpeed: 'medium',
                onboarding_complete: true,
                assessmentComplete: true,
                assessmentResults: null,
              });
            }
          }
          setShowRoadmap(true);

        } else if (status === 'assessment') {
          // Onboarding done but no quiz yet
          if (statusData._local && statusData._profile) {
            setLearnerProfile(statusData._profile);
          } else {
            const dbProfile = await fetchFullProfile(authToken).catch(() => null);
            if (dbProfile) setLearnerProfile(buildLearnerProfile(dbProfile));
            else setLearnerProfile({ targetRole: statusData.target_role, knownSkills: [], learningSpeed: 'medium', onboarding_complete: true });
          }
          setShowAssessment(true);

        } else {
          // onboarding_step_N — resume at exact step
          setShowOnboarding(true);
          // Pass last_saved_step to OnboardingFlow via learnerProfile
          setLearnerProfile({ targetRole: statusData.target_role || '', knownSkills: [], learningSpeed: 'medium', onboarding_complete: false, resumeStep: last_saved_step });
        }
      })
      .catch(() => {
        // Backend offline — check if we have a local session
        const token = localStorage.getItem('authToken');
        const onboardingDone = localStorage.getItem('onboardingComplete') === 'true';
        const savedProfile = (() => {
          try { return JSON.parse(localStorage.getItem('learnerProfile') || 'null'); } catch { return null; }
        })();

        if (token && onboardingDone && savedProfile) {
          setIsAuthenticated(true);
          setCurrentUser({
            id: localStorage.getItem('userId'),
            name: localStorage.getItem('userName'),
            email: localStorage.getItem('userEmail'),
          });
          setLearnerProfile(savedProfile);
          // Once onboarding is done, always go to dashboard
          setShowRoadmap(true);
        } else {
          setShowOnboarding(true);
        }
      })
      .finally(() => setAppLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (titleRef.current && showRoadmap) {
      const titleElement = titleRef.current;
      titleElement.innerHTML = 'DEV<sup>A</sup>';
      titleElement.style.opacity = '1';
      gsap.timeline().fromTo('.App-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [showRoadmap]);

  const handleAuthSuccess = async (user) => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAppLoading(true);

    try {
      const statusData = await fetchUserStatus(authToken);
      if (statusData) {
        setIsPro(statusData.is_pro || false);
        if (statusData.status === 'dashboard') {
          const dbProfile = await fetchFullProfile(authToken).catch(() => null);
          if (dbProfile) {
            setLearnerProfile(buildLearnerProfile(dbProfile));
            loadFromDB(dbProfile.roadmap_id || 'frontend-developer', dbProfile.completed_nodes || [], dbProfile.stats || {});
          } else {
            setLearnerProfile({ targetRole: statusData.target_role, knownSkills: [], learningSpeed: 'medium', onboarding_complete: true, assessmentComplete: true, assessmentResults: null });
          }
          setShowRoadmap(true);
        } else if (statusData.status === 'assessment') {
          const dbProfile = await fetchFullProfile(authToken).catch(() => null);
          if (dbProfile) setLearnerProfile(buildLearnerProfile(dbProfile));
          setShowAssessment(true);
        } else {
          setLearnerProfile({ targetRole: statusData.target_role || '', knownSkills: [], learningSpeed: 'medium', onboarding_complete: false, resumeStep: statusData.last_saved_step });
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    } finally {
      setAppLoading(false);
    }
  };
  const isPaymentPage = window.location.pathname === '/payment/success' ||
                        window.location.pathname === '/payment/failure';
  if (isPaymentPage) {
    if (window.location.pathname === '/payment/success') return <PaymentSuccess />;
    return <PaymentFailure />;
  }

  const handleLogout = () => {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).catch(() => {});
    }
    
    // Clear all session data
    ['authToken','userId','userEmail','userName',
     'onboardingComplete','assessmentComplete','learnerProfile','isPro'].forEach(k => localStorage.removeItem(k));
    
    // Clear state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLearnerProfile(null);
    setShowOnboarding(false);
    setShowAssessment(false);
    setShowSkillsAnalysis(false);
    setShowRoadmap(false);
    setShowRoadmapCanvas(false);
    setActivePage(null);
    setAppLoading(false);
  };

  const handleOnboardingComplete = async (profile) => {
    const authToken = localStorage.getItem('authToken');
    
    setShowOnboarding(false);
    setLearnerProfile(profile);

    // ── Always persist to localStorage for offline/refresh resilience ──
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('learnerProfile', JSON.stringify(profile));
    
    // Save to backend if online
    if (authToken && profile.targetRole) {
      try {
        const response = await fetch('/api/user/complete-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({
            target_role: profile.targetRole,
            known_skills: profile.knownSkills || [],
            learning_speed: profile.learningSpeed || 'medium'
          })
        });
        if (response.ok) console.log('✓ Onboarding saved to DB');
      } catch (err) {
        console.warn('⚠ Could not save onboarding to backend (offline mode):', err);
      }
    }
    
    setShowAssessment(true);
  };

  const handleChangeRole = () => {
    // Reset onboarding state to allow user to go through it again
    setShowRoadmap(false);
    setShowRoadmapCanvas(false);
    setShowOnboarding(true);
    setLearnerProfile(null);
    localStorage.removeItem('onboardingComplete');
  };

  const handleAssessmentComplete = async (assessmentResults) => {
    const authToken = localStorage.getItem('authToken');
    const updatedProfile = {
      ...learnerProfile,
      assessmentComplete: true,
      assessmentResults
    };
    setLearnerProfile(updatedProfile);

    // ── Always persist to localStorage for offline/refresh resilience ──
    localStorage.setItem('assessmentComplete', 'true');
    localStorage.setItem('learnerProfile', JSON.stringify(updatedProfile));

    // Save quiz results to database (if online)
    if (authToken) {
      const skillKeys = Object.keys(assessmentResults || {});
      const totalQ = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.total || 0), 0);
      const totalCorrect = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.correct || 0), 0);
      try {
        const response = await fetch('/api/user/quiz/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
          body: JSON.stringify({
            quiz_type: 'skill_assessment',
            score: totalCorrect,
            total_questions: totalQ,
            category: updatedProfile.targetRole || '',
            results_data: assessmentResults
          })
        });
        if (response.ok) console.log('✓ Assessment saved to DB');
      } catch (err) {
        console.warn('⚠ Could not save quiz to backend (offline mode):', err);
      }
    }

    setShowAssessment(false);
    setShowSkillsAnalysis(true);
  };

  const handleUpgrade = async (planDetails) => {
    console.log('Upgrading to DEVAsquare Pro:', planDetails);
    
    try {
      // Get user details
      const userDetails = {
        name: currentUser?.name || 'User',
        email: currentUser?.email || localStorage.getItem('userEmail') || 'user@example.com',
        phone: currentUser?.phone || '9999999999'
      };

      // Initiate PayU payment
      const result = await initiatePayUPayment(planDetails, userDetails);
      
      if (!result.success) {
        alert('Payment initiation failed: ' + result.error);
      }
      // PayU will redirect to their payment page
      // User will be redirected back to success/failure page after payment
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    }
  };

  if (appLoading) {
    return <SplashScreen message="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess} 
        theme={theme} 
        toggleTheme={toggleTheme}
        fontSize={fontSize}
        cycleFontSize={cycleFontSize}
      />
    );
  }

  if (showOnboarding) {
    return (
      <>
        <Navigation 
          currentUser={currentUser} 
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          currentPage="onboarding"
        />
        <OnboardingFlow 
          onComplete={handleOnboardingComplete} 
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <AIChatWidget />
        <CommandPalette onTheme={toggleTheme} onLogout={handleLogout} />
      </>
    );
  }

  if (showAssessment && learnerProfile) {
    const normalizedKnownSkills = (learnerProfile.knownSkills || [])
      .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
      .map((skill) => skill.trim());

    const skillsToAssess = buildRolePrioritizedSkills(
      learnerProfile.targetRole,
      normalizedKnownSkills
    );

    return (
      <>
        <Navigation 
          currentUser={currentUser} 
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          currentPage="assessment"
        />
        <SkillAssessmentQuiz
          skills={skillsToAssess}
          onComplete={handleAssessmentComplete}
          onClose={() => {
            setShowAssessment(false);
            setShowSkillsAnalysis(true);
          }}
        />
        <AIChatWidget />
      </>
    );
  }

  if (showSkillsAnalysis && learnerProfile) {
    return (
      <>
        <Navigation 
          currentUser={currentUser} 
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          currentPage="analysis"
        />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          textAlign: 'center'
        }}>
          <style>{`
            @keyframes pulse-glow-premium {
              0% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.15), 0 0 40px rgba(251, 191, 36, 0.05); }
              50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.3), 0 0 90px rgba(251, 191, 36, 0.15); }
              100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.15), 0 0 40px rgba(251, 191, 36, 0.05); }
            }
            @keyframes float-up-stagger {
              0% { transform: translateY(30px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes pop-in-emoji {
              0% { transform: scale(0.5); opacity: 0; }
              70% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .premium-celebration-card {
              max-width: 650px;
              width: 100%;
              background: var(--bg-card);
              padding: 4rem 3rem;
              border-radius: 28px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              position: relative;
              overflow: hidden;
              animation: float-up-stagger 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              backdrop-filter: blur(20px);
            }
            .premium-celebration-card::before {
              content: '';
              position: absolute;
              top: -50%; left: -50%; width: 200%; height: 200%;
              background: radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 50%);
              animation: pulse-glow-premium 4s infinite alternate;
              z-index: 0; pointer-events: none;
            }
            .celeb-emoji {
              font-size: 5.5rem;
              margin-bottom: 1.5rem;
              animation: pop-in-emoji 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              opacity: 0;
              position: relative; z-index: 1;
              display: inline-block;
            }
            .celeb-title {
              font-size: 2.75rem;
              font-weight: 800;
              background: linear-gradient(135deg, var(--text-primary) 20%, var(--accent-primary) 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 1.25rem;
              animation: float-up-stagger 0.8s ease forwards;
              animation-delay: 0.2s;
              opacity: 0;
              position: relative; z-index: 1;
              letter-spacing: -0.02em;
            }
            .celeb-subtitle {
              font-size: 1.125rem;
              color: var(--text-secondary);
              margin-bottom: 3.5rem;
              line-height: 1.6;
              animation: float-up-stagger 0.8s ease forwards;
              animation-delay: 0.4s;
              opacity: 0;
              position: relative; z-index: 1;
              max-width: 80%;
              margin-left: auto;
              margin-right: auto;
            }
            .celeb-actions {
              display: flex;
              gap: 1.5rem;
              justify-content: center;
              flex-wrap: wrap;
              animation: float-up-stagger 0.8s ease forwards;
              animation-delay: 0.6s;
              opacity: 0;
              position: relative; z-index: 1;
            }
            .btn-celeb-primary {
              padding: 1rem 2.5rem;
              background: linear-gradient(135deg, var(--accent-primary) 0%, #f59e0b 100%);
              color: white;
              border: none;
              border-radius: 999px;
              font-size: 1.125rem;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
            }
            .btn-celeb-primary:hover {
              transform: translateY(-4px) scale(1.03);
              box-shadow: 0 15px 35px rgba(251, 191, 36, 0.5);
            }
            .btn-celeb-secondary {
              padding: 1rem 2.5rem;
              background: transparent;
              color: var(--text-secondary);
              border: 2px solid rgba(255, 255, 255, 0.1);
              border-radius: 999px;
              font-size: 1.125rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .btn-celeb-secondary:hover {
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-primary);
              border-color: rgba(255, 255, 255, 0.2);
            }
          `}</style>
          
          <div className="premium-celebration-card">
            <div className="celeb-emoji">🎉</div>
            <h1 className="celeb-title">Assessment Complete!</h1>
            <p className="celeb-subtitle">
              Incredible job! We've successfully analyzed your skills and forged your personalized dashboard. 
              Your profile is now permanently ready.
            </p>
            <div className="celeb-actions">
              <button
                className="btn-celeb-secondary"
                onClick={() => {
                  setShowSkillsAnalysis(false);
                  setShowAssessment(true);
                }}
              >
                Retake Assessment
              </button>
              <button
                className="btn-celeb-primary"
                onClick={() => {
                  // Persist final state to localStorage before navigating
                  localStorage.setItem('onboardingComplete', 'true');
                  localStorage.setItem('assessmentComplete', 'true');
                  if (learnerProfile) {
                    localStorage.setItem('learnerProfile', JSON.stringify({
                      ...learnerProfile,
                      onboarding_complete: true,
                      assessmentComplete: true,
                    }));
                  }

                  setShowSkillsAnalysis(false);
                  setShowRoadmap(true);

                  const authToken = localStorage.getItem('authToken');
                  if (authToken) {
                    fetch('/api/user/complete-onboarding', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                      body: JSON.stringify({
                        target_role: learnerProfile?.targetRole || 'Full Stack Developer',
                        known_skills: learnerProfile?.knownSkills || [],
                        learning_speed: learnerProfile?.learningSpeed || 'medium'
                      })
                    }).catch(() => {});
                  }
                }}
              >
                Launch Dashboard 🚀
              </button>
            </div>
          </div>
        </div>
        <AIChatWidget />
      </>
    );
  }

  // Show Dashboard for returning users
  if (showRoadmap && learnerProfile) {
    if (showAdvancedConcepts) {
      return (
        <>
          <AdvancedConceptsPage
            learnerProfile={learnerProfile}
            currentUser={currentUser}
            onBack={() => {
              setShowAdvancedConcepts(false);
              window.location.hash = '';
            }}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <AIChatWidget />
        </>
      );
    }

    if (activePage === 'code-review') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="code-review" />
          <div style={{ paddingTop: 'var(--nav-height, 64px)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <GhostHunterReviewer />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'pitch-perfect') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="pitch-perfect" />
          <div style={{ paddingTop: 'var(--nav-height, 64px)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <PitchPerfect />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'salary-heatmap') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="salary-heatmap" />
          <div style={{ paddingTop: 'var(--nav-height, 64px)', padding: '80px 24px 24px', background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <SalaryHeatmap targetRole={learnerProfile?.targetRole} />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'executive-vault') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="executive-vault" />
          <div style={{ paddingTop: 64 }}>
            <ExecutiveVault isPro={isPro} onUpgradeClick={() => setShowPricingModal(true)} />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'resume-builder') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="resume-builder" />
          <div style={{ paddingTop: 64 }}>
            <ResumeBuilder isPro={isPro} onUpgradeClick={() => setShowPricingModal(true)} learnerProfile={learnerProfile} />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'daily-challenge') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="daily-challenge" />
          <div style={{ paddingTop: 'var(--nav-height,64px)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <DailyChallenge />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (activePage === 'interview-prep') {
      return (
        <>
          <Navigation currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} currentPage="interview-prep" />
          <div style={{ paddingTop: 'var(--nav-height,64px)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <InterviewPrep targetRole={learnerProfile?.targetRole} />
          </div>
          <AIChatWidget />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    if (showRoadmapCanvas) {
      return (
        <>
          <RoadmapPage
            learnerProfile={learnerProfile}
            currentUser={currentUser}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            fontSize={fontSize}
            cycleFontSize={cycleFontSize}
          />
          <AIChatWidget />
          <DeepWorkPlayer />
          <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
          <CommandPalette onNavigate={() => {}} onUpgrade={() => setShowPricingModal(true)} onTheme={toggleTheme} onLogout={handleLogout} />
        </>
      );
    }

    return (
      <>
        <Dashboard
          learnerProfile={learnerProfile}
          currentUser={currentUser}
          onLogout={handleLogout}
          onChangeRole={handleChangeRole}
          onOpenRoadmap={() => setShowRoadmapCanvas(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          isPro={isPro}
          onUpgradeClick={() => setShowPricingModal(true)}
        />
        {/* Predictive Career Slider — inside dashboard max-width container */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2.5rem 2rem' }}>
          <PredictiveCareerSlider targetRole={learnerProfile?.targetRole} learnerProfile={learnerProfile} />
        </div>
        <AIChatWidget />
        <DeepWorkPlayer />
        <HackerConsole learnerProfile={learnerProfile} currentUser={currentUser} onTheme={toggleTheme} />
        <CommandPalette
          onNavigate={() => {}}
          onUpgrade={() => setShowPricingModal(true)}
          onTheme={toggleTheme}
          onLogout={handleLogout}
          onAssessment={() => { setShowRoadmap(false); setShowAssessment(true); }}
        />
        {!isPro && (
          <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
            <ProBadge onClick={() => setShowPricingModal(true)} />
          </div>
        )}
        <PricingModal 
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onUpgrade={handleUpgrade}
        />
      </>
    );
  }

  return null;
}

export default App;
