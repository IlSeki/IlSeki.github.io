// src/components/RaceHUD.js
import React from 'react';

const RaceHUD = ({ elapsedTime, leader }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '15px',
      left: '15px',
      background: 'rgba(20, 20, 30, 0.85)',
      backdropFilter: 'blur(8px)',
      padding: '15px 20px',
      borderRadius: '12px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      zIndex: 10,
      color: '#fff',
      fontFamily: '"Rajdhani", "Chakra Petch", sans-serif',
      width: '220px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderLeft: '4px solid #00e5ff'
    }}>
      <div style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        marginBottom: '10px',
        background: 'linear-gradient(90deg, #00e5ff, #2979ff)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        letterSpacing: '1px'
      }}>
        CRAZY RACE
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontWeight: '500'
      }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>TIME</span>
        <span style={{ 
          fontSize: '18px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0, 229, 255, 0.2)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>{Math.floor(elapsedTime)}s</span>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: '500'
      }}>
        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>LEADER</span>
        <span style={{ 
          fontSize: '18px',
          color: '#ffeb3b',
          fontWeight: 'bold',
          textShadow: '0 0 5px rgba(255, 235, 59, 0.5)'
        }}>{leader ? leader.name : '—'}</span>
      </div>
    </div>
  );
};

export default RaceHUD;