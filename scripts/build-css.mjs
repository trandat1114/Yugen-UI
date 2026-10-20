#!/usr/bin/env node
/**
 * Build CSS cho gói npm (chạy sau `vite build -c vite.lib.config.ts`, ghi vào dist/):
 *
 *   dist/tokens.css  — token thô (tokens.css + charts.css). Không cần Tailwind.
 *   dist/theme.css   — nguồn Tailwind v4 cho dự án CÓ Tailwind: token + @theme (reset + bridge) + @utility
 *                      + keyframes + base. Sinh từ src/index.css: bỏ `@import "tailwindcss"` và các dòng `@source`,
 *                      nội tuyến các file token. Thêm `@source "./components"` để Tailwind của người dùng tự quét
 *                      component đã build (đường dẫn tương đối với chính theme.css).
 *   dist/styles.css  — CSS đã biên dịch đầy đủ (preflight + mọi utility component dùng) cho dự án KHÔNG có Tailwind.
 *                      Chỉ quét src/components/ui + src/lib.
 *
 *   node scripts/build-css.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
const banner = (what) => `/*! ${pkg.name} v${pkg.version} | ${what} | MIT License */\n`;
const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} kB`;

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

// ---------- Nguồn: src/index.css với các @import cục bộ đã nội tuyến ----------
const indexPath = path.join(src, "index.css");
const inlined = [];
const themeBody = read(indexPath)
  .split("\n")
  .flatMap((line) => {
    const t = line.trim();
    if (/^@import\s+["']tailwindcss["'].*;$/.test(t)) return [];
    if (/^@source\b.*;$/.test(t)) return [];
    const local = t.match(/^@import\s+["'](\.{1,2}\/[^"']+\.css)["']\s*;$/);
    if (local) {
      const file = path.resolve(path.dirname(indexPath), local[1]);
      inlined.push(file);
      return [read(file), ""];
    }
    return [line];
  })
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

// ---------- dist/tokens.css ----------
const tokens = inlined.map(read).join("\n\n");
write("tokens.css", banner("design tokens (CSS custom properties)") + tokens + "\n");

// ---------- dist/theme.css ----------
const theme =
  banner('Tailwind CSS v4 theme — use after @import "tailwindcss"') +
  "\n/* Quét class trong các component đã build (tương đối với file này). */\n" +
  '@source "./components";\n\n' +
  themeBody +
  "\n";
write("theme.css", theme);

// ---------- dist/styles.css ----------
const input = [
  '@import "tailwindcss" source(none);',
  themeBody,
  '@source "./components/ui";',
  '@source "./lib";',
].join("\n\n");

const compiler = await compile(input, { base: src, onDependency: () => {} });
const scanner = new Scanner({ sources: compiler.sources });
const candidates = scanner.scan();
const compiled = compiler.build(candidates);
const { code } = optimize(compiled, { minify: true });
write("styles.css", banner("precompiled stylesheet (no Tailwind required)") + code.trim() + "\n");

console.log(`[build-css] ${candidates.length} candidates scanned from ${scanner.files.length} files`);

function write(name, content) {
  fs.writeFileSync(path.join(dist, name), content);
  console.log(`[build-css] dist/${name}  ${kb(content)}`);
}
