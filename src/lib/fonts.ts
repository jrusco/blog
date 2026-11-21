import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);

const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git", "coverage"]);

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".html",
  ".md",
  ".svg",
  ".json",
  ".yml",
  ".yaml",
  ".txt",
]);

export type FontViolation = {
  file: string;
  name: string;
};

export class Fonts {
  static readonly file = "src/styles/fonts.css";

  static read(root = process.cwd()): string {
    return readFileSync(resolve(root, Fonts.file), "utf8");
  }

  static legacyFamilyName(): string {
    return ["News", "reader"].join("");
  }

  static familyNames(css: string): string[] {
    const names = new Set<string>();
    for (const match of css.matchAll(/(?:font-family|--font-serif|--font-mono)\s*:\s*([^;]+);/g)) {
      for (const name of Fonts.tokens(match[1] ?? "")) names.add(name);
    }
    for (const match of css.matchAll(/local\(\s*(['"])(.*?)\1\s*\)/g)) {
      const name = match[2]?.trim();
      if (name) names.add(name);
    }
    return [...names].filter((name) => !GENERIC_FAMILIES.has(name)).sort();
  }

  static preloadHrefs(css: string): string[] {
    for (const match of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
      const src = /url\(\s*(['"]?)([^"')]+\.woff2)\1\s*\)/.exec(match[1] ?? "");
      if (src?.[2]) return [src[2]];
    }
    return [];
  }

  static violations(root = process.cwd()): FontViolation[] {
    const names = Fonts.familyNames(Fonts.read(root));
    const legacy = Fonts.legacyFamilyName();
    const found: FontViolation[] = [];
    for (const path of Fonts.files(root)) {
      const file = relative(root, path).split(sep).join("/");
      if (file === Fonts.file) continue;
      const haystack = TEXT_EXTENSIONS.has(Fonts.extension(path)) ? readFileSync(path, "utf8") : "";
      const target = `${file}\n${haystack}`;
      for (const name of names) {
        if (target.includes(name)) found.push({ file, name });
      }
      if (target.toLowerCase().includes(legacy.toLowerCase())) found.push({ file, name: legacy });
    }
    return found;
  }

  static assertClean(root = process.cwd()): void {
    const found = Fonts.violations(root);
    if (found.length === 0) return;
    const lines = found.map((item) => `${item.file}: ${item.name}`);
    throw new Error(`Family names must stay in ${Fonts.file}:\n${lines.join("\n")}`);
  }

  static plugin(): Plugin {
    return {
      name: "font-preload",
      buildStart() {
        Fonts.assertClean();
      },
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          const links = Fonts.preloadHrefs(Fonts.read())
            .map((href) => `<link rel="preload" href="${Fonts.escapeAttr(href)}" as="font" type="font/woff2" crossorigin />`)
            .join("\n    ");
          if (!links) return html;
          return html.replace("</head>", `    ${links}\n  </head>`);
        },
      },
    };
  }

  private static tokens(value: string): string[] {
    return value
      .split(",")
      .map((part) => part.trim().replace(/^["']|["']$/g, ""))
      .filter((name) => name.length > 0 && !name.startsWith("var("));
  }

  private static extension(path: string): string {
    const name = path.slice(path.lastIndexOf("/") + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1 ? "" : name.slice(dot);
  }

  private static files(root: string): string[] {
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (SKIP_DIRECTORIES.has(name)) continue;
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else found.push(path);
      }
    };
    walk(root);
    return found;
  }

  private static escapeAttr(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  }
}
