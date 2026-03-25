import React, { useState, useEffect, lazy, Suspense } from 'react';
import useBehaviorTracker from '../../hooks/useBehaviorTracker';
import { getWelcomeMessage, getPageContext } from '../../utils/aiClient';
import './AIChatWidget.css';

// Lazy load chat window for better performance
const ChatWindow = lazy(() => import('./ChatWindow'));

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  
  const { isUserStuck, resetStuckState } = useBehaviorTracker();

  // Auto-open when user is stuck (only once)
  useEffect(() => {
    if (isUserStuck && !hasAutoOpened && !isOpen) {
      const context = getPageContext();
      const welcomeMsg = getWelcomeMessage(context);
      
      setInitialMessage(welcomeMsg);
      setIsOpen(true);
      setHasAutoOpened(true);
      resetStuckState();
    }
  }, [isUserStuck, hasAutoOpened, isOpen, resetStuckState]);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-chat-button ${isOpen && !isMinimized ? 'hidden' : ''}`}
        onClick={handleToggle}
        aria-label="Open AI Assistant"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="chat-button-icon-svg"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 9h8"></path>
          <path d="M8 13h6"></path>
        </svg>
        {isUserStuck && !hasAutoOpened && (
          <span className="chat-button-badge">!</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <Suspense fallback={<div className="chat-loading">Loading...</div>}>
          <ChatWindow
            onClose={handleClose}
            onMinimize={handleMinimize}
            initialMessage={initialMessage}
          />
        </Suspense>
      )}
    </>
  );
};

export default AIChatWidget;
