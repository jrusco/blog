# Velorah

Cinematic landing page for a personal journal. React, Vite, TypeScript, and Tailwind CSS.

The night field stays on screen. After the opening line, sheets of paper cross the sky from right to left. Each sheet is an article. Click one to read it.

Live at <https://jrusco.github.io/velorah/>.

## Develop

```bash
npm install
npm run dev
```

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

The filename becomes the URL: `/velorah/journal/your-slug`. Pace follows how many files are in the folder. At most five sheets are in the air at once. The rest cycle through.

## Deploy

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) runs on every push to `main`, and on demand from the **Actions** tab. It runs these steps:

1. Runs the tests.
2. Builds with `--base=/velorah/`, since Pages serves the site from that path instead of `/`.
3. Copies `index.html` to `404.html`. Pages has no URL rewrites. It serves `404.html` for unknown paths, so links like `/velorah/journal/your-slug` still open the app.
4. Publishes `dist/` to GitHub Pages.

A failed test or build stops the deploy, and the live site stays as it was.

### One-time setup

In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

### Build locally

```bash
npm run build -- --base=/velorah/
npm run preview -- --base=/velorah/
```

Open <http://localhost:4173/velorah/>. The preview server falls back to `index.html` on its own, so it skips the `404.html` step.

## Assets

The hero film is `public/hero.mp4`.
