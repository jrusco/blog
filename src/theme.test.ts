import { afterEach, describe, expect, it, vi } from "vitest";
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
