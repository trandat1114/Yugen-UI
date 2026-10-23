import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { docsUrl, openDocs, waitForDocsReady } from "./utils";

/** Các luồng chính của site docs (#39): bảng lệnh, ngôn ngữ và giao diện còn giữ sau khi tải lại, nút copy lệnh. */

test("Ctrl K mở bảng lệnh, gõ để tìm, Enter chuyển trang", async ({ page }) => {
  await openDocs(page, "/");
  await page.keyboard.press("Control+K");
  const search = page.getByPlaceholder("Tìm trang, component, khái niệm hoặc lệnh…");
  await expect(search).toBeFocused();
  await search.fill("Combobox");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/components\/combobox$/);
  await expect(page.getByRole("heading", { level: 1, name: "Combobox" })).toBeVisible();
});

test("ngôn ngữ và chế độ tối còn giữ sau khi tải lại", async ({ page }) => {
  await openDocs(page, "/");
  await page.getByRole("button", { name: /English/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("button", { name: "Appearance" }).click();
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // Tải lại không kèm ?theme / ?lang: giá trị lấy từ localStorage.
  await page.goto("/", { waitUntil: "domcontentloaded" });
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

  await openDocs(page, "/");
  const create = page.locator("section").filter({ has: page.getByRole("heading", { name: "Tạo dự án nhanh" }) });
  await create.getByRole("button", { name: "Copy" }).click();
  expect(await clipboard()).toBe("npx create-yugen-ui@latest my-app --template starter");

  await openDocs(page, "/concepts/quick-start");
  const block = page.locator("#template").locator("[class~='group/code']").first();
  await block.hover();
  await block.getByRole("button", { name: "Copy" }).click();
  const text = await clipboard();
  expect(text.split("\n")).toEqual(["npx create-yugen-ui@latest my-app --template starter", "cd my-app", "npm run dev"]);
  expect(text).not.toContain("&&");
  expect(text).not.toContain("-- --");
});

test.describe("Sidebar kéo được độ rộng, thu về rail (#46)", () => {
  const aside = (page: Page) => page.locator("#docs-sidebar");
  const width = (page: Page) => aside(page).evaluate((el) => Math.round(el.getBoundingClientRect().width));
  /** Lề đầu của khối nội dung (cột bên phải sidebar) phải theo đúng độ rộng sidebar. */
  const contentOffset = (page: Page) =>
    page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("main")!.parentElement!).paddingInlineStart));
  const separator = (page: Page) => page.getByRole("separator", { name: "Độ rộng thanh bên" });

  async function dragBy(page: Page, dx: number) {
    const box = (await separator(page).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y, { steps: 6 });
    await page.mouse.up();
  }

  test("kéo mép đổi độ rộng trong giới hạn, giữ sau khi tải lại, nhấp đúp về mặc định", async ({ page }) => {
    await openDocs(page, "/components/button");
    expect(await width(page)).toBe(320);
    await dragBy(page, 60);
    await expect.poll(() => width(page)).toBe(380);
    expect(await contentOffset(page)).toBe(380);
    await dragBy(page, 200);
    await expect.poll(() => width(page)).toBe(400);

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForDocsReady(page);
    expect(await width(page)).toBe(400);
    await expect(separator(page)).toHaveAttribute("aria-valuenow", "400");

    await separator(page).dblclick();
    await expect.poll(() => width(page)).toBe(320);
  });

  test("bàn phím: mũi tên ±16px, Home / End, Enter thu về rail, nút mở rộng trả lại độ rộng cũ", async ({ page }) => {
    await openDocs(page, "/");
    const handle = separator(page);
    await handle.focus();
    await page.keyboard.press("ArrowRight");
    await expect(handle).toHaveAttribute("aria-valuenow", "336");
    await page.keyboard.press("Home");
    await expect(handle).toHaveAttribute("aria-valuenow", "240");
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowLeft");
    await expect(handle).toHaveAttribute("aria-valuenow", "384");

    await page.keyboard.press("Enter");
    await expect.poll(() => width(page)).toBe(56);
    const expand = aside(page).getByRole("button", { name: "Mở rộng thanh bên" });
    await expect(expand).toBeFocused();
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Enter");
    await expect.poll(() => width(page)).toBe(384);
    await expect(aside(page).getByRole("button", { name: "Thu gọn thanh bên" })).toBeFocused();
  });

  test("rail: flyout mở bằng bàn phím và dẫn tới trang; dạng rail có sẵn trước khi app chạy", async ({ page }) => {
    await openDocs(page, "/");
    await aside(page).getByRole("button", { name: "Thu gọn thanh bên" }).click();
    await expect.poll(() => width(page)).toBe(56);
    expect(await contentOffset(page)).toBe(56);

    const components = aside(page).getByRole("button", { name: "Component", exact: true });
    await components.focus();
    await page.keyboard.press("Enter");
    const flyout = page.getByRole("dialog", { name: "Component" });
    await expect(flyout).toBeVisible();
    const scan = await new AxeBuilder({ page })
      .include("#docs-sidebar")
      .include("[role=dialog]")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(scan.violations.map((v) => v.id)).toEqual([]);
    await flyout.getByRole("link", { name: "Combobox", exact: true }).click();
    await expect(page).toHaveURL(/\/components\/combobox$/);
    await expect(flyout).toBeHidden();
    await expect(components).toHaveClass(/text-brand-foreground-2/);

    // Script trong index.html đặt độ rộng rail trước khi bundle chạy: chặn JS của app, CSS var vẫn đúng.
    await page.route(/\/(assets\/[^/]+\.js|src\/main\.tsx)(\?.*)?$/, (route) => route.abort());
    await page.goto(docsUrl("/"), { waitUntil: "domcontentloaded" });
    const root = page.locator("html");
    await expect(root).toHaveAttribute("data-docs-sidebar", "rail");
    expect(await root.evaluate((el) => el.style.getPropertyValue("--docs-sidebar-width"))).toBe("56px");
  });
});

test.describe("URL theo đường dẫn (#113)", () => {
  test("link #/… cũ chuyển sang đường dẫn, ?lang=en sang bản /en/", async ({ page }) => {
    await page.goto("/?theme=dark&lang=en#/components/combobox", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/components\/combobox\?theme=dark$/);
    await expect(page.getByRole("heading", { level: 1, name: "Combobox" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("đổi ngôn ngữ sang URL /en/, link nội bộ giữ ngôn ngữ, lựa chọn được nhớ (#123)", async ({ page }) => {
    await openDocs(page, "/components/button");
    await page.getByRole("button", { name: /English/ }).click();
    await expect(page).toHaveURL(/\/en\/components\/button\?/);
    await expect(page.locator('main a[href="/en/"]').first()).toBeVisible();
    // Mở link tiếng Việt khi đã chọn tiếng Anh → sang bản /en/.
    await page.goto("/concepts/cli", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/concepts\/cli$/);
    await expect(page.getByRole("heading", { level: 1, name: "@yugen-ui/cli" })).toBeVisible();
  });

  test("trang tiếng Anh prerender có hreflang; trang chưa dịch trỏ canonical về bản tiếng Việt", async ({ page }) => {
    test.skip(process.env.YUGEN_E2E_DEV === "1", "dev server không prerender");
    await page.route(/\/assets\/[^/]+\.js(\?.*)?$/, (route) => route.abort());
    await page.goto("/en/concepts/cli", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/en/concepts/cli");
    await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/concepts/cli");
    // DataGrid chưa có bản tiếng Anh (#69).
    await page.goto("/en/components/datagrid", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/components/datagrid");
    await expect(page.locator("link[hreflang]")).toHaveCount(0);
    // Button đã dịch: canonical riêng.
    await page.goto("/en/components/button", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/en/components/button");
  });

  test("bấm link nội bộ đổi trang không tải lại, Back quay về", async ({ page }) => {
    await openDocs(page, "/components/button");
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
    await page.locator('main a[href="/"]').first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Yugen UI" })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
  });

  test("trang prerender có nội dung và head riêng khi chưa chạy JS", async ({ page }) => {
    test.skip(process.env.YUGEN_E2E_DEV === "1", "dev server không prerender");
    await page.route(/\/assets\/[^/]+\.js(\?.*)?$/, (route) => route.abort());
    await page.goto("/components/button", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Button" })).toBeVisible();
    await expect(page).toHaveTitle("Button · Yugen UI");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/components/button");
  });

  test("sitemap.xml liệt kê mọi trang kèm lastmod (#114)", async ({ request }) => {
    test.skip(process.env.YUGEN_E2E_DEV === "1", "dev server không prerender");
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("<loc>https://trandat1114.github.io/Yugen-UI/components/button</loc>");
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    expect(xml.match(/<url>/g)?.length).toBeGreaterThan(140);
  });
});

test("form react-hook-form + zod: lỗi theo schema, focus vào ô lỗi đầu tiên", async ({ page }) => {
  await openDocs(page, "/components/formvalidation");
  const form = page.locator("form").first();
  await form.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(form.getByText("Họ tên cần ít nhất 2 ký tự.")).toBeVisible();
  await expect(form.getByText("Vui lòng nhập email.")).toBeVisible();
  await expect(form.getByText("Vui lòng chọn ngày sinh.")).toBeVisible();
  await expect(form.getByRole("textbox", { name: /Họ và tên/ })).toBeFocused();

  const email = form.getByRole("textbox", { name: /^Email/ });
  await email.fill("chua-dung");
  await email.blur();
  await expect(form.getByText("Email chưa đúng định dạng.")).toBeVisible();
  await email.fill("ten@congty.vn");
  await expect(form.getByText("Email chưa đúng định dạng.")).toBeHidden();
});
