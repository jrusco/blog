import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const VIDEO_SRC = "/hero.mp4";
const displayFont = { fontFamily: "'Instrument Serif', serif" } as const;

const LINKS = ["Studio", "About", "Reach Us"] as const;

export function Field({
  dim = false,
  phase = "arrive",
  onHome,
  onJournal,
  onBegin,
  children,
}: {
  dim?: boolean;
  phase?: "arrive" | "journal";
  onHome?: () => void;
  onJournal?: () => void;
  onBegin?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={
        dim
          ? "relative h-dvh min-h-dvh overflow-y-auto bg-background text-foreground"
          : "relative flex h-dvh min-h-dvh flex-col overflow-hidden bg-background text-foreground"
      }
    >
      <video
        className={
          dim
            ? "absolute inset-0 z-0 h-full w-full object-cover opacity-25"
            : "absolute inset-0 z-0 h-full w-full object-cover"
        }
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        src={VIDEO_SRC}
      />
      {dim ? <div className="absolute inset-0 z-0 bg-background/80" /> : null}

      <header className="relative z-30">
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          {onHome ? (
            <button
              type="button"
              onClick={onHome}
              className="text-3xl tracking-tight text-foreground"
              style={displayFont}
            >
              Velorah
              <sup className="text-xs">®</sup>
            </button>
          ) : (
            <Link to="/?stream=1" className="text-3xl tracking-tight text-foreground" style={displayFont}>
              Velorah
              <sup className="text-xs">®</sup>
            </Link>
          )}

          <div className="hidden items-center gap-8 md:flex">
            {onHome ? (
              <button
                type="button"
                onClick={onHome}
                className={
                  phase === "arrive"
                    ? "text-sm text-foreground transition-colors"
                    : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                Home
              </button>
            ) : (
              <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Home
              </Link>
            )}
            {LINKS.slice(0, 2).map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
            {onJournal ? (
              <button
                type="button"
                onClick={onJournal}
                aria-current={phase === "journal" ? "page" : undefined}
                className={
                  phase === "journal"
                    ? "text-sm text-foreground transition-colors"
                    : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                Journal
              </button>
            ) : (
              <Link
                to="/?stream=1"
                className="text-sm text-foreground transition-colors"
                aria-current="page"
              >
                Journal
              </Link>
            )}
            <a href="#reach" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Reach Us
            </a>
          </div>

          {onBegin ? (
            <button type="button" onClick={onBegin} className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground">
              Begin Journey
            </button>
          ) : (
            <Link
              to="/?stream=1"
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground"
            >
              Begin Journey
            </Link>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}

export { displayFont };
