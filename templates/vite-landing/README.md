# Sakura Notes

A product landing page from [Yugen UI](https://trandat1114.github.io/Yugen-UI/#/templates): Vite, React and Tailwind CSS
v4. One fast page for a made-up notes app, ready for your own product.

```bash
npx create-yugen-ui@latest my-app --template landing
cd my-app
npm run dev
```

Try it without installing anything on StackBlitz: https://stackblitz.com/github/trandat1114/Yugen-UI/tree/main/templates/vite-landing

Check your setup any time: `npx @yugen-ui/cli doctor` (see https://trandat1114.github.io/Yugen-UI/#/concepts/cli).

## What's included

- Hero with two calls to action, a product picture drawn in HTML (no image to download), a row of customer logos.
- Feature grid, pricing with a monthly / yearly switch, testimonials, FAQ (`Accordion`), sign-up section and footer.
- A sign-up form with Yugen `Field` components and a small validation function (no form library): messages after the
  first submit, focus on the first field to fix, a loading button and a success `toast`.
- **SEO at build time** (the `landingSeo` plugin in `vite.config.ts`): `<title>`, `description`, canonical, Open
  Graph and `SoftwareApplication` JSON-LD with one offer per plan, written into `index.html` from `src/content/`.
- **Static first screen**: the same plugin renders the header, hero and footer into `index.html`, so the page shows
  before any JavaScript runs. React loads after that first paint and attaches to the HTML (`src/main.tsx`); the
  sections below and the theme menu load next, one section per frame.
- Built for Lighthouse 95+ on mobile in all four categories (checked in this repo's CI): no web fonts, no images to
  wait for, no layout shift.
- Light, dark and high-contrast themes, saved in `localStorage` with no flash on reload.
- English text; Vietnamese (with prices in VND) with `npx create-yugen-ui@latest my-app --template landing --lang vi`.

## Make it yours

1. Text, plans and prices: `src/content/<lang>.ts`. The SEO tags and the JSON-LD offers follow them.
2. Your domain: `url` in `src/site.ts` (the build warns while it is still `example.com`).
3. The form: replace `submitSignUp` in `src/signUp.ts` with a call to your backend or form service.
4. The picture: swap `<ProductShot />` for a screenshot, an `<img>` with `width` and `height` so nothing moves while
   it loads.
5. The first screen is rendered at build time, so it must not depend on the visitor (saved theme, date, `window`):
   React would find different HTML when it attaches. Read those in an effect, or put that part below the fold.

## Deploy

`npm run build` and upload `dist/` to any static host. Under a sub-path (GitHub Pages project site):
`npm run build -- --base=/my-repo/`.

## Structure

```
src/
  main.tsx · start.tsx   # paint the static HTML first, then load React and attach it
  App.tsx                # YugenProvider, saved theme
  LandingPage.tsx        # header, hero, footer; loads BelowTheFold and ThemeMenu after the first paint
  BelowTheFold.tsx       # Features · Pricing · Testimonials · Faq · SignUpSection, one per frame
  ProductShot.tsx        # the product picture in HTML
  Logos.tsx              # product mark and customer wordmarks (SVG)
  signUp.ts              # validateSignUp and submitSignUp
  seo.ts                 # head tags and JSON-LD, used by vite.config.ts
  site.ts                # your domain (SITE.url)
  content/               # every string and the plans, one file per language
vite.config.ts           # landingSeo plugin: head tags and the static first screen
```

Files in `src/` are generated from `src/docs/template-library/landing` (and `src/docs/block-library`) by `scripts/sync-templates.mjs`.
