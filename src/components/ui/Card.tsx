import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "pink" | "cyan" | "green" | "yellow" | "purple" | "none";
}

export const Card: React.FC<CardProps> = ({
  className,
  glowColor = "none",
  children,
  ...props
}) => {
  const glowStyles = {
    none: "border-white/10 shadow-black/50",
    pink: "border-[#ff2d78]/30 shadow-[#ff2d78]/10 shadow-[0_0_15px_rgba(255,45,120,0.1)]",
    cyan: "border-[#00f5ff]/30 shadow-[#00f5ff]/10 shadow-[0_0_15px_rgba(0,245,255,0.1)]",
    green: "border-[#39ff14]/30 shadow-[#39ff14]/10 shadow-[0_0_15px_rgba(57,255,20,0.1)]",
    yellow: "border-[#ffe600]/30 shadow-[#ffe600]/10 shadow-[0_0_15px_rgba(255,230,0,0.1)]",
    purple: "border-[#bf5fff]/30 shadow-[#bf5fff]/10 shadow-[0_0_15px_rgba(191,95,255,0.1)]"
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 transition-all duration-500",
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
