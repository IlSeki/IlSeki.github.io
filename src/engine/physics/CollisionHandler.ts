import Matter from "matter-js";
import { PhysicsEngine } from "./PhysicsEngine";
import { AudioEngine } from "../audio/AudioEngine";

/**
 * Registers collision listeners on the Matter.js engine.
 * @param physics The PhysicsEngine wrapper.
 * @param audio The AudioEngine singleton instance.
 * @param onCollect Callback fired when a marble touches a collectible.
 * @param onWarp Callback fired when a marble hits a warp entry.
 */
export function setupCollisionHandler(
  physics: PhysicsEngine,
  audio: AudioEngine,
  onCollect: (marbleId: string, collectibleId: string, kind: "powerup" | "debuff", type: string) => void,
  onWarp: (marbleId: string, targetX: number, targetY: number) => void,
  onCollision?: (x: number, y: number, label: string) => void
): void {
  Matter.Events.on(physics.engine, "collisionStart", (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      let marbleBody: Matter.Body | null = null;
      let otherBody: Matter.Body | null = null;

      if (bodyA.plugin?.type === "marble") {
        marbleBody = bodyA;
        otherBody = bodyB;
      } else if (bodyB.plugin?.type === "marble") {
        marbleBody = bodyB;
        otherBody = bodyA;
      }

      if (!marbleBody || !otherBody) return;

      const marbleId = marbleBody.plugin.id;

      // 1. Bumpers
      if (otherBody.label === "bumper") {
        audio.playBumper();
        if (onCollision) onCollision(otherBody.position.x, otherBody.position.y, "bumper");
        return;
      }

      // 2. Trampolines
      if (otherBody.label === "trampoline") {
        audio.playTrampoline();
        if (onCollision) onCollision(otherBody.position.x, otherBody.position.y, "trampoline");
        return;
      }

      // 3. Collectibles
      if (otherBody.plugin?.type === "collectible") {
        const colId = otherBody.plugin.id;
        const kind = otherBody.plugin.kind;
        const cType = otherBody.plugin.collectType;
        onCollect(marbleId, colId, kind, cType);
        if (onCollision) onCollision(otherBody.position.x, otherBody.position.y, "collectible");
        return;
      }

      // 4. Warp Portals
      if (otherBody.label === "warp_portal_entry") {
        const portalPlugin = otherBody.plugin;
        if (portalPlugin && portalPlugin.role === "entry") {
          onWarp(marbleId, portalPlugin.targetX, portalPlugin.targetY);
          if (onCollision) onCollision(portalPlugin.targetX, portalPlugin.targetY, "warp");
        }
        return;
      }

      // 5. Default Pegs, walls, paddles, etc.
      const vel = marbleBody.velocity;
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      const intensity = Math.min(speed / 15, 1.0);
      if (intensity > 0.08) {
        audio.playCollision(intensity);
        if (onCollision) onCollision(marbleBody.position.x, marbleBody.position.y, otherBody.label || "peg");
      }
    });
  });
}
