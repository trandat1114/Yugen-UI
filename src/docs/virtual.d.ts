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
