import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GameSlice, createGameSlice } from "./gameSlice";
import { SettingsSlice, createSettingsSlice } from "./settingsSlice";
import { LeaderboardSlice, createLeaderboardSlice } from "./leaderboardSlice";

export type GameStoreState = GameSlice & SettingsSlice & LeaderboardSlice;

export const useGameStore = create<GameStoreState>()(
  persist(
    (...a) => ({
      ...createGameSlice(...a),
      ...createSettingsSlice(...a),
      ...createLeaderboardSlice(...a),
    }),
    {
      name: "brainrot-marble-mayhem-store",
      partialize: (state) => ({
        // Only persist configuration parameters locally
        chaosMode: state.chaosMode,
        audioEnabled: state.audioEnabled,
        ambientEnabled: state.ambientEnabled,
      }),
    }
  )
);

export default useGameStore;
