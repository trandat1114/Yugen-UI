import meta from "virtual:yugen-docs-meta";
import { CATEGORIES, type ComponentCategory, type ComponentDoc, type ComponentMeta } from "../types";

/**
 * Registry trang component, chia 2 phần:
 *  - Metadata (slug / name / category / lead) nạp sẵn — plugin `yugenDocsMeta` (vite.plugins.ts) trích tĩnh lúc build
 *    từ `export const docs` của mọi file trong thư mục này. Sidebar, trang chủ, command palette, header trang dùng phần này.
 *  - Demo + code mẫu (`ComponentDoc` đầy đủ) nạp lười theo file: `loadComponentDoc(slug)` — mỗi file là một chunk riêng.
 * Thêm component mới = tạo/bổ sung một file có `export const docs: ComponentDoc[]`, không cần sửa file này.
 */
const byOrder = (a: ComponentMeta | ComponentDoc, b: ComponentMeta | ComponentDoc) =>
  CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name);

export const COMPONENTS_META: ComponentMeta[] = [...meta].sort(byOrder);

export const COMPONENT_META_BY_SLUG: Record<string, ComponentMeta> = Object.fromEntries(COMPONENTS_META.map((c) => [c.slug, c]));

export const COMPONENTS_BY_CATEGORY: { category: ComponentCategory; items: ComponentMeta[] }[] = CATEGORIES.map((category) => ({
  category,
  items: COMPONENTS_META.filter((c) => c.category === category),
})).filter((g) => g.items.length > 0);

const loaders = import.meta.glob<{ docs?: ComponentDoc[] }>("./*.tsx");
const files = new Map<string, Promise<ComponentDoc[]>>();

/** Nạp một file registry (cache theo file; lỗi → bỏ cache để lần sau thử lại). */
function loadFile(key: string): Promise<ComponentDoc[]> {
  let promise = files.get(key);
  if (!promise) {
    const load = loaders[key];
    if (!load) return Promise.reject(new Error(`Không có file registry "${key}".`));
    promise = load().then((m) => m.docs ?? []);
    promise.catch(() => files.delete(key));
    files.set(key, promise);
  }
  return promise;
}

/** Doc đầy đủ (demo + code mẫu) của một component — nạp file registry chứa nó khi cần. */
export async function loadComponentDoc(slug: string): Promise<ComponentDoc> {
  const entry = COMPONENT_META_BY_SLUG[slug];
  if (!entry) throw new Error(`Không tìm thấy component "${slug}".`);
  const doc = (await loadFile(`./${entry.file}`)).find((d) => d.slug === slug);
  if (!doc) throw new Error(`"${slug}" có trong metadata (${entry.file}) nhưng file không export doc này.`);
  return doc;
}

/** Mọi doc của mọi file registry (scripts / test) — cùng thứ tự với COMPONENTS_META. */
export async function loadAllComponentDocs(): Promise<ComponentDoc[]> {
  const all = await Promise.all(Object.keys(loaders).map(loadFile));
  return all.flat().sort(byOrder);
}

type Entry = { status: "pending"; promise: Promise<void> } | { status: "done"; doc: ComponentDoc } | { status: "error"; error: unknown };
const entries = new Map<string, Entry>();

/**
 * Đọc doc trong render, dưới `<Suspense>`: đang tải → treo (throw promise); xong → `{ doc }`; lỗi → `{ error }`
 * (trả về thay vì ném để trang hiện ErrorState có nút thử lại — gọi `retryComponentDoc` trước khi render lại).
 */
export function readComponentDoc(slug: string): { doc: ComponentDoc; error?: undefined } | { doc?: undefined; error: unknown } {
  let entry = entries.get(slug);
  if (!entry) {
    const promise = loadComponentDoc(slug).then(
      (doc) => void entries.set(slug, { status: "done", doc }),
      (error: unknown) => void entries.set(slug, { status: "error", error }),
    );
    entry = { status: "pending", promise };
    entries.set(slug, entry);
  }
  if (entry.status === "pending") throw entry.promise;
  return entry.status === "done" ? { doc: entry.doc } : { error: entry.error };
}

/** Nạp trước doc của một trang component (main.tsx, trước lần render đầu) — `readComponentDoc` sau đó không treo. */
export function preloadComponentDoc(slug: string): Promise<void> {
  try {
    readComponentDoc(slug);
    return Promise.resolve();
  } catch (pending) {
    return pending as Promise<void>;
  }
}

/** Bỏ kết quả lỗi đã cache để `readComponentDoc` tải lại. */
export function retryComponentDoc(slug: string) {
  if (entries.get(slug)?.status === "error") entries.delete(slug);
}

export type { ComponentDoc, ComponentMeta };
