import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "pink" | "cyan" | "green" | "yellow" | "purple";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const styles = {
    default: "bg-white/10 text-white border-white/20",
    pink: "bg-[#ff2d78]/10 text-[#ff2d78] border-[#ff2d78]/30 shadow-[0_0_8px_rgba(255,45,120,0.1)]",
    cyan: "bg-[#00f5ff]/10 text-[#00f5ff] border-[#00f5ff]/30 shadow-[0_0_8px_rgba(0,245,255,0.1)]",
    green: "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30 shadow-[0_0_8px_rgba(57,255,20,0.1)]",
    yellow: "bg-[#ffe600]/10 text-[#ffe600] border-[#ffe600]/30 shadow-[0_0_8px_rgba(255,230,0,0.1)]",
    purple: "bg-[#bf5fff]/10 text-[#bf5fff] border-[#bf5fff]/30 shadow-[0_0_8px_rgba(191,95,255,0.1)]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-widest",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
