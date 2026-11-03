# Architecture

*Tiếng Việt: [Architecture-vi](Architecture-vi).*

## Repo layout

```
src/
  styles/tokens.css, charts.css   Global + Alias tokens (light / dark / high contrast, brand), the single source of values
  index.css                        turns off Tailwind's default scales, @theme bridge, @utility, keyframes
  lib/                             cn(), brandRamp, tokenExport, deprecate
  components/ui/<Name>/            1 component = 1 folder; barrel index.ts by group
  lib.ts                           npm package entry
  docs/                            docs site (not part of the package)
    registry/*.tsx                 component pages (ComponentDoc), lazy-loaded per file
    concepts/, block-library/      concept pages, blocks
    i18n/                          VI / EN
scripts/                           CSS build, shadcn registry, check steps
templates/                         starter templates generated from blocks + src/docs/template-library (sync-templates)
wiki/                              source of this GitHub Wiki
e2e/                               Playwright (a11y, visual, touch)
```

## Three token layers

```
Global   --brand-80, --grey-14, --shared-teal          (raw values, used only by tokens.css)
  ↓
Alias    --colorBrandBackground, --spacingM, --shadow16  (Fluent UI v9 names)
  ↓
Utility  bg-brand-background, p-3, shadow-16            (components use only this layer)
```

Theme / brand change through `data-theme` / `data-brand` on any element, so themes can be nested. Details: Design.md §2–§4.

## Builds

| Command | Output | Notes |
|---|---|---|
| `npm run build:lib` | `dist/` | ESM `preserveModules`, `.d.ts`, `"use client"` on every component file; `theme.css`, `styles.css`, `tokens.css` (scripts/build-css.mjs) |
| `npm run build:docs` | `dist-docs/` + `public/r/` | Runs `npm run registry` (shadcn items), then the Vite build of the docs site |
| Pages workflow | GitHub Pages | Adds docs for older minors under `/vX.Y/` from tags (scripts/build-versioned-docs.mjs) |

## Docs site: the "hidden" parts

- **Metadata extracted at build time**: the `yugenDocsMeta` plugin (vite.plugins.ts) reads `slug / name / category / lead` from
  every `ComponentDoc` with the Oxc parser that ships with Vite (`parseSync`; TypeScript 7 has no JavaScript API) → the
  sidebar, search and home page show up right away; demos are lazy-loaded per registry file. That is why these 4 fields
  **must be string literals**.
- **Vietnamese demos**: demos, code samples and blocks are written once, in English. The `yugenDemoLang` plugin serves
  `<file>.tsx?lang=vi` with the strings of `registry/vi/<file>.json` (`block-library/vi/` for blocks) swapped in, exact
  matches only. `/vi/` pages load that module instead of the original, so the prerendered HTML is already Vietnamese.
  A pre-pass client build records which modules go into the `common` / `icons` chunks, so the Vietnamese modules don't
  change English chunks; the client build takes about twice as long because of it.
- **Chunks** (`vite.config.ts`): React, `shell` (what the entry imports), `messages`, `icons` (icon families used by 4+
  pages) and `common` (library code used by 16+ pages). Everything else stays per route. Grouping whole libraries made
  every page load ~465 kB, so don't add groups by package. `vite.perf.ts › fluentIconAtoms` rewrites
  `@fluentui/react-icons` imports to per-family files so the shell doesn't pull in every icon.
- **Prefetch** (`src/docs/prefetch.ts`): hovering, focusing or touching an internal link loads that page's chunk, demos
  and translation once. Skipped with Save-Data or on 2G.
- **Service worker** (`src/docs/sw/sw.js`): hashed assets cache-first, pages network-first with an offline copy. Turning
  it off: [[Operations Handbook]] › Docs service worker.
- **`virtual:yugen-type-exports`**: the list of type exports, so the StackBlitz converter can add `import { type X }` on its own.
- **Standalone examples**: `Example.code` (+ shared `setup`) → `exampleToApp()` (src/docs/stackblitz.ts). The same function
  is used for the StackBlitz button and `npm run check:examples`.
- **shadcn registry**: `scripts/build-registry.mjs` infers npm dependencies and component dependencies from each file's imports.

## Key design decisions

| Decision | Reason |
|---|---|
| Tailwind v4 CSS-first, default scales reset | Forces the use of tokens, no stray `bg-blue-500` |
| Spacing on Tailwind's numeric scale (`p-3`) | The Fluent ramp matches Tailwind's 4px scale; code from shadcn/ui works as is. Uppercase aliases (`p-M`) are deprecated since 0.10 (#42) |
| Radix + cmdk + react-day-picker | Proven behavior & a11y |
| Hand-written SVG charts | Token-based color control, a11y (data table, keyboard), no heavy dependency |
| Logical properties + `rtl:` | RTL needs no separate code |
| TypeScript 7 only | The native compiler type-checks ~5× faster. Build scripts parse with Oxc (from Vite); `check:props` uses TypeScript 7's sync API |
| Demos in English + per-file Vietnamese dictionaries | One source for demo code; `/vi/` pages still read naturally, and a test lists strings without a translation |
