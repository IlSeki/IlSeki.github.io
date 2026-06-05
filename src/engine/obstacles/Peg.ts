import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";
import { PHYSICS } from "@/config/constants";

/**
 * Creates a static triangular peg obstacle.
 */
export function createPeg(instance: ObstacleInstance): Matter.Body {
  const size = (instance.options.size as number) || 30;
  const peg = Matter.Bodies.polygon(instance.x, instance.y, 3, size / 2, {
    isStatic: true,
    restitution: PHYSICS.wallRestitution,
    label: "peg",
  });
  // Rotate so it points upward
  Matter.Body.setAngle(peg, -Math.PI / 6);
  peg.plugin = { id: instance.id, type: instance.type, options: instance.options };
  return peg;
}
