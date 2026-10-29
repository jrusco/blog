import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Article } from "../lib/articles";
import { ArchiveList } from "./ArchivePage";
import { ArchiveIndex } from "./archiveIndex";

function post(fields: Pick<Article, "slug" | "title" | "date" | "summary">): Article {
  return { ...fields, body: "" };
}

function render(posts: readonly Article[]) {
  return renderToStaticMarkup(
    <MemoryRouter basename="/blog/" initialEntries={["/blog/archive"]}>
      <ArchiveList posts={posts} />
    </MemoryRouter>,
  );
}

describe("ArchiveList", () => {
  it("renders each year as a heading and each post as a dated row", () => {
    const html = render([
      post({
        slug: "night-shift",
        title: "Night shift",
        date: "2026-10-12",
        summary: "Notes from the hours after the inbox gives up.",
      }),
      post({
        slug: "quiet-tools",
        title: "Quiet tools",
        date: "2025-08-14",
        summary: "Software that sits still until you need it.",
      }),
    ]);

    expect(html).toContain("<h2");
    expect(html.indexOf(">2026<")).toBeLessThan(html.indexOf(">2025<"));
    expect(html).toContain('<time dateTime="2026-10-12"');
    expect(html).toContain(">2026-10-12<");
    expect(html).toContain('href="/blog/journal/night-shift"');
    expect(html).toContain(">Night shift<");
    expect(html).toContain("Notes from the hours after the inbox gives up.");
    expect(html).toContain("sm:grid-cols-[7rem_minmax(0,1fr)]");
    expect(html).toContain("sm:items-baseline");
    expect(html).toContain("no-underline");
    expect(html).toContain("decoration-accent");
    expect(html).toContain("underline-offset-[0.2em]");
    expect(html).toContain(":hover]:underline");
    expect(html).toContain("focus-visible:underline");
    expect(html).not.toContain("Nothing here yet.");
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html.match(/<ol/g)).toHaveLength(2);
  });

  it("says nothing is here when the journal is empty", () => {
    const html = render([]);
    expect(html).toContain("Nothing here yet.");
    expect(html).not.toContain("<ol");
    expect(html).not.toContain("<h2");
  });

  it("lists the live journal newest first", () => {
    const html = render(ArchiveIndex.posts());
    const titles = ["On focus", "Night shift", "A slower web", "Field notes", "Quiet tools"];
    let cursor = -1;
    for (const title of titles) {
      const at = html.indexOf(`>${title}<`);
      expect(at).toBeGreaterThan(cursor);
      cursor = at;
    }
    expect(html).toContain(">2026<");
  });
});
