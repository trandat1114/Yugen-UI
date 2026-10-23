import fs from "node:fs";
import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { collectSidebarRoutes, ROUTES_FILE } from "./routes";
import { docsUrl, waitForDocsReady } from "./utils";

/**
 * Chạy sau khi webServer đã lên và trước khi Playwright nạp file spec: mở trang chủ, gom mọi route từ sidebar,
 * ghi ra test-results/.e2e-cache/routes.json để a11y.spec.ts sinh một test cho mỗi route × theme.
 */
export default async function globalSetup(config: FullConfig) {
  const project = config.projects[0];
  const baseURL = project?.use.baseURL ?? "http://localhost:5200";
  const browser = await chromium.launch(process.env.CI ? {} : { channel: "msedge" });
  try {
    const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 800 } });
    await page.goto(docsUrl("/"));
    await waitForDocsReady(page);
    const routes = await collectSidebarRoutes(page);
    if (routes.length < 20) throw new Error(`Chỉ tìm thấy ${routes.length} route trong sidebar — sidebar đổi cấu trúc?`);
    fs.mkdirSync(path.dirname(ROUTES_FILE), { recursive: true });
    fs.writeFileSync(ROUTES_FILE, JSON.stringify({ routes }, null, 2));
  } finally {
    await browser.close();
  }
}
