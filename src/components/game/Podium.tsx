"use client";

import React from "react";
import { motion } from "framer-motion";
import { Marble } from "@/types/game";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { formatTime } from "@/lib/utils";

interface PodiumProps {
  marbles: Marble[];
}

/**
 * Animated results podium for 1st, 2nd, and 3rd positions.
 * Arranges columns symmetrically (2nd, 1st, 3rd) and triggers staggered reveals.
 */
export const Podium: React.FC<PodiumProps> = ({ marbles }) => {
  const topThree = [...marbles]
    .filter((m) => m.rank !== undefined)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0))
    .slice(0, 3);

  // Symmetric order on podium: [2nd, 1st, 3rd]
  const podiumPositions = [
    topThree.find((m) => m.rank === 2),
    topThree.find((m) => m.rank === 1),
    topThree.find((m) => m.rank === 3),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.25 }
    }
  };

  const itemVariants = {
    hidden: { y: 150, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 70, damping: 14 } 
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-end justify-center gap-3 md:gap-6 w-full max-w-xl mx-auto mt-12 mb-6 h-80 px-2"
    >
      {podiumPositions.map((marble, index) => {
        if (!marble) return <div key={index} className="w-24 md:w-32" />; // placeholder spacing

        const is1st = marble.rank === 1;
        const is2nd = marble.rank === 2;
        const is3rd = marble.rank === 3;

        let heightClass = "h-32";
        let titleColor = "text-[#c0c0c0]";
        let podiumColor = "bg-white/5 border-white/10";
        let rankLabel = "2ND";

        if (is1st) {
          heightClass = "h-48";
          titleColor = "text-[#ffd700] drop-shadow-[0_0_12px_#ffd700]";
          podiumColor = "bg-[#ffd700]/15 border-[#ffd700]/40 shadow-[0_0_20px_rgba(255,215,0,0.1)]";
          rankLabel = "👑 1ST";
        } else if (is3rd) {
          heightClass = "h-24";
          titleColor = "text-[#cd7f32]";
          podiumColor = "bg-[#cd7f32]/15 border-[#cd7f32]/40";
          rankLabel = "3RD";
        }

        return (
          <motion.div
            key={marble.id}
            variants={itemVariants}
            className="flex flex-col items-center w-24 md:w-32 text-center select-none"
          >
            <div className="relative mb-3 flex flex-col items-center">
              <Avatar
                src={marble.imageUrl}
                alt={marble.name}
                size={is1st ? "lg" : "md"}
                fallbackColor={marble.color}
                className={is1st ? "border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.4)]" : "border-white/10"}
              />
              <span className="text-[10px] md:text-xs font-black uppercase mt-1.5 max-w-[80px] md:max-w-[110px] truncate text-white">
                {marble.name}
              </span>
              <span className="text-[10px] text-white/50 font-mono mt-0.5">
                {marble.finishTime ? formatTime(marble.finishTime) : ""}
              </span>
            </div>

            <Card
              className={`w-full flex flex-col justify-center items-center rounded-t-xl rounded-b-none p-1 ${heightClass} ${podiumColor}`}
            >
              <h3 className={`text-base md:text-lg font-black uppercase tracking-wider ${titleColor}`}>
                {rankLabel}
              </h3>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Podium;
