import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a circular-shaped slide path made out of overlapping rectangle bodies.
 */
export function createSpiralSlide(instance: ObstacleInstance): Matter.Body[] {
  const segments = 10;
  const radius = 60;
  const thickness = 18;
  const bodies: Matter.Body[] = [];

  for (let i = 0; i <= segments; i++) {
    // 180 degrees curve starting from the left, wrapping downwards
    const theta = Math.PI + (i / segments) * Math.PI;
    const x = instance.x + radius * Math.cos(theta);
    const y = instance.y + radius * Math.sin(theta);
    const angle = theta + Math.PI / 2;

    const segment = Matter.Bodies.rectangle(x, y, 25, thickness, {
      isStatic: true,
      angle: angle,
      label: "spiral_slide_segment",
    });
    segment.plugin = { 
      id: instance.id, 
      type: instance.type, 
      options: instance.options, 
      isPart: true,
      width: 25,
      height: thickness
    };
    bodies.push(segment);
  }

  return bodies;
}
