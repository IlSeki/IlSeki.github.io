"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store";
import { usePhysicsLoop } from "@/hooks/usePhysicsLoop";
import { useAudio } from "@/hooks/useAudio";
import { generateCourse } from "@/engine/course/CourseGenerator";
import { PhysicsEngine } from "@/engine/physics/PhysicsEngine";
import { createMarbleBody } from "@/engine/physics/MarbleBody";
import { createObstacleBody } from "@/engine/obstacles";
import { setupCollisionHandler } from "@/engine/physics/CollisionHandler";
import { applyPowerup, removePowerup, applyDebuff, removeDebuff, CATEGORIES } from "@/engine/powerups";
import { 
  CANVAS_WIDTH, 
  COURSE_HEIGHT, 
  VIEWPORT_HEIGHT, 
  PHYSICS, 
  TIMING,
  SECTION_HEIGHT 
} from "@/config/constants";
import Matter from "matter-js";

interface ImpactFlash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  color: string;
  size: number;
  opacity: number;
  isSpecial: boolean;
}

/**
 * Main game simulation component. Operates Matter.js physics in an off-React loop,
 * maps coordinates to a smooth scrolling viewport, and draws the entire canvas.
 */
export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<PhysicsEngine | null>(null);
  
  const marbles = useGameStore((state) => state.marbles);
  const seed = useGameStore((state) => state.seed);
  const chaosMode = useGameStore((state) => state.chaosMode);
  const phase = useGameStore((state) => state.phase);
  
  const updateMarbleState = useGameStore((state) => state.updateMarbleState);
  const finishMarble = useGameStore((state) => state.finishMarble);
  const setElapsedMs = useGameStore((state) => state.setElapsedMs);
  const endRace = useGameStore((state) => state.endRace);
  
  const { audioEngine } = useAudio();
  
  // Local references to maintain state without triggering React re-renders
  const marbleBodiesRef = useRef<Map<string, Matter.Body>>(new Map());
  const collectibleBodiesRef = useRef<Map<string, Matter.Body>>(new Map());
  const activeEffectsRef = useRef<Map<string, { powerups: Map<string, number>; debuffs: Map<string, number> }>>(new Map());
  
  const [cameraY, setCameraY] = useState(0);
  const cameraYRef = useRef(0);
  
  // Graphical particle effects
  const impactFlashesRef = useRef<ImpactFlash[]>([]);
  const backgroundStarsRef = useRef<Star[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Helper to spawn a floating neon text label
  const spawnBrainrotText = (x: number, y: number, word?: string, isSpecial: boolean = false) => {
    const words = [
      "SIGMA", "GYATT", "HAWK TUAH", "RIZZ", "SKIBIDI", 
      "MOGGED", "FANUM TAX", "OHIO", "MEWING", "EDGE", 
      "CHAD", "SUS", "ALPHA", "WOP WOP", "BOP", "GOBLIN MODE"
    ];
    const text = word || words[Math.floor(Math.random() * words.length)];
    const colors = ["#ff2d78", "#39ff14", "#00f5ff", "#ffe600", "#ff7700", "#bf5fff"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -0.8 - Math.random() * 1.0, // drift upwards slower
      angle: (Math.random() - 0.5) * 0.3,
      vAngle: (Math.random() - 0.5) * 0.02,
      color,
      size: isSpecial ? 22 + Math.random() * 8 : 12 + Math.random() * 6,
      opacity: 1.0,
      isSpecial
    });
  };
  
  // Throttle timer for Zustand updates
  const lastStateSyncRef = useRef(0);

  // Generate procedural stars for the race track background
  useEffect(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * COURSE_HEIGHT,
        size: 0.5 + Math.random() * 2,
        opacity: 0.1 + Math.random() * 0.7
      });
    }
    backgroundStarsRef.current = stars;
  }, []);

  // Initialize Physics Engine and build the course
  useEffect(() => {
    if (phase !== "racing") return;

    // Reset local caches
    marbleBodiesRef.current.clear();
    collectibleBodiesRef.current.clear();
    activeEffectsRef.current.clear();
    impactFlashesRef.current = [];
    floatingTextsRef.current = [];
    cameraYRef.current = 0;
    setCameraY(0);

    const physics = new PhysicsEngine();
    physicsRef.current = physics;

    // 1. Build boundary walls
    const leftWall = Matter.Bodies.rectangle(10, COURSE_HEIGHT / 2, 20, COURSE_HEIGHT, {
      isStatic: true,
      restitution: PHYSICS.wallRestitution,
      friction: 0.05,
      label: "wall"
    });
    leftWall.collisionFilter.category = CATEGORIES.wall;

    const rightWall = Matter.Bodies.rectangle(CANVAS_WIDTH - 10, COURSE_HEIGHT / 2, 20, COURSE_HEIGHT, {
      isStatic: true,
      restitution: PHYSICS.wallRestitution,
      friction: 0.05,
      label: "wall"
    });
    rightWall.collisionFilter.category = CATEGORIES.wall;

    const topWall = Matter.Bodies.rectangle(CANVAS_WIDTH / 2, 5, CANVAS_WIDTH, 10, {
      isStatic: true,
      label: "wall"
    });
    topWall.collisionFilter.category = CATEGORIES.wall;

    physics.addBody([leftWall, rightWall, topWall]);

    // 2. Generate Course Sections using seed
    const sections = generateCourse(seed, chaosMode);

    sections.forEach((section) => {
      // Add obstacles
      section.obstacles.forEach((obs) => {
        const bodies = createObstacleBody(obs);
        if (Array.isArray(bodies)) {
          bodies.forEach((b) => {
            b.collisionFilter.category = CATEGORIES.obstacle;
            physics.addBody(b);
          });
        } else {
          bodies.collisionFilter.category = CATEGORIES.obstacle;
          physics.addBody(bodies);
        }
      });

      // Add collectibles
      section.collectibles.forEach((col) => {
        const body = Matter.Bodies.circle(col.x, col.y, 14, {
          isStatic: true,
          isSensor: true,
          label: `collectible_${col.kind}`
        });
        body.plugin = {
          id: col.id,
          type: "collectible",
          kind: col.kind, // "powerup" | "debuff"
          collectType: col.type // e.g. "turbo"
        };
        body.collisionFilter.category = CATEGORIES.collectible;
        physics.addBody(body);
        collectibleBodiesRef.current.set(col.id, body);
      });
    });

    // 3. Place Marbles spaced out at the starting gate
    const initialMarbles = useGameStore.getState().marbles;
    const spacing = (CANVAS_WIDTH - 160) / (initialMarbles.length - 1 || 1);
    initialMarbles.forEach((m, idx) => {
      const x = initialMarbles.length === 1 ? CANVAS_WIDTH / 2 : 80 + idx * spacing;
      const y = 60;
      const body = createMarbleBody(m, x, y);
      body.collisionFilter.category = CATEGORIES.marble;
      body.collisionFilter.mask = 
        CATEGORIES.default | CATEGORIES.obstacle | CATEGORIES.wall | CATEGORIES.collectible;
      physics.addBody(body);
      marbleBodiesRef.current.set(m.id, body);
      activeEffectsRef.current.set(m.id, { powerups: new Map(), debuffs: new Map() });
    });

    // 4. Hook up the Collision handler
    setupCollisionHandler(
      physics,
      audioEngine,
      // Handle collection
      (marbleId, colId, kind, colType) => {
        const colBody = collectibleBodiesRef.current.get(colId);
        if (!colBody) return;

        // Play feedback sounds
        if (kind === "powerup") {
          audioEngine.playPowerup(colType as any);
        } else {
          audioEngine.playDebuff(colType as any);
        }

        // Apply visual flash
        impactFlashesRef.current.push({
          x: colBody.position.x,
          y: colBody.position.y,
          radius: 10,
          maxRadius: 45,
          opacity: 1.0
        });

        // Spawn floating text on collect!
        spawnBrainrotText(
          colBody.position.x,
          colBody.position.y,
          colType === "turbo" ? "MAX RIZZ!" : colType.toUpperCase() + "!"
        );

        // Delete collectible body from simulation
        physics.removeBody(colBody);
        collectibleBodiesRef.current.delete(colId);

        // Fetch target marble body
        const marbleBody = marbleBodiesRef.current.get(marbleId);
        if (!marbleBody) return;

        const effectRef = activeEffectsRef.current.get(marbleId);
        if (!effectRef) return;

        if (kind === "powerup") {
          // Check for existing matching powerup to refresh duration
          const duration = colType === "jumpPad" ? 0 : 5000; // instant or 5 seconds
          applyPowerup(colType as any, marbleBody, physics);
          
          if (duration > 0) {
            effectRef.powerups.set(colType, duration);
            updateMarbleState(marbleId, {
              activePowerup: { type: colType as any, remainingMs: duration }
            });
          }
        } else {
          // Apply debuff (checking for shields internally)
          const applied = applyDebuff(colType as any, marbleBody, physics);
          if (applied) {
            const duration = colType === "freeze" ? 1500 : 5000;
            effectRef.debuffs.set(colType, duration);
            updateMarbleState(marbleId, {
              activeDebuff: { type: colType as any, remainingMs: duration }
            });
          } else {
            // Blocked by shield: visual shield pop flash
            impactFlashesRef.current.push({
              x: marbleBody.position.x,
              y: marbleBody.position.y,
              radius: 15,
              maxRadius: 55,
              opacity: 0.9
            });
            // Spawn blocked floating text
            spawnBrainrotText(marbleBody.position.x, marbleBody.position.y, "MOGGED!");
            updateMarbleState(marbleId, { activePowerup: undefined });
          }
        }
      },
      // Handle Warp Portal teleport
      (marbleId, targetX, targetY) => {
        const body = marbleBodiesRef.current.get(marbleId);
        if (!body) return;

        // Teleport body coordinates
        Matter.Body.setPosition(body, { x: targetX, y: targetY });
        Matter.Body.setVelocity(body, { x: 0, y: 3 });
        audioEngine.playWarp();

        impactFlashesRef.current.push({
          x: targetX,
          y: targetY,
          radius: 8,
          maxRadius: 40,
          opacity: 1.0
        });

        // Spawn warp text
        spawnBrainrotText(targetX, targetY, "PORTAL RIZZ!");
      },
      // Handle general collision (pegs, bumpers, trampolines, etc.)
      (x, y, label) => {
        if (label === "bumper") {
          spawnBrainrotText(x, y, Math.random() < 0.5 ? "GYATT" : "BUMPER");
        } else if (label === "trampoline") {
          spawnBrainrotText(x, y, "BOING");
        } else {
          // General collisions spawn random brainrot words with a lower probability to avoid cluttering
          if (Math.random() < 0.22) {
            spawnBrainrotText(x, y);
          }
        }
      }
    );

    return () => {
      physics.clear();
      physicsRef.current = null;
    };
  }, [phase, seed, updateMarbleState, audioEngine, chaosMode]);

  // Main frame step runner
  usePhysicsLoop(phase === "racing", (delta) => {
    const physics = physicsRef.current;
    if (!physics) return;

    // 1. Advance simulation
    physics.step(delta);

    // Get current elapsed time from store and advance
    const currentElapsed = useGameStore.getState().elapsedMs;
    const nextElapsed = currentElapsed + delta;
    setElapsedMs(nextElapsed);

    // 2. Loop timers on active powerups/debuffs
    marbleBodiesRef.current.forEach((body, marbleId) => {
      const effectRef = activeEffectsRef.current.get(marbleId);
      if (!effectRef) return;

      // Update Powerups
      effectRef.powerups.forEach((remaining, type) => {
        const nextRemaining = remaining - delta;
        if (nextRemaining <= 0) {
          removePowerup(type as any, body, physics);
          effectRef.powerups.delete(type);
          updateMarbleState(marbleId, { activePowerup: undefined });
        } else {
          effectRef.powerups.set(type, nextRemaining);
          updateMarbleState(marbleId, {
            activePowerup: { type: type as any, remainingMs: nextRemaining }
          });
        }
      });

      // Update Debuffs
      effectRef.debuffs.forEach((remaining, type) => {
        const nextRemaining = remaining - delta;
        if (nextRemaining <= 0) {
          removeDebuff(type as any, body, physics);
          effectRef.debuffs.delete(type);
          updateMarbleState(marbleId, { activeDebuff: undefined });
        } else {
          effectRef.debuffs.set(type, nextRemaining);
          updateMarbleState(marbleId, {
            activeDebuff: { type: type as any, remainingMs: nextRemaining }
          });
        }
      });

      // Anti-stuck checking:
      // 1. Check speed-based stuck state
      const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
      const isFinishGate = body.position.y >= COURSE_HEIGHT - 40;

      if (speed < TIMING.stuckVelocity && !isFinishGate) {
        body.plugin.stuckTimer = (body.plugin.stuckTimer || 0) + delta;
      } else {
        body.plugin.stuckTimer = 0;
      }

      // 2. Check position progress-based stuck state (detects high-speed bounce trapping)
      const lastY = body.plugin.lastY ?? body.position.y;
      const yDiff = body.position.y - lastY;
      
      if (yDiff < 10 && !isFinishGate) {
        body.plugin.progressTimer = (body.plugin.progressTimer || 0) + delta;
      } else {
        body.plugin.progressTimer = 0;
        body.plugin.lastY = body.position.y;
      }

      // Explosive breakout if stuck by speed or lack of vertical progress
      if ((body.plugin.stuckTimer > 2500 || body.plugin.progressTimer > 2500) && !isFinishGate) {
        // Check if we are near a magnet or tornado (black holes)
        let nearBlackHole = false;
        let blackHoleBody: Matter.Body | null = null;
        
        const worldBodies = Matter.Composite.allBodies(physics.world);
        for (const other of worldBodies) {
          if (other.isStatic && (other.label === "magnet" || other.label === "tornado")) {
            const radius = other.plugin?.radius || 90;
            const dx = body.position.x - other.position.x;
            const dy = body.position.y - other.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius + 20) {
              nearBlackHole = true;
              blackHoleBody = other;
              break;
            }
          }
        }

        if (nearBlackHole && blackHoleBody) {
          // Teleport slightly below the black hole center to guarantee it gets free!
          const newY = Math.min(blackHoleBody.position.y + 110, COURSE_HEIGHT - 60);
          const newX = Math.max(40, Math.min(body.position.x, CANVAS_WIDTH - 40));
          Matter.Body.setPosition(body, { x: newX, y: newY });
          Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: 5 });
          
          impactFlashesRef.current.push({
            x: newX,
            y: newY,
            radius: 18,
            maxRadius: 75,
            opacity: 1.0
          });

          spawnBrainrotText(newX, newY, "BLACK HOLE ESCAPE!", true);
          audioEngine.playSigma();
        } else {
          // Break out using high velocity/force blast at the current position, rather than teleporting far away
          const dirX = Math.random() > 0.5 ? 1 : -1;
          const forceX = dirX * 0.18 * body.mass;
          const forceY = -0.15 * body.mass;
          Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
          Matter.Body.setVelocity(body, { x: dirX * 12, y: -10 });

          impactFlashesRef.current.push({
            x: body.position.x,
            y: body.position.y,
            radius: 15,
            maxRadius: 65,
            opacity: 1.0
          });

          // Spawn a big stuck-blast floating text
          const stuckPhrases = ["GYATT BLAST!", "SKIBIDI BREAKOUT!", "OHIO BURST!", "RIZZ BLAST!", "SIGMA FORCE!"];
          const phrase = stuckPhrases[Math.floor(Math.random() * stuckPhrases.length)];
          spawnBrainrotText(body.position.x, body.position.y, phrase, true);

          audioEngine.playGyatt();
        }

        body.plugin.stuckTimer = 0;
        body.plugin.progressTimer = 0;
        body.plugin.lastY = body.position.y;
      }

      // Check finish line crossing
      if (body.position.y >= COURSE_HEIGHT - 30 && !body.isStatic && !useGameStore.getState().marbles.find(m => m.id === marbleId)?.finishTime) {
        // Freeze body, flag completed
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setStatic(body, true);
        
        finishMarble(marbleId, nextElapsed);
        
        // Play rank audio fanfare
        const finishedCount = useGameStore.getState().marbles.filter(m => m.finishTime !== undefined).length;
        audioEngine.playFinish(finishedCount);
      }
    });

    // 3. Coordinate Camera Scroll Viewport Y Offset
    let leadingY = 0;
    let finishedAll = true;

    marbleBodiesRef.current.forEach((body, id) => {
      const marble = useGameStore.getState().marbles.find((m) => m.id === id);
      if (!marble) return;

      if (!marble.finishTime) {
        finishedAll = false;
        if (body.position.y > leadingY) {
          leadingY = body.position.y;
        }
      }
    });

    // Scroll camera viewport relative to leader
    if (!finishedAll && leadingY > VIEWPORT_HEIGHT * 0.3) {
      const targetCamY = leadingY - VIEWPORT_HEIGHT * 0.3;
      // Interpolate camera scroll for smooth movement
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.08;
      const boundedCamY = Math.max(0, Math.min(cameraYRef.current, COURSE_HEIGHT - VIEWPORT_HEIGHT));
      cameraYRef.current = boundedCamY;
      setCameraY(boundedCamY);
    }

    // Check race completion
    const raceMarbles = useGameStore.getState().marbles;
    const allFinished = raceMarbles.length > 0 && raceMarbles.every((m) => m.finishTime !== undefined);
    const timeoutExpired = nextElapsed > 600000; // 10 minutes timeout limit

    if (allFinished || timeoutExpired) {
      endRace();
    }

    // 4. Update coordinates state in Zustand store (throttled to 100ms for performance)
    const now = performance.now();
    if (now - lastStateSyncRef.current > 100) {
      marbleBodiesRef.current.forEach((body, id) => {
        const vel = body.velocity;
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        const stateMarble = useGameStore.getState().marbles.find((m) => m.id === id);
        
        if (stateMarble) {
          // Update trail history (max 10 coordinates)
          const trail = [...stateMarble.trailPositions, { x: body.position.x, y: body.position.y }];
          if (trail.length > 10) trail.shift();

          updateMarbleState(id, {
            position: body.position.y,
            trailPositions: trail,
            isStuck: speed < 0.25 && body.position.y < COURSE_HEIGHT - 45
          });
        }
      });
      lastStateSyncRef.current = now;
    }

    // 5. Draw Canvas elements
    drawCanvas();
  });

  // Main 2D Canvas Drawing function
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const physics = physicsRef.current;
    if (!physics) return;

    const offset = cameraYRef.current;

    // Clear buffer
    ctx.clearRect(0, 0, CANVAS_WIDTH, VIEWPORT_HEIGHT);

    // Sfondo: Dark cosmic background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, VIEWPORT_HEIGHT);
    bgGrad.addColorStop(0, "#06060c");
    bgGrad.addColorStop(1, "#0a0a15");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, VIEWPORT_HEIGHT);

    // Draw background star particles in camera viewport frame
    backgroundStarsRef.current.forEach((star) => {
      const relativeY = star.y - offset;
      if (relativeY >= 0 && relativeY <= VIEWPORT_HEIGHT) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, relativeY, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw start line
    const relativeStartLine = 120 - offset;
    if (relativeStartLine >= 0 && relativeStartLine <= VIEWPORT_HEIGHT) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.moveTo(20, relativeStartLine);
      ctx.lineTo(CANVAS_WIDTH - 20, relativeStartLine);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "black 12px 'Space Grotesk'";
      ctx.textAlign = "center";
      ctx.fillText("STARTING GATE", CANVAS_WIDTH / 2, relativeStartLine - 15);
    }

    // Draw finish line
    const relativeFinishLine = (COURSE_HEIGHT - 30) - offset;
    if (relativeFinishLine >= 0 && relativeFinishLine <= VIEWPORT_HEIGHT) {
      ctx.strokeStyle = "#ff2d78";
      ctx.lineWidth = 6;
      ctx.shadowColor = "#ff2d78";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(20, relativeFinishLine);
      ctx.lineTo(CANVAS_WIDTH - 20, relativeFinishLine);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      ctx.fillStyle = "#ff2d78";
      ctx.font = "bold 14px 'Space Grotesk'";
      ctx.textAlign = "center";
      ctx.fillText("🏁 FINISH LINE 🏁", CANVAS_WIDTH / 2, relativeFinishLine - 15);
    }

    // Draw physical static bodies (obstacles/walls)
    const bodies = Matter.Composite.allBodies(physics.world);
    bodies.forEach((body) => {
      if (body.isStatic && body.label !== "wall") {
        const type = body.plugin?.type;
        const relativeY = body.position.y - offset;

        // Skip drawing if outside camera boundary
        const boundingRadius = body.circleRadius || 100; // default margin
        if (relativeY + boundingRadius < -50 || relativeY - boundingRadius > VIEWPORT_HEIGHT + 50) {
          return;
        }

        ctx.save();
        ctx.translate(body.position.x, relativeY);
        ctx.rotate(body.angle);

        // Render based on obstacle type
        if (body.label === "peg") {
          const size = body.plugin?.options?.size || 30;
          ctx.fillStyle = "#ff2d78";
          ctx.shadowColor = "#ff2d78";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          // Equilateral triangle
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.closePath();
          ctx.fill();
        } else if (body.label === "bumper") {
          const radius = body.circleRadius || 25;
          const pulse = 1 + 0.12 * Math.sin(performance.now() / 150);
          ctx.fillStyle = "#39ff14";
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 12 * pulse;
          ctx.beginPath();
          ctx.arc(0, 0, radius * (1 + 0.05 * Math.sin(performance.now() / 150)), 0, Math.PI * 2);
          ctx.fill();
        } else if (body.label?.startsWith("funnel")) {
          // Draw rectangle funnel plates
          ctx.fillStyle = "#00f5ff";
          ctx.shadowColor = "#00f5ff";
          ctx.shadowBlur = 5;
          const w = body.plugin?.width || body.plugin?.options?.width || 120;
          const h = body.plugin?.height || body.plugin?.options?.height || 18;
          ctx.fillRect(-w/2, -h/2, w, h);
        } else if (body.label === "rotatingPaddle") {
          const w = body.plugin?.width || body.plugin?.options?.width || 120;
          const h = body.plugin?.height || body.plugin?.options?.height || 15;
          ctx.fillStyle = "#ffe600";
          ctx.shadowColor = "#ffe600";
          ctx.shadowBlur = 8;
          ctx.fillRect(-w/2, -h/2, w, h);
        } else if (body.label === "flipper") {
          const w = body.plugin?.width || body.plugin?.options?.width || 80;
          const h = body.plugin?.height || body.plugin?.options?.height || 18;
          ctx.fillStyle = "#00f5ff";
          ctx.shadowColor = "#00f5ff";
          ctx.shadowBlur = 8;
          ctx.fillRect(-w/2, -h/2, w, h);
        } else if (body.label === "trapdoor") {
          const w = body.plugin?.width || body.plugin?.options?.width || 100;
          const h = body.plugin?.height || body.plugin?.options?.height || 18;
          ctx.fillStyle = "#bf5fff";
          ctx.shadowColor = "#bf5fff";
          ctx.shadowBlur = 6;
          ctx.fillRect(-w/2, -h/2, w, h);
        } else if (body.label === "trampoline") {
          const w = body.plugin?.width || body.plugin?.options?.width || 100;
          const h = body.plugin?.height || body.plugin?.options?.height || 15;
          ctx.fillStyle = "#ffe600";
          ctx.shadowColor = "#ffe600";
          ctx.shadowBlur = 15;
          ctx.fillRect(-w/2, -h/2, w, h);
          // Spring detail lines
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let sx = -w/2; sx <= w/2; sx += 10) {
            ctx.moveTo(sx, h/2);
            ctx.lineTo(sx, h/2 + 5);
          }
          ctx.stroke();
        } else if (body.label === "maze_wall" || body.label === "spiral_slide_segment") {
          ctx.fillStyle = "#00f5ff";
          ctx.shadowColor = "#00f5ff";
          ctx.shadowBlur = 4;
          const w = body.plugin?.width || 45;
          const h = body.plugin?.height || 18;
          ctx.fillRect(-w/2, -h/2, w, h);
        } else if (body.label === "magnet") {
          // Magnet zone
          const r = body.plugin?.radius || 80;
          ctx.fillStyle = "rgba(191, 95, 255, 0.02)";
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Pulsating wave rings moving inwards
          const time = (performance.now() / 1000) % 1.0;
          ctx.strokeStyle = "rgba(191, 95, 255, 0.4)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#bf5fff";
          ctx.shadowBlur = 4;
          for (let j = 0; j < 3; j++) {
            const waveProgress = (time + j / 3) % 1.0;
            const waveR = r * (1 - waveProgress);
            ctx.beginPath();
            ctx.arc(0, 0, waveR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Draw core magnet point
          ctx.fillStyle = "#bf5fff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 12 + 2 * Math.sin(performance.now() / 150), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (body.label === "tornado") {
          const r = body.plugin?.radius || 90;
          ctx.fillStyle = "rgba(57, 255, 20, 0.03)";
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Rotating spiral wind lines
          const time = performance.now() / 200;
          ctx.strokeStyle = "rgba(57, 255, 20, 0.45)";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#39ff14";
          ctx.shadowBlur = 6;
          for (let s = 0; s < 3; s++) {
            ctx.beginPath();
            const startAngle = time + (s * Math.PI * 2) / 3;
            for (let d = 0; d < r; d += 2) {
              const theta = startAngle + d * 0.05;
              const radialDist = r - d;
              if (radialDist <= 0) break;
              const sx = radialDist * Math.cos(theta);
              const sy = radialDist * Math.sin(theta);
              if (d === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        } else if (body.label === "fan") {
          const w = body.plugin?.width || 120;
          const h = body.plugin?.height || 120;
          const dir = body.plugin?.options?.direction || "right";
          
          ctx.fillStyle = "rgba(0, 245, 255, 0.02)";
          ctx.fillRect(-w/2, -h/2, w, h);
          ctx.strokeStyle = "rgba(0, 245, 255, 0.12)";
          ctx.strokeRect(-w/2, -h/2, w, h);

          // Sliding wind current lines
          ctx.strokeStyle = "rgba(0, 245, 255, 0.35)";
          ctx.lineWidth = 1.5;
          const time = performance.now() / 8;
          if (dir === "right") {
            const offset = time % w;
            for (let yOffset = -h/2 + 15; yOffset < h/2; yOffset += 25) {
              const lineX1 = -w/2 + ((offset + yOffset * 0.5) % w);
              const lineX2 = lineX1 + 20;
              if (lineX2 < w/2) {
                ctx.beginPath();
                ctx.moveTo(lineX1, yOffset);
                ctx.lineTo(lineX2, yOffset);
                ctx.stroke();
              }
            }
          } else if (dir === "left") {
            const offset = time % w;
            for (let yOffset = -h/2 + 15; yOffset < h/2; yOffset += 25) {
              const lineX1 = w/2 - ((offset + yOffset * 0.5) % w);
              const lineX2 = lineX1 - 20;
              if (lineX2 > -w/2) {
                ctx.beginPath();
                ctx.moveTo(lineX1, yOffset);
                ctx.lineTo(lineX2, yOffset);
                ctx.stroke();
              }
            }
          }
        } else if (body.label === "iceZone") {
          const w = body.plugin?.options?.width || 160;
          const h = body.plugin?.options?.height || 120;
          ctx.fillStyle = "rgba(0, 245, 255, 0.06)";
          ctx.fillRect(-w/2, -h/2, w, h);
          ctx.strokeStyle = "rgba(0, 245, 255, 0.35)";
          ctx.lineWidth = 2;
          ctx.strokeRect(-w/2, -h/2, w, h);

          // Frost crystals
          ctx.strokeStyle = "rgba(0, 245, 255, 0.2)";
          ctx.lineWidth = 1;
          for (let sx = -w/2 + 20; sx < w/2; sx += 40) {
            for (let sy = -h/2 + 20; sy < h/2; sy += 40) {
              ctx.beginPath();
              ctx.moveTo(sx - 5, sy); ctx.lineTo(sx + 5, sy);
              ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 5);
              ctx.stroke();
            }
          }
        } else if (body.label === "mudZone") {
          const w = body.plugin?.options?.width || 160;
          const h = body.plugin?.options?.height || 120;
          ctx.fillStyle = "rgba(139, 69, 19, 0.18)";
          ctx.fillRect(-w/2, -h/2, w, h);
          ctx.strokeStyle = "rgba(139, 69, 19, 0.4)";
          ctx.lineWidth = 2;
          ctx.strokeRect(-w/2, -h/2, w, h);

          // Mud bubbles
          ctx.fillStyle = "rgba(100, 50, 10, 0.25)";
          for (let b = 0; b < 5; b++) {
            const bx = -w/2 + 30 + ((b * 45 + Math.floor(performance.now() / 300)) % (w - 60));
            const by = -h/2 + 20 + ((b * 23 + Math.floor(performance.now() / 200)) % (h - 40));
            const br = 3 + 2.5 * Math.sin(performance.now() / 200 + b);
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (body.label?.startsWith("warp_portal")) {
          // Warp portal core ring
          ctx.strokeStyle = "#00f5ff";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#00f5ff";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (body.label === "laserBlock") {
          const w = body.plugin?.options?.width || 100;
          const h = body.plugin?.options?.height || 20;
          const active = !body.isSensor;
          ctx.fillStyle = active ? "#ff2d78" : "rgba(255, 45, 120, 0.15)";
          ctx.strokeStyle = "#ff2d78";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ff2d78";
          ctx.shadowBlur = active ? 15 : 0;
          ctx.fillRect(-w/2, -h/2, w, h);
          if (!active) {
            ctx.strokeRect(-w/2, -h/2, w, h);
          }
        }

        ctx.restore();
      }
    });

    // Draw Collectible items (Sensors)
    collectibleBodiesRef.current.forEach((body) => {
      const relativeY = body.position.y - offset;
      if (relativeY + 20 < 0 || relativeY - 20 > VIEWPORT_HEIGHT) return;

      const kind = body.plugin?.kind;
      const cType = body.plugin?.collectType;

      ctx.save();
      ctx.translate(body.position.x, relativeY);

      // Pulse size animation
      const pulse = 1 + 0.12 * Math.sin(performance.now() / 150);
      const radius = 15 * pulse;

      // Glow filters
      ctx.shadowBlur = 10;
      if (kind === "powerup") {
        ctx.fillStyle = "#39ff14";
        ctx.shadowColor = "#39ff14";
      } else {
        ctx.fillStyle = "#ff2d78";
        ctx.shadowColor = "#ff2d78";
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Inner icon symbol indicator
      ctx.fillStyle = "#000000";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icon = kind === "powerup" ? "⚡" : "⚠️";
      ctx.fillText(icon, 0, 0);

      ctx.restore();
    });

    // Draw Marbles (Runners)
    marbleBodiesRef.current.forEach((body, marbleId) => {
      const marble = useGameStore.getState().marbles.find((m) => m.id === marbleId);
      if (!marble) return;

      const relativeY = body.position.y - offset;
      if (relativeY + 40 < 0 || relativeY - 40 > VIEWPORT_HEIGHT) return;

      const radius = body.circleRadius ?? 18;

      // Draw particle trails (10 frames cache)
      if (marble.trailPositions && marble.trailPositions.length > 0) {
        ctx.save();
        ctx.lineWidth = radius * 1.6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < marble.trailPositions.length; i++) {
          const pt1 = marble.trailPositions[i - 1];
          const pt2 = marble.trailPositions[i];
          const alpha = (i / marble.trailPositions.length) * 0.25;

          ctx.strokeStyle = marble.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y - offset);
          ctx.lineTo(pt2.x, pt2.y - offset);
          ctx.stroke();
        }
        ctx.restore();
      }

      const isGhost = marble.activePowerup?.type === "ghost";
      const hasShield = marble.activePowerup?.type === "shield";
      const isFrozen = marble.activeDebuff?.type === "freeze";
      const isTurbo = marble.activePowerup?.type === "turbo";

      ctx.save();
      ctx.translate(body.position.x, relativeY);

      if (isGhost) {
        ctx.globalAlpha = 0.45;
      }

      // Apply base neon shadow glow
      ctx.shadowBlur = isGhost ? 8 : 18;
      ctx.shadowColor = marble.color;

      // Draw circular marble base
      ctx.fillStyle = marble.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Draw marble skin image inside clip path if available
      // Fallback is simple neon ring
      if (marble.imageUrl) {
        // Preloaded images are accessible directly via useImageLoader or caching maps
        // For drawing inside Canvas, we instantiate standard preloaded elements
        const img = new Image();
        img.src = marble.imageUrl;
        img.crossOrigin = "anonymous";
        
        if (img.complete && img.naturalWidth !== 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, radius - 1.5, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
          ctx.restore();
        }
      }

      // Draw outline ring to give glossy neon texture
      ctx.strokeStyle = isGhost ? "rgba(255, 255, 255, 0.4)" : "#ffffff";
      if (isGhost) {
        ctx.setLineDash([4, 4]); // dashed outline for ghost
      }
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
      ctx.stroke();
      if (isGhost) {
        ctx.setLineDash([]); // clear dash
      }

      // Draw Shield Bubble if active
      if (hasShield) {
        ctx.save();
        ctx.strokeStyle = "#00f5ff";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Freeze Ice Cube if active
      if (isFrozen) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 245, 255, 0.45)";
        ctx.strokeStyle = "#00f5ff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 8;
        ctx.fillRect(-radius - 2, -radius - 2, radius * 2 + 4, radius * 2 + 4);
        ctx.strokeRect(-radius - 2, -radius - 2, radius * 2 + 4, radius * 2 + 4);
        ctx.restore();
      }

      // Draw Turbo Fire Aura if active
      if (isTurbo) {
        ctx.save();
        ctx.strokeStyle = "#ff7700";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ff2d00";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 3 + Math.sin(performance.now() / 80) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Label details (Runner Name + active status flags)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px 'Space Grotesk'";
      ctx.textAlign = "center";
      
      let badgeLabel = marble.name;
      if (marble.activePowerup) badgeLabel += ` [⚡]`;
      if (marble.activeDebuff) badgeLabel += ` [⚠️]`;

      ctx.fillText(badgeLabel, 0, -radius - 10);

      ctx.restore();
    });

    // Draw visual flashes (Explosions/Teleports/Collisions)
    const activeFlashes: ImpactFlash[] = [];
    impactFlashesRef.current.forEach((flash) => {
      const relY = flash.y - offset;
      ctx.strokeStyle = `rgba(255, 255, 255, ${flash.opacity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(flash.x, relY, flash.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Advance animation values
      flash.radius += 2.5;
      flash.opacity -= 0.06;

      if (flash.opacity > 0 && flash.radius < flash.maxRadius) {
        activeFlashes.push(flash);
      }
    });
    impactFlashesRef.current = activeFlashes;

    // Draw floating brainrot texts
    const activeTexts: FloatingText[] = [];
    floatingTextsRef.current.forEach((text) => {
      const relY = text.y - offset;
      if (relY + 30 >= 0 && relY - 30 <= VIEWPORT_HEIGHT && text.opacity > 0) {
        ctx.save();
        ctx.translate(text.x, relY);
        ctx.rotate(text.angle);
        
        ctx.fillStyle = text.color;
        ctx.shadowColor = text.color;
        ctx.shadowBlur = text.isSpecial ? 12 : 6;
        ctx.font = text.isSpecial 
          ? `black ${text.size}px 'Space Grotesk'`
          : `bold ${text.size}px 'Space Grotesk'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add a dark outline for high contrast
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.lineWidth = text.isSpecial ? 4 : 2;
        ctx.strokeText(text.text, 0, 0);
        ctx.fillText(text.text, 0, 0);
        ctx.restore();
        
        // Advance animation
        text.x += text.vx;
        text.y += text.vy;
        text.angle += text.vAngle;
        text.opacity -= 0.008; // fades out in ~125 frames (about 2 seconds)
        
        if (text.opacity > 0) {
          activeTexts.push(text);
        }
      }
    });
    floatingTextsRef.current = activeTexts;
  };

  return (
    <div className="relative border-4 border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black select-none max-w-full">
      {/* Scanline overlay for that retro arcade feel */}
      <div className="scanlines-overlay absolute inset-0 pointer-events-none opacity-15" />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={VIEWPORT_HEIGHT}
        className="block max-w-full bg-black"
        style={{ width: `${CANVAS_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}
      />
    </div>
  );
};

export default GameCanvas;
