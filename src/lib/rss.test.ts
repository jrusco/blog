import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RssFeed, type RssSource } from "./rss";

function source(path: string, fields: { title: string; date: string; summary: string; draft?: boolean; body?: string }): RssSource {
  const draft = fields.draft ? "\ndraft: true" : "";
  return {
    path,
    raw: `---\ntitle: ${fields.title}\ndate: ${fields.date}\nsummary: ${fields.summary}${draft}\n---\n\n${fields.body ?? ""}\n`,
  };
}

function markdownSources(dir: string): RssSource[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => ({ path: `${dir}/${name}`, raw: readFileSync(join(dir, name), "utf8") }));
}

function itemTitles(xml: string): string[] {
  return [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>/g)].map((match) => match[1] ?? "");
}

describe("RssFeed", () => {
  it("escapes every text field", () => {
    expect(RssFeed.escape(`& < > " '`)).toBe("&amp; &lt; &gt; &quot; &apos;");
    const xml = RssFeed.build([
      source("content/articles/marks.md", {
        title: `A & B <C> "D" 'E' end`,
        date: "2026-10-20",
        summary: `Fish & chips <b> "quoted" 'apos' end`,
      }),
    ]);
    expect(xml).toContain("<title>A &amp; B &lt;C&gt; &quot;D&quot; &apos;E&apos; end</title>");
    expect(xml).toContain("<description>Fish &amp; chips &lt;b&gt; &quot;quoted&quot; &apos;apos&apos; end</description>");
    expect(xml).not.toContain("A & B");
    expect(xml).not.toContain("<C>");
    expect(xml).not.toContain("<b>");
    expect(xml).not.toContain("'E'");
    expect(xml).not.toContain("'apos'");
  });

  it("skips drafts and fixtures, newest first, with RFC 822 dates at 00:00 UTC", () => {
    const xml = RssFeed.build([
      source("content/articles/older.md", { title: "Older", date: "2026-01-15", summary: "Earlier note" }),
      source("content/articles/bravo.md", { title: "Bravo", date: "2026-03-01", summary: "Same day, later title" }),
      source("content/articles/alpha.md", { title: "Alpha", date: "2026-03-01", summary: "Same day, earlier title" }),
      source("content/articles/marks.md", {
        title: "Newest",
        date: "2026-10-20",
        summary: "Latest note",
      }),
      source("content/articles/hidden.md", {
        title: "Do not publish this draft",
        date: "2026-11-02",
        summary: "Draft summary must stay out",
        draft: true,
      }),
      source("content/fixtures/sneaky.md", {
        title: "Fixture must stay out",
        date: "2026-12-01",
        summary: "Not a journal post",
        draft: false,
      }),
    ]);

    expect(xml).not.toContain("Do not publish this draft");
    expect(xml).not.toContain("Draft summary must stay out");
    expect(xml).not.toContain("Fixture must stay out");
    expect(xml).not.toContain("Not a journal post");
    expect(xml).not.toContain("sneaky");
    expect(itemTitles(xml)).toEqual(["Newest", "Alpha", "Bravo", "Older"]);
    expect(xml).toContain("<pubDate>Tue, 20 Oct 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<pubDate>Sun, 01 Mar 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<pubDate>Thu, 15 Jan 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<lastBuildDate>Tue, 20 Oct 2026 00:00:00 GMT</lastBuildDate>");
    expect(xml.match(/<pubDate>[^<]+<\/pubDate>/g)?.every((pubDate) => /^\s*<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 GMT<\/pubDate>\s*$/.test(pubDate))).toBe(true);
    expect(xml).toContain('<guid isPermaLink="true">https://jrusco.github.io/blog/journal/marks</guid>');
    expect(xml).toContain('<atom:link href="https://jrusco.github.io/blog/rss.xml" rel="self" type="application/rss+xml" />');
    expect(xml).not.toMatch(/<author[\s>]/);
  });

  it("formats a calendar date as RFC 822 at midnight UTC", () => {
    expect(RssFeed.toRfc822("2026-10-20")).toBe("Tue, 20 Oct 2026 00:00:00 GMT");
    expect(RssFeed.toRfc822("2026-08-14")).toBe("Fri, 14 Aug 2026 00:00:00 GMT");
    expect(RssFeed.toRfc822("2026-09-02")).toBe("Wed, 02 Sep 2026 00:00:00 GMT");
  });

  it("builds the live journal without on-disk fixtures", () => {
    const xml = RssFeed.build([...markdownSources("content/articles"), ...markdownSources("content/fixtures")]);
    expect(xml).not.toContain("test-long-title");
    expect(xml).not.toContain("test-footnotes");
    expect(xml).not.toContain("test-image");
    expect(xml).not.toContain("test-youtube");
    const slugs = [...xml.matchAll(/\/journal\/([a-z0-9-]+)/g)].map((match) => match[1]);
    expect([...new Set(slugs)]).toEqual(["on-focus", "night-shift", "a-slower-web", "field-notes", "quiet-tools"]);
    expect(xml).toContain("<pubDate>Tue, 20 Oct 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<lastBuildDate>Tue, 20 Oct 2026 00:00:00 GMT</lastBuildDate>");
  });
});
