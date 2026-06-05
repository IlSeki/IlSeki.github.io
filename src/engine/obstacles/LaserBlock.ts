import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a static horizontal block that periodically turns solid/active or sensor/inactive.
 */
export function createLaserBlock(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 100;
  const height = (instance.options.height as number) || 20;
  const interval = (instance.options.interval as number) || 2000;
  const laser = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    label: "laserBlock",
  });
  laser.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    active: true,
    timer: 0,
    interval,
  };
  return laser;
}
