# Sakura Goods

A small shop from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS v4. Tea,
ceramics and stationery, from the product grid to the order confirmation, with no back end.

```bash
npx create-yugen-ui@latest my-app --template store
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-store

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Product grid (`/`): category (`TagPicker`), price range (`Slider`) and sort (`Select`), all kept in the
  URL (`?category=tea&min=10&max=40&sort=price-asc`), so Back, Forward and shared links bring the same view back.
  An empty state offers to clear the filters.
- Product page (`/products/<id>`): a `Carousel` gallery with thumbnails, the rating, colours in a
  `SwatchPicker`, sizes, quantity in a `SpinButton`, Add to cart with a toast, and Buy now.
- Cart in a `Sheet`: a side panel on wide screens, a bottom sheet on phones. Change quantities, remove with Undo,
  see the subtotal. Saved in `localStorage` and shared between tabs.
- Checkout (`/checkout`): a `Wizard` with address, shipping, payment and review. Each step is checked with
  react-hook-form and zod before the next one (`src/validation.ts`).
- Order confirmation (`/orders/<id>`), read back from `sessionStorage`.
- Prices with `Intl.NumberFormat` in the app's locale: US dollars in English, dong in Vietnamese.
- Pages load on demand (`React.lazy`), with real URLs and the tab title per page. Light, dark and high-contrast
  themes, saved with no flash on reload. English text in `src/content/`; Vietnamese with
  `npx create-yugen-ui@latest my-app --template store --lang vi`.

## Demo data and payment

The products in `src/products.ts` are drawn in SVG by `src/ProductArt.tsx`, so the template has no photos; use
`<img>` when you have yours. Prices are US dollars, and `src/money.ts` converts them with one fixed rate; keep
a price per currency on your back end instead.

The payment step is pretend: nothing is charged and no card number leaves the page. `4242 4242 4242 4242` goes
through, `4000 0000 0000 0002` is declined. To take real payments, send the order to your server in `place()`
in `src/pages/CheckoutPage.tsx` and use your payment provider's own card fields instead of these inputs.

The first visit starts with two items in the cart so checkout can be tried right away: set `DEMO_CART` to `[]` in
`src/cart.ts` for a real shop.

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
  App.tsx            # YugenProvider, saved appearance, cart, orders, router
  Layout.tsx         # header with categories and the cart button, lazy pages, page titles
  pages/             # Shop, Product, Checkout, Order, NotFound
  CartSheet.tsx      # the cart, loaded the first time it opens
  ProductArt.tsx     # SVG drawings of the products
  products.ts        # catalog: prices, colours, sizes, ratings; shipping options
  filters.ts         # filters ⇄ query string, filtering and sorting
  cart.ts            # cart state in localStorage
  orders.ts          # orders in sessionStorage
  money.ts           # currency, fixed rate, Intl formats
  validation.ts      # zod schemas per checkout step and the resolver
  router.tsx         # History API router and Link
  content/           # every string, one file per language
```

Files in `src/` are generated from `src/docs/template-library/store` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
