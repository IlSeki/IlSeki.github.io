export const CANVAS_WIDTH     = 600;
export const COURSE_HEIGHT    = 8000;
export const VIEWPORT_HEIGHT  = 800;
export const SECTION_HEIGHT   = 400;
export const SECTION_COUNT    = COURSE_HEIGHT / SECTION_HEIGHT; // 10

export const PHYSICS = {
  gravity:          0.45,
  marbleRadius:     18,
  marbleFriction:   0.01,
  marbleRestitution:1.02,
  wallRestitution:  1.05,
  bumperRestitution:1.80,
  trampolineRestitution: 2.80,
} as const;

export const TIMING = {
  countdownMs:      3000,
  minRaceDurationMs:30_000,
  stuckThresholdMs: 5_000,
  stuckVelocity:    0.5,
  warpCooldownMs:   2_000,
} as const;

export const COLLECTIBLE = {
  radius:           20,
  spawnIntervalY:   300,
  debuffChanceNormal: 0.3,  // 30% probabilità debuff
  debuffChanceChaos:  0.6,  // 60% in Chaos Mode
} as const;
