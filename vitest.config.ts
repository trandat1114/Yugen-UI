import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { yugenDemoLang, yugenDocsMeta, yugenMessages, yugenNews, yugenTypeExports, yugenUiExports } from "./vite.plugins.ts";

/**
 * Vitest — unit, tương tác (Testing Library) và SSR / hydration.
 * Không nạp plugin Tailwind: test chỉ kiểm tra hành vi và DOM, không cần CSS.
 * Playwright (e2e/) chạy riêng bằng `npm run test:e2e`.
 */
export default defineConfig({
  plugins: [react(), yugenTypeExports(import.meta.dirname), yugenUiExports(import.meta.dirname), yugenDocsMeta(import.meta.dirname), yugenDemoLang(import.meta.dirname), yugenMessages(import.meta.dirname), yugenNews(import.meta.dirname)],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**", "dist-docs/**"],
    // Không xử lý CSS trong test, trừ tokens.css: Theme Designer đọc giá trị token gốc qua `?raw` (src/docs/themeAxes.ts).
    css: { include: [/\/styles\/tokens\.css/] },
    restoreMocks: true,
    // Cache transform trên đĩa (node_modules/.vitest-cache) giữ kết quả import.meta.glob cũ khi thêm file mới → test pass ở máy
    // nhưng đỏ trên CI (không có cache). Tắt để máy chạy giống CI.
    fsModuleCache: false,
    // Chỉ khi chạy với --coverage (job Unit tests): % dòng theo thư mục component, so với mức sàn trong
    // scripts/test-floor.json bằng scripts/check-test-floor.mjs (#167).
    coverage: {
      provider: "v8",
      include: ["src/components/ui/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "src/components/ui/index.ts"],
      reporter: ["json-summary", "text-summary"],
    },
  },
});
