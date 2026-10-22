#!/usr/bin/env node
/**
 * Chép templates/ ở gốc repo vào packages/cli/templates/ để đóng gói cùng CLI (`yugen create` chạy offline).
 * npm bỏ mọi file .gitignore khi publish → đổi tên thành _gitignore, `yugen create` đổi lại khi chép ra.
 *
 *   node scripts/copy-templates.mjs     # chạy trong `npm run build` / prepack
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const from = path.resolve(here, "../../../templates");
const to = path.resolve(here, "../templates");

const manifest = JSON.parse(fs.readFileSync(path.join(from, "templates.json"), "utf8"));
fs.rmSync(to, { recursive: true, force: true });
fs.mkdirSync(to, { recursive: true });

for (const { dir } of manifest) {
  fs.cpSync(path.join(from, dir), path.join(to, dir), {
    recursive: true,
    filter: (src) => !/[\/](node_modules|dist)([\/]|$)/.test(path.relative(from, src)),
  });
}
for (const file of fs.readdirSync(to, { recursive: true }).map(String)) {
  if (path.basename(file) === ".gitignore") fs.renameSync(path.join(to, file), path.join(to, path.dirname(file), "_gitignore"));
}
fs.copyFileSync(path.join(from, "templates.json"), path.join(to, "templates.json"));
console.log(`copy-templates: ${manifest.map((t) => t.dir).join(", ")} → packages/cli/templates/`);
