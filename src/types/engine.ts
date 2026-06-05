import Matter from "matter-js";

export interface PhysicsBody {
  id: string;
  body: Matter.Body;
  type: "marble" | "obstacle" | "collectible" | "wall" | "sensor";
  label?: string;
}

export interface ImpulseForce {
  x: number;
  y: number;
}
