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

- Journal (`/`): an edge-to-edge photo under the floating bars, then the trips: cherry blossom season in Kyoto,
  Tokyo, Hirosaki and around Mount Fuji, and a few hikes.
- Trip (`/trips/<id>`): a glass toolbar with grouped actions, a photo gallery, the story, and the details in a glass
  bottom sheet with snap points (inset from the edges, opaque at the top snap point).
- Explore (`/explore`): a full-screen world map with every trip pinned at its coordinates. It flies to the trips of
  the filter and the search; drag it (it glides on), pinch, scroll or double-click to zoom, and pins too close together
  join into one that zooms in on them. Filters, zoom and search float over it in glass. The land is drawn on a canvas
  and moved as one layer between redraws, so the map keeps 60 fps under the glass bars (`src/useMapView.ts`).
- Settings (`/settings`): a preview of the bars and controls over a bright, a dense and a night photo, then theme,
  brand, glass or solid bars, clear or regular controls over photos, and the photo credits.
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

`<GlassRefraction />` in `App.tsx` makes the edges of every glass surface bend the photo behind them, like the rim
of a lens, while the middle stays frosted. Chromium browsers draw it; Safari and Firefox keep the regular glass. It turns
off with everything that turns off the blur.

## Photos

Sample photos in AVIF at 640 and 1280px wide (`src/photos/`), credited on the Settings page and in `src/photos.ts`:

- Japan: [Wikimedia Commons](https://commons.wikimedia.org), CC BY 2.0 / 3.0 / 4.0 or public domain: rumpleteaser,
  Raita Futo, mko294, Midori, Mocchy and Guilhem Vellut. CC BY needs the credit wherever you show the photo.
- Nature: [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license), picked from the
  [Lorem Picsum](https://picsum.photos) list: Yoni Kaplan-Nadel, Margaret Barley, Go Wild, Jeffrey Kam, Jerry Adney
  and Paul Jarvis.

Replace them with your own in `src/photos.ts`.

The Explore map draws the land of [Natural Earth](https://www.naturalearthdata.com) at 1:50m (public domain), from the
[world-atlas](https://github.com/topojson/world-atlas) files, in `src/land.ts`. Pins come from `coords` in
`src/trips.ts` (degrees, north and east positive); the projection is in `src/map.ts`.

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
  trips.ts           # trips: photos, dates, coordinates (text is in content/)
  map.ts · land.ts   # map projection, fit, zoom and flights · land outlines
  useMapView.ts      # the Explore map: drawing, gestures, pins
  photos.ts          # photo imports and credits
  router.tsx         # / · /trips/<id> · /explore · /settings
  content/           # every string, one file per language
```

Files in `src/` are generated from `src/docs/template-library/glass` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
