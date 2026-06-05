"use client";

import React, { useEffect, useRef } from "react";
import { useGameStore } from "@/store";
import { COURSE_HEIGHT } from "@/config/constants";

/**
 * HUD mini-map component. Renders a vertical representation of the course
 * showing all marbles' height relative to start (top) and finish (bottom).
 */
export const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const marbles = useGameStore((state) => state.marbles);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Semitransparent background
      ctx.fillStyle = "rgba(10, 10, 15, 0.75)";
      ctx.fillRect(0, 0, width, height);

      // Track center line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2, 12);
      ctx.lineTo(width / 2, height - 12);
      ctx.stroke();

      // Finish line
      ctx.strokeStyle = "#ff2d78";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 4, height - 12);
      ctx.lineTo((3 * width) / 4, height - 12);
      ctx.stroke();

      // Plot marbles on the track
      marbles.forEach((m) => {
        // Map position (0 = start, COURSE_HEIGHT = finish)
        const ratio = Math.min(Math.max(m.position / COURSE_HEIGHT, 0), 1);
        const y = 12 + ratio * (height - 24);
        const x = width / 2;

        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // clear shadow filter
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [marbles]);

  return (
    <div className="relative border border-[#00f5ff]/30 rounded-lg overflow-hidden shadow-[0_0_12px_rgba(0,245,255,0.2)] bg-black/60">
      <canvas ref={canvasRef} width={100} height={300} className="block w-[100px] h-[300px]" />
    </div>
  );
};

export default MiniMap;
