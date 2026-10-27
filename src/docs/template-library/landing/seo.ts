import type { Content } from "./content/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** schema.org SoftwareApplication of the product, with one Offer per plan (the monthly price). */
export function structuredData(t: Content, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t.product.name,
    description: t.product.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url,
    inLanguage: t.lang,
    offers: t.pricing.plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      price: plan.price.monthly,
      priceCurrency: t.currency,
      url: `${url}#pricing`,
    })),
  };
}

/**
 * Tags for <head>, written into the built index.html by the plugin in vite.config.ts: search engines and link previews
 * read them without running JavaScript. `url` is the page's absolute URL (SITE.url + base path).
 */
export function headTags(t: Content, url: string) {
  return [
    `<title>${esc(t.product.title)}</title>`,
    `<meta name="description" content="${esc(t.product.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(t.product.name)}" />`,
    `<meta property="og:title" content="${esc(t.product.title)}" />`,
    `<meta property="og:description" content="${esc(t.product.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:locale" content="${t.locale.replace("-", "_")}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<script type="application/ld+json">${JSON.stringify(structuredData(t, url)).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
}
