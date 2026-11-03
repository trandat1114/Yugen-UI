import { test, expect } from "@playwright/test";
import { readDiscoveredRoutes } from "./routes";
import { openDocs } from "./utils";

/**
 * Bố cục màn nhỏ (project `touch`): không cuộn ngang ở các bề ngang chuẩn, điều khiển chính của thanh trên vẫn dùng
 * được ở 360px, và các phần chọn bằng chạm trên trang chủ.
 */
const WIDTHS = [360, 768, 1024];
const ROUTES = ["/", "/components/button"];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`không tràn ngang · ${width}px · ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openDocs(page, route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

/**
 * Mọi trang component ở 375px (#259): bảng props không tràn, trang không cuộn ngang, và chữ registry (mô tả trang, mô tả
 * ví dụ, nên / không nên, props) không còn backtick thô. Bảng props cắt phần tràn (overflow-hidden) nên phải đo chính
 * khung bảng và từng ô: đo cả trang không thấy được chữ bị cắt.
 */
const COMPONENT_ROUTES = readDiscoveredRoutes().filter((route) => route.startsWith("/components/"));
/** Demo còn rộng hơn trang ở 375px (#266). Sửa xong thì bỏ khỏi danh sách. */
const KNOWN_OVERFLOW = ["/components/codeblock", "/components/focusmanagement", "/components/streamingmarkdown"];
const REGISTRY_TEXT = "main header:has(> h1), #variants h3 + p, #usage li, #props table";

for (const route of COMPONENT_ROUTES) {
  test(`375px: bảng props và chữ registry · ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "touch", "bố cục đo trên Chromium là đủ");
    await page.setViewportSize({ width: 375, height: 800 });
    await openDocs(page, route);
    await expect(page.getByRole("table", { name: "Bảng props" })).toBeVisible();
    const result = await page.evaluate((selector) => {
      const table = document.querySelector('table[aria-label="Bảng props"]')!;
      const overflows = (el: Element) => el.scrollWidth - el.clientWidth > 1;
      const raw: string[] = [];
      for (const root of document.querySelectorAll(selector)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent ?? "";
          if (!node.parentElement?.closest("code") && /`[^`]+`/.test(text)) raw.push(text.trim());
        }
      }
      return {
        clipped: [table.parentElement!, ...table.querySelectorAll("td")].filter(overflows).map((el) => el.textContent?.slice(0, 60)),
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        raw,
      };
    }, REGISTRY_TEXT);
    expect(result.clipped, "bảng props tràn khung").toEqual([]);
    expect(result.raw, "backtick chưa thành <code>").toEqual([]);
    if (!KNOWN_OVERFLOW.includes(route)) expect(result.pageOverflow).toBeLessThanOrEqual(0);
  });
}

test("360px: đổi ngôn ngữ và giao diện từ thanh trên", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openDocs(page, "/");
  const header = page.locator("header").first();

  await header.getByRole("button", { name: /English/ }).tap();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await header.getByRole("button", { name: "Appearance" }).tap();
  await page.getByRole("radiogroup", { name: "Mode" }).getByRole("radio", { name: "Dark" }).tap();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("trang chủ: chạm chip đổi nhóm showcase, chạm tên component mở demo và đóng mục cũ", async ({ page }) => {
  await openDocs(page, "/");

  const showcase = page.getByRole("radiogroup", { name: "Khám phá" });
  await showcase.getByRole("radio", { name: "Phản hồi" }).tap();
  await expect(showcase.getByRole("radio", { name: "Phản hồi" })).toHaveAttribute("aria-checked", "true");
  expect(new URL(page.url()).pathname).toBe("/");

  const button = page.locator('[data-comp="button"]');
  const link = page.locator('[data-comp="link"]');
  await button.tap();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await link.tap();
  await expect(link).toHaveAttribute("aria-expanded", "true");
  await expect(button).toHaveAttribute("aria-expanded", "false");
});
