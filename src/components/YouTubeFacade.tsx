import { useState } from "react";

const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"]);

export function youtubeTarget(href: string): { id: string; start: number } | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;
  const id =
    host === "youtu.be" || host === "www.youtu.be"
      ? (url.pathname.split("/").filter(Boolean)[0] ?? "")
      : url.pathname === "/watch"
        ? (url.searchParams.get("v") ?? "")
        : url.pathname.startsWith("/embed/")
          ? (url.pathname.split("/")[2] ?? "")
          : "";
  if (!/^[\w-]{6,}$/.test(id)) return null;
  return { id, start: startSeconds(url.searchParams.get("t") ?? url.searchParams.get("start")) };
}

function startSeconds(raw: string | null): number {
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!match || match[0] === "") return 0;
  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

export function YouTubeFacade({ id, title, start }: { id: string; title: string; start: number }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="media max-sm:-mx-5 lg:-mx-22">
      <div className="video-frame relative aspect-video overflow-hidden bg-surface">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&start=${start}`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0"
            onClick={() => setPlaying(true)}
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
            <span className="video-scrim" />
            <span aria-hidden="true" className="video-play">
              <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true">
                <path d="M8.2 5.4v11.2L17.4 11 8.2 5.4z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        {title} · <a href={`https://www.youtube.com/watch?v=${id}`}>YouTube</a>
      </figcaption>
    </figure>
  );
}
