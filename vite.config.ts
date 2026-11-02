import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { imageSize } from "image-size";
import { defineConfig, type Plugin } from "vite";
import { RssFeed } from "./src/lib/rss.ts";

// remark-gfm also pulls a markdown serializer, the SVG attribute map, and style
// parsing. None of that runs while rendering a post, and keeping it put the
// post chunk over 60 kB gzip. These stubs stand in for the unused modules.
const markdownStringifyStub = resolve("src/lib/markdown-stringify-stub.ts");
const markdownTableStub = resolve("src/lib/markdown-table-stub.ts");
const styleToJsStub = resolve("src/lib/style-to-js-stub.ts");
const svgInfoStub = resolve("src/lib/svg-info-stub.ts");

function slimMarkdown(): Plugin {
  return {
    name: "slim-markdown",
    enforce: "pre",
    resolveId(id, importer) {
      if (!importer?.includes("property-information")) return null;
      if (id === "./lib/svg.js" || id.endsWith("/property-information/lib/svg.js")) return svgInfoStub;
      return null;
    },
  };
}

function imageDimensions(): Plugin {
  return {
    name: "image-dimensions",
    enforce: "pre",
    load(id) {
      if (!id.endsWith("?size")) return null;
      const file = id.slice(0, -5);
      if (!/\.(avif|jpe?g|png|webp)$/i.test(file)) return null;
      const { width, height } = imageSize(readFileSync(file));
      if (!width || !height) return null;
      return `import src from ${JSON.stringify(file)}; export default { src, width: ${width}, height: ${height} };`;
    },
  };
}

function dropUnreferencedImages(): Plugin {
  return {
    name: "drop-unreferenced-images",
    generateBundle(_options, bundle) {
      for (const file of Object.keys(bundle)) {
        if (!/\.(avif|jpe?g|png|webp)$/i.test(file)) continue;
        const name = file.split("/").pop() ?? file;
        const referenced = Object.values(bundle).some((item) => {
          if (item.type === "chunk") return item.code.includes(name);
          if (item.type === "asset" && typeof item.source === "string") return item.source.includes(name);
          return false;
        });
        if (!referenced) delete bundle[file];
      }
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function articleMeta(raw: string): { title: string; summary: string; draft: boolean } {
  let title = "";
  let summary = "";
  let draft = false;
  if (!raw.startsWith("---")) return { title, summary, draft };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { title, summary, draft };
  for (const rawLine of raw.slice(3, end).trim().split("\n")) {
    const match = rawLine.replace(/\r$/, "").match(/^(\w+):\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (match[1] === "title") title = value;
    if (match[1] === "summary") summary = value;
    if (match[1] === "draft") draft = value === "true";
  }
  return { title, summary, draft };
}

function withHead(html: string, title: string, description: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`);
}

function pagesHtml(): Plugin {
  return {
    name: "pages-html",
    apply: "build",
    closeBundle() {
      const dist = resolve("dist");
      const index = readFileSync(resolve(dist, "index.html"), "utf8");
      const siteDescription = /<meta\s+name="description"\s+content="([^"]*)"/.exec(index)?.[1] ?? "";
      const journal = resolve(dist, "journal");
      mkdirSync(journal, { recursive: true });
      for (const name of readdirSync(resolve("content/articles"))) {
        if (!name.endsWith(".md")) continue;
        const article = articleMeta(readFileSync(resolve("content/articles", name), "utf8"));
        if (article.draft || !article.title) continue;
        writeFileSync(resolve(journal, `${name.replace(/\.md$/, "")}.html`), withHead(index, `${article.title} · Criterio`, article.summary));
      }
      writeFileSync(resolve(dist, "archive.html"), withHead(index, "Archive · Criterio", siteDescription));
    },
  };
}

function rssFeed(): Plugin {
  return {
    name: "rss-feed",
    apply: "build",
    generateBundle() {
      const dir = resolve("content/articles");
      const entries = readdirSync(dir)
        .filter((name) => name.endsWith(".md"))
        .map((name) => ({
          path: `content/articles/${name}`,
          raw: readFileSync(resolve(dir, name), "utf8"),
        }));
      this.emitFile({ type: "asset", fileName: "rss.xml", source: RssFeed.build(entries) });
    },
  };
}

// Build-only: the dev server injects inline scripts (React Refresh) and <style> tags, which this policy would block.
function metaCsp(): Plugin {
  return {
    name: "meta-csp",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const styleHashes = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(
          ([, css]) => `'sha256-${createHash("sha256").update(css).digest("base64")}'`,
        );
        const policy = [
          "default-src 'none'",
          "script-src 'self'",
          `style-src 'self' ${styleHashes.join(" ")}`.trim(),
          "font-src 'self'",
          "img-src 'self'",
          "media-src 'self'",
          "connect-src 'self'",
          "manifest-src 'self'",
          "base-uri 'self'",
          "form-action 'none'",
          "object-src 'none'",
          "frame-src 'none'",
          "worker-src 'none'",
          "upgrade-insecure-requests",
        ].join("; ");
        // First in <head>: a meta CSP only governs content parsed after it.
        return html.replace(
          /<head>/,
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
        );
      },
    },
  };
}

export default defineConfig({
  base: "/blog/",
  resolve: {
    alias: {
      "markdown-table": markdownTableStub,
      "mdast-util-to-markdown": markdownStringifyStub,
      "style-to-js": styleToJsStub,
    },
  },
  plugins: [slimMarkdown(), imageDimensions(), dropUnreferencedImages(), react(), tailwindcss(), pagesHtml(), rssFeed(), metaCsp()],
});
