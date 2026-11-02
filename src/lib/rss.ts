import { parseArticle } from "./frontmatter.ts";

export type RssSource = {
  path: string;
  raw: string;
};

export class RssFeed {
  private static readonly weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  private static readonly months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
  private static readonly channelTitle = "Criterio · a public notebook";
  private static readonly channelLink = "https://jrusco.github.io/blog/";
  private static readonly channelDescription = "Notes on keeping your own judgment in the age of average answers.";
  private static readonly selfLink = "https://jrusco.github.io/blog/rss.xml";

  static escape(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  static toRfc822(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return iso;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return iso;
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `${RssFeed.weekdays[date.getUTCDay()]}, ${dd} ${RssFeed.months[date.getUTCMonth()]} ${year} 00:00:00 GMT`;
  }

  static build(entries: readonly RssSource[]): string {
    const articles = entries
      .filter((entry) => !RssFeed.isFixture(entry.path))
      .map((entry) => parseArticle(entry.path, entry.raw))
      .filter((article) => !article.draft)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));

    const lines = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
      `  <channel>`,
      `    <title>${RssFeed.escape(RssFeed.channelTitle)}</title>`,
      `    <link>${RssFeed.escape(RssFeed.channelLink)}</link>`,
      `    <description>${RssFeed.escape(RssFeed.channelDescription)}</description>`,
      `    <language>en</language>`,
    ];
    const newest = articles[0];
    if (newest) lines.push(`    <lastBuildDate>${RssFeed.escape(RssFeed.toRfc822(newest.date))}</lastBuildDate>`);
    lines.push(`    <atom:link href="${RssFeed.escape(RssFeed.selfLink)}" rel="self" type="application/rss+xml" />`);
    for (const article of articles) lines.push(RssFeed.item(article));
    lines.push(`  </channel>`, `</rss>`, ``);
    return lines.join("\n");
  }

  private static item(article: { slug: string; title: string; date: string; summary: string }): string {
    const url = `${RssFeed.channelLink}journal/${article.slug}`;
    return [
      `    <item>`,
      `      <title>${RssFeed.escape(article.title)}</title>`,
      `      <link>${RssFeed.escape(url)}</link>`,
      `      <guid isPermaLink="true">${RssFeed.escape(url)}</guid>`,
      `      <pubDate>${RssFeed.escape(RssFeed.toRfc822(article.date))}</pubDate>`,
      `      <description>${RssFeed.escape(article.summary)}</description>`,
      `    </item>`,
    ].join("\n");
  }

  private static isFixture(path: string): boolean {
    return path.split(/[\\/]/).includes("fixtures");
  }
}
