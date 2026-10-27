# Sakura Notes Docs

A documentation site built with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) on Vite, React and
Tailwind CSS v4. Pages are Markdown files: add one and it shows up in the sidebar, search and sitemap.

```bash
npx create-yugen-ui@latest my-app --template docs
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-docs

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Pages are `src/content/<lang>/docs/<section>/<page>.md`. Each folder is a sidebar section, and the URL is the file
  path (`/guides/cli/`).
- A sidebar `Nav` (a `Drawer` on narrow screens, container queries), a table of contents that highlights the heading
  you are reading, previous / next links and a skip link.
- Search in a `Command` palette (**Ctrl / ⌘ K** or the search button) over page titles and h2 / h3 headings, accents
  ignored. The index comes from the Markdown at build time and loads when the palette first opens.
- Markdown through Yugen UI's safe parser: highlighted code with a copy button, one block with a tab per language,
  npm / pnpm / yarn / bun tabs for install commands, callouts, tables, task lists, images and internal links.
- The first load holds the front matter only: the text of each page is its own chunk, loaded when the page opens.
- **SEO at build time** (the `docsSeo` plugin in `vite.config.ts`): an HTML file per page with `<title>`,
  `description`, canonical, Open Graph and `TechArticle` JSON-LD, plus `sitemap.xml`, `robots.txt` and `404.html`.
- Light, dark and high-contrast themes, saved in `localStorage` with no flash on reload.
- English text and sample pages for a made-up product, Sakura Notes. For Vietnamese, create the app with
  `npx create-yugen-ui@latest my-app --template docs --lang vi`.

## Writing pages

```md
---
title: Installation
description: One sentence for search results and link previews.
order: 2
---
```

`order` sorts the pages of a section. The `index.md` of a folder names the section with the same `title` and
`order`; it is not a page, only its front matter is read. Link to a page by its path, `[CLI](/guides/cli/)`, or to a
heading with its id, `[Scopes](/api-reference/authentication/#scopes)`. Headings start with `#` at the start of a line;
h2 and h3 go into the table of contents and search.

Fenced code takes a few extras after the language:

- `` ```npm ``: one `npm install <packages>` (`-D` allowed) or `npx <command>` line, shown with tabs for npm, pnpm,
  yarn and bun. The choice is remembered across pages.
- `` ```ts title=src/app.ts ``: a code block with a file name.
- `` ```ts tab=TypeScript ``: fences with `tab=` next to each other become one block with a tab each.

A quote that starts with `[!NOTE]`, `[!TIP]` or `[!WARNING]` becomes a callout.

## Structure

```
src/
  site.ts                # your domain (SITE.url)
  content/<lang>.ts      # site name, description and interface text
  content/<lang>/docs/   # <section>/index.md names a section, <section>/<page>.md is a page
  content/index.ts       # the language in use (the app and the build read it)
  docs.ts                # front matter, sections and order, headings, page titles (shared with vite.config.ts)
  pages.ts               # the sidebar up front, the text of each page on demand
  Markdown.tsx           # Markdown to components: code tabs, package manager tabs, callouts
  Layout.tsx             # top bar, sidebar and Drawer, footer
  DocPage.tsx            # a page: title, text, previous / next, table of contents
  SearchPalette.tsx · search.ts · HomePage.tsx · router.tsx
vite.config.ts           # docsContent (trims Markdown imports) and docsSeo (HTML per page, sitemap)
```

## Deploy

1. Set `url` in `src/site.ts` to your domain (the build warns while it is still `example.com`).
2. Run `npm run build` and upload `dist/` to any static host. For a subfolder (GitHub Pages):
   `BASE=/repo-name/ npm run build`.
3. Submit `sitemap.xml` to Google Search Console.

Every page is a real HTML file, so the host needs no rewrite rules; unknown paths get `404.html`.

Files in `src/` are generated from `src/docs/template-library/docs` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
