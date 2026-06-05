export type GamePhase = 'lobby' | 'countdown' | 'racing' | 'results'

export interface Marble {
  id: string
  name: string
  imageUrl?: string
  color: string         // fallback neon color hex
  isBot: boolean
  // runtime state
  position: number      // Y avanzamento nel percorso (0 = inizio, 1 = fine)
  finishTime?: number
  rank?: number
  activePowerup?: PowerupEffect
  activeDebuff?: DebuffEffect
  trailPositions: Array<{ x: number; y: number }> // ultimi 10 frame
  isStuck: boolean
  stuckTimer: number
}

export type ObstacleType =
  | 'peg' | 'rotatingPaddle' | 'bumper' | 'funnel'
  | 'trapdoor' | 'flipper' | 'narrowMaze' | 'fan'
  | 'magnet' | 'warpPortal' | 'trampoline' | 'tornado'
  | 'laserBlock' | 'spiralSlide' | 'iceZone' | 'mudZone'

export type PowerupType = 'turbo' | 'shield' | 'magnet' | 'ghost' | 'jumpPad'
export type DebuffType  = 'slow' | 'reverseGravity' | 'freeze' | 'shrink' | 'explosion'

export interface PowerupEffect {
  type: PowerupType
  remainingMs: number
}

export interface DebuffEffect {
  type: DebuffType
  remainingMs: number
}

export interface CourseSection {
  yStart: number
  yEnd: number
  theme: 'normal' | 'fast' | 'tight' | 'chaos'
  obstacles: ObstacleInstance[]
  collectibles: CollectibleInstance[]
}

export interface ObstacleInstance {
  id: string
  type: ObstacleType
  x: number
  y: number
  options: Record<string, unknown>
}

export interface CollectibleInstance {
  id: string
  kind: 'powerup' | 'debuff'
  type: PowerupType | DebuffType
  x: number
  y: number
  collected: boolean
}

export interface LeaderboardEntry {
  id: string
  createdAt: string
  winner: string
  winnerTime: number
  participants: number
  chaosMode: boolean
}
