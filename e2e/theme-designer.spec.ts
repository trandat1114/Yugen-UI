import { test, expect, type Page } from "@playwright/test";
import { openDocs } from "./utils";

/** Theme Designer (#44): các trục đổi bản xem trước, kiểm tra, CSS xuất và link chia sẻ. */

const preview = (page: Page, theme: "light" | "dark" | "high-contrast") => page.locator(`#preview [data-brand="custom"][data-theme="${theme}"]`);
const computed = (page: Page, selector: string, prop: string) =>
  preview(page, "light")
    .locator(selector)
    .first()
    .evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test("bo góc, mật độ và màu trung tính đổi bản xem trước; CSS xuất có đủ khối light / dark", async ({ page }) => {
  await openDocs(page, "/theme-designer");
  const primary = 'button:has-text("Primary")';
  expect(await computed(page, primary, "border-radius")).toBe("4px");
  expect(await computed(page, primary, "height")).toBe("32px");

  await page.getByRole("radiogroup", { name: "Bo góc" }).getByRole("radio", { name: "Lớn" }).click();
  await page.getByRole("radiogroup", { name: "Mật độ" }).getByRole("radio", { name: "Thoáng" }).click();
  await page.getByRole("radiogroup", { name: "Màu trung tính" }).getByRole("radio", { name: "Ấm" }).click();
  expect(await computed(page, primary, "border-radius")).toBe("6px");
  expect(await computed(page, primary, "height")).toBe("36px");

  // High contrast không nhận màu trung tính pha sắc.
  const hcVars = await preview(page, "high-contrast").evaluate((el) => (el as HTMLElement).style.getPropertyValue("--grey-14"));
  expect(hcVars).toBe("");
  await expect(page.getByText("Chữ trên nền trung tính (light, dark)")).toBeVisible();

  const css = page.locator("#export pre").first();
  await expect(css).toContainText('[data-brand="my-brand"] {');
  await expect(css).toContainText("--borderRadiusMedium: 6px;");
  await expect(css).toContainText("--spacing: 0.2813rem;");
  await expect(css).toContainText('[data-brand="my-brand"][data-theme="light"] {');
  await expect(css).toContainText('[data-brand="my-brand"][data-theme="dark"] {');
});

test("mật độ gọn báo vùng bấm dưới 24px", async ({ page }) => {
  await openDocs(page, "/theme-designer");
  await page.getByRole("radiogroup", { name: "Mật độ" }).getByRole("radio", { name: "Gọn" }).click();
  await expect(page.getByText("Control size small dưới 24px")).toBeVisible();
  await expect(page.getByText("22.5px").first()).toBeVisible();
});

test("link chia sẻ khôi phục mọi lựa chọn", async ({ page }) => {
  await page.goto("/theme-designer?td-key=03787C&td-radius=full&td-size=16&td-elevation=flat&td-name=acme", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Theme Designer" })).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Bo góc" }).getByRole("radio", { name: "Tròn" })).toBeChecked();
  await expect(page.getByRole("radiogroup", { name: "Cỡ chữ gốc" }).getByRole("radio", { name: "16px" })).toBeChecked();
  await expect(page.getByRole("radiogroup", { name: "Độ nổi" }).getByRole("radio", { name: "Phẳng" })).toBeChecked();
  await expect(page.getByLabel("Mã HEX")).toHaveValue("#03787C");
  const css = page.locator("#export pre").first();
  await expect(css).toContainText('[data-brand="acme"] {');
  await expect(css).toContainText("--fontSizeBase300: 16px;");
  await expect(css).toContainText("--shadow4: none;");
});
