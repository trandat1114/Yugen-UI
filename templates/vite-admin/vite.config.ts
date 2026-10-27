import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * `npm run build:gh-pages` (mode gh-pages): GitHub Pages answers unknown paths with 404.html, so the app is copied
 * there too and a deep link such as /settings opens the right page. Other hosts: see Deploy in README.md.
 */
function githubPagesFallback(): Plugin {
  let outDir = "dist";
  let enabled = false;
  return {
    name: "github-pages-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      enabled = config.mode === "gh-pages";
    },
    closeBundle() {
      if (enabled) fs.copyFileSync(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), githubPagesFallback()],
  build: {
    rolldownOptions: {
      output: {
        // React (trang nào cũng cần) tách riêng để trình duyệt giữ cache khi mã ứng dụng đổi. Không gom mọi node_modules vào
        // một chunk "vendor": yugen-ui được build theo từng component, để Rolldown tự chia thì trang nạp lười chỉ tải
        // component của chính nó (lần tải đầu của SaaS giảm ~27%).
        codeSplitting: {
          groups: [
            { name: "react", test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
});
