#!/usr/bin/env node
/**
 * Đo CSS của một app khi dùng `theme.css` (quét mọi component) so với `theme-core.css` + `sources/*.css` cho đúng các
 * component app import (#169). Đọc import `from "yugen-ui"` / `"@/components/ui"` trong thư mục nguồn của app, tra thư
 * mục qua dist/sources/index.json, biên dịch cả hai bằng Tailwind như bundler của app (gồm class của chính app).
 * Chạy sau `npm run build:lib`.
 *
 *   node scripts/measure-css.mjs src/docs/template-library/starter src/docs/template-library/saas …
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { compile, optimize } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const manifest = JSON.parse(fs.readFileSync(path.join(dist, "sources", "index.json"), "utf8"));
const posix = (p) => p.split(path.sep).join("/");
const IMPORT_RE = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["'](?:yugen-ui|@\/components\/ui)["']/g;

/** Các thư mục component mà mã trong `dir` import. */
function usedFolders(dir) {
  const folders = new Set();
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(?:ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
        for (const m of fs.readFileSync(p, "utf8").matchAll(IMPORT_RE)) {
          for (const raw of m[1].split(",")) {
            const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
            if (manifest.exports[name]) folders.add(manifest.exports[name]);
          }
        }
      }
    }
  };
  walk(dir);
  return [...folders].sort();
}

async function build(css, base) {
  const compiler = await compile(css, { base, onDependency: () => {} });
  const scanner = new Scanner({ sources: compiler.sources });
  const code = optimize(compiler.build(scanner.scan()), { minify: true }).code;
  return zlib.gzipSync(code).length / 1000;
}

const rows = [];
for (const arg of process.argv.slice(2)) {
  const app = path.resolve(arg);
  const folders = usedFolders(app);
  const appSource = `@source "${posix(app)}";`;
  const full = await build(['@import "tailwindcss" source(none);', `@import "${posix(path.join(dist, "theme.css"))}";`, appSource].join("\n"), root);
  const lean = await build(
    [
      '@import "tailwindcss" source(none);',
      `@import "${posix(path.join(dist, "theme-core.css"))}";`,
      ...folders.map((f) => `@import "${posix(path.join(dist, "sources", `${f}.css`))}";`),
      appSource,
    ].join("\n"),
    root,
  );
  rows.push({ app: path.basename(app), components: folders.length, full, lean });
}
for (const r of rows) {
  const saved = (1 - r.lean / r.full) * 100;
  console.log(`${r.app.padEnd(12)} ${String(r.components).padStart(3)} folders   theme.css ${r.full.toFixed(1)} kB   core + sources ${r.lean.toFixed(1)} kB   −${saved.toFixed(0)}%`);
}
