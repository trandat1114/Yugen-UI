import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { SERVER_SAFE } from "./scripts/server-safe.mjs";

/**
 * Build thư viện cho gói npm (`npm run build:lib`). Trang docs dùng `vite.config.ts` (outDir `dist-docs`).
 * - ESM, giữ nguyên cấu trúc module (`preserveModules`) để bundler của người dùng tree-shake từng component.
 * - Mọi import "trần" (react, react/jsx-runtime, @radix-ui/*, react-day-picker/locale/vi…) là external.
 * - Khai báo kiểu: `tsconfig.lib.json` + scripts/alias-dts.mjs; CSS: `scripts/build-css.mjs`.
 */
const src = path.resolve(import.meta.dirname, "src");
const ui = path.join(src, "components", "ui");

const isExternal = (id: string) =>
  !id.startsWith(".") && !id.startsWith("@/") && !id.startsWith("\0") && !path.isAbsolute(id);

/**
 * Entries: the package root plus every module that `src/components/ui/index.ts` re-exports, the targets of the
 * `yugen-ui/<Folder>` subpaths in package.json (#344). As entries, the modules that only re-export (Chart, AIKit,
 * hooks) are emitted too instead of being inlined into lib.js. With `preserveModules` the root and a subpath load
 * the same files, so a context is never duplicated.
 */
const subpathModules = [...fs.readFileSync(path.join(ui, "index.ts"), "utf8").matchAll(/^export \* from "\.\/(.+?)(?:\.js)?";/gm)].map(
  ([, module]) => module,
);
const entry = Object.fromEntries([
  ["lib", path.join(src, "lib.ts")],
  ...subpathModules.map((module) => {
    const file = [".tsx", ".ts"].map((ext) => path.join(ui, module + ext)).find((f) => fs.existsSync(f));
    if (!file) throw new Error(`[vite.lib] src/components/ui/index.ts re-exports "./${module}", which has no .ts / .tsx file`);
    return [`components/ui/${module}`, file];
  }),
]);

// Module tiện ích thuần (không React): không gắn "use client" để Server Component (Next.js App Router) vẫn gọi được
// cn() / generateBrandRamp() / readAppShellCookie(). Danh sách và lý do ở scripts/server-safe.mjs (#345).
const serverSafe = new Set(SERVER_SAFE);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": src,
    },
  },
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    copyPublicDir: false,
    minify: false,
    sourcemap: false,
    lib: {
      entry,
      formats: ["es"],
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: src,
        entryFileNames: "[name].js",
        banner: (chunk) => (serverSafe.has(chunk.fileName) ? "" : '"use client";'),
      },
    },
  },
});
