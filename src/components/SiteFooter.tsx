import { useLocation } from "react-router-dom";
import { LINKS } from "../site.js";
import { Column } from "./Column";

export function SiteFooter() {
  const onHome = useLocation().pathname === "/";
  const tone = onHome ? "text-on-video" : "text-muted";

  return (
    <footer className={onHome ? "absolute inset-x-0 bottom-0 z-30" : "mt-24 border-t border-hairline"}>
      <Column className="py-6">
        <p className={`font-mono text-meta flex flex-wrap items-center gap-x-2 sm:flex-nowrap sm:whitespace-nowrap ${tone}`}>
          Criterio is a public notebook on taste and judgment.
          <span className="inline-flex items-baseline gap-x-2 whitespace-nowrap">
            <span aria-hidden="true">·</span>
            <a className={`${tone} hover:text-ink inline-flex items-center min-h-11 px-1 -mx-1`} href={LINKS.x}>
              X
            </a>
          </span>
          <span className="inline-flex items-baseline gap-x-2 whitespace-nowrap">
            <span aria-hidden="true">·</span>
            <a className={`${tone} hover:text-ink inline-flex items-center min-h-11 px-1 -mx-1`} href={LINKS.github}>
              GitHub
            </a>
          </span>
          <span className="inline-flex items-baseline gap-x-2 whitespace-nowrap">
            <span aria-hidden="true">·</span>
            <a className={`${tone} hover:text-ink inline-flex items-center min-h-11 px-1 -mx-1`} href={LINKS.rss}>
              RSS
            </a>
          </span>
        </p>
      </Column>
    </footer>
  );
}
