import { parseArticle, type Article } from "./frontmatter";

export type { Article };

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

const SHOW_FIXTURES = import.meta.env.DEV || import.meta.env.VITE_FIXTURES === "1";

const files = import.meta.glob("../../content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const fixtureFiles: Record<string, string> = SHOW_FIXTURES
  ? (import.meta.glob("../../content/fixtures/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>)
  : {};

const articleImages = import.meta.glob("../../content/images/**/*.{jpg,jpeg,png,webp,avif}", {
  query: "?size",
  import: "default",
  eager: true,
}) as Record<string, ImageAsset>;

const fixtureImages: Record<string, ImageAsset> = SHOW_FIXTURES
  ? (import.meta.glob("../../content/fixtures/images/**/*.{jpg,jpeg,png,webp,avif}", {
      query: "?size",
      import: "default",
      eager: true,
    }) as Record<string, ImageAsset>)
  : {};

const images = { ...articleImages, ...fixtureImages };

export function getArticles(): Article[] {
  return [...Object.entries(files), ...Object.entries(fixtureFiles)]
    .map(([path, raw]) => parseArticle(path, raw))
    .filter((article) => !(import.meta.env.PROD && !SHOW_FIXTURES && article.draft))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug);
}

export function imageFor(src: string | undefined): ImageAsset | undefined {
  if (!src) return undefined;
  const bare = src.split(/[?#]/)[0] ?? "";
  let path = bare;
  try {
    path = decodeURIComponent(bare);
  } catch {
    path = bare;
  }
  path = path.replace(/^\.\//, "").replace(/^\/+/, "");
  for (const [key, meta] of Object.entries(images)) {
    if (key.endsWith(`/${path}`) || key.endsWith(path)) return meta;
  }
  return undefined;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function streamLayout(count: number, slow: boolean) {
  const slots = count <= 3 ? Math.max(count, 1) : Math.min(5, count);
  const base = count <= 3 ? 18 : count <= 12 ? 14 : 10;
  const duration = slow ? base * 1.35 : base;
  const scale = count <= 1 ? 1.4 : count === 2 ? 1.25 : count === 3 ? 1.12 : 1;
  return { slots, duration, gap: duration / Math.max(slots, 1), scale };
}
