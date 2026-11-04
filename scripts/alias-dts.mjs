#!/usr/bin/env node
/**
 * Module specifiers in the emitted declarations (dist/**\/*.d.ts), rewritten so they resolve with
 * `moduleResolution: node16 / nodenext` as well as `bundler` (#343). Runs after `tsc -p tsconfig.lib.json`.
 *
 *   - `@/x` (the `paths` alias of tsconfig.app.json) becomes a relative path inside dist.
 *   - Every relative specifier gets its full ending: `./Button` → `./Button.js`, `./dir` → `./dir/index.js`.
 *
 * Resolution goes against the set of emitted .d.ts files, not the .js files: a module that only re-exports or only
 * holds types may have no .js next to it, and the specifier still has to point at it. A relative or `@/` specifier
 * that matches no .d.ts stops the build. Package specifiers are left as they are, and so are comment lines
 * (JSDoc examples).
 *
 *   node scripts/alias-dts.mjs [dir]     dir defaults to dist
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.resolve(root, process.argv[2] ?? "dist");

/** `from "x"`, `import("x")`, `import "x"`, `declare module "x"`: group 3 is the specifier. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|^[ \t]*import\s+|\bdeclare\s+module\s+)(["'])([^"'\n]+)\2/gm;
const COMMENT_LINE = /^\s*(?:\*|\/\*|\/\/)/;
/** Whether the line holding `offset` is a comment line. */
const inComment = (text, offset) => COMMENT_LINE.test(text.slice(text.lastIndexOf("\n", offset) + 1, offset + 1));

const files = fs
  .readdirSync(dist, { recursive: true })
  .map((f) => path.join(dist, f))
  .filter((f) => f.endsWith(".d.ts"));
const declarations = new Set(files);

/** Specifier as written from `file`, or null when nothing emitted matches it. */
function rewrite(file, spec) {
  let target;
  if (spec.startsWith("@/")) target = path.join(dist, spec.slice(2));
  else if (spec === "." || spec === ".." || spec.startsWith("./") || spec.startsWith("../"))
    target = path.resolve(path.dirname(file), spec);
  else return spec;
  const stem = target.replace(/\.(?:js|ts|tsx)$/, "");
  let resolved;
  if (declarations.has(`${stem}.d.ts`)) resolved = `${stem}.js`;
  else if (declarations.has(path.join(target, "index.d.ts"))) resolved = path.join(target, "index.js");
  else return null;
  const rel = path.relative(path.dirname(file), resolved).split(path.sep).join("/");
  return rel.startsWith("../") ? rel : `./${rel}`;
}

const unresolved = [];
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(SPECIFIER, (all, lead, quote, spec, offset) => {
    if (inComment(before, offset)) return all;
    const next = rewrite(file, spec);
    if (next === null) {
      unresolved.push(`${path.relative(root, file)}: "${spec}"`);
      return all;
    }
    return `${lead}${quote}${next}${quote}`;
  });
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}

if (unresolved.length) {
  console.error(`[alias-dts] ${unresolved.length} specifier(s) match no emitted .d.ts:\n  ${unresolved.join("\n  ")}`);
  process.exit(1);
}
console.log(`[alias-dts] ${files.length} declaration files, ${changed} rewritten`);
