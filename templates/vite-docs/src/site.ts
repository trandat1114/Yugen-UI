/**
 * Deploy settings, read by the app and by the SEO plugin in vite.config.ts. The site name, description and language are
 * in content/<lang>.ts.
 */
export const SITE = {
  /** Origin once deployed, with no trailing slash and without the base (BASE=/repo/): canonical URLs and sitemap.xml. */
  url: "https://example.com",
};
