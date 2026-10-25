# Sakura Analytics

A [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates) sales dashboard: Vite, React and Tailwind CSS v4, with
four pages and a mock API you replace with your own.

```bash
npx create-yugen-ui@latest my-app --template dashboard
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-dashboard

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Overview, Revenue, Customers and Settings. The sidebar becomes a `Drawer` on narrow screens (container queries).
- One date range for the whole app (`DateRangePicker` with presets). Every card and chart reloads when it changes.
- KPI `StatTile`s with the change against the previous period and a sparkline; `LineChart`, stacked and horizontal
  `BarChart`, `DonutChart`. Each chart has a data table view.
- A customer `DataGrid`: sorting, segment and status filters, search from the top bar, pagination and CSV export.
- Loading skeletons, empty and error states driven by `src/api.ts`. Settings has a response time slider and can make
  every response empty or failed.
- Pages load on demand (`React.lazy`); hovering a nav item starts the download. Real URLs (`/revenue`) through the
  History API, with the tab title per page.
- Light, dark and high-contrast themes and three brands, saved in `localStorage` with no flash on reload.
- English text in `src/content/`; Vietnamese with `npx create-yugen-ui@latest my-app --template dashboard --lang vi`.
  Built-in component strings follow through `messagesEn` and `locale` on `YugenProvider`.

## Connect your data

`src/api.ts` generates about 18 months of orders in the browser and answers after a short delay. Keep the
`DashboardApi` interface and return an object that calls your backend:

```ts
const api: DashboardApi = {
  getKpis: (range, signal) => fetch(`/api/kpis?${query(range)}`, { signal }).then((r) => r.json()),
  // getTimeseries, getBreakdown, getRecentOrders, getCustomers
};
```

Create it in `src/Dashboard.tsx` instead of `createMockApi`, and delete the mock API card in `src/pages/Settings.tsx`.
`useQuery` (`src/useQuery.ts`) cancels stale requests; swap it for TanStack Query or SWR if you need caching.

## Deploy

`npm run build`, then put `dist/` on any static host. Pages are real paths, so let the host serve `index.html` for
unknown paths (Netlify `_redirects`, Vercel rewrites, or a copy of `index.html` as `404.html` on GitHub Pages).

## Size

`npm run build` with yugen-ui 0.10, gzip: about 217 kB of JavaScript on first load (React 68 kB, other libraries
138 kB, app 10 kB) and 22 kB of CSS. Opening a page adds 1 to 4 kB.

## Structure

```
src/
  App.tsx          # YugenProvider, saved theme, router
  Dashboard.tsx    # shell: sidebar, top bar, date range, lazy pages
  pages/           # Overview, Revenue, Customers, Settings
  api.ts           # mock data layer (replace with your backend)
  ui.tsx           # data cards, KPI tiles, number and date formats
  router.tsx       # History API router, Link
  content/         # all text, one file per language
  useQuery.ts · dates.ts · csv.ts · context.ts
```

Files in `src/` are generated from `src/docs/template-library/dashboard` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
