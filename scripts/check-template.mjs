#!/usr/bin/env node
/**
 * Kiểm tra một template ĐÃ BUILD (CI job "Templates", #145):
 *   1. Dung lượng gzip của lần tải đầu (JS trong <script type=module> + modulepreload, CSS) so với `budget` của template
 *      trong templates/templates.json (kB gzip, khai báo trong scripts/sync-templates.mjs).
 *   2. Smoke test: `vite preview`, đi qua mọi link nội bộ từ trang đầu (tối đa MAX_PAGES), mỗi trang phải render,
 *      không có console.error / lỗi trang và không có vi phạm axe WCAG 2.1 A/AA.
 *
 *   node scripts/check-template.mjs <thư mục app đã build> --template vite-saas [--no-smoke]
 *
 * App Next.js (có .next/, #153): chạy `next start` thay cho `vite preview`, dung lượng đo qua HTTP từ HTML của trang đầu.
 *
 * Kết quả ghi thêm vào $GITHUB_STEP_SUMMARY khi chạy trong GitHub Actions.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const appDir = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const name = args[args.indexOf("--template") + 1] ?? path.basename(appDir);
const smoke = !args.includes("--no-smoke");
const PORT = 4173;
const MAX_PAGES = 20;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const failures = [];
const isNext = fs.existsSync(path.join(appDir, ".next"));
const dist = path.join(appDir, "dist");
const html = isNext ? "" : fs.readFileSync(path.join(dist, "index.html"), "utf8");
const kb = (bytes) => bytes / 1000;
const gzip = (file) => zlib.gzipSync(fs.readFileSync(path.join(dist, file))).length;
const attr = (re) => [...html.matchAll(re)].map((m) => m[1].replace(/^\//, "").replace(/^\.\//, ""));

// ---------- 1. Dung lượng ----------
const meta = JSON.parse(fs.readFileSync(path.join(root, "templates/templates.json"), "utf8")).find((t) => t.dir === name);
const budget = meta?.budget;
let sizes = null;

function checkBudget(measured) {
  sizes = measured;
  if (!budget) failures.push(`${name}: thiếu "budget" trong templates/templates.json (scripts/sync-templates.mjs)`);
  else {
    if (sizes.js > budget.js) failures.push(`JS lần tải đầu ${sizes.js.toFixed(1)} kB > budget ${budget.js} kB`);
    if (sizes.css > budget.css) failures.push(`CSS ${sizes.css.toFixed(1)} kB > budget ${budget.css} kB`);
  }
  const total = sizes.totalJs === undefined ? "" : `, JS tổng ${sizes.totalJs.toFixed(1)} kB`;
  console.log(
    `${name}: JS đầu ${sizes.js.toFixed(1)} kB (budget ${budget?.js ?? "?"}), CSS ${sizes.css.toFixed(1)} kB (budget ${budget?.css ?? "?"})${total} — gzip`,
  );
}

if (!isNext) {
  const initialJs = new Set([
    ...attr(/<script[^>]*type="module"[^>]*src="([^"]+)"/g),
    ...attr(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g),
  ]);
  const css = attr(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"/g);
  const allJs = fs
    .readdirSync(path.join(dist, "assets"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => `assets/${f}`);
  checkBudget({
    js: kb([...initialJs].reduce((s, f) => s + gzip(f), 0)),
    css: kb(css.reduce((s, f) => s + gzip(f), 0)),
    totalJs: kb(allJs.reduce((s, f) => s + gzip(f), 0)),
  });
}

/** Next.js: script và CSS mà HTML của trang đầu tải, đo gzip qua HTTP. */
async function measureNext(origin) {
  const page = await (await fetch(origin + "/")).text();
  const urls = (re) => [...new Set([...page.matchAll(re)].map((m) => m[1]))];
  const size = async (list) =>
    (await Promise.all(list.map(async (u) => zlib.gzipSync(Buffer.from(await (await fetch(new URL(u, origin))).arrayBuffer())).length))).reduce(
      (a, b) => a + b,
      0,
    );
  checkBudget({
    js: kb(await size(urls(/<script[^>]*src="([^"]+\.js)"/g))),
    css: kb(await size(urls(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"/g))),
  });
}

// ---------- 2. Smoke test ----------
const pages = [];
if (smoke) {
  const origin = `http://127.0.0.1:${PORT}`;
  // Cổng đã có server khác (preview cũ chưa tắt) → smoke sẽ kiểm tra nhầm app.
  const busy = await fetch(origin).then(
    () => true,
    () => false,
  );
  if (busy) {
    console.error(`✖ Cổng ${PORT} đang bận — tắt server đang chạy rồi thử lại.`);
    process.exit(1);
  }
  const command = isNext
    ? [path.join(appDir, "node_modules/next/dist/bin/next"), "start", "-p", String(PORT), "-H", "127.0.0.1"]
    : [path.join(appDir, "node_modules/vite/bin/vite.js"), "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"];
  const server = spawn(process.execPath, command, { cwd: appDir, stdio: "ignore" });
  try {
    for (let i = 0; ; i++) {
      try {
        if ((await fetch(origin)).ok) break;
      } catch {
        /* server chưa lên */
      }
      if (i > 60) throw new Error(`${isNext ? "next start" : "vite preview"} không lên sau 30 s`);
      await new Promise((r) => setTimeout(r, 500));
    }
    if (isNext) await measureNext(origin);
    const { chromium } = await import("@playwright/test");
    const { AxeBuilder } = await import("@axe-core/playwright");
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    let errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));

    const queue = ["/"];
    const seen = new Set(queue);
    while (queue.length > 0 && pages.length < MAX_PAGES) {
      const url = queue.shift();
      errors = [];
      // Route kiểu hash ("/#/calendar") đi thẳng từ trang trước chỉ đổi hash: networkidle xong ngay, axe chạy khi trang
      // lazy chưa render. Qua about:blank để mỗi URL được tải lại từ đầu, như người mở link trực tiếp.
      await page.goto("about:blank");
      await page.goto(origin + url, { waitUntil: "networkidle" });
      const rendered = await page.locator(isNext ? "body > *" : "#root > *").count();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      const problems = [
        ...(rendered ? [] : [isNext ? "<body> trống" : "#root trống"]),
        ...errors.map((e) => `console: ${e}`),
        ...violations.map((v) => `axe ${v.id} (${v.nodes.length}): ${v.help}`),
      ];
      pages.push({ url, problems });
      for (const p of problems) failures.push(`${url} — ${p}`);

      const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
      for (const href of links) {
        const u = new URL(href, origin + url);
        if (u.origin !== origin || /\.\w+$/.test(u.pathname.replace(/\/$/, ""))) continue;
        const key = u.pathname + u.hash.replace(/^#(?!\/).*/, "");
        if (!seen.has(key)) {
          seen.add(key);
          queue.push(key);
        }
      }
    }
    await browser.close();
  } catch (error) {
    failures.push(`smoke: ${error.message}`);
  } finally {
    server.kill();
  }
  console.log(`${name}: ${pages.length} trang — ${pages.map((p) => p.url).join(", ")}`);
}

// ---------- Kết quả ----------
if (process.env.GITHUB_STEP_SUMMARY) {
  // Next.js không có số "All JS" (chỉ đo những gì trang đầu tải); --no-smoke với Next thì chưa đo gì.
  const ok = (v, b) =>
    v === undefined ? "—" : b === undefined ? `${v.toFixed(1)} kB` : `${v.toFixed(1)} / ${b} kB ${v > b ? "❌" : "✅"}`;
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `### ${name}`,
      "",
      "| Initial JS (gzip) | CSS (gzip) | All JS (gzip) | Pages checked |",
      "|---|---|---|---|",
      `| ${ok(sizes?.js, budget?.js)} | ${ok(sizes?.css, budget?.css)} | ${ok(sizes?.totalJs)} | ${smoke ? pages.length : "skipped"} |`,
      "",
      ...(failures.length ? ["**Problems**", "", ...failures.map((f) => `- ${f}`), ""] : []),
    ].join("\n"),
  );
}
if (failures.length) {
  console.error(`\n✖ ${name}:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`✓ ${name}`);
