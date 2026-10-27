# Velorah

Cinematic landing page. React, Vite, TypeScript, and Tailwind CSS.

## Develop

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. Connect the repo to [Vercel](https://vercel.com) or Netlify and keep the defaults: build command `npm run build`, output directory `dist`.

The hero video is loaded from a CloudFront URL in `src/App.tsx`. To own that asset, save the file as `public/hero.mp4` and set `VIDEO_SRC` to `"/hero.mp4"`.
