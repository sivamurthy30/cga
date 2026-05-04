import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import './ChatWindow.css';

// ── Call the backend chat endpoint ────────────────────────────────────────────
async function getAIResponse(question) {
  try {
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem('learnerProfile') || '{}'); } catch { return {}; }
    })();

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        context: {
          role: profile.targetRole || '',
          year: 3,
          background: 'CSE',
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.response || data.message || "I couldn't process that. Please try again.";
  } catch {
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

const ChatWindow = ({ onClose, onMinimize, initialMessage }) => {
  const [messages, setMessages] = useState(() =>
    initialMessage
      ? [{ role: 'ai', content: initialMessage, timestamp: Date.now() }]
      : []
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const reply = await getAIResponse(text);
      setMessages(prev => [...prev, { role: 'ai', content: reply, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="chat-icon-svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" />
            <path d="M12 18v-6" />
          </svg>
          <h3>DEVA Assistant</h3>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" onClick={onMinimize} title="Minimize">−</button>
          <button className="chat-action-btn" onClick={onClose} title="Close">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p>Ask me anything about careers, coding, DSA, or jobs.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}

        {isLoading && (
          <div className="chat-message ai-message">
            <div className="message-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
