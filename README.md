# Velorah

Cinematic landing page for a personal journal. React, Vite, TypeScript, and Tailwind CSS.

The night field stays on screen. After the opening line, sheets of paper cross the sky from right to left. Each sheet is an article. Click one to read it.

## Develop

```bash
npm install
npm run dev
```

## Add an article

Create `content/articles/your-slug.md`:

```markdown
---
title: Your title
date: 2026-10-27
summary: One sentence. This is what shows on the flying sheet.
---

The rest is the essay.
```

The filename becomes the URL: `/journal/your-slug`. Redeploy, or refresh the dev server, and the sheet joins the wind. Pace follows how many files are in the folder. At most five are in the air at once. The rest cycle through.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. Connect the repo to [Vercel](https://vercel.com) or Netlify and keep the defaults: build command `npm run build`, output directory `dist`.

The hero film is `public/hero.mp4`.
