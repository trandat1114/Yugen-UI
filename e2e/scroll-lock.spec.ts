import { test, expect, type Locator, type Page } from "@playwright/test";
import { openDocs } from "./utils";

/**
 * Khoá cuộn (#243): Menu, ContextMenu, Dropdown khoá cuộn trang qua react-remove-scroll. Với
 * `data-yugen-scroll-lock="keep-scrollbar"` trên <html>, thanh cuộn của trang vẫn hiện: body không được bù lề và overflow
 * của <html> là auto. Playwright headless ẩn thanh cuộn (bề rộng 0) nên kiểm computed style, không đo pixel.
 * Demo ở mục Khoá cuộn của trang Định vị.
 */
const ROUTE = "/concepts/positioning";

function lockState(page: Page) {
  return page.evaluate(() => ({
    locked: document.body.hasAttribute("data-scroll-locked"),
    marginRight: getComputedStyle(document.body).marginRight,
    overflowY: getComputedStyle(document.documentElement).overflowY,
  }));
}

/** Mở từng bề mặt, kiểm trạng thái khoá trong lúc mở, đóng bằng Esc. */
async function eachSurface(page: Page, section: Locator, check: () => Promise<void>) {
  await section.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  await section.getByText("Nhấn chuột phải vào đây").click({ button: "right" });
  await expect(page.getByRole("menu")).toBeVisible();
  await check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);

  await section.getByRole("combobox", { name: "Trạng thái" }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

test.describe("Khoá cuộn", () => {
  test("keep-scrollbar: Menu, ContextMenu, Dropdown giữ thanh cuộn của trang", async ({ page }) => {
    await openDocs(page, ROUTE);
    const section = page.locator("#scroll-lock");
    await section.getByRole("switch", { name: "Giữ thanh cuộn" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-yugen-scroll-lock", "keep-scrollbar");

    await eachSurface(page, section, async () => {
      expect(await lockState(page)).toEqual({ locked: true, marginRight: "0px", overflowY: "auto" });
    });
    expect((await lockState(page)).locked).toBe(false);
  });

  test("mặc định: khoá như Radix (overflow của trang theo body)", async ({ page }) => {
    await openDocs(page, ROUTE);
    const section = page.locator("#scroll-lock");
    await expect(page.locator("html")).not.toHaveAttribute("data-yugen-scroll-lock");
    await eachSurface(page, section, async () => {
      const state = await lockState(page);
      expect(state.locked).toBe(true);
      expect(state.overflowY).toBe("visible");
    });
  });

  test("Menu modal={false} không khoá cuộn", async ({ page }) => {
    await openDocs(page, ROUTE);
    const section = page.locator("#scroll-lock");
    await section.getByRole("button", { name: "Menu không modal" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    expect((await lockState(page)).locked).toBe(false);
  });
});
