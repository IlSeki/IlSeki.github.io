// src/components/Race.js
import React, { useState, useEffect, useRef } from 'react';
import Marble from './Marble';
import Obstacle, { generateObstacles } from './Obstacle';
import FinishLine from './FinishLine';
import RaceHUD from './RaceHUD';
import FullscreenButton from './FullscreenButton';
import '../App.css';

const VIRTUAL_WIDTH = 800; // Ensure VIRTUAL_WIDTH is defined here
const FINISH_LINE = 10000; // Percorso molto più lungo
const ACCELERATION = 400; // Accelerazione aumentata
const MARBLE_SIZE = 40; // Dimensione della biglia
const INITIAL_BOOST = 150; // Velocità iniziale per partire subito
const MAX_VELOCITY = 300; // Velocità massima per limitare rimbalzi eccessivi

function Race({ marbles, onRaceEnd }) {
  const [raceMarbles, setRaceMarbles] = useState(
    marbles.map((m, idx) => ({
      ...m,
      x: ((idx + 1) * VIRTUAL_WIDTH) / (marbles.length + 1) - 20,
      y: -50,
      vx: (Math.random() - 0.5) * 50,
      vy: INITIAL_BOOST
    }))
  );
  const [obstacles] = useState(generateObstacles(50)); // Increase the number of obstacles
  const [cameraOffset, setCameraOffset] = useState(0);
  const [winner, setWinner] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const prevTimeRef = useRef(null);
  const lastCameraOffsetRef = useRef(0);

  // Risolve la collisione standard con gli ostacoli
  const resolveNormalCollision = (marble, obstacle, newX, newY) => {
    const size = MARBLE_SIZE;
    const overlapLeft = (newX + size) - obstacle.x;
    const overlapRight = (obstacle.x + obstacle.width) - newX;
    const overlapX = Math.min(overlapLeft, overlapRight);
    const overlapTop = (newY + size) - obstacle.y;
    const overlapBottom = (obstacle.y + obstacle.height) - newY;
    const overlapY = Math.min(overlapTop, overlapBottom);
    
    let resolvedX = newX;
    let resolvedY = newY;
    let newVx = marble.vx;
    let newVy = marble.vy;
    const bounceFactor = 0.8;
    
    if (overlapX < overlapY) {
      newVx = -marble.vx * bounceFactor;
      if (Math.abs(newVx) < 50) { 
        newVx = (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60);
      }
      resolvedX = (newX + size/2) < (obstacle.x + obstacle.width/2)
        ? obstacle.x - size
        : obstacle.x + obstacle.width;
    } else {
      newVy = -marble.vy * bounceFactor;
      if (Math.abs(newVy) < 80) {
        newVy = 150 + Math.random() * 50;
      }
      resolvedY = (newY + size/2) < (obstacle.y + obstacle.height/2)
        ? obstacle.y - size
        : obstacle.y + obstacle.height;
    }
    return { resolvedX, resolvedY, newVx, newVy };
  };

  // Gestisce la collisione con un ostacolo in base al tipo
  const handleCollision = (marble, obstacle, newX, newY) => {
    let newVx = marble.vx, newVy = marble.vy, resolvedX = newX, resolvedY = newY;
    
    switch(obstacle.type) {
      case "blade":
        newVx = (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60);
        newVy = -Math.abs(marble.vy) * 0.7 - (30 + Math.random() * 50);
        resolvedY = obstacle.y - MARBLE_SIZE;
        break;
        
      case "boost":
        newVy = marble.vy * 1.8;
        newVx = marble.vx * 1.2;
        break;
        
      case "slow":
        newVy = marble.vy * 0.4;
        newVx = marble.vx * 0.4;
        break;
        
      case "pinball":
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.sqrt(marble.vx ** 2 + marble.vy ** 2);
        const newSpeed = Math.min(speed * 1.2, MAX_VELOCITY * 0.8);
        newVx = Math.cos(angle) * newSpeed;
        newVy = Math.sin(angle) * newSpeed;
        if (newVy < 0) {
          newVy = Math.abs(newVy) * 0.6;
        }
        break;
        
      case "tunnel":
        const res = resolveNormalCollision(marble, obstacle, newX, newY);
        resolvedX = res.resolvedX;
        resolvedY = res.resolvedY;
        newVx = res.newVx;
        newVy = res.newVy;
        break;
        
      default:
        const resNormal = resolveNormalCollision(marble, obstacle, newX, newY);
        resolvedX = resNormal.resolvedX;
        resolvedY = resNormal.resolvedY;
        newVx = resNormal.newVx;
        newVy = resNormal.newVy;
    }
    
    newVx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVx));
    newVy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVy));
    
    return { resolvedX, resolvedY, newVx, newVy };
  };

  useEffect(() => {
    const animate = (time) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      const dt = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;
      setElapsedTime(prev => prev + dt);
      
      // Aggiorna la posizione delle biglie e gestisce le collisioni con gli ostacoli
      setRaceMarbles(prevMarbles => {
        // Calcola le nuove posizioni per ogni biglia
        let newMarbles = prevMarbles.map(marble => {
          let vx = marble.vx;
          let vy = marble.vy + ACCELERATION * dt;
          let newX = marble.x + vx * dt;
          let newY = marble.y + vy * dt;
          const size = MARBLE_SIZE;
          
          // Gestione dei bordi laterali
          if (newX < 0) {
            newX = 0;
            vx = -vx * 0.7;
          } else if (newX + size > VIRTUAL_WIDTH) {
            newX = VIRTUAL_WIDTH - size;
            vx = -vx * 0.7;
          }
          
          // Collisioni con ostacoli
          obstacles.forEach(obstacle => {
            if (
              newX < obstacle.x + obstacle.width &&
              newX + size > obstacle.x &&
              newY < obstacle.y + obstacle.height &&
              newY + size > obstacle.y
            ) {
              const collisionRes = handleCollision(marble, obstacle, newX, newY);
              newX = collisionRes.resolvedX;
              newY = collisionRes.resolvedY;
              vx = collisionRes.newVx;
              vy = collisionRes.newVy;
            }
          });
          
          if (Math.abs(vx) < 20) {
            vx = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 30);
          }
          if (Math.abs(vx) > MAX_VELOCITY) {
            vx = Math.sign(vx) * MAX_VELOCITY;
          }
          if (Math.abs(vy) > MAX_VELOCITY) {
            vy = Math.sign(vy) * MAX_VELOCITY;
          }
          if (newX < 0) {
            newX = 0;
            vx = Math.abs(vx) * 0.7;
          } else if (newX + size > VIRTUAL_WIDTH) {
            newX = VIRTUAL_WIDTH - size;
            vx = -Math.abs(vx) * 0.7;
          }
          
          return { ...marble, x: newX, y: newY, vx, vy };
        });

        // Gestione delle collisioni tra le biglie
        for (let i = 0; i < newMarbles.length; i++) {
          for (let j = i + 1; j < newMarbles.length; j++) {
            const m1 = newMarbles[i];
            const m2 = newMarbles[j];
            // Consideriamo le biglie come cerchi con diametro pari a MARBLE_SIZE
            const center1 = { x: m1.x + MARBLE_SIZE / 2, y: m1.y + MARBLE_SIZE / 2 };
            const center2 = { x: m2.x + MARBLE_SIZE / 2, y: m2.y + MARBLE_SIZE / 2 };
            const dx = center2.x - center1.x;
            const dy = center2.y - center1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < MARBLE_SIZE && distance > 0) {
              const overlap = MARBLE_SIZE - distance;
              const nx = dx / distance;
              const ny = dy / distance;
              
              // Separa le biglie in modo equo
              newMarbles[i].x -= (overlap / 2) * nx;
              newMarbles[i].y -= (overlap / 2) * ny;
              newMarbles[j].x += (overlap / 2) * nx;
              newMarbles[j].y += (overlap / 2) * ny;
              
              // Risolvi la collisione scambiando una parte della velocità lungo la normale
              const dvx = m2.vx - m1.vx;
              const dvy = m2.vy - m1.vy;
              const v_rel = dvx * nx + dvy * ny;
              
              if (v_rel < 0) { // Solo se si avvicinano
                const restitution = 0.8;
                const impulse = -(1 + restitution) * v_rel / 2;
                newMarbles[i].vx -= impulse * nx;
                newMarbles[i].vy -= impulse * ny;
                newMarbles[j].vx += impulse * nx;
                newMarbles[j].vy += impulse * ny;
              }
            }
          }
        }
        
        return newMarbles;
      });
      
      // Aggiornamento della posizione della camera
      setRaceMarbles(prevMarbles => {
        const leadingMarble = prevMarbles.reduce((prev, cur) => (cur.y > prev.y ? cur : prev), prevMarbles[0]);
        const highestMarble = prevMarbles.reduce((prev, cur) => (cur.y < prev.y ? cur : prev), prevMarbles[0]);
        const idealOffset = Math.max(0, leadingMarble.y - 200);
        const highestOffset = highestMarble.y < 0 ? Math.abs(highestMarble.y) : 0;
        const targetOffset = Math.max(0, idealOffset - Math.min(150, highestOffset));
        const currentOffset = lastCameraOffsetRef.current;
        const smoothingFactor = leadingMarble.vy > 0 ? 0.15 : 0.05;
        const newOffset = currentOffset + (targetOffset - currentOffset) * smoothingFactor;
        lastCameraOffsetRef.current = newOffset;
        setCameraOffset(newOffset);
        return prevMarbles;
      });
      
      // Controlla se una biglia ha raggiunto il traguardo
      const finished = raceMarbles.find(m => m.y >= FINISH_LINE);
      if (finished) {
        setWinner(finished);
        cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [obstacles, raceMarbles]);
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Errore nel passaggio a fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const leader = raceMarbles.reduce((prev, cur) => (cur.y > prev.y ? cur : prev), raceMarbles[0]);

  return (
    <div>
      <h1 style={{ color: '#333', fontFamily: 'sans-serif', textAlign: 'center' }}>Gara Crazy in Corso...</h1>
      <div style={{ marginBottom: '10px', color: '#333', textAlign: 'center' }}>
        Camera segue: {Math.floor(cameraOffset)} px
      </div>
      <FullscreenButton onToggle={toggleFullScreen} />
      <div ref={containerRef} className="race-container">
        <RaceHUD elapsedTime={elapsedTime} leader={leader} />
        <FinishLine finishY={FINISH_LINE} cameraOffset={cameraOffset} />
        {obstacles.map(obstacle => (
          <Obstacle key={obstacle.id} obstacle={obstacle} cameraOffset={cameraOffset} />
        ))}
        {raceMarbles.map(marble => (
          <Marble 
            key={marble.id}
            name={marble.name}
            image={marble.image}
            color={marble.color}
            x={marble.x}
            y={marble.y - cameraOffset}
          />
        ))}
        {winner && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            animation: 'fadeIn 2s'
          }}>
            <h1 style={{ fontSize: '64px', marginBottom: '20px', textShadow: '2px 2px 4px #000' }}>Vittoria Crazy!</h1>
            <h2 style={{ fontSize: '48px', marginBottom: '30px', textShadow: '1px 1px 3px #000' }}>
              La biglia "{winner.name}" ha dominato il traguardo!
            </h2>
            <button onClick={() => onRaceEnd(raceMarbles)} style={{
              padding: '12px 24px',
              fontSize: '24px',
              background: '#33ff99',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              fontWeight: 'bold',
              color: '#333' // Improved color scheme
            }}>
              Torna al menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export { FINISH_LINE };
export default Race;
