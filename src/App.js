import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/DesignSystem.css';
import './App.css';
import Auth from './components/Auth';
import OnboardingFlow from './components/OnboardingFlow';
import SkillAssessmentQuiz from './components/SkillAssessmentQuiz';
import DetailedSkillsAnalysis from './components/DetailedSkillsAnalysis';
import RoadmapPage from './pages/RoadmapPage';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSkillsAnalysis, setShowSkillsAnalysis] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (authToken && userId) {
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);

            const onboardingComplete = localStorage.getItem('onboardingComplete');
            const savedProfile = localStorage.getItem('learnerProfile');

            if (onboardingComplete === 'true' && savedProfile) {
              try {
                const profile = JSON.parse(savedProfile);
                setLearnerProfile(profile);
                setShowRoadmap(true);
              } catch {
                localStorage.removeItem('learnerProfile');
                setShowOnboarding(true);
              }
            } else {
              setShowOnboarding(true);
            }
          } else {
            handleLogout();
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (titleRef.current && showRoadmap) {
      const titleElement = titleRef.current;
      titleElement.textContent = 'DEVA';
      titleElement.style.opacity = '1';
      const tl = gsap.timeline();
      tl.fromTo('.App-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [showRoadmap]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    const onboardingComplete = localStorage.getItem('onboardingComplete');
    const savedProfile = localStorage.getItem('learnerProfile');

    if (onboardingComplete === 'true' && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setLearnerProfile(profile);
        setShowRoadmap(true);
      } catch {
        localStorage.removeItem('learnerProfile');
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
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
  };

  const handleOnboardingComplete = (profile) => {
    setShowOnboarding(false);
    setLearnerProfile(profile);
    setShowAssessment(true);
  };

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
        onComplete={(assessmentResults) => {
          const updatedProfile = {
            ...learnerProfile,
            assessmentComplete: true,
            assessmentResults
          };
          setLearnerProfile(updatedProfile);
          localStorage.setItem('learnerProfile', JSON.stringify(updatedProfile));
          setShowAssessment(false);
          setShowSkillsAnalysis(true);
        }}
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
