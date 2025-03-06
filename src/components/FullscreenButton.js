// src/components/FullscreenButton.js
import React from 'react';

const FullscreenButton = ({ onToggle }) => {
  return (
    <button onClick={onToggle} style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 10,
      background: '#ff3366',
      color: '#fff',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
      fontWeight: 'bold'
    }}>
      Fullscreen
    </button>
  );
};

export default FullscreenButton;
