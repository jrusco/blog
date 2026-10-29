import { describe, expect, it } from "vitest";
import type { Article } from "../lib/articles";
import { ArchiveIndex } from "./archiveIndex";

function post(fields: Pick<Article, "slug" | "title" | "date" | "summary">): Article {
  return { ...fields, body: "" };
}

describe("ArchiveIndex", () => {
  it("reads the journal with a slug, title, ISO date, and one-line summary", () => {
    const posts = ArchiveIndex.posts();
    expect(posts.map((entry) => entry.slug)).toEqual(
      expect.arrayContaining(["on-focus", "night-shift", "a-slower-web", "field-notes", "quiet-tools"]),
    );
    for (const entry of posts) {
      expect(entry.slug).toMatch(/^[a-z0-9-]+$/);
      expect(entry.title).not.toBe("");
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.summary).not.toBe("");
      expect(entry.summary).not.toContain("\n");
    }
  });

  it("groups newest first, opening a new year when the year changes", () => {
    const older = post({ slug: "older", title: "Older", date: "2024-06-01", summary: "Earlier." });
    const tieB = post({ slug: "bee", title: "Bee", date: "2025-01-01", summary: "Same day." });
    const tieA = post({ slug: "ay", title: "Ay", date: "2025-01-01", summary: "Same day." });
    const newer = post({ slug: "newer", title: "Newer", date: "2025-11-02", summary: "Later." });
    const input = [older, tieB, tieA, newer];

    expect(ArchiveIndex.byYear(input)).toEqual([
      { year: "2025", posts: [newer, tieA, tieB] },
      { year: "2024", posts: [older] },
    ]);
    expect(input.map((entry) => entry.slug)).toEqual(["older", "bee", "ay", "newer"]);
  });

  it("keeps a non-ISO date on its own heading", () => {
    const draft = post({ slug: "draft", title: "Draft", date: "TODO_DATE", summary: "TODO summary" });
    expect(ArchiveIndex.byYear([draft])).toEqual([{ year: "TODO_DATE", posts: [draft] }]);
  });

  it("returns no years when there are no posts", () => {
    expect(ArchiveIndex.byYear([])).toEqual([]);
  });

  it("lists the live journal newest first under 2026", () => {
    const years = ArchiveIndex.byYear();
    expect(years.map((group) => group.year)).toEqual(["2026"]);
    expect(years[0]?.posts.map((entry) => entry.date)).toEqual([
      "2026-10-20",
      "2026-10-12",
      "2026-09-28",
      "2026-09-02",
      "2026-08-14",
    ]);
  });
});
