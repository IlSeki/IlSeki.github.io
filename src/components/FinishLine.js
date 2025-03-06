// src/components/FinishLine.js
import React from 'react';

const FinishLine = ({ finishY, cameraOffset }) => {
  const style = {
    position: 'absolute',
    top: finishY - cameraOffset,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: '#ffcc00',
    boxShadow: '0 0 10px #ffcc00'
  };

  const labelStyle = {
    position: 'absolute',
    left: '10px',
    top: '-20px',
    fontWeight: 'bold',
    color: '#fff'
  };

  return (
    <div style={style}>
      <span style={labelStyle}>TRAGUARDO</span>
    </div>
  );
};

export default FinishLine;
