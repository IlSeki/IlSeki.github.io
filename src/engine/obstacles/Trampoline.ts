import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";
import { PHYSICS } from "@/config/constants";

/**
 * Creates a static trampoline platform with extreme restitution.
 */
export function createTrampoline(instance: ObstacleInstance): Matter.Body {
  const width = (instance.options.width as number) || 100;
  const height = (instance.options.height as number) || 15;
  const tramp = Matter.Bodies.rectangle(instance.x, instance.y, width, height, {
    isStatic: true,
    restitution: PHYSICS.trampolineRestitution,
    label: "trampoline",
  });
  tramp.plugin = { id: instance.id, type: instance.type, options: instance.options };
  return tramp;
}
