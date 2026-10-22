# Changelog

## 0.8.1

### Patch Changes

- 7cb3170: Docs site: one Appearance menu in the top bar for mode, brand and text direction, with the language switch available on every screen size; component examples get a one-row toolbar that collapses to icons on small screens; the home page has a new hero, an npm / shadcn install snippet and a searchable component list that opens one demo at a time on phones. New ink-brush logo and favicon. The npm package is unchanged.

## 0.8.0

### Minor Changes

- 68a54b3: shadcn registry: set up a project in one command — `npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json` (Next.js App Router / React Router: `init-next.json`) creates `components.json` if missing, copies the theme, `cn()` and `YugenProvider`, installs the npm packages and adds the theme `@import` to your main CSS file, without the default shadcn/ui style. The `theme` and new `theme-next` items now import themselves into your CSS.

  **Breaking (registry only):** component items no longer pull in `theme`. Run `init` once per project, or add `…/r/theme.json` (Next.js: `theme-next.json`) together with your first component. The npm package is unchanged.

### Patch Changes

- dc72f1a: Templates: new `vite-starter` (blank start with a persisted theme, `@/` alias, SEO basics and a cherry-blossom welcome page to delete), `vite-saas` (8-page app with sidebar, Ctrl K command palette and notifications) and `vite-blog` (Markdown posts, build-time HTML per post, `sitemap.xml` and `rss.xml`). Create a project with `npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-starter my-app --install`, or preview every template at `#/templates` on the docs.

## 0.7.0

### Minor Changes

- ad4d8c1: New `Autocomplete`: a search box with suggestions following the ARIA combobox pattern — accent-insensitive filtering ("xoai" matches "Xoài"), match highlighting, grouped suggestions with icons and descriptions, disabled items, `minChars={0}` for recent searches, server-side mode (`filter={false}` + `loading` with a 300 ms spin delay), `onSelect` for suggestions and `onSubmit` for the raw query. Also exports `HighlightMatch` and `highlightRanges` for highlighting matches in filtered lists.
- ad4d8c1: New `Quote` component: attributed quotations rendered as `<figure>` › `<blockquote cite>` + `<figcaption>` (author, title, `<cite>` source with optional link), with `default`, `subtle` and `emphasis` (testimonial) appearances and three sizes. The accent bar uses logical borders, so it flips in RTL.

## 0.7.0-next.0

### Minor Changes

- ad4d8c1: New `Autocomplete`: a search box with suggestions following the ARIA combobox pattern — accent-insensitive filtering ("xoai" matches "Xoài"), match highlighting, grouped suggestions with icons and descriptions, disabled items, `minChars={0}` for recent searches, server-side mode (`filter={false}` + `loading` with a 300 ms spin delay), `onSelect` for suggestions and `onSubmit` for the raw query. Also exports `HighlightMatch` and `highlightRanges` for highlighting matches in filtered lists.
- ad4d8c1: New `Quote` component: attributed quotations rendered as `<figure>` › `<blockquote cite>` + `<figcaption>` (author, title, `<cite>` source with optional link), with `default`, `subtle` and `emphasis` (testimonial) appearances and three sizes. The accent bar uses logical borders, so it flips in RTL.

## 0.6.0

### Minor Changes

- Charts: new `ScatterChart` (bubble size, groups with marker shapes, nearest-point tooltip, keyboard navigation, optional least-squares trend line) and `Heatmap` (sequential or diverging scale with gradient legend, 2-D keyboard navigation); `AreaChart` gains `stackOffset="expand"` (100 % stacked); `LineChart` / `AreaChart` gain a `brush` overview strip with `domain` / `defaultDomain` / `onDomainChange` for zooming.
- New `DataGrid`: typed columns (`createColumn`), stable sorting with `aria-sort`, single / multi row selection (Space, Shift ranges, Ctrl+A, indeterminate header checkbox), resizable columns (pointer, keyboard, double-click to fit; mirrored in RTL), virtualization for large lists with correct `aria-rowcount` / `aria-rowindex`, cell or row keyboard navigation, sticky header and leading columns, and loading / empty states.
- New `FileUpload` (dropzone with click, keyboard, drag-and-drop and paste; `accept` / `maxFiles` / `maxSize` / custom validation with inline errors; per-file progress, status, retry and thumbnails) and `Stepper` / `Step` / `Wizard` (horizontal or vertical steps, linear mode, per-step sync or async validation, compact "Bước n/N" view on narrow containers, RTL-aware connectors).
- Yugen Labs AI kit and more: `StreamingMarkdown` (safe Markdown renderer for token-by-token answers — no `dangerouslySetInnerHTML`, `javascript:` links rejected, code blocks via `CodeBlock`, tables, citations), `Citation` / `CitationList`, `Reasoning` (collapsible thinking block with elapsed time), `PromptInput` (auto-growing composer with attachments, validation, Send/Stop), `Tour` (guided tour with spotlight and `useTour()`), and `NotificationCenter` (bell with unread count, popover on desktop and bottom sheet on mobile, grouped by day, mark read / dismiss).
- New `Overflow` (priority-aware collapsing of toolbar, tab, breadcrumb or tag items into a "more" menu; `OverflowItem`, `OverflowDivider`, `useOverflowMenu`, `useOverflowItems`) and `TimePicker` (typed-time parsing such as "9h30" or "9:30 PM", increments, min/max bounds, 12/24-hour cycle from the locale, works inside `Field`). `DateRangePicker` gains `presets` and `DEFAULT_RANGE_PRESETS` (today, last 7 / 30 days, this month, last month).
- shadcn CLI registry: install any component as source code with `npx shadcn@latest add https://trandat1114.github.io/Yugen-UI/r/<name>.json` (or `@yugen/<name>` with a namespaced registry). Each item brings the components it imports, `cn()` and the theme (`styles/yugen.css`), and installs the npm dependencies it needs. Component pages in the docs now show npm, shadcn CLI and in-repo import snippets.
- Token export: `rampToDesignTokens()` (W3C Design Tokens / DTCG) and `rampToTokensStudio()` (Tokens Studio for Figma) turn a brand ramp into JSON with the 16 ramp steps plus light and dark brand aliases (`BRAND_ALIAS_STEPS`). The Theme Designer can now copy or download CSS, DTCG JSON and Tokens Studio JSON.

### Patch Changes

- Accessibility and RTL fixes found by the new axe and drag tests: `Tabs` gives the active tab an accessible name and only points `aria-controls` at rendered panels; `ScrollArea` viewports are keyboard-focusable; the `DatePicker` trigger uses `role="combobox"`; `Command` separators, `List` multiselect checkboxes and the `Resizable` collapse button no longer nest interactive controls; the warning `Badge` uses the new `colorNeutralForeground1Static` token for contrast; themes nested inside high contrast no longer inherit the cyan accent; `Resizable` drag and arrow keys follow the pointer in RTL.
- React 19 compatibility: `SpinButton` no longer calls `useRef` without an initial value, so the package typechecks with `@types/react` 19. CI now runs the type check, unit tests and library build against React 19 as well as React 18.
- SSR and hydration fixes: `Resizable` groups with `persistKey` now apply the saved layout after hydration instead of during render (no mismatch); components that measure layout use an isomorphic layout effect, so React 18 servers no longer warn about `useLayoutEffect`; `formatTraceDuration` rounds 999.6 ms to "1.0s" and 59.96 s to "1m 00s".

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version is `0.x`, minor releases may contain breaking changes.

From **0.6.0** on, entries are generated by [Changesets](https://github.com/changesets/changesets): every pull request
with a user-facing change adds one with `npx changeset`, and `npx changeset version` writes them here at release time
(newest release at the top of the file, as `## x.y.z`). Entries for 0.5.0 and earlier were written by hand.

## [Unreleased]

## [0.5.0] - 2026-10-20

### Added

- **Yugen Labs** components: Trace, Questionnaire, Message Scroller, Code Block, Charts (with chart tokens),
  Sheet and Wait UX (loading patterns).
- **npm package** `yugen-ui`: tree-shakeable ESM build (`preserveModules`), TypeScript declarations, `"use client"`
  directives for the Next.js App Router, and three stylesheets — `theme.css` (Tailwind v4 source),
  `styles.css` (precompiled, no Tailwind needed) and `tokens.css` (raw CSS variables).
- `cn()` and the brand-ramp helpers (`generateBrandRamp`, `adjustKeyForContrast`, `contrastRatio`, `rampToCss`,
  `rampToStyle`…) exported from the package entry.
- Community and News pages on the docs site.
- `lint:classes` script: Tailwind canonical-class checker (`--fix` to repair).
- Open-source files: README (English / Tiếng Việt), LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR
  templates, CI and release workflows.

### Changed

- `react` and `react-dom` (>= 18) are now peer dependencies; `tailwindcss` v4 is an optional peer.
- The docs site builds to `dist-docs/`; `dist/` is reserved for the library.
- The docs site is deployed to GitHub Pages (`.github/workflows/pages.yml`).

### Fixed

- `ChartLegendProps` no longer conflicts with the DOM `onToggle` event type of `@types/react` 19.
- `Trace`: the live duration of a running step is rendered after mount, so server and client HTML match
  (no hydration error in Next.js).
- Charts read `forced-colors` with `useSyncExternalStore`, so server and client agree during hydration.

## [0.4.0] - 2026-10-20

### Added

- **Concepts** docs section (introduction, quick start, styling, theming, accessibility, focus indicator, labelling,
  positioning, notifications, slots, truncation, SSR, browser support, migration from Fluent and shadcn/ui).
- **RTL** support across all components (logical properties, Radix `DirectionProvider`, direction-aware keyboard
  navigation and slide animations).
- **High contrast** theme (`data-theme="high-contrast"`).
- `YugenProvider` (theme, brand, direction, tooltip provider and toaster) with `useYugen` and `usePortalThemeProps`.
- **Theme Designer**: generate a custom brand ramp from one key colour with contrast checks.
- **Motion** components (Fade, Scale, Slide, Collapse, Blur, Rotate, Stagger, `usePresence`) and utilities
  (VisuallyHidden, AriaLive announcer with `useAnnounce`, focus-management hooks).

## [0.3.0] - 2026-10-20

### Added

- **Sakura 桜** brand, now the default brand.
- 47 new components, covering most of the shadcn/ui and Fluent 2 catalogues.
- **Blocks**: copy-ready page sections built only from library components.

### Changed

- Project renamed to **Yugen UI**.

## [0.2.0] - 2026-10-20

### Added

- Foundation pages: Color, Typography, Spacing, Radius, Elevation and Motion.
- Gradient tokens and utilities (for illustration and hero areas only).
- Brand themes switchable with `data-brand`.

### Changed

- Docs site redesigned after the Fluent 2 documentation.

## [0.1.0] - 2026-10-20

### Added

- Fluent 2 design tokens (global and alias layers; light and dark themes) bridged to Tailwind CSS v4 utilities.
- 11 core components.
- Documentation site.

[Unreleased]: https://github.com/trandat1114/Yugen-UI/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.8.0
[0.7.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.7.0
[0.6.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.6.0
[0.5.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.5.0
