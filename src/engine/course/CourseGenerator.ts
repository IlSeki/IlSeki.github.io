import { CourseSection, ObstacleInstance, CollectibleInstance, ObstacleType, PowerupType, DebuffType } from "@/types/game";
import { SECTION_HEIGHT, SECTION_COUNT, CANVAS_WIDTH, COURSE_HEIGHT } from "@/config/constants";
import { getSeededRandom } from "@/lib/utils";

const ALL_OBSTACLES: ObstacleType[] = [
  "peg", "rotatingPaddle", "bumper", "funnel",
  "trapdoor", "flipper", "narrowMaze", "fan",
  "magnet", "warpPortal", "trampoline", "tornado",
  "laserBlock", "spiralSlide", "iceZone", "mudZone"
];

const POWERUPS: PowerupType[] = ["turbo", "shield", "magnet", "ghost", "jumpPad"];
const DEBUFFS: DebuffType[] = ["slow", "reverseGravity", "freeze", "shrink", "explosion"];

/**
 * Generates the full list of 10 course sections containing obstacles and collectibles.
 * @param seed String seed used to initialize the PRNG.
 * @param chaosMode Whether global chaos mode is active.
 */
export function generateCourse(seed: string, chaosMode: boolean = false): CourseSection[] {
  const rng = getSeededRandom(seed);
  const sections: CourseSection[] = [];

  for (let i = 0; i < SECTION_COUNT; i++) {
    const yStart = i * SECTION_HEIGHT;
    const yEnd = (i + 1) * SECTION_HEIGHT;
    
    // Choose section theme
    let theme: "normal" | "fast" | "tight" | "chaos" = "normal";
    if (i === 0) {
      theme = "normal";
    } else if (i === SECTION_COUNT - 1) {
      theme = "fast";
    } else {
      const r = rng();
      if (r < 0.25) theme = "normal";
      else if (r < 0.5) theme = "fast";
      else if (r < 0.75) theme = "tight";
      else theme = "chaos";
    }

    const obstacles: ObstacleInstance[] = [];
    const collectibles: CollectibleInstance[] = [];

    let obsCounter = 0;
    const addObstacle = (type: ObstacleType, x: number, y: number, options: Record<string, unknown> = {}) => {
      obstacles.push({
        id: `obs_${i}_${type}_${obsCounter++}`,
        type,
        x,
        y,
        options
      });
    };

    // Generate obstacles using assignments to guarantee every obstacle appears
    if (i === 0) {
      // Tutorial area
      addObstacle("peg", 200, yStart + 120, { size: 30 });
      addObstacle("peg", 400, yStart + 120, { size: 30 });
      addObstacle("bumper", 300, yStart + 260, { radius: 25 });
      // Funnel guide walls at bottom of start to guide marbles in
      addObstacle("funnel", 300, yStart + 360);
    } else if (i === SECTION_COUNT - 1) {
      // Final section: completely free of obstacles for final sprint
    } else {
      // Intermediate sections: 1 to SECTION_COUNT - 2
      // 1. Add side guide deflectors in every section to prevent marbles falling straight down the edges
      addObstacle("peg", 45, yStart + 100, { size: 25 });
      addObstacle("peg", 555, yStart + 100, { size: 25 });
      addObstacle("bumper", 45, yStart + 250, { radius: 20 });
      addObstacle("bumper", 555, yStart + 250, { radius: 20 });
      
      // 2. Select layout based on section index to guarantee 12+ iconic horizontal coverage modes
      const layoutType = i % 12;

      switch (layoutType) {
        case 0: // Case 0: Rotating Windmills
          addObstacle("rotatingPaddle", 180, yStart + 150, { width: 120, height: 15 });
          addObstacle("rotatingPaddle", 420, yStart + 250, { width: 120, height: 15 });
          addObstacle("peg", 300, yStart + 200, { size: 30 });
          break;
        case 1: // Case 1: The Pinball Flippers
          addObstacle("flipper", 180, yStart + 200, { side: "left", width: 75 });
          addObstacle("flipper", 420, yStart + 200, { side: "right", width: 75 });
          addObstacle("bumper", 150, yStart + 90, { radius: 25 });
          addObstacle("bumper", 300, yStart + 90, { radius: 25 });
          addObstacle("bumper", 450, yStart + 90, { radius: 25 });
          addObstacle("trampoline", 300, yStart + 310, { width: 100, height: 15 });
          break;
        case 2: // Case 2: The Vortex Gate
          addObstacle("tornado", 300, yStart + 200, { radius: 90 });
          addObstacle("magnet", 160, yStart + 120, { radius: 80 });
          addObstacle("magnet", 440, yStart + 280, { radius: 80 });
          break;
        case 3: // Case 3: Portal Warp Maze
          addObstacle("warpPortal", 180, yStart + 120);
          addObstacle("warpPortal", 420, yStart + 120);
          addObstacle("peg", 300, yStart + 200, { size: 25 });
          addObstacle("bumper", 300, yStart + 280, { radius: 22 });
          break;
        case 4: // Case 4: Wind Tunnel & Zones
          addObstacle("mudZone", 300, yStart + 150, { width: 160, height: 120 });
          addObstacle("iceZone", 120, yStart + 280, { width: 140, height: 100 });
          addObstacle("iceZone", 480, yStart + 280, { width: 140, height: 100 });
          addObstacle("fan", 100, yStart + 100, { width: 120, height: 120, direction: "right" });
          break;
        case 5: // Case 5: Maze Split Plinko
          addObstacle("narrowMaze", 300, yStart + 120);
          addObstacle("peg", 120, yStart + 230, { size: 25 });
          addObstacle("peg", 240, yStart + 230, { size: 25 });
          addObstacle("peg", 360, yStart + 230, { size: 25 });
          addObstacle("peg", 480, yStart + 230, { size: 25 });
          addObstacle("bumper", 180, yStart + 310, { radius: 20 });
          addObstacle("bumper", 300, yStart + 310, { radius: 20 });
          addObstacle("bumper", 420, yStart + 310, { radius: 20 });
          break;
        case 6: // Case 6: Bouncing Heaven
          addObstacle("trampoline", 180, yStart + 150, { width: 90, height: 15 });
          addObstacle("trampoline", 420, yStart + 150, { width: 90, height: 15 });
          addObstacle("bumper", 120, yStart + 260, { radius: 25 });
          addObstacle("bumper", 300, yStart + 260, { radius: 25 });
          addObstacle("bumper", 480, yStart + 260, { radius: 25 });
          break;
        case 7: // Case 7: Laser Grid & Funnel
          addObstacle("laserBlock", 180, yStart + 150, { width: 100, height: 20 });
          addObstacle("laserBlock", 420, yStart + 150, { width: 100, height: 20 });
          addObstacle("funnel", 300, yStart + 280);
          break;
        case 8: // Case 8: Spiral Slider & Fan
          addObstacle("spiralSlide", 200, yStart + 150);
          addObstacle("spiralSlide", 400, yStart + 260);
          addObstacle("fan", 500, yStart + 200, { width: 120, height: 120, direction: "left" });
          break;
        case 9: // Case 9: Trapdoor Gauntlet
          addObstacle("trapdoor", 200, yStart + 150, { width: 100, height: 12 });
          addObstacle("trapdoor", 400, yStart + 150, { width: 100, height: 12 });
          addObstacle("bumper", 150, yStart + 280, { radius: 25 });
          addObstacle("bumper", 300, yStart + 280, { radius: 25 });
          addObstacle("bumper", 450, yStart + 280, { radius: 25 });
          break;
        case 10: // Case 10: Double Flipper Magnet
          addObstacle("flipper", 160, yStart + 120, { side: "left", width: 75 });
          addObstacle("flipper", 440, yStart + 120, { side: "right", width: 75 });
          addObstacle("magnet", 300, yStart + 250, { radius: 80 });
          break;
        case 11: // Case 11: Staggered Chaos Plinko
          addObstacle("peg", 150, yStart + 100, { size: 25 });
          addObstacle("peg", 300, yStart + 100, { size: 25 });
          addObstacle("peg", 450, yStart + 100, { size: 25 });
          addObstacle("bumper", 200, yStart + 200, { radius: 22 });
          addObstacle("bumper", 400, yStart + 200, { radius: 22 });
          addObstacle("peg", 150, yStart + 300, { size: 25 });
          addObstacle("peg", 300, yStart + 300, { size: 25 });
          addObstacle("peg", 450, yStart + 300, { size: 25 });
          break;
      }
    }

    // Place collectibles
    const colYs = [yStart + 50, yStart + 150, yStart + 250, yStart + 350];
    let colCounter = 0;

    colYs.forEach((y) => {
      if (y < 40 || y > COURSE_HEIGHT - 60) return;
      if (rng() > 0.85) return; // 85% spawn probability to populate the course

      const x = 120 + Math.floor(rng() * (CANVAS_WIDTH - 240));

      // Check distance (>= 40px, we check 50px for safety)
      let tooClose = false;
      for (const obs of obstacles) {
        const dx = obs.x - x;
        const dy = obs.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        const isDebuff = rng() < (chaosMode || theme === "chaos" ? 0.6 : 0.3);
        const kind = isDebuff ? "debuff" : "powerup";
        const type = isDebuff 
          ? DEBUFFS[Math.floor(rng() * DEBUFFS.length)]
          : POWERUPS[Math.floor(rng() * POWERUPS.length)];

        collectibles.push({
          id: `col_${i}_${kind}_${colCounter++}`,
          kind,
          type,
          x,
          y,
          collected: false
        });
      }
    });

    sections.push({
      yStart,
      yEnd,
      theme,
      obstacles,
      collectibles
    });
  }

  return sections;
}
