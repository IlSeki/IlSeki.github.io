import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates two slanted static rectangle bodies that act as a V-funnel.
 */
export function createFunnel(instance: ObstacleInstance): Matter.Body[] {
  const width = (instance.options.width as number) || 120;
  const gap = (instance.options.gap as number) || 60;
  const thickness = 18;
  const angle = Math.PI / 6; // 30 degrees

  // Left funnel plate
  const leftX = instance.x - gap / 2 - (width / 2) * Math.cos(angle);
  const leftY = instance.y - (width / 2) * Math.sin(angle);
  const leftWall = Matter.Bodies.rectangle(leftX, leftY, width, thickness, {
    isStatic: true,
    angle: angle,
    label: "funnel_left",
  });

  // Right funnel plate
  const rightX = instance.x + gap / 2 + (width / 2) * Math.cos(angle);
  const rightY = instance.y - (width / 2) * Math.sin(angle);
  const rightWall = Matter.Bodies.rectangle(rightX, rightY, width, thickness, {
    isStatic: true,
    angle: -angle,
    label: "funnel_right",
  });

  leftWall.plugin = { 
    id: instance.id, 
    type: instance.type, 
    options: instance.options, 
    isPart: true,
    width,
    height: thickness
  };
  rightWall.plugin = { 
    id: instance.id, 
    type: instance.type, 
    options: instance.options, 
    isPart: true,
    width,
    height: thickness
  };

  return [leftWall, rightWall];
}
