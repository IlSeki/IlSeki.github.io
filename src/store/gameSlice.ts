import { StateCreator } from "zustand";
import { GamePhase, Marble } from "@/types/game";
import { brainrotNames } from "@/config/brainrotNames";
import { THEME } from "@/config/theme";

export interface GameSlice {
  phase: GamePhase;
  marbles: Marble[];
  seed: string;
  elapsedMs: number;

  setPhase: (phase: GamePhase) => void;
  setSeed: (seed: string) => void;
  setElapsedMs: (elapsedMs: number) => void;
  addMarble: (name: string, imageUrl?: string) => void;
  removeMarble: (id: string) => void;
  startRace: () => void;
  finishMarble: (id: string, timeMs: number) => void;
  updateMarbleState: (id: string, partial: Partial<Marble>) => void;
  endRace: () => void;
  resetToLobby: () => void;
  populateBots: (count: number) => void;
}

const NEON_COLORS = [
  THEME.colors.neonPink,
  THEME.colors.neonCyan,
  THEME.colors.neonYellow,
  THEME.colors.neonGreen,
  THEME.colors.neonPurple,
];

export const createGameSlice: StateCreator<GameSlice & any, [], [], GameSlice> = (set, get) => ({
  phase: "lobby",
  marbles: [],
  seed: "rizzler",
  elapsedMs: 0,

  setPhase: (phase) => set({ phase }),
  setSeed: (seed) => set({ seed }),
  setElapsedMs: (elapsedMs) => set({ elapsedMs }),

  addMarble: (name, imageUrl) => {
    const isChaos = name.toLowerCase() === "chaos";
    const newMarble: Marble = {
      id: `marble_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      imageUrl,
      color: NEON_COLORS[get().marbles.length % NEON_COLORS.length],
      isBot: false,
      position: 0,
      trailPositions: [],
      isStuck: false,
      stuckTimer: 0,
    };
    
    set((state: any) => ({
      marbles: [...state.marbles, newMarble],
      ...(isChaos ? { chaosMode: true } : {})
    }));
  },

  removeMarble: (id) => set((state: any) => ({
    marbles: state.marbles.filter((m: Marble) => m.id !== id),
  })),

  startRace: () => {
    let currentMarbles = [...get().marbles];
    const totalNeeded = Math.max(2, currentMarbles.length); // minimum 2 marbles
    
    if (currentMarbles.length < totalNeeded) {
      const needed = totalNeeded - currentMarbles.length;
      const shuffledNames = [...brainrotNames].sort(() => 0.5 - Math.random());
      for (let i = 0; i < needed; i++) {
        const name = shuffledNames[i % shuffledNames.length];
        currentMarbles.push({
          id: `bot_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
          name,
          color: NEON_COLORS[currentMarbles.length % NEON_COLORS.length],
          isBot: true,
          position: 0,
          trailPositions: [],
          isStuck: false,
          stuckTimer: 0,
        });
      }
    }

    set({
      phase: "countdown",
      marbles: currentMarbles.map((m: Marble) => ({
        ...m,
        position: 0,
        finishTime: undefined,
        rank: undefined,
        activePowerup: undefined,
        activeDebuff: undefined,
        trailPositions: [],
        isStuck: false,
        stuckTimer: 0,
      })),
      elapsedMs: 0,
    });
  },

  finishMarble: (id, timeMs) => set((state: any) => {
    const marbleIndex = state.marbles.findIndex((m: Marble) => m.id === id);
    if (marbleIndex === -1 || state.marbles[marbleIndex].finishTime !== undefined) {
      return {};
    }

    const finishers = state.marbles.filter((m: Marble) => m.finishTime !== undefined);
    const rank = finishers.length + 1;

    const updatedMarbles = state.marbles.map((m: Marble) => 
      m.id === id ? { ...m, finishTime: timeMs, rank } : m
    );

    return { marbles: updatedMarbles };
  }),

  updateMarbleState: (id, partial) => set((state: any) => ({
    marbles: state.marbles.map((m: Marble) => (m.id === id ? { ...m, ...partial } : m)),
  })),

  endRace: () => set({ phase: "results" }),

  resetToLobby: () => set((state: any) => ({
    phase: "lobby",
    marbles: state.marbles.map((m: Marble) => ({
      ...m,
      position: 0,
      finishTime: undefined,
      rank: undefined,
      activePowerup: undefined,
      activeDebuff: undefined,
      trailPositions: [],
      isStuck: false,
      stuckTimer: 0,
    })),
    elapsedMs: 0,
  })),

  populateBots: (count) => set((state: any) => {
    const currentMarbles = [...state.marbles];
    const shuffledNames = [...brainrotNames].sort(() => 0.5 - Math.random());
    const bots: Marble[] = [];
    for (let i = 0; i < count; i++) {
      const name = shuffledNames[i % shuffledNames.length];
      bots.push({
        id: `bot_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        name,
        color: NEON_COLORS[(currentMarbles.length + bots.length) % NEON_COLORS.length],
        isBot: true,
        position: 0,
        trailPositions: [],
        isStuck: false,
        stuckTimer: 0,
      });
    }
    return { marbles: [...currentMarbles, ...bots] };
  }),
});
