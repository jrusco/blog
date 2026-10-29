import type { ReactNode } from "react";

export function Column({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 sm:px-6 ${className}`.trim()}>
      <div className="mx-auto h-full max-w-measure">{children}</div>
    </div>
  );
}
