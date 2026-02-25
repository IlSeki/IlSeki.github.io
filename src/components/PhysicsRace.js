import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import RaceHUD from './RaceHUD';
import FullscreenButton from './FullscreenButton';
import '../App.css';

const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

const FINISH_LINE = 10000; 
const MARBLE_SIZE = 40; 

function PhysicsRace({ marbles = [], onRaceEnd }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  
  const [cameraOffset, setCameraOffset] = useState(0);
  const [winner, setWinner] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timeIntervalRef = useRef(null);

  useEffect(() => {
    let currentWidth = window.innerWidth || 800;

    // 1. Inizializza Matter.js Engine
    const engine = Engine.create();
    engine.gravity.y = 1.2; // Forza di gravità
    engineRef.current = engine;

    // 2. Inizializza il Render su Canvas
    const render = Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: currentWidth,
        height: window.innerHeight,
        wireframes: false, 
        background: '#1a1a2e' // Sfondo scuro elegante
      }
    });
    
    // Aggiungi un bellissimo render per le ombre/3D sulla canvas di base (hook di render manuale)
    Events.on(render, 'afterRender', function() {
        var context = render.context;
        // Effetto luce 3D (sfumature leggere generalizzate) non strettamente necessario per ogni corpo
        // ma rende il canvas più "corposo". 
        // Per performance è meglio usare solo fillStyle nei render di Matter.
    });
    
    renderRef.current = render;
    const world = engine.world;
    
    // 3. Muri laterali espandibili
    const leftWall = Bodies.rectangle(-25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    const rightWall = Bodies.rectangle(currentWidth + 25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    World.add(world, [leftWall, rightWall]);

    // 4. TRAGUARDO (Sensore per la vittoria) - largo abbastanza per ogni resize
    const finishSensor = Bodies.rectangle(currentWidth / 2, FINISH_LINE, 5000, 100, {
      isStatic: true, 
      isSensor: true, 
      label: 'FinishLine', 
      render: { fillStyle: '#ffd700' } // Dorato
    });
    World.add(world, finishSensor);

    // Gestione ridimensionamento e Fullscreen
    const handleResize = () => {
        currentWidth = window.innerWidth;
        if (render.canvas) {
            render.canvas.width = currentWidth;
            render.canvas.height = window.innerHeight;
            render.options.width = currentWidth;
            render.options.height = window.innerHeight;
            Body.setPosition(rightWall, { x: currentWidth + 25, y: rightWall.position.y });
            Body.setPosition(finishSensor, { x: currentWidth / 2, y: finishSensor.position.y });
        }
    };
    window.addEventListener('resize', handleResize);

    // 5. BIGLIE: Inizializzazione fisica
    const matterMarbles = marbles.map((m, idx) => {
      const radius = MARBLE_SIZE / 2;
      const x = ((idx + 1) * currentWidth) / (marbles.length + 1);
      const y = -50 - (Math.random() * 100);
      
      return Bodies.circle(x, y, radius, {
        restitution: 0.6, 
        friction: 0.02,
        density: 0.05,
        label: 'Marble',
        render: {
          fillStyle: m.color || '#ff0033', 
          sprite: m.image ? { texture: m.image, xScale: radius/64, yScale: radius/64 } : undefined
        },
        plugin: { marbleData: m } 
      });
    });
    World.add(world, matterMarbles);
    
    // 6. OSTACOLI FISICI DINAMICI E VARIEGATI
    const matterObstacles = generateMatterObstacles(120, currentWidth); 
    World.add(world, matterObstacles);
    
    // Genera anche Cunei (Wedges) ai lati per non far scivolare le biglie diritte contro il muro
    const wallWedges = generateWallWedges(currentWidth);
    World.add(world, wallWedges);

    // 7. GESTIONE EVENTI E COLLISIONI
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const isMarbleA = bodyA.label === 'Marble';
        const isMarbleB = bodyB.label === 'Marble';
        
        if (isMarbleA || isMarbleB) {
          const marble = isMarbleA ? bodyA : bodyB;
          const other = isMarbleA ? bodyB : bodyA;
          
          if (!marble.activeEffects) marble.activeEffects = {};

          // POWER-UPS POSITIVI
          if (other.label === 'PowerUp_Boost') {
            Body.setVelocity(marble, { 
                x: marble.velocity.x * 1.5, 
                y: marble.velocity.y > 0 ? marble.velocity.y + 15 : 15 
            });
          }
          if (other.label === 'PowerUp_Shrink' && !marble.activeEffects.shrink) {
            marble.activeEffects.shrink = true;
            Body.scale(marble, 0.5, 0.5); // Dimezza
            setTimeout(() => { 
                if (marble.render) { // se esiste ancora
                   Body.scale(marble, 2, 2); 
                   marble.activeEffects.shrink = false; 
                }
            }, 3000);
          }
          
          // POWER-DOWNS NEGATIVI
          if (other.label === 'PowerDown_Slow') {
            Body.setVelocity(marble, { 
                x: marble.velocity.x * 0.3, 
                y: marble.velocity.y * 0.3 
            });
          }
          if (other.label === 'PowerDown_Grow' && !marble.activeEffects.grow) {
            marble.activeEffects.grow = true;
            Body.scale(marble, 2, 2); // Raddoppia
            setTimeout(() => { 
                if (marble.render) { 
                    Body.scale(marble, 0.5, 0.5); 
                    marble.activeEffects.grow = false; 
                }
            }, 3000);
          }

          // Vittoria
          if (other.label === 'FinishLine') {
            setWinner(prev => {
                if (!prev) return marble.plugin.marbleData;
                return prev;
            });
          }
        }
      });
    });

    // 8. OSTACOLI MOBILI (Rotazione/Traslazione)
    Events.on(engine, 'beforeUpdate', () => {
       matterObstacles.forEach(obs => {
          if (obs.label === 'MobileObstacle_Rotate') {
              Body.setAngle(obs, obs.angle + obs.plugin.rotationSpeed);
          } else if (obs.label === 'MobileObstacle_Translate') {
              // Movimento orizzontale
              const { startX, range, speed, timeOffset } = obs.plugin;
              const newX = startX + Math.sin(engine.timing.timestamp * speed + timeOffset) * range;
              Body.setPosition(obs, { x: newX, y: obs.position.y });
          } else if (obs.label === 'MobileObstacle_Piston') {
              // Movimento verticale
              const { startY, range, speed, timeOffset } = obs.plugin;
              const newY = startY + Math.sin(engine.timing.timestamp * speed + timeOffset) * range;
              Body.setPosition(obs, { x: obs.position.x, y: newY });
          }
       });
    });

    // 9. LOGICA DELLA TELECAMERA 
    Events.on(engine, 'beforeUpdate', () => {
      let leaderY = -Infinity;
      matterMarbles.forEach(m => {
        if (m.position.y > leaderY) leaderY = m.position.y;
      });
      
      const targetOffset = Math.max(0, leaderY - 200);
      
      Render.lookAt(render, {
        min: { x: 0, y: targetOffset },
        max: { x: currentWidth, y: targetOffset + window.innerHeight } 
      });
      
      setCameraOffset(targetOffset);
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    timeIntervalRef.current = setInterval(() => {
       setElapsedTime(prev => prev + 0.1);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
      clearInterval(timeIntervalRef.current);
    };
  }, [marbles]);

  const handleReturnToMenu = () => {
    if (onRaceEnd) onRaceEnd([]);
  };

  const leaderFakeObj = winner || { y: cameraOffset + 200 };

  return (
    <div className="race-wrapper" style={{ position: 'relative', overflow: 'hidden', height: '100vh', width: '100vw', background: '#1a1a2e' }}>
      
      <h1 style={{ position: 'absolute', top: 10, left: 10, color: '#fff', zIndex: 10, fontFamily: 'sans-serif', margin: 0, fontSize: '24px', textShadow: '2px 2px 4px #000' }}>
          Physics Race (3D Mode)
      </h1>
      
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '10px' }}>
          {(typeof FullscreenButton !== 'undefined') && <FullscreenButton />}
          <button onClick={handleReturnToMenu} style={btnStyle}>Torna al Menu</button>
      </div>

      {(typeof RaceHUD !== 'undefined') && <div style={{ position:'absolute', top:50, left:10, zIndex: 10 }}>
          <RaceHUD elapsedTime={elapsedTime} leader={leaderFakeObj} />
      </div>}

      <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
         <canvas ref={canvasRef} style={{ border: 'none', outline: 'none' }} />
      </div>

      {winner && (
        <div style={winnerOverlayStyle}>
          <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', textShadow: '3px 3px 6px #000', color: '#ffea00' }}>Vittoria!</h1>
          <h2 style={{ fontSize: '36px', margin: '0 0 40px 0', textShadow: '2px 2px 4px #000' }}>La biglia &quot;{winner.name || 'Sconosciuta'}&quot; ha dominato!</h2>
          <button onClick={handleReturnToMenu} style={btnStyleLarge}>Torna al menu</button>
        </div>
      )}
    </div>
  );
}

// Generatore di zeppe ai lati (evita lo scorrimento diretto lungo i muri)
function generateWallWedges(mapWidth) {
    const wedges = [];
    const step = 800; // Un cuneo ogni 800px per lato
    for (let y = 600; y < FINISH_LINE; y += step) {
        // Cuneo Sinistro (Triangolo)
        const leftWedge = Bodies.polygon(10, y + (Math.random() * 200), 3, 60, {
            isStatic: true,
            angle: Math.PI / 2, // Ruotato
            render: { fillStyle: '#e74c3c' }
        });
        // Cuneo Destro (Triangolo)
        const rightWedge = Bodies.polygon(mapWidth - 10, y + (Math.random() * 200), 3, 60, {
            isStatic: true,
            angle: -Math.PI / 2, // Ruotato altrove
            render: { fillStyle: '#e74c3c' }
        });
        wedges.push(leftWedge, rightWedge);
    }
    return wedges;
}

// ---------------------------------------------------------
// GENERATORI DI OSTACOLI MATTER.JS CON FORME 3D/GEOMETRICHE
// ---------------------------------------------------------
export function generateMatterObstacles(numberOfBlocks, mapWidth) {
  const obstacles = [];
  const maxGap = FINISH_LINE / numberOfBlocks;

  for (let i = 0; i < numberOfBlocks; i++) {
    const y = 300 + (i * maxGap) + (Math.random() * maxGap/2);
    const x = Math.random() * (mapWidth - 100) + 50;
    
    const randomChoice = Math.random();

    if (randomChoice < 0.15) {
       // 1. OSTACOLO ROTANTE 3D (Esagono)
       const spinner = Bodies.polygon(x, y, 6, 40 + Math.random() * 30, {
           isStatic: true, 
           label: 'MobileObstacle_Rotate',
           render: { fillStyle: '#9b59b6' }, // Viola
           plugin: { rotationSpeed: 0.03 * (Math.random() > 0.5 ? 1 : -1) } 
       });
       obstacles.push(spinner);
       
    } else if (randomChoice < 0.30) {
       // 2. PIATTAFORMA TRASLANTE (Oscilla Orizzontalmente)
       const len = 150 + Math.random() * 100;
       const slider = Bodies.rectangle(x, y, len, 25 + Math.random() * 10, {
           isStatic: true,
           chamfer: { radius: 10 }, // Angoli smussati = aspetto premium 3D
           label: 'MobileObstacle_Translate',
           render: { fillStyle: '#3498db' }, // Blu
           plugin: { 
               startX: x, range: 100 + Math.random()*100, 
               speed: 0.002 + Math.random()*0.002, timeOffset: Math.random() * 100 
           }
       });
       obstacles.push(slider);

    } else if (randomChoice < 0.45) {
       // 3. PISTONE VERTICALE (Oscilla Verticalmente)
       const block = Bodies.rectangle(x, y, 80 + Math.random() * 60, 40, {
           isStatic: true,
           chamfer: { radius: [15, 15, 0, 0] }, // A palla sopra
           label: 'MobileObstacle_Piston',
           render: { fillStyle: '#e67e22' }, // Arancio
           plugin: { 
               startY: y, range: 80 + Math.random()*80, 
               speed: 0.003 + Math.random()*0.003, timeOffset: Math.random() * 10 
           }
       });
       obstacles.push(block);

    } else if (randomChoice < 0.55) {
       // 4. POWER-UP (Velocità o Shrink - forme a stella/poligono)
       const isShrink = Math.random() > 0.5;
       const powerColor = isShrink ? '#00e5ff' : '#00ff55';
       const sides = isShrink ? 5 : 8; // Pentagoni od ottagoni per il powerup
       const boostPad = Bodies.polygon(x, y, sides, 25, {
           isSensor: true, 
           isStatic: true,
           label: isShrink ? 'PowerUp_Shrink' : 'PowerUp_Boost', 
           render: { fillStyle: powerColor } 
       });
       obstacles.push(boostPad);

    } else if (randomChoice < 0.65) {
       // 5. POWER-DOWN (Fanghiglia rallentante o Ingrandimento)
       const isGrow = Math.random() > 0.5;
       const downColor = isGrow ? '#d32f2f' : '#8d6e63'; // Rosso o Marrone
       const mudTrap = Bodies.polygon(x, y, 4, 35, {
           isSensor: true, 
           isStatic: true,
           angle: Math.PI / 4, // Rombo
           label: isGrow ? 'PowerDown_Grow' : 'PowerDown_Slow', 
           render: { fillStyle: downColor, opacity: 0.8 } 
       });
       obstacles.push(mudTrap);
       
    } else if (randomChoice < 0.80) {
       // 6. FLIPPER ZONE (3-4 Respingenti 3D rotondi)
       const numBumpers = 3 + Math.floor(Math.random() * 2);
       for(let k=0; k<numBumpers; k++) {
           const bumperX = x + (k*70) - ((numBumpers*70)/2);
           const bumper = Bodies.circle(bumperX, y + (Math.random() * 50), 18, {
               isStatic: true,
               restitution: 1.5, // Flipper bounce
               label: 'Bumper',
               render: { fillStyle: '#00ccff', strokeStyle: '#ffffff', lineWidth: 3 } // Azzurro con bordo spesso stile霓虹3D
           });
           obstacles.push(bumper);
       }

    } else {
       // 7. OSTACOLO STATICO GEOMETRICO (Triangoli larghi / Trapezi)
       const isTriangle = Math.random() > 0.5;
       if (isTriangle) {
           const triangle = Bodies.polygon(x, y, 3, 50 + Math.random()*30, {
               isStatic: true,
               angle: (Math.random() * Math.PI) * (Math.random() > 0.5 ? 1 : -1),
               render: { fillStyle: '#7f8c8d' } 
           });
           obstacles.push(triangle);
       } else {
           const trapezoid = Bodies.trapezoid(x, y, 100 + Math.random()*100, 40, 0.5, {
               isStatic: true,
               angle: (Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
               render: { fillStyle: '#bdc3c7' } 
           });
           obstacles.push(trapezoid);
       }
    }
  }
  return obstacles;
}

// Stili base integrati
const btnStyle = {
  background: 'linear-gradient(45deg, #00ff88, #00b3ff)',
  color: '#1a1a2e', border: 'none', padding: '10px 15px',
  borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', 
  boxShadow: '0 4px 10px rgba(0,255,136,0.3)', transition: 'transform 0.2s',
  fontFamily: 'sans-serif'
};

const btnStyleLarge = {
  ...btnStyle, padding: '15px 30px', fontSize: '24px', borderRadius: '12px'
};

const winnerOverlayStyle = {
  position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
  justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 200, 
  animation: 'fadeIn 0.5s', fontFamily: 'sans-serif'
};

export default PhysicsRace;
