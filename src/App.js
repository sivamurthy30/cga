import { useState, useEffect, useRef } from 'react';
import './styles/DesignSystem.css';
import './App.css';
import Auth from './components/Auth';
import InteractiveRoadmap from './components/InteractiveRoadmap';
import OnboardingFlow from './components/OnboardingFlow';
import SkillAssessmentQuiz from './components/SkillAssessmentQuiz';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const titleRef = useRef(null);

  const scrambleText = (element, finalText) => {
    if (!element) return;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const originalText = finalText;
    let iteration = 0;
    
    gsap.set(element, { textShadow: "0 0 8px rgba(245, 158, 11, 0.3)" });
    
    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((_, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
        
        gsap.to(element, { 
          textShadow: "0 0 0px rgba(245, 158, 11, 0)", 
          duration: 0.3,
          onComplete: () => {
            element.innerHTML = 'DEV<sup>A</sup>';
            gsap.fromTo(element, 
              { scale: 1 }, 
              { scale: 1.02, duration: 0.5, yoyo: true, repeat: 1, ease: "power2.inOut" }
            );
          }
        });
      }
      
      iteration += 0.6;
    }, 250);
  };

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (authToken && userId) {
      // Verify token with backend
      fetch('http://localhost:5001/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          
          // Check if onboarding is complete
          const onboardingComplete = localStorage.getItem('onboardingComplete');
          const savedProfile = localStorage.getItem('learnerProfile');
          
          if (!onboardingComplete || !data.user.onboarding_complete) {
            setShowOnboarding(true);
          } else if (savedProfile) {
            try {
              const profile = JSON.parse(savedProfile);
              setLearnerProfile(profile);
              setShowRoadmap(true);
            } catch (error) {
              console.error('Error parsing saved profile:', error);
              localStorage.removeItem('learnerProfile');
              setShowOnboarding(true);
            }
          }
        } else {
          // Invalid token
          handleLogout();
        }
      })
      .catch(error => {
        console.error('Auth verification failed:', error);
        handleLogout();
      });
    }
  }, []);

  useEffect(() => {
    // Only run animations if titleRef exists and showing roadmap
    if (titleRef.current && showRoadmap) {
      const titleElement = titleRef.current;
      titleElement.textContent = "DEVA";
      titleElement.style.opacity = "1";
      
      const tl = gsap.timeline();
      
      tl.fromTo(".App-header", 
        { opacity: 0, y: -20 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      
      setTimeout(() => {
        if (titleElement) {
          scrambleText(titleElement, "DEVA");
        }
      }, 500);
    }
  }, [showRoadmap]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Check if user needs onboarding
    if (!user.onboarding_complete || !user.target_role) {
      setShowOnboarding(true);
    } else {
      setShowRoadmap(true);
    }
  };

  const handleLogout = () => {
    const authToken = localStorage.getItem('authToken');
    
    // Call logout endpoint
    if (authToken) {
      fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).catch(err => console.error('Logout error:', err));
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('learnerProfile');
    localStorage.removeItem('onboardingComplete');
    
    // Reset state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLearnerProfile(null);
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = (profile) => {
    setShowOnboarding(false);
    setLearnerProfile(profile);
    setShowAssessment(true);
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Show onboarding if not complete
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show assessment after onboarding
  if (showAssessment && learnerProfile) {
    // Get skills from learner profile or use default skills for the role
    const skillsToAssess = learnerProfile.knownSkills && learnerProfile.knownSkills.length > 0
      ? learnerProfile.knownSkills.slice(0, 5)
      : ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'];

    return (
      <SkillAssessmentQuiz 
        skills={skillsToAssess}
        onComplete={(assessmentResults) => {
          // Save assessment results
          const updatedProfile = {
            ...learnerProfile,
            assessmentComplete: true,
            assessmentResults: assessmentResults
          };
          setLearnerProfile(updatedProfile);
          localStorage.setItem('learnerProfile', JSON.stringify(updatedProfile));
          setShowAssessment(false);
          setShowRoadmap(true);
        }}
        onClose={() => {
          // Skip assessment
          setShowAssessment(false);
          setShowRoadmap(true);
        }}
      />
    );
  }

  // Show roadmap after assessment
  if (showRoadmap && learnerProfile) {
    return (
      <div className="App">
        <header className="App-header">
          <h1 ref={titleRef}>DEVA</h1>
          <div className="header-controls">
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <button 
                className="logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </header>

        <main className="App-main">
          <InteractiveRoadmap learnerProfile={learnerProfile} />
        </main>
      </div>
    );
  }

  return null;
}

export default App;
