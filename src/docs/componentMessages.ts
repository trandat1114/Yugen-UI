import index from "virtual:yugen-messages-index";
import uiExports from "virtual:yugen-ui-exports";
import { lazyPage } from "./lazyPage";
import { COMPONENTS_META } from "./registry";
import type { ComponentMeta } from "./types";

/**
 * Trang component nào hiện bảng Messages của namespace nào (#156). Namespace là tên component viết camelCase
 * (`toast`, `pageProgress`), nên ghép theo slug / các từ trong tên trang ("AsyncContent & ErrorState" → asyncContent,
 * errorState; "useOptimisticList" → optimisticList). Namespace không trang nào khớp trực tiếp (chart, codeTabs…) hiện ở
 * mọi trang có component thuộc cùng thư mục (BarChart, LineChart… → chart).
 */
const tokensOf = (meta: Pick<ComponentMeta, "slug" | "name">) =>
  new Set(
    [meta.slug, ...meta.name.split(/[^A-Za-z0-9]+/)]
      .filter(Boolean)
      .flatMap((t) => [t.toLowerCase(), t.toLowerCase().replace(/^use(?=[a-z])/, "")]),
  );

/** Thư mục component của trang: tên export đầu tiên trong tên trang có trong `yugen-ui`. */
const folderOf = (meta: Pick<ComponentMeta, "name">) =>
  meta.name
    .split(/[^A-Za-z0-9]+/)
    .map((t) => uiExports.folders[t])
    .find(Boolean);

function build() {
  const byPage = new Map<string, string[]>();
  const matched = new Set<string>();
  for (const meta of COMPONENTS_META) {
    const tokens = tokensOf(meta);
    const direct = index.filter((n) => tokens.has(n.namespace.toLowerCase())).map((n) => n.namespace);
    direct.forEach((ns) => matched.add(ns));
    byPage.set(meta.slug, direct);
  }
  for (const meta of COMPONENTS_META) {
    const folder = folderOf(meta);
    const extra = index.filter((n) => !matched.has(n.namespace) && n.folder === folder).map((n) => n.namespace);
    if (extra.length) byPage.set(meta.slug, [...byPage.get(meta.slug)!, ...extra]);
  }
  return byPage;
}

let cache: Map<string, string[]> | undefined;

/** Namespace `messages` hiện trên trang component `slug` (rỗng: trang không có mục Messages). */
export function messageNamespacesFor(slug: string): string[] {
  cache ??= build();
  return cache.get(slug) ?? [];
}

/** Mọi namespace (để kiểm tra trang nào cũng phủ đủ). */
export const ALL_MESSAGE_NAMESPACES = index.map((n) => n.namespace);

/** Bảng Messages (cùng dữ liệu đầy đủ) — một chunk riêng, nạp trước cùng trang component có mục này. */
export const MessagesTable = lazyPage(() => import("./MessagesTable").then((m) => m.default));

export function preloadComponentMessages(slug: string): Promise<void> {
  return messageNamespacesFor(slug).length > 0 ? MessagesTable.preload() : Promise.resolve();
}
