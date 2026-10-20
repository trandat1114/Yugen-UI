# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version is `0.x`, minor releases may contain breaking changes.

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

<!-- Maintainer: once the repository URL is public, add compare links here, e.g.
[Unreleased]: https://github.com/<owner>/<repo>/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/<owner>/<repo>/releases/tag/v0.5.0 -->
