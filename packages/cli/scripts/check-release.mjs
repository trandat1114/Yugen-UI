#!/usr/bin/env node
/**
 * Quy tắc phát hành `yugen` + `create-yugen-ui` (wiki › Release Process › CLI). Chạy trong CI và release-cli.yml.
 *
 *   node scripts/check-release.mjs                     # trước khi tag: version, CHANGELOG, phụ thuộc, template
 *   node scripts/check-release.mjs --npm               # thêm: version chưa từng dùng trên npm (cần mạng)
 *   node scripts/check-release.mjs --tag yugen@0.2.0   # như --npm, thêm: tag khớp version, đúng nhánh → in dist-tag
 *
 *   1. packages/cli/CHANGELOG.md có mục "## <version>".
 *   2. create-yugen-ui phụ thuộc "yugen": "^X.Y.Z" chấp nhận version hiện tại (0.x: ^0.1.0 không nhận 0.2.0).
 *   3. Template đóng gói ghim yugen-ui bằng ^<version yugen-ui ở gốc repo> (đã chạy sync-templates).
 *   4. --npm / --tag: version yugen chưa từng publish — kể cả bản đã unpublish (yugen@0.1.0 bị unpublish năm 2024 nên
 *      không dùng lại được); version create-yugen-ui không nằm trong danh sách đã unpublish.
 *   5. --tag: tag = yugen@<version>; bản ổn định tag trên main, prerelease trên next → "latest" / "next".
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(cli, "../..");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const args = process.argv.slice(2);
const tag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : undefined;
const checkNpm = !!tag || args.includes("--npm");

const errors = [];
const log = (msg) => (tag ? console.error(msg) : console.log(msg));

const pkg = readJson(path.join(cli, "package.json"));
const create = readJson(path.join(repo, "packages/create-yugen-ui/package.json"));
const lib = readJson(path.join(repo, "package.json"));
const { version } = pkg;
const parse = (v) => v.split("-")[0].split(".").map(Number);
const pre = version.includes("-");

// 1. CHANGELOG
const changelog = fs.readFileSync(path.join(cli, "CHANGELOG.md"), "utf8");
if (!new RegExp(`^##\\s+${version.replace(/\./g, "\\.")}\\s*$`, "m").test(changelog))
  errors.push(`packages/cli/CHANGELOG.md chưa có mục "## ${version}".`);

// 2. create-yugen-ui → yugen
function caretAccepts(range, v) {
  const m = range?.match(/^\^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b, c] = m.slice(1).map(Number);
  const [x, y, z] = parse(v);
  const gte = x !== a ? x > a : y !== b ? y > b : z >= c;
  if (!gte) return false;
  if (a > 0) return x === a;
  if (b > 0) return x === 0 && y === b;
  return x === 0 && y === 0 && z === c;
}
const range = create.dependencies?.yugen;
if (pre) log(`(prerelease ${version}: create-yugen-ui chỉ theo bản ổn định, bỏ qua kiểm tra phụ thuộc)`);
else if (!caretAccepts(range, version)) {
  const [x, y] = parse(version);
  errors.push(
    `packages/create-yugen-ui/package.json: "yugen": "${range}" không nhận ${version} — đổi thành "^${x}.${x === 0 ? y : 0}.0" và tăng version create-yugen-ui.`,
  );
}

// 3. Template ghim đúng bản yugen-ui hiện tại
const templates = readJson(path.join(repo, "templates/templates.json"));
for (const { dir } of templates) {
  const pinned = readJson(path.join(repo, "templates", dir, "package.json")).dependencies?.["yugen-ui"];
  if (pinned !== `^${lib.version}`)
    errors.push(`templates/${dir}: yugen-ui "${pinned}" ≠ "^${lib.version}" — chạy node scripts/sync-templates.mjs ở gốc repo.`);
}

// 4. Version chưa từng dùng trên npm
/**
 * Version từng publish của một gói, kể cả bản đã unpublish — `npm view name@x` trả 404 cho bản đã unpublish nên không
 * dùng được. Registry trả 404 kèm `time.unpublished` cho gói đã gỡ hết, 404 không có `time` cho gói chưa từng có.
 */
async function npmVersions(name) {
  const res = await fetch(`https://registry.npmjs.org/${name}`);
  if (!res.ok && res.status !== 404) throw new Error(`registry.npmjs.org/${name}: ${res.status}`);
  const doc = await res.json().catch(() => ({}));
  const time = doc.time ?? {};
  const unpublished = new Set(time.unpublished?.versions ?? []);
  const used = new Set([...Object.keys(doc.versions ?? {}), ...Object.keys(time).filter((k) => /^\d/.test(k)), ...unpublished]);
  return { used, unpublished };
}
if (checkNpm) {
  try {
    const cliVersions = await npmVersions("yugen");
    if (cliVersions.used.has(version))
      errors.push(
        `yugen@${version} đã từng được publish trên npm${cliVersions.unpublished.has(version) ? " rồi unpublish" : ""} — npm không cho dùng lại số phiên bản, tăng version.`,
      );
    const createVersions = await npmVersions("create-yugen-ui");
    if (createVersions.unpublished.has(create.version))
      errors.push(`create-yugen-ui@${create.version} đã bị unpublish trên npm — không dùng lại được, tăng version.`);
  } catch (e) {
    errors.push(`không đọc được registry npm (${e.message}).`);
  }
}

// 5. Tag
let distTag;
if (tag) {
  if (tag !== `yugen@${version}`) errors.push(`tag ${tag} không khớp packages/cli/package.json (yugen@${version}).`);
  const sh = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  let branches = [];
  try {
    branches = sh("git", ["branch", "-r", "--contains", process.env.GITHUB_SHA ?? "HEAD"])
      .split(/\s+/)
      .map((b) => b.replace(/^origin\//, ""))
      .filter(Boolean);
  } catch {
    // Không có git / lịch sử nông → báo lỗi bên dưới.
  }
  const want = pre ? "next" : "main";
  if (!branches.includes(want)) errors.push(`${pre ? "prerelease" : "bản ổn định"} ${tag} phải được tag trên ${want} (đang ở: ${branches.join(", ") || "?"}).`);
  distTag = pre ? "next" : "latest";
}

// exitCode thay vì process.exit(): thoát khi fetch còn giữ socket làm Node trên Windows crash (UV_HANDLE_CLOSING).
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exitCode = 1;
} else if (tag) console.log(distTag);
else
  console.log(`check-release (cli): OK — yugen ${version}, create-yugen-ui ${create.version} (yugen ${range}), templates → yugen-ui ^${lib.version}`);
