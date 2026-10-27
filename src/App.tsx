import { Button } from "./components/ui/button";

const VIDEO_SRC = "/hero.mp4";

const NAV = [
  { label: "Home", href: "#top", active: true },
  { label: "Studio", href: "#studio" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Reach Us", href: "#reach" },
] as const;

const displayFont = { fontFamily: "'Instrument Serif', serif" } as const;

export default function App() {
  return (
    <div id="top" className="relative h-dvh min-h-dvh overflow-hidden bg-background text-foreground">
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

      <div className="relative z-10 flex h-full min-h-dvh flex-col">
        <header>
          <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
            <a href="#top" className="text-3xl tracking-tight text-foreground" style={displayFont}>
              Velorah
              <sup className="text-xs">®</sup>
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={"active" in item && item.active ? "page" : undefined}
                  className={
                    "active" in item && item.active
                      ? "text-sm text-foreground transition-colors"
                      : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Button type="button" variant="glass" size="nav">
              Begin Journey
            </Button>
          </nav>
        </header>

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center">
          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl"
            style={displayFont}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the
            chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <Button type="button" variant="glass" size="hero" className="animate-fade-rise-delay-2">
            Begin Journey
          </Button>
        </main>
      </div>
    </div>
  );
}
