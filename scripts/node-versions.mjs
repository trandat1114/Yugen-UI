#!/usr/bin/env node
/**
 * Bản Node.js CI cần chạy, theo lịch phát hành chính thức (nodejs/Release › schedule.json) — issue #59.
 *
 *   node scripts/node-versions.mjs           # so workflow với lịch; exit 1 nếu lệch
 *   node scripts/node-versions.mjs --write   # sửa workflow cho khớp (.github/workflows/node-versions.yml mở PR)
 *   node scripts/node-versions.mjs --json    # chỉ in { matrix, lts }
 *   --schedule <file.json> --today YYYY-MM-DD   # dùng file / ngày cho trước thay cho mạng / hôm nay (test)
 *
 * Quy tắc: ma trận (`node: [...]` của Build, CLI) = mọi bản đã phát hành và chưa EOL (LTS + Current);
 * job chạy một bản (`node-version: N`) = bản Active LTS mới nhất. `engines` của CLI không tự đổi (đổi là bản minor của
 * CLI) — script chỉ nhắc khi bản cũ nhất trong ma trận đã cao hơn `engines`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEDULE_URL = "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOWS = path.join(root, ".github/workflows");

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const write = args.includes("--write");
const json = args.includes("--json");
const today = opt("--today") ?? new Date().toISOString().slice(0, 10);

/** Bản đang hỗ trợ (đã phát hành, chưa EOL) và Active LTS mới nhất tại `today`. */
export function supportedNode(schedule, day) {
  const lines = Object.entries(schedule)
    .map(([key, v]) => ({ major: Number(/^v(\d+)$/.exec(key)?.[1]), ...v }))
    .filter((v) => Number.isInteger(v.major) && v.start && v.start <= day && day < v.end);
  const matrix = lines.map((v) => v.major).sort((a, b) => a - b);
  const lts = Math.max(...lines.filter((v) => v.lts && v.lts <= day).map((v) => v.major));
  return { matrix, lts };
}

const schedule = opt("--schedule")
  ? JSON.parse(fs.readFileSync(opt("--schedule"), "utf8"))
  : await fetch(SCHEDULE_URL).then((r) => {
      if (!r.ok) throw new Error(`${SCHEDULE_URL}: HTTP ${r.status}`);
      return r.json();
    });
const want = supportedNode(schedule, today);

if (json) {
  console.log(JSON.stringify(want));
  process.exit(0);
}

const MATRIX = /^(\s+node:\s*)\[([\d,\s]+)\]/gm;
const SINGLE = /^(\s+node-version:\s*)(\d+)\s*$/gm;
const changes = [];
for (const name of fs.readdirSync(WORKFLOWS).filter((f) => /\.ya?ml$/.test(f))) {
  const file = path.join(WORKFLOWS, name);
  const before = fs.readFileSync(file, "utf8");
  const after = before
    .replace(MATRIX, (all, head, list) => {
      const have = list.split(",").map((s) => Number(s.trim()));
      if (have.join() === want.matrix.join()) return all;
      changes.push(`${name}: matrix [${have.join(", ")}] → [${want.matrix.join(", ")}]`);
      return `${head}[${want.matrix.join(", ")}]`;
    })
    .replace(SINGLE, (all, head, v) => {
      if (Number(v) === want.lts) return all;
      changes.push(`${name}: node-version ${v} → ${want.lts}`);
      return `${head}${want.lts}`;
    });
  if (write && after !== before) fs.writeFileSync(file, after);
}

const engines = JSON.parse(fs.readFileSync(path.join(root, "packages/cli/package.json"), "utf8")).engines?.node ?? "";
const enginesMin = Number(/(\d+)/.exec(engines)?.[1]);
const notes = enginesMin < want.matrix[0] ? [`@yugen-ui/cli engines "${engines}" is below the oldest tested line (${want.matrix[0]}); raise it in a CLI minor.`] : [];

console.log(`Node.js schedule on ${today}: test ${want.matrix.join(", ")}; single-version jobs on ${want.lts} (newest Active LTS).`);
for (const line of [...changes, ...notes]) console.log(`- ${line}`);
if (changes.length === 0) console.log("Workflows already match.");
if (changes.length > 0 && !write) process.exit(1);
