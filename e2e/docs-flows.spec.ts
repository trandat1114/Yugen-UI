import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { CONTRIBUTORS_LIVE, docsUrl, FREEZE_MOTION_CSS, openDocs, waitForDocsReady } from "./utils";

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

  test("trang tiếng Anh prerender có canonical riêng và hreflang", async ({ page }) => {
    test.skip(process.env.YUGEN_E2E_DEV === "1", "dev server không prerender");
    await page.route(/\/assets\/[^/]+\.js(\?.*)?$/, (route) => route.abort());
    await page.goto("/en/concepts/cli", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/en/concepts/cli");
    await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/concepts/cli");
    // Foundations song ngữ (#138): canonical riêng, có hreflang.
    await page.goto("/en/foundations/color", { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/en/foundations/color");
    await expect(page.locator('link[hreflang="vi"]')).toHaveAttribute("href", "https://trandat1114.github.io/Yugen-UI/foundations/color");
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

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`/templates kết thúc ở footer, không có khoảng trống phía dưới (${viewport.width}px, #223)`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // Form đăng ký của preview Landing có Checkbox: input ẩn của nó từng thoát khỏi khung preview và kéo dài trang.
    await openTemplates(page, "", "#vite-landing");
    await expect(page.locator('input[name="consent"]')).toHaveCount(1, { timeout: 30_000 });
    const gap = await page.evaluate(() => {
      const root = document.getElementById("root")!;
      return document.documentElement.scrollHeight - (root.getBoundingClientRect().bottom + window.scrollY);
    });
    expect(gap).toBeLessThanOrEqual(1);
  });
}

/** /templates kèm ?query hoặc #mục: docsUrl() nối ?theme… vào cuối, nên tự ghép URL. */
async function openTemplates(page: Page, query = "", hash = "") {
  await page.goto(`/templates?theme=light&brand=sakura&dir=ltr${query}${hash}`, { waitUntil: "domcontentloaded" });
  await waitForDocsReady(page);
  await page.addStyleTag({ content: FREEZE_MOTION_CSS });
}

test("/templates: bộ chọn chạy một template, #<dir> chọn template, phóng to mở toàn màn hình (#224)", async ({ page }) => {
  await openTemplates(page, "", "#vite-admin");
  const more = page.locator("#more");
  await expect(more.getByRole("tab", { name: "Admin" })).toHaveAttribute("aria-selected", "true");
  // Chỉ template đang chọn chạy preview: khung của template khác không có nội dung.
  await expect(more.getByRole("tabpanel")).toHaveCount(1);
  await expect(more.getByRole("region", { name: "Xem trước template Admin" }).getByRole("heading", { name: "Khách hàng" })).toBeVisible({
    timeout: 30_000,
  });

  await more.getByRole("tab", { name: "Store" }).click();
  await expect(page).toHaveURL(/#vite-store$/);
  const expand = more.getByRole("button", { name: "Xem Store toàn màn hình" });
  await expand.click();
  await expect(page).toHaveURL(/[?&]preview=vite-store/);
  const dialog = page.getByRole("dialog", { name: "Store" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Đóng" })).toBeFocused();
  // Khung trên trang không chạy bản thứ hai khi đang xem toàn màn hình.
  await expect(more.getByText("Đang mở toàn màn hình.")).toBeVisible();
  const scan = await new AxeBuilder({ page }).include("[role=dialog]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(scan.violations.map((v) => v.id)).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#vite-store$/);
  expect(new URL(page.url()).searchParams.has("preview")).toBe(false);
  await expect(expand).toBeFocused();
});

test("/templates?preview=<dir> mở thẳng toàn màn hình; Đóng bỏ ?preview (#224)", async ({ page }) => {
  await openTemplates(page, "&preview=vite-saas");
  const dialog = page.getByRole("dialog", { name: "SaaS" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Đóng" }).click();
  await expect(dialog).toBeHidden();
  expect(new URL(page.url()).searchParams.has("preview")).toBe(false);
});

test("Cộng đồng → Người đóng góp: mỗi người một bông hoa, trỏ hoặc focus vào thẻ làm bông đó nở to (#248)", async ({ page }) => {
  await openDocs(page, "/community");
  await page.getByRole("link", { name: "Xem người đóng góp" }).click();
  await expect(page).toHaveURL(/\/contributors$/);
  await expect(page.getByRole("heading", { level: 1, name: "Người đóng góp" })).toBeVisible();
  const flowers = page.locator(".cb-flower");
  const logins = await flowers.evaluateAll((els) => els.map((el) => el.getAttribute("data-login")!));
  expect(logins.length).toBeGreaterThan(0);
  // Hai mục (code, ý tưởng và thảo luận): mỗi người có thẻ ở ít nhất một mục, mỗi mục kết thúc bằng một ô mời.
  const cards = page.locator("#code ul.grid > li:has(.cb-mark), #ideas ul.grid > li:has(.cb-mark)");
  const profiles = await cards.evaluateAll((els) => els.map((el) => el.querySelector("a")!.getAttribute("href")!.split("/").pop()));
  expect(new Set(profiles)).toEqual(new Set(logins));
  for (const id of ["code", "ideas"]) await expect(page.locator(`#${id} ul.grid > li:not(:has(.cb-mark))`)).toHaveCount(1);

  await cards.first().hover();
  await expect(flowers.first()).toHaveAttribute("data-active", "");
  await expect(page.locator(".cb-art[data-dim]")).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(page.locator(".cb-art[data-dim]")).toHaveCount(0);

  const last = logins.at(-1)!;
  await page.locator(`#code, #ideas`).locator(`a[href$="/${last}"]`).first().focus();
  await expect(flowers.last()).toHaveAttribute("data-active", "");

  // Hàng số đếm mở Popover đóng góp gần đây (maintainer không có danh sách nên không có nút).
  const counts = cards.locator("button[aria-haspopup]").first();
  await counts.click();
  const recent = page.getByRole("dialog");
  await expect(recent).toContainText("Đóng góp gần đây của");
  await expect(recent.getByRole("link").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(recent).toBeHidden();
  await expect(counts).toBeFocused();

  // Trang không cuộn ngang trên điện thoại (cành dùng preserveAspectRatio slice).
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("Người đóng góp: bản mới trên nhánh contributors-data thay snapshot, lỗi thì giữ snapshot (#272)", async ({ page }) => {
  const snapshot = JSON.parse(fs.readFileSync(path.resolve("src/docs/contributors.json"), "utf8")) as { people: unknown[] };
  const newcomer = {
    login: "e2e-newcomer",
    name: "E2E Newcomer",
    avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    first: "2099-01-01",
    counts: { discussion: 1 },
    items: [{ types: ["discussion"], number: 1, title: "Góp ý", date: "2099-01-01", url: "https://github.com/trandat1114/Yugen-UI/issues/1" }],
  };
  let status = 200;
  await page.route(CONTRIBUTORS_LIVE, (route) =>
    status === 200 ? route.fulfill({ json: { updated: "2099-01-01", people: [...snapshot.people, newcomer] } }) : route.fulfill({ status }),
  );

  await openDocs(page, "/contributors", {}, { live: true });
  const flowers = page.locator(".cb-flower");
  await expect(flowers).toHaveCount(snapshot.people.length + 1);
  await expect(page.locator('#ideas a[href="https://github.com/e2e-newcomer"]')).toBeVisible();
  await expect(page.locator("#how")).toContainText("2099");

  status = 500;
  const failed = page.waitForResponse(CONTRIBUTORS_LIVE);
  await page.reload();
  await failed;
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator('#ideas a[href="https://github.com/e2e-newcomer"]')).toHaveCount(0);
  await expect(flowers).toHaveCount(snapshot.people.length);
});

test("ví dụ: mở code thì ô chiếm cả hàng của lưới, đóng lại về một cột (#259)", async ({ page }) => {
  await openDocs(page, "/components/button");
  const grid = page.locator("#variants > div > div.grid");
  // Ô thứ hai nằm ở cột phải: khi giãn nó xuống hàng mới, nút vừa bấm vẫn phải còn trong khung nhìn.
  const tile = grid.locator("> div").nth(1);
  const toggle = tile.locator("button[aria-expanded]");
  const gridWidth = (await grid.boundingBox())!.width;
  const tileWidth = async () => (await tile.boundingBox())!.width;

  expect(await tileWidth()).toBeLessThan(gridWidth * 0.6);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(tile.locator("pre")).toBeVisible();
  expect(await tileWidth()).toBeGreaterThan(gridWidth * 0.98);
  await expect(toggle).toBeInViewport();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await tileWidth()).toBeLessThan(gridWidth * 0.6);
  await expect(toggle).toBeInViewport();
});
