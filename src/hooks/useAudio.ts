import { useEffect } from "react";
import { useGameStore } from "@/store";
import { audioEngine } from "@/engine/audio/AudioEngine";

/**
 * Hook coordinating global game mute states with Tone.js AudioEngine.
 */
export function useAudio() {
  const audioEnabled = useGameStore((state) => state.audioEnabled);
  const toggleAudio = useGameStore((state) => state.toggleAudio);
  const ambientEnabled = useGameStore((state) => state.ambientEnabled);

  useEffect(() => {
    audioEngine.setMuted(!audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    audioEngine.setAmbientHumMuted(!ambientEnabled);
  }, [ambientEnabled]);

  const initAudio = () => {
    audioEngine.init();
    audioEngine.setAmbientHumMuted(!ambientEnabled);
    audioEngine.setMuted(!audioEnabled);
  };

  return {
    audioEnabled,
    toggleAudio,
    initAudio,
    audioEngine,
  };
}

export default useAudio;
