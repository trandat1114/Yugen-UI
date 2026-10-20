import { test, expect, type Locator, type Page } from "@playwright/test";
import { openDocs } from "./utils";

/**
 * Tương tác chuột / bàn phím trên desktop: Resizable (kéo, phím mũi tên, thu gọn, persistKey, RTL lật) và
 * Sheet dạng panel cạnh (LTR từ phải, RTL từ trái).
 */

async function width(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Phần tử không hiển thị");
  return box.width;
}

async function height(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Phần tử không hiển thị");
  return box.height;
}

/** Kéo chuột từ tâm phần tử thêm (dx, dy) theo nhiều bước (thư viện cần chuỗi pointermove). */
async function mouseDrag(page: Page, handle: Locator, dx: number, dy: number) {
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error("Không thấy đường chia");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
}

test.describe("Resizable", () => {
  const sidebar = (page: Page) => page.locator("#ide-sidebar");
  const sidebarHandle = (page: Page) => page.locator("#ide-sidebar + [role=separator]");

  test("kéo chuột đường chia đổi kích thước panel (ngang và dọc)", async ({ page }) => {
    await openDocs(page, "#/components/resizable");
    const before = await width(sidebar(page));
    await mouseDrag(page, sidebarHandle(page), 100, 0);
    await expect.poll(() => width(sidebar(page))).toBeGreaterThan(before + 90);
    expect(await width(sidebar(page))).toBeLessThan(before + 110);

    // Nhóm dọc lồng bên trong: kéo xuống làm editor cao thêm.
    const editor = page.locator("#ide-editor");
    const editorBefore = await height(editor);
    await mouseDrag(page, page.locator("#ide-editor + [role=separator]"), 0, 40);
    await expect.poll(() => height(editor)).toBeGreaterThan(editorBefore + 30);
  });

  test("bàn phím: focus đường chia, mũi tên đổi kích thước, Enter thu gọn / mở rộng", async ({ page }) => {
    await openDocs(page, "#/components/resizable");
    const handle = sidebarHandle(page);
    const start = await width(sidebar(page));
    await handle.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => width(sidebar(page))).toBeGreaterThan(start + 20);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => width(sidebar(page))).toBeLessThan(start - 20);

    // collapsible + collapseButton: Enter thu về 0 rồi mở lại.
    const opened = await width(sidebar(page));
    await page.keyboard.press("Enter");
    await expect.poll(() => width(sidebar(page))).toBeLessThan(2);
    await page.keyboard.press("Enter");
    await expect.poll(() => width(sidebar(page))).toBeGreaterThan(opened - 2);
  });

  test("nút thu gọn trên đường chia (chuột) thu và mở panel collapsible", async ({ page }) => {
    await openDocs(page, "#/components/resizable");
    const toggle = sidebarHandle(page).locator("[data-resizable-action]");
    await expect(toggle).toHaveAttribute("title", "Thu gọn panel");
    await toggle.click();
    await expect.poll(() => width(sidebar(page))).toBeLessThan(2);
    await expect(toggle).toHaveAttribute("title", "Mở rộng panel");
    await toggle.click();
    await expect.poll(() => width(sidebar(page))).toBeGreaterThan(100);
    // Bấm nút không được biến thành thao tác kéo / focus nhầm: đường chia nhận focus để dùng tiếp bằng phím.
    await expect(sidebarHandle(page)).toBeFocused();
  });

  test("persistKey khôi phục bố cục sau khi tải lại", async ({ page }) => {
    await openDocs(page, "#/components/resizable");
    const folders = page.locator("#mail-folders");
    const before = await width(folders);
    await mouseDrag(page, page.locator("#mail-folders + [role=separator]"), 80, 0);
    await expect.poll(() => width(folders)).toBeGreaterThan(before + 60);
    const dragged = await width(folders);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("react-resizable-panels:yugen-docs-mail")))
      .not.toBeNull();

    await page.reload();
    await page.locator("main h1").first().waitFor();
    await expect.poll(() => width(page.locator("#mail-folders"))).toBeGreaterThan(dragged - 3);
    expect(await width(page.locator("#mail-folders"))).toBeLessThan(dragged + 3);
  });

  test("RTL: nhóm ngang lật, kéo / phím theo hướng nhìn thấy", async ({ page }) => {
    await openDocs(page, "#/components/resizable", { dir: "rtl" });
    const panel = sidebar(page);
    const handle = sidebarHandle(page);
    await expect(handle).toHaveAttribute("data-mirrored", "true");

    // Panel đầu tiên (thanh bên) nằm bên phải đường chia.
    const panelBox = (await panel.boundingBox())!;
    const handleBox = (await handle.boundingBox())!;
    expect(panelBox.x).toBeGreaterThanOrEqual(handleBox.x);

    // Kéo đường chia sang TRÁI 100px → thanh bên (bên phải) rộng thêm ~100px.
    const before = await width(panel);
    await mouseDrag(page, handle, -100, 0);
    await expect.poll(() => width(panel)).toBeGreaterThan(before + 90);
    expect(await width(panel)).toBeLessThan(before + 110);

    // Kéo sang PHẢI → hẹp lại.
    const wide = await width(panel);
    await mouseDrag(page, handle, 60, 0);
    await expect.poll(() => width(panel)).toBeLessThan(wide - 50);

    // ArrowLeft đẩy đường chia sang trái (thanh bên rộng ra), ArrowRight ngược lại.
    const mid = await width(panel);
    await handle.focus();
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => width(panel)).toBeGreaterThan(mid + 20);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => width(panel)).toBeLessThan(mid - 20);
  });

  test("ví dụ RTL lồng (DirectionProvider) trên trang LTR cũng kéo đúng hướng", async ({ page }) => {
    await openDocs(page, "#/components/resizable");
    const handle = page.locator("[role=separator][data-mirrored]");
    await expect(handle).toHaveCount(1);
    // Panel đầu (DOM) đứng ngay trước đường chia, hiển thị bên phải.
    const first = page.locator("[data-panel]:has(+ [role=separator][data-mirrored])");
    const before = await width(first);
    await mouseDrag(page, handle, -60, 0);
    await expect.poll(() => width(first)).toBeGreaterThan(before + 50);
  });
});

test.describe("Sheet (desktop)", () => {
  async function openFilter(page: Page) {
    const trigger = page.getByRole("button", { name: "Bộ lọc" }).first();
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Bộ lọc" });
    await expect(sheet).toBeVisible();
    return { trigger, sheet };
  }

  test("panel trượt từ cạnh cuối (phải ở LTR), Esc đóng và trả focus", async ({ page }) => {
    await openDocs(page, "#/components/sheet");
    const { trigger, sheet } = await openFilter(page);
    await expect(sheet).toHaveAttribute("data-sheet", "end");
    const box = (await sheet.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(Math.abs(box.x + box.width - viewport.width)).toBeLessThanOrEqual(1);
    expect(box.height).toBeGreaterThan(viewport.height - 2);
    expect(box.width).toBeLessThan(viewport.width / 2);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("RTL: panel đến từ cạnh trái", async ({ page }) => {
    await openDocs(page, "#/components/sheet", { dir: "rtl" });
    const { sheet } = await openFilter(page);
    await expect(sheet).toHaveAttribute("data-sheet", "end");
    const box = (await sheet.boundingBox())!;
    expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
    await sheet.getByRole("button", { name: "Huỷ" }).click();
    await expect(sheet).toBeHidden();
  });
});
