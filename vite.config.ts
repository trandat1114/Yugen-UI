import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { yugenBootSplash, yugenDocsMeta, yugenMessages, yugenTypeExports, yugenUiExports } from "./vite.plugins.ts";

export default defineConfig({
  // GitHub Pages phục vụ site ở /Yugen-UI/ — workflow pages.yml đặt DOCS_BASE; dev & preview giữ "/".
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss(), yugenTypeExports(import.meta.dirname), yugenUiExports(import.meta.dirname), yugenDocsMeta(import.meta.dirname), yugenMessages(import.meta.dirname), yugenBootSplash(import.meta.dirname)],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // Watcher mặc định duyệt cả thư mục gốc lúc khởi động; worktree của agent (.claude/worktrees, hàng chục nghìn file) và
  // thư mục build làm HTML đầu tiên về chậm 2–10 s — trang trắng trước khi màn chờ kịp hiện (#236).
  server: {
    watch: {
      ignored: ["**/.claude/**", "**/dist/**", "**/dist-docs/**", "**/dist-ssr/**"],
    },
  },
  build: {
    outDir: "dist-docs",
    // Demo + code mẫu nạp lười: mỗi file src/docs/registry/*.tsx thành một chunk riêng (registry/index.ts); entry chỉ giữ metadata.
    rolldownOptions: {
      output: {
        // Chỉ gom React (đổi ít, cache lâu). Component, Radix, icon để Rolldown chia theo route: gom cả thư viện / mọi icon vào
        // một chunk thì trang nào cũng tải hết (trước đây ~465 KB gzip ban đầu, giờ ~220 KB).
        codeSplitting: {
          groups: [{ name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
});
