import { useState, useEffect, useRef } from 'react';
import './styles/DesignSystem.css';
import './styles/SmoothAnimations.css';
import './App.css';
import Auth from './components/Auth';
import OnboardingFlow from './components/OnboardingFlow';
import SkillAssessmentQuiz from './components/SkillAssessmentQuiz';
import Dashboard from './components/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import AdvancedConceptsPage from './pages/AdvancedConceptsPage';
import AIChatWidget from './components/ai/AIChatWidget';
import Navigation from './components/Navigation';
import useRoadmapStore from './store/roadmapStore';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

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
  const titleRef = useRef(null);

  const { loadFromDB } = useRoadmapStore();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('[App] Hash changed:', hash);
      
      if (hash === '#advanced-concepts') {
        setShowAdvancedConcepts(true);
        setShowRoadmapCanvas(false);
      } else if (hash === '#roadmap') {
        setShowRoadmapCanvas(true);
        setShowAdvancedConcepts(false);
      } else if (hash === '#dashboard' || hash === '') {
        setShowAdvancedConcepts(false);
        setShowRoadmapCanvas(false);
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

  const restoreSessionFromDB = async (authToken, baseUser) => {
    console.log('=== Restoring session from DATABASE ===');
    console.log('Auth token:', authToken ? 'exists' : 'missing');
    console.log('Base user from auth:', baseUser);
    
    // Check if the base user from verify/login already shows onboarding as complete
    // Backend might return 1/0 or true/false
    const isOnboardingComplete = baseUser.onboarding_complete === true || 
                                 baseUser.onboarding_complete === 1 || 
                                 baseUser.onboarding_complete === "1";

    if (isOnboardingComplete && baseUser.target_role) {
      console.log('✓ User has completed onboarding (from auth response) - going to dashboard');
      
      setCurrentUser(baseUser);
      // Construct a minimal learner profile until full profile is fetched
      const profile = {
        targetRole: baseUser.target_role,
        knownSkills: [],
        learningSpeed: baseUser.learning_speed || 'medium',
        onboarding_complete: true,
        assessmentComplete: true,
        assessmentResults: null,
        timestamp: new Date().toISOString()
      };
      setLearnerProfile(profile);
      
      setShowRoadmap(true);
      setShowOnboarding(false);
      setShowAssessment(false);
      setShowSkillsAnalysis(false);

      // Still fetch full profile in background to get skills/stats
      fetchFullProfile(authToken).then(dbProfile => {
        if (dbProfile) {
          console.log('✓ Full profile fetched in background');
          const fullProfile = buildLearnerProfile(dbProfile);
          setLearnerProfile(fullProfile);
          loadFromDB(
            dbProfile.roadmap_id || 'frontend-developer',
            dbProfile.completed_nodes || [],
            dbProfile.stats || {}
          );
        }
      }).catch(err => console.error('Background profile fetch failed:', err));
      
      return;
    }
    
    // If not complete, try fetching full profile from database
    try {
      const dbProfile = await fetchFullProfile(authToken);
      if (!dbProfile) throw new Error('No profile returned from database');

      console.log('✓ Profile fetched from database:', dbProfile);
      
      const profile = buildLearnerProfile(dbProfile);
      console.log('✓ Built learner profile:', profile);

      loadFromDB(
        dbProfile.roadmap_id || 'frontend-developer',
        dbProfile.completed_nodes || [],
        dbProfile.stats || {}
      );

      setCurrentUser({ ...baseUser, target_role: dbProfile.target_role });
      setLearnerProfile(profile);

      // Check if user has completed onboarding
      if ((dbProfile.onboarding_complete === true || dbProfile.onboarding_complete === 1) && dbProfile.target_role) {
        console.log('✓ User has completed onboarding - going to dashboard');
        console.log('  - onboarding_complete:', dbProfile.onboarding_complete);
        console.log('  - target_role:', dbProfile.target_role);
        setShowRoadmap(true);
        setShowOnboarding(false);
        setShowAssessment(false);
        setShowSkillsAnalysis(false);
      } else {
        console.log('✗ New user or incomplete onboarding - showing onboarding');
        console.log('  - onboarding_complete:', dbProfile.onboarding_complete);
        console.log('  - target_role:', dbProfile.target_role);
        setShowOnboarding(true);
        setShowRoadmap(false);
      }
    } catch (err) {
      console.log('⚠ Backend not available or error:', err.message);
      console.log('Creating new user profile - showing onboarding');
      
      // Backend not available - new user flow
      setShowOnboarding(true);
      setShowRoadmap(false);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    console.log('=== App Mount - Checking Auth ===');
    console.log('authToken:', authToken ? 'exists' : 'missing');
    console.log('userId:', userId);

    if (!authToken || !userId) {
      console.log('No auth credentials - showing login');
      setAppLoading(false);
      return;
    }

    console.log('Verifying token with backend...');
    fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => {
        console.log('Verify response status:', res.status);
        return res.json();
      })
      .then(async data => {
        console.log('Verify response data:', data);
        if (data.user) {
          console.log('✓ Token valid, user:', data.user);
          setIsAuthenticated(true);
          await restoreSessionFromDB(authToken, data.user);
        } else {
          console.log('✗ Invalid token response');
          handleLogout();
        }
      })
      .catch(err => {
        console.log('✗ Verify failed:', err);
        handleLogout();
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
    console.log('Auth success, user:', user);
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAppLoading(true);
    await restoreSessionFromDB(authToken, user);
    setAppLoading(false);
  };

  const handleLogout = () => {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).catch(() => {});
    }
    
    // Only remove auth tokens - all user data is in the database
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Clear state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLearnerProfile(null);
    setShowOnboarding(false);
    setShowAssessment(false);
    setShowSkillsAnalysis(false);
    setShowRoadmap(false);
    setShowRoadmapCanvas(false);
    setAppLoading(false);
  };

  const handleOnboardingComplete = async (profile) => {
    const authToken = localStorage.getItem('authToken');
    
    console.log('=== Onboarding Complete ===');
    console.log('Profile:', profile);
    console.log('Auth token:', authToken ? 'exists' : 'missing');
    
    setShowOnboarding(false);
    setLearnerProfile(profile);
    
    // Save onboarding completion to database
    if (authToken && profile.targetRole) {
      try {
        console.log('Saving onboarding to database...');
        const response = await fetch('/api/user/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            target_role: profile.targetRole,
            known_skills: profile.knownSkills || [],
            learning_speed: profile.learningSpeed || 'medium'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✓ Onboarding saved to database:', data);
        } else {
          console.warn('⚠ Failed to save onboarding:', response.status);
        }
      } catch (err) {
        console.warn('⚠ Could not save onboarding to backend:', err);
      }
    } else {
      console.warn('⚠ Missing auth token or target role, cannot save to database');
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

    console.log('=== Assessment Complete ===');
    console.log('Assessment results:', assessmentResults);
    console.log('Updated profile:', updatedProfile);

    // Save quiz results to database
    if (authToken) {
      const skillKeys = Object.keys(assessmentResults || {});
      const totalQ = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.total || 0), 0);
      const totalCorrect = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.correct || 0), 0);
      try {
        console.log('Saving assessment results to database...');
        const response = await fetch('/api/user/quiz/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            quiz_type: 'skill_assessment',
            score: totalCorrect,
            total_questions: totalQ,
            category: updatedProfile.targetRole || '',
            results_data: assessmentResults
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✓ Assessment results saved to database:', data);
        } else {
          console.warn('⚠ Failed to save assessment:', response.status);
        }
      } catch (err) {
        console.warn('⚠ Could not save quiz results to backend:', err);
      }
    }

    setShowAssessment(false);
    setShowSkillsAnalysis(true);
  };

  if (appLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, border: '4px solid var(--border-primary)',
          borderTop: '4px solid var(--accent-amber)', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 14 }}>
          Loading your profile…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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
                  setShowSkillsAnalysis(false);
                  setShowRoadmap(true);

                  const authToken = localStorage.getItem('authToken');
                  if (authToken) {
                    fetch('/api/user/complete-onboarding', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                      },
                      body: JSON.stringify({
                        target_role: learnerProfile?.targetRole || 'Full Stack Developer',
                        known_skills: learnerProfile?.knownSkills || [],
                        learning_speed: learnerProfile?.learningSpeed || 'medium'
                      })
                    }).catch(err => console.warn('Background sync failed:', err));
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
        />
        <AIChatWidget />
      </>
    );
  }

  return null;
}

export default App;
