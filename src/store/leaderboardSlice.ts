import { StateCreator } from "zustand";
import { LeaderboardEntry } from "@/types/game";

export interface LeaderboardSlice {
  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;

  fetchLeaderboard: () => Promise<void>;
  addLeaderboardEntry: (entry: Omit<LeaderboardEntry, "id" | "createdAt">) => Promise<void>;
}

export const createLeaderboardSlice: StateCreator<LeaderboardSlice & any, [], [], LeaderboardSlice> = (set, get) => ({
  leaderboard: [],
  loadingLeaderboard: false,

  fetchLeaderboard: async () => {
    set({ loadingLeaderboard: true });
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          set({ leaderboard: json.data });
          set({ loadingLeaderboard: false });
          return;
        }
      }
    } catch (e) {
      console.warn("API unavailable, falling back to localStorage", e);
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem("brainrot-marble-leaderboard");
      if (stored) {
        set({ leaderboard: JSON.parse(stored) });
      } else {
        // Initial mock static data if empty
        const defaultData = [
          {
            id: "mock-1",
            winner: "SIGMA",
            winnerTime: 32.45,
            chaosMode: true,
            createdAt: new Date().toISOString()
          },
          {
            id: "mock-2",
            winner: "GYATT",
            winnerTime: 36.72,
            chaosMode: false,
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem("brainrot-marble-leaderboard", JSON.stringify(defaultData));
        set({ leaderboard: defaultData });
      }
    } catch (err) {
      console.error("Failed to read from localStorage", err);
    } finally {
      set({ loadingLeaderboard: false });
    }
  },

  addLeaderboardEntry: async (entry) => {
    let success = false;
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed: entry.chaosMode ? "chaos" : "normal",
          duration: entry.winnerTime,
          chaosMode: entry.chaosMode,
          entries: [
            {
              marbleName: entry.winner,
              finishTime: entry.winnerTime,
              position: 1,
              powerupsCollected: 0,
              debuffsHit: 0,
              isBot: false,
            },
            {
              marbleName: "Second Place Bot",
              finishTime: entry.winnerTime + 3.0,
              position: 2,
              powerupsCollected: 0,
              debuffsHit: 0,
              isBot: true,
            }
          ]
        }),
      });
      if (res.ok) {
        success = true;
      }
    } catch (e) {
      console.warn("API unavailable for post, falling back to localStorage", e);
    }

    if (success) {
      await get().fetchLeaderboard();
    } else {
      // LocalStorage write fallback
      try {
        const stored = localStorage.getItem("brainrot-marble-leaderboard");
        const list = stored ? JSON.parse(stored) : [];
        const newEntry = {
          id: Math.random().toString(),
          winner: entry.winner,
          winnerTime: entry.winnerTime,
          chaosMode: entry.chaosMode,
          createdAt: new Date().toISOString()
        };
        list.unshift(newEntry);
        // keep top 100
        const trimmed = list.slice(0, 100);
        localStorage.setItem("brainrot-marble-leaderboard", JSON.stringify(trimmed));
        set({ leaderboard: trimmed });
      } catch (err) {
        console.error("Failed to write to localStorage", err);
      }
    }
  },
});
