export type Article = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  draft: boolean;
};

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

function parseArticle(path: string, raw: string): Article {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  let title = slug;
  let date = "";
  let summary = "";
  let draft = false;
  let body = raw.trim();

  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const frontmatter = raw.slice(3, end).trim();
      body = raw.slice(end + 4).trim();
      for (const rawLine of frontmatter.split("\n")) {
        const line = rawLine.replace(/\r$/, "");
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (!match) continue;
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (match[1] === "title") title = value;
        if (match[1] === "date") date = value;
        if (match[1] === "summary") summary = value;
        if (match[1] === "draft") draft = value === "true";
      }
    }
  }

  return { slug, title, date, summary, body, draft };
}

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
