---
"yugen-ui": minor
---

**Breaking:** design tokens are declared in the `theme` cascade layer and split into groups (#354). Your own declarations now win over Yugen's tokens whatever the file order or selector (`:root { --colorBrandBackground: … }`, or `[--colorBrandBackground:#0a7]` on an element); before, the `[data-brand][data-theme]` aliases beat them. `theme-core.css` (the lean path written by `yugen css`) keeps the Sakura brand and the tokens every component needs: the web and teams brands moved to `yugen-ui/tokens/brands.css` (run `yugen css` again, or add `@import "yugen-ui/tokens/brands.css";` after `theme-core.css`), and chart tokens to `yugen-ui/tokens/charts.css`, which `sources/Chart.css` imports. `theme.css`, `styles.css` and `tokens.css` still contain every group. The docs-only `--shared-*` palette is no longer part of the tokens. The compiled floor of `theme-core.css` goes from 6.74 to 5.80 kB gzip.
