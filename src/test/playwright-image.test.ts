// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * E2E / Visual chạy trong image Playwright (trình duyệt + thư viện hệ thống có sẵn, không `apt` mỗi lần chạy).
 * Tag của image phải đúng phiên bản @playwright/test trong lockfile, nếu không Playwright báo thiếu trình duyệt.
 */
const root = path.resolve(__dirname, "../..");
const WORKFLOWS = [".github/workflows/ci.yml", ".github/workflows/visual.yml", ".github/workflows/engines.yml"];
const IMAGE = /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-\w+/g;

describe("Playwright image trong CI", () => {
  it("tag image khớp @playwright/test trong package-lock.json", () => {
    const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8")) as {
      packages: Record<string, { version: string }>;
    };
    const version = lock.packages["node_modules/@playwright/test"].version;
    for (const file of WORKFLOWS) {
      const tags = [...fs.readFileSync(path.join(root, file), "utf8").matchAll(IMAGE)].map((m) => m[1]);
      expect(tags.length, `${file}: không thấy image mcr.microsoft.com/playwright`).toBeGreaterThan(0);
      expect(tags, `${file}: đổi image thành mcr.microsoft.com/playwright:v${version}-noble`).toEqual(tags.map(() => version));
    }
  });
});
