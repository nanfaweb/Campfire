import React from "react";

export interface IconProps {
  name: string;
  fill?: boolean;
  size?: number;
  className?: string;
}

export function Icon({ name, fill = false, size = 24, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
}
