import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { yugenBootSplash, yugenDemoLang, yugenDocsMeta, yugenMessages, yugenNews, yugenTypeExports, yugenUiExports } from "./vite.plugins.ts";
import { docsServiceWorker, fluentIconAtoms } from "./vite.perf.ts";

export default defineConfig({
  // GitHub Pages phục vụ site ở /Yugen-UI/ — workflow pages.yml đặt DOCS_BASE; dev & preview giữ "/".
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss(), yugenTypeExports(import.meta.dirname), yugenUiExports(import.meta.dirname), yugenDocsMeta(import.meta.dirname), yugenDemoLang(import.meta.dirname), yugenMessages(import.meta.dirname), yugenNews(import.meta.dirname), yugenBootSplash(import.meta.dirname), fluentIconAtoms(import.meta.dirname), docsServiceWorker(import.meta.dirname)],
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
    // Block tiếng Việt (/vi/blocks, src/docs/pages/blocksVi.ts) chỉ nạp từ trang Blocks, nơi mọi chunk nó cần đã có sẵn: bỏ danh
    // sách preload để chunk của trang Blocks (cả bản tiếng Anh) không phình thêm.
    modulePreload: { resolveDependencies: (filename, deps) => (/(^|\/)blocksVi-[\w-]+\.js$/.test(filename) ? [] : deps) },
    // Demo + code mẫu nạp lười: mỗi file src/docs/registry/*.tsx thành một chunk riêng (registry/index.ts); entry chỉ giữ metadata.
    rolldownOptions: {
      output: {
        // Component, Radix, icon để Rolldown chia theo route: gom cả thư viện / mọi icon vào một chunk thì trang nào cũng tải
        // hết (trước đây ~465 KB gzip ban đầu). Nhưng chia hoàn toàn theo route thì mỗi tập entry dùng chung một module thành
        // một chunk: ~110 file JS mỗi trang, phần lớn dưới 2 KB (#304). Các nhóm dưới đây gom phần nhỏ mà không tải thêm nhiều:
        //  - react: đổi ít, cache lâu.
        //  - shell: mọi module chunk chính import tĩnh. Trang nào cũng tải, nên một file thay vì ~25 file.
        //  - messages: chuỗi có sẵn của component (~7 KB gzip). messagesVi import tất cả nên mỗi file thành một chunk riêng
        //    (~45 request ở trang tiếng Việt). Trừ Calendar: file đó kéo theo locale vi của date-fns.
        //  - icons: họ icon (vite.perf.ts) mà ≥ 4 entry dùng.
        //  - common: thư viện, component, hook mà ≥ 16 entry dùng.
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 10 },
            { name: "shell", tags: ["$initial"], priority: 5 },
            { name: "messages", test: /[\\/]src[\\/]components[\\/]ui[\\/](?!Calendar[\\/])[^\\/]+[\\/]messages\.ts$/, priority: 3 },
            { name: "icons", test: /[\\/]@fluentui[\\/]react-icons[\\/]lib[\\/]atoms[\\/]/, minShareCount: 4, priority: 2 },
            { name: "common", test: /[\\/]node_modules[\\/]|[\\/]src[\\/](components|lib|hooks)[\\/]/, minShareCount: 16, priority: 1 },
          ],
        },
      },
    },
  },
});
