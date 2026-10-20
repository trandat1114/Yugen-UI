import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { yugenDocsMeta, yugenTypeExports } from "./vite.plugins";

/**
 * Vitest — unit, tương tác (Testing Library) và SSR / hydration.
 * Không nạp plugin Tailwind: test chỉ kiểm tra hành vi và DOM, không cần CSS.
 * Playwright (e2e/) chạy riêng bằng `npm run test:e2e`.
 */
export default defineConfig({
  plugins: [react(), yugenTypeExports(__dirname), yugenDocsMeta(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**", "dist-docs/**"],
    css: false,
    restoreMocks: true,
  },
});
