"use client";

import React, { useEffect, useRef } from "react";

/**
 * Confetti Canvas overlay that spawns 200 gravity-bound falling particles.
 * Auto-terminates rendering after 4 seconds.
 */
export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const NEON_COLORS = ["#ff2d78", "#00f5ff", "#ffe600", "#39ff14", "#bf5fff"];
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotSpeed: number;
    }

    const particles: Particle[] = [];
    const count = 200;

    // Initialize particles slightly scattered above the top viewport boundary
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: -20 - Math.random() * 200,
        vx: -3 + Math.random() * 6,
        vy: 2 + Math.random() * 5,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * Math.PI,
        rotSpeed: -0.1 + Math.random() * 0.2
      });
    }

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    const startTime = Date.now();
    const duration = 4000; // 4 seconds duration

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        cancelAnimationFrame(animationFrameId);
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.vy += 0.2; // gravity pull
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Render confetti rectangle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none w-screen h-screen"
    />
  );
};

export default Confetti;
