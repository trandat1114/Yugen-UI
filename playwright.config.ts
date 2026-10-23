import { defineConfig, devices, type Project } from "@playwright/test";

/**
 * E2E của site docs Yugen UI.
 * - `npm run test:e2e`    → a11y (axe) + interaction (kéo chuột, bàn phím / focus, luồng chính của docs, trang Motion; desktop)
 *                            + touch (giả lập mobile).
 * - `npm run test:visual` → chỉ project `visual` (so sánh ảnh chụp; baseline theo nền tảng trong e2e/__screenshots__).
 * - `npm run test:engines` → interaction trên Firefox và WebKit, touch trên WebKit (iPhone) — #40. Workflow engines.yml
 *                            chạy theo lịch, trên PR vào main và PR đổi e2e/; local cần `npx playwright install firefox webkit`.
 * Local dùng Microsoft Edge đã cài sẵn (không cần tải trình duyệt); CI dùng Chromium của Playwright.
 * Mặc định chạy trên bản build (`build:docs` + `vite preview`), giống site đã deploy. `YUGEN_E2E_DEV=1` dùng dev server
 * để debug (module biến đổi theo yêu cầu, chậm hơn và có HMR).
 */
const CI = !!process.env.CI;
const DEV = process.env.YUGEN_E2E_DEV === "1";
const PORT = 5200;
const BASE_URL = `http://localhost:${PORT}`;
const browser = CI ? {} : { channel: "msedge" as const };
// Project `visual` và các engine khác Chromium chỉ có khi lệnh nhắm tới (`--project=visual` / `--project visual`). Ghi vào
// env để worker (nạp lại file config trong tiến trình con, argv khác) thấy cùng danh sách project.
const argv = process.argv;
const targets = (names: string[]) => argv.some((a, i) => names.some((n) => a === `--project=${n}` || (a === "--project" && argv[i + 1] === n)));
const wantsVisual = process.env.YUGEN_E2E_VISUAL === "1" || targets(["visual"]);
if (wantsVisual) process.env.YUGEN_E2E_VISUAL = "1";
const wantsEngines = process.env.YUGEN_E2E_ENGINES === "1" || targets(["firefox", "webkit", "touch-webkit"]);
if (wantsEngines) process.env.YUGEN_E2E_ENGINES = "1";

const desktop = {
  ...devices["Desktop Chrome"],
  ...browser,
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce" as const,
  locale: "vi-VN",
  timezoneId: "Asia/Ho_Chi_Minh",
};

const INTERACTION = /(drag|carousel|keyboard|docs-flows|motion|theme-designer)\.spec\.ts/;
const TOUCH = /(touch|responsive)\.spec\.ts/;
const prefs = { reducedMotion: "reduce" as const, locale: "vi-VN", timezoneId: "Asia/Ho_Chi_Minh" };

const projects: Project[] = [
  { name: "a11y", testMatch: /a11y\.spec\.ts/, use: desktop },
  { name: "interaction", testMatch: INTERACTION, use: desktop },
  {
    name: "touch",
    testMatch: TOUCH,
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

// Không chạy a11y trên engine khác: kết quả axe không phụ thuộc engine.
if (wantsEngines) {
  const size = { viewport: { width: 1280, height: 800 } };
  projects.push(
    { name: "firefox", testMatch: INTERACTION, use: { ...devices["Desktop Firefox"], ...size, ...prefs } },
    { name: "webkit", testMatch: INTERACTION, use: { ...devices["Desktop Safari"], ...size, ...prefs } },
    { name: "touch-webkit", testMatch: TOUCH, use: { ...devices["iPhone 15"], viewport: { width: 390, height: 844 }, ...prefs } },
  );
}

export default defineConfig({
  testDir: "e2e",
  // Gom route docs từ sidebar sau khi webServer chạy, trước khi nạp spec (a11y.spec.ts sinh test theo route).
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: CI,
  // CI thử lại một lần để không chặn PR vì lỗi mạng / runner; test chập chờn vẫn hiện là "flaky" trong báo cáo.
  retries: CI ? 1 : 0,
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
    command: DEV
      ? `npm run dev -- --port ${PORT} --strictPort`
      : `npm run build:docs && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
