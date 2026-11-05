# @yugen-ui/cli

## Unreleased

- `yugen css`: writes `yugen-ui.css` with `@import "yugen-ui/theme-core.css";` and one
  `@import "yugen-ui/sources/<Folder>.css";` per component folder your code imports, instead of `theme.css` with every
  component. On the templates the gzipped CSS goes from about 26 kB to 12–20 kB (−24% to −54%). Imports are read with
  a small lexer, so examples inside strings, comments or JSX text don't count; `import * as`, `export *` and
  `import()` of `yugen-ui` fall back to `theme.css`. `--check` exits with 1 when the file is out of date; `--src`
  limits the folders it reads; `--precompile` compiles plain CSS for apps without Tailwind (26.8 kB → 12.8–21.1 kB)
  with the project's own `tailwindcss`, `@tailwindcss/node` and `@tailwindcss/oxide` (#169).
- `init` (package mode, Tailwind CSS v4) writes `yugen-ui.css` and imports it instead of `yugen-ui/theme.css`. A CSS
  file that already imports `theme.css` is left as it is.
- `add` in package mode adds the component to `yugen-ui.css` when the app has one.
- `doctor` accepts `yugen-ui/theme-core.css` (it reported "theme not imported"), warns when `yugen-ui.css` is out of
  date or not imported, and names the components imported without their `sources/<Folder>.css`.
- No runtime dependencies: own prompts on `node:readline` and colors with `node:util` `styleText` replace
  `@clack/prompts` and `picocolors` (#381).
- Bundled templates ship `package.json` as `_package.json`; `create` renames it back. Scanners no longer read the
  templates' manifests as dependencies of the CLI (#381).
- `create --ref` no longer reads `GITHUB_TOKEN` / `GH_TOKEN` (#381).
- `add` / `update` refuse registry file paths that leave the target folder and dependency specs that are not npm
  package specs; on Windows the package manager that launched the CLI runs without a shell (#381).
- `LICENSE` file in `@yugen-ui/cli` and `create-yugen-ui`; `homepage` points to the path URL of the CLI page.

## 0.7.0

- `doctor` reports React 18 as an error: yugen-ui 0.15 needs React 19 or later.
- Template `docs` reads its pages with `React.use`.
- Vite templates use TypeScript 7 (`^7.0.2`, the native compiler): `npm run build` type-checks several times
  faster. `next-starter` stays on TypeScript 6, because `next build` type-checks through TypeScript's JavaScript API.
- Vite templates catch render errors with `ErrorBoundary` from yugen-ui 0.15: a page that fails shows a status page with
  Try again (or Reload when a file failed to load after a deploy) instead of a blank screen. `saas` and `starter` show
  a 404 page for unknown paths instead of the home page, and `landing` writes a static `404.html` at build time.

## 0.6.0

- **Breaking:** requires Node.js 24 or newer. Yugen UI supports the two newest Node.js LTS lines (24 and 26 today).
- Templates `starter`, `saas`, `blog`, `dashboard`, `ai-chat`, `admin`, `docs`, `store` and `landing` are built on
  `AppShell` from yugen-ui 0.14.0: collapsible sidebar (icon rail, Drawer on narrow screens), Ctrl+B / ⌘B, skip link.
- Template `admin`: Board page (Kanban) with `Sortable`, saved on drop, rolled back with a toast when the request fails.

## 0.5.1

- Template `glass`: cherry blossom trips in Kyoto, Tokyo, Hirosaki and around Mount Fuji (photos from Wikimedia Commons,
  credited with their license), `<GlassRefraction />` at the app root, a Settings preview of the bars over a bright,
  a blossom and a night photo, and a world map on Explore with every trip pinned at its coordinates.
- Templates `blog` and `docs`: Markdown articles are styled with `Prose` from yugen-ui instead of classes on every tag.

## 0.5.0

- New template: `glass` (`create --template glass`), a travel journal with glass navigation over photos.
- New template: `landing` (`create --template landing`), a product landing page with pricing, FAQ and a sign-up
  form; the first screen and the SEO tags are written into `index.html` at build time.
- New template: `admin` (`create --template admin`), customers and orders with a server-paged DataGrid, drawer forms
  with validation, optimistic updates, and sign-in with a one-time code.
- New template: `next-starter` (`create --template next-starter`), a Next.js App Router project with the theme in a
  cookie so the server renders it. `create --lang` works without an `index.html`.
- New template: `docs` (`create --template docs`), a documentation site built from Markdown files, with Ctrl K search
  and an HTML file for every page.
- New template: `store` (`create --template store`), a small shop with filters kept in the URL, a cart in a Sheet and a
  validated multi-step checkout; prices in US dollars, or dong with `--lang vi`.
- Templates pin `yugen-ui@^0.12.0`. The SaaS template uses real paths (`/analytics`) instead of `#/analytics`, and the
  single-page templates ship deploy configs: `public/_redirects` (Netlify), `vercel.json` and `npm run build:gh-pages`
  (GitHub Pages).

## 0.4.0

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
- `create --lang` also writes that language's `<title>`, description and Open Graph tags into `index.html` (from
  `templates.json`), so link previews and crawlers see the right language before the app runs.
- Templates: Dashboard (4 pages, one date range for every chart, DataGrid with CSV export) and AI chat (conversation
  list, streamed replies you can stop, your own backend) are full apps. With `--lang en` the built-in component strings
  are English too (`messagesEn` in `src/content/en.ts`); `--lang vi` ships nothing extra. Pages load lazily. Templates
  depend on `yugen-ui@^0.11.0`.

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
