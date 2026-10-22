import { defineConfig, devices, type Project } from "@playwright/test";

/**
 * E2E của site docs Yugen UI.
 * - `npm run test:e2e`    → a11y (axe) + interaction (kéo chuột, desktop) + touch (giả lập mobile).
 * - `npm run test:visual` → chỉ project `visual` (so sánh ảnh chụp; baseline theo nền tảng trong e2e/__screenshots__).
 * Local dùng Microsoft Edge đã cài sẵn (không cần tải trình duyệt); CI dùng Chromium của Playwright.
 */
const CI = !!process.env.CI;
const PORT = 5200;
const BASE_URL = `http://localhost:${PORT}`;
const browser = CI ? {} : { channel: "msedge" as const };
// Project `visual` chỉ có khi lệnh nhắm tới nó (`--project=visual` / `--project visual`). Ghi vào env để
// worker (nạp lại file config trong tiến trình con, argv khác) thấy cùng danh sách project.
const argv = process.argv;
const wantsVisual =
  process.env.YUGEN_E2E_VISUAL === "1" ||
  argv.some((a, i) => a === "--project=visual" || (a === "--project" && argv[i + 1] === "visual"));
if (wantsVisual) process.env.YUGEN_E2E_VISUAL = "1";

const desktop = {
  ...devices["Desktop Chrome"],
  ...browser,
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce" as const,
  locale: "vi-VN",
  timezoneId: "Asia/Ho_Chi_Minh",
};

const projects: Project[] = [
  { name: "a11y", testMatch: /a11y\.spec\.ts/, use: desktop },
  { name: "interaction", testMatch: /(drag|carousel)\.spec\.ts/, use: desktop },
  {
    name: "touch",
    testMatch: /(touch|responsive)\.spec\.ts/,
    use: {
      ...devices["Pixel 7"],
      ...browser,
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
      locale: "vi-VN",
      timezoneId: "Asia/Ho_Chi_Minh",
    },
  },
];

if (wantsVisual) {
  projects.push({ name: "visual", testMatch: /visual\.spec\.ts/, use: desktop });
}

export default defineConfig({
  testDir: "e2e",
  // Gom route docs từ sidebar sau khi webServer chạy, trước khi nạp spec (a11y.spec.ts sinh test theo route).
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: CI,
  // Dev server (Vite) đôi khi nghẽn khi nhiều worker cùng tải module — thử lại một lần.
  retries: 1,
  workers: CI ? 3 : "50%",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled", caret: "hide" },
  },
  outputDir: "test-results",
  snapshotPathTemplate: "e2e/__screenshots__/{testFilePath}/{arg}{-projectName}{-platform}{ext}",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects,
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
