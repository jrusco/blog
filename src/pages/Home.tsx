import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Field, displayFont } from "../components/Field";
import { PaperStream } from "../components/PaperStream";
import { getArticles } from "../lib/articles";

const articles = getArticles();
const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", " ", "End"]);

export function Home() {
  const [params, setParams] = useSearchParams();
  const phase = params.get("stream") === "1" ? "journal" : "arrive";

  function setPhase(next: "arrive" | "journal") {
    setParams(next === "journal" ? { stream: "1" } : {}, { replace: true });
  }

  useEffect(() => {
    if (phase === "journal") return;
    const timeout = window.setTimeout(() => setPhase("journal"), 4200);
    const begin = () => setPhase("journal");
    window.addEventListener("wheel", begin, { passive: true, once: true });
    window.addEventListener("touchmove", begin, { passive: true, once: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) begin();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("wheel", begin);
      window.removeEventListener("touchmove", begin);
      window.removeEventListener("keydown", onKeyDown);
    };
    // setPhase is recreated each render; the effect only needs to arm once per phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <Field phase={phase} onHome={() => setPhase("arrive")} onJournal={() => setPhase("journal")} onBegin={() => setPhase("journal")}>
      <main
        className={
          phase === "journal"
            ? "hero-copy is-gone relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center"
            : "hero-copy relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center"
        }
      >
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl"
          style={displayFont}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
          <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we
          build digital spaces for sharp focus and inspired work.
        </p>
        <button
          type="button"
          onClick={() => setPhase("journal")}
          className="liquid-glass animate-fade-rise-delay-2 mt-12 rounded-full px-14 py-5 text-base text-foreground"
        >
          Begin Journey
        </button>
      </main>
      {phase === "journal" ? <PaperStream articles={articles} /> : null}
    </Field>
  );
}
