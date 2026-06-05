import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates two sensor circles representing an entry and exit portal.
 */
export function createWarpPortal(instance: ObstacleInstance): Matter.Body[] {
  const radius = 20;
  // Portal A (Entry)
  const portalA = Matter.Bodies.circle(instance.x - 100, instance.y, radius, {
    isStatic: true,
    isSensor: true,
    label: "warp_portal_entry",
  });

  // Portal B (Exit)
  const portalB = Matter.Bodies.circle(instance.x + 100, instance.y, radius, {
    isStatic: true,
    isSensor: true,
    label: "warp_portal_exit",
  });

  portalA.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    targetX: instance.x + 100,
    targetY: instance.y,
    role: "entry",
    pairedId: instance.id + "_exit",
  };

  portalB.plugin = {
    id: instance.id + "_exit",
    type: instance.type,
    options: instance.options,
    targetX: instance.x - 100,
    targetY: instance.y,
    role: "exit",
    pairedId: instance.id,
  };

  return [portalA, portalB];
}
