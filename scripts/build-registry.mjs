#!/usr/bin/env node
/**
 * Sinh registry tương thích shadcn CLI vào public/r/ (site docs phục vụ tại <docs>/r/<item>.json):
 *
 *   npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json      # một lần / dự án
 *   npx shadcn@latest add https://trandat1114.github.io/Yugen-UI/r/button.json
 *
 *   public/r/registry.json   — danh mục (định dạng https://ui.shadcn.com/schema/registry.json, không kèm nội dung file)
 *   public/r/<item>.json     — từng item (https://ui.shadcn.com/schema/registry-item.json, kèm nội dung file)
 *     init / init-next       — registry:style (extends none) → components.json + theme + cn + YugenProvider, không kéo style shadcn
 *     theme                  — registry:file  → src/styles/yugen.css + tự chèn @import vào file CSS chính (Vite, TanStack Start)
 *     theme-next             — registry:file  → app/yugen.css cạnh app/globals.css (Next.js App Router, React Router)
 *     cn                     — registry:lib   → lib/cn.ts
 *     <component>            — registry:ui    → components/ui/<Name>/*.tsx (giữ nguyên thư mục để import tương đối chạy)
 *     all                    — mọi component một lần
 *
 * Component KHÔNG phụ thuộc theme: đường dẫn @import khác nhau giữa Vite và Next.js nên theme đi cùng init (một lần / dự án).
 *
 * Phụ thuộc npm và registryDependencies được suy ra từ import của từng file — thêm component mới không cần sửa script.
 *
 * CLI `yugen add` / `init` (packages/cli) đọc cùng output: tên item, `registry/yugen/{ui,lib}/…` trong `files[].path`,
 * import `@/lib/…` / `@/components/ui/…` và item `theme`, `cn`, `yugen-provider`, `all` — đổi những thứ đó thì sửa cả CLI.
 *
 *   node scripts/build-registry.mjs                 # URL mặc định: homepage trong package.json + "r"
 *   REGISTRY_URL=http://localhost:5173/r node scripts/build-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const uiDir = path.join(src, "components", "ui");
const outDir = path.join(root, "public", "r");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const baseUrl = (process.env.REGISTRY_URL ?? new URL("r", pkg.homepage.endsWith("/") ? pkg.homepage : `${pkg.homepage}/`).href).replace(
  /\/$/,
  "",
);
const itemUrl = (name) => `${baseUrl}/${name}.json`;

const read = (file) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();

/** Không phải dependency cần cài: peer của mọi dự án React. */
const PEERS = new Set(["react", "react-dom"]);
const deps = { ...pkg.dependencies };

function npmName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

/** Phân tích import của một file → { npm: Set, folders: Set (thư mục component khác), lib: Set (file trong src/lib) }. */
function analyse(file, ownFolder) {
  const code = read(file);
  const npm = new Set();
  const folders = new Set();
  const lib = new Set();
  for (const m of code.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2];
    if (spec.startsWith("@/lib/")) {
      lib.add(spec.slice("@/lib/".length));
    } else if (spec.startsWith("@/components/ui/")) {
      const folder = spec.slice("@/components/ui/".length).split("/")[0];
      if (folder !== ownFolder) folders.add(folder);
    } else if (spec.startsWith(".")) {
      const target = path.resolve(path.dirname(file), spec);
      const rel = path.relative(uiDir, target).split(path.sep);
      if (rel[0] === "..") {
        const fromSrc = path.relative(src, target).split(path.sep);
        if (fromSrc[0] === "lib") lib.add(fromSrc.slice(1).join("/"));
        else throw new Error(`${path.relative(root, file)}: import ngoài components/ui không hỗ trợ: ${spec}`);
      } else if (rel[0] !== ownFolder) folders.add(rel[0]);
    } else if (spec.startsWith("@/")) {
      throw new Error(`${path.relative(root, file)}: alias chưa hỗ trợ trong registry: ${spec}`);
    } else {
      const name = npmName(spec);
      if (PEERS.has(name)) continue;
      if (!deps[name]) throw new Error(`${path.relative(root, file)}: "${name}" không có trong dependencies của package.json`);
      npm.add(name);
    }
  }
  return { npm, folders, lib };
}

const withVersion = (name) => `${name}@${deps[name]}`;
const sorted = (set) => [...set].sort();

// ---------- Theme: src/index.css với file token nội tuyến, bỏ @import "tailwindcss" và @source ----------
function themeCss() {
  const indexPath = path.join(src, "index.css");
  const body = read(indexPath)
    .split("\n")
    .flatMap((line) => {
      const t = line.trim();
      if (/^@import\s+["']tailwindcss["'].*;$/.test(t)) return [];
      if (/^@source\b.*;$/.test(t)) return [];
      const local = t.match(/^@import\s+["'](\.{1,2}\/[^"']+\.css)["']\s*;$/);
      if (local) return [read(path.resolve(path.dirname(indexPath), local[1])).trim(), ""];
      return [line];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return (
    `/*! ${pkg.name} v${pkg.version} | Tailwind CSS v4 theme | MIT License */\n` +
    `/* Dùng sau @import "tailwindcss"; — ví dụ trong globals.css: @import "./styles/yugen.css"; */\n\n` +
    body +
    "\n"
  );
}

const SCHEMA_ITEM = "https://ui.shadcn.com/schema/registry-item.json";
const items = [];

// Hai biến thể theme: file CSS đặt sao cho @import tương đối luôn đúng. CLI tự thêm "src/" khi dự án có thư mục src,
// nên "app/yugen.css" nằm cạnh app/globals.css lẫn src/app/globals.css.
const THEMES = [
  { name: "theme", target: "styles/yugen.css", importPath: "./styles/yugen.css", layout: "Vite / TanStack Start (src/index.css)" },
  { name: "theme-next", target: "app/yugen.css", importPath: "./yugen.css", layout: "Next.js App Router / React Router (app/globals.css)" },
];
const theme = themeCss();
for (const t of THEMES) {
  items.push({
    name: t.name,
    type: "registry:file",
    title: `Yugen UI theme — ${t.layout}`,
    description:
      "Design tokens (light, dark, high contrast; Sakura, Web and Teams brands), the Tailwind v4 @theme bridge, utilities and keyframes. Imported into your main CSS file automatically.",
    dependencies: [],
    registryDependencies: [],
    files: [{ path: `registry/yugen/${t.target}`, type: "registry:file", target: t.target, content: theme }],
    css: { [`@import "${t.importPath}"`]: {} },
    docs: "The Yugen theme is now imported into your CSS. It replaces Tailwind's default colour, radius, shadow and font-size scales — use Yugen utilities (bg-background-1, p-M, rounded-medium, text-body1) instead.",
  });
}

const libFiles = new Map(); // tên file trong src/lib → item name
function libItem(file) {
  if (libFiles.has(file)) return libFiles.get(file);
  const abs = path.join(src, "lib", file.endsWith(".ts") ? file : `${file}.ts`);
  const name = kebab(path.basename(abs, ".ts"));
  libFiles.set(file, name);
  const { npm } = analyse(abs, null);
  items.push({
    name,
    type: "registry:lib",
    title: path.basename(abs),
    description: `Yugen UI helper ${path.basename(abs)}.`,
    dependencies: sorted(npm).map(withVersion),
    registryDependencies: [],
    files: [{ path: `registry/yugen/lib/${path.basename(abs)}`, type: "registry:lib", content: read(abs) }],
  });
  return name;
}

const folders = fs
  .readdirSync(uiDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const componentNames = [];
for (const folder of folders) {
  const dir = path.join(uiDir, folder);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(tsx?|css)$/.test(f) && !/\.(test|spec|stories)\.tsx?$/.test(f))
    .sort();
  if (files.length === 0) continue;

  const npm = new Set();
  const regDeps = new Set();
  for (const file of files) {
    if (!/\.tsx?$/.test(file)) continue;
    const a = analyse(path.join(dir, file), folder);
    a.npm.forEach((n) => npm.add(n));
    a.folders.forEach((f) => regDeps.add(itemUrl(kebab(f))));
    a.lib.forEach((l) => regDeps.add(itemUrl(libItem(l))));
  }

  const name = kebab(folder);
  componentNames.push(name);
  items.push({
    name,
    type: "registry:ui",
    title: folder,
    description: `Yugen UI ${folder} — Fluent 2-inspired, accessible, themeable (light / dark / high contrast, RTL).`,
    dependencies: sorted(npm).map(withVersion),
    registryDependencies: sorted(regDeps),
    files: files.map((file) => {
      const code = read(path.join(dir, file));
      // Như gói npm: mọi file component là client boundary (Next.js App Router); CLI tự bỏ khi rsc = false.
      const content = /\.tsx?$/.test(file) && !/^["']use client["']/.test(code) ? `"use client";\n\n${code}` : code;
      return { path: `registry/yugen/ui/${folder}/${file}`, type: "registry:ui", content };
    }),
  });
}

items.push({
  name: "all",
  type: "registry:item",
  title: "All Yugen UI components",
  description: "Every Yugen UI component and the cn() helper. Run init first for the theme.",
  dependencies: [],
  registryDependencies: componentNames.map(itemUrl),
  files: [],
});

// ---------- init: `npx shadcn@latest init <url>/r/init.json` — tạo components.json nếu thiếu, không cài style mặc định của shadcn ----------
for (const [name, themeName, framework] of [
  ["init", "theme", "Vite, TanStack Start"],
  ["init-next", "theme-next", "Next.js App Router, React Router"],
]) {
  items.push({
    name,
    type: "registry:style",
    extends: "none",
    title: `Yugen UI — init (${framework})`,
    description: `Set up Yugen UI in a ${framework} project: theme, cn() and YugenProvider, without the default shadcn/ui style.`,
    dependencies: [],
    registryDependencies: [itemUrl(themeName), itemUrl(libItem("cn")), itemUrl("yugen-provider")],
    files: [],
    docs: `Yugen UI is ready. Wrap your app once — <YugenProvider applyToDocument withToaster> from "@/components/ui/YugenProvider/YugenProvider" — then add components: npx shadcn@latest add ${itemUrl("button")}`,
  });
}

// ---------- Ghi file ----------
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const item of items) {
  fs.writeFileSync(path.join(outDir, `${item.name}.json`), JSON.stringify({ $schema: SCHEMA_ITEM, ...item }, null, 2) + "\n");
}
const index = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "yugen",
  homepage: pkg.homepage,
  items: items.map(({ files, ...rest }) => ({ ...rest, files: files.map(({ content: _content, ...f }) => f) })),
};
fs.writeFileSync(path.join(outDir, "registry.json"), JSON.stringify(index, null, 2) + "\n");

const bytes = items.reduce((n, i) => n + fs.statSync(path.join(outDir, `${i.name}.json`)).size, 0);
console.log(`registry: ${items.length} item (${componentNames.length} component) → public/r/ · ${(bytes / 1024).toFixed(0)} kB · ${baseUrl}`);
