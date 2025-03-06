// src/components/RaceHUD.js
import React from 'react';

const RaceHUD = ({ elapsedTime, leader }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'linear-gradient(45deg, #ff6ec4, #7873f5)',
      padding: '10px 15px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      zIndex: 10,
      color: '#fff',
      fontFamily: 'sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>Crazy Race HUD</div>
      <div>Tempo: {Math.floor(elapsedTime)} s</div>
      <div>Leader: {leader ? leader.name : '-'}</div>
    </div>
  );
};

export default RaceHUD;
