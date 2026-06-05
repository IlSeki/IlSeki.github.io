import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a sensor zone representing a wind-blowing fan.
 */
export function createFan(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 120;
  const height = (instance.options.height as number) || 120;
  const force = (instance.options.force as number) || 0.003;
  const fan = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    isSensor: true,
    label: "fan",
  });
  fan.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    force,
    width,
    height,
  };
  return fan;
}
