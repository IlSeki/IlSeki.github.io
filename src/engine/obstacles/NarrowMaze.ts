import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

/**
 * Creates walls that form a narrow zig-zag maze pattern.
 */
export function createNarrowMaze(instance: ObstacleInstance): Matter.Body[] {
  const width = 200;
  const wallThickness = 18;
  const walls: Matter.Body[] = [];

  // Wall 1: left partition
  walls.push(
    Matter.Bodies.rectangle(instance.x - 45, instance.y - 45, width * 0.7, wallThickness, {
      isStatic: true,
      label: "maze_wall",
    })
  );

  // Wall 2: right partition
  walls.push(
    Matter.Bodies.rectangle(instance.x + 45, instance.y, width * 0.7, wallThickness, {
      isStatic: true,
      label: "maze_wall",
    })
  );

  // Wall 3: left partition
  walls.push(
    Matter.Bodies.rectangle(instance.x - 45, instance.y + 45, width * 0.7, wallThickness, {
      isStatic: true,
      label: "maze_wall",
    })
  );

  walls.forEach((wall) => {
    wall.plugin = { 
      id: instance.id, 
      type: instance.type, 
      options: instance.options, 
      isPart: true,
      width: width * 0.7,
      height: wallThickness
    };
  });

  return walls;
}
