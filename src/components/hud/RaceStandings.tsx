"use client";

import React from "react";
import { useGameStore } from "@/store";
import { formatTime } from "@/lib/utils";
import { COURSE_HEIGHT } from "@/config/constants";

/**
 * HUD live standings scoreboard. Updates dynamic positions based on progress height
 * and completion time, adding visual cues for powerups, debuffs, and medal winners.
 */
export const RaceStandings: React.FC = () => {
  const marbles = useGameStore((state) => state.marbles);

  // Sorting strategy: 
  // 1st Priority: Finished marbles (sorted by completed rank)
  // 2nd Priority: Racing marbles (sorted by vertical advancement position)
  const sortedMarbles = [...marbles].sort((a, b) => {
    if (a.finishTime !== undefined && b.finishTime !== undefined) {
      return (a.rank || 0) - (b.rank || 0);
    }
    if (a.finishTime !== undefined) return -1;
    if (b.finishTime !== undefined) return 1;
    return b.position - a.position;
  });

  return (
    <div className="flex flex-col gap-2 bg-black/60 border border-white/10 rounded-xl p-4 w-60 max-h-[400px] overflow-y-auto backdrop-blur-md select-none">
      <h3 className="text-xs uppercase font-black tracking-widest text-[#6b6b8a] mb-2 border-b border-white/10 pb-1.5">
        LIVE STANDINGS
      </h3>
      <div className="flex flex-col gap-2">
        {sortedMarbles.map((marble, idx) => {
          const rank = idx + 1;
          const isFinished = marble.finishTime !== undefined;
          
          let medal = "";
          if (rank === 1) medal = "🥇";
          else if (rank === 2) medal = "🥈";
          else if (rank === 3) medal = "🥉";

          const powerup = marble.activePowerup ? "⚡" : "";
          const debuff = marble.activeDebuff ? "⚠️" : "";

          return (
            <div
              key={marble.id}
              className="flex justify-between items-center gap-2 text-xs py-1.5 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono font-bold w-4 text-white/40">{rank}</span>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: marble.color, boxShadow: `0 0 6px ${marble.color}` }}
                />
                <span className="font-bold truncate max-w-[95px] text-white">
                  {marble.name}
                </span>
                {medal && <span>{medal}</span>}
              </div>
              <div className="flex items-center gap-1 font-mono font-bold shrink-0">
                {powerup && <span className="text-[#39ff14] text-[10px]" title={marble.activePowerup?.type}>{powerup}</span>}
                {debuff && <span className="text-[#ff2d78] text-[10px]" title={marble.activeDebuff?.type}>{debuff}</span>}
                <span className={isFinished ? "text-[#ffe600]" : "text-[#6b6b8a]"}>
                  {isFinished
                    ? formatTime(marble.finishTime!)
                    : `${Math.round((marble.position / COURSE_HEIGHT) * 100)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaceStandings;
