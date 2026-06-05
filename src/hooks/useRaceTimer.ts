import { useState, useEffect, useRef } from "react";

/**
 * Hook providing a high-precision race stopwatch.
 * Uses performance.now() and requestAnimationFrame.
 * @param active If true, starts counting; otherwise pauses.
 */
export function useRaceTimer(active: boolean): { elapsed: number; reset: () => void } {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const elapsedOffsetRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      // Save current progress as offset in case we resume
      if (startTimeRef.current !== null) {
        elapsedOffsetRef.current += performance.now() - startTimeRef.current;
      }
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = performance.now();
    
    const update = () => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        const duration = now - startTimeRef.current + elapsedOffsetRef.current;
        setElapsed(duration);
      }
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active]);

  const reset = () => {
    elapsedOffsetRef.current = 0;
    setElapsed(0);
    if (active) {
      startTimeRef.current = performance.now();
    } else {
      startTimeRef.current = null;
    }
  };

  return { elapsed, reset };
}

export default useRaceTimer;
