// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { releaseNotes } from "../../scripts/release-notes.mjs";

/** scripts/release-notes.mjs: nội dung GitHub Release do release.yml / release-cli.yml tạo từ CHANGELOG. */
const root = path.resolve(__dirname, "../..");

const CHANGELOG = `# Changelog

## 1.2.0

### Minor Changes

- 73aa98e: New thing.
  Second line.

### Patch Changes

- 7fb8afe: A fix.

## 1.1.0

- Older.

[1.2.0]: https://example.com/v1.2.0
`;

describe("release-notes", () => {
  it("lấy đúng mục, bỏ mã commit của Changesets", () => {
    expect(releaseNotes(CHANGELOG, "1.2.0")).toBe(
      "### Minor Changes\n\n- New thing.\n  Second line.\n\n### Patch Changes\n\n- A fix.",
    );
  });

  it("mục cuối file không kéo theo link tham chiếu; tiêu đề dạng [x.y.z] cũng được", () => {
    expect(releaseNotes(CHANGELOG, "1.1.0")).toBe("- Older.");
    expect(releaseNotes("## [2.0.0] - 2027-01-01\n\n- Big.\n", "2.0.0")).toBe("- Big.");
  });

  it("không có mục → null; 1.2.0 không khớp 1.2.01", () => {
    expect(releaseNotes(CHANGELOG, "9.9.9")).toBeNull();
    expect(releaseNotes("## 1.2.01\n\n- x\n", "1.2.0")).toBeNull();
  });

  it("CHANGELOG thật của bản hiện tại có nội dung", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    expect(releaseNotes(fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8"), pkg.version)).toMatch(/\S/);
    const cli = JSON.parse(fs.readFileSync(path.join(root, "packages/cli/package.json"), "utf8"));
    expect(releaseNotes(fs.readFileSync(path.join(root, "packages/cli/CHANGELOG.md"), "utf8"), cli.version)).toMatch(/\S/);
  });
});
