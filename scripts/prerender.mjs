#!/usr/bin/env node
/**
 * Prerender docs (bước cuối của `npm run build:docs`, sau `vite build` và `vite build --ssr src/entry-server.tsx`):
 *   dist-docs/index.html                  trang chủ
 *   dist-docs/components/button.html      mọi route khác — GitHub Pages phục vụ /components/button từ file này
 *   dist-docs/404.html                    khung trống (noindex): đường dẫn lạ, React tự render theo URL
 *   dist-docs/routes.json                 mọi trang: đường dẫn + nội dung ảnh chia sẻ (og-pages.mjs); build-versioned-docs.mjs
 *                                         dựa vào file này để biết bản docs dùng URL đường dẫn
 *   dist-docs/sitemap.xml                 chỉ bản chính (next/ và vX.Y/ trỏ canonical về bản chính); lastmod theo git
 * Mỗi trang có <title>, description, canonical và og:* riêng. Xong thì xoá dist-ssr/.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// React (external trong bản SSR) chọn bản production theo NODE_ENV lúc chạy.
process.env.NODE_ENV = "production";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist-docs");
const ssr = path.join(root, "dist-ssr");
const template = fs.readFileSync(path.join(out, "index.html"), "utf8");
if (/<html[^>]*data-prerendered/.test(template)) throw new Error("prerender: dist-docs/index.html đã được prerender — chạy lại `vite build` trước.");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Thay đúng một chỗ trong template — template đổi mà quên script này thì build lỗi thay vì ra HTML sai. */
function replaceOnce(html, pattern, value) {
  let count = 0;
  const next = html.replace(pattern, (...m) => {
    count++;
    return typeof value === "function" ? value(...m) : value;
  });
  if (count !== 1) throw new Error(`prerender: index.html cần đúng một chỗ khớp ${pattern} (thấy ${count}).`);
  return next;
}

function page(html, { title, description, canonical, image }, body) {
  const attr = (name) => (_, open) => `${open}${escapeHtml(name)}`;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceOnce(html, /(<meta name="description" content=")[^"]*/, attr(description));
  html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*/, attr(canonical));
  html = replaceOnce(html, /(<meta property="og:title" content=")[^"]*/, attr(title));
  html = replaceOnce(html, /(<meta property="og:description" content=")[^"]*/, attr(description));
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*/, attr(canonical));
  html = replaceOnce(html, /(<meta property="og:image" content=")[^"]*/, attr(image));
  html = replaceOnce(html, /(<meta property="og:image:alt" content=")[^"]*/, attr(title));
  html = replaceOnce(html, /<html lang="vi">/, '<html lang="vi" data-prerendered>');
  return replaceOnce(html, /<div id="root"><\/div>/, () => `<div id="root">${body}</div>`);
}

const { ROUTES, render, sourcesOf } = await import(pathToFileURL(path.join(ssr, "entry-server.js")).href);

const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/");
const mainBuild = !/\/(next|v\d+\.\d+)\/$/.test(base);

/** Ngày commit gần nhất (YYYY-MM-DD) đụng tới các file nguồn của trang; không có git / file → undefined. */
const lastmodCache = new Map();
function lastmod(files) {
  const existing = files.filter((f) => f && fs.existsSync(path.join(root, f)));
  if (existing.length === 0) return undefined;
  const key = existing.join("|");
  if (!lastmodCache.has(key)) {
    let date;
    try {
      date = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...existing], { cwd: root, encoding: "utf8" }).trim() || undefined;
    } catch {
      date = undefined;
    }
    lastmodCache.set(key, date);
  }
  return lastmodCache.get(key);
}

const started = Date.now();
const entries = [];
const sitemap = [];
const streamed = [];
for (const route of ROUTES) {
  const { path: routePath, html, head, card } = await render(route);
  if (mainBuild) sitemap.push({ loc: head.canonical, lastmod: lastmod(sourcesOf(route)) });
  // Suspense còn treo lúc render → React đặt nội dung ở cuối trang, cần script mới hiện đúng chỗ (crawler không chạy JS thấy lệch).
  if (html.includes('<template id="B:')) streamed.push(routePath || "/");
  const file = path.join(out, routePath === "" ? "index.html" : `${routePath}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(template, head, html));
  entries.push({ path: routePath, ...card });
}

// 404: khung trống như trước khi có prerender, không cho index.
const notFound = replaceOnce(template, /<meta name="viewport"[^>]*>/, (m) => `${m}\n    <meta name="robots" content="noindex" />`);
fs.writeFileSync(path.join(out, "404.html"), notFound);
fs.writeFileSync(path.join(out, "routes.json"), JSON.stringify(entries, null, 2) + "\n");
if (mainBuild) {
  const urls = sitemap.map(({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`);
  fs.writeFileSync(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
  );
}
fs.rmSync(ssr, { recursive: true, force: true });

console.log(`prerender: ${entries.length} trang trong ${((Date.now() - started) / 1000).toFixed(1)} s${mainBuild ? ", sitemap.xml" : ""}`);
if (streamed.length > 0) console.warn(`prerender: ${streamed.length} trang còn Suspense treo (nội dung ghi cuối trang): ${streamed.join(", ")}`);
