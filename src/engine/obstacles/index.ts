import Matter from "matter-js";
import { ObstacleInstance } from "@/types/game";

import { createPeg } from "./Peg";
import { createRotatingPaddle } from "./RotatingPaddle";
import { createBumper } from "./Bumper";
import { createFunnel } from "./Funnel";
import { createTrapdoor } from "./Trapdoor";
import { createFlipper } from "./Flipper";
import { createNarrowMaze } from "./NarrowMaze";
import { createFan } from "./Fan";
import { createMagnet } from "./Magnet";
import { createWarpPortal } from "./WarpPortal";
import { createTrampoline } from "./Trampoline";
import { createTornado } from "./Tornado";
import { createLaserBlock } from "./LaserBlock";
import { createSpiralSlide } from "./SpiralSlide";
import { createIceZone } from "./IceZone";
import { createMudZone } from "./MudZone";

/**
 * Factory that creates Matter.js bodies for a given obstacle instance.
 */
export function createObstacleBody(instance: ObstacleInstance): Matter.Body | Matter.Body[] {
  switch (instance.type) {
    case "peg":
      return createPeg(instance);
    case "rotatingPaddle":
      return createRotatingPaddle(instance);
    case "bumper":
      return createBumper(instance);
    case "funnel":
      return createFunnel(instance);
    case "trapdoor":
      return createTrapdoor(instance);
    case "flipper":
      return createFlipper(instance);
    case "narrowMaze":
      return createNarrowMaze(instance);
    case "fan":
      return createFan(instance);
    case "magnet":
      return createMagnet(instance);
    case "warpPortal":
      return createWarpPortal(instance);
    case "trampoline":
      return createTrampoline(instance);
    case "tornado":
      return createTornado(instance);
    case "laserBlock":
      return createLaserBlock(instance);
    case "spiralSlide":
      return createSpiralSlide(instance);
    case "iceZone":
      return createIceZone(instance);
    case "mudZone":
      return createMudZone(instance);
    default:
      return Matter.Bodies.circle(instance.x, instance.y, 10, { isStatic: true });
  }
}
