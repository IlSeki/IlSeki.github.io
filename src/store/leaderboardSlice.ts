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
        }
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    } finally {
      set({ loadingLeaderboard: false });
    }
  },

  addLeaderboardEntry: async (entry) => {
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
        // Refresh local listings
        await get().fetchLeaderboard();
      }
    } catch (e) {
      console.error("Failed to post leaderboard entry", e);
    }
  },
});
