import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import RaceHUD from './RaceHUD';
import FullscreenButton from './FullscreenButton';

const { Engine, Render, Runner, World, Bodies, Body, Events, Composite, Constraint, Vector } = Matter;

const VIRTUAL_WIDTH = 800; // La larghezza logica è SEMPRE e rigidamente 800
const VIRTUAL_HEIGHT = 1200; // Area visibile "standard"
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
    // 1. Inizializza Matter.js Engine
    const engine = Engine.create();
    engine.gravity.y = 1.2; 
    engineRef.current = engine;

    // 2. Inizializza il Render in modo FIssato (nessun resize nativo!)
    const render = Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: VIRTUAL_WIDTH,
        height: VIRTUAL_HEIGHT,
        wireframes: false, 
        background: '#0d0d1a' // Sfondo scuro profondo per lo spazio
      }
    });

    renderRef.current = render;
    const world = engine.world;
    
    // 3. Muri laterali Fissi Sulla VIRTUAL_WIDTH Esatta
    const leftWall = Bodies.rectangle(-25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    const rightWall = Bodies.rectangle(VIRTUAL_WIDTH + 25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    World.add(world, [leftWall, rightWall]);

    // 4. TRAGUARDO (Largo esattamente 800)
    const finishSensor = Bodies.rectangle(VIRTUAL_WIDTH / 2, FINISH_LINE, VIRTUAL_WIDTH, 100, {
      isStatic: true, 
      isSensor: true, 
      label: 'FinishLine', 
      render: { fillStyle: '#ffd700' } // Dorato
    });
    World.add(world, finishSensor);

    // 5. BIGLIE
    const matterMarbles = marbles.map((m, idx) => {
      const radius = MARBLE_SIZE / 2;
      const x = ((idx + 1) * VIRTUAL_WIDTH) / (marbles.length + 1);
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
    
    // 6. OSTACOLI ESTREMI ED ESPLOSIVI
    const matterObstacles = generateExtremeObstacles(120, engine); 
    World.add(world, matterObstacles);
    
    const wallWedges = generateWallWedges();
    World.add(world, wallWedges);

    // 7. GESTIONE EVENTI ESTREMI 
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const isMarbleA = bodyA.label === 'Marble';
        const isMarbleB = bodyB.label === 'Marble';
        
        if (isMarbleA || isMarbleB) {
          const marble = isMarbleA ? bodyA : bodyB;
          const other = isMarbleA ? bodyB : bodyA;
          
          if (!marble.activeEffects) marble.activeEffects = {};

          // POWER-UPS (Boost & Shrink)
          if (other.label === 'PowerUp_Boost') {
            Body.setVelocity(marble, { x: marble.velocity.x * 1.5, y: marble.velocity.y > 0 ? marble.velocity.y + 15 : 15 });
          }
          if (other.label === 'PowerUp_Shrink' && !marble.activeEffects.shrink) {
            marble.activeEffects.shrink = true;
            Body.scale(marble, 0.5, 0.5); 
            setTimeout(() => { 
                if (marble.render) { Body.scale(marble, 2, 2); marble.activeEffects.shrink = false; }
            }, 3000);
          }
          
          // MINE ESPLOSIVE RIVOLUZIONARIE
          if (other.label === 'ExplosiveMine') {
              // Applica un'immensa forza repulsiva radiale
              const forceVector = Vector.normalise(Vector.sub(marble.position, other.position));
              const explosionForce = Vector.mult(forceVector, 0.25); // Molto forte
              Body.applyForce(marble, marble.position, explosionForce);
              
              // Cambia colore della mina temporaneamente per "effetto flash"
              if (other.render) {
                  other.render.fillStyle = '#ffffff';
                  setTimeout(() => { if(other.render) other.render.fillStyle = '#ff0000'; }, 200);
              }
          }

          // TELETRASPORTO PORTALI 
          if (other.label === 'Portal_A') {
              if (other.plugin && other.plugin.targetPortal && !marble.activeEffects.teleporting) {
                  marble.activeEffects.teleporting = true; 
                  Body.setPosition(marble, { 
                      x: other.plugin.targetPortal.position.x, 
                      y: other.plugin.targetPortal.position.y + 50 
                  });
                  Body.setVelocity(marble, { x: 0, y: 10 }); // Sputato giù
                  setTimeout(() => { if (marble.render) marble.activeEffects.teleporting = false; }, 1000);
              }
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

    // 8. FORZE GRAVITAZIONALI E PRESSE (Crushers)
    Events.on(engine, 'beforeUpdate', () => {
       const gravityWells = Composite.allBodies(engine.world).filter(b => b.label === 'GravityWell');
       
       matterMarbles.forEach(marble => {
           // Applica buco nero
           gravityWells.forEach(well => {
               const distance = Vector.magnitude(Vector.sub(well.position, marble.position));
               if (distance < well.plugin.radius) { 
                   const forceMagnitude = (well.plugin.radius - distance) * 0.00015; // Più FORTE
                   const forceVector = Vector.normalise(Vector.sub(well.position, marble.position));
                   const appliedForce = Vector.mult(forceVector, forceMagnitude);
                   Body.applyForce(marble, marble.position, appliedForce);
               }
           });
       });

       // Movimenti Macchinari Estremi
       matterObstacles.forEach(obs => {
          if (obs.label === 'MobileObstacle_Rotate') {
              Body.setAngle(obs, obs.angle + obs.plugin.rotationSpeed);
          } else if (obs.label === 'MobileObstacle_Translate') {
              const { startX, range, speed, timeOffset } = obs.plugin;
              const newX = startX + Math.sin(engine.timing.timestamp * speed + timeOffset) * range;
              Body.setPosition(obs, { x: newX, y: obs.position.y });
          } else if (obs.label === 'CrushingJaw') {
              // Movimento orizzontale violento alternato (Presse)
              const { startX, range, speed, timeOffset } = obs.plugin;
              // Si schiantano velocemente
              const t = (engine.timing.timestamp * speed + timeOffset) % Math.PI; // Solo mezza sinusoide (sbattimento)
              const newX = startX + Math.sin(t) * range; 
              Body.setPosition(obs, { x: newX, y: obs.position.y });
          } else if (obs.label === 'GravityWell') {
              // Rotazione Vortice Visivo
              Body.setAngle(obs, obs.angle + 0.08);
          }
       });
    });
    
    // GLOW EFFECT SUI PINBALL
    Events.on(render, 'afterRender', function() {
        var context = render.context;
        const bumpers = Composite.allBodies(engine.world).filter(b => b.label === 'Bumper' || b.label === 'GravityWell');
        
        bumpers.forEach(b => {
            context.beginPath();
            context.arc(b.position.x - render.bounds.min.x, b.position.y - render.bounds.min.y, b.circleRadius || 30, 0, 2 * Math.PI);
            context.lineWidth = 4;
            context.strokeStyle = b.label === 'GravityWell' ? 'rgba(142, 68, 173, 0.5)' : 'rgba(0, 255, 255, 0.7)';
            context.stroke();
            
            // Outer glow
            context.beginPath();
            context.arc(b.position.x - render.bounds.min.x, b.position.y - render.bounds.min.y, (b.circleRadius || 30) + 10, 0, 2 * Math.PI);
            context.lineWidth = 2;
            context.strokeStyle = b.label === 'GravityWell' ? 'rgba(142, 68, 173, 0.2)' : 'rgba(0, 255, 255, 0.3)';
            context.stroke();
        });
    });

    // 9. LOGICA DELLA TELECAMERA - MOVIMENTO VERTICALE PURO
    Events.on(engine, 'beforeUpdate', () => {
      let leaderY = -Infinity;
      matterMarbles.forEach(m => {
        if (m.position.y > leaderY) leaderY = m.position.y;
      });
      
      const targetOffsetY = Math.max(0, leaderY - 200);
      
      // LA CAMERA SCORRE SOLO SULL'ASSE Y. LE LARGHEZZE SONO FISSE A VIRTUAL_WIDTH / HEIGHT.
      Render.lookAt(render, {
        min: { x: 0, y: targetOffsetY },
        max: { x: VIRTUAL_WIDTH, y: targetOffsetY + VIRTUAL_HEIGHT } 
      });
      
      setCameraOffset(targetOffsetY);
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    timeIntervalRef.current = setInterval(() => {
       setElapsedTime(prev => prev + 0.1);
    }, 100);

    return () => {
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
    // IL TRUE CSS ZOOM FIX: margin 0, background nero totale per coprire la pagina.
    <div className="race-wrapper" style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', background: '#000', margin: 0, padding: 0, overflow: 'hidden' }}>
      
      <h1 style={{ position: 'absolute', top: 10, left: 10, color: '#fff', zIndex: 10, fontFamily: 'sans-serif', margin: 0, fontSize: '24px', textShadow: '2px 2px 4px #000' }}>
          Physics Race (Extreme CSS Mode)
      </h1>
      
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '10px' }}>
          {(typeof FullscreenButton !== 'undefined') && <FullscreenButton />}
          <button onClick={handleReturnToMenu} style={btnStyle}>Torna al Menu</button>
      </div>

      {(typeof RaceHUD !== 'undefined') && <div style={{ position:'absolute', top:50, left:10, zIndex: 10 }}>
          <RaceHUD elapsedTime={elapsedTime} leader={leaderFakeObj} />
      </div>}

      <div ref={containerRef} style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
         {/* IL SEGRETO È OBJECT-FIT: COVER e WIDTH 100VW/100VH 
             Il Canvas è generato internamente a 800x1200 logici, ma lo stiriamo con la GPU */}
         <style dangerouslySetInnerHTML={{__html: `
            canvas {
                width: 100vw !important;
                height: 100vh !important;
                object-fit: cover;
                margin: 0;
                padding: 0;
                display: block;
            }
         `}} />
         <canvas ref={canvasRef} />
      </div>

      {winner && (
        <div style={winnerOverlayStyle}>
          <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', textShadow: '3px 3px 6px #000', color: '#ffea00' }}>Vittoria Estrema!</h1>
          <h2 style={{ fontSize: '36px', margin: '0 0 40px 0', textShadow: '2px 2px 4px #000' }}>La biglia &quot;{winner.name || 'Sconosciuta'}&quot; ha dominato!</h2>
          <button onClick={handleReturnToMenu} style={btnStyleLarge}>Torna al menu</button>
        </div>
      )}
    </div>
  );
}

// Zeppe fisse geometriche
function generateWallWedges() {
    const wedges = [];
    const step = 800; 
    for (let y = 600; y < FINISH_LINE; y += step) {
        // Cuneo Sinistro (Triangolo)
        const leftWedge = Bodies.polygon(10, y + (Math.random() * 200), 3, 60, {
            isStatic: true, angle: Math.PI / 2, render: { fillStyle: '#e74c3c' }
        });
        // Cuneo Destro (Triangolo)
        const rightWedge = Bodies.polygon(VIRTUAL_WIDTH - 10, y + (Math.random() * 200), 3, 60, {
            isStatic: true, angle: -Math.PI / 2, render: { fillStyle: '#e74c3c' }
        });
        wedges.push(leftWedge, rightWedge);
    }
    return wedges;
}

// ---------------------------------------------------------
// GENERATORE OSTACOLI ESTREMI ED ESPLOSIVI
// ---------------------------------------------------------
export function generateExtremeObstacles(numberOfBlocks, engine) {
  const { Bodies, Constraint } = Matter;
  const obstacles = [];
  const maxGap = FINISH_LINE / numberOfBlocks;

  let lastPortal = null; 

  for (let i = 0; i < numberOfBlocks; i++) {
    const y = 300 + (i * maxGap) + (Math.random() * maxGap/2);
    const x = Math.random() * (VIRTUAL_WIDTH - 200) + 100; // Compresso più al centro
    
    const randomChoice = Math.random();

    if (randomChoice < 0.15) {
       // 1. PRESSE FRANTUMATRICI (Crushing Jaws)
       // Due blocchi giganti che collidono periodicamente l'uno contro l'altro verso il centro X
       const jawY = y;
       const leftJaw = Bodies.rectangle(300, jawY, 150, 60, {
           isStatic: true, chamfer: { radius: [0, 20, 20, 0] }, label: 'CrushingJaw', render: { fillStyle: '#f39c12' }, 
           plugin: { startX: 100, range: 180, speed: 0.005, timeOffset: 0 } // Move Right
       });
       const rightJaw = Bodies.rectangle(500, jawY, 150, 60, {
           isStatic: true, chamfer: { radius: [20, 0, 0, 20] }, label: 'CrushingJaw', render: { fillStyle: '#f39c12' }, 
           plugin: { startX: 700, range: -180, speed: 0.005, timeOffset: 0 } // Move Left synchronously
       });
       obstacles.push(leftJaw, rightJaw);
       
    } else if (randomChoice < 0.30) {
       // 2. MINE ESPLOSIVE (Explosive Mines)
       const mine = Bodies.circle(x, y, 20, {
           isStatic: true, isSensor: true, // è un innesco
           label: 'ExplosiveMine',
           render: { fillStyle: '#ff0000', strokeStyle: '#fff', lineWidth: 4 } // Rossa accesa
       });
       obstacles.push(mine);

    } else if (randomChoice < 0.40) {
       // 3. PENDOLO DEMOLITORE (Wrecking Ball)
       const anchor = Bodies.circle(x, y, 10, { isStatic: true, render: { fillStyle: '#7f8c8d' } });
       const ball = Bodies.circle(x + 120, y, 40, { 
           restitution: 0.9, density: 0.1, render: { fillStyle: '#2c3e50', strokeStyle: '#e74c3c', lineWidth: 4 } 
       });
       const chain = Constraint.create({ bodyA: anchor, bodyB: ball, length: 150, stiffness: 0.9, render: { strokeStyle: '#95a5a6', lineWidth: 3 } });
       obstacles.push(anchor, ball, chain);
       
    } else if (randomChoice < 0.50) {
       // 4. POZZO GRAVITAZIONALE 
       const influenceRadius = 250;
       const gravityCore = Bodies.polygon(x, y, 6, 25, {
           isStatic: true, isSensor: true, label: 'GravityWell',
           render: { fillStyle: '#8e44ad', strokeStyle: '#ffffff', lineWidth: 2 }, plugin: { radius: influenceRadius } 
       });
       const arm1 = Bodies.polygon(x, y, 3, 60, { isStatic: true, isSensor: true, label: 'GravityWell', render: { fillStyle: 'rgba(155, 89, 182, 0.3)' }});
       const arm2 = Bodies.polygon(x, y, 3, 60, { angle: Math.PI, isStatic: true, isSensor: true, label: 'GravityWell', render: { fillStyle: 'rgba(155, 89, 182, 0.3)' }});
       obstacles.push(gravityCore, arm1, arm2);

    } else if (randomChoice < 0.60) {
       // 5. TELETRASPORTI PORTALI 
       const isPurple = Math.random() > 0.5;
       const color = isPurple ? '#9b59b6' : '#f1c40f'; 
       const portal = Bodies.rectangle(x, y, 120, 20, {
           isStatic: true, isSensor: true, label: 'Portal_A',
           render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 3 }
       });
       if (lastPortal && !lastPortal.plugin.targetPortal) {
           lastPortal.plugin.targetPortal = portal;
           portal.plugin = { targetPortal: lastPortal }; 
       } else {
           portal.plugin = { targetPortal: null }; 
           lastPortal = portal;
       }
       obstacles.push(portal);

    } else if (randomChoice < 0.70) {
       // 6. POWER-UP STRATEGICI
       const isShrink = Math.random() > 0.5;
       const powerColor = isShrink ? '#00e5ff' : '#00ff55';
       const boostPad = Bodies.polygon(x, y, isShrink ? 5 : 8, 25, {
           isSensor: true, isStatic: true, label: isShrink ? 'PowerUp_Shrink' : 'PowerUp_Boost', render: { fillStyle: powerColor } 
       });
       obstacles.push(boostPad);

    } else {
       // 7. NEON BUMPERS (GLOW RINGS)
       const numBumpers = 3 + Math.floor(Math.random() * 2);
       for(let k=0; k<numBumpers; k++) {
           const bumperX = x + (k*70) - ((numBumpers*70)/2);
           const bumper = Bodies.circle(bumperX, y + (Math.random() * 50), 22, {
               isStatic: true, restitution: 1.5, label: 'Bumper',
               render: { fillStyle: '#1a1a2e', strokeStyle: '#00ffff', lineWidth: 2 } // Nero dentro, neon cyan fuori (glow aggiunto nell'hook)
           });
           obstacles.push(bumper);
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
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
  justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 200, 
  animation: 'fadeIn 0.5s', fontFamily: 'sans-serif'
};

export default PhysicsRace;
