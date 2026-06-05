import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a sensor zone representing a magnetic gravity well that attracts nearby marbles.
 */
export function createMagnet(instance: ObstacleInstance): Matter.Body {
  const radius = (instance.options.radius as number) || 80;
  const strength = (instance.options.strength as number) || 0.005;
  const magnet = Matter.Bodies.circle(instance.x, instance.y, radius, {
    isStatic: true,
    isSensor: true,
    label: "magnet",
  });
  magnet.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    strength,
    radius,
  };
  return magnet;
}
