import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  // Render content with basic markdown: **bold**, links, newlines
  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Convert **bold** and links
      const parts = line.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('http')) {
          return <a key={j} href={part} target="_blank" rel="noopener noreferrer"
            style={{ color: isUser ? '#fff' : 'var(--accent-primary)', textDecoration: 'underline', wordBreak: 'break-all' }}>
            {part}
          </a>;
        }
        return part;
      });
      return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>;
    });
  };
  
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar">
        {isUser ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        )}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {renderContent(content)}
        </div>
        {timestamp && (
          <div className="message-timestamp">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
