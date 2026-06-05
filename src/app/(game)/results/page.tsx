"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store";
import Podium from "@/components/game/Podium";
import Confetti from "@/components/game/Confetti";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NeonText } from "@/components/ui/NeonText";
import { formatTime } from "@/lib/utils";

/**
 * Client-side component displaying the final podium and statistics.
 * Automatically posts completed race details to the backend API.
 */
export default function ResultsPage() {
  const router = useRouter();
  
  const marbles = useGameStore((state) => state.marbles);
  const seed = useGameStore((state) => state.seed);
  const chaosMode = useGameStore((state) => state.chaosMode);
  const resetToLobby = useGameStore((state) => state.resetToLobby);

  const isPostedRef = useRef(false);

  // Return to lobby if page was accessed directly
  useEffect(() => {
    if (marbles.length === 0) {
      router.push("/lobby");
    }
  }, [marbles, router]);

  // Post race data to database API
  useEffect(() => {
    if (isPostedRef.current || marbles.length === 0) return;

    const winner = marbles.find((m) => m.rank === 1);
    if (!winner || winner.finishTime === undefined) return;

    const postResults = async () => {
      try {
        const payload = {
          seed,
          duration: winner.finishTime! / 1000,
          chaosMode,
          entries: marbles.map((m) => ({
            marbleName: m.name,
            finishTime: m.finishTime ? m.finishTime / 1000 : null,
            position: m.rank || null,
            powerupsCollected: 0,
            debuffsHit: 0,
            isBot: m.isBot
          }))
        };

        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        isPostedRef.current = true;
      } catch (e) {
        console.error("Failed to post race standings to DB:", e);
      }
    };

    postResults();
  }, [marbles, seed, chaosMode]);

  const handlePlayAgain = () => {
    resetToLobby();
    router.push("/lobby");
  };

  const handleGoToLeaderboard = () => {
    router.push("/leaderboard");
  };

  const winner = marbles.find((m) => m.rank === 1);

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4 select-none">
      <Confetti />

      <div className="text-center mb-4">
        <NeonText as="h2" color="yellow" glitch className="text-3xl md:text-5xl font-black mb-2">
          VICTORY ROYAL!
        </NeonText>
        <p className="text-[#6b6b8a] text-xs uppercase font-bold tracking-widest">
          The race is finished. Hail the champion!
        </p>
      </div>

      <Podium marbles={marbles} />

      {winner && (
        <Card glowColor="yellow" className="w-full max-w-lg border-[#ffe600]/20 p-5 mt-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6b6b8a]">WINNING TIME</span>
          <h4 className="text-4xl font-black font-mono text-[#ffe600] mt-1 select-all">
            {winner.finishTime ? formatTime(winner.finishTime) : "00:00.00"}
          </h4>
          <p className="text-xs text-white/50 mt-2 select-text">
            Seed used: <span className="font-mono text-[#00f5ff]">{seed}</span> | 
            Chaos Mode: <span className={chaosMode ? "text-yellow-400 font-bold" : "text-white/40"}>{chaosMode ? "ENABLED" : "DISABLED"}</span>
          </p>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mt-6">
        <Button variant="neon" neonColor="pink" className="flex-1 py-3 text-sm font-black" onClick={handlePlayAgain}>
          PLAY AGAIN 🔄
        </Button>
        <Button variant="outline" neonColor="cyan" className="flex-1 py-3 text-sm font-black" onClick={handleGoToLeaderboard}>
          LEADERBOARD 🏆
        </Button>
      </div>
    </div>
  );
}
