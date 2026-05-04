import React, { useState, lazy, Suspense } from 'react';
import './AIChatWidget.css';

const ChatWindow = lazy(() => import('./ChatWindow'));

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => setIsMinimized(true);

  return (
    <>
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h6" />
        </svg>
      </button>

      {isOpen && !isMinimized && (
        <Suspense fallback={<div className="chat-loading">Loading...</div>}>
          <ChatWindow
            onClose={handleClose}
            onMinimize={handleMinimize}
            initialMessage="👋"
          />
        </Suspense>
      )}
    </>
  );
};

export default AIChatWidget;
