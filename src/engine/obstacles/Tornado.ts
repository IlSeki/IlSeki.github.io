import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a circular sensor zone representing a tornado that pushes marbles in orbit.
 */
export function createTornado(instance: ObstacleInstance): Matter.Body {
  const radius = (instance.options.radius as number) || 90;
  const force = (instance.options.force as number) || 0.004;
  const tornado = Matter.Bodies.circle(instance.x, instance.y, radius, {
    isStatic: true,
    isSensor: true,
    label: "tornado",
  });
  tornado.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    force,
    radius,
  };
  return tornado;
}
