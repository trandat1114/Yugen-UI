import { expect, type Page } from "@playwright/test";

export type Theme = "light" | "dark" | "high-contrast";
export type Dir = "ltr" | "rtl";

export interface Appearance {
  theme?: Theme;
  dir?: Dir;
  brand?: "sakura" | "web" | "teams";
  /**
   * Ngôn ngữ của trang. Docs mặc định tiếng Anh ở gốc, tiếng Việt dưới /vi/ (#277); test mặc định mở bản tiếng Việt vì
   * phần lớn assertion và ảnh visual viết theo chữ tiếng Việt.
   */
  lang?: "vi" | "en";
}

/**
 * URL docs: đường dẫn trang ("/components/button", không gồm ngôn ngữ) + query theme/brand/dir (script trong index.html
 * áp trước khi render); `lang: "vi"` thêm tiền tố /vi.
 */
export function docsUrl(route: string, { theme = "light", dir = "ltr", brand = "sakura", lang = "vi" }: Appearance = {}) {
  return `${lang === "vi" ? `/vi${route === "/" ? "/" : route}` : route}?theme=${theme}&brand=${brand}&dir=${dir}`;
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
/**
 * Dữ liệu người đóng góp mới nhất (#272): trang /contributors tải từ nhánh contributors-data trên GitHub. Mặc định bị chặn
 * để test không phụ thuộc mạng và dữ liệu thật; test cần thì truyền `live: true` và tự route URL này.
 */
export const CONTRIBUTORS_LIVE = "https://raw.githubusercontent.com/**/contributors-data/contributors.json";

export async function openDocs(
  page: Page,
  route: string,
  appearance: Appearance = {},
  { freeze = true, live = false, suggest = false } = {},
) {
  if (!live) await page.route(CONTRIBUTORS_LIVE, (request) => request.abort());
  // Mọi project chạy với locale vi-VN nên bản tiếng Anh sẽ gợi ý tiếng Việt (#277): tắt sẵn, test cần thì `suggest: true`.
  if (!suggest) await page.addInitScript(() => localStorage.setItem("yugen-docs-language-suggestion", "1"));
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
