import { CATEGORIES, type ComponentCategory, type ComponentDoc } from "../types";

/**
 * Tự gom mọi file trong thư mục này có `export const docs: ComponentDoc[]`.
 * Thêm component mới = tạo/bổ sung một file, không cần sửa file này.
 */
const modules = import.meta.glob<{ docs?: ComponentDoc[] }>("./*.tsx", { eager: true });

const all = Object.values(modules).flatMap((m) => m.docs ?? []);

export const COMPONENTS: ComponentDoc[] = [...all].sort(
  (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name),
);

export const COMPONENT_BY_SLUG: Record<string, ComponentDoc> = Object.fromEntries(COMPONENTS.map((c) => [c.slug, c]));

export const COMPONENTS_BY_CATEGORY: { category: ComponentCategory; items: ComponentDoc[] }[] = CATEGORIES.map((category) => ({
  category,
  items: COMPONENTS.filter((c) => c.category === category),
})).filter((g) => g.items.length > 0);

export type { ComponentDoc };
