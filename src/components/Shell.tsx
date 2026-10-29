import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-10 bg-page text-ink font-mono text-meta px-3 py-2 min-h-11"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
