import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { frontmatterOf, loadDocs, outlineOf, pageMeta, type PageKind } from "./src/docs.ts";
// The language in use is the one content/index.ts points to (`create --lang` keeps one): text and content/<lang>/docs.
import content from "./src/content/index.ts";
import { SITE } from "./src/site.ts";

const DOCS_DIR = path.resolve(import.meta.dirname, "src/content", content.lang, "docs");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Markdown imports with `?raw&meta` get only the front matter (the sidebar), `?raw&outline` the front matter and headings
 * (search). The sidebar of a 200-page site then costs a few kB, and page text loads one page at a time (src/pages.ts).
 */
function docsContent(): Plugin {
  return {
    name: "docs-content",
    enforce: "pre",
    load(id) {
      const [file, query = ""] = id.split("?");
      if (!file.endsWith(".md")) return;
      const params = new URLSearchParams(query);
      const trim = !params.has("raw") ? undefined : params.has("meta") ? frontmatterOf : params.has("outline") ? outlineOf : undefined;
      if (!trim) return;
      this.addWatchFile(file);
      return { code: `export default ${JSON.stringify(trim(fs.readFileSync(file, "utf8")))};`, map: { mappings: "" }, moduleType: "js" };
    },
  };
}

/** SEO tags of a page: replace the <!-- seo --> … <!-- /seo --> block of index.html. */
function headTags(page: PageKind, pagePath: string) {
  const { title, description } = pageMeta(page, content);
  const url = `${SITE.url}${pagePath}`;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    page.kind === "notFound" ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.kind === "page" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${esc(content.site.title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${content.locale.replace("-", "_")}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ];
  if (page.kind === "page") {
    const ld = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.page.title,
      description,
      inLanguage: content.lang,
      isPartOf: { "@type": "WebSite", name: content.site.title, url: `${SITE.url}${pagePath.replace(/[^/]+\/[^/]+\/$/, "")}` },
      mainEntityOfPage: url,
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
  }
  return tags.join("\n    ");
}

/**
 * After the build: an HTML file per page with its own <head> (search engines and link previews read it without running
 * JS), plus sitemap.xml, robots.txt and 404.html. Runs on any static host (GitHub Pages, Netlify, Cloudflare Pages…).
 */
function docsSeo(): Plugin {
  let outDir = "dist";
  let base = "/";
  return {
    name: "docs-seo",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      base = config.base;
    },
    closeBundle() {
      const files: Record<string, string> = {};
      for (const section of fs.readdirSync(DOCS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        for (const file of fs.readdirSync(path.join(DOCS_DIR, section.name)).filter((f) => f.endsWith(".md"))) {
          files[`${section.name}/${file}`] = fs.readFileSync(path.join(DOCS_DIR, section.name, file), "utf8");
        }
      }
      const docs = loadDocs(files);
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const write = (rel: string, text: string) => {
        const file = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, text);
      };
      const html = (page: PageKind, pagePath: string) =>
        template.replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, `<!-- seo -->\n    ${headTags(page, pagePath)}\n    <!-- /seo -->`);

      const pages: { page: PageKind; path: string }[] = [
        { page: { kind: "home" }, path: base },
        ...docs.pages.map((page) => ({ page: { kind: "page", page } as PageKind, path: `${base}${page.section}/${page.slug}/` })),
      ];
      for (const p of pages) write(path.join(p.path.slice(base.length), "index.html"), html(p.page, p.path));
      write("404.html", html({ kind: "notFound" }, base));

      write(
        "sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}${p.path}</loc></url>`).join("\n")}
</urlset>
`,
      );
      write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE.url}${base}sitemap.xml\n`);

      if (SITE.url.includes("example.com")) console.warn("\n⚠ docs-seo: set SITE.url in src/site.ts to your domain before you deploy.\n");
    },
  };
}

export default defineConfig({
  // Deploying to a subfolder (GitHub Pages /<repo>/): BASE=/<repo>/ npm run build
  base: process.env.BASE ?? "/",
  plugins: [docsContent(), react(), tailwindcss(), docsSeo()],
  build: {
    rolldownOptions: {
      output: {
        // React (every page needs it) in its own chunk, so browsers keep it cached when the app code changes. yugen-ui is
        // built per component: letting Rolldown split it means a lazy page only loads its own components.
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
