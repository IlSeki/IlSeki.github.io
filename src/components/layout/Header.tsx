"use client";

import React from "react";
import Link from "next/link";
import { NeonText } from "../ui/NeonText";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/store";

/**
 * Standard app navigation bar with logo, links, and audio control.
 */
export const Header: React.FC = () => {
  const { audioEnabled, toggleAudio } = useAudio();
  const phase = useGameStore((state) => state.phase);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
      <Link href="/lobby">
        <div className="flex items-center gap-2 cursor-pointer">
          <NeonText as="h1" color="pink" className="text-lg md:text-xl font-black select-none">
            BRAINROT MARBLE MAYHEM
          </NeonText>
        </div>
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-widest text-[#6b6b8a] hover:text-white transition-colors">
          LEADERBOARD
        </Link>
        {phase === "lobby" && (
          <Link href="/lobby" className="text-xs font-bold uppercase tracking-widest text-white hover:text-[#ff2d78] transition-colors">
            LOBBY
          </Link>
        )}
        <button
          onClick={toggleAudio}
          className="text-[#6b6b8a] hover:text-white cursor-pointer transition-colors text-xs uppercase font-bold tracking-widest"
          aria-label={!mounted ? "Mute audio" : audioEnabled ? "Mute audio" : "Unmute audio"}
        >
          {!mounted ? "🔊 SOUND ON" : audioEnabled ? "🔊 SOUND ON" : "🔇 MUTED"}
        </button>
      </nav>
    </header>
  );
};

export default Header;
