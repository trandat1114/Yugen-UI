import fs from "node:fs";
import path from "node:path";
import { createElement, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createServer, defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// The language in use is the file content/index.ts points to (`create --lang` keeps only one language).
import content from "./content/index.ts";
import { headTags } from "./seo.ts";
import { SITE } from "./site.ts";

/**
 * Static HTML for search engines, link previews and a fast first paint, from the content of the language in use:
 * - <head>: replaces the <!-- seo --> … <!-- /seo --> block of index.html with the title, description, canonical, Open
 *   Graph and JSON-LD (the product and its plans). Also in dev.
 * - <body>: after the build, renders App to HTML into <div id="root"> (the first screen and the footer; the sections
 *   below load in the browser). main.tsx hydrates it, so the page shows before any JavaScript runs.
 */
function landingSeo(): Plugin {
  let base = "/";
  let root = process.cwd();
  let outDir = "dist";
  let build = false;
  return {
    name: "landing-seo",
    configResolved(config) {
      base = config.base;
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
      build = config.command === "build";
    },
    transformIndexHtml(html) {
      return html.replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, `<!-- seo -->\n    ${headTags(content, `${SITE.url}${base}`)}\n    <!-- /seo -->`);
    },
    async closeBundle() {
      if (!build) return;
      // A short-lived dev server only to load App.tsx in Node (dependencies come from node_modules as they are).
      const server = await createServer({
        root,
        base,
        configFile: false,
        logLevel: "error",
        appType: "custom",
        server: { middlewareMode: true, hmr: false, ws: false },
        plugins: [react()],
      });
      try {
        const { default: App } = await server.ssrLoadModule("/src/App.tsx");
        const body = renderToString(createElement(StrictMode, null, createElement(App)));
        const file = path.join(outDir, "index.html");
        fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace('<div id="root"></div>', () => `<div id="root">${body}</div>`));
      } finally {
        await server.close();
      }
      if (SITE.url.includes("example.com")) console.warn("\n⚠ landing-seo: set SITE.url in src/site.ts to your domain before you deploy.\n");
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), landingSeo()],
  build: {
    rolldownOptions: {
      output: {
        // React (needed by every page) gets its own chunk so browsers keep it cached when the app code changes. No single
        // "vendor" chunk: yugen-ui is built per component, and Rolldown splits it by what each chunk uses.
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
