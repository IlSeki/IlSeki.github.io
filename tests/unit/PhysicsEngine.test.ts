import { describe, test, expect } from "vitest";
import Matter from "matter-js";
import { PhysicsEngine } from "../../src/engine/physics/PhysicsEngine";

describe("PhysicsEngine Unit Tests", () => {
  test("initializes successfully", () => {
    const physics = new PhysicsEngine();
    expect(physics.engine).toBeDefined();
    expect(physics.world).toBeDefined();
    physics.clear();
  });

  test("adds and removes bodies to/from world", () => {
    const physics = new PhysicsEngine();
    const body = Matter.Bodies.circle(100, 100, 10);
    physics.addBody(body);
    expect(Matter.Composite.allBodies(physics.world)).toContain(body);

    physics.removeBody(body);
    expect(Matter.Composite.allBodies(physics.world)).not.toContain(body);
    physics.clear();
  });

  test("applies custom gravity scales dynamically to marbles", () => {
    const physics = new PhysicsEngine();
    const body = Matter.Bodies.circle(100, 100, 10);
    body.plugin = { id: "test-marble", type: "marble" };
    physics.addBody(body);

    // Apply negative scale to float upward
    physics.setMarbleGravityScale("test-marble", -1.0);
    
    expect(body.position.y).toBe(100);

    // Step 5 frames
    for (let i = 0; i < 5; i++) {
      physics.step(16.667);
    }

    // Vertical Y should decrease (moving up on screen)
    expect(body.position.y).toBeLessThan(100);

    physics.clear();
  });
});
