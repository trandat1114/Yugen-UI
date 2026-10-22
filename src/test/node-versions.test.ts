// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** scripts/node-versions.mjs trên một lịch cố định (không gọi mạng) — quy tắc ở #59. */
const root = path.resolve(__dirname, "../..");
const SCHEDULE = {
  "v0.12": { start: "2015-02-06", end: "2016-12-31" },
  v20: { start: "2023-04-18", lts: "2023-10-24", maintenance: "2024-10-22", end: "2026-04-30" },
  v22: { start: "2024-04-24", lts: "2024-10-29", maintenance: "2025-10-21", end: "2027-04-30" },
  v24: { start: "2025-05-06", lts: "2025-10-28", maintenance: "2026-10-20", end: "2028-04-30" },
  v25: { start: "2025-10-15", maintenance: "2026-04-01", end: "2026-06-01" },
  v26: { start: "2026-05-05", lts: "2026-10-28", maintenance: "2027-10-20", end: "2029-04-30" },
  v27: { alpha: "2026-10-28", start: "2027-04-22", lts: "2027-10-20", end: "2030-04-30" },
};

function run(today: string) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "node-schedule-")), "schedule.json");
  fs.writeFileSync(file, JSON.stringify(SCHEDULE));
  const out = execFileSync(process.execPath, [path.join(root, "scripts/node-versions.mjs"), "--schedule", file, "--today", today, "--json"], {
    encoding: "utf8",
  });
  return JSON.parse(out) as { matrix: number[]; lts: number };
}

describe("node-versions", () => {
  it("tháng 10/2026: 22, 24, 26; job một bản trên 24 cho tới khi 26 thành LTS", () => {
    expect(run("2026-10-23")).toEqual({ matrix: [22, 24, 26], lts: 24 });
    expect(run("2026-10-28")).toEqual({ matrix: [22, 24, 26], lts: 26 });
  });

  it("bỏ bản EOL, thêm bản Current mới; bản lẻ (25) chỉ có khi còn hỗ trợ", () => {
    expect(run("2026-03-01")).toEqual({ matrix: [20, 22, 24, 25], lts: 24 });
    expect(run("2027-05-01")).toEqual({ matrix: [24, 26, 27], lts: 26 });
  });
});
