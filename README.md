# Velorah

Cinematic landing page for a personal journal. React, Vite, TypeScript, and Tailwind CSS.

The night field stays on screen. After the opening line, sheets of paper cross the sky from right to left. Each sheet is an article. Click one to read it.

Live at <https://jrusco.github.io/blog/>.

## Develop

```bash
npm install
npm run dev
```

## Changing fonts

Family names, the two weight tokens, and the fallback faces live in `src/styles/fonts.css`. The font files live in `public/fonts`. The build fails when a family name from that CSS file appears in any other file.

1. Add the Latin subset `.woff2` and its `OFL.txt` under `public/fonts`.
2. In `src/styles/fonts.css`, point the serif `@font-face` at that file, set the family name, set `--font-serif-weight-title` and `--font-serif-weight-body`, and retune `size-adjust`, `ascent-override`, and `descent-override`.
3. Run `npm test`, then `npm run build`. The preload link comes from the first `@font-face` that points at a file.

## Publish an article

Every change reaches the site through a pull request. Merging to `main` redeploys the site.

1. Create a branch.
2. Add `content/articles/your-slug.md`:

   ```markdown
   ---
   title: Your title
   date: 2026-10-27
   summary: One sentence. This is what shows on the flying sheet.
   ---

   The rest is the essay.
   ```

3. Run `npm run dev` and check the sheet and the article page.
4. Open a pull request and merge it.

The deploy takes about a minute. Follow it in the repo's **Actions** tab.

The filename becomes the URL: `/blog/journal/your-slug`. Pace follows how many files are in the folder. At most five sheets are in the air at once. The rest cycle through.

## Deploy

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) runs on every push to `main`, and on demand from the **Actions** tab. It runs these steps:

1. Runs the tests.
2. Builds with `--base=/blog/`. Pages serves a project site from `/<repo name>/`, and the workflow reads the repo name, so renaming the repo moves the site.
3. Copies `index.html` to `404.html`. Pages has no URL rewrites. It serves `404.html` for unknown paths, so links like `/blog/journal/your-slug` still open the app.
4. Publishes `dist/` to GitHub Pages.

A failed test or build stops the deploy, and the live site stays as it was.

### One-time setup

In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

### Build locally

```bash
npm run build -- --base=/blog/
npm run preview -- --base=/blog/
```

Open <http://localhost:4173/blog/>. The preview server falls back to `index.html` on its own, so it skips the `404.html` step.

## Assets

The hero film is `public/hero.mp4`.
