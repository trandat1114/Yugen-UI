#!/usr/bin/env node
/**
 * Fails when a tracked text file contains a raw LINE SEPARATOR (U+2028) or PARAGRAPH SEPARATOR (U+2029).
 *
 * Editors treat them as line breaks: VS Code stops on the file with "Detected unusual line terminators" and offers to
 * remove them, which silently changes the string they sit in. Write the escape instead: `\u2028` / `\u2029` in
 * JS, TS and JSON, `&#x2028;` in HTML and Markdown, `\2028` in CSS. Other invisible test inputs (no-break space, BOM)
 * read better as escapes too.
 *
 *   node scripts/check-line-terminators.mjs
 *
 * Binary files (a NUL byte in the first 8 KB) are skipped. Node built-ins and git only.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// UTF-8 bytes, so this file holds none of the characters it looks for.
const TERMINATORS = [
  { name: "LINE SEPARATOR (U+2028)", bytes: Buffer.from([0xe2, 0x80, 0xa8]) },
  { name: "PARAGRAPH SEPARATOR (U+2029)", bytes: Buffer.from([0xe2, 0x80, 0xa9]) },
];

const files = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
const errors = [];

for (const file of files) {
  let buf;
  try {
    buf = fs.readFileSync(path.join(root, file));
  } catch {
    continue; // deleted in the working tree, or a submodule
  }
  if (buf.subarray(0, 8192).includes(0)) continue;
  for (const { name, bytes } of TERMINATORS) {
    for (let at = buf.indexOf(bytes); at !== -1; at = buf.indexOf(bytes, at + bytes.length)) {
      let line = 1;
      let lineStart = 0;
      for (let i = 0; i < at; i++) {
        if (buf[i] === 0x0a) {
          line++;
          lineStart = i + 1;
        }
      }
      const column = buf.subarray(lineStart, at).toString("utf8").length + 1;
      errors.push(`${file}:${line}:${column} raw ${name}`);
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error("Write them as an escape (\\u2028 / \\u2029 in JS, TS and JSON); see scripts/check-line-terminators.mjs.");
  process.exit(1);
}
console.log(`check-line-terminators: OK — ${files.length} tracked files, no raw U+2028 / U+2029.`);
