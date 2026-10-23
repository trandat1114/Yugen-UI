import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { yugenDocsMeta, yugenTypeExports } from "./vite.plugins.ts";

export default defineConfig({
  // GitHub Pages phục vụ site ở /Yugen-UI/ — workflow pages.yml đặt DOCS_BASE; dev & preview giữ "/".
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss(), yugenTypeExports(import.meta.dirname), yugenDocsMeta(import.meta.dirname)],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-docs",
    // Demo + code mẫu nạp lười: mỗi file src/docs/registry/*.tsx thành một chunk riêng (registry/index.ts); entry chỉ giữ metadata.
    // Chunk lớn nhất là yugen-ui (toàn bộ thư viện cho demo).
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Nhóm theo độ ưu tiên: module khớp nhóm cao hơn trước. Mã docs còn lại để Rolldown tự chia theo route.
        codeSplitting: {
          groups: [
            { name: "icons", test: /[\\/]node_modules[\\/]@fluentui[\\/]react-icons[\\/]/, priority: 60 },
            {
              name: "primitives",
              test: /[\\/]node_modules[\\/](@radix-ui|cmdk|react-remove-scroll[^\\/]*|@floating-ui)[\\/]/,
              priority: 50,
            },
            { name: "widgets", test: /[\\/]node_modules[\\/](react-day-picker|date-fns|react-resizable-panels)[\\/]/, priority: 40 },
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: "vendor", test: /[\\/]node_modules[\\/]/, priority: 20 },
            { name: "yugen-ui", test: /[\\/]src[\\/](components[\\/]ui|lib)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
