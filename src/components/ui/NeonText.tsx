import React from "react";
import { cn } from "@/lib/utils";

interface NeonTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  color?: "pink" | "cyan" | "green" | "yellow" | "purple";
  glitch?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export const NeonText: React.FC<NeonTextProps> = ({
  className,
  color = "pink",
  glitch = false,
  as: Component = "h2",
  children,
  ...props
}) => {
  const glowColors = {
    pink: "text-[#ff2d78] drop-shadow-[0_0_8px_#ff2d78]",
    cyan: "text-[#00f5ff] drop-shadow-[0_0_8px_#00f5ff]",
    green: "text-[#39ff14] drop-shadow-[0_0_8px_#39ff14]",
    yellow: "text-[#ffe600] drop-shadow-[0_0_8px_#ffe600]",
    purple: "text-[#bf5fff] drop-shadow-[0_0_8px_#bf5fff]"
  };

  return (
    <Component
      className={cn(
        "font-black uppercase tracking-widest",
        glowColors[color],
        glitch && "animate-glitch",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default NeonText;
