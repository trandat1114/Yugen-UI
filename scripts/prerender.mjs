#!/usr/bin/env node
/**
 * Prerender docs (bước cuối của `npm run build:docs`, sau `vite build` và `vite build --ssr src/entry-server.tsx`):
 *   dist-docs/index.html                  trang chủ
 *   dist-docs/components/button.html      mọi route khác — GitHub Pages phục vụ /components/button từ file này
 *   dist-docs/vi/…                        cùng các trang đó bằng tiếng Việt (/vi/, /vi/components/button); tiếng Anh ở
 *                                         gốc (#277)
 *   dist-docs/en/…                        trang chuyển hướng cho URL /en/… của docs ≤ 0.13 (noindex, canonical về URL mới)
 *   dist-docs/404.html                    khung trống (noindex): đường dẫn lạ, React tự render theo URL
 *   dist-docs/routes.json                 mọi trang: đường dẫn + nội dung ảnh chia sẻ (og-pages.mjs); build-versioned-docs.mjs
 *                                         dựa vào file này để biết bản docs dùng URL đường dẫn
 *   dist-docs/sitemap.xml                 chỉ bản chính (next/ và vX.Y/ trỏ canonical về bản chính); lastmod theo git,
 *                                         kèm hreflang en / vi / x-default
 * Mỗi trang có <title>, description, canonical, hreflang và og:* riêng. Xong thì xoá dist-ssr/.
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

const { ROUTES, SITE, render, sourcesOf, DEFAULT_LOCALE, PREFIXED_LOCALE, LEGACY_PREFIX, pathOf, hrefOf } = await import(
  pathToFileURL(path.join(ssr, "entry-server.js")).href
);

function page(html, lang, { title, description, canonical, alternates, image }, body) {
  const attr = (name) => (_, open) => `${open}${escapeHtml(name)}`;
  const links = alternates.map((a) => `\n    <link rel="alternate" hreflang="${a.hreflang}" href="${escapeHtml(a.href)}" />`).join("");
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceOnce(html, /(<meta name="description" content=")[^"]*/, attr(description));
  html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*(" \/>)/, (_, open, close) => `${open}${escapeHtml(canonical)}${close}${links}`);
  html = replaceOnce(html, /(<meta property="og:title" content=")[^"]*/, attr(title));
  html = replaceOnce(html, /(<meta property="og:description" content=")[^"]*/, attr(description));
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*/, attr(canonical));
  html = replaceOnce(html, /(<meta property="og:image" content=")[^"]*/, attr(SITE.url + image));
  html = replaceOnce(html, /(<meta property="og:image:alt" content=")[^"]*/, attr(title));
  html = replaceOnce(html, /<html lang="en">/, `<html lang="${lang}" data-prerendered>`);
  return replaceOnce(html, /<div id="root"><\/div>/, () => `<div id="root">${body}</div>`);
}

const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/");

/** Trang chuyển hướng cho một URL cũ: canonical tuyệt đối, đích tương đối với site đang build (next/, vX.Y/). */
function legacyRedirect(canonical, target) {
  const href = escapeHtml(target);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta http-equiv="refresh" content="0; url=${href}" />
    <title>Yugen UI</title>
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script>
  </head>
  <body>
    <p>This page moved to <a href="${href}">${href}</a>.</p>
  </body>
</html>
`;
}
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
  for (const lang of [DEFAULT_LOCALE, PREFIXED_LOCALE]) {
    const { path: routePath, html, head, card } = await render(route, lang);
    // Bản tiếng Anh của trang chưa dịch trỏ canonical về bản tiếng Việt: không đưa vào sitemap.
    if (mainBuild && head.canonical === SITE.url + routePath) {
      sitemap.push({ loc: head.canonical, alternates: head.alternates, lastmod: lastmod(sourcesOf(route)) });
    }
    // Suspense còn treo lúc render → React đặt nội dung ở cuối trang, cần script mới hiện đúng chỗ (crawler không chạy JS thấy lệch).
    if (html.includes('<template id="B:')) streamed.push(routePath || "/");
    const file = path.join(out, routePath === "" || routePath.endsWith("/") ? `${routePath}index.html` : `${routePath}.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, page(template, lang, head, html));
    entries.push({ path: routePath, lang, image: head.image, ...card });
  }
}

// URL /en/… của docs ≤ 0.13 (link, bookmark, kết quả tìm kiếm): GitHub Pages không chuyển hướng phía server, nên mỗi
// trang có một file nhỏ chuyển sang URL mới (giữ ?query và #mục), noindex, canonical về URL mới (#277).
for (const route of ROUTES) {
  const target = hrefOf(route, "en");
  const legacyPath = pathOf(route) ? `${LEGACY_PREFIX}/${pathOf(route)}.html` : `${LEGACY_PREFIX}/index.html`;
  const file = path.join(out, legacyPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, legacyRedirect(SITE.url + target.slice(base.length), target));
}

// 404: khung trống như trước khi có prerender, không cho index.
const notFound = replaceOnce(template, /<meta name="viewport"[^>]*>/, (m) => `${m}\n    <meta name="robots" content="noindex" />`);
fs.writeFileSync(path.join(out, "404.html"), notFound);
fs.writeFileSync(path.join(out, "routes.json"), JSON.stringify(entries, null, 2) + "\n");
if (mainBuild) {
  const urls = sitemap.map(({ loc, alternates, lastmod }) =>
    [
      `  <url>`,
      `    <loc>${escapeHtml(loc)}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      ...alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${escapeHtml(a.href)}" />`),
      `  </url>`,
    ].join("\n"),
  );
  fs.writeFileSync(
    path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
  );
}
fs.rmSync(ssr, { recursive: true, force: true });

console.log(`prerender: ${entries.length} trang trong ${((Date.now() - started) / 1000).toFixed(1)} s${mainBuild ? ", sitemap.xml" : ""}`);
if (streamed.length > 0) console.warn(`prerender: ${streamed.length} trang còn Suspense treo (nội dung ghi cuối trang): ${streamed.join(", ")}`);
