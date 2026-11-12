#!/usr/bin/env node
/**
 * Build CSS cho gói npm (chạy sau `vite build -c vite.lib.config.ts`, ghi vào dist/):
 *
 *   dist/tokens.css  — token thô (tokens.css + charts.css) bỏ các khối @theme (#353, scripts/css-tokens.mjs): chỉ còn
 *                      CSS thường, không cần Tailwind.
 *   dist/theme.css   — nguồn Tailwind v4 cho dự án CÓ Tailwind: token + @theme (reset + bridge) + @utility + keyframes
 *                      + base, sinh từ src/index.css (bỏ `@import "tailwindcss"` và các dòng `@source`, nội tuyến các
 *                      file token). Phần đó nằm trong theme-core.css: theme.css chỉ `@import "./theme-core.css"` rồi thêm
 *                      `@source "./components"` để Tailwind của người dùng tự quét component đã build (#353).
 *   dist/theme-core.css — như theme.css nhưng không quét component (#169): app thêm dist/sources/<Thư mục>.css cho
 *                      từng component mình dùng (mỗi file quét component đó và mọi component nó dùng bên trong).
 *   dist/sources/index.json — export → thư mục, thư mục → các đường dẫn được quét. `yugen css` (packages/cli) đọc nó để
 *                      ghi các dòng @import cho đúng các component app import.
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
import { exportFolders, sourceFiles } from "./css-sources.mjs";
import { tokensCss } from "./css-tokens.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
const banner = (what) => `/*! ${pkg.name} v${pkg.version} | ${what} | MIT License */\n`;
const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} kB`;

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

// ---------- Nguồn: src/index.css với các @import cục bộ đã nội tuyến ----------
/**
 * Token groups kept out of theme-core.css (#354): each is written to dist/tokens/<group>.css. theme.css and styles.css
 * include them all; with theme-core.css an app imports brands.css itself and sources/<Folder>.css imports charts.css
 * when the folder uses Chart.
 */
const TOKEN_GROUPS = { "brands.css": "brands", "charts.css": "charts" };
const indexPath = path.join(src, "index.css");
const inlined = [];
const groups = {};
const inline = (withGroups) =>
  read(indexPath)
    .split("\n")
    .flatMap((line) => {
      const t = line.trim();
      if (/^@import\s+["']tailwindcss["'].*;$/.test(t)) return [];
      if (/^@source\b.*;$/.test(t)) return [];
      const local = t.match(/^@import\s+["'](\.{1,2}\/[^"']+\.css)["']\s*;$/);
      if (local) {
        const file = path.resolve(path.dirname(indexPath), local[1]);
        const group = TOKEN_GROUPS[path.basename(file)];
        if (withGroups) {
          inlined.push(file);
          if (group) groups[group] = file;
        }
        return group && !withGroups ? [] : [read(file), ""];
      }
      return [line];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
const themeBody = inline(true);
const coreBody = inline(false);
const missingGroups = Object.values(TOKEN_GROUPS).filter((g) => !groups[g]);
if (missingGroups.length) throw new Error(`[build-css] src/index.css không import nhóm token: ${missingGroups.join(", ")}`);

// ---------- dist/tokens.css + dist/tokens/<group>.css ----------
const tokens = tokensCss(inlined.map(read));
write("tokens.css", banner("design tokens (CSS custom properties)") + tokens + "\n");
fs.rmSync(path.join(dist, "tokens"), { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "tokens"));
for (const [group, file] of Object.entries(groups)) {
  write(`tokens/${group}.css`, banner(`${group} tokens — included by theme.css; @import after yugen-ui/theme-core.css`) + read(file) + "\n");
}

// ---------- dist/theme-core.css + dist/theme.css ----------
write(
  "theme-core.css",
  banner("Tailwind CSS v4 theme without component sources — add yugen-ui/sources/<Component>.css") +
    '\n/* Không quét component: thêm `@import "yugen-ui/sources/<Thư mục>.css";` cho từng component dùng trong app.\n' +
    '   Brand web / teams: `@import "yugen-ui/tokens/brands.css";` (#354). */\n\n' +
    coreBody +
    "\n",
);
// Tailwind giải @import và @source tương đối với chính theme.css: theme-core.css và components/ nằm cạnh nó (#353).
write(
  "theme.css",
  banner('Tailwind CSS v4 theme — use after @import "tailwindcss"') +
    '@import "./theme-core.css";\n' +
    Object.keys(groups)
      .map((group) => `@import "./tokens/${group}.css";\n`)
      .join("") +
    "\n/* Quét class trong các component đã build (tương đối với file này). */\n" +
    '@source "./components";\n',
);

// ---------- dist/sources/ (#169) ----------
const graph = sourceFiles(path.join(src, "components", "ui"));
const exports = exportFolders(root);
fs.rmSync(path.join(dist, "sources"), { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "sources"));
const folders = [...graph.keys()].filter((f) => !f.startsWith("_"));
for (const folder of folders) {
  // Chart's tokens come with the folders that render a chart (#354), so the lean path needs no extra import for them.
  const usesChart = graph.get(folder).some((f) => f === "Chart" || f.startsWith("Chart/"));
  const lines = [
    ...(usesChart ? ['@import "../tokens/charts.css";'] : []),
    ...graph.get(folder).map((f) => `@source "../components/ui/${f}";`),
  ];
  fs.writeFileSync(
    path.join(dist, "sources", `${folder}.css`),
    banner(`classes of ${folder} and the components it uses — @import after yugen-ui/theme-core.css`) + lines.join("\n") + "\n",
  );
}
const missing = [...new Set(Object.values(exports))].filter((f) => !folders.includes(f));
if (missing.length) throw new Error(`[build-css] export nằm trong thư mục không có sources: ${missing.join(", ")}`);
const manifest = {
  version: pkg.version,
  exports,
  sources: Object.fromEntries(folders.map((f) => [f, graph.get(f)])),
  // Token groups outside theme-core.css (#354): `yugen css` adds tokens/brands.css when the app sets brand web / teams.
  tokens: Object.fromEntries(Object.keys(groups).map((group) => [group, `tokens/${group}.css`])),
};
fs.writeFileSync(path.join(dist, "sources", "index.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`[build-css] dist/sources/  ${folders.length} files, ${Object.keys(exports).length} exports`);

// ---------- dist/styles.css + dist/components.css ----------
const SOURCES = [
  '@source "./components/ui";',
  '@source "./lib";',
  // Utility glass (Yugen Labs) và yugen-prose dùng thẳng trong app, không chỉ qua component: phải có sẵn trong bản biên dịch.
  '@source inline("glass glass-clear glass-tinted glass-scrim scroll-edge scroll-edge-above rounded-concentric yugen-prose");',
];

async function compileCss(parts) {
  const compiler = await compile(parts.join("\n\n"), { base: src, onDependency: () => {} });
  const scanner = new Scanner({ sources: compiler.sources });
  const candidates = scanner.scan();
  const { code } = optimize(compiler.build(candidates), { minify: true });
  return { code: code.trim(), candidates: candidates.length, files: scanner.files.length };
}

const styles = await compileCss(['@import "tailwindcss" source(none);', themeBody, ...SOURCES]);
write("styles.css", banner("precompiled stylesheet (no Tailwind required)") + styles.code + "\n");
console.log(`[build-css] ${styles.candidates} candidates scanned from ${styles.files} files`);

/*
 * components.css (#354): styles.css for a page Yugen does not own. No global preflight and no page styles: Tailwind's
 * preflight is nested under :where([data-theme]) (zero specificity, inside YugenProvider only) and the base layer of
 * index.css is replaced by src/styles/embed-base.css.
 */
const BASE_BLOCK = /^@layer base \{\n[\s\S]*?\n\}$/m;
if (!BASE_BLOCK.test(themeBody)) throw new Error("[build-css] src/index.css không còn khối @layer base ở cấp trên cùng");
const preflight = read(path.join(root, "node_modules", "tailwindcss", "preflight.css"));
const components = await compileCss([
  "@layer theme, base, components, utilities;",
  '@import "tailwindcss/theme.css" layer(theme);',
  `@layer base {\n:where([data-theme]) {\n${preflight}\n}\n}`,
  '@import "tailwindcss/utilities.css" layer(utilities) source(none);',
  themeBody.replace(BASE_BLOCK, read(path.join(src, "styles", "embed-base.css"))),
  ...SOURCES,
]);
write("components.css", banner("precompiled stylesheet to embed in a page you don't own (no global reset)") + components.code + "\n");

function write(name, content) {
  fs.writeFileSync(path.join(dist, name), content);
  console.log(`[build-css] dist/${name}  ${kb(content)}`);
}
