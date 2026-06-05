import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { mulberry32, hashCode } from "@/engine/course/mulberry32";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats milliseconds into MM:SS.cc format (minutes, seconds, centiseconds).
 */
export function formatTime(ms: number): string {
  if (ms < 0 || isNaN(ms)) ms = 0;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  
  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");
  const cStr = centiseconds.toString().padStart(2, "0");
  
  return `${mStr}:${sStr}.${cStr}`;
}

/**
 * Returns a seed-bound PRNG function.
 */
export function getSeededRandom(seed: string) {
  const code = hashCode(seed);
  return mulberry32(code);
}
