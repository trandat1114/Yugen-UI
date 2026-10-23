#!/usr/bin/env node
/**
 * Tỉ lệ tải React theo bản major trong 7 ngày gần nhất (npm) — điều kiện ngừng hỗ trợ React 18 ở issue #62.
 *
 *   node scripts/react-share.mjs                  # in bảng Markdown (workflow react-share.yml bình luận vào #62)
 *   node scripts/react-share.mjs --json           # { total, majors: { "19": 0.71, … }, react18, threshold }
 *   --downloads <file.json> --today YYYY-MM-DD    # dùng file / ngày cho trước thay cho mạng / hôm nay (test)
 *
 * Chỉ tính bản phát hành (x.y.z, không canary / experimental / rc). Điều kiện: React 18 dưới THRESHOLD lượt tải — một
 * trong hai điều kiện của #62 (điều kiện còn lại: 1.0, hoặc hai bản minor sau thông báo).
 */
import fs from "node:fs";

const URL = "https://api.npmjs.org/versions/react/last-week";
const THRESHOLD = 0.1;

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

/** { "18.3.1": n, "19.0.0-rc…": m, … } → tỉ lệ theo major, chỉ bản ổn định. */
function majorShares(downloads) {
  const byMajor = {};
  let total = 0;
  for (const [version, count] of Object.entries(downloads)) {
    const m = /^(\d+)\.\d+\.\d+$/.exec(version);
    if (!m) continue;
    byMajor[m[1]] = (byMajor[m[1]] ?? 0) + count;
    total += count;
  }
  const majors = Object.fromEntries(Object.entries(byMajor).map(([major, count]) => [major, total ? count / total : 0]));
  return { total, majors, react18: majors["18"] ?? 0, threshold: THRESHOLD };
}

const pct = (n) => `${(n * 100).toFixed(1)}%`;

function report({ total, majors, react18, threshold }, day) {
  // Khoá dạng số của object luôn theo thứ tự tăng dần: sắp lại để bản mới nhất lên đầu.
  const rows = Object.entries(majors)
    .sort(([a], [b]) => Number(b) - Number(a))
    .filter(([, share]) => share >= 0.005)
    .map(([major, share]) => `| ${major} | ${pct(share)} |`);
  const met = react18 < threshold;
  return [
    `### React downloads by major, week ending ${day}`,
    "",
    "| Major | Share |",
    "|---|---|",
    ...rows,
    "",
    `Stable releases only, ${total.toLocaleString("en-US")} downloads in total (npm, last 7 days).`,
    "",
    met
      ? `React 18 is at **${pct(react18)}**, under the ${pct(threshold)} line, so the download condition of #62 is met. The other condition (1.0, or two minors after the announcement) still applies.`
      : `React 18 is at **${pct(react18)}**, above the ${pct(threshold)} line, so React 18 stays supported.`,
  ].join("\n");
}

const file = opt("--downloads");
const data = file ? JSON.parse(fs.readFileSync(file, "utf8")) : await (await fetch(URL)).json();
const shares = majorShares(data.downloads ?? {});
console.log(args.includes("--json") ? JSON.stringify(shares) : report(shares, opt("--today") ?? new Date().toISOString().slice(0, 10)));
