import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, streamTiming, type Article } from "../lib/articles";

const LANES = [
  { y: "12%", w: 232, rot: -7, z: 5 },
  { y: "26%", w: 188, rot: 5, z: 3 },
  { y: "18%", w: 160, rot: -3, z: 2 },
  { y: "34%", w: 210, rot: 4, z: 4 },
  { y: "16%", w: 148, rot: -5, z: 1 },
];

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

const MIN_VISIBLE = 0.6;

function visibleFraction(rect: DOMRect) {
  const w = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
  const h = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  return (w * h) / (rect.width * rect.height);
}

function SheetFace({ article }: { article: Article }) {
  return (
    <>
      <span className="paper-kicker">{formatDate(article.date)}</span>
      <span className="paper-title">{article.title}</span>
      <span className="paper-summary">{article.summary}</span>
    </>
  );
}

function FlyingSheet({
  articles,
  slot,
  slotCount,
  duration,
  gap,
  scale,
  narrow,
}: {
  articles: Article[];
  slot: number;
  slotCount: number;
  duration: number;
  gap: number;
  scale: number;
  narrow: boolean;
}) {
  const [cycle, setCycle] = useState(0);
  const lane = LANES[slot % LANES.length];
  const article = articles[(slot + cycle * slotCount) % articles.length];
  const width = Math.round(lane.w * (narrow ? 0.78 : 1));

  return (
    <Link
      to={`/journal/${article.slug}`}
      className="paper-sheet"
      style={{
        ["--paper-y" as string]: lane.y,
        ["--paper-w" as string]: `${width}px`,
        ["--paper-rot" as string]: `${lane.rot}deg`,
        ["--paper-dur" as string]: `${duration}s`,
        ["--paper-delay" as string]: `${slot * gap}s`,
        ["--paper-scale" as string]: scale,
        ["--paper-z" as string]: lane.z,
      }}
      onAnimationIteration={() => setCycle((current) => current + 1)}
    >
      <SheetFace article={article} />
    </Link>
  );
}

export function PaperStream({ articles }: { articles: Article[] }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 760px)");
  const streamRef = useRef<HTMLDivElement>(null);

  // Sheets move, so decide at Tab time (capture runs before focus navigation) which ones are in view.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !streamRef.current) return;
      for (const sheet of streamRef.current.querySelectorAll<HTMLElement>(".paper-sheet")) {
        sheet.tabIndex = visibleFraction(sheet.getBoundingClientRect()) >= MIN_VISIBLE ? 0 : -1;
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  if (articles.length === 0) {
    return (
      <div className="paper-stream paper-stream-still">
        <div className="paper-sheet paper-sheet-still">
          <span className="paper-title">The journal is empty.</span>
          <span className="paper-summary">Add a markdown file to content/articles and redeploy.</span>
        </div>
      </div>
    );
  }

  if (reduced) {
    return (
      <div className="paper-stream paper-stream-still">
        {articles.map((article) => (
          <Link key={article.slug} to={`/journal/${article.slug}`} className="paper-sheet paper-sheet-still">
            <SheetFace article={article} />
          </Link>
        ))}
      </div>
    );
  }

  const { slots, duration, gap, scale } = streamTiming(articles.length, narrow);

  return (
    <div ref={streamRef} className="paper-stream" aria-label="Journal">
      {Array.from({ length: slots }, (_, slot) => (
        <FlyingSheet
          key={slot}
          articles={articles}
          slot={slot}
          slotCount={slots}
          duration={duration}
          gap={gap}
          scale={scale}
          narrow={narrow}
        />
      ))}
    </div>
  );
}
