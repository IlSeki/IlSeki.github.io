"use client";

import React from "react";
import { useGameStore } from "@/store";
import { formatTime } from "@/lib/utils";

/**
 * Race stopwatch HUD component. Reads global elapsed time in ms from Zustand.
 */
export const RaceTimer: React.FC = () => {
  const elapsedMs = useGameStore((state) => state.elapsedMs);
  return (
    <div className="font-mono text-2xl md:text-3xl font-black bg-black/60 border border-white/10 rounded-lg px-4 py-1.5 text-[#00f5ff] shadow-[0_0_12px_rgba(0,245,255,0.25)] select-none">
      {formatTime(elapsedMs)}
    </div>
  );
};

export default RaceTimer;
