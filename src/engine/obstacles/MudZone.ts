import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a sensor zone representing a mud pit (slows down or adds dampening friction to passing marbles).
 */
export function createMudZone(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 160;
  const height = (instance.options.height as number) || 120;
  const mud = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    isSensor: true,
    label: "mudZone",
  });
  mud.plugin = { id: instance.id, type: instance.type, options: instance.options };
  return mud;
}
