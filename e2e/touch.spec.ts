import { test, expect, type Locator, type Page } from "@playwright/test";
import { center, touchDrag } from "./touch";
import { openDocs } from "./utils";

/**
 * Giả lập điện thoại (390×844, hasTouch, isMobile): bottom sheet kéo / vuốt và carousel vuốt.
 * Cử chỉ đi qua CDP touch thật (xem ./touch.ts), không phải PointerEvent tự dựng.
 */

test.describe("Sheet — bottom sheet trên mobile", () => {
  /** Demo "Bộ lọc" ở hero: snapPoints [0.6, 0.92]. */
  async function openFilter(page: Page) {
    await openDocs(page, "#/components/sheet");
    const trigger = page.getByRole("button", { name: "Bộ lọc" }).first();
    await trigger.tap();
    const sheet = page.getByRole("dialog", { name: "Bộ lọc" });
    await expect(sheet).toBeVisible();
    const handle = sheet.getByRole("button", { name: /^Đổi chiều cao/ });
    return { trigger, sheet, handle };
  }

  /** Phần sheet còn thấy được tính từ đáy khung nhìn (px). */
  async function visibleHeight(page: Page, sheet: Locator) {
    const box = await sheet.boundingBox();
    if (!box) return 0;
    return page.viewportSize()!.height - box.y;
  }

  async function handlePoint(handle: Locator) {
    const box = await handle.boundingBox();
    if (!box) throw new Error("Không thấy tay nắm");
    return center(box);
  }

  test("mở ở nấc thấp nhất, kéo tay nắm lên nấc cao, kéo xuống quá ngưỡng thì đóng", async ({ page }) => {
    const { trigger, sheet, handle } = await openFilter(page);
    const vh = page.viewportSize()!.height;
    await expect(sheet).toHaveAttribute("data-sheet", "bottom");
    await expect(handle).toHaveAttribute("aria-label", "Đổi chiều cao (60%)");
    expect(Math.abs((await visibleHeight(page, sheet)) - 0.6 * vh)).toBeLessThan(4);

    // Kéo chậm lên 300px rồi giữ yên → bám nấc gần nhất (92%).
    const start = await handlePoint(handle);
    await touchDrag(page, start, { x: start.x, y: start.y - 300 }, { hold: 200 });
    await expect(handle).toHaveAttribute("aria-label", "Đổi chiều cao (92%)");
    await expect.poll(() => visibleHeight(page, sheet)).toBeGreaterThan(0.92 * vh - 4);

    // Kéo xuống gần hết (phần còn thấy < nửa nấc thấp nhất) → đóng, focus về nút mở.
    const top = await handlePoint(handle);
    await touchDrag(page, top, { x: top.x, y: Math.min(vh - 4, top.y + 700) }, { steps: 14, hold: 200 });
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("kéo xuống ít rồi thả → bật về nấc cũ (chưa qua ngưỡng)", async ({ page }) => {
    const { sheet, handle } = await openFilter(page);
    const vh = page.viewportSize()!.height;
    const start = await handlePoint(handle);
    await touchDrag(page, start, { x: start.x, y: start.y + 120 }, { hold: 200 });
    await expect(sheet).toBeVisible();
    await expect(handle).toHaveAttribute("aria-label", "Đổi chiều cao (60%)");
    await expect.poll(() => visibleHeight(page, sheet)).toBeGreaterThan(0.6 * vh - 4);
  });

  test("vuốt nhanh xuống ở nấc thấp nhất thì đóng", async ({ page }) => {
    const { trigger, sheet, handle } = await openFilter(page);
    const start = await handlePoint(handle);
    // 120px trong ~40ms: vận tốc vượt ngưỡng vuốt dù quãng đường chưa tới nửa sheet.
    await touchDrag(page, start, { x: start.x, y: start.y + 120 }, { steps: 5, stepMs: 8 });
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("chạm tay nắm đổi nấc; Esc đóng và trả focus về nút mở", async ({ page }) => {
    const { trigger, sheet, handle } = await openFilter(page);
    await handle.tap();
    await expect(handle).toHaveAttribute("aria-label", "Đổi chiều cao (92%)");
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("Carousel — vuốt trên màn hình cảm ứng", () => {
  async function swipe(page: Page, viewport: Locator, direction: "left" | "right") {
    const box = await viewport.boundingBox();
    if (!box) throw new Error("Không thấy carousel");
    const y = box.y + box.height / 2;
    const [fromX, toX] = direction === "left" ? [0.8, 0.2] : [0.2, 0.8];
    await touchDrag(page, { x: box.x + box.width * fromX, y }, { x: box.x + box.width * toX, y });
  }

  for (const dir of ["ltr", "rtl"] as const) {
    test(`vuốt chuyển slide (${dir})`, async ({ page }) => {
      await openDocs(page, "#/components/carousel", { dir });
      const carousel = page.locator('section[aria-label="Điểm nổi bật"]').first();
      await carousel.scrollIntoViewIfNeeded();
      const viewport = carousel.locator(".snap-x");
      const current = carousel.getByRole("tab", { selected: true });
      await expect(current).toHaveAttribute("aria-label", "Slide 1 / 4");

      // "Tiếp theo" theo chiều đọc: LTR vuốt sang trái, RTL vuốt sang phải.
      await swipe(page, viewport, dir === "ltr" ? "left" : "right");
      await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");
      await swipe(page, viewport, dir === "ltr" ? "right" : "left");
      await expect(current).toHaveAttribute("aria-label", "Slide 1 / 4");
    });
  }
});
