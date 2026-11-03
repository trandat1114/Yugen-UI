declare module "virtual:yugen-type-exports" {
  /** Tên type/interface export từ src/components/ui (sinh bởi vite.plugins.ts). */
  const names: string[];
  export default names;
}

declare module "virtual:yugen-ui-exports" {
  /** Tên runtime mà barrel `yugen-ui` export, và thư mục component của từng tên (yugenUiExports trong vite.plugins.ts). */
  const exports: { barrel: string[]; folders: Record<string, string> };
  export default exports;
}

declare module "virtual:yugen-docs-meta" {
  import type { ComponentMeta } from "@/docs/types";
  /** Metadata mọi ComponentDoc trong src/docs/registry/*.tsx, trích tĩnh lúc build (yugenDocsMeta trong vite.plugins.ts). */
  const meta: ComponentMeta[];
  export default meta;
}

declare module "virtual:yugen-messages-index" {
  /** Namespace `messages` của mọi component và thư mục chứa nó (yugenMessages trong vite.plugins.ts). */
  const index: { namespace: string; folder: string }[];
  export default index;
}

declare module "virtual:yugen-messages" {
  /**
   * Khoá, kiểu, JSDoc (tiếng Việt), mặc định tiếng Việt và bản tiếng Anh của từng namespace — đọc tĩnh các messages.ts.
   * `vi` / `en`: chuỗi literal ở dạng JSON (có dấu nháy), giá trị khác (hàm…) là mã nguồn.
   */
  const namespaces: {
    namespace: string;
    folder: string;
    keys: { key: string; type: string; doc: string; vi: string; en: string }[];
  }[];
  export default namespaces;
}

declare module "virtual:yugen-news-index" {
  import type { NewsFeeds, NewsIndexRelease } from "@/docs/news";
  /** Version, ngày, `upcoming` và tiêu đề hai ngôn ngữ của mọi bản phát hành (yugenNews trong vite.plugins.ts). */
  const index: NewsFeeds<NewsIndexRelease>;
  export default index;
}

declare module "virtual:yugen-news-vi" {
  import type { NewsFeeds, NewsRelease } from "@/docs/news";
  /** Tin đầy đủ bằng tiếng Việt, từ src/docs/news/<gói>/<version>.vi.md. */
  const feeds: NewsFeeds<NewsRelease>;
  export default feeds;
}

declare module "virtual:yugen-news-en" {
  import type { NewsFeeds, NewsRelease } from "@/docs/news";
  /** Tin đầy đủ bằng tiếng Anh, từ src/docs/news/<gói>/<version>.en.md. */
  const feeds: NewsFeeds<NewsRelease>;
  export default feeds;
}
