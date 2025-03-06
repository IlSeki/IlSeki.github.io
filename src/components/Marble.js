import React from 'react';

function Marble({ name, image, color, x, y }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: '40px',
      height: '40px'
    }}>
      <div style={{
        position: 'absolute',
        top: '-20px',
        width: '100%',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        {name}
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #000',
        backgroundColor: image ? 'transparent' : color,
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}></div>
    </div>
  );
}

export default Marble;
