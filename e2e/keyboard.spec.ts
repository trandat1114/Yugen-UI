import { test, expect, type Locator, type Page } from "@playwright/test";
import { openDocs } from "./utils";

/**
 * Bàn phím, focus và live region trên trình duyệt thật — phần jsdom không kiểm được (#39). Dùng demo đầu trang
 * (hero) của từng component, tìm theo role / tên như người dùng trình đọc màn hình.
 */
const containsFocus = (el: Locator) => el.evaluate((node) => node.contains(document.activeElement));

async function bodyScrollLocked(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).overflow === "hidden");
}

test.describe("Dialog", () => {
  test("focus vào trong, Tab không thoát, Esc đóng và trả focus, nền không cuộn", async ({ page }) => {
    await openDocs(page, "#/components/dialog");
    const trigger = page.getByRole("button", { name: "Xoá tệp" }).first();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: /Báo cáo Q3/ });
    await expect(dialog).toBeVisible();
    await expect.poll(() => containsFocus(dialog)).toBe(true);
    expect(await bodyScrollLocked(page)).toBe(true);

    for (const key of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      expect(await containsFocus(dialog), `focus rời hộp thoại sau ${key}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await bodyScrollLocked(page)).toBe(false);
  });
});

test.describe("Menu", () => {
  test("Enter mở; mũi tên, Home, End và gõ chữ cái di chuyển; Esc đóng và trả focus", async ({ page }) => {
    await openDocs(page, "#/components/menu");
    const trigger = page.getByRole("button", { name: "Thao tác" }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const items = menu.getByRole("menuitem");

    await expect(items.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(items.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("s");
    await expect(menu.getByRole("menuitem", { name: /Sao chép/ })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("Combobox", () => {
  test("gõ không dấu để lọc, mũi tên duyệt, Enter chọn, Esc đóng; danh sách nằm trong màn 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openDocs(page, "#/components/combobox");
    const input = page.getByRole("combobox", { name: "Thành phố" }).first();
    await input.click();
    await input.fill("da nang");
    const listbox = page.getByRole("listbox");
    const option = listbox.getByRole("option", { name: "Đà Nẵng" });
    await expect(option).toBeVisible();

    const box = await listbox.boundingBox();
    expect(box, "listbox không hiện").not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Đà Nẵng");
    await expect(listbox).toBeHidden();

    await input.fill("h");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(input).toBeFocused();
  });
});

test.describe("DatePicker", () => {
  test("mở bằng bàn phím, mũi tên đổi ngày, Enter chọn, lịch đóng và focus quay về ô", async ({ page }) => {
    await openDocs(page, "#/components/datepicker");
    const field = page.getByRole("combobox", { name: "Ngày bắt đầu" }).first();
    await field.focus();
    await page.keyboard.press("Enter");
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();
    await expect.poll(() => containsFocus(grid)).toBe(true);

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(grid).toBeHidden();
    await expect(field).toHaveText(/\d{2}\/\d{2}\/\d{4}/);
    await expect(field).toBeFocused();
  });
});

test.describe("Toast", () => {
  test("hiện trong vùng thông báo mà không lấy focus; F8 tới vùng đó; đóng bằng bàn phím", async ({ page }) => {
    await openDocs(page, "#/components/toast");
    const button = page.getByRole("button", { name: "Lưu tài liệu" });
    // Bấm bằng bàn phím: Safari / WebKit không đặt focus vào nút khi click chuột.
    await button.focus();
    await page.keyboard.press("Enter");
    // Trang có một Toaster cho mỗi ví dụ: lấy đúng vùng đang chứa toast.
    const toast = page.getByRole("listitem").filter({ hasText: "Đã lưu thay đổi" });
    await expect(toast).toBeVisible();
    await expect(page.getByRole("region", { name: /Thông báo/ }).filter({ has: toast })).toHaveCount(1);
    await expect(button).toBeFocused();

    // Mỗi Toaster của trang demo đăng ký F8; app thật chỉ có một, nên chỉ cần focus vào một vùng thông báo.
    await page.keyboard.press("F8");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.closest("[role=region]")?.getAttribute("aria-label") ?? ""))
      .toMatch(/Thông báo/);
    const close = toast.getByRole("button", { name: /Đóng/ });
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(toast).toBeHidden();
  });
});
