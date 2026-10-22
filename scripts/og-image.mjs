#!/usr/bin/env node
/**
 * Sinh ảnh xem trước khi chia sẻ link (Open Graph / Twitter card) 1200×630 → public/og.jpg bằng Chromium của Playwright.
 * Chạy lại khi đổi logo hoặc khẩu hiệu:
 *
 *   node scripts/og-image.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = fs.readFileSync(path.join(root, "public/favicon.svg"), "utf8");

const chips = ["Design tokens", "Accessible · WCAG 2.1 AA", "Light · Dark · High contrast", "RTL", "shadcn CLI"];

const html = `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; padding: 72px 80px;
    font-family: "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif; color: #1f1a1d;
    background: radial-gradient(circle at 88% 12%, #fbd3e4 0, transparent 46%),
                radial-gradient(circle at 8% 100%, #ead7f5 0, transparent 50%), #fff8fb;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 24px; }
  .brand svg { width: 104px; height: 104px; }
  h1 { font-size: 96px; font-weight: 650; letter-spacing: -0.02em; line-height: 1; }
  p { font-size: 40px; line-height: 1.25; max-width: 980px; color: #3b2f35; }
  p b { background: linear-gradient(90deg, #a855c9, #c2347a, #f472a8); -webkit-background-clip: text; color: transparent; }
  .chips { display: flex; flex-wrap: wrap; gap: 12px; }
  .chips span { padding: 10px 20px; border-radius: 999px; border: 2px solid #f2c4d9; background: #fff; font-size: 24px; color: #5b4651; }
  .url { font-size: 24px; color: #8a7480; }
</style></head><body>
  <div class="brand">${logo}<h1>Yugen UI</h1></div>
  <p>React components for <b>Tailwind CSS v4</b>.</p>
  <div class="chips">${chips.map((c) => `<span>${c}</span>`).join("")}</div>
  <div class="url">trandat1114.github.io/Yugen-UI</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: path.join(root, "public/og.jpg"), type: "jpeg", quality: 88 });
await browser.close();
console.log("og-image: public/og.jpg (1200×630)");
