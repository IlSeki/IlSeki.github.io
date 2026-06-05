import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";
import { PHYSICS } from "@/config/constants";

/**
 * Creates a static circular bumper with high restitution (bounciness).
 */
export function createBumper(instance: ObstacleInstance): Matter.Body {
  const radius = (instance.options.radius as number) || 25;
  const bumper = Matter.Bodies.circle(instance.x, instance.y, radius, {
    isStatic: true,
    restitution: PHYSICS.bumperRestitution,
    label: "bumper",
  });
  bumper.plugin = { id: instance.id, type: instance.type, options: instance.options };
  return bumper;
}
