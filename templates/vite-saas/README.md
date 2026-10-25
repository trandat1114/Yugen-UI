# Sakura Studio

A complete SaaS app built with [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) on Vite, React and Tailwind
CSS v4, ready for your own data.

```bash
npx create-yugen-ui@latest my-app --template saas
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-saas

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- A sidebar `Nav` with groups and counts; on narrow screens it becomes a `Drawer` (container queries, no JS measuring).
- A **Ctrl / ⌘ K** command palette: go to a page, switch theme or brand, quick actions.
- `NotificationCenter`, an account menu, a breadcrumb and an export button with a `toast`.
- Light, dark and high-contrast themes and the Sakura, Web and Teams brands, saved in `localStorage` with **no flash** on
  reload (a small script in `index.html`).
- 8 sample pages: Overview, Analytics, AI assistant, Inbox, Calendar, Team, Billing and Settings. Each page loads on
  demand; the others are fetched while the browser is idle.
- Hash routing (`#/analytics`) with no extra library; the tab title and `<meta name="description">` follow the page.
- SEO basics: `description`, Open Graph, `theme-color`, `robots.txt`.
- English text and sample data in `src/content/`. For Vietnamese, create the app with
  `npx create-yugen-ui@latest my-app --template saas --lang vi`.

## Structure

```
src/
  App.tsx             # root: YugenProvider, hash routing, saved theme, page title
  AppShell.tsx        # layout: sidebar, top bar, Drawer, content
  CommandPalette.tsx  # Ctrl K command palette
  pages.tsx           # page list: one entry per page in the sidebar and the command palette
  pages/              # one file per page, loaded on demand
  content/            # all text and sample data, one file per language; index.ts picks the language
  format.ts           # amounts in the content's currency and locale
```

## Customize

- **Add a page**: create `src/pages/<id>.tsx`, add the id to `PageId` in `src/content/types.ts` and its text to
  `pages` in `src/content/<lang>.ts`, then add an entry to `PAGES` in `src/pages.tsx`.
- **Change the default brand**: replace `"sakura"` in `index.html` and `App.tsx`; make your own palette in
  [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer).
- **Use a real router** (React Router, TanStack Router): replace `pageFromHash` / `navigate` in `App.tsx` and pass the
  router's `href` to `NavItem` (`asChild`).

Files in `src/` are generated from `src/docs/template-library/saas` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
