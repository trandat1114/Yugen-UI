#!/usr/bin/env node
/**
 * Parts that load on demand stay out of the first chunk with esbuild code splitting (#370).
 *
 * The Toaster of `withToaster` (#346), Breadcrumb's overflow menu and StreamingMarkdown's citation card (#350) load with
 * `import()`. esbuild with `splitting: true` assigns whole files to chunks before it drops unused exports, so with
 * `import { … } from "yugen-ui"` these parts land in the first chunk anyway. The docs (Quick start › Import paths,
 * Performance) tell esbuild users to import from `yugen-ui/<Folder>`; this script keeps that advice true. It bundles a
 * few subpath imports from the built package (dist/, resolved through package.json `exports`) and fails when a part
 * is in the first chunk (the entry and the chunks it imports statically) or missing from the chunks loaded later.
 *
 * Two subpaths hold a lazy part themselves, so under esbuild splitting it is in their first chunk by design (the
 * Performance page says so): `yugen-ui/AIKit` also exports Citation (the StreamingMarkdown module is checked instead),
 * and `yugen-ui/Toast` is the file with the Toaster (`toast` from it brings the Toaster along; not checked).
 *
 *   npm run build:lib && node scripts/check-esbuild-splitting.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!fs.existsSync(path.join(root, "dist", "lib.js"))) {
  console.error("[check-esbuild-splitting] dist/lib.js is missing: run `npm run build:lib` first");
  process.exit(1);
}

// esbuild is not a direct dependency of the repo: use the one size-limit runs (as src/test/bundle-leaks.test.ts does).
const require = createRequire(import.meta.url);
const esbuild = await import(pathToFileURL(createRequire(require.resolve("@size-limit/esbuild")).resolve("esbuild")).href);

const MENU = [/\/Menu\/Menu\.js$/, /\/@radix-ui\/react-dropdown-menu\//];
const CITATION = [/\/AIKit\/Citation\.js$/, /\/Popover\/Popover\.js$/, /\/@radix-ui\/react-popover\//];
const TOASTER = [/\/Toast\/Toast\.js$/, /\/@radix-ui\/react-toast\//];

/** `code`: the app's imports. `deferred`: modules that must be in a later chunk, never in the first one. */
const cases = [
  {
    name: 'yugen-ui/Breadcrumb',
    code: 'export { Breadcrumb, BreadcrumbItem, BreadcrumbButton, BreadcrumbDivider, BreadcrumbOverflow } from "yugen-ui/Breadcrumb";',
    deferred: [/\/Breadcrumb\/BreadcrumbOverflowMenu\.js$/, ...MENU],
  },
  {
    name: 'yugen-ui/YugenProvider',
    code: 'export { YugenProvider } from "yugen-ui/YugenProvider";',
    deferred: TOASTER,
  },
  {
    name: "StreamingMarkdown module",
    code: 'export { StreamingMarkdown } from "./dist/components/ui/AIKit/StreamingMarkdown.js";',
    deferred: CITATION,
  },
  {
    name: "small app on subpaths",
    code: [
      'export { YugenProvider } from "yugen-ui/YugenProvider";',
      'export { Breadcrumb, BreadcrumbOverflow } from "yugen-ui/Breadcrumb";',
      'export { Button } from "yugen-ui/Button";',
      'export { Field } from "yugen-ui/Field";',
      'export { Input } from "yugen-ui/Input";',
    ].join("\n"),
    deferred: [...MENU, ...TOASTER],
  },
];

const posix = (p) => p.split(path.sep).join("/");
const kB = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;
const errors = [];

for (const { name, code, deferred } of cases) {
  const { metafile, outputFiles } = await esbuild.build({
    stdin: { contents: code, resolveDir: root, sourcefile: "app.js", loader: "js" },
    absWorkingDir: root,
    bundle: true,
    format: "esm",
    splitting: true,
    minify: true,
    outdir: path.join(root, ".esbuild-splitting"),
    write: false,
    external: ["react", "react-dom", "react/jsx-runtime"],
    metafile: true,
    logLevel: "silent",
  });
  const outputs = metafile.outputs;
  const entry = Object.keys(outputs).find((key) => outputs[key].entryPoint === "app.js");
  const first = new Set();
  const visit = (key) => {
    if (first.has(key)) return;
    first.add(key);
    for (const imp of outputs[key].imports) if (imp.kind === "import-statement" && outputs[imp.path]) visit(imp.path);
  };
  visit(entry);
  const later = Object.keys(outputs).filter((key) => key.endsWith(".js") && !first.has(key));
  const modulesOf = (keys) =>
    keys.flatMap((key) => Object.entries(outputs[key].inputs).filter(([, input]) => input.bytesInOutput > 0).map(([file]) => posix(file)));
  const firstModules = modulesOf([...first]);
  const laterModules = modulesOf(later);

  for (const pattern of deferred) {
    const inFirst = firstModules.find((file) => pattern.test(file));
    if (inFirst) errors.push(`${name}: ${inFirst} is in the first chunk; it should load on demand`);
    else if (!laterModules.some((file) => pattern.test(file))) errors.push(`${name}: nothing matching ${pattern} in the chunks loaded later`);
  }

  const contents = new Map(outputFiles.map((file) => [posix(path.relative(root, file.path)), file.contents]));
  const gzip = (keys) => keys.reduce((sum, key) => sum + zlib.gzipSync(contents.get(key)).length, 0);
  console.log(`[check-esbuild-splitting] ${name}: first chunk ${kB(gzip([...first]))}, on demand ${kB(gzip(later))} (gzip)`);
}

if (errors.length) {
  console.error(`\n[check-esbuild-splitting] ${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  process.exit(1);
}
console.log("[check-esbuild-splitting] ok");
