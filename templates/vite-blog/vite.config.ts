import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadPosts, pageMeta, slugify, type PageKind } from "./src/content";
import { SITE } from "./src/site";

const POSTS_DIR = path.resolve(__dirname, "src/posts");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Thẻ SEO trong <head> của một trang — thay khối <!-- seo --> … <!-- /seo --> của index.html. */
function headTags(page: PageKind, pagePath: string, base: string) {
  const { title, description } = pageMeta(page);
  const url = `${SITE.url}${pagePath}`;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    page.kind === "notFound" ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(SITE.title)}" href="${SITE.url}${base}rss.xml" />`,
    `<meta property="og:type" content="${page.kind === "post" ? "article" : "website"}" />`,
    `<meta property="og:site_name" content="${esc(SITE.title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${SITE.locale.replace("-", "_")}" />`,
    `<meta name="twitter:card" content="summary" />`,
  ];
  if (page.kind === "post") {
    const { post } = page;
    tags.push(`<meta property="article:published_time" content="${post.date}" />`);
    for (const tag of post.tags) tags.push(`<meta property="article:tag" content="${esc(tag)}" />`);
    const ld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      datePublished: post.date,
      author: { "@type": "Person", name: post.author ?? SITE.author },
      inLanguage: SITE.lang,
      mainEntityOfPage: url,
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`);
  }
  return tags.join("\n    ");
}

/**
 * Sau khi build: mỗi bài / thẻ một file HTML có <head> riêng (công cụ tìm kiếm và bản xem trước khi chia sẻ link đọc được
 * ngay, không cần chạy JS), cộng sitemap.xml, rss.xml, robots.txt và 404.html. Host tĩnh nào cũng chạy (GitHub Pages, Netlify…).
 */
function blogSeo(): Plugin {
  let outDir = "dist";
  let base = "/";
  return {
    name: "blog-seo",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      base = config.base;
    },
    closeBundle() {
      const files = Object.fromEntries(
        fs
          .readdirSync(POSTS_DIR)
          .filter((f) => f.endsWith(".md"))
          .map((f) => [f, fs.readFileSync(path.join(POSTS_DIR, f), "utf8")]),
      );
      const posts = loadPosts(files);
      const tags = [...new Set(posts.flatMap((p) => p.tags))];
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const write = (rel: string, content: string) => {
        const file = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
      };
      const html = (page: PageKind, pagePath: string) =>
        template.replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, `<!-- seo -->\n    ${headTags(page, pagePath, base)}\n    <!-- /seo -->`);

      const pages: { page: PageKind; path: string; lastmod?: string }[] = [
        { page: { kind: "home" }, path: base, lastmod: posts[0]?.date },
        ...posts.map((post) => ({ page: { kind: "post", post } as PageKind, path: `${base}posts/${post.slug}/`, lastmod: post.date })),
        ...tags.map((tag) => ({ page: { kind: "tag", tag } as PageKind, path: `${base}tags/${slugify(tag)}/` })),
      ];
      for (const p of pages) write(path.join(p.path.slice(base.length), "index.html"), html(p.page, p.path));
      write("404.html", html({ kind: "notFound" }, base));

      write(
        "sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE.url}${p.path}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`,
      );
      write(
        "rss.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.title)}</title>
    <link>${SITE.url}${base}</link>
    <description>${esc(SITE.description)}</description>
    <language>${SITE.lang}</language>
    <atom:link href="${SITE.url}${base}rss.xml" rel="self" type="application/rss+xml" />
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}${base}posts/${p.slug}/</link>
      <guid>${SITE.url}${base}posts/${p.slug}/</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`,
      );
      write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE.url}${base}sitemap.xml\n`);

      if (SITE.url.includes("example.com")) console.warn("\n⚠ blog-seo: đổi SITE.url trong src/site.ts thành domain thật trước khi triển khai.\n");
    },
  };
}

export default defineConfig({
  // Triển khai ở thư mục con (GitHub Pages /<repo>/): BASE=/<repo>/ npm run build
  base: process.env.BASE ?? "/",
  plugins: [react(), tailwindcss(), blogSeo()],
  build: {
    rollupOptions: {
      output: {
        // Tách thư viện khỏi mã ứng dụng: sửa bài chỉ làm đổi chunk nhỏ, phần còn lại trình duyệt giữ cache.
        // Icon Fluent để chung vendor: tách riêng tạo vòng import vendor ↔ icons (lỗi TDZ lúc chạy).
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
});
