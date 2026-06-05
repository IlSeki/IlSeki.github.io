import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  neonColor?: "pink" | "cyan" | "green" | "yellow" | "purple";
}

export const Input: React.FC<InputProps> = ({
  className,
  label,
  neonColor = "cyan",
  id,
  ...props
}) => {
  const reactId = useId();
  const inputId = id || reactId;
  
  const borderColors = {
    pink: "focus:border-[#ff2d78] focus:shadow-[0_0_8px_#ff2d78]",
    cyan: "focus:border-[#00f5ff] focus:shadow-[0_0_8px_#00f5ff]",
    green: "focus:border-[#39ff14] focus:shadow-[0_0_8px_#39ff14]",
    yellow: "focus:border-[#ffe600] focus:shadow-[0_0_8px_#ffe600]",
    purple: "focus:border-[#bf5fff] focus:shadow-[0_0_8px_#bf5fff]"
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs uppercase font-bold tracking-wider text-[#6b6b8a] ml-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 transition-all duration-300 outline-none",
          borderColors[neonColor],
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;
