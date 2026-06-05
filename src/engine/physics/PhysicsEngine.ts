import Matter from "matter-js";
import { PHYSICS } from "@/config/constants";

/**
 * Wrapper class managing the Matter.js Engine and World.
 */
export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  private customGravityMap: Map<string, number> = new Map(); // marbleId -> gravity multiplier

  constructor() {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: PHYSICS.gravity, scale: 0.001 },
    });
    this.world = this.engine.world;
  }

  /**
   * Adds body or bodies to the simulation.
   */
  public addBody(body: Matter.Body | Matter.Body[]): void {
    if (Array.isArray(body)) {
      Matter.Composite.add(this.world, body);
    } else {
      Matter.Composite.add(this.world, body);
    }
  }

  /**
   * Removes a body from the simulation.
   */
  public removeBody(body: Matter.Body): void {
    Matter.Composite.remove(this.world, body);
  }

  /**
   * Steps the physics engine forward in time.
   * Apply gravity overrides manually via vertical forces before updating.
   * @param delta Milliseconds elapsed since last step.
   */
  public step(delta: number): void {
    const subSteps = 6;
    const subDelta = delta / subSteps;

    for (let step = 0; step < subSteps; step++) {
      const bodies = Matter.Composite.allBodies(this.world);
      const marbles = bodies.filter((b) => b.plugin && b.plugin.type === "marble");

      // 1. Handle marble physics, gravity adjustments, and active zone effects
      marbles.forEach((marble) => {
        // Reset marble frictions to default values at the start of each substep
        marble.friction = PHYSICS.marbleFriction;
        
        // Retain slow debuff multiplier if active, otherwise standard air friction
        const isSlowed = marble.plugin.isSlowed;
        marble.frictionAir = isSlowed ? 0.08 : 0.02;

        // Apply custom gravity scale correction if active
        const id = marble.plugin.id;
        const multiplier = this.customGravityMap.get(id);
        if (multiplier !== undefined) {
          const defaultGravityY = this.engine.gravity.y * this.engine.gravity.scale; // 1.0 * 0.001
          const gravityForceY = marble.mass * defaultGravityY;
          const correctionForceY = gravityForceY * (multiplier - 1);
          Matter.Body.applyForce(marble, marble.position, { x: 0, y: correctionForceY });
        }

        // Apply horizontal jitter (Brownian noise) to keep marbles agitated and prevent straight drops
        const jitterX = (Math.random() - 0.5) * 0.0035 * marble.mass;
        Matter.Body.applyForce(marble, marble.position, { x: jitterX, y: 0 });

        // If the marble is falling straight vertically with negligible horizontal speed, give it a firm sideways nudge
        if (Math.abs(marble.velocity.x) < 0.25 && marble.velocity.y > 0.5) {
          const nudgeDir = Math.random() > 0.5 ? 1 : -1;
          const nudgeForceX = nudgeDir * 0.008 * marble.mass;
          Matter.Body.applyForce(marble, marble.position, { x: nudgeForceX, y: 0 });
        }

        // Apply physics forces from special static obstacles / zones
        bodies.forEach((other) => {
          if (other.isStatic) {
            if (other.label === "magnet") {
              const radius = other.plugin?.radius || 80;
              const dx = other.position.x - marble.position.x;
              const dy = other.position.y - marble.position.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0 && dist < radius) {
                // Pull force towards the magnet center (scaled up for high responsiveness)
                const forceMag = (1 - dist / radius) * 0.015 * marble.mass;
                Matter.Body.applyForce(marble, marble.position, {
                  x: (dx / dist) * forceMag,
                  y: (dy / dist) * forceMag,
                });
              }
            } else if (other.label === "tornado") {
              const radius = other.plugin?.radius || 90;
              const dx = marble.position.x - other.position.x; // relative to center
              const dy = marble.position.y - other.position.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0 && dist < radius) {
                // Centripetal force pulling towards center
                const dirToCenter = { x: -dx / dist, y: -dy / dist };
                const pullForce = (1 - dist / radius) * 0.018 * marble.mass;

                // Tangential force orbiting clockwise
                const dirTangential = { x: -dirToCenter.y, y: dirToCenter.x };
                const spinForce = 0.035 * marble.mass;

                Matter.Body.applyForce(marble, marble.position, {
                  x: dirToCenter.x * pullForce + dirTangential.x * spinForce,
                  y: dirToCenter.y * pullForce + dirTangential.y * spinForce,
                });
              }
            } else if (other.label === "fan") {
              const w = other.plugin?.width || other.plugin?.options?.width || 120;
              const h = other.plugin?.height || other.plugin?.options?.height || 120;
              const dx = marble.position.x - other.position.x;
              const dy = marble.position.y - other.position.y;
              if (Math.abs(dx) < w / 2 && Math.abs(dy) < h / 2) {
                // Apply constant blowing wind force (scaled up for visible push)
                const direction = other.plugin?.options?.direction || "right";
                const strength = 0.018 * marble.mass;
                let force = { x: 0, y: 0 };
                if (direction === "right") force = { x: strength, y: 0 };
                else if (direction === "left") force = { x: -strength, y: 0 };
                else if (direction === "up") force = { x: 0, y: -strength };
                else if (direction === "down") force = { x: 0, y: strength };
                Matter.Body.applyForce(marble, marble.position, force);
              }
            } else if (other.label === "iceZone") {
              const w = other.plugin?.width || other.plugin?.options?.width || 160;
              const h = other.plugin?.height || other.plugin?.options?.height || 120;
              const dx = marble.position.x - other.position.x;
              const dy = marble.position.y - other.position.y;
              if (Math.abs(dx) < w / 2 && Math.abs(dy) < h / 2) {
                // Extremely slippery (friction and air resistance set near zero)
                marble.friction = 0.0;
                marble.frictionAir = 0.001;
              }
            } else if (other.label === "mudZone") {
              const w = other.plugin?.width || other.plugin?.options?.width || 160;
              const h = other.plugin?.height || other.plugin?.options?.height || 120;
              const dx = marble.position.x - other.position.x;
              const dy = marble.position.y - other.position.y;
              if (Math.abs(dx) < w / 2 && Math.abs(dy) < h / 2) {
                // Extremely sluggish (high air resistance)
                marble.friction = 0.3;
                marble.frictionAir = 0.22;
              }
            }
          }
        });
      });

      // 2. Update movement and velocities of moving obstacle bodies
      bodies.forEach((body) => {
        // Update rotating paddles
        if (body.label === "rotatingPaddle") {
          const speed = body.plugin?.speed || 0.02;
          const newAngle = body.angle + speed * (subDelta / 16.667) * 0.5;
          Matter.Body.setAngle(body, newAngle);
          Matter.Body.setAngularVelocity(body, speed * 0.5);
        }

        // Update flippers (oscillating pinball flippers)
        if (body.label === "flipper") {
          const time = (body.plugin.elapsedTime || 0) + subDelta;
          body.plugin.elapsedTime = time;
          const oscSpeed = body.plugin.options?.speed || 0.0035;
          const angleRange = Math.PI / 3.5;
          const baseAngle = body.plugin.options?.side === "left" ? -Math.PI / 6 : Math.PI / 6;
          const angle = baseAngle + Math.sin(time * oscSpeed) * angleRange;

          // Derivative of sine wave oscillation for correct angular velocity calculation:
          // w = oscSpeed * angleRange * cos(time * oscSpeed)
          const w = oscSpeed * angleRange * Math.cos(time * oscSpeed);

          Matter.Body.setAngle(body, angle);
          Matter.Body.setAngularVelocity(body, w);
        }

        // Update trapdoors (slide open/closed)
        if (body.label === "trapdoor") {
          const time = (body.plugin.elapsedTime || 0) + subDelta;
          body.plugin.elapsedTime = time;
          const originalX = body.plugin.originalX ?? body.position.x;
          if (body.plugin.originalX === undefined) {
            body.plugin.originalX = body.position.x;
          }
          const cycle = time % 3500;
          const isOpen = cycle > 2000; // open for 1.5 seconds
          const targetX = isOpen ? originalX - 140 : originalX;
          const prevX = body.position.x;
          const currentX = body.position.x + (targetX - body.position.x) * 0.12;

          const vx = (currentX - prevX) / subDelta;
          Matter.Body.setPosition(body, { x: currentX, y: body.position.y });
          Matter.Body.setVelocity(body, { x: vx, y: 0 });
        }

        // Update laserBlocks (active/inactive states)
        if (body.label === "laserBlock") {
          const plugin = body.plugin;
          plugin.timer = (plugin.timer || 0) + subDelta;
          if (plugin.timer > (plugin.interval || 2000)) {
            plugin.active = !plugin.active;
            plugin.timer = 0;
            body.isSensor = !plugin.active;
          }
        }
      });

      Matter.Engine.update(this.engine, subDelta);
    }
  }

  /**
   * Applies an impulse force to a body.
   */
  public applyForce(body: Matter.Body, force: { x: number; y: number }): void {
    Matter.Body.applyForce(body, body.position, force);
  }

  /**
   * Directly sets the velocity of a body.
   */
  public setVelocity(body: Matter.Body, velocity: { x: number; y: number }): void {
    Matter.Body.setVelocity(body, velocity);
  }

  /**
   * Sets a specific gravity multiplier for a marble (e.g. -1 for ReverseGravity).
   */
  public setMarbleGravityScale(marbleId: string, scale: number): void {
    this.customGravityMap.set(marbleId, scale);
  }

  /**
   * Restores a marble to standard world gravity.
   */
  public clearMarbleGravityScale(marbleId: string): void {
    this.customGravityMap.delete(marbleId);
  }

  /**
   * Resets the physics world.
   */
  public clear(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.customGravityMap.clear();
  }
}
export default PhysicsEngine;
