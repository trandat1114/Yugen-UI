import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Build thư viện cho gói npm (`npm run build:lib`). Trang docs dùng `vite.config.ts` (outDir `dist-docs`).
 * - ESM, giữ nguyên cấu trúc module (`preserveModules`) để bundler của người dùng tree-shake từng component.
 * - Mọi import "trần" (react, react/jsx-runtime, @radix-ui/*, react-day-picker/locale/vi…) là external.
 * - Khai báo kiểu: `tsconfig.lib.json` + tsc-alias; CSS: `scripts/build-css.mjs`.
 */
const src = path.resolve(__dirname, "src");

const isExternal = (id: string) =>
  !id.startsWith(".") && !id.startsWith("@/") && !id.startsWith("\0") && !path.isAbsolute(id);

// Module tiện ích thuần (không React) và barrel re-export: không gắn "use client" để Server Component (Next.js
// App Router) vẫn gọi được cn() / generateBrandRamp(). Mỗi file component vẫn là một client boundary riêng.
const SERVER_SAFE = new Set(["lib.js", "lib/cn.js", "lib/brandRamp.js", "components/ui/index.js"]);

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
      entry: path.resolve(src, "lib.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: src,
        entryFileNames: "[name].js",
        banner: (chunk) => (SERVER_SAFE.has(chunk.fileName) ? "" : '"use client";'),
      },
    },
  },
});
