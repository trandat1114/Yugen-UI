#!/usr/bin/env node
/**
 * Kiểm tra loại bump của các changeset trong .changeset/ theo quy tắc cho từng số (docs › Versioning; CONTRIBUTING ›
 * Changeset). Chạy trong CI (`npm run check:changesets`).
 *
 *   - `major` chỉ từ 1.0. Trước 1.0, thay đổi phá vỡ là `minor`, tóm tắt mở đầu bằng "**Breaking:**".
 *   - `major` (từ 1.0) mở đầu bằng "**Breaking:**"; `patch` thì không bao giờ.
 *   - Tóm tắt mở đầu bằng "Fix" là `patch`; "New" (component, prop, token… mới) là `minor`.
 *   - PR vào `main` hoặc `release/*` chỉ mang `patch` — minor và major đi qua `next`. PR `next → main` được miễn.
 *
 *   node scripts/check-changesets.mjs [--base main]   # mặc định: GITHUB_BASE_REF (chỉ có khi CI chạy cho PR)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, ".changeset");
const { name, version } = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const stable = Number(version.split(".")[0]) >= 1;

const args = process.argv.slice(2);
const base = args.includes("--base") ? args[args.indexOf("--base") + 1] : (process.env.GITHUB_BASE_REF ?? "");
const head = process.env.GITHUB_HEAD_REF ?? "";
const patchOnly = (base === "main" || base.startsWith("release/")) && head !== "next";

/** Bump của gói `name` và tóm tắt trong một file changeset, hoặc undefined nếu file không đổi gói này. */
export function parseChangeset(source) {
  const m = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return undefined;
  const bump = m[1].match(new RegExp(`^\\s*["']?${name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}["']?\\s*:\\s*(major|minor|patch)\\s*$`, "m"))?.[1];
  return bump ? { bump, summary: m[2].trim() } : undefined;
}

/** Lỗi của một changeset theo các quy tắc ở đầu file. */
export function changesetErrors({ bump, summary }, { stable, patchOnly }) {
  const errors = [];
  const breaking = /^\*\*Breaking:?\*\*/i.test(summary);
  if (bump === "major" && !stable)
    errors.push('`major` chỉ dùng từ 1.0. Trước 1.0, thay đổi phá vỡ là `minor`, tóm tắt mở đầu bằng "**Breaking:**".');
  if (bump === "major" && stable && !breaking) errors.push('`major` cần tóm tắt mở đầu bằng "**Breaking:**" kèm cách chuyển đổi.');
  if (bump === "patch" && breaking) errors.push("thay đổi phá vỡ không bao giờ là `patch`.");
  if (bump !== "patch" && /^Fix(es|ed)?\b/.test(summary))
    errors.push("sửa lỗi là `patch`. Bản minor chỉ tăng khi có API mới, để số phiên bản không tăng vì sửa lỗi.");
  if (bump === "patch" && /^New\b/.test(summary)) errors.push("API mới (component, prop, token…) là `minor`.");
  if (patchOnly && bump !== "patch") errors.push(`PR vào main hoặc release/* chỉ mang \`patch\`. \`${bump}\` đi qua next.`);
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md") : [];
  const errors = [];
  for (const file of files) {
    const changeset = parseChangeset(fs.readFileSync(path.join(dir, file), "utf8"));
    if (!changeset) continue;
    for (const e of changesetErrors(changeset, { stable, patchOnly })) errors.push(`.changeset/${file} (${changeset.bump}): ${e}`);
  }
  if (errors.length) {
    for (const e of errors) console.error(`check-changesets: LỖI — ${e}`);
    console.error("check-changesets: xem docs › Versioning › Quy tắc cho từng số và CONTRIBUTING › Changeset.");
    process.exit(1);
  }
  console.log(`check-changesets: OK — ${files.length} changeset${base ? `, PR vào ${base}` : ""}.`);
}
