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
 * Mọi trang component ở 375px (#259, #266): bảng props và bảng Messages không tràn, trang không cuộn ngang, và chữ registry
 * (mô tả trang, mô tả ví dụ, nên / không nên, props, mô tả khoá messages) không còn backtick thô. Hai bảng cắt phần tràn
 * (overflow-hidden) nên phải đo chính khung bảng và từng ô: đo cả trang không thấy được chữ bị cắt. Ở bố cục một khối mỗi
 * khoá, hàng tiêu đề chỉ còn cho trình đọc màn hình, nên mỗi khoá phải tự hiện giá trị tiếng Việt và tiếng Anh kèm nhãn.
 */
const COMPONENT_ROUTES = readDiscoveredRoutes().filter((route) => route.startsWith("/components/"));
const REGISTRY_TEXT = "main header:has(> h1), #variants h3 + p, #usage li, #props table, #messages td p";

for (const route of COMPONENT_ROUTES) {
  test(`375px: bảng props, bảng Messages và chữ registry · ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "touch", "bố cục đo trên Chromium là đủ");
    await page.setViewportSize({ width: 375, height: 800 });
    await openDocs(page, route);
    await expect(page.getByRole("table", { name: "Bảng props" })).toBeVisible();
    // Bảng Messages nạp lười (Suspense) sau khi trang đã sẵn sàng.
    if ((await page.locator("#messages").count()) > 0) await expect(page.locator("#messages table").first()).toBeVisible();
    const result = await page.evaluate((selector) => {
      const tables = [document.querySelector('table[aria-label="Bảng props"]')!, ...document.querySelectorAll("#messages table")];
      const overflows = (el: Element) => el.scrollWidth - el.clientWidth > 1;
      const raw: string[] = [];
      for (const root of document.querySelectorAll(selector)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent ?? "";
          if (!node.parentElement?.closest("code") && /`[^`]+`/.test(text)) raw.push(text.trim());
        }
      }
      // Giá trị là code, "—" khi không có, hoặc link "xem mã nguồn" với giá trị dài; nằm trọn trong khung bảng.
      const unlabeled: string[] = [];
      for (const row of document.querySelectorAll<HTMLTableRowElement>("#messages tbody tr")) {
        const box = row.closest("table")!.parentElement!.getBoundingClientRect();
        const shows = (el: Element | null | undefined) => {
          if (!el?.checkVisibility() || !el.textContent?.trim()) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.left >= box.left - 1 && r.right <= box.right + 1;
        };
        for (const lang of ["vi", "en"]) {
          const value = row.querySelector(`:scope > td > [lang="${lang}"]`);
          const content = value && (value.querySelector("code, a") ?? (value.textContent?.trim() === "—" ? value : null));
          if (!shows(value?.previousElementSibling) || !shows(content)) unlabeled.push(`${row.cells[0]?.textContent?.slice(0, 40)} · ${lang}`);
        }
      }
      return {
        clipped: tables.flatMap((table) => [table.parentElement!, ...table.querySelectorAll("td")]).filter(overflows).map((el) => el.textContent?.slice(0, 60)),
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        raw,
        unlabeled,
      };
    }, REGISTRY_TEXT);
    expect(result.clipped, "bảng props / Messages tràn khung").toEqual([]);
    expect(result.unlabeled, "khoá messages thiếu giá trị hoặc nhãn tiếng Việt / tiếng Anh").toEqual([]);
    expect(result.raw, "backtick chưa thành <code>").toEqual([]);
    expect(result.pageOverflow).toBeLessThanOrEqual(0);
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
