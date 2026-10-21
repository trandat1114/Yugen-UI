---
"yugen-ui": minor
---

shadcn registry: set up a project in one command — `npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json` (Next.js App Router / React Router: `init-next.json`) creates `components.json` if missing, copies the theme, `cn()` and `YugenProvider`, installs the npm packages and adds the theme `@import` to your main CSS file, without the default shadcn/ui style. The `theme` and new `theme-next` items now import themselves into your CSS.

**Breaking (registry only):** component items no longer pull in `theme`. Run `init` once per project, or add `…/r/theme.json` (Next.js: `theme-next.json`) together with your first component. The npm package is unchanged.
