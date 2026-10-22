import { test, expect } from "@playwright/test";
import { openDocs, waitForDocsReady } from "./utils";

/** Các luồng chính của site docs (#39): bảng lệnh, ngôn ngữ và giao diện còn giữ sau khi tải lại, nút copy lệnh. */

test("Ctrl K mở bảng lệnh, gõ để tìm, Enter chuyển trang", async ({ page }) => {
  await openDocs(page, "#/");
  await page.keyboard.press("Control+K");
  const search = page.getByPlaceholder("Tìm trang, component, khái niệm hoặc lệnh…");
  await expect(search).toBeFocused();
  await search.fill("Combobox");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#\/components\/combobox$/);
  await expect(page.getByRole("heading", { level: 1, name: "Combobox" })).toBeVisible();
});

test("ngôn ngữ và chế độ tối còn giữ sau khi tải lại", async ({ page }) => {
  await openDocs(page, "#/");
  await page.getByRole("button", { name: /English/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("button", { name: "Appearance" }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // Tải lại không kèm ?theme / ?lang: giá trị lấy từ localStorage.
  await page.goto("/#/", { waitUntil: "domcontentloaded" });
  await waitForDocsReady(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("nút copy chép đúng lệnh, chạy được trên PowerShell (không && hay -- --template)", async ({ page }) => {
  // Ghi lại chuỗi trang gửi vào clipboard thay vì đọc clipboard thật: Firefox và WebKit không cấp quyền clipboard-read
  // cho Playwright (#40), còn clipboard của Windows đổi \n thành \r\n.
  await page.addInitScript(() => {
    const w = window as unknown as { __copied: string };
    w.__copied = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text: string) => void (w.__copied = text), readText: async () => w.__copied },
    });
  });
  const clipboard = () => page.evaluate(() => (window as unknown as { __copied: string }).__copied);

  await openDocs(page, "#/");
  const create = page.locator("section").filter({ has: page.getByRole("heading", { name: "Tạo dự án nhanh" }) });
  await create.getByRole("button", { name: "Copy" }).click();
  expect(await clipboard()).toBe("npx create-yugen-ui@latest my-app --template starter");

  await openDocs(page, "#/concepts/quick-start");
  const block = page.locator("#template").locator("[class~='group/code']").first();
  await block.hover();
  await block.getByRole("button", { name: "Copy" }).click();
  const text = await clipboard();
  expect(text.split("\n")).toEqual(["npx create-yugen-ui@latest my-app --template starter", "cd my-app", "npm run dev"]);
  expect(text).not.toContain("&&");
  expect(text).not.toContain("-- --");
});
