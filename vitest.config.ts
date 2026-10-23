import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { yugenDocsMeta, yugenTypeExports } from "./vite.plugins.ts";

/**
 * Vitest — unit, tương tác (Testing Library) và SSR / hydration.
 * Không nạp plugin Tailwind: test chỉ kiểm tra hành vi và DOM, không cần CSS.
 * Playwright (e2e/) chạy riêng bằng `npm run test:e2e`.
 */
export default defineConfig({
  plugins: [react(), yugenTypeExports(import.meta.dirname), yugenDocsMeta(import.meta.dirname)],
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
  },
});
