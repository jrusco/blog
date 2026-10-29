import type { ReactNode } from "react";

const VIDEO_SRC = `${import.meta.env.BASE_URL}hero.mp4`;

export function Field({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-page text-ink">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        src={VIDEO_SRC}
      />
      {children}
    </div>
  );
}
