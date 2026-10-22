import { test, expect } from "@playwright/test";
import { openDocs } from "./utils";

/** Foundations › Motion (#45): playground, xem trước giảm chuyển động, bản tiếng Anh. */

test("playground: chọn thuộc tính và thời lượng, chạy, chép đúng class", async ({ page }) => {
  await openDocs(page, "#/foundations/motion");
  const playground = page.locator("#playground");
  await playground.getByLabel("Thuộc tính").selectOption("scale");
  await playground.getByLabel("B · Thời lượng").selectOption("duration-slow");
  await expect(playground.locator("pre")).toContainText("/* B */ transition-[scale] duration-slow ease-linear");

  const stage = playground.locator("[aria-hidden] > span").first();
  await expect(stage).toHaveClass(/scale-50/);
  await playground.getByRole("button", { name: "Chạy" }).click();
  await expect(stage).toHaveClass(/scale-100/);
  await expect(playground.getByRole("button", { name: "Chạy ngược" })).toBeVisible();
});

test("xem trước giảm chuyển động: Drawer bỏ trượt, Dialog vẫn mờ dần; rời trang thì tắt", async ({ page }) => {
  await openDocs(page, "#/foundations/motion");
  const patterns = page.locator("#patterns");
  const animation = (name: string) =>
    page.getByRole("dialog", { name }).evaluate((el) => getComputedStyle(el).animationName);

  await patterns.getByRole("switch", { name: "Xem trước giảm chuyển động trên trang này" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion-preview", "reduce");

  await patterns.getByRole("button", { name: "Mở Drawer" }).click();
  expect(await animation("Drawer")).toBe("none");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Drawer" })).toBeHidden();

  await patterns.getByRole("button", { name: "Mở Dialog" }).click();
  expect(await animation("Lưu thay đổi?")).not.toBe("none");
  await page.keyboard.press("Escape");

  await page.goto("/#/foundations/color");
  await expect(page.locator("html")).not.toHaveAttribute("data-motion-preview", /.*/);
});

test("bản tiếng Anh: không có thông báo trang chưa dịch, mục lục tiếng Anh", async ({ page }) => {
  await openDocs(page, "#/foundations/motion");
  await page.getByRole("button", { name: /English/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Reduced motion" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("button", { name: "Do and don't" })).toBeVisible();
  await expect(page.locator("main [lang=vi]")).toHaveCount(0);
  await expect(page.getByText("This page hasn't been translated yet")).toHaveCount(0);
});
