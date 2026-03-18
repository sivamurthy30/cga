import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import '../styles/Onboarding.css';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0); // Start at welcome screen
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedRole, setSelectedRole] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showRoleHelp, setShowRoleHelp] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [githubData, setGithubData] = useState(null);
  const [aiSuggestedRole, setAiSuggestedRole] = useState(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiReasoning, setAiReasoning] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [githubUsername, setGithubUsername] = useState('');

  // Interest Quiz Questions
  const interestQuestions = [
    {
      id: 1,
      question: "What excites you the most?",
      options: [
        { text: "Building beautiful user interfaces", category: "frontend" },
        { text: "Working with data and algorithms", category: "data" },
        { text: "Creating server-side logic", category: "backend" },
        { text: "Automating and deploying systems", category: "devops" }
      ]
    },
    {
      id: 2,
      question: "Which activity sounds most interesting?",
      options: [
        { text: "Designing responsive layouts", category: "frontend" },
        { text: "Analyzing patterns in data", category: "data" },
        { text: "Building APIs and databases", category: "backend" },
        { text: "Managing cloud infrastructure", category: "devops" }
      ]
    },
    {
      id: 3,
      question: "What would you prefer to learn?",
      options: [
        { text: "React, Vue, or Angular", category: "frontend" },
        { text: "Machine Learning & Statistics", category: "data" },
        { text: "Node.js, Python, or Java", category: "backend" },
        { text: "Docker, Kubernetes, CI/CD", category: "devops" }
      ]
    },
    {
      id: 4,
      question: "Which problem would you enjoy solving?",
      options: [
        { text: "Making websites look amazing", category: "frontend" },
        { text: "Predicting trends from data", category: "data" },
        { text: "Optimizing database queries", category: "backend" },
        { text: "Scaling applications", category: "devops" }
      ]
    },
    {
      id: 5,
      question: "What's your ideal work environment?",
      options: [
        { text: "Creative and visual", category: "frontend" },
        { text: "Analytical and research-focused", category: "data" },
        { text: "Logical and structured", category: "backend" },
        { text: "Fast-paced and automated", category: "devops" }
      ]
    }
  ];

  const availableRoles = [
    // Web Development
    { id: 'frontend', name: 'Frontend Developer', description: 'Build beautiful user interfaces', icon: '🎨' },
    { id: 'backend', name: 'Backend Developer', description: 'Create server-side logic & APIs', icon: '⚙️' },
    { id: 'fullstack', name: 'Full Stack Developer', description: 'Master both frontend & backend', icon: '🚀' },
    
    // Data & AI
    { id: 'data', name: 'Data Scientist', description: 'Analyze data & build ML models', icon: '📊' },
    { id: 'ml', name: 'Machine Learning Engineer', description: 'Build & deploy ML systems', icon: '🤖' },
    { id: 'data-engineer', name: 'Data Engineer', description: 'Build data pipelines & infrastructure', icon: '🔄' },
    { id: 'ai-researcher', name: 'AI Researcher', description: 'Research cutting-edge AI algorithms', icon: '🧠' },
    
    // Infrastructure & Cloud
    { id: 'devops', name: 'DevOps Engineer', description: 'Automate deployment & infrastructure', icon: '🔧' },
    { id: 'cloud', name: 'Cloud Architect', description: 'Design cloud infrastructure', icon: '☁️' },
    { id: 'sre', name: 'Site Reliability Engineer', description: 'Ensure system reliability & performance', icon: '🛡️' },
    { id: 'platform', name: 'Platform Engineer', description: 'Build internal developer platforms', icon: '🏗️' },
    
    // Mobile & Desktop
    { id: 'mobile', name: 'Mobile Developer', description: 'Build iOS & Android apps', icon: '�' },
    { id: 'ios', name: 'iOS Developer', description: 'Build native iOS applications', icon: '🍎' },
    { id: 'android', name: 'Android Developer', description: 'Build native Android applications', icon: '🤖' },
    { id: 'desktop', name: 'Desktop Application Developer', description: 'Build cross-platform desktop apps', icon: '💻' },
    
    // Security & Testing
    { id: 'security', name: 'Security Engineer', description: 'Protect systems & data', icon: '🔒' },
    { id: 'pentester', name: 'Penetration Tester', description: 'Ethical hacking & security testing', icon: '🎯' },
    { id: 'qa', name: 'QA Engineer', description: 'Test & ensure quality', icon: '✅' },
    { id: 'sdet', name: 'SDET (Test Automation)', description: 'Software development in test', icon: '🧪' },
    
    // Design & Product
    { id: 'ui-ux', name: 'UI/UX Designer', description: 'Design user experiences', icon: '🎨' },
    { id: 'product-designer', name: 'Product Designer', description: 'Design end-to-end product experiences', icon: '📐' },
    { id: 'product-manager', name: 'Technical Product Manager', description: 'Lead product development', icon: '📋' },
    
    // Specialized Development
    { id: 'game', name: 'Game Developer', description: 'Create interactive games', icon: '🎮' },
    { id: 'blockchain', name: 'Blockchain Developer', description: 'Build decentralized apps', icon: '⛓️' },
    { id: 'embedded', name: 'Embedded Systems Engineer', description: 'Program hardware devices', icon: '🔌' },
    { id: 'ar-vr', name: 'AR/VR Developer', description: 'Build immersive experiences', icon: '🥽' },
    { id: 'robotics', name: 'Robotics Engineer', description: 'Program robots & automation', icon: '🤖' },
    
    // Database & Backend Specialized
    { id: 'dba', name: 'Database Administrator', description: 'Manage & optimize databases', icon: '🗄️' },
    { id: 'api', name: 'API Developer', description: 'Design & build APIs', icon: '🔗' },
    { id: 'microservices', name: 'Microservices Architect', description: 'Design distributed systems', icon: '🏛️' },
    
    // Emerging Technologies
    { id: 'iot', name: 'IoT Developer', description: 'Build Internet of Things solutions', icon: '📡' },
    { id: 'quantum', name: 'Quantum Computing Engineer', description: 'Work with quantum algorithms', icon: '⚛️' },
    { id: 'edge', name: 'Edge Computing Engineer', description: 'Build edge computing solutions', icon: '🌐' }
  ];

  useEffect(() => {
    // Animate step transition
    gsap.fromTo('.onboarding-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, [currentStep]);

  const handleQuizAnswer = (questionId, option) => {
    const newAnswers = [...quizAnswers, { questionId, category: option.category }];
    setQuizAnswers(newAnswers);

    if (questionId < interestQuestions.length) {
      setCurrentStep(1); // Stay on quiz, next question
    } else {
      // Quiz complete, calculate results
      calculateQuizResults(newAnswers);
      setCurrentStep(2); // Move to results
    }
  };

  const calculateQuizResults = (answers) => {
    const categoryCounts = {};
    answers.forEach(answer => {
      categoryCounts[answer.category] = (categoryCounts[answer.category] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a);

    const topCategory = sortedCategories[0][0];
    const score = (sortedCategories[0][1] / answers.length) * 100;

    const categoryToRole = {
      'frontend': 'Frontend Developer',
      'backend': 'Backend Developer',
      'data': 'Data Scientist',
      'devops': 'DevOps Engineer'
    };

    const recommendations = {
      category: topCategory,
      suggestedRole: categoryToRole[topCategory],
      score: Math.round(score),
      breakdown: categoryCounts,
      message: score >= 60 
        ? `Strong interest in ${topCategory}! You'd be great at this.`
        : `You have diverse interests. Consider Full Stack or explore more.`
    };

    setQuizResults(recommendations);
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    // Don't complete onboarding yet - go to skills input step
    setCurrentStep(5); // New step for adding skills
  };

  const handleNeedHelp = () => {
    setShowRoleHelp(true);
    setCurrentStep(4); // Move to help step
  };

  const handleSkipSkills = () => {
    // Complete onboarding without skills
    completeOnboarding(selectedRole, quizResults, []);
  };

  const handleCompleteWithSkills = (skills) => {
    // Complete onboarding with extracted skills
    // Priority: 1. User selected role, 2. AI suggested role, 3. Quiz result
    const roleToUse = selectedRole 
      || (aiSuggestedRole ? { name: aiSuggestedRole } : null)
      || { name: quizResults?.suggestedRole || 'Full Stack Developer' };
    
    completeOnboarding(roleToUse, quizResults, skills);
  };

  const handleResumeUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Upload and parse resume
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/resume/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload resume');
      }
      
      const resumeData = await uploadResponse.json();
      setResumeData(resumeData);
      
      // Step 2: Get AI role suggestion (with fallback)
      try {
        const suggestionResponse = await fetch('/ai/suggest-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: resumeData.skills_found || [],
            projects: resumeData.projects || [],
            quiz_results: quizResults || {},
            experience_years: resumeData.experience_years || 0,
            source: 'resume'
          })
        });
        
        if (suggestionResponse.ok) {
          const aiSuggestion = await suggestionResponse.json();
          setAiSuggestedRole(aiSuggestion.suggestedRole);
          setAiConfidence(aiSuggestion.confidence);
          setAiReasoning(aiSuggestion.reasoning);
        } else {
          // Fallback: Use quiz results to suggest role
          const fallbackRole = quizResults?.suggestedRole || 'Full Stack Developer';
          setAiSuggestedRole(fallbackRole);
          setAiConfidence(0.7);
          setAiReasoning([
            `Based on your resume with ${resumeData.total_skills} skills`,
            'Suggested role based on your profile'
          ]);
        }
      } catch (aiError) {
        console.warn('AI suggestion failed, using fallback:', aiError);
        // Fallback: Use quiz results
        const fallbackRole = quizResults?.suggestedRole || 'Full Stack Developer';
        setAiSuggestedRole(fallbackRole);
        setAiConfidence(0.7);
        setAiReasoning([
          `Based on your resume with ${resumeData.total_skills} skills`,
          'Suggested role based on your profile'
        ]);
      }
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('Failed to analyze resume. Please try again or select a role manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAnalysis = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_username: githubUsername.trim()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze GitHub profile');
      }
      
      const data = await response.json();
      setGithubData(data);
      
      // Get AI role suggestion based on GitHub skills
      try {
        const suggestionResponse = await fetch('/ai/suggest-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: data.skills_found || [],
            quiz_results: quizResults || {},
            experience_years: 0,
            source: 'github'
          })
        });
        
        if (suggestionResponse.ok) {
          const aiSuggestion = await suggestionResponse.json();
          setAiSuggestedRole(aiSuggestion.suggestedRole);
          setAiConfidence(aiSuggestion.confidence);
          setAiReasoning(aiSuggestion.reasoning);
        } else {
          // Fallback
          const fallbackRole = quizResults?.suggestedRole || 'Full Stack Developer';
          setAiSuggestedRole(fallbackRole);
          setAiConfidence(0.7);
          setAiReasoning([
            `Based on your GitHub profile`,
            `Found ${data.total_skills} skills from your repositories`
          ]);
        }
      } catch (aiError) {
        console.warn('AI suggestion failed, using fallback:', aiError);
        const fallbackRole = quizResults?.suggestedRole || 'Full Stack Developer';
        setAiSuggestedRole(fallbackRole);
        setAiConfidence(0.7);
        setAiReasoning([
          `Based on your GitHub profile`,
          `Found ${data.total_skills} skills from your repositories`
        ]);
      }
      
    } catch (error) {
      console.error('Error analyzing GitHub:', error);
      setError(error.message || 'Failed to analyze GitHub profile. Please check the username and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (role, quizData, skills = []) => {
    const profile = {
      targetRole: role.name,
      quizResults: quizData,
      knownSkills: skills,
      learningSpeed: 'medium',
      onboarding_complete: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('learnerProfile', JSON.stringify(profile));
    localStorage.setItem('onboardingComplete', 'true');

    // Update backend with onboarding completion and target role
    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      if (authToken && userId) {
        await fetch('/api/user/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            target_role: role.name,
            known_skills: skills,
            learning_speed: 'medium'
          })
        });
      }
    } catch (err) {
      // Non-critical — continue even if backend update fails
      console.warn('Could not update backend onboarding status:', err);
    }

    if (onComplete) {
      onComplete(profile);
    }
  };

  // Step 1: Welcome
  if (currentStep === 0) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content welcome-screen">
          <div className="welcome-hero">
            <h1>Welcome to DEVA</h1>
            <p className="welcome-subtitle">Your AI-Powered Career Guidance Platform</p>
          </div>
          
          <div className="welcome-features">
            <div className="feature-card">
              <h3>Discover Your Path</h3>
              <p>Take a quick quiz to find your ideal tech career</p>
            </div>
            <div className="feature-card">
              <h3>Track Progress</h3>
              <p>Monitor your learning journey with AI insights</p>
            </div>
            <div className="feature-card">
              <h3>Get Personalized</h3>
              <p>Receive custom recommendations for your goals</p>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={() => setCurrentStep(1)}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Interest Quiz
  if (currentStep === 1 && quizAnswers.length < interestQuestions.length) {
    const currentQuestion = interestQuestions[quizAnswers.length];
    const progress = (quizAnswers.length / interestQuestions.length) * 100;

    return (
      <div className="onboarding-container">
        <div className="onboarding-content quiz-screen">
          <div className="quiz-header">
            <h2>Discover Your Interest</h2>
            <p>Answer these questions to find your ideal tech path</p>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="quiz-progress-text">
              Question {quizAnswers.length + 1} of {interestQuestions.length}
            </span>
          </div>

          <div className="quiz-question-card">
            <h3>{currentQuestion.question}</h3>
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className="quiz-option-btn"
                  onClick={() => handleQuizAnswer(currentQuestion.id, option)}
                >
                  <span className="option-text">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-note">
            <p>Be honest! This helps us recommend the best path for you.</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Quiz Results
  if (currentStep === 2 && quizResults) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content results-screen">
          <div className="results-hero">
            <h2>Your Results Are In</h2>
            <p className="results-message">{quizResults.message}</p>
          </div>

          <div className="results-card">
            <h3>Recommended Path</h3>
            <div className="suggested-role">
              <span className="role-badge">{quizResults.suggestedRole}</span>
              <span className="role-score">{quizResults.score}% match</span>
            </div>
          </div>

          <div className="results-breakdown">
            <h4>Interest Breakdown</h4>
            {Object.entries(quizResults.breakdown).map(([category, count]) => (
              <div key={category} className="breakdown-item">
                <span className="breakdown-label">{category}</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill"
                    style={{ width: `${(count / interestQuestions.length) * 100}%` }}
                  />
                </div>
                <span className="breakdown-count">{count}/{interestQuestions.length}</span>
              </div>
            ))}
          </div>

          {quizResults.score < 40 && (
            <div className="results-warning">
              <p>Your interests are quite diverse. We recommend:</p>
              <ul>
                <li>Exploring Full Stack Development (combines multiple areas)</li>
                <li>Taking more time to research different roles</li>
                <li>Trying introductory courses in different fields</li>
              </ul>
            </div>
          )}

          <div className="results-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentStep(3)}
            >
              Choose My Role →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Role Selection
  if (currentStep === 3) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content role-selection-screen">
          <div className="role-header">
            <h2>Select Your Target Role</h2>
            <p>Based on your quiz, we recommend: <strong>{quizResults?.suggestedRole}</strong></p>
          </div>

          <div className="roles-grid">
            {availableRoles.map(role => (
              <div
                key={role.id}
                className={`role-card ${role.name === quizResults?.suggestedRole ? 'recommended' : ''}`}
                onClick={() => handleRoleSelection(role)}
              >
                {role.name === quizResults?.suggestedRole && (
                  <span className="recommended-badge">Recommended</span>
                )}
                <h3>{role.name}</h3>
                <p>{role.description}</p>
              </div>
            ))}
          </div>

          <div className="role-help">
            <p>Still not sure which role to choose?</p>
            <button 
              className="btn btn-secondary"
              onClick={handleNeedHelp}
            >
              I Need Help Deciding
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Role Help (Resume/GitHub)
  if (currentStep === 4) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-content help-screen">
          <div className="help-header">
            <h2>Let AI Help You Decide</h2>
            <p>Upload your resume or connect GitHub to get AI-powered role suggestions</p>
          </div>

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Analyzing your profile...</p>
            </div>
          )}

          <div className="help-options">
            <div className="help-option-card">
              <h3>Upload Resume</h3>
              <p>We'll analyze your experience and skills</p>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleResumeUpload(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              <label 
                htmlFor="resume-upload" 
                className={`btn btn-primary ${isLoading ? 'disabled' : ''}`}
              >
                {resumeData ? 'Resume Uploaded' : 'Choose File'}
              </label>
              {resumeData && (
                <p className="success-text">
                  Found {resumeData.total_skills} skills
                </p>
              )}
            </div>

            <div className="help-divider">OR</div>

            <div className="help-option-card">
              <h3>Connect GitHub</h3>
              <p>We'll analyze your coding activity</p>
              <input
                type="text"
                placeholder="Enter GitHub username"
                className="github-input"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleGitHubAnalysis();
                  }
                }}
                disabled={isLoading}
              />
              <button 
                className={`btn btn-primary ${isLoading ? 'disabled' : ''}`}
                onClick={handleGitHubAnalysis}
                disabled={isLoading}
              >
                Analyze
              </button>
            </div>
          </div>

          {aiSuggestedRole && (
            <div className="ai-suggestion">
              <div className="ai-suggestion-header">
                <h3>AI Recommendation</h3>
                <span className="confidence-badge">
                  {Math.round(aiConfidence * 100)}% confidence
                </span>
              </div>
              
              <div className="ai-role-card">
                <h4>{aiSuggestedRole}</h4>
                
                {aiReasoning && aiReasoning.length > 0 && (
                  <div className="ai-reasoning">
                    <p className="reasoning-title">Why this role?</p>
                    <ul>
                      {aiReasoning.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="ai-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleRoleSelection({ name: aiSuggestedRole })}
                  >
                    Accept Recommendation
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(3)}
                  >
                    Choose Different Role
                  </button>
                </div>
              </div>
            </div>
          )}

          {!aiSuggestedRole && (
            <button 
              className="btn btn-secondary back-btn"
              onClick={() => setCurrentStep(3)}
            >
              Back to Role Selection
            </button>
          )}
        </div>
      </div>
    );
  }

  // Step 5: Add Skills (NEW STEP)
  if (currentStep === 5) {
    // If resume already uploaded, show analysis
    if (resumeData && resumeData.skills_found && resumeData.skills_found.length > 0) {
      return (
        <div className="onboarding-container">
          <div className="onboarding-content resume-analysis-screen">
            <div className="analysis-header">
              <h2>Resume Analysis Complete</h2>
              <p>We've analyzed your resume for <strong>{selectedRole?.name}</strong></p>
            </div>

            <div className="analysis-summary">
              <div className="summary-card">
                <div className="summary-icon">📄</div>
                <div className="summary-content">
                  <h3>{resumeData.total_skills} Skills Found</h3>
                  <p>Extracted from your resume</p>
                </div>
              </div>
              
              {aiSuggestedRole && (
                <div className="summary-card highlight">
                  <div className="summary-icon">🎯</div>
                  <div className="summary-content">
                    <h3>{Math.round(aiConfidence * 100)}% Match</h3>
                    <p>For {aiSuggestedRole}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="skills-display">
              <h3>Your Skills</h3>
              <div className="skills-grid">
                {resumeData.skills_found.slice(0, 12).map((skill, index) => (
                  <div key={index} className="skill-badge">
                    {skill}
                  </div>
                ))}
                {resumeData.skills_found.length > 12 && (
                  <div className="skill-badge more">
                    +{resumeData.skills_found.length - 12} more
                  </div>
                )}
              </div>
            </div>

            {/* Skill Gap Analysis */}
            {selectedRole && (
              <div className="skill-gap-analysis">
                <h3>Skills Needed for {selectedRole.name}</h3>
                <p className="gap-description">
                  To become a successful {selectedRole.name}, you need these skills:
                </p>
                
                {(() => {
                  // Define required skills for each role
                  const roleRequirements = {
                    // Web Development
                    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Webpack', 'Git', 'REST APIs', 'Responsive Design', 'Testing'],
                    'Backend Developer': ['Python', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Authentication', 'Docker', 'Git', 'Testing', 'API Design'],
                    'Full Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Git', 'Docker', 'Testing', 'CI/CD'],
                    
                    // Data & AI
                    'Data Scientist': ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'TensorFlow', 'Statistics', 'SQL', 'Data Visualization', 'Jupyter', 'Scikit-learn'],
                    'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'MLOps', 'Docker', 'Git', 'Cloud', 'Data Engineering'],
                    'Data Engineer': ['Python', 'SQL', 'Spark', 'Airflow', 'ETL', 'Data Warehousing', 'Kafka', 'AWS', 'Docker', 'Data Modeling'],
                    'AI Researcher': ['Python', 'PyTorch', 'TensorFlow', 'Research', 'Mathematics', 'Deep Learning', 'NLP', 'Computer Vision', 'Papers', 'Experimentation'],
                    
                    // Infrastructure & Cloud
                    'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Monitoring', 'Git', 'Bash', 'Python'],
                    'Cloud Architect': ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Networking', 'Security', 'Monitoring', 'Cost Optimization', 'Architecture'],
                    'Site Reliability Engineer': ['Linux', 'Kubernetes', 'Monitoring', 'Incident Response', 'SLOs', 'Automation', 'Python', 'Terraform', 'Observability', 'Performance'],
                    'Platform Engineer': ['Kubernetes', 'Docker', 'CI/CD', 'Infrastructure as Code', 'Developer Tools', 'Automation', 'Cloud', 'Monitoring', 'Git', 'APIs'],
                    
                    // Mobile & Desktop
                    'Mobile Developer': ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'REST APIs', 'Git', 'Mobile UI', 'Testing', 'App Store'],
                    'iOS Developer': ['Swift', 'SwiftUI', 'UIKit', 'Xcode', 'iOS SDK', 'Core Data', 'REST APIs', 'Git', 'App Store', 'Testing'],
                    'Android Developer': ['Kotlin', 'Java', 'Android SDK', 'Jetpack Compose', 'Room', 'REST APIs', 'Git', 'Play Store', 'Testing', 'Material Design'],
                    'Desktop Application Developer': ['Electron', 'C#', '.NET', 'Qt', 'Cross-platform', 'UI Frameworks', 'Git', 'Testing', 'Packaging', 'Updates'],
                    
                    // Security & Testing
                    'Security Engineer': ['Cybersecurity', 'Penetration Testing', 'Cryptography', 'Network Security', 'OWASP', 'Linux', 'Python', 'Security Tools', 'Compliance', 'Incident Response'],
                    'Penetration Tester': ['Ethical Hacking', 'Kali Linux', 'Metasploit', 'Burp Suite', 'OWASP', 'Network Security', 'Web Security', 'Scripting', 'Reporting', 'Certifications'],
                    'QA Engineer': ['Testing', 'Selenium', 'Jest', 'Cypress', 'Test Automation', 'Bug Tracking', 'CI/CD', 'API Testing', 'Performance Testing', 'Git'],
                    'SDET (Test Automation)': ['Java', 'Python', 'Selenium', 'TestNG', 'CI/CD', 'API Testing', 'Performance Testing', 'Git', 'Test Frameworks', 'Automation'],
                    
                    // Design & Product
                    'UI/UX Designer': ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Accessibility', 'HTML', 'CSS'],
                    'Product Designer': ['Figma', 'User Research', 'Prototyping', 'Design Thinking', 'User Testing', 'Design Systems', 'Interaction Design', 'Visual Design', 'Collaboration', 'Metrics'],
                    'Technical Product Manager': ['Product Strategy', 'Roadmapping', 'Agile', 'User Stories', 'Analytics', 'Technical Knowledge', 'Communication', 'Prioritization', 'Stakeholder Management', 'SQL'],
                    
                    // Specialized Development
                    'Game Developer': ['Unity', 'Unreal Engine', 'C#', 'C++', 'Game Physics', '3D Modeling', 'Animation', 'Game Design', 'Multiplayer', 'Optimization'],
                    'Blockchain Developer': ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3', 'Cryptography', 'DeFi', 'JavaScript', 'Node.js', 'Testing', 'Security'],
                    'Embedded Systems Engineer': ['C', 'C++', 'Embedded C', 'Microcontrollers', 'RTOS', 'Hardware', 'Debugging', 'Protocols', 'Assembly', 'Electronics'],
                    'AR/VR Developer': ['Unity', 'Unreal Engine', 'C#', 'C++', '3D Graphics', 'ARKit', 'ARCore', 'VR SDKs', 'Spatial Computing', 'Optimization'],
                    'Robotics Engineer': ['ROS', 'Python', 'C++', 'Computer Vision', 'Control Systems', 'Sensors', 'Kinematics', 'Machine Learning', 'Simulation', 'Hardware'],
                    
                    // Database & Backend Specialized
                    'Database Administrator': ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Performance Tuning', 'Backup & Recovery', 'Security', 'Replication', 'Monitoring', 'Scripting'],
                    'API Developer': ['REST', 'GraphQL', 'Node.js', 'Python', 'API Design', 'Authentication', 'Documentation', 'Testing', 'Versioning', 'Rate Limiting'],
                    'Microservices Architect': ['Microservices', 'Docker', 'Kubernetes', 'API Gateway', 'Service Mesh', 'Event-Driven', 'Distributed Systems', 'Monitoring', 'Security', 'Patterns'],
                    
                    // Emerging Technologies
                    'IoT Developer': ['Embedded Systems', 'MQTT', 'IoT Protocols', 'Sensors', 'Cloud', 'Python', 'C', 'Edge Computing', 'Security', 'Data Processing'],
                    'Quantum Computing Engineer': ['Quantum Algorithms', 'Qiskit', 'Linear Algebra', 'Python', 'Quantum Gates', 'Quantum Circuits', 'Mathematics', 'Physics', 'Research', 'Optimization'],
                    'Edge Computing Engineer': ['Edge Computing', 'IoT', 'Distributed Systems', 'Low Latency', 'Docker', 'Kubernetes', 'Networking', 'Security', 'Cloud', 'Optimization']
                  };

                  const requiredSkills = roleRequirements[selectedRole.name] || [];
                  const userSkills = resumeData.skills_found.map(s => s.toLowerCase());
                  
                  const hasSkills = requiredSkills.filter(skill => 
                    userSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
                  );
                  
                  const missingSkills = requiredSkills.filter(skill => 
                    !userSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
                  );

                  const completionPercentage = Math.round((hasSkills.length / requiredSkills.length) * 100);

                  return (
                    <>
                      <div className="skill-progress">
                        <div className="progress-header">
                          <span className="progress-label">Skill Completion</span>
                          <span className="progress-percentage">{completionPercentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <div className="progress-stats">
                          <span className="stat-item">
                            <span className="stat-icon">✅</span>
                            {hasSkills.length} skills you have
                          </span>
                          <span className="stat-item">
                            <span className="stat-icon">📚</span>
                            {missingSkills.length} skills to learn
                          </span>
                        </div>
                      </div>

                      {hasSkills.length > 0 && (
                        <div className="skills-section">
                          <h4 className="section-title">
                            <span className="title-icon">✅</span>
                            Skills You Have ({hasSkills.length})
                          </h4>
                          <div className="skills-grid">
                            {hasSkills.map((skill, index) => (
                              <div key={index} className="skill-badge has-skill">
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {missingSkills.length > 0 && (
                        <div className="skills-section">
                          <h4 className="section-title missing">
                            <span className="title-icon">📚</span>
                            Skills You Need to Learn ({missingSkills.length})
                          </h4>
                          <p className="section-description">
                            Focus on learning these skills to become a {selectedRole.name}:
                          </p>
                          <div className="skills-grid">
                            {missingSkills.map((skill, index) => (
                              <div key={index} className="skill-badge missing-skill">
                                {skill}
                                <span className="skill-priority">
                                  {index < 3 ? 'High Priority' : index < 6 ? 'Medium' : 'Nice to Have'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {completionPercentage >= 70 && (
                        <div className="encouragement-box success">
                          <span className="encouragement-icon">🎉</span>
                          <div className="encouragement-content">
                            <h4>Great Progress!</h4>
                            <p>You have {completionPercentage}% of the required skills. You're well on your way to becoming a {selectedRole.name}!</p>
                          </div>
                        </div>
                      )}

                      {completionPercentage >= 40 && completionPercentage < 70 && (
                        <div className="encouragement-box warning">
                          <span className="encouragement-icon">💪</span>
                          <div className="encouragement-content">
                            <h4>Good Start!</h4>
                            <p>You have {completionPercentage}% of the required skills. Focus on the missing skills to reach your goal.</p>
                          </div>
                        </div>
                      )}

                      {completionPercentage < 40 && (
                        <div className="encouragement-box info">
                          <span className="encouragement-icon">🚀</span>
                          <div className="encouragement-content">
                            <h4>Start Your Journey!</h4>
                            <p>You have {completionPercentage}% of the required skills. Don't worry - everyone starts somewhere. Follow our learning roadmap to build these skills!</p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {resumeData.projects && resumeData.projects.length > 0 && (
              <div className="projects-display">
                <h3>Your Projects ({resumeData.total_projects})</h3>
                <div className="projects-list">
                  {resumeData.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="project-card">
                      <h4>{project.name}</h4>
                      <p>{project.description}</p>
                      {project.skills && project.skills.length > 0 && (
                        <div className="project-skills">
                          {project.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="project-skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {resumeData.projects.length > 3 && (
                    <p className="more-projects">+{resumeData.projects.length - 3} more projects</p>
                  )}
                </div>
              </div>
            )}

            {aiReasoning && aiReasoning.length > 0 && (
              <div className="ai-insights">
                <h3>AI Insights</h3>
                <ul>
                  {aiReasoning.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="next-steps-box">
              <h3>Next Step: Skill Assessment</h3>
              <p>Take a quick quiz to validate your skills and get personalized recommendations</p>
              <div className="next-steps-actions">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => handleCompleteWithSkills(resumeData.skills_found || [])}
                >
                  Continue to Assessment →
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setResumeData(null);
                    setAiSuggestedRole(null);
                  }}
                >
                  Upload Different Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no resume uploaded yet, show upload options
    return (
      <div className="onboarding-container">
        <div className="onboarding-content skills-input-screen">
          <div className="skills-header">
            <h2>Add Your Current Skills</h2>
            <p>Selected Role: <strong>{selectedRole?.name}</strong></p>
            <p className="skills-subtitle">
              Upload your resume to automatically extract skills and get AI-powered role matching
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Analyzing your profile...</p>
            </div>
          )}

          <div className="skills-input-options">
            <div className="skills-option-card">
              <h3>Upload Resume</h3>
              <p>Automatically extract skills from your resume</p>
              <input
                type="file"
                id="resume-upload-skills"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleResumeUpload(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              <label 
                htmlFor="resume-upload-skills" 
                className={`btn btn-primary ${isLoading ? 'disabled' : ''}`}
              >
                Choose File
              </label>
            </div>

            <div className="skills-divider">OR</div>

            <div className="skills-option-card">
              <h3>GitHub Profile</h3>
              <p>Extract skills from your repositories</p>
              <input
                type="text"
                placeholder="Enter GitHub username"
                className="github-input"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleGitHubAnalysis();
                  }
                }}
              />
              <button 
                className="btn btn-primary"
                onClick={handleGitHubAnalysis}
                disabled={!githubUsername.trim() || isLoading}
              >
                Analyze GitHub
              </button>
            </div>
          </div>

          <div className="skills-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleSkipSkills}
            >
              Skip for Now
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentStep(3)}
            >
              ← Back
            </button>
          </div>

          <div className="skills-note">
            <p><strong>Tip:</strong> Adding your skills now helps us create a better learning roadmap for you.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OnboardingFlow;
