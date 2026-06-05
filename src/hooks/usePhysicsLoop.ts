import { useEffect, useRef } from "react";

/**
 * Custom hook to manage the requestAnimationFrame game loop.
 * Capped to avoid extreme jumps during lag or background tab throttling.
 * @param active If true, starts/continues the loop; otherwise pauses.
 * @param onTick Callback fired on every tick with the elapsed delta time.
 */
export function usePhysicsLoop(
  active: boolean,
  onTick: (delta: number) => void
): void {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const onTickRef = useRef(onTick);
  
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);
  
  useEffect(() => {
    if (!active) {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
      return;
    }
    
    const loop = (time: number) => {
      if (previousTimeRef.current !== null) {
        const delta = time - previousTimeRef.current;
        // Cap physics time step at 100ms (10fps) to prevent collisions tunnel through walls
        const cappedDelta = Math.min(delta, 100);
        onTickRef.current(cappedDelta);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [active]);
}

export default usePhysicsLoop;
