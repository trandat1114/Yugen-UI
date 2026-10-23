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
