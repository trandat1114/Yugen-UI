import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

/** File do global-setup ghi (sau khi webServer đã chạy) — spec đọc đồng bộ lúc nạp để sinh một test cho mỗi route. */
export const ROUTES_FILE = fileURLToPath(new URL("../test-results/.e2e-cache/routes.json", import.meta.url));

/**
 * Lấy mọi route docs từ sidebar ở runtime: mở trang chủ, bung các nhóm đang thu gọn (link chỉ có trong DOM khi nhóm mở),
 * gom link nội bộ `a[href^="/"]` trong sidebar rồi khử trùng lặp.
 */
export async function collectSidebarRoutes(page: Page): Promise<string[]> {
  const sidebar = page.locator("aside").filter({ has: page.locator("nav") }).first();
  await sidebar.locator('a[href="/"]').first().waitFor();
  // Bấm lần lượt từng nút nhóm đang đóng cho tới khi không còn (mỗi lần bấm có thể làm DOM đổi thứ tự).
  for (let guard = 0; guard < 50; guard++) {
    const collapsed = sidebar.locator('nav button[aria-expanded="false"]');
    if ((await collapsed.count()) === 0) break;
    await collapsed.first().click();
  }
  const hrefs = await sidebar.locator('nav a[href^="/"]').evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  return [...new Set(hrefs.filter(Boolean))];
}

/** Đọc danh sách route global-setup đã ghi; rỗng khi chạy `--list` / UI mode không có global setup. */
export function readDiscoveredRoutes(): string[] {
  try {
    const data = JSON.parse(fs.readFileSync(ROUTES_FILE, "utf8")) as { routes: string[] };
    return Array.isArray(data.routes) ? data.routes : [];
  } catch {
    return [];
  }
}
