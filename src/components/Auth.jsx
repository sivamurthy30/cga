import React, { useState } from 'react';
import { gsap } from 'gsap';
import '../styles/Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Try to login with demo account
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@deva.ai',
          password: 'demo123'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If demo account doesn't exist, create it
        if (response.status === 401) {
          const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'demo@deva.ai',
              password: 'demo123',
              name: 'Demo User'
            })
          });

          const signupData = await signupResponse.json();

          if (!signupResponse.ok) {
            throw new Error(signupData.error || 'Failed to create demo account');
          }

          // Store auth data
          localStorage.setItem('authToken', signupData.token);
          localStorage.setItem('userId', signupData.user.id);
          localStorage.setItem('userEmail', signupData.user.email);
          localStorage.setItem('userName', signupData.user.name);

          // Animate and redirect
          gsap.to('.auth-form', {
            scale: 0.95,
            opacity: 0,
            duration: 0.3,
            onComplete: () => onAuthSuccess(signupData.user)
          });
          return;
        }
        throw new Error(data.error || 'Demo login failed');
      }

      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);

      // Animate and redirect
      gsap.to('.auth-form', {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        onComplete: () => onAuthSuccess(data.user)
      });

    } catch (err) {
      setError(err.message);
      gsap.fromTo('.auth-form',
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);

      // Animate and redirect
      gsap.to('.auth-form', {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        onComplete: () => onAuthSuccess(data.user)
      });

    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      
      // If user already exists during signup, suggest login
      if (!isLogin && errorMessage.includes('already registered')) {
        setTimeout(() => {
          if (window.confirm('This email is already registered. Would you like to go to the login page?')) {
            toggleMode();
          }
        }, 100);
      }
      
      gsap.fromTo('.auth-form',
        { x: -10 },
        { x: 10, duration: 0.1, repeat: 5, yoyo: true }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>

      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-logo">DEV<sup>A</sup></h1>
          <p className="auth-tagline">Intelligent Career Development Platform</p>
        </div>

        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Access your personalized learning dashboard'
                : 'Begin your journey to career excellence'}
            </p>

            {error && (
              <div className="auth-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Try Demo Account
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="auth-toggle-btn"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : 'Already have an account? Sign In'}
            </button>
          </form>

          <div className="auth-features">
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
