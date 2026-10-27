# Sakura Journeys

A travel journal from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Photos fill the screen and the navigation floats above them in glass, a Yugen Labs material (names may change before
Yugen UI 1.0).

```bash
npx create-yugen-ui@latest my-app --template glass
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-glass

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Journal (`/`): an edge-to-edge photo under the floating bars, then the trips.
- Trip (`/trips/<id>`): a glass toolbar with grouped actions, a photo gallery, the story, and the details in a glass
  bottom sheet with snap points (inset from the edges, opaque at the top snap point).
- Explore (`/explore`): one full-screen picture with every trip as a pin, filters, zoom and a search field floating
  over it in clear glass, on a dimmed photo (`glass-scrim`).
- Settings (`/settings`): theme, brand, glass or solid bars, clear or regular controls over photos, photo credits.
- Navigation: a glass sidebar from 768px (an icon rail until 1024px); below that, a header and a tab bar that shrinks
  while you scroll down (`useScrollMinimize`). Breakpoints are container queries.
- Search in a glass dialog, from the sidebar, the header or the tab bar.
- All text lives in `src/content/`: English by default, Vietnamese with
  `npx create-yugen-ui@latest my-app --template glass --lang vi`.

## Glass and accessibility

Glass is opt-in per component: `material="glass"` on `Toolbar`, `Nav`, `TabsList`, `MenuPopover`,
`PopoverSurface`, `DialogSurface` and `SheetContent`, `appearance="glass-prominent"` on one `Button`, and the
`glass` utilities for your own bars. Text on glass keeps a 4.5:1 contrast over any photo. Reduce transparency, Increase
contrast, forced colors and the high-contrast theme make it opaque; the Solid setting shows that look. Use the clear
variant only over a photo dimmed with `glass-scrim`.

## Photos

Sample photos from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license), picked
from the [Lorem Picsum](https://picsum.photos) list, in AVIF at 640 and 1280px wide (`src/photos/`):
Yoni Kaplan-Nadel, Margaret Barley, Go Wild, Jeffrey Kam, Jerry Adney and Paul Jarvis. Replace them with your own in
`src/photos.ts`.

## Deploy

`npm run build` and upload `dist/` to a static host. Pages are real paths, so a deep link such as `/settings` must
get the app back from the host:

- **Netlify**: nothing to do, `public/_redirects` sends unknown paths to `index.html`.
- **Vercel**: nothing to do, `vercel.json` has the same rewrite.
- **Cloudflare Pages**: nothing to do, it serves the app for unknown paths when there is no `404.html`.
- **GitHub Pages**: `npm run build:gh-pages` also writes `dist/404.html`, which GitHub Pages serves for unknown
  paths. For a project site, add the repository name: `npm run build:gh-pages -- --base=/my-repo/`.

Under a sub-path on another host, build with `npm run build -- --base=/my-app/`.

## Structure

```
src/
  App.tsx            # YugenProvider, saved appearance, router
  Layout.tsx         # glass sidebar / header / tab bar, search, the page for the route
  HomePage.tsx · TripPage.tsx · ExplorePage.tsx · SettingsPage.tsx · NotFoundPage.tsx
  SearchDialog.tsx   # glass dialog with live results
  trips.ts           # trips: photos, dates, pins (text is in content/)
  photos.ts          # photo imports and credits
  router.tsx         # / · /trips/<id> · /explore · /settings
  content/           # every string, one file per language
```

Files in `src/` are generated from `src/docs/template-library/glass` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
