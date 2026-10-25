import type { ComponentType } from "react";
import { CONCEPT_GROUPS, type ConceptGroup, type ConceptMeta } from "../types";
import { lazyPage, type PreloadableComponent } from "../lazyPage";
import { CONCEPT_METAS } from "./_meta";

/**
 * Metadata nạp ngay (cho sidebar), nội dung trang nạp lười theo route.
 * Thêm trang mới: tạo `<slug>.tsx` (export default) + `<slug>.meta.ts` (export const meta: ConceptMeta).
 */
const loaders = import.meta.glob<{ default: ComponentType }>(["./*.tsx"]);

// Trang mới có thể khai báo metadata trong "<slug>.meta.ts" (export const meta) cạnh "<slug>.tsx".
const separateMetas = Object.fromEntries(
  Object.entries(import.meta.glob<ConceptMeta>("./*.meta.ts", { eager: true, import: "meta" })).map(([file, meta]) => [
    file.replace(/\.meta\.ts$/, ".tsx"),
    meta,
  ]),
);

export const CONCEPTS = Object.entries({ ...CONCEPT_METAS, ...separateMetas })
  .filter(([file]) => loaders[file])
  .map(([file, meta]) => ({ meta, Page: lazyPage(() => loaders[file]().then((m) => m.default)) }))
  .sort(
    (a, b) =>
      CONCEPT_GROUPS.indexOf(a.meta.group) - CONCEPT_GROUPS.indexOf(b.meta.group) || a.meta.order - b.meta.order,
  );

export const CONCEPT_BY_SLUG = Object.fromEntries(CONCEPTS.map((c) => [c.meta.slug, c]));

export const CONCEPTS_BY_GROUP: { group: ConceptGroup; items: typeof CONCEPTS }[] = CONCEPT_GROUPS.map((group) => ({
  group,
  items: CONCEPTS.filter((c) => c.meta.group === group),
})).filter((g) => g.items.length > 0);

/** Bản tiếng Anh của trang khái niệm (`en/<slug>.tsx`) — nạp lười khi locale là "en"; trang chưa dịch không có mục. */
export const CONCEPT_EN_PAGES: Record<string, PreloadableComponent<object>> = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: ComponentType }>("./en/*.tsx")).map(([file, load]) => [
    file.replace(/^\.\/en\/(.+)\.tsx$/, "$1"),
    lazyPage(() => load().then((m) => m.default)),
  ]),
);
