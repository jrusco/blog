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
