import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ArticlePage } from "./ArticlePage";
import { NotFound } from "./NotFound";

function renderAt(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter basename="/blog/" initialEntries={[path]}>
      <Routes>
        <Route path="/journal/:slug" element={<ArticlePage />} />
        <Route path="*" element={<NotFound kind="route" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ArticlePage", () => {
  it("renders one heading, a time, and a dek for a fixture", () => {
    const html = renderAt("/blog/journal/test-long-title");
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain("<time");
    expect(html).toContain('dateTime="2026-01-04"');
    expect(html).toContain("4 Jan 2026");
    expect(html).toContain('class="dek');
    expect(html).toContain("Placeholder dek for the long-title fixture.");
    expect(html).toContain("TEST FIXTURE · NOT PUBLISHED");
    expect(html).not.toContain("min read");
  });

  it("highlights the long-title code block without wrapping", () => {
    const html = renderAt("/blog/journal/test-long-title");
    expect(html).toContain("hljs-keyword");
    expect(html).toContain("<pre");
    expect(html).not.toContain("white-space: pre-wrap");
    expect(html).toContain('tabindex="0"');
  });

  it("renders sized images outside paragraphs", () => {
    const html = renderAt("/blog/journal/test-image");
    expect(html).toContain("<figure");
    expect(html).not.toMatch(/<p[^>]*>\s*<figure/);
    const images = html.match(/<img\b[^>]*>/g) ?? [];
    expect(images.length).toBeGreaterThanOrEqual(2);
    for (const img of images) {
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
      expect(img).toContain('loading="lazy"');
      expect(img).toContain('decoding="async"');
      expect(img).toMatch(/alt="[^"]+"/);
    }
    expect(html).toContain("A neutral placeholder caption.");
    expect(html.match(/<figcaption/g)).toHaveLength(1);
  });

  it("renders a youtube facade without an iframe", () => {
    const html = renderAt("/blog/journal/test-youtube");
    expect(html).toContain("i.ytimg.com");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("youtube-nocookie");
    expect(html).toContain("Play video: Placeholder talk title");
    expect(html).toContain("aspect-video");
  });

  it("renders footnotes with a visible Notes label", () => {
    const html = renderAt("/blog/journal/test-footnotes");
    expect(html).toContain("data-footnotes");
    expect(html).toContain("data-footnote-ref");
    expect(html).toContain("data-footnote-backref");
    expect(html).toContain("footnotes-label");
    expect(html).toContain(">Notes<");
    expect(html).not.toContain("sr-only");
    expect(html).toContain("↑");
  });

  it("renders the missing slug as not found", () => {
    const html = renderAt("/blog/journal/test-does-not-exist");
    expect(html).toContain("This page blew past.");
    expect(html).toContain("No article matches that name.");
    expect(html).toContain('href="/blog/archive"');
    expect(html).toContain("Browse the archive");
  });

  it("renders an unknown route as not found", () => {
    const html = renderAt("/blog/anything");
    expect(html).toContain("This page blew past.");
    expect(html).toContain("Nothing lives at this address.");
    expect(html).toContain('href="/blog/archive"');
  });
});
