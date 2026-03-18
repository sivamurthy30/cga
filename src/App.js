import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/DesignSystem.css';
import './App.css';
import Auth from './components/Auth';
import OnboardingFlow from './components/OnboardingFlow';
import SkillAssessmentQuiz from './components/SkillAssessmentQuiz';
import DetailedSkillsAnalysis from './components/DetailedSkillsAnalysis';
import RoadmapPage from './pages/RoadmapPage';
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
    onboarding_complete: dbProfile.onboarding_complete === 1,
    assessmentResults: dbProfile.latest_quiz || null,
    assessmentComplete: !!dbProfile.latest_quiz,
    timestamp: dbProfile.created_at
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSkillsAnalysis, setShowSkillsAnalysis] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const titleRef = useRef(null);

  const { loadFromDB } = useRoadmapStore();

  const restoreSessionFromDB = async (authToken, baseUser) => {
    try {
      const dbProfile = await fetchFullProfile(authToken);
      if (!dbProfile) throw new Error('No profile returned');

      const profile = buildLearnerProfile(dbProfile);

      localStorage.setItem('learnerProfile', JSON.stringify(profile));
      if (dbProfile.onboarding_complete === 1) {
        localStorage.setItem('onboardingComplete', 'true');
      }

      loadFromDB(
        dbProfile.roadmap_id || 'frontend-developer',
        dbProfile.completed_nodes || [],
        dbProfile.stats || {}
      );

      setCurrentUser({ ...baseUser, target_role: dbProfile.target_role });
      setLearnerProfile(profile);

      if (dbProfile.onboarding_complete === 1) {
        setShowRoadmap(true);
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      const savedProfile = localStorage.getItem('learnerProfile');
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      if (onboardingComplete === 'true' && savedProfile) {
        try {
          setLearnerProfile(JSON.parse(savedProfile));
          setShowRoadmap(true);
          return;
        } catch { }
      }
      setShowOnboarding(true);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!authToken || !userId) {
      setAppLoading(false);
      return;
    }

    fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(async data => {
        if (data.user) {
          setIsAuthenticated(true);
          await restoreSessionFromDB(authToken, data.user);
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout())
      .finally(() => setAppLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (titleRef.current && showRoadmap) {
      const titleElement = titleRef.current;
      titleElement.textContent = 'DEVA';
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('learnerProfile');
    localStorage.removeItem('onboardingComplete');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLearnerProfile(null);
    setShowOnboarding(false);
    setShowAssessment(false);
    setShowSkillsAnalysis(false);
    setShowRoadmap(false);
    setAppLoading(false);
  };

  const handleOnboardingComplete = (profile) => {
    setShowOnboarding(false);
    setLearnerProfile(profile);
    setShowAssessment(true);
  };

  const handleAssessmentComplete = async (assessmentResults) => {
    const authToken = localStorage.getItem('authToken');
    const updatedProfile = {
      ...learnerProfile,
      assessmentComplete: true,
      assessmentResults
    };
    setLearnerProfile(updatedProfile);
    localStorage.setItem('learnerProfile', JSON.stringify(updatedProfile));

    if (authToken) {
      const skillKeys = Object.keys(assessmentResults || {});
      const totalQ = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.total || 0), 0);
      const totalCorrect = skillKeys.reduce((sum, k) => sum + (assessmentResults[k]?.correct || 0), 0);
      try {
        await fetch('/api/user/quiz/save', {
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
      } catch (err) {
        console.warn('Could not save quiz results to backend:', err);
      }
    }

    setShowAssessment(false);
    setShowSkillsAnalysis(true);
  };

  if (appLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#0f172a', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, border: '4px solid #334155',
          borderTop: '4px solid #f59e0b', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 14 }}>
          Loading your profile…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} currentUser={currentUser} />;
  }

  if (showAssessment && learnerProfile) {
    const skillsToAssess = learnerProfile.knownSkills && learnerProfile.knownSkills.length > 0
      ? learnerProfile.knownSkills.slice(0, 5)
      : ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'];

    return (
      <SkillAssessmentQuiz
        skills={skillsToAssess}
        onComplete={handleAssessmentComplete}
        onClose={() => {
          setShowAssessment(false);
          setShowSkillsAnalysis(true);
        }}
      />
    );
  }

  if (showSkillsAnalysis && learnerProfile) {
    const skillsToAnalyze = learnerProfile.knownSkills && learnerProfile.knownSkills.length > 0
      ? learnerProfile.knownSkills
      : ['JavaScript', 'Python', 'React'];

    return (
      <DetailedSkillsAnalysis
        skills={skillsToAnalyze}
        targetRole={learnerProfile.targetRole}
        onNext={() => {
          setShowSkillsAnalysis(false);
          setShowRoadmap(true);
        }}
        onBack={() => {
          setShowSkillsAnalysis(false);
          setShowAssessment(true);
        }}
      />
    );
  }

  if (showRoadmap && learnerProfile) {
    return (
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <RoadmapPage
                learnerProfile={learnerProfile}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/roadmap"
            element={
              <RoadmapPage
                learnerProfile={learnerProfile}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return null;
}

export default App;
