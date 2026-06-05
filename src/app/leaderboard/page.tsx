"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useGameStore } from "@/store";
import { NeonText } from "@/components/ui/NeonText";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Client Component representing the global records board.
 * Observes the leaderboard from the Zustand store (falling back to localStorage if API is offline).
 */
export default function LeaderboardPage() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const loadingLeaderboard = useGameStore((state) => state.loadingLeaderboard);
  const fetchLeaderboard = useGameStore((state) => state.fetchLeaderboard);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="w-full flex flex-col items-center py-6 select-none">
      <div className="text-center mb-8">
        <NeonText as="h2" color="purple" glitch className="text-3xl md:text-4xl font-black mb-2">
          GLOBAL RECORDS
        </NeonText>
        <p className="text-[#6b6b8a] text-xs uppercase font-bold tracking-widest">
          historical summary lists of completed simulation races
        </p>
      </div>

      <Card glowColor="purple" className="w-full max-w-3xl border-[#bf5fff]/25 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black text-[#6b6b8a] uppercase tracking-widest">
                <th className="pb-3.5">DATE</th>
                <th className="pb-3.5">WINNER</th>
                <th className="pb-3.5">WIN TIME</th>
                <th className="pb-3.5">MODE</th>
                <th className="pb-3.5 text-right">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loadingLeaderboard ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/35 font-bold uppercase tracking-widest animate-pulse">
                    LOADING RECORDS...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/35 font-bold uppercase tracking-widest">
                    NO RECORDED RUNS YET
                  </td>
                </tr>
              ) : (
                leaderboard.map((race: any) => {
                  const dateStr = new Date(race.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr key={race.id} className="hover:bg-white/5 transition-all duration-200">
                      <td className="py-3 font-mono text-white/50">{dateStr}</td>
                      <td className="py-3 font-black text-[#00f5ff]">{race.winner}</td>
                      <td className="py-3 font-mono font-bold text-[#ffe600]">{Number(race.winnerTime).toFixed(2)}s</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                          race.chaosMode 
                            ? "bg-red-500/10 text-red-400 border-red-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}>
                          {race.chaosMode ? "CHAOS 🔥" : "NORMAL"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[#bf5fff]">{race.id.substring(0, 8)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-8">
        <Link href="/lobby">
          <Button variant="neon" neonColor="purple" size="lg" className="px-10 py-3 text-sm font-black select-none">
            LOBBY SETUP 🔄
          </Button>
        </Link>
      </div>
    </div>
  );
}
