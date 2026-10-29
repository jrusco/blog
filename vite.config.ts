/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/blog/",
  plugins: [react(), tailwindcss()],
  // Vitest blanks CSS imports by default; the theme lockstep test reads styles.css?raw.
  test: { css: { include: [/styles\.css\?raw$/] } },
});
