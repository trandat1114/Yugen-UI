import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-docs",
    // Chunk "index" là nội dung trang docs (demo + code mẫu của mọi component), không phải thư viện.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const file = id.replace(/\\/g, "/");
          if (!file.includes("/node_modules/")) {
            if (file.includes("/src/docs/registry/")) return "docs-registry";
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
