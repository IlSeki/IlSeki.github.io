import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "neon" | "outline" | "ghost";
  neonColor?: "pink" | "cyan" | "green" | "yellow" | "purple";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "default",
  neonColor = "pink",
  size = "md",
  children,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    default: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    neon: cn(
      "text-black font-bold uppercase tracking-wide shadow-lg",
      neonColor === "pink" && "bg-[#ff2d78] hover:bg-[#ff5795] shadow-[#ff2d78]/30 hover:shadow-[#ff2d78]/60 focus:ring-[#ff2d78]",
      neonColor === "cyan" && "bg-[#00f5ff] hover:bg-[#4ef8ff] shadow-[#00f5ff]/30 hover:shadow-[#00f5ff]/60 focus:ring-[#00f5ff]",
      neonColor === "green" && "bg-[#39ff14] hover:bg-[#68ff4f] shadow-[#39ff14]/30 hover:shadow-[#39ff14]/60 focus:ring-[#39ff14]",
      neonColor === "yellow" && "bg-[#ffe600] hover:bg-[#ffeb47] shadow-[#ffe600]/30 hover:shadow-[#ffe600]/60 focus:ring-[#ffe600]",
      neonColor === "purple" && "bg-[#bf5fff] hover:bg-[#d08aff] shadow-[#bf5fff]/30 hover:shadow-[#bf5fff]/60 focus:ring-[#bf5fff]"
    ),
    outline: cn(
      "border bg-transparent hover:bg-white/5",
      neonColor === "pink" && "border-[#ff2d78] text-[#ff2d78] hover:shadow-[0_0_10px_#ff2d78] focus:ring-[#ff2d78]",
      neonColor === "cyan" && "border-[#00f5ff] text-[#00f5ff] hover:shadow-[0_0_10px_#00f5ff] focus:ring-[#00f5ff]",
      neonColor === "green" && "border-[#39ff14] text-[#39ff14] hover:shadow-[0_0_10px_#39ff14] focus:ring-[#39ff14]",
      neonColor === "yellow" && "border-[#ffe600] text-[#ffe600] hover:shadow-[0_0_10px_#ffe600] focus:ring-[#ffe600]",
      neonColor === "purple" && "border-[#bf5fff] text-[#bf5fff] hover:shadow-[0_0_10px_#bf5fff] focus:ring-[#bf5fff]"
    ),
    ghost: "text-white/60 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3 text-lg"
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
