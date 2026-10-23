import { describe, expect, it } from "vitest";
import meta from "virtual:yugen-docs-meta";
import { CATEGORIES, CONCEPT_GROUPS } from "../types";
import { CONCEPTS, CONCEPT_EN_PAGES } from "../concepts";
import { FOUNDATIONS } from "../foundations";
import { COMPONENTS_EN } from "./en/components";
import { CATEGORIES_EN, CONCEPT_GROUPS_EN, CONCEPTS_EN, FOUNDATIONS_EN } from "./en/concepts";
import { en } from "./en";
import { vi } from "./vi";

describe("docs i18n (en)", () => {
  it("mọi component có name / lead tiếng Anh", () => {
    const missing = meta.filter((m) => !COMPONENTS_EN[m.slug]?.lead.trim()).map((m) => m.slug);
    expect(missing).toEqual([]);
    const unknown = Object.keys(COMPONENTS_EN).filter((slug) => !meta.some((m) => m.slug === slug));
    expect(unknown).toEqual([]);
  });

  it("mọi trang khái niệm có tiêu đề tiếng Anh; trang đã dịch có lead + đủ mục lục", () => {
    for (const { meta: m } of CONCEPTS) {
      const e = CONCEPTS_EN[m.slug];
      expect(e?.title, m.slug).toBeTruthy();
      if (CONCEPT_EN_PAGES[m.slug]) {
        expect(e.lead, m.slug).toBeTruthy();
        expect(Object.keys(e.toc ?? {}).sort(), m.slug).toEqual(m.toc.map((i) => i.id).sort());
      }
    }
    expect(Object.keys(CONCEPT_EN_PAGES).sort()).toEqual(["cli", "introduction", "quick-start", "seo", "shadcn-registry", "versioning"]);
  });

  it("nhóm, foundation và chuỗi giao diện đủ bản dịch", () => {
    for (const c of CATEGORIES) expect(CATEGORIES_EN[c], c).toBeTruthy();
    for (const g of CONCEPT_GROUPS) expect(CONCEPT_GROUPS_EN[g], g).toBeTruthy();
    for (const f of FOUNDATIONS) expect(FOUNDATIONS_EN[f.slug], f.slug).toBeTruthy();
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
    for (const [k, v] of Object.entries(en)) expect(v.trim(), k).not.toBe("");
  });
});
