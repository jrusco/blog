import { NavLink } from "react-router-dom";
import { Column } from "./Column";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="h-16">
      <Column className="h-full">
        <nav aria-label="Site" className="flex h-full items-center justify-between">
          <NavLink
            to="/"
            end
            className="text-wordmark text-ink no-underline inline-flex items-center min-h-11 hover:text-accent"
          >
            Criterio
          </NavLink>
          <div className="flex items-center gap-2">
            <NavLink
              to="/archive"
              className="font-mono text-meta uppercase text-muted inline-flex items-center min-h-11 px-2 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:decoration-current"
            >
              Archive
            </NavLink>
            <ThemeToggle />
          </div>
        </nav>
      </Column>
    </header>
  );
}
