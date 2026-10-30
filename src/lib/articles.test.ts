import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getArticle, imageFor, streamLayout } from "./articles";

function markdownFiles(dir: string): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...markdownFiles(path));
    else if (name.endsWith(".md")) found.push(path);
  }
  return found;
}

describe("article images", () => {
  it("requires alt text and a path that is in the manifest", () => {
    const files = markdownFiles("content");
    expect(files.length).toBeGreaterThan(0);
    const image = /!\[([^\]]*)\]\(\s*([^)\s]+)/g;
    let seen = 0;
    for (const file of files) {
      const raw = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
      for (const match of raw.matchAll(image)) {
        seen += 1;
        const alt = match[1]?.trim() ?? "";
        const src = match[2] ?? "";
        expect(alt, file).not.toBe("");
        expect(src.startsWith("](") ? "" : src, file).not.toBe("");
        expect(imageFor(src), `${file} ${src}`).toBeTruthy();
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe("draft fixtures", () => {
  it("marks fixtures as drafts and live posts as published", () => {
    expect(getArticle("test-long-title")?.draft).toBe(true);
    expect(getArticle("on-focus")?.draft).toBe(false);
  });
});

describe("streamLayout scale ladder", () => {
  it.each([
    [1, 1.4],
    [2, 1.25],
    [3, 1.12],
    [4, 1],
    [5, 1],
  ])("scales %i article(s) by %f", (count, scale) => {
    expect(streamLayout(count, false).scale).toBe(scale);
  });
});
