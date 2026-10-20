import { describe, expect, it } from "vitest";
import meta from "virtual:yugen-docs-meta";
import { CATEGORIES } from "../types";
import { COMPONENT_META_BY_SLUG, COMPONENTS_BY_CATEGORY, COMPONENTS_META, loadAllComponentDocs, loadComponentDoc } from ".";

/**
 * Metadata trích tĩnh lúc build (virtual:yugen-docs-meta) phải khớp với doc nạp thật từ các file registry —
 * sidebar / trang chủ / header trang dùng meta, nội dung dùng doc.
 */
describe("docs registry", () => {
  it("không trùng slug", () => {
    const slugs = meta.map((m) => m.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    expect(dupes).toEqual([]);
    expect(Object.keys(COMPONENT_META_BY_SLUG)).toHaveLength(meta.length);
  });

  it("meta khớp doc nạp từ file (slug, name, category, lead) và nằm đúng file", async () => {
    const docs = await loadAllComponentDocs();
    expect(docs.length).toBeGreaterThan(0);
    expect(COMPONENTS_META.map(({ slug, name, category, lead }) => ({ slug, name, category, lead }))).toEqual(
      docs.map(({ slug, name, category, lead }) => ({ slug, name, category, lead })),
    );
    for (const m of COMPONENTS_META) expect(await loadComponentDoc(m.slug), m.slug).toBe(docs.find((d) => d.slug === m.slug));
  }, 60_000); // nạp (transform) mọi file registry — chậm khi chạy song song với cả bộ test

  it("category hợp lệ và nhóm đủ mọi component", () => {
    for (const m of meta) expect(CATEGORIES, `${m.slug}: ${m.category}`).toContain(m.category);
    expect(COMPONENTS_BY_CATEGORY.flatMap((g) => g.items)).toEqual(COMPONENTS_META);
  });

  it("slug lạ → lỗi rõ ràng", async () => {
    await expect(loadComponentDoc("khong-ton-tai")).rejects.toThrow(/khong-ton-tai/);
  });
});
