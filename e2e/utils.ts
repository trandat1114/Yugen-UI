import { expect, type Page } from "@playwright/test";

export type Theme = "light" | "dark" | "high-contrast";
export type Dir = "ltr" | "rtl";

export interface Appearance {
  theme?: Theme;
  dir?: Dir;
  brand?: "sakura" | "web" | "teams";
}

/** URL docs: đường dẫn trang ("/components/button") + query theme/brand/dir (script trong index.html áp trước khi render). */
export function docsUrl(route: string, { theme = "light", dir = "ltr", brand = "sakura" }: Appearance = {}) {
  return `${route}?theme=${theme}&brand=${brand}&dir=${dir}`;
}

/** CSS tắt mọi animation/transition — trạng thái cuối hiện ngay (axe đo tương phản không bị opacity giữa chừng). */
export const FREEZE_MOTION_CSS = `
*, *::before, *::after {
  animation-delay: 0s !important;
  animation-duration: 0s !important;
  animation-iteration-count: 1 !important;
  transition-delay: 0s !important;
  transition-duration: 0s !important;
  scroll-behavior: auto !important;
}`;

/** Chờ trang docs ổn định: React đã thay HTML prerender, có `main h1`, thanh PageProgress (route/concept lười) đã tắt, font đã nạp. */
export async function waitForDocsReady(page: Page) {
  await expect(page.locator("html[data-docs-ready]")).toHaveCount(1, { timeout: 30_000 });
  await expect(page.locator("main h1").first()).toBeVisible({ timeout: 30_000 });
  // Nội dung nạp lười (demo component, trang khái niệm): khung xương đánh dấu data-page-loading render cùng h1.
  await expect(page.locator("main [data-page-loading]")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByRole("progressbar", { name: "Đang tải trang" })).toHaveCount(0, { timeout: 30_000 });
  // Màn chờ của dev server (#236, src/docs/boot): tự gỡ sau khi chạy nốt tới 100.
  await expect(page.locator("#yugen-boot")).toHaveCount(0, { timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** Mở một route docs với theme/hướng chữ cho trước và chờ trang sẵn sàng. */
export async function openDocs(page: Page, route: string, appearance: Appearance = {}, { freeze = true } = {}) {
  // Không chờ "load" (ảnh, font, mọi module): đã chờ h1 + PageProgress bên dưới.
  await page.goto(docsUrl(route, appearance), { waitUntil: "domcontentloaded" });
  await waitForDocsReady(page);
  if (freeze) await page.addStyleTag({ content: FREEZE_MOTION_CSS });
}

/** Tên ổn định cho test/ảnh chụp từ một route: "/components/button" → "components-button". */
export function routeSlug(route: string) {
  const s = route.replace(/^\//, "").replace(/\//g, "-");
  return s || "home";
}
