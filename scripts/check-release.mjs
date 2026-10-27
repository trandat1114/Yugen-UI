#!/usr/bin/env node
/**
 * Kiểm tra phiên bản nhất quán trước khi phát hành (`npm run check:release`; CI và workflow release đều chạy).
 *
 *   (a) `version` trong package.json = `version` của mục ĐÃ PHÁT HÀNH đầu tiên trong mảng NEWS (src/docs/news.ts).
 *       Mục đầu có thể là tin sắp phát hành (`upcoming: true`, viết trên next) với version lớn hơn package.json;
 *       khi có tag thì không được còn mục `upcoming`.
 *   (b) CHANGELOG.md có tiêu đề cho phiên bản đó: `## [x.y.z]` (Keep a Changelog) hoặc `## x.y.z` (Changesets).
 *   (c) CHANGELOG.md có link `[x.y.z]: …` — chỉ cảnh báo, và bỏ qua khi tiêu đề ở dạng Changesets.
 *   (d) Khi có tag (`--tag vX.Y.Z`, hoặc GITHUB_REF_NAME bắt đầu bằng "v" trong workflow chạy theo tag): tag = "v" + version.
 *   (e) Bản major ổn định (1.0.0, 2.0.0…): README.md có `<!-- readme-reviewed: X.0.0 -->` — đã rà README cho bản này
 *       (wiki › Release Process › Bản major), kể cả khi không phải sửa gì.
 *   (f) Quy tắc cho từng số (scripts/release-rules.mjs) với mục NEWS của bản hiện tại và tin sắp phát hành: patch không
 *       có mục "new" / "breaking", minor có mục "new", major có mục "breaking", không nhảy số, nhịp minor / major.
 *
 * Không có dependency. Thoát mã 1 kèm thông báo rõ ràng khi có lỗi; in một dòng OK khi mọi thứ khớp.
 *
 *   node scripts/check-release.mjs [--tag v0.6.0]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { core, newsEntries, releaseRuleErrors } from "./release-rules.mjs";

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
/** Các mục của NEWS theo thứ tự (mới trước): version, `upcoming` (viết ngay sau version), date, kind của từng tin. */
const parsed = news ? newsEntries(news, "NEWS") : [];
const entries = parsed ?? [];
if (!parsed) errors.push(`${rel(newsPath)}: không tìm thấy \`export const NEWS … = [\`.`);
else if (news && entries.length === 0) errors.push(`${rel(newsPath)}: mảng NEWS không có mục nào có \`version: "x.y.z"\`.`);
const upcoming = entries[0]?.upcoming ? entries[0] : undefined;
const newsVersion = entries.find((e) => !e.upcoming)?.version ?? "";
const greater = (a, b) => {
  const [x, y] = [core(a), core(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};
if (entries.slice(1).some((e) => e.upcoming)) {
  errors.push(`${rel(newsPath)}: chỉ mục ĐẦU của NEWS được đánh dấu \`upcoming: true\`.`);
}
// Tin cho bản sắp phát hành (viết trên next): version phải lớn hơn package.json. Commit chore(release) bỏ `upcoming`.
if (upcoming && version && !greater(upcoming.version, version)) {
  errors.push(
    `${rel(newsPath)}: mục "${upcoming.version}" vẫn đánh dấu \`upcoming\` nhưng package.json đã là "${version}". ` +
      `Trong commit chore(release): bỏ \`upcoming\`, điền ngày phát hành.`,
  );
}
// Prerelease (0.7.0-next.1, canary…) không cần mục News riêng — trang Có gì mới chỉ ghi bản ổn định.
const isPrerelease = version.includes("-");
if (version && newsVersion && newsVersion !== version && !(isPrerelease && newsVersion !== "")) {
  errors.push(
    `${rel(newsPath)}: mục đã phát hành đầu tiên của NEWS là "${newsVersion}" nhưng package.json là "${version}". ` +
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
if (tag && upcoming) {
  errors.push(`Tag "${tag}": mục NEWS "${upcoming.version}" vẫn là \`upcoming\` — chốt tin trước khi phát hành.`);
}

// ---------- (e) README cho bản major ----------
// README là trang đầu trên GitHub và npm: bản major đổi cài đặt, yêu cầu và API nên phải rà lại. Dấu ghi nhận việc đã rà,
// không bắt sửa nếu không cần. Minor, patch và prerelease không cần.
const [major, minor, patch] = version ? core(version) : [];
if (version && !isPrerelease && major >= 1 && minor === 0 && patch === 0) {
  const readmePath = path.join(root, "README.md");
  const reviewed = read(readmePath).match(/<!--\s*readme-reviewed:\s*(\S+)\s*-->/)?.[1];
  if (reviewed !== version)
    errors.push(
      `${rel(readmePath)}: bản major ${version} — rà README (cài đặt, yêu cầu, ví dụ, danh sách tính năng, link docs và ` +
        `hướng dẫn chuyển đổi), sửa nếu cần, rồi ghi \`<!-- readme-reviewed: ${version} -->\` ở đầu file` +
        `${reviewed ? ` (đang là ${reviewed})` : ""}. Xem wiki › Release Process › Bản major.`,
    );
}

// ---------- (f) Quy tắc cho từng số ----------
// Kiểm cả tin sắp phát hành trên next, để biết sớm thay vì tới PR release.
for (const [i, entry] of entries.entries()) {
  if (entry.upcoming || entry.version === version) errors.push(...releaseRuleErrors(entry, entries.slice(i + 1), "NEWS"));
  if (!entry.upcoming) break;
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
    `${upcoming ? `; tin sắp phát hành ${upcoming.version}` : ""}${warnings.length ? `, ${warnings.length} cảnh báo` : ""}).`,
);
