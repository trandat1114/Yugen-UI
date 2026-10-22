import path from "node:path";
import type { RegistryFile } from "./registry.js";

/** Thư mục đặt mã nguồn, tương đối với dự án ("src/components/ui", "src/lib"). */
export interface Placement {
  ui: string;
  lib: string;
}

export interface TransformOptions {
  paths: Placement;
  /** Alias import ("@/components/ui", "@/lib"); không có → import tương đối. */
  aliases?: Placement;
  /** Giữ "use client" (Next.js App Router). */
  rsc: boolean;
}

/** registry/yugen/ui/Button/Button.tsx → src/components/ui/Button/Button.tsx; file khác (theme) → null. */
export function targetPath(file: RegistryFile, paths: Placement): string | null {
  const m = file.path.match(/^registry\/yugen\/(ui|lib)\/(.+)$/);
  return m ? path.posix.join(paths[m[1] as keyof Placement], m[2]) : null;
}

export const stripUseClient = (code: string) => code.replace(/^(["'])use client\1;?[ \t]*\r?\n(?:[ \t]*\r?\n)?/, "");

/** `@/lib/…`, `@/components/ui/…` (đường dẫn trong repo Yugen UI) → alias của dự án hoặc đường dẫn tương đối từ `target`. */
export function rewriteImports(code: string, target: string, { paths, aliases }: Pick<TransformOptions, "paths" | "aliases">) {
  return code.replace(/(["'])@\/(lib|components\/ui)\/([^"']+)\1/g, (_m, q: string, kind: string, rest: string) => {
    const key: keyof Placement = kind === "lib" ? "lib" : "ui";
    if (aliases) return `${q}${aliases[key]}/${rest}${q}`;
    const rel = path.posix.relative(path.posix.dirname(target), path.posix.join(paths[key], rest));
    return `${q}${rel.startsWith(".") ? rel : `./${rel}`}${q}`;
  });
}

export function transformFile(content: string, target: string, opts: TransformOptions) {
  return rewriteImports(opts.rsc ? content : stripUseClient(content), target, opts);
}
