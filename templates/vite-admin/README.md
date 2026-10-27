# Sakura Admin

An admin app from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4.
Customers and their orders, the screens most back offices start with, on a mock API you replace with your own.

```bash
npx create-yugen-ui@latest my-app --template admin
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-admin

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Customers (`/customers`): a `DataGrid` paged, sorted and filtered by the server (one page plus the total per
  request), search, status and plan filters, a column picker (`DataGridColumnPicker`), and row selection with bulk
  export to CSV and bulk delete.
- Create and edit in a `Drawer`, validated with react-hook-form and zod (`src/validation.ts`); delete after a
  confirm `Dialog`.
- Optimistic updates (`useOptimisticList`): changes show at once, a toast confirms them, and a failed request puts
  the list back as it was, with a Retry button.
- Customer page (`/customers/<id>`) with the details and the customer's orders; Orders (`/orders`), read-only.
- Sign in, forgot password and a one-time code step (`InputOTP`). Pages other than these need a session: without
  one you land on the sign-in page and come back to the page you asked for.
- Settings: theme, brand, the mock API's response time and a switch for random errors.
- Pages load on demand (`React.lazy`), with real URLs and the tab title per page. Light, dark and high-contrast
  themes, saved with no flash on reload. English text in `src/content/`; Vietnamese with
  `npx create-yugen-ui@latest my-app --template admin --lang vi`.

## Demo account

The first visit in a tab starts signed in, so the app opens on its data. Sign out (avatar menu or Settings) to try
the sign-in flow with `admin@sakura.dev` / `sakura-admin` and the code `246810`. The session lives in
`sessionStorage`. To turn off the automatic sign-in, set `DEMO_AUTO_SIGN_IN` to `false` in `src/auth.tsx`.

## Connect your back end

`src/api.ts` generates 120 customers and their orders in the browser and answers after a short delay; with random
errors on, about one save or delete in five fails. Keep the `AdminApi` interface and return an object that calls
your server:

```ts
const api: AdminApi = {
  listCustomers: (query, signal) => fetch(`/api/customers?${toParams(query)}`, { signal }).then((r) => r.json()),
  updateCustomer: (id, input) => fetch(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(input) }).then((r) => r.json()),
  // getCustomer, createCustomer, deleteCustomers, listOrders, signIn, verifyCode, requestPasswordReset
};
```

Create it in `src/App.tsx` instead of `createMockApi`, then delete the mock API card in
`src/pages/SettingsPage.tsx` and the demo account notes on the sign-in pages. List calls take a page, a page size,
a sort and the filters, and return `{ rows, total }`. Reject with an error when a request fails: the optimistic
update rolls back on its own.

Validation uses a small zod resolver in `src/validation.ts` instead of `@hookform/resolvers`, whose optional
peer dependencies make `npm install` fail on npm 11. You can switch to it once that is fixed.

## Deploy

`npm run build` and upload `dist/` to a static host. Pages are real paths, so a deep link such as `/settings` must
get the app back from the host:

- **Netlify**: nothing to do, `public/_redirects` sends unknown paths to `index.html`.
- **Vercel**: nothing to do, `vercel.json` has the same rewrite.
- **Cloudflare Pages**: nothing to do, it serves the app for unknown paths when there is no `404.html`.
- **GitHub Pages**: `npm run build:gh-pages` also writes `dist/404.html`, which GitHub Pages serves for unknown
  paths. For a project site, add the repository name: `npm run build:gh-pages -- --base=/my-repo/`.

Under a sub-path on another host, build with `npm run build -- --base=/my-app/`.

## Structure

```
src/
  App.tsx              # YugenProvider, saved appearance, mock API, session, router
  Layout.tsx           # top bar, sidebar, sign-in redirect, lazy pages
  pages/               # Customers, Customer, Orders, Settings, SignIn, Verify, ForgotPassword, NotFound
  CustomerDrawer.tsx   # create / edit drawer and the delete dialog
  CustomerForm.tsx     # the form (react-hook-form + zod), loaded when a drawer opens
  OrderList.tsx        # paged orders, for /orders and the customer page
  api.ts               # mock back end (replace with yours)
  auth.tsx             # session in sessionStorage, demo sign-in
  validation.ts        # zod schemas and the resolver
  router.tsx           # History API router, Link, next= after sign-in
  content/             # every string, one file per language
  ui.tsx · useQuery.ts · csv.ts · context.ts · appearance.ts
```

Files in `src/` are generated from `src/docs/template-library/admin` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
