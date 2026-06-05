import Matter from "matter-js";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { PowerupType, DebuffType } from "@/types/game";
import { COURSE_HEIGHT } from "@/config/constants";

export const CATEGORIES = {
  default:     0x0001,
  marble:      0x0002,
  obstacle:    0x0004,
  wall:        0x0008,
  collectible: 0x0010,
};

/**
 * Applies a powerup effect to a marble's physics body.
 */
export function applyPowerup(type: PowerupType, body: Matter.Body, physics: PhysicsEngine): void {
  switch (type) {
    case "turbo":
      // Boost speed downwards
      Matter.Body.setVelocity(body, { 
        x: body.velocity.x, 
        y: Math.max(body.velocity.y + 4, 10) 
      });
      break;
    case "shield":
      body.plugin.hasShield = true;
      break;
    case "ghost":
      // Mask collisions to only hit walls and collectibles
      body.collisionFilter.mask = CATEGORIES.wall | CATEGORIES.collectible;
      break;
    case "jumpPad":
      // Instantly advance Y position by 300px
      const targetY = Math.min(body.position.y + 300, COURSE_HEIGHT - 60);
      Matter.Body.setPosition(body, { x: body.position.x, y: targetY });
      // Apply down impulse
      Matter.Body.setVelocity(body, { x: body.velocity.x, y: Math.max(body.velocity.y, 5) });
      break;
    case "magnet":
      body.plugin.hasMagnet = true;
      break;
  }
}

/**
 * Removes a powerup effect from a marble's physics body.
 */
export function removePowerup(type: PowerupType, body: Matter.Body, physics: PhysicsEngine): void {
  switch (type) {
    case "ghost":
      // Reset filter mask back to standard
      body.collisionFilter.mask = 
        CATEGORIES.default | CATEGORIES.obstacle | CATEGORIES.wall | CATEGORIES.collectible | CATEGORIES.marble;
      break;
    case "magnet":
      body.plugin.hasMagnet = false;
      break;
    case "shield":
      body.plugin.hasShield = false;
      break;
  }
}

/**
 * Applies a debuff effect to a marble's physics body.
 * If the marble has an active shield, the shield blocks the debuff.
 * @returns boolean True if the debuff was applied, false if blocked by a shield.
 */
export function applyDebuff(type: DebuffType, body: Matter.Body, physics: PhysicsEngine): boolean {
  if (body.plugin.hasShield) {
    body.plugin.hasShield = false; // consume shield
    return false; // blocked
  }

  switch (type) {
    case "slow":
      Matter.Body.setVelocity(body, { x: body.velocity.x * 0.3, y: body.velocity.y * 0.3 });
      body.plugin.isSlowed = true;
      break;
    case "reverseGravity":
      physics.setMarbleGravityScale(body.plugin.id, -0.6); // slight upwards float
      break;
    case "freeze":
      body.plugin.isFrozen = true;
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      break;
    case "shrink":
      if (!body.plugin.isShrunk) {
        Matter.Body.scale(body, 0.5, 0.5);
        body.plugin.isShrunk = true;
      }
      break;
    case "explosion":
      // Instant radial shockwave pushing other marbles away
      const allBodies = Matter.Composite.allBodies(physics.world);
      allBodies.forEach((other) => {
        if (other.plugin?.type === "marble" && other.plugin.id !== body.plugin.id) {
          const dx = other.position.x - body.position.x;
          const dy = other.position.y - body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 0) {
            const forceStrength = 0.08 * (1 - dist / 150);
            Matter.Body.applyForce(other, other.position, {
              x: (dx / dist) * forceStrength,
              y: (dy / dist) * forceStrength,
            });
          }
        }
      });
      break;
  }
  return true;
}

/**
 * Removes a debuff effect from a marble's physics body.
 */
export function removeDebuff(type: DebuffType, body: Matter.Body, physics: PhysicsEngine): void {
  switch (type) {
    case "slow":
      body.plugin.isSlowed = false;
      break;
    case "reverseGravity":
      physics.clearMarbleGravityScale(body.plugin.id);
      break;
    case "freeze":
      body.plugin.isFrozen = false;
      break;
    case "shrink":
      if (body.plugin.isShrunk) {
        Matter.Body.scale(body, 2.0, 2.0); // reverse scaling back to original size
        body.plugin.isShrunk = false;
      }
      break;
  }
}
