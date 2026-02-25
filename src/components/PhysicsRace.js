import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import RaceHUD from './RaceHUD';
import FullscreenButton from './FullscreenButton';
import '../App.css';

const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

const VIRTUAL_WIDTH = 800; 
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
    engine.gravity.y = 1.2; // Forza di gravità
    engineRef.current = engine;

    // 2. Inizializza il Render su Canvas
    const render = Render.create({
      element: containerRef.current,
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: VIRTUAL_WIDTH,
        height: window.innerHeight,
        wireframes: false, // Wireframes disattivato per vedere le texture (colori)
        background: '#1a1a2e' // Sfondo scuro elegante
      }
    });
    renderRef.current = render;

    const world = engine.world;
    
    // 3. Muri laterali per contenere le biglie
    const leftWall = Bodies.rectangle(-25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true });
    const rightWall = Bodies.rectangle(VIRTUAL_WIDTH + 25, FINISH_LINE / 2, 50, FINISH_LINE + 2000, { isStatic: true });
    World.add(world, [leftWall, rightWall]);

    // 4. BIGLIE: Inizializzazione fisica
    const matterMarbles = marbles.map((m, idx) => {
      const radius = MARBLE_SIZE / 2;
      const x = ((idx + 1) * VIRTUAL_WIDTH) / (marbles.length + 1);
      const y = -50 - (Math.random() * 100);
      
      return Bodies.circle(x, y, radius, {
        restitution: 0.6, // Fattore di rimbalzo (bounciness)
        friction: 0.02,
        density: 0.05,
        label: 'Marble',
        render: {
          fillStyle: m.color || '#ff0033', // Usa il colore della biglia o fallback
          sprite: m.image ? { texture: m.image, xScale: radius/64, yScale: radius/64 } : undefined
        },
        plugin: { marbleData: m } // Salva i metadati originali della biglia
      });
    });
    World.add(world, matterMarbles);
    
    // 5. OSTACOLI FISICI (Mobili, Statici, Power-Up, Power-Down)
    const matterObstacles = generateMatterObstacles(100); // 100 ostacoli lungo la discesa
    World.add(world, matterObstacles);
    
    // 6. TRAGUARDO (Sensore per la vittoria)
    const finishSensor = Bodies.rectangle(VIRTUAL_WIDTH / 2, FINISH_LINE, VIRTUAL_WIDTH, 100, {
      isStatic: true, 
      isSensor: true, // Non fa rimbalzare, fa solo scattare l'evento di collisione
      label: 'FinishLine', 
      render: { fillStyle: '#ffd700' } // Dorato
    });
    World.add(world, finishSensor);

    // 7. GESTIONE EVENTI E COLLISIONI
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const isMarbleA = bodyA.label === 'Marble';
        const isMarbleB = bodyB.label === 'Marble';
        
        if (isMarbleA || isMarbleB) {
          const marble = isMarbleA ? bodyA : bodyB;
          const other = isMarbleA ? bodyB : bodyA;
          
          // ESEMPIO A: POWER-UP (Velocità Boost)
          if (other.label === 'PowerUp') {
            Body.setVelocity(marble, { 
                x: marble.velocity.x * 1.5, 
                y: marble.velocity.y > 0 ? marble.velocity.y + 15 : 15 
            });
            Body.setAngularVelocity(marble, marble.angularVelocity * 1.5);
          }
          
          // ESEMPIO B: POWER-DOWN (Trappola rallentante, Mud Trap)
          if (other.label === 'PowerDown') {
            Body.setVelocity(marble, { 
                x: marble.velocity.x * 0.4, 
                y: marble.velocity.y * 0.4 
            });
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

    // 8. OSTACOLI MOBILI (Rotazione Animata Continua)
    Events.on(engine, 'beforeUpdate', () => {
       matterObstacles.forEach(obs => {
          if (obs.label === 'MobileObstacle') {
              // Applica la rotazione continua basata sulla speed configurata
              Body.setAngle(obs, obs.angle + obs.plugin.rotationSpeed);
          }
       });
    });

    // 9. LOGICA DELLA TELECAMERA (Inseguimento biglia in testa)
    Events.on(engine, 'beforeUpdate', () => {
      // Cerca la biglia con la Y più grande (più in basso = più vicina al traguardo)
      let leaderY = -Infinity;
      matterMarbles.forEach(m => {
        if (m.position.y > leaderY) leaderY = m.position.y;
      });
      
      const targetOffset = Math.max(0, leaderY - 200);
      
      // Sposta fisicamente il "mirino" del render di Matter
      Render.lookAt(render, {
        min: { x: 0, y: targetOffset },
        max: { x: VIRTUAL_WIDTH, y: targetOffset + window.innerHeight } // Mantiene la view box scalata fissa
      });
      
      setCameraOffset(targetOffset);
    });

    // Avvio Motore e Render
    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Timer per HUD
    timeIntervalRef.current = setInterval(() => {
       setElapsedTime(prev => prev + 0.1);
    }, 100);

    // Cleanup allo smontaggio del componente
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

  // Otteniamo una finta 'leader' object da passare all'HUD
  const leaderFakeObj = winner || { y: cameraOffset + 200 };

  return (
    <div className="race-wrapper" style={{ position: 'relative', overflow: 'hidden', height: '100vh', width: '100%', background: '#1a1a2e' }}>
      
      {/* Header statico sopra al Canvas */}
      <h1 style={{ position: 'absolute', top: 10, left: 10, color: '#fff', zIndex: 10, fontFamily: 'sans-serif' }}>
          Physics Race (Matter.js)
      </h1>
      
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: '10px' }}>
          {(typeof FullscreenButton !== 'undefined') && <FullscreenButton />}
          <button onClick={handleReturnToMenu} style={btnStyle}>Torna al Menu</button>
      </div>

      {/* Render HUD Component */}
      {(typeof RaceHUD !== 'undefined') && <div style={{ position:'absolute', top:70, left:10, zIndex: 10 }}>
          <RaceHUD elapsedTime={elapsedTime} leader={leaderFakeObj} />
      </div>}

      {/* Container del Canvas Matter.js */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
         <canvas ref={canvasRef} style={{ border: 'none', outline: 'none' }} />
      </div>

      {/* Overlay Vittoria */}
      {winner && (
        <div style={winnerOverlayStyle}>
          <h1 style={{ fontSize: '64px', margin: '0 0 20px 0', textShadow: '2px 2px 4px #000' }}>Vittoria!</h1>
          <h2 style={{ fontSize: '32px', margin: '0 0 30px 0' }}>La biglia &quot;{winner.name || 'Sconosciuta'}&quot; ha dominato!</h2>
          <button onClick={handleReturnToMenu} style={btnStyleLarge}>Torna al menu</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// GENERATORI DI OSTACOLI MATTER.JS
// Questa funzione genera l'array di blocchi fisici Matter.Bodies
// ---------------------------------------------------------
export function generateMatterObstacles(numberOfBlocks) {
  const obstacles = [];
  const maxGap = FINISH_LINE / numberOfBlocks;

  for (let i = 0; i < numberOfBlocks; i++) {
    // Distribuzione verticale lungo il tracciato
    const y = 400 + (i * maxGap) + (Math.random() * maxGap/2);
    const x = Math.random() * (VIRTUAL_WIDTH - 200) + 100;
    
    const randomChoice = Math.random();
    
    // GESTIONE DINAMICA TIPI OSTACOLO

    if (randomChoice < 0.25) {
       // 1. OSTACOLO MOBILE ROTANTE (Elica)
       const length = 150 + Math.random() * 100;
       const spinner = Bodies.rectangle(x, y, length, 25, {
           isStatic: true, // è statico rispetto alla gravità, ma ruota
           label: 'MobileObstacle',
           render: { fillStyle: '#ff4b4b' }, // Rosso
           plugin: { rotationSpeed: 0.05 * (Math.random() > 0.5 ? 1 : -1) } // Senso orario o antiorario
       });
       obstacles.push(spinner);
       
    } else if (randomChoice < 0.40) {
       // 2. POWER-UP (Accelerazione / Boost Pad)
       const boostPad = Bodies.rectangle(x, y, 120, 20, {
           isSensor: true, // Non è un blocco solido
           isStatic: true,
           label: 'PowerUp', 
           render: { fillStyle: '#00ff99' } // Verde acido
       });
       obstacles.push(boostPad);

    } else if (randomChoice < 0.55) {
       // 3. POWER-DOWN (Fanghiglia rallentante)
       const mudTrap = Bodies.rectangle(x, y, 200, 50, {
           isSensor: true, 
           isStatic: true,
           label: 'PowerDown', 
           render: { fillStyle: '#8b4513', opacity: 0.8 } // Marrone
       });
       obstacles.push(mudTrap);
       
    } else if (randomChoice < 0.70) {
       // 4. FLIPPER ZONE (Respingenti tondi sparsi con tanto rimbalzo)
       for(let k=0; k<3; k++) {
           const bumper = Bodies.circle(x + (k*80) - 80, y + (Math.random() * 40), 20, {
               isStatic: true,
               restitution: 1.5, // Rimbalzo estremo (flipper)
               label: 'Bumper',
               render: { fillStyle: '#00ccff' } // Azzurro
           });
           obstacles.push(bumper);
       }
    } else {
       // 5. OSTACOLO STATICO INCLINATO CLASSICO
       const angle = (Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1); // inclinazione
       const block = Bodies.rectangle(x, y, 150 + Math.random()*150, 30, {
           isStatic: true,
           angle: angle,
           render: { fillStyle: '#95a5a6' } // Grigio base
       });
       obstacles.push(block);
    }
  }
  return obstacles;
}

// Stili base integrati
const btnStyle = {
  background: '#33ff99', color: '#1a1a2e', border: 'none', padding: '10px 15px',
  borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
};

const btnStyleLarge = {
  ...btnStyle, padding: '15px 30px', fontSize: '24px'
};

const winnerOverlayStyle = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
  justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 200, animation: 'fadeIn 1s'
};

export default PhysicsRace;
