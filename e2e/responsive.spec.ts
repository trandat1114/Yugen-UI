import { test, expect } from "@playwright/test";
import { openDocs } from "./utils";

/**
 * Bố cục màn nhỏ (project `touch`): không cuộn ngang ở các bề ngang chuẩn, điều khiển chính của thanh trên vẫn dùng
 * được ở 360px, và các phần chọn bằng chạm trên trang chủ.
 */
const WIDTHS = [360, 768, 1024];
const ROUTES = ["#/", "#/components/button"];

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

test("360px: đổi ngôn ngữ và giao diện từ thanh trên", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openDocs(page, "#/");
  const header = page.locator("header").first();

  await header.getByRole("button", { name: /English/ }).tap();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await header.getByRole("button", { name: "Appearance" }).tap();
  await page.getByRole("radiogroup", { name: "Mode" }).getByRole("radio", { name: "Dark" }).tap();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("trang chủ: chạm chip đổi nhóm showcase, chạm tên component mở demo và đóng mục cũ", async ({ page }) => {
  await openDocs(page, "#/");

  const showcase = page.getByRole("radiogroup", { name: "Khám phá" });
  await showcase.getByRole("radio", { name: "Phản hồi" }).tap();
  await expect(showcase.getByRole("radio", { name: "Phản hồi" })).toHaveAttribute("aria-checked", "true");
  await expect(page).toHaveURL(/#\/$/);

  const button = page.locator('[data-comp="button"]');
  const link = page.locator('[data-comp="link"]');
  await button.tap();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await link.tap();
  await expect(link).toHaveAttribute("aria-expanded", "true");
  await expect(button).toHaveAttribute("aria-expanded", "false");
});
