---
"yugen-ui": minor
---

New `yugenHtmlAttributes()` and `yugenThemeScript()` for server-rendered and prerendered apps, so the first paint uses the right theme (#348). `<html {...yugenHtmlAttributes({ theme, brand, dir })}>` writes the same attributes as `<YugenProvider applyToDocument>` into the first HTML. `yugenThemeScript({ storageKey })` returns a small inline script for `<head>` that sets `data-theme` before the first paint, from the saved choice (a theme name, or JSON with `theme`, `brand` and `dir`) or else from `prefers-contrast` and `prefers-color-scheme`. Both are plain functions that work in a Next.js Server Component. `YugenProvider applyToDocument` now writes the attributes in a layout effect, before the browser paints, instead of after it.
