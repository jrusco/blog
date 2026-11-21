import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Fonts } from "./fonts";

const sampleCss = [
  "@font-face {",
  '  font-family: "Sample Face";',
  '  src: url("/fonts/sample.woff2") format("woff2");',
  "  font-weight: 400;",
  "  font-style: normal;",
  "}",
  "@font-face {",
  '  font-family: "Sample Mono";',
  '  src: url("/fonts/sample-mono.woff2") format("woff2");',
  "  font-weight: 400;",
  "  font-style: normal;",
  "}",
  "@theme inline {",
  '  --font-serif: "Sample Face", serif;',
  '  --font-mono: "Sample Mono", monospace;',
  "}",
].join("\n");

describe("Fonts", () => {
  const roots: string[] = [];

  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  function tree(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), "fonts-"));
    roots.push(root);
    for (const [file, contents] of Object.entries(files)) {
      const path = join(root, file);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, contents);
    }
    return root;
  }

  it("preloads the first file-backed face", () => {
    expect(Fonts.preloadHrefs(sampleCss)).toEqual(["/fonts/sample.woff2"]);
    expect(Fonts.familyNames(sampleCss)).toEqual(["Sample Face", "Sample Mono"]);
  });

  it("fails when a family name or the retired serif name appears outside the fonts file", () => {
    const leaked = tree({
      [Fonts.file]: sampleCss,
      "src/components/Title.tsx": 'export const title = "Sample Face";\n',
      "README.md": "Clean page.\n",
    });
    expect(Fonts.violations(leaked)).toEqual([{ file: "src/components/Title.tsx", name: "Sample Face" }]);

    const retired = tree({
      [Fonts.file]: sampleCss,
      "src/retired.ts": `export const name = ${JSON.stringify(Fonts.legacyFamilyName())};\n`,
    });
    expect(Fonts.violations(retired)).toEqual([{ file: "src/retired.ts", name: Fonts.legacyFamilyName() }]);

    const clean = tree({
      [Fonts.file]: sampleCss,
      "src/ok.tsx": 'export const title = "No family here";\n',
    });
    expect(Fonts.violations(clean)).toEqual([]);
  });

  it("keeps the repository free of family names outside the fonts file", () => {
    expect(Fonts.violations()).toEqual([]);
    expect(Fonts.preloadHrefs(Fonts.read())).toEqual(["/fonts/geist-serif-regular.woff2"]);
  });
});
