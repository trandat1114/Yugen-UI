import { describe, expect, it } from "vitest";
import { META_VI } from "./BlocksPage";

// Mỗi block trong src/docs/block-library có tên và mô tả tiếng Việt (trang Blocks bản /vi/); `meta` trong file là tiếng Anh.
const files = Object.keys(import.meta.glob("../block-library/*.tsx")).map((p) => p.replace(/^.*\/(.+)\.tsx$/, "$1"));

describe("Blocks bản tiếng Việt", () => {
  it("mọi block có tên và mô tả tiếng Việt", () => {
    expect(Object.keys(META_VI).sort()).toEqual(files.sort());
    for (const [file, { title, description }] of Object.entries(META_VI)) {
      expect(title.trim(), file).not.toBe("");
      expect(description.trim(), file).not.toBe("");
    }
  });
});
