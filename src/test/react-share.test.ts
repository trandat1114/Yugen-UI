// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** scripts/react-share.mjs trên số liệu cố định (không gọi mạng) — điều kiện ngừng hỗ trợ React 18 ở #62. */
const root = path.resolve(__dirname, "../..");

function run(downloads: Record<string, number>, ...flags: string[]) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "react-share-")), "downloads.json");
  fs.writeFileSync(file, JSON.stringify({ package: "react", downloads }));
  return execFileSync(process.execPath, ["scripts/react-share.mjs", "--downloads", file, "--today", "2026-11-01", ...flags], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("react-share", () => {
  it("chỉ tính bản ổn định, gộp theo major", () => {
    const out = JSON.parse(
      run({ "19.2.0": 600, "19.1.1": 200, "18.3.1": 150, "18.2.0": 50, "19.3.0-canary-abc": 999, "0.0.0-experimental-x": 5 }, "--json"),
    );
    expect(out.total).toBe(1000);
    expect(out.majors).toEqual({ "18": 0.2, "19": 0.8 });
    expect(out.react18).toBe(0.2);
  });

  it("bảng Markdown: bản mới nhất lên đầu; báo React 18 còn được hỗ trợ khi trên ngưỡng", () => {
    const out = run({ "19.2.0": 780, "18.3.1": 200, "17.0.2": 20 });
    expect(out).toContain("week ending 2026-11-01");
    expect(out.indexOf("| 19 | 78.0% |")).toBeLessThan(out.indexOf("| 18 | 20.0% |"));
    expect(out).toContain("above the 10.0% line, so React 18 stays supported");
  });

  it("dưới 10%: điều kiện lượt tải của #62 đạt", () => {
    expect(run({ "19.2.0": 950, "18.3.1": 50 })).toContain("under the 10.0% line, so the download condition of #62 is met");
  });
});
