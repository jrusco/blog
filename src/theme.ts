export type Theme = "light" | "dark";

function parseTheme(value: string | null | undefined): Theme | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

export function readTheme(): Theme {
  return (
    parseTheme(document.documentElement.dataset.theme) ??
    (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
  );
}

function storedTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem("theme"));
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function setTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta instanceof HTMLMetaElement) meta.content = next === "light" ? "#f7f1e1" : "#0a2638";
  try {
    if (next === systemTheme()) localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
  } catch {
    return;
  }
}

export function followSystemTheme(onChange: (theme: Theme) => void): () => void {
  if (storedTheme() !== null) return () => {};
  const media = matchMedia("(prefers-color-scheme: light)");
  const onMedia = () => {
    const next = systemTheme();
    setTheme(next);
    onChange(next);
  };
  media.addEventListener("change", onMedia);
  return () => media.removeEventListener("change", onMedia);
}
