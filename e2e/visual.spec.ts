import { test, expect, type Page } from "@playwright/test";
import { readDiscoveredRoutes } from "./routes";
import { openDocs, type Appearance, type Dir, type Theme } from "./utils";

/**
 * So sánh ảnh chụp (project `visual`, chỉ chạy khi `npm run test:visual`). Ảnh nền theo nền tảng nằm ở
 * e2e/__screenshots__/visual.spec.ts/<tên>-visual-<platform>.png — cập nhật bằng `npm run test:visual -- --update-snapshots`.
 * Khung nhìn 1280×800, tắt animation, ẩn caret, đồng hồ cố định; che phần phụ thuộc thời gian.
 * Gồm: vài trang chụp cả trang (SHOTS) và ảnh hero của mọi component (phần dưới, #166).
 */
const FIXED_NOW = new Date("2026-04-01T09:00:00+07:00");

interface Shot extends Appearance {
  name: string;
  route: string;
  /** Selector bị che (đồng hồ chạy, giờ tương đối…). */
  mask?: string[];
}

const SHOTS: Shot[] = [
  // Nút tin hiện version và tiêu đề bản mới nhất: đổi mỗi lần phát hành, và PR chỉ sửa tin không chạy visual (#261).
  { name: "home-light", route: "/", mask: ["[data-release-pill]"] },
  { name: "home-dark", route: "/", theme: "dark", mask: ["[data-release-pill]"] },
  { name: "home-high-contrast", route: "/", theme: "high-contrast", mask: ["[data-release-pill]"] },
  { name: "blocks", route: "/blocks" },
  { name: "foundation-color", route: "/foundations/color" },
  { name: "foundation-glass", route: "/foundations/glass" },
  { name: "foundation-glass-dark", route: "/foundations/glass", theme: "dark" },
  { name: "button", route: "/components/button" },
  { name: "card", route: "/components/card" },
  { name: "barchart-dark", route: "/components/barchart", theme: "dark" },
  // Thời lượng / đồng hồ trực tiếp của Trace.
  { name: "trace", route: "/components/trace", mask: ["main .tabular-nums"] },
  { name: "questionnaire", route: "/components/questionnaire" },
  { name: "sheet-closed", route: "/components/sheet" },
  // Giờ gửi tin nhắn.
  { name: "messagescroller-rtl", route: "/components/messagescroller", dir: "rtl", mask: ["main time"] },
];

/** Mở trang với đồng hồ cố định và chuột đặt ở chỗ không có gì để hover. */
async function openStill(page: Page, route: string, appearance: Appearance) {
  // Date cố định (giờ tương đối, đồng hồ Trace…) nhưng timer vẫn chạy để trang tải bình thường.
  await page.clock.setFixedTime(FIXED_NOW);
  await openDocs(page, route, appearance);
  // Chuột lên mép trên thanh top bar (trên ô tìm kiếm, cả LTR lẫn RTL): không có phần tử tương tác, không demo nào bắt
  // hover / tooltip (đáy khung nhìn từng rơi vào cột của BarChart và hiện tooltip).
  await page.mouse.move(640, 4);
}

for (const { name, route, mask = [], ...appearance } of SHOTS) {
  test(name, async ({ page }) => {
    await openStill(page, route, appearance);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      mask: mask.map((selector) => page.locator(selector)),
    });
  });
}

/* ---------- Hero của mọi component (#166) ---------- */
/*
 * Mỗi trang /components/<slug> chụp riêng khung demo đầu trang (ExampleFrame, [data-hero-demo]) — ảnh nhỏ hơn nhiều so
 * với cả trang. Sáng, tối, tương phản cao; thêm RTL (sáng) cho component có bố cục theo hướng chữ.
 * Tên ảnh: component-<slug>-<light|dark|hc>[-rtl].png. Danh sách slug lấy từ sidebar (global-setup), nên component mới
 * tự có ảnh — và check Visual (compare) đỏ cho tới khi PR thêm baseline của nó (workflow Visual regression, `update`).
 */
const COMPONENT_PREFIX = "/components/";
const COMPONENTS = readDiscoveredRoutes()
  .filter((route) => route.startsWith(COMPONENT_PREFIX))
  .map((route) => route.slice(COMPONENT_PREFIX.length));

const VARIANTS: { suffix: string; theme: Theme }[] = [
  { suffix: "light", theme: "light" },
  { suffix: "dark", theme: "dark" },
  { suffix: "hc", theme: "high-contrast" },
];

/**
 * Hero đổi bố cục theo hướng chữ (thứ tự, phía của icon / mũi tên, chiều lấp đầy, phía của panel). Không gồm hero chỉ
 * có một nút đóng (Menu, Sheet, Dialog…): bản RTL gần như y hệt bản LTR.
 */
const RTL = [
  "appshell",
  "avatargroup",
  "breadcrumb",
  "calendar",
  "carousel",
  "datagrid",
  "drawer",
  "messagebar",
  "nav",
  "pagination",
  "progressbar",
  "rating",
  "resizable",
  "searchbox",
  "slider",
  "stepper",
  "tabs",
  "timeline",
  "toolbar",
  "tree",
];

/**
 * Hero không chụp được ổn định — không tạo test, kèm lý do. Đồng hồ đã cố định (Date) nên giờ tương đối, lịch, đồng hồ
 * không cần bỏ; demo tự chạy lúc mở trang thì chờ xong (BUSY) thay vì bỏ.
 */
const SKIP: Record<string, string> = {};

/** Phần phụ thuộc thời gian trong hero (selector tìm trong khung demo), giống các ảnh cả trang ở trên. */
const MASKS: Record<string, string[]> = {
  // Thời lượng / đồng hồ trực tiếp của Trace.
  trace: [".tabular-nums"],
  // Giờ gửi tin nhắn.
  messagescroller: ["time"],
};

/** Hero tự stream chữ ngay khi mở trang: chờ hết aria-busy (stream xong) rồi mới chụp. */
const BUSY = ["streamingmarkdown", "reasoning"];

test("hero: gom được trang component và các danh sách trỏ đúng slug", () => {
  expect(COMPONENTS.length, "global-setup chưa ghi danh sách route (chạy qua `playwright test`)").toBeGreaterThan(100);
  const listed = [...RTL, ...Object.keys(SKIP), ...Object.keys(MASKS), ...BUSY];
  const unknown = listed.filter((slug) => !COMPONENTS.includes(slug));
  expect(unknown, `Slug không có trong sidebar (đổi tên / bỏ component?): ${unknown.join(", ")}`).toEqual([]);
});

for (const slug of COMPONENTS) {
  if (slug in SKIP) continue;
  const shots: { suffix: string; theme: Theme; dir: Dir }[] = [
    ...VARIANTS.map((variant) => ({ ...variant, dir: "ltr" as const })),
    ...(RTL.includes(slug) ? [{ suffix: "light-rtl", theme: "light" as const, dir: "rtl" as const }] : []),
  ];
  for (const { suffix, theme, dir } of shots) {
    const name = `component-${slug}-${suffix}`;
    test(name, async ({ page }) => {
      await openStill(page, `${COMPONENT_PREFIX}${slug}`, { theme, dir });
      const hero = page.locator("main [data-hero-demo]");
      if (BUSY.includes(slug)) await expect(hero.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 20_000 });
      await expect(hero).toHaveScreenshot(`${name}.png`, {
        mask: (MASKS[slug] ?? []).map((selector) => hero.locator(selector)),
      });
    });
  }
}
