// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * E2E / Visual chạy trong image Playwright (trình duyệt + thư viện hệ thống có sẵn, không `apt` mỗi lần chạy).
 * Tag của image phải đúng phiên bản @playwright/test trong lockfile, nếu không Playwright báo thiếu trình duyệt. Một job
 * nhỏ đọc phiên bản đó từ package-lock.json, nên Dependabot nâng Playwright là image đổi theo; ghi cứng tag thì lần nâng
 * sau CI đỏ.
 */
const root = path.resolve(__dirname, "../..");
const WORKFLOWS = [".github/workflows/ci.yml", ".github/workflows/visual.yml", ".github/workflows/engines.yml"];
const IMAGE = /image:\s*mcr\.microsoft\.com\/playwright:(.+)$/gm;
const FROM_LOCKFILE = /^v\$\{\{ needs\.[\w-]+\.outputs\.[\w-]+ \}\}-noble$/;

describe("Playwright image trong CI", () => {
  it("tag image lấy từ package-lock.json, không ghi cứng", () => {
    const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8")) as {
      packages: Record<string, { version: string } | undefined>;
    };
    expect(lock.packages["node_modules/@playwright/test"]?.version).toMatch(/^\d+\.\d+\.\d+$/);
    for (const file of WORKFLOWS) {
      const tags = [...fs.readFileSync(path.join(root, file), "utf8").matchAll(IMAGE)].map((m) => m[1].trim());
      expect(tags.length, `${file}: không thấy image mcr.microsoft.com/playwright`).toBeGreaterThan(0);
      for (const tag of tags)
        expect(tag, `${file}: dùng v\${{ needs.<job>.outputs.<version> }}-noble thay cho tag ghi cứng`).toMatch(FROM_LOCKFILE);
    }
  });
});
