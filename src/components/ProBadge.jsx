import React from 'react';
import '../styles/ProBadge.css';

const ProBadge = ({ onClick }) => {
  return (
    <button className="pro-badge" onClick={onClick}>
      <span className="pro-icon">⭐</span>
      <span className="pro-text">Upgrade to DEVAsquare</span>
    </button>
  );
};

export default ProBadge;
