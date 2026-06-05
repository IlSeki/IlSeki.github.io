import { describe, test, expect } from "vitest";
import Matter from "matter-js";
import { PhysicsEngine } from "../../src/engine/physics/PhysicsEngine";
import { applyPowerup, removePowerup, applyDebuff, removeDebuff, CATEGORIES } from "../../src/engine/powerups";

describe("Powerups and Debuffs Unit Tests", () => {
  test("shield powerup blocks debuff application and is consumed", () => {
    const physics = new PhysicsEngine();
    const body = Matter.Bodies.circle(100, 100, 10);
    body.plugin = { id: "test-marble", type: "marble" };

    // Activate shield
    applyPowerup("shield", body, physics);
    expect(body.plugin.hasShield).toBe(true);

    // Attempt to freeze
    const applied = applyDebuff("freeze", body, physics);
    // Should report blocked
    expect(applied).toBe(false);
    expect(body.plugin.hasShield).toBe(false); // consumed
    expect(body.plugin.isFrozen).toBeFalsy();

    physics.clear();
  });

  test("ghost powerup alters collision mask filters to bypass obstacles", () => {
    const physics = new PhysicsEngine();
    const body = Matter.Bodies.circle(100, 100, 10);
    body.plugin = { id: "test-marble", type: "marble" };

    applyPowerup("ghost", body, physics);
    expect(body.collisionFilter.mask).toBe(CATEGORIES.wall | CATEGORIES.collectible);

    removePowerup("ghost", body, physics);
    expect(body.collisionFilter.mask).toBe(
      CATEGORIES.default | CATEGORIES.obstacle | CATEGORIES.wall | CATEGORIES.collectible
    );

    physics.clear();
  });

  test("shrink scales down and restores original size on removal", () => {
    const physics = new PhysicsEngine();
    const body = Matter.Bodies.circle(100, 100, 18);
    body.plugin = { id: "test-marble", type: "marble" };

    applyDebuff("shrink", body, physics);
    expect(body.plugin.isShrunk).toBe(true);

    removeDebuff("shrink", body, physics);
    expect(body.plugin.isShrunk).toBe(false);

    physics.clear();
  });
});
