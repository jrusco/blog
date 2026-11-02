export type Article = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  draft: boolean;
};

export function parseArticle(path: string, raw: string): Article {
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
