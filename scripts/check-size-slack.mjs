#!/usr/bin/env node
/**
 * Ngân sách dung lượng không được lỏng (#360). Chạy size-limit (`--json`) trên dist/ đã build và báo lỗi khi `limit`
 * của một mục cao hơn kích thước đo được quá 20% (và quá 0.5 kB, bước làm tròn của .size-limit.cjs, để mục nhỏ không
 * vướng): PR làm một mục nhỏ đi phải hạ `limit` của mục đó luôn, nếu không lần tăng sau sẽ lọt qua mà không ai thấy.
 * Mục vượt `limit` cũng báo lỗi (như `npm run size`).
 *
 *   npm run build:lib && node scripts/check-size-slack.mjs
 *   node scripts/check-size-slack.mjs size.json      # đọc kết quả `npx size-limit --json > size.json` có sẵn
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_SLACK = 0.2;
const MIN_SLACK_BYTES = 500;

function measure() {
  const file = process.argv[2];
  if (file) return fs.readFileSync(path.resolve(file), "utf8");
  const bin = path.join(root, "node_modules", "size-limit", "bin.js");
  const run = spawnSync(process.execPath, [bin, "--json"], { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (run.error) throw run.error;
  // size-limit thoát với mã 1 khi một mục vượt giới hạn nhưng vẫn in JSON; không có JSON là lỗi thật.
  if (!run.stdout.trim()) {
    process.stderr.write(run.stderr);
    process.exit(run.status || 1);
  }
  return run.stdout;
}

const results = JSON.parse(measure());
const kB = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;
/** Giới hạn theo quy tắc của .size-limit.cjs: đo được + 8%, làm tròn lên 0.5 kB. */
const suggested = (size) => `${Math.ceil((size * 1.08) / 500) / 2} kB`;

const problems = [];
for (const r of results) {
  if (r.error) problems.push(`${r.name}: ${r.error}`);
  if (typeof r.size !== "number" || typeof r.sizeLimit !== "number") continue;
  const slack = (r.sizeLimit - r.size) / r.size;
  const row = `${r.name.padEnd(48)} ${kB(r.size).padStart(10)} / ${kB(r.sizeLimit).padStart(10)}   ${(slack >= 0 ? "+" : "") + (slack * 100).toFixed(1)}%`;
  console.log(row);
  if (r.passed === false || r.size > r.sizeLimit) {
    problems.push(`${r.name}: ${kB(r.size)} is over its limit of ${kB(r.sizeLimit)}.`);
  } else if (slack > MAX_SLACK && r.sizeLimit - r.size > MIN_SLACK_BYTES) {
    problems.push(
      `${r.name}: the limit (${kB(r.sizeLimit)}) is ${(slack * 100).toFixed(0)}% above the measured ${kB(r.size)}. ` +
        `Lower it in .size-limit.cjs to ${suggested(r.size)} (measured + 8%, rounded up to 0.5 kB).`,
    );
  }
}

if (problems.length) {
  console.error(`\n${problems.length} size budget problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nEvery limit is within ${MAX_SLACK * 100}% of its measured size.`);
