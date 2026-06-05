import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a sensor zone representing an ice slide (forces friction on the marble to near-zero).
 */
export function createIceZone(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 160;
  const height = (instance.options.height as number) || 120;
  const ice = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    isSensor: true,
    label: "iceZone",
  });
  ice.plugin = { id: instance.id, type: instance.type, options: instance.options };
  return ice;
}
