"use client";

import React from "react";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/store";
import { Button } from "../ui/Button";

/**
 * Floating HUD button to toggle sound mute and ambient hum.
 */
export const AudioToggle: React.FC = () => {
  const { audioEnabled, toggleAudio } = useAudio();
  const ambientEnabled = useGameStore((state) => state.ambientEnabled);
  const toggleAmbient = useGameStore((state) => state.toggleAmbient);
  
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Ambient Hum Toggle */}
      <Button
        variant="outline"
        neonColor="yellow"
        onClick={toggleAmbient}
        className="w-10 h-10 rounded-full p-0 flex items-center justify-center border-[#ffe600]/30 text-[#ffe600] hover:shadow-[0_0_10px_#ffe600] cursor-pointer"
        title={!mounted ? "Mute ambient hum" : ambientEnabled ? "Mute ambient hum (Low Hz)" : "Unmute ambient hum (Low Hz)"}
        aria-label={!mounted ? "Mute ambient hum" : ambientEnabled ? "Mute ambient hum" : "Unmute ambient hum"}
      >
        <span className="text-base">{!mounted ? "🌀" : ambientEnabled ? "🌀" : "💤"}</span>
      </Button>

      {/* General Audio Toggle */}
      <Button
        variant="outline"
        neonColor="cyan"
        onClick={toggleAudio}
        className="w-10 h-10 rounded-full p-0 flex items-center justify-center border-[#00f5ff]/30 text-[#00f5ff] hover:shadow-[0_0_10px_#00f5ff] cursor-pointer"
        title={!mounted ? "Mute all sounds" : audioEnabled ? "Mute all sounds" : "Unmute all sounds"}
        aria-label={!mounted ? "Mute audio" : audioEnabled ? "Mute audio" : "Unmute audio"}
      >
        <span className="text-base">{!mounted ? "🔊" : audioEnabled ? "🔊" : "🔇"}</span>
      </Button>
    </div>
  );
};

export default AudioToggle;
