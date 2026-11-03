#!/usr/bin/env node
/**
 * Mức sàn test cho mỗi thư mục component (#167), ghi trong scripts/test-floor.json:
 *   - `pending`: thư mục chưa có file test (danh sách chỉ được rút ngắn). Thư mục mới không có test → lỗi.
 *   - `coverage`: % dòng được test chạy qua, theo thư mục. Thấp hơn mức sàn (trừ 0.5 điểm dao động) → lỗi.
 *
 *   node scripts/check-test-floor.mjs            # kiểm tra (đọc coverage/coverage-summary.json nếu có)
 *   node scripts/check-test-floor.mjs --write    # nâng mức sàn lên mức hiện tại, bỏ thư mục đã có test khỏi `pending`
 *
 * Coverage: `npx vitest run --coverage` (vitest.config.ts › coverage) — CI chạy trong job Unit tests.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const uiDir = path.join(root, "src", "components", "ui");
const floorFile = path.join(root, "scripts", "test-floor.json");
const summaryFile = path.join(root, "coverage", "coverage-summary.json");
const write = process.argv.includes("--write");
const TOLERANCE = 0.5;

const floor = fs.existsSync(floorFile) ? JSON.parse(fs.readFileSync(floorFile, "utf8")) : { pending: [], coverage: {} };
const folders = fs
  .readdirSync(uiDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
const hasTests = (folder) => fs.readdirSync(path.join(uiDir, folder)).some((f) => /\.test\.tsx?$/.test(f));

const errors = [];
const untested = folders.filter((f) => !hasTests(f));
for (const f of untested) if (!floor.pending.includes(f)) errors.push(`${f}: thư mục component mới chưa có test (${f}/${f}.test.tsx).`);
const nowTested = floor.pending.filter((f) => !untested.includes(f));

/** % dòng theo thư mục, gộp từ coverage-summary.json (đường dẫn tuyệt đối → thư mục dưới components/ui). */
let current = null;
if (fs.existsSync(summaryFile)) {
  const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8"));
  const byFolder = {};
  for (const [file, data] of Object.entries(summary)) {
    if (file === "total") continue;
    // Đường dẫn tuyệt đối của máy đã chạy coverage (vd. artifact từ CI Linux) → cắt từ src/components/ui/.
    const at = file.replaceAll("\\", "/").lastIndexOf("/src/components/ui/");
    if (at < 0) continue;
    const rel = file.replaceAll("\\", "/").slice(at + "/src/components/ui/".length).split("/");
    if (rel.length < 2) continue;
    const acc = (byFolder[rel[0]] ??= { covered: 0, total: 0 });
    acc.covered += data.lines.covered;
    acc.total += data.lines.total;
  }
  current = Object.fromEntries(
    Object.entries(byFolder)
      .filter(([, v]) => v.total > 0)
      .map(([k, v]) => [k, Math.floor((v.covered / v.total) * 1000) / 10]),
  );
  for (const [folder, min] of Object.entries(floor.coverage)) {
    const pct = current[folder];
    if (pct !== undefined && pct < min - TOLERANCE) errors.push(`${folder}: coverage ${pct}% < mức sàn ${min}%.`);
  }
}

if (write) {
  floor.pending = untested;
  if (current) for (const [folder, pct] of Object.entries(current)) floor.coverage[folder] = Math.max(floor.coverage[folder] ?? 0, pct);
  floor.coverage = Object.fromEntries(Object.entries(floor.coverage).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(floorFile, JSON.stringify(floor, null, 2) + "\n");
  console.log(`test-floor: ghi ${path.relative(root, floorFile)} — ${untested.length} thư mục chưa có test, ${Object.keys(floor.coverage).length} mức coverage.`);
  process.exit(0);
}

const lines = [
  `### Test floor (#167)`,
  ``,
  `${folders.length - untested.length} / ${folders.length} component folders have tests; ${untested.length} pending.`,
];
if (current) {
  const pcts = Object.values(current);
  lines.push(`Line coverage by folder: median ${pcts.sort((a, b) => a - b)[Math.floor(pcts.length / 2)]}%.`);
}
if (nowTested.length) lines.push(``, `Now tested, remove from \`pending\` (\`node scripts/check-test-floor.mjs --write\`): ${nowTested.join(", ")}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
console.log(lines.join("\n"));
if (nowTested.length) errors.push(`pending còn ${nowTested.join(", ")} dù đã có test — chạy với --write để rút danh sách.`);
if (errors.length) {
  console.error(`\n✗ ${errors.join("\n✗ ")}`);
  process.exit(1);
}
