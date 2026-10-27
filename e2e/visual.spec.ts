import { test, expect } from "@playwright/test";
import { openDocs, type Appearance } from "./utils";

/**
 * So sánh ảnh chụp (project `visual`, chỉ chạy khi `npm run test:visual`). Ảnh nền theo nền tảng nằm ở
 * e2e/__screenshots__/visual.spec.ts/<tên>-visual-<platform>.png — cập nhật bằng `npm run test:visual -- --update-snapshots`.
 * Khung nhìn 1280×800, tắt animation, ẩn caret, đồng hồ cố định; che phần phụ thuộc thời gian.
 */
const FIXED_NOW = new Date("2026-04-01T09:00:00+07:00");

interface Shot extends Appearance {
  name: string;
  route: string;
  /** Selector bị che (đồng hồ chạy, giờ tương đối…). */
  mask?: string[];
}

const SHOTS: Shot[] = [
  { name: "home-light", route: "/" },
  { name: "home-dark", route: "/", theme: "dark" },
  { name: "home-high-contrast", route: "/", theme: "high-contrast" },
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

for (const { name, route, mask = [], ...appearance } of SHOTS) {
  test(name, async ({ page }) => {
    // Date cố định (giờ tương đối, đồng hồ Trace…) nhưng timer vẫn chạy để trang tải bình thường.
    await page.clock.setFixedTime(FIXED_NOW);
    await openDocs(page, route, appearance);
    // Chuột ra góc không có phần tử tương tác để không dính trạng thái hover.
    await page.mouse.move(640, 799);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      mask: mask.map((selector) => page.locator(selector)),
    });
  });
}
