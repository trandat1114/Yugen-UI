// @vitest-environment node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { classify, plan } from "../../scripts/prune-branches.mjs";

/** scripts/prune-branches.mjs trên dữ liệu cố định (không gọi GitHub) — luật ở wiki › Branching › Dọn nhánh. */
const root = path.resolve(__dirname, "../..");
const today = new Date("2026-11-01T00:00:00Z");

const branch = (name: string, extra: Record<string, unknown> = {}) => ({
  name,
  sha: "a".repeat(40),
  date: "2026-10-30T00:00:00Z",
  inBase: false,
  prs: [],
  ...extra,
});
const pr = (number: number, state: string, extra: Record<string, unknown> = {}) => ({
  number,
  state,
  headSha: "a".repeat(40),
  closedAt: "2026-10-30T00:00:00Z",
  ...extra,
});
const action = (b: ReturnType<typeof branch>) => classify(b, { today }).action;

describe("prune-branches", () => {
  it("không bao giờ xoá nhánh dài hạn, kể cả khi đã nằm trong main", () => {
    for (const name of ["main", "next", "canary", "gh-pages", "release/0.10"])
      expect(action(branch(name, { inBase: true, date: "2020-01-01T00:00:00Z" }))).toBe("keep");
    expect(classify(branch("develop", { inBase: true }), { today, defaultBranch: "develop" }).action).toBe("keep");
  });

  it("giữ nhánh có PR đang mở", () => {
    expect(action(branch("feat/x", { inBase: true, prs: [pr(1, "OPEN")] }))).toBe("keep");
  });

  it("xoá nhánh có PR đã merge đúng commit cuối, hoặc commit đã nằm trong main / next", () => {
    expect(action(branch("feat/x", { prs: [pr(2, "MERGED")] }))).toBe("delete");
    expect(action(branch("chore/y", { inBase: true }))).toBe("delete");
  });

  it("có commit sau khi PR merge → cần xem, không tự xoá", () => {
    expect(action(branch("feat/x", { prs: [pr(3, "MERGED", { headSha: "b".repeat(40) })] }))).toBe("review");
  });

  it("PR đóng không merge: xoá sau 14 ngày", () => {
    expect(action(branch("feat/x", { prs: [pr(4, "CLOSED", { closedAt: "2026-10-25T00:00:00Z" })] }))).toBe("keep");
    expect(action(branch("feat/x", { prs: [pr(4, "CLOSED", { closedAt: "2026-10-10T00:00:00Z" })] }))).toBe("delete");
  });

  it("không có PR: cần xem sau 30 ngày (exp/ sau 60), trước đó giữ", () => {
    expect(action(branch("feat/x", { date: "2026-10-20T00:00:00Z" }))).toBe("keep");
    expect(action(branch("feat/x", { date: "2026-09-20T00:00:00Z" }))).toBe("review");
    expect(action(branch("exp/x", { date: "2026-09-20T00:00:00Z" }))).toBe("keep");
    expect(action(branch("exp/x", { date: "2026-08-20T00:00:00Z" }))).toBe("review");
  });

  it("chỉ dựa vào PR mới nhất của nhánh", () => {
    expect(action(branch("feat/x", { prs: [pr(6, "CLOSED", { closedAt: "2026-10-31T00:00:00Z" }), pr(5, "MERGED")] }))).toBe("keep");
  });

  it("plan gom theo kết luận, sắp theo tên", () => {
    const result = plan([branch("b", { inBase: true }), branch("a", { inBase: true }), branch("main")], { today });
    expect(result.delete.map((r: { name: string }) => r.name)).toEqual(["a", "b"]);
    expect(result.keep.map((r: { name: string }) => r.name)).toEqual(["main"]);
  });

  it("CLI với --branches chỉ in báo cáo, không xoá", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "prune-")), "branches.json");
    fs.writeFileSync(file, JSON.stringify({ defaultBranch: "main", branches: [branch("main"), branch("feat/done", { prs: [pr(7, "MERGED")] })] }));
    const out = execFileSync(process.execPath, ["scripts/prune-branches.mjs", "--branches", file, "--today", "2026-11-01", "--apply"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(out).toContain("## Dọn nhánh: xoá 1, cần xem 0, giữ 1");
    expect(out).toContain("| `feat/done` | 2026-10-30 | PR #7 đã merge |");
    expect(out).not.toContain("Đã xoá");
  });
});
