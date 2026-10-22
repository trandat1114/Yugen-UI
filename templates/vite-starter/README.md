# My app

A blank [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) project: Vite, React and Tailwind CSS v4, set up and
ready to go.

```bash
npx create-yugen-ui@latest my-app --template starter
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-starter

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- `YugenProvider` with light, dark and high-contrast themes and the Sakura and Web brands, saved in `localStorage`
  with no flash on reload (a small script in `index.html`).
- `toast()` from anywhere, Tooltip, focus rings, RTL.
- An `@/` → `src/` alias (`vite.config.ts` + `tsconfig.json`).
- SEO basics: `description`, Open Graph, `theme-color`, favicon, `robots.txt`.
- Vendor chunks split out, so the build has no size warnings.
- A short welcome page. Its text lives in `src/content/`: English by default, Vietnamese with
  `npx create-yugen-ui@latest my-app --template starter --lang vi`.

## Start building

1. In `src/App.tsx`, replace `<Welcome />` with your app.
2. When you no longer need it, delete `src/Welcome.tsx`, `src/Sakura.tsx` and `src/content/`, and remove the
   Shippori Mincho font `<link>` from `index.html`.
3. Add components: `import { Button, DataGrid } from "yugen-ui"`. Examples are in the
   [docs](https://trandat1114.github.io/Yugen-UI/).

## Brand colour

The appearance menu switches between Sakura and Web. For your own colour, create a palette in
[Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer), paste its CSS into `src/index.css`, and
use its name as the default brand: `"sakura"` in `index.html` (the no-flash script) and in `src/App.tsx`.

## Structure

```
src/
  App.tsx        # YugenProvider and the saved theme: your starting point
  Welcome.tsx    # welcome page (safe to delete)
  content/       # welcome page text, one file per language
  Sakura.tsx     # blossom SVG and the Japanese font class (safe to delete)
  index.css      # @import "tailwindcss" + the Yugen theme
  main.tsx
```

Files in `src/` are generated from `src/docs/template-library/starter` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
