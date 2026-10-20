#!/usr/bin/env node
/**
 * Kiểm tra phiên bản nhất quán trước khi phát hành (`npm run check:release`; CI và workflow release đều chạy).
 *
 *   (a) `version` trong package.json = `version` của mục ĐẦU TIÊN trong mảng NEWS (src/docs/news.ts).
 *   (b) CHANGELOG.md có tiêu đề cho phiên bản đó: `## [x.y.z]` (Keep a Changelog) hoặc `## x.y.z` (Changesets).
 *   (c) CHANGELOG.md có link `[x.y.z]: …` — chỉ cảnh báo, và bỏ qua khi tiêu đề ở dạng Changesets.
 *   (d) Khi có tag (`--tag vX.Y.Z`, hoặc GITHUB_REF_NAME bắt đầu bằng "v" trong workflow chạy theo tag): tag = "v" + version.
 *
 * Không có dependency. Thoát mã 1 kèm thông báo rõ ràng khi có lỗi; in một dòng OK khi mọi thứ khớp.
 *
 *   node scripts/check-release.mjs [--tag v0.6.0]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (file) => path.relative(root, file).split(path.sep).join("/");
const errors = [];
const warnings = [];

const read = (file) => {
  try {
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  } catch (e) {
    errors.push(`Không đọc được ${rel(file)}: ${e.message}`);
    return "";
  }
};
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- package.json ----------
const pkgPath = path.join(root, "package.json");
let version = "";
try {
  version = String(JSON.parse(read(pkgPath)).version ?? "");
} catch (e) {
  errors.push(`package.json không phải JSON hợp lệ: ${e.message}`);
}
if (version && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  errors.push(`package.json: version "${version}" không đúng SemVer (x.y.z[-pre]).`);
}

// ---------- (a) src/docs/news.ts ----------
const newsPath = path.join(root, "src/docs/news.ts");
const news = read(newsPath);
const newsStart = news.search(/export\s+const\s+NEWS\b[^=]*=\s*\[/);
let newsVersion = "";
if (news && newsStart === -1) {
  errors.push(`${rel(newsPath)}: không tìm thấy \`export const NEWS … = [\`.`);
} else if (news) {
  const m = news.slice(newsStart).match(/\bversion\s*:\s*["'`]([^"'`]+)["'`]/);
  if (!m) errors.push(`${rel(newsPath)}: mảng NEWS không có mục nào có \`version: "x.y.z"\`.`);
  else newsVersion = m[1];
}
if (version && newsVersion && newsVersion !== version) {
  errors.push(
    `${rel(newsPath)}: mục đầu tiên của NEWS là "${newsVersion}" nhưng package.json là "${version}". ` +
      `Thêm mục mới vào ĐẦU mảng NEWS cho ${version}.`,
  );
}

// ---------- (b) + (c) CHANGELOG.md ----------
const changelogPath = path.join(root, "CHANGELOG.md");
const changelog = read(changelogPath);
if (version && changelog) {
  const v = escape(version);
  const keepAChangelog = new RegExp(`^##\\s+\\[${v}\\](?=\\s|$)`, "m").test(changelog);
  const changesets = new RegExp(`^##\\s+${v}(?=\\s|$)`, "m").test(changelog);
  if (!keepAChangelog && !changesets) {
    errors.push(
      `${rel(changelogPath)}: thiếu tiêu đề cho ${version} — cần "## [${version}] - YYYY-MM-DD" hoặc "## ${version}" ` +
        `(chạy \`npx changeset version\`).`,
    );
  } else if (keepAChangelog && !new RegExp(`^\\[${v}\\]:\\s*\\S+`, "m").test(changelog)) {
    warnings.push(`${rel(changelogPath)}: thiếu link "[${version}]: https://github.com/…/releases/tag/v${version}" ở cuối file.`);
  }
}

// ---------- (d) tag ----------
const args = process.argv.slice(2);
let tag = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tag") tag = args[++i] ?? "";
  else if (args[i].startsWith("--tag=")) tag = args[i].slice("--tag=".length);
}
if (args.includes("--tag") && !tag) errors.push("--tag cần một giá trị, vd. --tag v1.2.3.");
const refName = process.env.GITHUB_REF_NAME ?? "";
const refType = process.env.GITHUB_REF_TYPE ?? "";
if (!tag && refName.startsWith("v") && (refType === "" || refType === "tag")) tag = refName;
if (tag && version && tag !== `v${version}`) {
  errors.push(`Tag "${tag}" không khớp package.json — cần "v${version}".`);
}

// ---------- Kết quả ----------
for (const w of warnings) console.warn(`check-release: cảnh báo — ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`check-release: LỖI — ${e}`);
  console.error(`check-release: ${errors.length} lỗi. Xem quy trình "Phát hành phiên bản" trong Design.md §8.`);
  process.exit(1);
}
console.log(
  `check-release: OK — yugen-ui v${version} (package.json = news.ts = CHANGELOG.md${tag ? ` = tag ${tag}` : ""}` +
    `${warnings.length ? `, ${warnings.length} cảnh báo` : ""}).`,
);
