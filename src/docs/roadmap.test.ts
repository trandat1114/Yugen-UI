// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ROADMAP, roadmapMarkdown } from "./roadmap";

const root = path.resolve(__dirname, "../..");

describe("roadmap", () => {
  it("ROADMAP.md khớp src/docs/roadmap.ts", () => {
    const file = fs.readFileSync(path.join(root, "ROADMAP.md"), "utf8").replace(/\r\n/g, "\n");
    expect(file, "ROADMAP.md lệch roadmap.ts — chạy `npm run roadmap`").toBe(roadmapMarkdown());
  });

  it("mỗi bản phát hành có mục, hạn đúng dạng YYYY-MM-DD, đủ hai ngôn ngữ", () => {
    for (const release of Object.values(ROADMAP).flat()) {
      expect(release.items.length, release.milestone).toBeGreaterThan(0);
      if (release.due) expect(release.due, release.milestone).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const item of release.items) {
        expect(item.vi.trim(), `${release.milestone}: thiếu vi`).not.toBe("");
        expect(item.en.trim(), `${release.milestone}: thiếu en`).not.toBe("");
      }
    }
  });
});
