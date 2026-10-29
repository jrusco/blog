export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

// Stands in for localStorage when it throws, so a toggle still outranks the OS.
let unsavedTheme: Theme | null = null;

function parseTheme(value: string | null | undefined): Theme | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

function systemTheme(): Theme {
  return matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

export function readTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme) ?? systemTheme();
}

function storedTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return unsavedTheme;
  }
}

export function setTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta instanceof HTMLMetaElement) meta.content = next === "light" ? "#f7f1e1" : "#0a2638";
  unsavedTheme = next === systemTheme() ? null : next;
  try {
    if (unsavedTheme === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // unsavedTheme keeps the choice until the page reloads.
  }
}

export function followSystemTheme(onChange: (theme: Theme) => void): () => void {
  if (storedTheme() !== null) return () => {};
  const media = matchMedia(LIGHT_QUERY);
  const onMedia = () => {
    const next = systemTheme();
    setTheme(next);
    onChange(next);
  };
  media.addEventListener("change", onMedia);
  return () => media.removeEventListener("change", onMedia);
}
