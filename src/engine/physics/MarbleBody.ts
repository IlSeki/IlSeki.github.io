import Matter from "matter-js";
import { Marble } from "@/types/game";
import { PHYSICS } from "@/config/constants";

/**
 * Creates a circular Matter.js body for a marble.
 * @param marble The marble configuration.
 * @param x Initial X position.
 * @param y Initial Y position.
 */
export function createMarbleBody(marble: Marble, x: number, y: number): Matter.Body {
  // Easter egg: "brainrot" makes it twice as large
  const isBrainrot = marble.name.toLowerCase() === "brainrot";
  const radius = isBrainrot ? PHYSICS.marbleRadius * 2 : PHYSICS.marbleRadius;

  const body = Matter.Bodies.circle(x, y, radius, {
    restitution: PHYSICS.marbleRestitution,
    friction: PHYSICS.marbleFriction,
    frictionAir: 0.02,
    label: "marble",
  });

  body.plugin = {
    id: marble.id,
    type: "marble",
    originalRadius: radius,
  };

  return body;
}
