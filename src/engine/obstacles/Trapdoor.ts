import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates a static horizontal platform that will temporarily disappear or collapse when hit.
 */
export function createTrapdoor(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 100;
  const height = (instance.options.height as number) || 18;
  const trapdoor = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    label: "trapdoor",
  });
  trapdoor.plugin = {
    id: instance.id,
    type: instance.type,
    options: instance.options,
    width,
    height,
    collapsed: false,
    collapseTimer: 0,
    resetTimer: 0,
    originalWidth: width,
    originalHeight: height,
  };
  return trapdoor;
}
