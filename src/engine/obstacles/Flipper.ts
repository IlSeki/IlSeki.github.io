import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a static pinball-style flipper that springs when a marble is near.
 */
export function createFlipper(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 80;
  const height = (instance.options.height as number) || 18;
  const side = (instance.options.side as "left" | "right") || "left";
  
  // Base rotation offset
  const angle = side === "left" ? Math.PI / 8 : -Math.PI / 8;
  const flipper = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    angle: angle,
    label: "flipper",
  });

  flipper.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    side,
    angleDirection: 1,
    baseAngle: angle,
    currentAngle: angle,
    active: false,
    timer: 0,
    width,
    height
  };
  return flipper;
}
