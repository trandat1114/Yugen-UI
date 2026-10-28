import { describe, expect, it } from "vitest";
import { kanjiDigits } from "../boot/kanji";
import { STATUS_COPY, STATUSES } from "./catalog";

describe("danh mục trang trạng thái", () => {
  it("mỗi trạng thái có mã hoặc chữ dọc, và đủ nội dung vi / en", () => {
    expect(new Set(STATUSES.map((s) => s.id)).size).toBe(STATUSES.length);
    for (const s of STATUSES) {
      expect(Boolean(s.code) !== Boolean(s.word), s.id).toBe(true);
      if (s.stroke === "wait") expect(s.wait, s.id).toBeGreaterThan(0);
      for (const lang of ["vi", "en"] as const) {
        const copy = STATUS_COPY[lang][s.id];
        for (const key of ["eyebrow", "title", "description", "primary", "when"] as const) expect(copy[key].trim(), `${lang} ${s.id} ${key}`).not.toBe("");
        if (s.code) expect(copy.eyebrow, `${lang} ${s.id}`).toContain(String(s.code));
        expect(Boolean(copy.secondary), `${lang} ${s.id} secondary`).toBe(Boolean(STATUS_COPY.vi[s.id].secondary));
      }
    }
  });

  it("mã viết dọc đọc từng chữ số", () => {
    expect([400, 404, 410, 503].map(kanjiDigits)).toEqual(["四〇〇", "四〇四", "四一〇", "五〇三"]);
  });
});
