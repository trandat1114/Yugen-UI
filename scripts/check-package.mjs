#!/usr/bin/env node
/**
 * Checks on the built package (run after `npm run build:lib`, CI build job):
 *
 *   1. Exports (#344): every module that src/components/ui/index.ts re-exports has a `yugen-ui/<path>` subpath; Node
 *      resolves and imports each one, and each name it exports is the same object as the root's (one module instance,
 *      so no duplicated React context). `yugen-ui/_internal/*` stays closed; the CSS / JSON keys still resolve.
 *   2. Types (#343): a consumer with `module: nodenext` imports every runtime export from the root and from every
 *      subpath, and tsc finds a type for each; declaration files import no package outside dependencies / peers.
 *   3. Server-safe files (#345, scripts/server-safe.mjs): no "use client", no hooks or context, imports limited to
 *      other server-safe files and packages that do not use React; the root takes their names from them. Every other
 *      file starts with "use client", the messages modules included.
 *   4. CSS (#353): a consumer's Tailwind compiles `yugen-ui/theme.css` (its `@import "./theme-core.css"` and
 *      `@source "./components"` resolve next to it), `theme-core.css` alone (no component classes, no keyframes) and
 *      `theme-core.css` + `sources/Decorative.css` (that component's classes and only the keyframes they use).
 *      dist/tokens.css has no Tailwind-only at-rule.
 *
 *   node scripts/check-package.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseSync } from "vite";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { tailwindAtRules } from "./css-tokens.mjs";
import { SERVER_SAFE, SERVER_SAFE_BARRELS } from "./server-safe.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const posix = (p) => p.split(path.sep).join("/");

const errors = [];
const fail = (message) => errors.push(message);

if (!fs.existsSync(path.join(dist, "lib.js"))) {
  console.error("[check-package] dist/lib.js is missing: run `npm run build:lib` first");
  process.exit(1);
}

// ---------- 1. Exports ----------
const uiIndex = fs.readFileSync(path.join(root, "src", "components", "ui", "index.ts"), "utf8");
const modules = [...uiIndex.matchAll(/^export \* from "\.\/(.+?)(?:\.js)?";/gm)].map(([, module]) => module);
/** `Button/Button` → `Button`, `hooks/Hooks` → `hooks`; anything else keeps its path (`AppShell/Sidebar`, `messages-en`). */
const subpathOf = (module) => module.replace(/^([^/]+)\/([^/]+)$/, (all, dir, file) => (dir.toLowerCase() === file.toLowerCase() ? dir : all));

const rootModule = await import(pkg.name);
/** Subpath specifier → its runtime export names, for the subpaths that load. */
const subpaths = new Map();
for (const module of modules) {
  const specifier = `${pkg.name}/${subpathOf(module)}`;
  const expected = pathToFileURL(path.join(dist, "components", "ui", `${module}.js`)).href;
  let sub;
  try {
    const resolved = import.meta.resolve(specifier);
    if (resolved !== expected) {
      fail(`${specifier}: resolves to ${resolved}, expected ${expected}`);
      continue;
    }
    sub = await import(specifier);
  } catch (error) {
    fail(`${specifier}: does not load (${error.code ?? error.message})`);
    continue;
  }
  const names = Object.keys(sub);
  if (!names.length) fail(`${specifier}: exports nothing`);
  for (const name of names) {
    if (rootModule[name] !== sub[name]) fail(`${specifier}: "${name}" is not the root's ${name} (a second module instance?)`);
  }
  subpaths.set(specifier, names);
}
const fromSubpaths = new Set([...subpaths.values()].flat());
// What the root has besides the component modules: src/lib (cn, brand ramp, token export).
const libNames = new Set();
for (const file of fs.readdirSync(path.join(dist, "lib"))) {
  if (file.endsWith(".js")) for (const name of Object.keys(await import(pathToFileURL(path.join(dist, "lib", file)).href))) libNames.add(name);
}
const unreachable = Object.keys(rootModule).filter((name) => !fromSubpaths.has(name) && !libNames.has(name));
if (unreachable.length) fail(`root exports with no subpath: ${unreachable.join(", ")}`);

try {
  import.meta.resolve(`${pkg.name}/_internal/icons`);
  fail(`${pkg.name}/_internal/icons resolves: _internal must stay out of the exports`);
} catch (error) {
  if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") fail(`${pkg.name}/_internal/icons: ${error.code ?? error.message}`);
}
for (const file of ["theme.css", "theme-core.css", "styles.css", "tokens.css", "sources/index.json", "sources/Button.css"]) {
  const specifier = `${pkg.name}/${file}`;
  try {
    if (import.meta.resolve(specifier) !== pathToFileURL(path.join(dist, file)).href) fail(`${specifier}: resolves outside dist/${file}`);
  } catch (error) {
    fail(`${specifier}: does not resolve (${error.code ?? error.message})`);
  }
  if (!fs.existsSync(path.join(dist, file))) fail(`dist/${file} is missing`);
}
console.log(`[check-package] exports: ${modules.length} subpaths, ${Object.keys(rootModule).length} root exports`);

// ---------- 2. Types ----------
const allowed = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);
const packageOf = (spec) => spec.split("/").slice(0, spec.startsWith("@") ? 2 : 1).join("/");
// Same specifier forms as scripts/alias-dts.mjs; comment lines (JSDoc examples) do not count.
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|^[ \t]*import\s+|\bdeclare\s+module\s+)["']([^"'\n]+)["']/gm;
// Libraries whose types must not reach the public API (#371): replacing them (#356) would otherwise be a breaking change.
const PRIVATE_TYPES = new Set(["react-resizable-panels"]);
const files = fs.readdirSync(dist, { recursive: true }).map((f) => path.join(dist, f));
for (const file of files.filter((f) => f.endsWith(".d.ts"))) {
  const text = fs.readFileSync(file, "utf8");
  for (const { 1: spec, index } of text.matchAll(SPECIFIER)) {
    if (spec.startsWith(".") || /^\s*(?:\*|\/\*|\/\/)/.test(text.slice(text.lastIndexOf("\n", index) + 1, index + 1))) continue;
    if (!allowed.has(packageOf(spec))) fail(`${posix(path.relative(root, file))}: imports "${spec}", which is not a dependency or peer`);
    if (PRIVATE_TYPES.has(packageOf(spec))) fail(`${posix(path.relative(root, file))}: public types import "${spec}" (#371: use Yugen types)`);
  }
}

// A consumer project in a temp folder, with node_modules/yugen-ui linked to this package (as after `npm install`).
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-nodenext-"));
try {
  fs.mkdirSync(path.join(consumer, "node_modules"));
  fs.symlinkSync(root, path.join(consumer, "node_modules", pkg.name), "junction");
  fs.writeFileSync(path.join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
  fs.writeFileSync(
    path.join(consumer, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        target: "es2022",
        lib: ["es2022", "dom", "dom.iterable"],
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        // Off, so an import in this package's .d.ts that nodenext cannot resolve fails here instead of turning a type
        // into `any`. Errors inside other packages' declarations are filtered out below.
        skipLibCheck: false,
        types: [],
      },
      files: ["index.ts"],
    }),
  );
  let n = 0;
  const importAll = (specifier, names) =>
    `import { ${names.map((name) => `${name} as $${n++}`).join(", ")} } from "${specifier}";`;
  const lines = [importAll(pkg.name, Object.keys(rootModule))];
  for (const [specifier, names] of subpaths) lines.push(importAll(specifier, names));
  // Types only, and the per-component augmentation of the provider's interfaces (`declare module "…/context.js"`).
  lines.push(
    `import type { ButtonProps, YugenComponentDefaults, YugenMessages } from "${pkg.name}";`,
    `import type { LineChartProps } from "${pkg.name}/Chart";`,
    `import type { PromptInputProps } from "${pkg.name}/AIKit";`,
    `import type { UseDisclosureResult } from "${pkg.name}/hooks";`,
    `export type Checked = [ButtonProps, LineChartProps, PromptInputProps, UseDisclosureResult, YugenComponentDefaults["Button"], YugenMessages["chart"]];`,
  );
  fs.writeFileSync(path.join(consumer, "index.ts"), lines.join("\n") + "\n");
  const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
  try {
    execFileSync(process.execPath, [tsc, "-p", consumer], { cwd: consumer, encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    // One diagnostic per `file(line,col): error …` line plus its indented continuation lines.
    const diagnostics = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim().split(/\r?\n(?=\S)/);
    // Another package's file: under a node_modules folder other than this package's link.
    const dependency = new RegExp(`[\\\\/]node_modules[\\\\/](?!${pkg.name}[\\\\/])`);
    const ours = diagnostics.filter((d) => {
      const file = /^(.+?)\(\d+,\d+\): /.exec(d)?.[1];
      return !file || !dependency.test(file);
    });
    if (ours.length)
      fail(`tsc --module nodenext on a consumer of every export: ${ours.length} error(s)\n    ${ours.slice(0, 30).join("\n    ")}`);
    else console.log(`[check-package] types: ${diagnostics.length} error(s) in dependencies' declarations, not checked`);
  }
  console.log(`[check-package] types: ${n} imports type-checked with module nodenext`);
} finally {
  fs.rmSync(consumer, { recursive: true, force: true });
}

// ---------- 3. Server-safe files ----------
/** A package that has React as a dependency or peer cannot be imported by a server-safe file. */
const usesReact = (name) => {
  if (name === "react" || name === "react-dom") return true;
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8"));
  return ["dependencies", "peerDependencies"].some((field) => manifest[field] && ("react" in manifest[field] || "react-dom" in manifest[field]));
};
const parse = (file) => parseSync(file, fs.readFileSync(file, "utf8"), { lang: "js" }).program;
const hasDirective = (program) => program.body.some((node) => node.type === "ExpressionStatement" && node.directive === "use client");
/** Calls to a hook (`useX(…)`, `React.useX(…)`) or to createContext anywhere in the module. */
const reactCalls = (node, found = []) => {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    for (const child of node) reactCalls(child, found);
    return found;
  }
  if (node.type === "CallExpression") {
    const callee = node.callee.type === "MemberExpression" ? node.callee.property : node.callee;
    if (callee.type === "Identifier" && (/^use[A-Z]/.test(callee.name) || callee.name === "createContext")) found.push(callee.name);
  }
  for (const key of Object.keys(node)) if (key !== "type" && key !== "start" && key !== "end") reactCalls(node[key], found);
  return found;
};

const serverSafe = new Set(SERVER_SAFE);
for (const rel of SERVER_SAFE) {
  const file = path.join(dist, rel);
  if (!fs.existsSync(file)) {
    fail(`server-safe dist/${rel} does not exist`);
    continue;
  }
  const program = parse(file);
  if (hasDirective(program)) fail(`server-safe dist/${rel} has "use client"`);
  const calls = reactCalls(program);
  if (calls.length) fail(`server-safe dist/${rel} calls ${[...new Set(calls)].join(", ")}`);
  const barrel = SERVER_SAFE_BARRELS.includes(rel);
  for (const node of program.body) {
    if (barrel) {
      if (!["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(node.type) || node.declaration)
        fail(`server-safe barrel dist/${rel} has code of its own (${node.type})`);
      continue;
    }
    if (node.type !== "ImportDeclaration" && !(node.source && node.type.startsWith("Export"))) continue;
    const spec = node.source.value;
    if (spec.startsWith(".")) {
      const target = posix(path.relative(dist, path.resolve(path.dirname(file), spec)));
      if (!serverSafe.has(target)) fail(`server-safe dist/${rel} imports dist/${target}, which is not server-safe`);
    } else if (usesReact(packageOf(spec))) {
      fail(`server-safe dist/${rel} imports "${spec}", which uses React`);
    }
  }
}
// A barrel must take each name of a server-safe file from that file: through a "use client" module the name would be
// a client reference on the server (readAppShellCookie from AppShell.js threw in a Server Component).
for (const barrel of SERVER_SAFE_BARRELS) {
  const file = path.join(dist, barrel);
  const takenFrom = new Map();
  for (const node of parse(file).body) {
    if (!node.source?.value.startsWith(".") || !node.specifiers) continue;
    const target = posix(path.relative(dist, path.resolve(path.dirname(file), node.source.value)));
    for (const spec of node.specifiers) {
      const name = spec.type === "ExportSpecifier" ? spec.local : spec.imported;
      if (name) takenFrom.set(name.name ?? name.value, target);
    }
  }
  for (const safe of SERVER_SAFE.filter((f) => !SERVER_SAFE_BARRELS.includes(f) && fs.existsSync(path.join(dist, f)))) {
    for (const name of Object.keys(await import(pathToFileURL(path.join(dist, safe)).href))) {
      const from = takenFrom.get(name);
      if (from && !serverSafe.has(from)) fail(`dist/${barrel} takes "${name}" from dist/${from} ("use client"), not from dist/${safe}`);
    }
  }
}
let clientFiles = 0;
for (const file of files.filter((f) => f.endsWith(".js"))) {
  const rel = posix(path.relative(dist, file));
  if (serverSafe.has(rel)) continue;
  clientFiles++;
  if (!hasDirective(parse(file))) fail(`dist/${rel} has no "use client" and is not in scripts/server-safe.mjs`);
}
console.log(`[check-package] server-safe: ${SERVER_SAFE.length} files, ${clientFiles} files with "use client"`);

// ---------- 4. CSS ----------
const leftover = tailwindAtRules(fs.readFileSync(path.join(dist, "tokens.css"), "utf8"));
if (leftover.length) fail(`dist/tokens.css has Tailwind-only at-rules: ${[...new Set(leftover)].join(", ")}`);
// The consumer resolves yugen-ui and tailwindcss from its own node_modules, as after `npm install`.
const cssConsumer = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-css-"));
try {
  fs.mkdirSync(path.join(cssConsumer, "node_modules"));
  fs.symlinkSync(root, path.join(cssConsumer, "node_modules", pkg.name), "junction");
  fs.symlinkSync(path.join(root, "node_modules", "tailwindcss"), path.join(cssConsumer, "node_modules", "tailwindcss"), "junction");
  const tailwind = async (...files) => {
    const input = ['@import "tailwindcss" source(none);', ...files.map((file) => `@import "${pkg.name}/${file}";`)].join("\n");
    const compiler = await compile(input, { base: cssConsumer, onDependency: () => {} });
    const css = compiler.build(new Scanner({ sources: compiler.sources }).scan());
    return { css, keyframes: [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]) };
  };
  // Decorative's WavyUnderline: class animate-wave-flow, keyframe wave-flow.
  const COMPONENT_CLASS = ".animate-wave-flow";
  const full = await tailwind("theme.css");
  if (!full.css.includes("--colorBrandBackground:")) fail("theme.css: the tokens of theme-core.css are missing (@import not resolved?)");
  if (!full.css.includes(COMPONENT_CLASS) || !full.keyframes.includes("wave-flow"))
    fail(`theme.css: no ${COMPONENT_CLASS} or wave-flow keyframes, @source "./components" scanned nothing`);
  const core = await tailwind("theme-core.css");
  if (!core.css.includes("--colorBrandBackground:")) fail("theme-core.css: tokens missing");
  if (core.css.includes(COMPONENT_CLASS) || core.keyframes.length)
    fail(`theme-core.css alone: component classes or keyframes (${core.keyframes.join(", ")}) in the output`);
  const lean = await tailwind("theme-core.css", "sources/Decorative.css");
  if (!lean.css.includes(COMPONENT_CLASS) || !lean.keyframes.includes("wave-flow") || lean.keyframes.includes("chart-grow"))
    fail(`theme-core.css + sources/Decorative.css: expected ${COMPONENT_CLASS} and wave-flow only, got keyframes ${lean.keyframes.join(", ")}`);
  console.log(`[check-package] css: theme.css ${full.keyframes.length} keyframes, theme-core.css ${core.keyframes.length}, + Decorative ${lean.keyframes.length}`);
} finally {
  fs.rmSync(cssConsumer, { recursive: true, force: true });
}

if (errors.length) {
  console.error(`[check-package] ${errors.length} problem(s):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log("[check-package] ok");
