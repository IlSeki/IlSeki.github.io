"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store";
import { useAudio } from "@/hooks/useAudio";
import Countdown from "@/components/game/Countdown";
import GameCanvas from "@/components/game/GameCanvas";
import RaceTimer from "@/components/hud/RaceTimer";
import MiniMap from "@/components/hud/MiniMap";
import RaceStandings from "@/components/hud/RaceStandings";
import AudioToggle from "@/components/hud/AudioToggle";

/**
 * Client-side component for running the live race simulation.
 * Manages countdown sequences, canvas mounts, and maps HUD panels.
 */
export default function RacePage() {
  const router = useRouter();
  
  const phase = useGameStore((state) => state.phase);
  const setPhase = useGameStore((state) => state.setPhase);
  const marbles = useGameStore((state) => state.marbles);
  
  const { initAudio, audioEngine } = useAudio();
  const [showCountdown, setShowCountdown] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return to setup lobby if empty
  useEffect(() => {
    if (mounted && marbles.length === 0) {
      router.push("/lobby");
    }
  }, [marbles, router, mounted]);

  // Navigate to summary results page upon simulation end
  useEffect(() => {
    if (phase === "results") {
      router.push("/results");
    }
  }, [phase, router]);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    initAudio();
    audioEngine.startAmbient();
    setPhase("racing");
  };

  useEffect(() => {
    return () => {
      audioEngine.stopAmbient();
    };
  }, [audioEngine]);

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[600px] select-none">
        <div className="animate-pulse text-[#6b6b8a] text-xs font-bold uppercase tracking-widest">
          LOADING ARENA...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 py-2 relative select-none">
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 w-full max-w-5xl">
        {/* Canvas Display */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="flex justify-between items-center w-full max-w-[600px] px-1">
            <RaceTimer />
            <AudioToggle />
          </div>
          
          <GameCanvas />
        </div>

        {/* Stats Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-5 shrink-0 mt-0 lg:mt-12">
          <RaceStandings />
          <MiniMap />
        </div>
      </div>
    </div>
  );
}
