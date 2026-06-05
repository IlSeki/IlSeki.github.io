import { useEffect } from "react";
import { useGameStore } from "@/store";

/**
 * Hook syncing leaderboard entries from state store. Fired on render.
 */
export function useLeaderboard() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const loadingLeaderboard = useGameStore((state) => state.loadingLeaderboard);
  const fetchLeaderboard = useGameStore((state) => state.fetchLeaderboard);
  const addLeaderboardEntry = useGameStore((state) => state.addLeaderboardEntry);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loadingLeaderboard,
    fetchLeaderboard,
    addLeaderboardEntry,
  };
}

export default useLeaderboard;
