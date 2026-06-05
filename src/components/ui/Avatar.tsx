import React from "react";
import { cn } from "@/lib/utils";
import { useImageLoader } from "@/hooks/useImageLoader";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  fallbackColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt,
  size = "md",
  fallbackColor = "#ff2d78",
  ...props
}) => {
  const { loadedImage, error } = useImageLoader(src);

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-xl"
  };

  const initial = alt ? alt.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center border border-white/10 shrink-0 font-bold select-none",
        sizeStyles[size],
        className
      )}
      style={!loadedImage || error ? { backgroundColor: fallbackColor } : {}}
      {...props}
    >
      {loadedImage && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-black font-black">{initial}</span>
      )}
    </div>
  );
};

export default Avatar;
