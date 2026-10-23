import { describe, expect, it } from "vitest";
import { META_EN } from "./BlocksPage";

// Mỗi block trong src/docs/block-library có tên và mô tả tiếng Anh (trang Blocks bản /en/).
const files = Object.keys(import.meta.glob("../block-library/*.tsx")).map((p) => p.replace(/^.*\/(.+)\.tsx$/, "$1"));

describe("Blocks bản tiếng Anh", () => {
  it("mọi block có tên và mô tả tiếng Anh", () => {
    expect(Object.keys(META_EN).sort()).toEqual(files.sort());
    for (const [file, { title, description }] of Object.entries(META_EN)) {
      expect(title.trim(), file).not.toBe("");
      expect(description.trim(), file).not.toBe("");
    }
  });
});
