import { useState } from "react";
import { readTheme, type Theme } from "../theme";

export function ThemeToggle() {
  const [theme] = useState(readTheme);
  const destination: Theme = theme === "dark" ? "light" : "dark";
  const label = destination === "light" ? "Light" : "Dark";

  return (
    <button
      type="button"
      aria-label={destination === "light" ? "Switch to light theme" : "Switch to dark theme"}
      className="min-h-11 min-w-11 px-2 rounded-sm font-mono text-meta uppercase text-muted hover:bg-surface hover:text-ink transition-colors duration-(--dur-base) ease-quiet"
    >
      {label}
    </button>
  );
}
