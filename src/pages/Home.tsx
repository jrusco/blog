import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Field } from "../components/Field";
import { PaperStream } from "../components/PaperStream";
import { getArticles } from "../lib/articles";
import { phaseOf, phaseSearch, type Phase } from "../lib/journal-phase";

const articles = getArticles();
const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", " ", "End"]);

export function Home() {
  const [params, setParams] = useSearchParams();
  const phase = phaseOf(params);

  function setPhase(next: Phase) {
    setParams(phaseSearch(next), { replace: true });
  }

  useEffect(() => {
    if (phase === "journal") return;
    const timeout = window.setTimeout(() => setPhase("journal"), 4200);
    const begin = () => setPhase("journal");
    window.addEventListener("wheel", begin, { passive: true, once: true });
    window.addEventListener("touchmove", begin, { passive: true, once: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!SCROLL_KEYS.has(event.key)) return;
      // Space activates a focused control on keyup; starting here would race its click.
      if (event.key === " " && event.target instanceof Element && event.target.closest('button, a, [role="button"]')) return;
      begin();
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
    <Field>
      <section
        className={
          phase === "journal"
            ? "hero-copy is-gone relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center"
            : "hero-copy relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center"
        }
        inert={phase === "journal"}
      >
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
      </section>
      {phase === "journal" ? <PaperStream articles={articles} /> : null}
    </Field>
  );
}
