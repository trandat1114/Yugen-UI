// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** `yugen theme` (packages/cli) chép nguyên văn src/lib/brandRamp.ts để CLI không phụ thuộc gói yugen-ui. */
const root = path.resolve(__dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");

describe("brandRamp của CLI", () => {
  it("giống hệt src/lib/brandRamp.ts — sửa bản gốc thì chép lại: cp src/lib/brandRamp.ts packages/cli/src/lib/", () => {
    expect(read("packages/cli/src/lib/brandRamp.ts")).toBe(read("src/lib/brandRamp.ts"));
  });
});
