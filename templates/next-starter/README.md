# My app

A [Next.js](https://nextjs.org) App Router project with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates)
and Tailwind CSS v4.

```bash
npx create-yugen-ui@latest my-app --template next-starter
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/next-starter

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- `YugenProvider` in one Client Component (`src/app/providers.tsx`), wrapped around the app in `src/app/layout.tsx`.
- The theme and brand live in cookies. The root layout reads them and writes `data-theme` / `data-brand` on `<html>`,
  so the first HTML is already in the right theme, with no flash. On a first visit, a tiny script picks light or dark
  from the OS before the first paint. Reading cookies renders pages per request; for a fully static site, drop the
  cookies and keep only the script.
- `src/app/page.tsx` is a Server Component that renders Yugen components (no `"use client"`): their props are text and
  elements. `src/components/AppearanceForm.tsx` is a Client Component because it has state and event handlers.
- Fluent icons run style code when they load, so Server Components import them from `src/components/icons.ts` (a
  `"use client"` file that re-exports the ones you use), not from `@fluentui/react-icons` directly.
- `metadata` per page with a title template, `next/font` (Noto Sans, self-hosted, Vietnamese glyphs) as Yugen's base
  font in `src/app/globals.css`, a not-found page and a skip link.
- All text in `src/content/`: English by default, Vietnamese with
  `npx create-yugen-ui@latest my-app --template next-starter --lang vi`.

## Structure

```
src/
  app/
    layout.tsx        # <html> with the saved theme, metadata, next/font, header
    providers.tsx     # "use client": YugenProvider, theme and brand state, cookies
    page.tsx          # Server Component home page
    settings/page.tsx # Server Component page with a Client Component form
    not-found.tsx
    globals.css       # Tailwind + yugen-ui/theme.css, base font
  components/         # SiteHeader (server), NavLinks and AppearanceForm (client)
  appearance.ts       # cookie names and the first-visit script
  content/            # every string, one file per language
```

## Deploy

`npm run build` then `npm start` on any Node host, or push to Vercel. The pages read cookies, so they render on the
server; a static export (`output: "export"`) needs the cookies removed first.

Files in `src/` are generated from `src/docs/template-library/next-starter` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
