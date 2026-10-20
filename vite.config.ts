import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { yugenDocsMeta, yugenTypeExports } from "./vite.plugins";

export default defineConfig({
  // GitHub Pages phục vụ site ở /Yugen-UI/ — workflow pages.yml đặt DOCS_BASE; dev & preview giữ "/".
  base: process.env.DOCS_BASE ?? "/",
  plugins: [react(), tailwindcss(), yugenTypeExports(__dirname), yugenDocsMeta(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-docs",
    // Demo + code mẫu nạp lười: mỗi file src/docs/registry/*.tsx thành một chunk riêng (registry/index.ts); entry chỉ giữ metadata.
    // Chunk lớn nhất là yugen-ui (toàn bộ thư viện cho demo).
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const file = id.replace(/\\/g, "/");
          if (!file.includes("/node_modules/")) {
            if (file.includes("/src/components/ui/") || file.includes("/src/lib/")) return "yugen-ui";
            return undefined;
          }
          if (id.includes("@fluentui/react-icons")) return "icons";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("react-remove-scroll") || id.includes("@floating-ui"))
            return "primitives";
          if (id.includes("react-day-picker") || id.includes("date-fns") || id.includes("react-resizable-panels")) return "widgets";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
});
