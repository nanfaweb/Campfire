import React from "react";

export interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  ring?: boolean;
}

export function Avatar({ src, alt = "", size = 40, ring = false }: AvatarProps) {
  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden bg-orange-50 ${ring ? "p-[3px] story-ring" : ""}`}
      style={{ width: size, height: size }}
    >
      {ring ? (
        <div className="bg-white p-0.5 rounded-full w-full h-full">
          <img
            src={src}
            alt={alt}
            className="rounded-full w-full h-full object-cover"
          />
        </div>
      ) : (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      )}
    </div>
  );
}
