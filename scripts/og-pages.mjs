#!/usr/bin/env node
/**
 * Ảnh chia sẻ link (Open Graph) 1200×630 cho từng trang docs → dist-docs/og/<đường dẫn>.jpg, bằng Chromium của Playwright.
 * Chạy sau `npm run build:docs` (đọc dist-docs/routes.json do scripts/prerender.mjs ghi); pages.yml chạy bước này trước khi
 * deploy. Trang chủ giữ public/og.jpg (scripts/og-image.mjs).
 *
 *   node scripts/og-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist-docs");
const routesFile = path.join(out, "routes.json");
if (!fs.existsSync(routesFile)) throw new Error("og-pages: chưa có dist-docs/routes.json — chạy `npm run build:docs` trước.");

const pages = JSON.parse(fs.readFileSync(routesFile, "utf8")).filter((p) => p.path !== "");
const logo = fs.readFileSync(path.join(root, "public/favicon.svg"), "utf8");

// Font tải từ Google Fonts để ảnh giống nhau trên máy local và runner Linux (không có Segoe UI); lỗi mạng → font hệ thống.
const shell = `<!doctype html>
<html><head><meta charset="utf-8" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=block" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; padding: 64px 80px;
    font-family: Inter, "Segoe UI", system-ui, sans-serif; color: #1f1a1d;
    background: radial-gradient(circle at 90% 8%, #fbd3e4 0, transparent 44%),
                radial-gradient(circle at 6% 100%, #ead7f5 0, transparent 48%), #fff8fb;
    display: flex; flex-direction: column;
  }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 32px; font-weight: 600; }
  .brand svg { width: 56px; height: 56px; }
  main { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
  .section { font-size: 28px; font-weight: 600; color: #c2347a; }
  h1 { font-size: 84px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05;
       display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  p { font-size: 32px; line-height: 1.35; color: #4a3d44; max-width: 1000px;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .url { font-size: 24px; color: #8a7480; }
</style></head><body>
  <div class="brand">${logo}<span>Yugen UI</span></div>
  <main><div class="section" id="section"></div><h1 id="title"></h1><p id="description"></p></main>
  <div class="url" id="url"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(shell, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const started = Date.now();
for (const { path: routePath, section, title, description } of pages) {
  await page.evaluate(
    ({ section, title, description, url }) => {
      document.getElementById("section").textContent = section;
      document.getElementById("title").textContent = title;
      document.getElementById("description").textContent = description;
      document.getElementById("url").textContent = url;
    },
    { section, title, description, url: `trandat1114.github.io/Yugen-UI/${routePath}` },
  );
  const file = path.join(out, "og", `${routePath}.jpg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, type: "jpeg", quality: 85 });
}
await browser.close();
console.log(`og-pages: ${pages.length} ảnh trong ${((Date.now() - started) / 1000).toFixed(1)} s → dist-docs/og/`);
