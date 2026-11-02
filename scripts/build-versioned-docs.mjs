#!/usr/bin/env node
/**
 * Docs theo phiên bản cho GitHub Pages (chạy SAU `npm run build:docs`, trong CI):
 *   dist-docs/                 bản mới nhất (nhánh main)
 *   dist-docs/v0.6/, v0.5/…    bản cũ — build lại từ tag mới nhất của mỗi minor (tối đa MAX_VERSIONS)
 *   dist-docs/versions.json    [{ "version": "0.7", "path": "" }, { "version": "0.6", "path": "v0.6/" }, …]
 * TopBar đọc versions.json để hiện menu chọn phiên bản. Không có tag nào → chỉ ghi phiên bản hiện tại.
 *
 *   DOCS_BASE=/Yugen-UI/ node scripts/build-versioned-docs.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_VERSIONS = 3;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist-docs");
const base = (process.env.DOCS_BASE ?? "/").replace(/\/?$/, "/");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const current = pkg.version.split(".").slice(0, 2).join(".");
const run = (cmd, args, cwd, env) => execFileSync(cmd, args, { cwd, stdio: "inherit", env: { ...process.env, ...env }, shell: process.platform === "win32" });

if (!fs.existsSync(path.join(out, "index.html"))) throw new Error("Chạy `npm run build:docs` trước.");

// Tag mới nhất của mỗi minor, bỏ minor hiện tại và bản pre-release.
const tags = execFileSync("git", ["tag", "-l", "v*"], { cwd: root, encoding: "utf8" })
  .split(/\r?\n/)
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
const latestPerMinor = new Map();
for (const tag of tags) {
  const [major, minor, patch] = tag.slice(1).split(".").map(Number);
  const key = `${major}.${minor}`;
  if (key === current) continue;
  const prev = latestPerMinor.get(key);
  if (!prev || patch > prev.patch) latestPerMinor.set(key, { tag, patch, major, minor });
}
const older = [...latestPerMinor.entries()]
  .sort(([, a], [, b]) => b.major - a.major || b.minor - a.minor)
  .slice(0, MAX_VERSIONS);

/** Build docs của một ref (tag / nhánh) vào dist-docs/<sub>/. Trả về true nếu thành công. */
function buildRef(ref, sub, label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `yugen-docs-${sub.replace(/\W/g, "")}-`));
  try {
    console.log(`\n▶ docs ${label} → ${sub}`);
    run("git", ["worktree", "add", "--detach", dir, ref], root);
    // Danh sách người đóng góp vừa làm mới ở bản chính (pages.yml › Contributors) dùng chung cho bản có trang này.
    const contributors = "src/docs/contributors.json";
    if (fs.existsSync(path.join(dir, contributors))) fs.copyFileSync(path.join(root, contributors), path.join(dir, contributors));
    run("npm", ["ci", "--no-audit", "--no-fund"], dir);
    run("npm", ["run", "build:docs"], dir, { DOCS_BASE: `${base}${sub}` });
    fs.cpSync(path.join(dir, "dist-docs"), path.join(out, sub), { recursive: true });
    return true;
  } catch (error) {
    console.warn(`⚠ Bỏ qua ${label}: ${error.message}`);
    return false;
  } finally {
    try {
      run("git", ["worktree", "remove", "--force", dir], root);
    } catch {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}

const versions = [{ version: current, path: "" }];

// Kênh thử nghiệm: nhánh next (nếu có) → /next/ — docs của bản sắp ra.
const hasNext = (() => {
  try {
    execFileSync("git", ["rev-parse", "--verify", "--quiet", "origin/next"], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();
if (hasNext && buildRef("origin/next", "next/", "nhánh next")) versions.push({ version: "next", path: "next/" });

for (const [minor, { tag }] of older) {
  if (buildRef(tag, `v${minor}/`, tag)) versions.push({ version: minor, path: `v${minor}/` });
}

fs.writeFileSync(path.join(out, "versions.json"), JSON.stringify(versions, null, 2) + "\n");
console.log(`versions.json: ${versions.map((v) => v.version).join(", ")}`);
