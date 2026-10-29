import { LINKS } from "../site.js";
import { Column } from "./Column";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline">
      <Column className="py-6">
        <p className="font-mono text-meta text-muted flex flex-wrap items-center gap-x-2">
          Criterio is a public notebook on taste and judgment.
          <span aria-hidden="true">·</span>
          <a className="inline-flex items-center min-h-11 hover:text-ink" href={LINKS.x}>
            X
          </a>
          <span aria-hidden="true">·</span>
          <a className="inline-flex items-center min-h-11 hover:text-ink" href={LINKS.github}>
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a className="inline-flex items-center min-h-11 hover:text-ink" href={LINKS.rss}>
            RSS
          </a>
        </p>
      </Column>
    </footer>
  );
}
