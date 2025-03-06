// src/components/Obstacle.js
import React, { useState, useEffect, useRef } from 'react';

// Dimensione predefinita della biglia per i calcoli (deve essere coerente con Race.js)
const DEFAULT_MARBLE_SIZE = 40;

const Obstacle = ({ obstacle, cameraOffset }) => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const getBackgroundColor = (type) => {
    switch (type) {
      case "blade": return '#ff3366';
      case "boost": return '#33ff99';
      case "slow": return '#3366ff';
      case "tunnel": return '#888888';
      case "pinball": return '#ff9933';
      case "movingPlatform": return '#22aa55';
      case "bumper": return '#ffaa00';
      case "conveyor": return '#999999';
      case "laser": return '#ff0000';
      case "oscillatingBar": return '#00aaff';
      case "spinningCross": return '#aa00ff';
      case "fallingBlock": return '#ffaa77';
      // Nuovi tipi
      case "rotatingSpikes": return '#990000';
      case "shrinkingBlock": return '#006600';
      case "expandingRing": return '#000099';
      case "zigzagWall": return '#FFCC00';
      case "gravityField": return '#6677CC';
      case "magneticField": return '#FF00FF';
      case "spikePit": return '#333333';
      case "slidingDoor": return '#555555';
      case "waterCurrent": return '#0099FF';
      case "fireWall": return '#FF3300';
      default: return '#555';
    }
  };

  useEffect(() => {
    if (obstacle.type !== "blade" && obstacle.type !== "spinningCross") return;

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const speed = obstacle.rotationSpeed || 1;
      setRotation(prev => (prev + speed * 0.1 * deltaTime) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [obstacle.type, obstacle.rotationSpeed]);

  // Stile base per l'ostacolo
  const style = {
    position: 'absolute',
    left: obstacle.x,
    top: obstacle.y - cameraOffset,
    width: obstacle.width,
    height: obstacle.height,
    backgroundColor: getBackgroundColor(obstacle.type),
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'transform 0.1s linear',
    overflow: 'hidden'
  };

  let innerElement = null;
  switch (obstacle.type) {
    case "blade":
      style.borderRadius = '50%';
      style.transform = `rotate(${rotation}deg)`;
      style.backgroundImage = 'linear-gradient(45deg, #ff3366 0%, #ff6699 100%)';
      style.border = '2px solid #fff';
      innerElement = (
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          borderRadius: '5px',
          backgroundColor: '#ff0033',
          transformOrigin: 'center',
          transform: 'rotate(45deg)'
        }} />
      );
      break;

    case "boost":
      style.borderRadius = '4px';
      style.backgroundImage = 'linear-gradient(90deg, #33ff99, #66ffbb)';
      style.animation = 'boostFlow 1s infinite linear';
      innerElement = (
        <>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              bottom: '25%',
              left: `${20 + i * 30}%`,
              width: '10%',
              height: '50%',
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
              backgroundColor: '#fff',
              opacity: 0.7,
              animation: `arrowPulse 0.5s infinite ${i * 0.2}s`
            }} />
          ))}
        </>
      );
      break;

    case "slow":
      style.borderRadius = '4px';
      style.backgroundImage = 'linear-gradient(90deg, #3366ff, #6699ff)';
      style.opacity = 0.8;
      break;

    case "tunnel":
      style.borderRadius = '4px';
      style.backgroundColor = '#777';
      style.border = '3px solid #444';
      style.backgroundImage = 'repeating-linear-gradient(45deg, #777, #666 10px)';
      break;

    case "pinball":
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle at 30% 30%, #ffcc99 20%, #ff9933 100%)';
      style.border = '2px solid #cc6600';
      break;

    case "movingPlatform":
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(90deg, #22aa55, #44cc77)';
      style.animation = 'platformMove 2s infinite alternate';
      break;

    case "bumper":
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle, #ffaa00, #cc8800)';
      style.animation = 'bumperBounce 1.5s infinite';
      break;

    case "conveyor":
      style.borderRadius = '4px';
      style.backgroundImage = 'repeating-linear-gradient(90deg, #999, #aaa 10px, #999 20px)';
      style.animation = 'conveyorFlow 3s linear infinite';
      break;

    case "laser":
      style.borderRadius = '2px';
      style.height = '4px';
      style.backgroundColor = '#ff0000';
      style.animation = 'laserFlash 1s infinite';
      break;

    case "oscillatingBar":
      style.borderRadius = '4px';
      style.backgroundImage = 'linear-gradient(90deg, #00aaff, #0077cc)';
      style.animation = 'oscillate 2s infinite ease-in-out';
      break;

    case "spinningCross": {
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '45%',
            left: 0,
            width: '100%',
            height: '10%',
            backgroundColor: '#aa00ff',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }} />
          <div style={{
            position: 'absolute',
            left: '45%',
            top: 0,
            width: '10%',
            height: '100%',
            backgroundColor: '#aa00ff',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }} />
        </>
      );
      break;
    }

    case "fallingBlock":
      style.borderRadius = '4px';
      style.backgroundColor = '#ffaa77';
      style.animation = 'fallAndRise 3s infinite ease-in-out';
      break;

    // Nuovi ostacoli:

    case "rotatingSpikes": {
      style.borderRadius = '50%';
      innerElement = (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = i * (360 / 8);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '20%',
                  height: '20%',
                  backgroundColor: '#990000',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  transform: `rotate(${angle}deg) translate(0, -50%)`,
                  transformOrigin: '50% 100%'
                }}
              />
            );
          })}
        </>
      );
      break;
    }

    case "shrinkingBlock": {
      style.borderRadius = '4px';
      style.backgroundColor = '#006600';
      style.animation = 'shrinkExpand 2s infinite ease-in-out';
      break;
    }

    case "expandingRing": {
      style.borderRadius = '50%';
      style.backgroundColor = 'transparent';
      style.border = '3px solid #000099';
      style.animation = 'ringExpand 2s infinite alternate';
      break;
    }

    case "zigzagWall": {
      style.backgroundImage = 'repeating-linear-gradient(135deg, #FFCC00, #FFCC00 10px, #FF9900 10px, #FF9900 20px)';
      style.animation = 'zigzagMove 3s infinite linear';
      break;
    }

    case "gravityField": {
      style.backgroundImage = 'radial-gradient(circle, rgba(100,100,255,0.8) 0%, rgba(100,100,255,0.2) 70%)';
      style.animation = 'gravityPulse 4s infinite ease-in-out';
      break;
    }

    case "magneticField": {
      style.backgroundImage = 'linear-gradient(45deg, #FF0000, #0000FF)';
      style.animation = 'magneticPulse 2s infinite alternate';
      break;
    }

    case "spikePit": {
      innerElement = (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-end', 
          width: '100%', 
          height: '100%' 
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              width: '15%',
              height: '40%',
              backgroundColor: '#444',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }} />
          ))}
        </div>
      );
      break;
    }

    case "slidingDoor": {
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '45%',
            height: '100%',
            backgroundColor: '#555'
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '45%',
            height: '100%',
            backgroundColor: '#555'
          }} />
        </>
      );
      break;
    }

    case "waterCurrent": {
      style.backgroundImage = 'linear-gradient(90deg, #66ccff, #0099ff)';
      style.animation = 'waterFlow 3s infinite linear';
      break;
    }

    case "fireWall": {
      style.backgroundImage = 'linear-gradient(45deg, #ff6600, #ff3300)';
      style.animation = 'fireFlicker 1.5s infinite alternate';
      break;
    }

    default:
      style.borderRadius = '4px';
  }

  return (
    <div style={style}>
      {innerElement}
    </div>
  );
};

export default Obstacle;
