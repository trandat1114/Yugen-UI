# @yugen-ui/cli

## Unreleased

- `yugen diff [names…]`: compare copied component source with the registry and print a unified diff. Without names it
  checks every Yugen component found in the project.
- `yugen update [names…]`: apply the registry version, with the diff shown first and a confirmation; `--dry-run` only
  shows it. New files and npm dependencies of updated components are added.
- `yugen remove <names…>`: delete a component's files unless something else in the project still imports them
  (relative imports and aliases are followed).
- `yugen theme --brand <hex> [--name] [--vibrancy] [--torsion]`: generate the 16-step brand ramp (the Theme Designer's
  algorithm) into `yugen-brand.css` next to the main CSS file and import it. Warns when white text on the primary button is
  under 4.5:1 and suggests a key that passes.
- `yugen init` wraps the app in `YugenProvider`: `<App />` in Vite's `main.tsx`, `{children}` in Next.js
  `app/layout.tsx`. `--no-provider` keeps the printed instructions instead.
- `create --ref <branch|tag>`: take the templates from a branch or tag of the repository instead of the bundled copy.
- `create --lang en|vi` also works for the SaaS and Blog templates. It now removes the other language's
  `src/content/<lang>/` folder (the blog's posts) as well as `src/content/<lang>.ts`.

## 0.3.0

- Templates: Vite 8 (Rolldown), `@vitejs/plugin-react` 6 and TypeScript 6. Chunks are split with `codeSplitting`
  instead of the deprecated `manualChunks`; `tsconfig.json` drops `baseUrl` (deprecated in TypeScript 6).
- `doctor`, `add`, `list`: a project with `yugen-ui` in its dependencies and no `yugen.json` (an app made by `create`,
  or one set up by hand from the README) is read as package mode. `doctor` no longer warns on a fresh app, and `add`
  prints the import line instead of asking for `yugen init`.

## 0.2.0

- `create --lang en|vi`: language of the app's text for templates that have both (the starter today). English by
  default; interactive runs ask after the template.
- Templates: short names (Starter, SaaS, Blog, Dashboard, AI chat). The starter is a minimal English page with the Sakura
  and Web brands; its text lives in `src/content/`.
- Requires Node.js 22 or later (`engines`); Node.js 20 reached end of life. `create-yugen-ui` 0.2.0 follows.

## 0.1.0

- First release: `yugen create`, `init` (package / source mode), `add`, `list` and `doctor`.
- Templates `starter`, `saas`, `blog`, `dashboard`, `ai-chat` bundled in the package.
- `create-yugen-ui` 0.1.0: `npm create yugen-ui@latest` runs `yugen create`.
- Published as `@yugen-ui/cli` (run with `npx @yugen-ui/cli@latest`, the installed command is `yugen`): npm rejects the
  unscoped name `yugen` as too similar to `hygen`.
