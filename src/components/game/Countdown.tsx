"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface CountdownProps {
  onComplete: () => void;
}

/**
 * Overlay countdown sequence (3 -> 2 -> 1 -> GO!).
 * Animates scale/opacity and plays synth tone updates at each interval.
 */
export const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number | string>(3);
  const { audioEngine } = useAudio();

  useEffect(() => {
    // Play sound for 3
    audioEngine.playCountdown(3);

    const t2 = setTimeout(() => {
      setCount(2);
      audioEngine.playCountdown(2);
    }, 1000);

    const t1 = setTimeout(() => {
      setCount(1);
      audioEngine.playCountdown(1);
    }, 2000);

    const tGo = setTimeout(() => {
      setCount("GO!");
      audioEngine.playCountdown(0);
    }, 3000);

    const tEnd = setTimeout(() => {
      onComplete();
    }, 3800); // Wait for the GO! text to finish playing

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tGo);
      clearTimeout(tEnd);
    };
  }, [onComplete, audioEngine]);

  const isGo = count === "GO!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: isGo ? 0.4 : 0.8, ease: "easeInOut" }}
          className="font-black text-8xl md:text-9xl uppercase tracking-widest"
          style={{
            color: isGo ? "#ffe600" : "#ff2d78",
            textShadow: isGo ? "0 0 30px #ffe600" : "0 0 30px #ff2d78"
          }}
        >
          {count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Countdown;
