declare module "virtual:yugen-type-exports" {
  /** Tên type/interface export từ src/components/ui (sinh bởi vite.plugins.ts). */
  const names: string[];
  export default names;
}

declare module "virtual:yugen-docs-meta" {
  import type { ComponentMeta } from "@/docs/types";
  /** Metadata mọi ComponentDoc trong src/docs/registry/*.tsx, trích tĩnh lúc build (yugenDocsMeta trong vite.plugins.ts). */
  const meta: ComponentMeta[];
  export default meta;
}
