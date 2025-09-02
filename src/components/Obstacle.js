// src/components/Obstacle.js
import React, { useState, useEffect, useRef } from 'react';
import { FINISH_LINE } from './Race';

const DEFAULT_MARBLE_SIZE = 40;
const VIRTUAL_WIDTH = 800;
const AUTO_RELEASE_TIMEOUT = 2500;

const checkOverlap = (obstacle, obstacles) => obstacles.some(existing => 
  !(obstacle.x + obstacle.width < existing.x || obstacle.x > existing.x + existing.width || 
    obstacle.y + obstacle.height < existing.y || obstacle.y > existing.y + existing.height)
);

const COLORS = {
  vortexTunnel: '#663399', seesawBridge: '#8B4513', springCannon: '#FFD700',
  magneticMaze: '#4682B4', rotatingCups: '#CD853F', quicksandTrap: '#D2B48C',
  musicalSteps: '#FF69B4', timedSlidingDoor: '#2E8B57', waterVortex: '#1E90FF',
  newtonPendulum: '#FF4500', zigzagCorridor: '#9370DB', conveyorBelt: '#708090',
  windTunnel: '#87CEEB', flipperZone: '#E9967A', balanceBeam: '#006400', default: '#555'
};

const Obstacle = ({ obstacle, cameraOffset }) => {
  const [rotation, setRotation] = useState(0);
  const [phaseOffset, setPhaseOffset] = useState(Math.random() * 360);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
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

  const style = {
    position: 'absolute',
    left: obstacle.x,
    top: obstacle.y - cameraOffset,
    width: obstacle.width,
    height: obstacle.height,
    backgroundColor: COLORS[obstacle.type] || COLORS.default,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'transform 0.1s linear',
    overflow: 'hidden',
    zIndex: obstacle.zIndex || 1,
    borderRadius: '4px'
  };

  let innerElement = null;

  switch (obstacle.type) {
    case "vortexTunnel":
      style.borderRadius = '50%';
      style.transform = `rotate(${rotation}deg)`;
      style.backgroundImage = 'linear-gradient(45deg, #663399 0%, #9370DB 100%)';
      style.border = '2px solid #fff';
      
      innerElement = (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%',
              borderRadius: '50%', border: `${3 + i}px solid rgba(255,255,255,${0.8 - i * 0.2})`,
              transform: `rotate(${rotation * (i % 2 ? -1 : 1)}deg)`, transformOrigin: 'center'
            }} />
          ))}
          <div style={{
            position: 'absolute', top: '45%', left: '45%', width: '10%', height: '10%',
            borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 0 10px #fff'
          }} />
        </>
      );
      break;

    case "seesawBridge":
      const tiltAngle = Math.sin(Date.now() / 1000 + phaseOffset) * 15;
      style.backgroundColor = '#8B4513';
      style.backgroundImage = 'linear-gradient(90deg, #A0522D, #8B4513, #A0522D)';
      style.transform = `rotate(${tiltAngle}deg)`;
      style.transformOrigin = 'center center';
      style.borderRadius = '5px';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute', top: '100%', left: '48%', width: '4%', height: '20px',
            backgroundColor: '#5D4037', borderRadius: '0 0 5px 5px', transformOrigin: 'top center'
          }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '0', left: `${i * 12.5}%`, width: '10%', height: '100%',
              backgroundColor: i % 2 ? '#A0522D' : '#8B4513', opacity: 0.7
            }} />
          ))}
        </>
      );
      break;

    case "springCannon":
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle at 30% 30%, #FFD700 20%, #B8860B 100%)';
      style.border = '2px solid #B8860B';
      
      const springAnimation = Math.sin(Date.now() / 300 + phaseOffset) > 0.7 ? 'scale(1.2)' : 'scale(1)';
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%',
            borderRadius: '50%', backgroundColor: '#FFD700', backgroundImage: 'linear-gradient(45deg, #FFD700, #DAA520)',
            transform: springAnimation, transition: 'transform 0.1s ease-out'
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '40%', width: '20%', height: '20%',
            borderRadius: '50%', backgroundColor: '#B8860B'
          }} />
        </>
      );
      break;

    case "magneticMaze":
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(135deg, #4682B4, #1E90FF)';
      
      innerElement = (
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '5px'
        }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const isPole = i === 0 || i === 2 || i === 6 || i === 8;
            return (
              <div key={i} style={{
                backgroundColor: isPole ? '#FF0000' : '#0000FF', borderRadius: '50%',
                boxShadow: `0 0 5px ${isPole ? '#FF0000' : '#0000FF'}`, display: 'flex',
                justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#fff', fontWeight: 'bold'
              }}>
                {isPole ? 'N' : 'S'}
              </div>
            );
          })}
        </div>
      );
      break;

    case "rotatingCups":
      style.borderRadius = '8px';
      style.backgroundColor = '#CD853F';
      style.transform = `rotate(${rotation}deg)`;
      
      innerElement = (
        <>
          <div style={{
            position: 'absolute', top: '10%', left: '45%', width: '10%', height: '80%',
            backgroundColor: '#8B4513', borderRadius: '5px', zIndex: 1
          }} />
          {Array.from({ length: 3 }).map((_, i) => {
            const cupAngle = (i * 120) + rotation;
            return (
              <div key={i} style={{
                position: 'absolute', top: '50%', left: '50%', width: '60%', height: '20%',
                backgroundColor: '#DEB887', borderRadius: '0 0 50% 50%',
                transform: `rotate(${cupAngle}deg) translateX(50%)`, transformOrigin: 'left center',
                boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.3)', zIndex: 0
              }} />
            );
          })}
        </>
      );
      break;

    case "quicksandTrap":
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(to bottom, #D2B48C, #8B4513)';
      
      innerElement = (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const size = 3 + Math.random() * 5;
            return (
              <div key={i} style={{
                position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                width: `${size}px`, height: `${size}px`, borderRadius: '50%',
                backgroundColor: 'rgba(139, 69, 19, 0.3)',
                animation: `bubble ${1 + Math.random()}s infinite ${Math.random() * 2}s`
              }} />
            );
          })}
        </>
      );
      break;

    case "musicalSteps":
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(to right, #FF69B4, #DA70D6, #FFB6C1, #FF1493, #C71585, #DB7093, #FF69B4)';
      
      innerElement = (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '0', left: `${i * (100 / 7)}%`, width: `${100 / 7}%`, height: '100%',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              paddingBottom: '2px', fontSize: '8px', color: 'white', textShadow: '0 0 2px black'
            }}>
              {['DO', 'RE', 'MI', 'FA', 'SOL', 'LA', 'SI'][i]}
            </div>
          ))}
        </>
      );
      break;

    case "timedSlidingDoor":
      const isOpen = Math.sin(Date.now() / 1000 + phaseOffset) > 0;
      style.borderRadius = '8px';
      style.backgroundColor = '#2E8B57';
      style.border = '2px solid #006400';
      
      innerElement = (
        <div style={{
          position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: '#3CB371', borderRadius: '4px'
        }}>
          <div style={{
            position: 'absolute', top: '0', left: '0', width: '50%', height: '100%',
            backgroundColor: '#2E8B57', transform: `translateX(${isOpen ? '-90%' : '0'})`,
            transition: 'transform 0.3s ease-in-out', borderRight: '1px solid #006400'
          }} />
          <div style={{
            position: 'absolute', top: '0', right: '0', width: '50%', height: '100%',
            backgroundColor: '#2E8B57', transform: `translateX(${isOpen ? '90%' : '0'})`,
            transition: 'transform 0.3s ease-in-out', borderLeft: '1px solid #006400'
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '40%', width: '20%', height: '20%',
            borderRadius: '50%', backgroundColor: isOpen ? '#00FF00' : '#FF0000', transition: 'background-color 0.3s'
          }} />
        </div>
      );
      break;

    case "waterVortex":
      style.borderRadius = '50%';
      style.backgroundImage = 'radial-gradient(circle, #1E90FF, #0000CD)';
      
      innerElement = (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '5%', left: '5%', width: '90%', height: '90%',
              borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)',
              transform: `rotate(${rotation * (i % 2 ? 0.7 : -0.5)}deg) scale(${1 - i * 0.15})`,
              transformOrigin: 'center'
            }} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36) + rotation;
            const distance = 35 + (i % 3) * 5;
            return (
              <div key={`bubble-${i}`} style={{
                position: 'absolute', top: '50%', left: '50%', width: '8%', height: '8%',
                borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)',
                transform: `rotate(${angle}deg) translate(${distance}%, 0)`, transformOrigin: 'center'
              }} />
            );
          })}
        </>
      );
      break;

    case "newtonPendulum":
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
            position: 'absolute', top: '10%', left: '10%', width: '80%', height: '10%',
            backgroundColor: '#A52A2A', borderRadius: '4px'
          }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '10%', left: `${20 + i * 15}%`, width: '2%', height: '50%',
              backgroundColor: '#A9A9A9', transformOrigin: 'top center', transform: `rotate(${angles[i]}deg)`
            }}>
              <div style={{
                position: 'absolute', bottom: '-15px', left: '-7px', width: '16px', height: '16px',
                borderRadius: '50%', backgroundColor: i === 0 || i === 4 ? '#B22222' : '#D3D3D3',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            </div>
          ))}
        </>
      );
      break;

    case "zigzagCorridor":
      style.borderRadius = '8px';
      style.backgroundImage = 'linear-gradient(45deg, #9370DB, #6A5ACD)';
      style.border = '3px solid #483D8B';
      
      innerElement = (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: `${i * 10}%`, left: `${i % 2 === 0 ? 0 : 50}%`,
              width: '50%', height: '10%', backgroundColor: '#9370DB', border: '1px solid #6A5ACD',
              transform: `rotate(${i % 2 === 0 ? 45 : -45}deg)`, transformOrigin: 'center'
            }} />
          ))}
        </>
      );
      break;
  }

  return <div style={style}>{innerElement}</div>;
};

const createObstacleGenerator = (width, height, rotationSpeed = null) => (i, baseY, yVariation) => {
  const obstacles = [];
  for (let j = 0; j < 100; j++) {
    const x = Math.random() * (VIRTUAL_WIDTH - width);
    const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
    const props = { rotationSpeed };
    obstacles.push({ 
      id: `${type}_${i}_${j}`, x, y, width, height, type, ...Object.fromEntries(Object.entries(props).filter(([_, v]) => v !== null))
    });
  }
  return obstacles;
};

const obstacleTypes = {
  vortexTunnel: (i, baseY, yVariation) => {
    const width = 100, height = 100;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `vortexTunnel_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "vortexTunnel", rotationSpeed: 0.2
    }));
  },
  seesawBridge: (i, baseY, yVariation) => {
    const width = 200, height = 20;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `seesawBridge_${i}_${j}`,
      x: (VIRTUAL_WIDTH - width) / 2,
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "seesawBridge"
    }));
  },
  springCannon: (i, baseY, yVariation) => {
    const width = 60, height = 60;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `springCannon_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "springCannon"
    }));
  },
  magneticMaze: (i, baseY, yVariation) => {
    const width = 80, height = 80;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `magneticMaze_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "magneticMaze"
    }));
  },
  rotatingCups: (i, baseY, yVariation) => {
    const width = 80, height = 80;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `rotatingCups_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "rotatingCups", rotationSpeed: 0.3
    }));
  },
  quicksandTrap: (i, baseY, yVariation) => {
    const width = 150, height = 30;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `quicksandTrap_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "quicksandTrap"
    }));
  },
  musicalSteps: (i, baseY, yVariation) => {
    const width = 140, height = 25;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `musicalSteps_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "musicalSteps"
    }));
  },
  timedSlidingDoor: (i, baseY, yVariation) => {
    const width = 70, height = 70;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `timedSlidingDoor_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "timedSlidingDoor"
    }));
  },
  waterVortex: (i, baseY, yVariation) => {
    const width = 100, height = 100;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `waterVortex_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "waterVortex", rotationSpeed: 0.4
    }));
  },
  newtonPendulum: (i, baseY, yVariation) => {
    const width = 80, height = 60;
    return Array.from({ length: 100 }, (_, j) => ({
      id: `newtonPendulum_${i}_${j}`,
      x: Math.random() * (VIRTUAL_WIDTH - width),
      y: baseY + (Math.random() * yVariation) - (yVariation / 2),
      width, height, type: "newtonPendulum"
    }));
  },
};

const generateObstacles = (num = 100) => {
  const allObstacleTypes = [
    "vortexTunnel", "seesawBridge", "springCannon", "magneticMaze", "rotatingCups", 
    "quicksandTrap", "musicalSteps", "timedSlidingDoor", "waterVortex", "newtonPendulum"
  ];
  
  let obstacles = [];
  
  for (let i = 0; i < num; i++) {
    // Calculate vertical position with some variation
    const baseY = 100 + i * ((FINISH_LINE - 200) / num);
    const yVariation = ((FINISH_LINE - 200) / num) * 0.3;
    
    // Select a random obstacle type
    const obstacleType = allObstacleTypes[Math.floor(Math.random() * allObstacleTypes.length)];
    
    // Generate 3-5 instances of the chosen obstacle type in a horizontal row
    const numHorizontal = Math.floor(Math.random() * 3) + 3; // 3-5 obstacles per row
    const obstacleInstances = [];
    
    // Get the obstacle dimensions based on its type
    let width, height;
    switch(obstacleType) {
      case "vortexTunnel": width = 100; height = 100; break;
      case "seesawBridge": width = 200; height = 20; break;
      case "springCannon": width = 60; height = 60; break;
      case "magneticMaze": width = 80; height = 80; break;
      case "rotatingCups": width = 80; height = 80; break;
      case "quicksandTrap": width = 150; height = 30; break;
      case "musicalSteps": width = 140; height = 25; break;
      case "timedSlidingDoor": width = 70; height = 70; break;
      case "waterVortex": width = 100; height = 100; break;
      case "newtonPendulum": width = 80; height = 60; break;
      default: width = 80; height = 80;
    }
    
    // Calculate total width of all obstacles if placed side by side
    const totalObstacleWidth = width * numHorizontal;
    
    // Ensure there's at least one marble-sized gap
    const marbleSize = DEFAULT_MARBLE_SIZE;
    const availableSpace = VIRTUAL_WIDTH - totalObstacleWidth;
    const minGaps = numHorizontal + 1; // Gaps before, after, and between obstacles
    const spaceForGaps = availableSpace - (minGaps * marbleSize);
    
    if (spaceForGaps < 0) {
      // Not enough space, reduce number of obstacles
      continue;
    }
    
    // Place obstacles with random spacing but ensure at least one marble-sized gap
    const positions = [];
    let usedWidth = 0;
    
    for (let j = 0; j < numHorizontal; j++) {
      // Add a random gap (at least marble size)
      const gapSize = marbleSize + Math.random() * (spaceForGaps / minGaps);
      usedWidth += gapSize;
      
      // Add the obstacle
      const x = usedWidth;
      const y = baseY + (Math.random() * yVariation) - (yVariation / 2);
      
      const props = {};
      if (["vortexTunnel", "rotatingCups", "waterVortex"].includes(obstacleType)) {
        props.rotationSpeed = 0.2 + Math.random() * 0.3;
      }
      
      obstacleInstances.push({
        id: `${obstacleType}_${i}_${j}`,
        x, y, width, height, 
        type: obstacleType, 
        ...props
      });
      
      usedWidth += width;
    }
    
    // Ensure obstacles are spread across the entire width
    const remainingSpace = VIRTUAL_WIDTH - usedWidth;
    if (remainingSpace > 0) {
      const extraGap = remainingSpace / (numHorizontal + 1);
      obstacleInstances.forEach((obstacle, index) => {
        obstacle.x += extraGap * (index + 1);
      });
    }
    
    obstacles = [...obstacles, ...obstacleInstances];
  }
  
  return obstacles;
};

export { obstacleTypes, generateObstacles };
export default Obstacle;