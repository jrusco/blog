import { afterEach, describe, expect, it, vi } from "vitest";
import indexHtml from "../index.html?raw";
import styles from "./styles.css?raw";
import type { Theme } from "./theme";

class FakeMeta {
  content = "";
}

function fakeBrowser({ osLight, storage }: { osLight: boolean; storage: "ok" | "blocked" }) {
  const store = new Map<string, string>();
  const listeners = new Set<() => void>();
  const os = { light: osLight };
  const meta = new FakeMeta();
  const root = { dataset: {} as Record<string, string | undefined> };

  const guard = () => {
    if (storage === "blocked") throw new Error("SecurityError");
  };
  vi.stubGlobal("HTMLMetaElement", FakeMeta);
  vi.stubGlobal("document", {
    documentElement: root,
    querySelector: (selector: string) => (selector === 'meta[name="theme-color"]' ? meta : null),
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => (guard(), store.get(key) ?? null),
    setItem: (key: string, value: string) => (guard(), store.set(key, value)),
    removeItem: (key: string) => (guard(), store.delete(key)),
  });
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query === "(prefers-color-scheme: light)" && os.light;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));

  return {
    store,
    meta,
    root,
    setOs(light: boolean) {
      os.light = light;
      for (const listener of [...listeners]) listener();
    },
  };
}

async function loadTheme() {
  vi.resetModules();
  return import("./theme");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("setTheme", () => {
  it("stores a theme that differs from the OS and forgets one that matches it", async () => {
    const browser = fakeBrowser({ osLight: false, storage: "ok" });
    const { setTheme } = await loadTheme();

    setTheme("light");
    expect(browser.store.get("theme")).toBe("light");
    expect(browser.root.dataset.theme).toBe("light");
    expect(browser.meta.content).toBe("#f7f1e1");

    setTheme("dark");
    expect(browser.store.has("theme")).toBe(false);
    expect(browser.root.dataset.theme).toBe("dark");
    expect(browser.meta.content).toBe("#0a2638");
  });
});

describe("followSystemTheme", () => {
  async function themesSeenAfterOsTurnsLight(stored: Theme | null) {
    const browser = fakeBrowser({ osLight: false, storage: "ok" });
    if (stored) browser.store.set("theme", stored);
    const { followSystemTheme } = await loadTheme();
    const seen: Theme[] = [];
    followSystemTheme((theme) => seen.push(theme));
    browser.setOs(true);
    return { seen, dataTheme: browser.root.dataset.theme };
  }

  it("follows the OS only while no theme is stored", async () => {
    expect(await themesSeenAfterOsTurnsLight(null)).toEqual({ seen: ["light"], dataTheme: "light" });
    expect(await themesSeenAfterOsTurnsLight("dark")).toEqual({ seen: [], dataTheme: undefined });
  });

  it.each(["ok", "blocked"] as const)("keeps a toggled theme when storage is %s and the OS flips", async (storage) => {
    const browser = fakeBrowser({ osLight: false, storage });
    const { followSystemTheme, setTheme } = await loadTheme();
    const seen: Theme[] = [];

    setTheme("light");
    followSystemTheme((theme) => seen.push(theme));
    browser.setOs(true);
    browser.setOs(false);

    expect(seen).toEqual([]);
    expect(browser.root.dataset.theme).toBe("light");
  });
});

function paletteAfter(selector: string): Record<string, string> {
  const opener = `${selector} {`;
  const start = styles.indexOf(opener);
  if (start === -1) throw new Error(`styles.css has no "${opener}" block`);
  const body = styles.slice(start + opener.length, styles.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/(--c-[\w-]+|color-scheme):\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
}

const darkPalette = paletteAfter('[data-theme="dark"]');
const lightPalette = paletteAfter('[data-theme="light"]');
const noJsLightPalette = paletteAfter("@media (prefers-color-scheme: light) {\n  :root:not([data-theme])");

function runHeadScript() {
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("index.html has no inline theme script");
  new Function(script)();
}

describe("theme copies stay in lockstep", () => {
  it("gives the no-JS light palette the same tokens as the light theme", () => {
    expect(Object.keys(lightPalette).sort()).toEqual(Object.keys(darkPalette).sort());
    expect(noJsLightPalette).toEqual(lightPalette);
  });

  it("paints the browser chrome with each theme's page color", async () => {
    const browser = fakeBrowser({ osLight: false, storage: "ok" });
    const { setTheme } = await loadTheme();
    setTheme("light");
    expect(browser.meta.content).toBe(lightPalette["--c-page"]);
    setTheme("dark");
    expect(browser.meta.content).toBe(darkPalette["--c-page"]);
    expect(indexHtml).toContain(`<meta name="theme-color" content="${darkPalette["--c-page"]}" />`);
  });

  it.each([true, false])("resolves the same theme as theme.ts with nothing stored (OS light: %s)", async (osLight) => {
    const browser = fakeBrowser({ osLight, storage: "ok" });
    const { readTheme, setTheme } = await loadTheme();
    const expected = readTheme();

    runHeadScript();
    const headMeta = browser.meta.content;
    expect(browser.root.dataset.theme).toBe(expected);

    setTheme(expected);
    expect(headMeta).toBe(browser.meta.content);
  });

  it.each(["light", "dark"] as const)("restores a %s toggle that theme.ts saved", async (theme) => {
    const browser = fakeBrowser({ osLight: theme === "dark", storage: "ok" });
    const { setTheme } = await loadTheme();
    setTheme(theme);
    const savedMeta = browser.meta.content;
    browser.root.dataset.theme = undefined;
    browser.meta.content = "";

    runHeadScript();
    expect(browser.root.dataset.theme).toBe(theme);
    expect(browser.meta.content).toBe(savedMeta);
  });

  it("keeps the head script working when storage is blocked", () => {
    const browser = fakeBrowser({ osLight: true, storage: "blocked" });
    runHeadScript();
    expect(browser.root.dataset.theme).toBe("light");
    expect(browser.meta.content).toBe(lightPalette["--c-page"]);
  });
});
