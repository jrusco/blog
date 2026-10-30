import type { ReactNode } from "react";

export function Column({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`px-5 sm:px-6 ${className}`.trim()}>
      <div className={`mx-auto h-full min-w-0 ${wide ? "max-w-wide" : "max-w-measure"}`}>{children}</div>
    </div>
  );
}
