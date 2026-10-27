# @yugen-ui/cli

The command-line tool for [Yugen UI](https://trandat1114.github.io/Yugen-UI/): start an app from a template, set up
Yugen UI in an existing project, copy component source from the registry and check that everything is wired up.

```bash
npx @yugen-ui/cli@latest <command>
```

Installed (`npm i -D @yugen-ui/cli`), the command is `yugen`: `npx yugen add button`. The package is scoped because npm
rejects the name `yugen` as too similar to an existing package.

| Command | What it does |
|---|---|
| `yugen create [dir]` | New app from a template (`starter`, `saas`, `blog`, `dashboard`, `ai-chat`, `glass`, `admin`, `next-starter`, `store`). Same as `npm create yugen-ui@latest`. |
| `yugen init` | Set up an existing React project — npm package or source mode. Writes `yugen.json`. |
| `yugen add <names…>` | Copy components (and everything they depend on) into your project, install their npm dependencies. |
| `yugen diff [names…]` | Compare copied source with the registry (all installed components without names). |
| `yugen update [names…]` | Apply the registry version: shows the diff, asks, then writes. `--dry-run` only shows it. |
| `yugen remove <names…>` | Delete a component's files that nothing else in the project imports. |
| `yugen theme --brand <hex>` | Generate a brand ramp into `yugen-brand.css` next to your main CSS and import it. |
| `yugen list [query]` | List the components in the registry; `✓` marks the ones you already have. |
| `yugen doctor` | Check React, Tailwind CSS v4, the theme import, the `yugen-ui` version and `YugenProvider`. |

## create

```bash
npx @yugen-ui/cli@latest create my-app --template saas
```

Templates ship inside the CLI, so this works offline apart from installing dependencies. Options: `-t, --template`,
`--lang <en|vi>` (language of the app's text, for templates that have both; English by default),
`--pm <npm|pnpm|yarn|bun>`, `--no-install`, `--no-git`, `--force`, `-y`.

## init

Detects the framework (Vite, Next.js, React Router, TanStack Start), the package manager and your main CSS file, then
asks how you want to use Yugen UI:

- **package** — installs `yugen-ui` and adds `@import "yugen-ui/theme.css";` right after `@import "tailwindcss";`.
  Without Tailwind CSS v4 it imports the precompiled `yugen-ui/styles.css` in your entry file instead.
- **source** (needs Tailwind CSS v4) — writes the theme next to your CSS file as `yugen.css`, imports it, and copies
  `cn()` and `YugenProvider` into `components/ui` / `lib` (under `src/` or your `@/*` alias). Imports use your tsconfig
  alias when there is one, relative paths otherwise. `"use client"` is kept only for Next.js.

```bash
npx @yugen-ui/cli@latest init --mode source
```

Options: `--mode <package|source>`, `--css <file>`, `--registry <url|dir>`, `--overwrite`, `--no-install`, `-y`.

## add

```bash
npx @yugen-ui/cli add button dialog data-grid
npx @yugen-ui/cli add --all
npx @yugen-ui/cli add select --dry-run
```

Names are matched loosely (`data-grid`, `DataGrid`). Files you have edited are left alone unless you pass
`--overwrite`. In package mode `add` prints the import instead — the components are already in `yugen-ui`.

## yugen.json

```json
{
  "mode": "source",
  "framework": "vite",
  "rsc": false,
  "css": "src/index.css",
  "paths": { "ui": "src/components/ui", "lib": "src/lib" },
  "aliases": { "ui": "@/components/ui", "lib": "@/lib" }
}
```

Projects set up with `npx shadcn init …/r/init.json` work without it: `add` reads `components.json` instead. A project
with `yugen-ui` in its dependencies and no `yugen.json` (an app made by `create`) is treated as package mode.

## Registry

Components come from `https://trandat1114.github.io/Yugen-UI/r` (the same shadcn-compatible registry as
`npx shadcn add`). Point `--registry` (or `"registry"` in `yugen.json`) at another URL or at a local folder, e.g. a
clone's `public/r` after `npm run registry`.

MIT License
