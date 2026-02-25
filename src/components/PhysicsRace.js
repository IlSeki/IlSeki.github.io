import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import RaceHUD from './RaceHUD';
import FullscreenButton from './FullscreenButton';
import '../App.css';

const { Engine, Render, Runner, World, Bodies, Body, Events, Composite, Constraint, Vector } = Matter;

const VIRTUAL_WIDTH = 800; // La larghezza logica è SEMPRE 800 per mantenere le proporzioni
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

    // 2. Inizializza il Render in modo che si adatti sempre alla VIRTUAL_WIDTH e skippi il bianco
    const render = Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: window.innerWidth, // La larghezza fisica del canvas html
        height: window.innerHeight,
        wireframes: false, 
        background: '#0d0d1a' // Sfondo scuro profondo per lo spazio
      }
    });

    renderRef.current = render;
    const world = engine.world;
    
    // 3. Muri laterali Fissi sulla VIRTUAL_WIDTH
    const leftWall = Bodies.rectangle(-25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    const rightWall = Bodies.rectangle(VIRTUAL_WIDTH + 25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true, render: { fillStyle: '#333' } });
    World.add(world, [leftWall, rightWall]);

    // 4. TRAGUARDO (Sensore per la vittoria)
    const finishSensor = Bodies.rectangle(VIRTUAL_WIDTH / 2, FINISH_LINE, VIRTUAL_WIDTH * 2, 100, {
      isStatic: true, 
      isSensor: true, 
      label: 'FinishLine', 
      render: { fillStyle: '#ffd700' } // Dorato
    });
    World.add(world, finishSensor);

    // Gestione ridimensionamento e Fullscreen ZOOM
    const handleResize = () => {
        if (render.canvas) {
            render.canvas.width = window.innerWidth;
            render.canvas.height = window.innerHeight;
            render.options.width = window.innerWidth;
            render.options.height = window.innerHeight;
            // Il LookAt dinamico farà lo zoom
        }
    };
    window.addEventListener('resize', handleResize);

    // 5. BIGLIE: Inizializzazione fisica
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
    
    // 6. OSTACOLI RIVOLUZIONARI DINAMICI E VARIEGATI
    const matterObstacles = generateRevolutionaryObstacles(120, VIRTUAL_WIDTH, engine); 
    World.add(world, matterObstacles);
    
    const wallWedges = generateWallWedges(VIRTUAL_WIDTH);
    World.add(world, wallWedges);

    // 7. GESTIONE EVENTI E PORTALI
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const isMarbleA = bodyA.label === 'Marble';
        const isMarbleB = bodyB.label === 'Marble';
        
        if (isMarbleA || isMarbleB) {
          const marble = isMarbleA ? bodyA : bodyB;
          const other = isMarbleA ? bodyB : bodyA;
          
          if (!marble.activeEffects) marble.activeEffects = {};

          // POWER-UPS POSITIVI (Mantenuti dal prima come classici boost)
          if (other.label === 'PowerUp_Boost') {
            Body.setVelocity(marble, { 
                x: marble.velocity.x * 1.5, 
                y: marble.velocity.y > 0 ? marble.velocity.y + 15 : 15 
            });
          }
          if (other.label === 'PowerUp_Shrink' && !marble.activeEffects.shrink) {
            marble.activeEffects.shrink = true;
            Body.scale(marble, 0.5, 0.5); 
            setTimeout(() => { 
                if (marble.render) { 
                   Body.scale(marble, 2, 2); 
                   marble.activeEffects.shrink = false; 
                }
            }, 3000);
          }
          
          // TELETRASPORTO PORTALI RIVOLUZIONARIO
          if (other.label === 'Portal_A') {
              if (other.plugin && other.plugin.targetPortal && !marble.activeEffects.teleporting) {
                  marble.activeEffects.teleporting = true; // Cooldown anti-loop
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

    // 8. FORZE GRAVITAZIONALI E VENTO (Gravity Wells e Acceleratori)
    Events.on(engine, 'beforeUpdate', () => {
       // Gravità e Buchi Neri
       const gravityWells = Composite.allBodies(engine.world).filter(b => b.label === 'GravityWell');
       const windTunnels = Composite.allBodies(engine.world).filter(b => b.label === 'WindTunnel');
       
       matterMarbles.forEach(marble => {
           // Applica buco nero
           gravityWells.forEach(well => {
               const distance = Vector.magnitude(Vector.sub(well.position, marble.position));
               if (distance < well.plugin.radius) { // Nel raggio d'azione
                   const forceMagnitude = (well.plugin.radius - distance) * 0.0001; // Forza scalata
                   const forceVector = Vector.normalise(Vector.sub(well.position, marble.position));
                   const appliedForce = Vector.mult(forceVector, forceMagnitude);
                   Body.applyForce(marble, marble.position, appliedForce);
               }
           });
           
           // Applica acceleratore/vento
           windTunnels.forEach(tunnel => {
               const b = tunnel.bounds;
               // Verifica collisione approssimativa AABB (Dentro la zona quadrata del tunnel)
               if (marble.position.x > b.min.x && marble.position.x < b.max.x && 
                   marble.position.y > b.min.y && marble.position.y < b.max.y) {
                    Body.applyForce(marble, marble.position, tunnel.plugin.windForce);
               }
           });
       });

       // Rotazioni continue vecchi ostacoli dinamici
       matterObstacles.forEach(obs => {
          if (obs.label === 'MobileObstacle_Rotate') {
              Body.setAngle(obs, obs.angle + obs.plugin.rotationSpeed);
          } else if (obs.label === 'MobileObstacle_Translate') {
              const { startX, range, speed, timeOffset } = obs.plugin;
              const newX = startX + Math.sin(engine.timing.timestamp * speed + timeOffset) * range;
              Body.setPosition(obs, { x: newX, y: obs.position.y });
          } else if (obs.label === 'MobileObstacle_Piston') {
              const { startY, range, speed, timeOffset } = obs.plugin;
              const newY = startY + Math.sin(engine.timing.timestamp * speed + timeOffset) * range;
              Body.setPosition(obs, { x: obs.position.x, y: newY });
          } else if (obs.label === 'GravityWell') {
              // Fanno ruotare la loro texture per renderli visivamente dei "vortici"
              Body.setAngle(obs, obs.angle + 0.05);
          }
       });
    });

    // 9. LOGICA DELLA TELECAMERA - ZOOM RATIO CORRETTA
    Events.on(engine, 'beforeUpdate', () => {
      let leaderY = -Infinity;
      matterMarbles.forEach(m => {
        if (m.position.y > leaderY) leaderY = m.position.y;
      });
      
      const targetOffsetY = Math.max(0, leaderY - 200);
      
      // Calcola l'aspect ratio dello schermo attuale
      const ratio = window.innerHeight / window.innerWidth;
      // Poiché la nostra larghezza virtuale fissa è 800, la nostra altezza virtuale di visione deve essere 800 * ratio
      const virtualHeight = VIRTUAL_WIDTH * ratio;

      // Forza la telecamera a inquadrare *esattamente* i bordi 0->800 X, e calcola l'altezza per farne lo Zoom.
      Render.lookAt(render, {
        min: { x: 0, y: targetOffsetY },
        max: { x: VIRTUAL_WIDTH, y: targetOffsetY + virtualHeight } 
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
    <div className="race-wrapper" style={{ position: 'relative', overflow: 'hidden', height: '100vh', width: '100vw', background: '#0d0d1a' }}>
      
      <h1 style={{ position: 'absolute', top: 10, left: 10, color: '#fff', zIndex: 10, fontFamily: 'sans-serif', margin: 0, fontSize: '24px', textShadow: '2px 2px 4px #000' }}>
          Physics Race (Revolutionary 3D)
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

// Zeppe fisse geometriche
function generateWallWedges(mapWidth) {
    const wedges = [];
    const step = 800; // Un cuneo ogni 800px per lato
    for (let y = 600; y < FINISH_LINE; y += step) {
        // Cuneo Sinistro (Triangolo)
        const leftWedge = Bodies.polygon(10, y + (Math.random() * 200), 3, 60, {
            isStatic: true,
            angle: Math.PI / 2, 
            render: { fillStyle: '#e74c3c' }
        });
        // Cuneo Destro (Triangolo)
        const rightWedge = Bodies.polygon(mapWidth - 10, y + (Math.random() * 200), 3, 60, {
            isStatic: true,
            angle: -Math.PI / 2, 
            render: { fillStyle: '#e74c3c' }
        });
        wedges.push(leftWedge, rightWedge);
    }
    return wedges;
}

// ---------------------------------------------------------
// GENERATORE OSTACOLI RIVOLUZIONARI E MECCANICHE
// ---------------------------------------------------------
export function generateRevolutionaryObstacles(numberOfBlocks, mapWidth, engine) {
  const { Bodies, Constraint, Composite } = Matter;
  const obstacles = [];
  const maxGap = FINISH_LINE / numberOfBlocks;

  let lastPortal = null; // Collegamento portali

  for (let i = 0; i < numberOfBlocks; i++) {
    const y = 300 + (i * maxGap) + (Math.random() * maxGap/2);
    const x = Math.random() * (mapWidth - 100) + 50;
    
    const randomChoice = Math.random();

    if (randomChoice < 0.15) {
       // 1. PENDOLO / SFERA DEMOLITRICE (Wrecking Ball)
       const anchor = Bodies.circle(x, y, 10, { isStatic: true, render: { fillStyle: '#7f8c8d' } });
       // La palla cade da un lato per farle prendere spinta (x + 150)
       const ball = Bodies.circle(x + 120, y, 40, { 
           restitution: 0.9, 
           density: 0.1, // Molto pesante 
           render: { fillStyle: '#2c3e50', strokeStyle: '#e74c3c', lineWidth: 4 } // Grigio / Rosso
       });
       const chain = Constraint.create({
           bodyA: anchor, bodyB: ball, length: 150, stiffness: 0.9,
           render: { strokeStyle: '#95a5a6', lineWidth: 3 }
       });
       obstacles.push(anchor, ball, chain);
       
    } else if (randomChoice < 0.25) {
       // 2. POZZO GRAVITAZIONALE (Buco Nero - Invisible Center Sensor)
       const influenceRadius = 250;
       const gravityCore = Bodies.polygon(x, y, 6, 25, {
           isStatic: true, 
           isSensor: true, // Le biglie ci passano attraverso ma vengono deviate
           label: 'GravityWell',
           render: { fillStyle: '#8e44ad', strokeStyle: '#ffffff', lineWidth: 2 }, // Nucleo viola brillante
           plugin: { radius: influenceRadius } 
       });
       // Crea visualmente dei "bracci" a spirale
       const arm1 = Bodies.polygon(x, y, 3, 60, { isStatic: true, isSensor: true, label: 'GravityWell', render: { fillStyle: 'rgba(155, 89, 182, 0.3)' }});
       const arm2 = Bodies.polygon(x, y, 3, 60, { angle: Math.PI, isStatic: true, isSensor: true, label: 'GravityWell', render: { fillStyle: 'rgba(155, 89, 182, 0.3)' }});
       obstacles.push(gravityCore, arm1, arm2);

    } else if (randomChoice < 0.35) {
       // 3. TELETRASPORTI PORTALI (Coppie)
       const isPurple = Math.random() > 0.5;
       const color = isPurple ? '#9b59b6' : '#f1c40f'; // Viola o Giallo oro
       const portal = Bodies.rectangle(x, y, 120, 20, {
           isStatic: true, isSensor: true, label: 'Portal_A',
           render: { fillStyle: color, strokeStyle: '#fff', lineWidth: 3 }
       });
       if (lastPortal && !lastPortal.plugin.targetPortal) {
           // Connette a quello prima
           lastPortal.plugin.targetPortal = portal;
           portal.plugin = { targetPortal: lastPortal }; // Bidirezionale
       } else {
           portal.plugin = { targetPortal: null }; // Aspetta il prossimo
           lastPortal = portal;
       }
       obstacles.push(portal);

    } else if (randomChoice < 0.45) {
       // 4. ACCELERATORI / WIND TUNNELS
       const forceX = (Math.random() > 0.5 ? 1 : -1) * 0.005; // Spinge di lato fortissimo
       const forceY = -0.005; // Oppure in alto (contro gravità)
       const windTunnel = Bodies.rectangle(x, y, 150, 100, {
           isStatic: true, isSensor: true, label: 'WindTunnel',
           render: { fillStyle: 'rgba(52, 152, 219, 0.2)', strokeStyle: '#3498db', lineWidth: 1 }, 
           plugin: { windForce: { x: forceX, y: forceY } } // Il vettore della forza del vento
       });
       obstacles.push(windTunnel);

    } else if (randomChoice < 0.60) {
       // 5. OSTACOLO ROTANTE 3D PURO O SCIVOLO (Mantenuti per varietà)
       const spinner = Bodies.polygon(x, y, 5, 40 + Math.random() * 30, {
           isStatic: true, 
           label: 'MobileObstacle_Rotate',
           render: { fillStyle: '#1abc9c' }, // Turchese
           plugin: { rotationSpeed: 0.05 * (Math.random() > 0.5 ? 1 : -1) } 
       });
       obstacles.push(spinner);
       
    } else if (randomChoice < 0.70) {
       // 6. PIATTAFORMA TRASLANTE (Oscilla Orizzontalmente)
       const len = 150 + Math.random() * 100;
       const slider = Bodies.rectangle(x, y, len, 25, {
           isStatic: true, chamfer: { radius: 10 },
           label: 'MobileObstacle_Translate',
           render: { fillStyle: '#e67e22' }, 
           plugin: { startX: x, range: 100 + Math.random()*100, speed: 0.002 + Math.random()*0.002, timeOffset: Math.random() * 100 }
       });
       obstacles.push(slider);

    } else {
       // 7. OSTACOLO STATICO COMPLESSO (Trapezoidi asimmetrici o Flipper)
       if (Math.random() > 0.5) {
           const trapezoid = Bodies.trapezoid(x, y, 100 + Math.random()*150, 40, 0.2 + Math.random()*0.8, {
               isStatic: true, angle: (Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
               render: { fillStyle: '#bdc3c7' } 
           });
           obstacles.push(trapezoid);
       } else {
           // Piccola Flipper zone
           for(let k=0; k<2; k++) {
               const bumperX = x + (k*80) - 40;
               const bumper = Bodies.circle(bumperX, y + (Math.random() * 40), 22, {
                   isStatic: true, restitution: 1.5, label: 'Bumper',
                   render: { fillStyle: '#ff0055', strokeStyle: '#ffffff', lineWidth: 3 } 
               });
               obstacles.push(bumper);
           }
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
