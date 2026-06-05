import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a static rectangular paddle meant to be rotated programmatically.
 */
export function createRotatingPaddle(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 120;
  const height = (instance.options.height as number) || 15;
  const speed = (instance.options.speed as number) || 0.02;
  const paddle = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    label: "rotatingPaddle",
  });
  paddle.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    speed,
    currentAngle: 0,
  };
  return paddle;
}
