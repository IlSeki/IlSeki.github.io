// src/components/Obstacle.js
import React, { useState, useEffect, useRef } from 'react';
import { FINISH_LINE } from './Race'; // Add this line to import FINISH_LINE

// Dimensione predefinita della biglia per i calcoli (deve essere coerente con Race.js)
const DEFAULT_MARBLE_SIZE = 40;
const VIRTUAL_WIDTH = 800; // Define the virtual width for the game
const AUTO_RELEASE_TIMEOUT = 5000; // Tempo in ms dopo il quale una biglia bloccata viene liberata

const checkOverlap = (obstacle, obstacles) => {
  return obstacles.some(existing => {
    return !(
      obstacle.x + obstacle.width < existing.x ||
      obstacle.x > existing.x + existing.width ||
      obstacle.y + obstacle.height < existing.y ||
      obstacle.y > existing.y + existing.height
    );
  });
};

const Obstacle = ({ obstacle, cameraOffset }) => {
  const [rotation, setRotation] = useState(0);
  const [phaseOffset, setPhaseOffset] = useState(Math.random() * 360); // Random phase for animations
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const getBackgroundColor = (type) => {
    switch (type) {
      case "vortexTunnel": return '#663399';
      case "seesawBridge": return '#8B4513';
      case "springCannon": return '#FFD700';
      case "magneticMaze": return '#4682B4';
      case "rotatingCups": return '#CD853F';
      case "quicksandTrap": return '#D2B48C';
      case "musicalSteps": return '#FF69B4';
      case "timedSlidingDoor": return '#2E8B57';
      case "waterVortex": return '#1E90FF';
      case "newtonPendulum": return '#FF4500';
      case "zigzagCorridor": return '#9370DB';
      case "conveyorBelt": return '#708090';
      case "windTunnel": return '#87CEEB';
      case "flipperZone": return '#E9967A';
      case "balanceBeam": return '#006400';
      default: return '#555';
    }
  };

  useEffect(() => {
    // Apply animations to objects that need rotation or other time-based effects
    const rotatingTypes = ["vortexTunnel", "rotatingCups", "waterVortex", "newtonPendulum", "conveyorBelt", "windTunnel", "flipperZone"];
    
    if (rotatingTypes.includes(obstacle.type)) {
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
    }
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
    overflow: 'hidden',
    zIndex: obstacle.zIndex || 1
  };

  let innerElement = null;
  switch (obstacle.type) {
    case "vortexTunnel": {
      style.borderRadius = '50%';
      style.transform = `rotate(${rotation}deg)`;
      style.backgroundImage = 'linear-gradient(45deg, #663399 0%, #9370DB 100%)';
      style.border = '2px solid #fff';
      
      // Create a spiral effect
      innerElement = (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              border: `${3 + i}px solid rgba(255,255,255,${0.8 - i * 0.2})`,
              transform: `rotate(${rotation * (i % 2 ? -1 : 1)}deg)`,
              transformOrigin: 'center'
            }} />
          ))}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '45%',
            width: '10%',
            height: '10%',
            borderRadius: '50%',
            backgroundColor: '#fff',
            boxShadow: '0 0 10px #fff'
          }} />
        </>
      );
      break;
    }

    case "seesawBridge": {
      const tiltAngle = Math.sin(Date.now() / 1000 + phaseOffset) * 15;
      style.backgroundColor = '#8B4513';
      style.backgroundImage = 'linear-gradient(90deg, #A0522D, #8B4513, #A0522D)';
      style.transform = `rotate(${tiltAngle}deg)`;
      style.transformOrigin = 'center center';
      style.borderRadius = '5px';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '48%',
            width: '4%',
            height: '20px',
            backgroundColor: '#5D4037',
            borderRadius: '0 0 5px 5px',
            transformOrigin: 'top center'
          }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '0',
              left: `${i * 12.5}%`,
              width: '10%',
              height: '100%',
              backgroundColor: i % 2 ? '#A0522D' : '#8B4513',
              opacity: 0.7
            }} />
          ))}
        </>
      );
      break;
    }

    case "springCannon": {
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle at 30% 30%, #FFD700 20%, #B8860B 100%)';
      style.border = '2px solid #B8860B';
      
      const springAnimation = Math.sin(Date.now() / 300 + phaseOffset) > 0.7 ? 'scale(1.2)' : 'scale(1)';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            backgroundColor: '#FFD700',
            backgroundImage: 'linear-gradient(45deg, #FFD700, #DAA520)',
            transform: springAnimation,
            transition: 'transform 0.1s ease-out'
          }} />
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '40%',
            width: '20%',
            height: '20%',
            borderRadius: '50%',
            backgroundColor: '#B8860B'
          }} />
        </>
      );
      break;
    }

    case "magneticMaze": {
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(135deg, #4682B4, #1E90FF)';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '5px'
          }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const isPole = i === 0 || i === 2 || i === 6 || i === 8;
              return (
                <div key={i} style={{
                  backgroundColor: isPole ? '#FF0000' : '#0000FF',
                  borderRadius: '50%',
                  boxShadow: `0 0 5px ${isPole ? '#FF0000' : '#0000FF'}`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '10px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {isPole ? 'N' : 'S'}
                </div>
              );
            })}
          </div>
        </>
      );
      break;
    }

    case "rotatingCups": {
      style.borderRadius = '8px';
      style.backgroundColor = '#CD853F';
      style.transform = `rotate(${rotation}deg)`;
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '45%',
            width: '10%',
            height: '80%',
            backgroundColor: '#8B4513',
            borderRadius: '5px',
            zIndex: 1
          }} />
          {Array.from({ length: 3 }).map((_, i) => {
            const cupAngle = (i * 120) + rotation;
            return (
              <div key={i} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '60%',
                height: '20%',
                backgroundColor: '#DEB887',
                borderRadius: '0 0 50% 50%',
                transform: `rotate(${cupAngle}deg) translateX(50%)`,
                transformOrigin: 'left center',
                boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.3)',
                zIndex: 0
              }} />
            );
          })}
        </>
      );
      break;
    }

    case "quicksandTrap": {
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(to bottom, #D2B48C, #8B4513)';
      
      innerElement = (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const size = 3 + Math.random() * 5;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const animDelay = Math.random() * 2;
            
            return (
              <div key={i} style={{
                position: 'absolute',
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 69, 19, 0.3)',
                animation: `bubble ${1 + Math.random()}s infinite ${animDelay}s`
              }} />
            );
          })}
        </>
      );
      break;
    }

    case "musicalSteps": {
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(to right, #FF69B4, #DA70D6, #FFB6C1, #FF1493, #C71585, #DB7093, #FF69B4)';
      
      innerElement = (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '0',
              left: `${i * (100 / 7)}%`,
              width: `${100 / 7}%`,
              height: '100%',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: '2px',
              fontSize: '8px',
              color: 'white',
              textShadow: '0 0 2px black'
            }}>
              {['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'][i]}
            </div>
          ))}
        </>
      );
      break;
    }

    case "timedSlidingDoor": {
      const isOpen = Math.sin(Date.now() / 1000 + phaseOffset) > 0;
      style.borderRadius = '8px';
      style.backgroundColor = '#2E8B57';
      style.border = '2px solid #006400';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#3CB371',
            borderRadius: '4px'
          }}>
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '50%',
              height: '100%',
              backgroundColor: '#2E8B57',
              transform: `translateX(${isOpen ? '-90%' : '0'})`,
              transition: 'transform 0.3s ease-in-out',
              borderRight: '1px solid #006400'
            }} />
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '50%',
              height: '100%',
              backgroundColor: '#2E8B57',
              transform: `translateX(${isOpen ? '90%' : '0'})`,
              transition: 'transform 0.3s ease-in-out',
              borderLeft: '1px solid #006400'
            }} />
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '40%',
              width: '20%',
              height: '20%',
              borderRadius: '50%',
              backgroundColor: isOpen ? '#00FF00' : '#FF0000',
              transition: 'background-color 0.3s'
            }} />
          </div>
        </>
      );
      break;
    }

    case "waterVortex": {
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle, #1E90FF, #0000CD)';
      
      innerElement = (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              transform: `rotate(${rotation * (i % 2 ? 0.7 : -0.5)}deg) scale(${1 - i * 0.15})`,
              transformOrigin: 'center'
            }} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36) + rotation;
            const distance = 35 + (i % 3) * 5;
            return (
              <div key={`bubble-${i}`} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '8%',
                height: '8%',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                transform: `rotate(${angle}deg) translate(${distance}%, 0)`,
                transformOrigin: 'center'
              }} />
            );
          })}
        </>
      );
      break;
    }

    case "newtonPendulum": {
      style.borderRadius = '8px';
      style.backgroundColor = '#FF4500';
      
      const pendulumPhase = Date.now() / 800 + phaseOffset;
      const angles = [-30, -15, 0, 15, 30].map((base, i) => {
        const phase = pendulumPhase % 4;
        if (phase < 1 && i === 0) return base - 30 * (1 - phase);
        if (phase < 2 && i === 4) return base + 30 * (phase - 1);
        if (phase < 3 && i === 4) return base + 30 * (1 - (phase - 2));
        if (phase < 4 && i === 0) return base - 30 * (phase - 3);
        return base;
      });
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '10%',
            backgroundColor: '#A52A2A',
            borderRadius: '4px'
          }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '10%',
              left: `${20 + i * 15}%`,
              width: '2%',
              height: '50%',
              backgroundColor: '#A9A9A9',
              transformOrigin: 'top center',
              transform: `rotate(${angles[i]}deg)`
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                left: '-7px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: i === 0 || i === 4 ? '#B22222' : '#D3D3D3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            </div>
          ))}
        </>
      );
      break;
    }

    case "zigzagCorridor": {
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(45deg, #9370DB, #6A5ACD)';
      style.border = '3px solid #483D8B';
      
      innerElement = (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${i * 10}%`,
              left: `${i % 2 === 0 ? 0 : 50}%`,
              width: '50%',
              height: '10%',
              backgroundColor: '#9370DB',
              border: '1px solid #6A5ACD',
              transform: `rotate(${i % 2 === 0 ? 45 : -45}deg)`,
              transformOrigin: 'center'
            }} />
          ))}
        </>
      );
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

const obstacleTypes = {
  vortexTunnel: (i, baseY, yVariation) => {
    const width = 100;
    const height = 100;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `vortexTunnel_${i}`, x, y, width, height, type: "vortexTunnel", rotationSpeed: 0.2 }];
  },
  seesawBridge: (i, baseY, yVariation) => {
    const width = 200;
    const height = 20;
    const x = (VIRTUAL_WIDTH - width) / 2;
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `seesawBridge_${i}`, x, y, width, height, type: "seesawBridge" }];
  },
  springCannon: (i, baseY, yVariation) => {
    const width = 60;
    const height = 60;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `springCannon_${i}`, x, y, width, height, type: "springCannon" }];
  },
  magneticMaze: (i, baseY, yVariation) => {
    const width = 80;
    const height = 80;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `magneticMaze_${i}`, x, y, width, height, type: "magneticMaze" }];
  },
  rotatingCups: (i, baseY, yVariation) => {
    const width = 80;
    const height = 80;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `rotatingCups_${i}`, x, y, width, height, type: "rotatingCups", rotationSpeed: 0.3 }];
  },
  quicksandTrap: (i, baseY, yVariation) => {
    const width = 150;
    const height = 30;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `quicksandTrap_${i}`, x, y, width, height, type: "quicksandTrap" }];
  },
  musicalSteps: (i, baseY, yVariation) => {
    const width = 140;
    const height = 25;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `musicalSteps_${i}`, x, y, width, height, type: "musicalSteps" }];
  },
  timedSlidingDoor: (i, baseY, yVariation) => {
    const width = 70;
    const height = 70;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `timedSlidingDoor_${i}`, x, y, width, height, type: "timedSlidingDoor" }];
  },
  waterVortex: (i, baseY, yVariation) => {
    const width = 100;
    const height = 100;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `waterVortex_${i}`, x, y, width, height, type: "waterVortex", rotationSpeed: 0.4 }];
  },
  newtonPendulum: (i, baseY, yVariation) => {
    const width = 80;
    const height = 60;
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    return [{ id: `newtonPendulum_${i}`, x, y, width, height, type: "newtonPendulum" }];
  },
};

const generateObstacles = (num = 50) => {
  let obstacles = [];
  
  const allObstacleTypes = [
    "vortexTunnel",     // Tunnel Rotante a Vortice
    "seesawBridge",     // Ponte a Bilico
    "springCannon",     // Cannone a Molla
    "magneticMaze",     // Labirinto Magnetico
    "rotatingCups",     // Cascata di Coppe Rotanti
    "quicksandTrap",    // Trappola a Sabbie Mobili
    "musicalSteps",     // Rampa a Gradini Musicali
    "timedSlidingDoor", // Porta Scorrevole Temporizzata
    "waterVortex",      // Vortice d'Acqua
    "newtonPendulum"    // Pendolo di Newton
  ];
  
  for (let i = 0; i < num; i++) {
    const baseY = 100 + i * ((FINISH_LINE - 200) / num);
    const yVariation = ((FINISH_LINE - 200) / num) * 0.3;
    
    // Select a random obstacle type from our curated list
    const obstacleType = allObstacleTypes[Math.floor(Math.random() * allObstacleTypes.length)];
    
    // Generate the obstacle using the appropriate function
    const newObstacles = obstacleTypes[obstacleType](i, baseY, yVariation);
    
    // Add to obstacles array
    obstacles.push(...newObstacles);
  }
  
  return obstacles;
};

export { obstacleTypes, generateObstacles };

export default Obstacle;