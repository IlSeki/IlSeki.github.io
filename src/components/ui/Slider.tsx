import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  neonColor?: "pink" | "cyan" | "green" | "yellow" | "purple";
}

export const Slider: React.FC<SliderProps> = ({
  className,
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  neonColor = "pink",
  ...props
}) => {
  const accentColors = {
    pink: "accent-[#ff2d78]",
    cyan: "accent-[#00f5ff]",
    green: "accent-[#39ff14]",
    yellow: "accent-[#ffe600]",
    purple: "accent-[#bf5fff]"
  };

  const textColors = {
    pink: "text-[#ff2d78]",
    cyan: "text-[#00f5ff]",
    green: "text-[#39ff14]",
    yellow: "text-[#ffe600]",
    purple: "text-[#bf5fff]"
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-xs uppercase font-bold tracking-wider text-[#6b6b8a] ml-1">
        <span>{label}</span>
        <span className={cn("font-mono font-bold", textColors[neonColor])}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer outline-none transition-all duration-300",
          accentColors[neonColor],
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Slider;
