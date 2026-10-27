export type Article = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
};

const files = import.meta.glob("../../content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseArticle(path: string, raw: string): Article {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  let title = slug;
  let date = "";
  let summary = "";
  let body = raw.trim();

  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const frontmatter = raw.slice(3, end).trim();
      body = raw.slice(end + 4).trim();
      for (const line of frontmatter.split("\n")) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (!match) continue;
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (match[1] === "title") title = value;
        if (match[1] === "date") date = value;
        if (match[1] === "summary") summary = value;
      }
    }
  }

  return { slug, title, date, summary, body };
}

export function getArticles(): Article[] {
  return Object.entries(files)
    .map(([path, raw]) => parseArticle(path, raw))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug);
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

export function streamTiming(count: number, slow: boolean) {
  const slots = count <= 3 ? Math.max(count, 1) : Math.min(5, count);
  const base = count <= 3 ? 18 : count <= 12 ? 14 : 10;
  const duration = slow ? base * 1.35 : base;
  const scale = count <= 1 ? 1.4 : count === 2 ? 1.25 : count === 3 ? 1.12 : 1;
  return { slots, duration, gap: duration / Math.max(slots, 1), scale };
}
