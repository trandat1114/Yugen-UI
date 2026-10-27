import { test, expect, type Locator } from "@playwright/test";
import { openDocs } from "./utils";

/**
 * Glass (Yugen Labs, #178) trên trình duyệt thật: blur và độ đục, tab bar thu gọn theo chiều cuộn, và nền đặc khi người
 * dùng giảm trong suốt / tăng tương phản / dùng forced colors hoặc theme tương phản cao. Demo ở /foundations/glass.
 */
const ROUTE = "/foundations/glass";

function material(el: Locator) {
  return el.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      filter: style.getPropertyValue("backdrop-filter") || style.getPropertyValue("-webkit-backdrop-filter"),
      background: style.backgroundColor,
    };
  });
}

/** Kênh alpha của rgb() / rgba() / color(srgb …). */
function alpha(color: string) {
  const parts = color.replace(/^[a-z-]+\(|\)$/g, "").split(/[\s,/]+/).filter(Boolean);
  const numbers = parts.filter((p) => !Number.isNaN(Number(p)));
  return numbers.length > 3 ? Number(numbers[3]) : 1;
}

test.describe("Glass", () => {
  test("blur và nền trong mờ; tab bar thu gọn khi cuộn xuống, mở lại khi cuộn lên", async ({ page }) => {
    await openDocs(page, ROUTE);
    const toolbar = page.getByRole("toolbar", { name: "Thao tác với chuyến đi" });
    const glass = await material(toolbar);
    expect(glass.filter).toContain("blur(24px)");
    expect(alpha(glass.background)).toBeCloseTo(0.8, 2);

    const region = page.getByRole("region", { name: /Demo glass/ });
    const tabs = page.getByRole("tablist", { name: "Điều hướng" });
    await expect(tabs).not.toHaveAttribute("data-minimized");
    await region.evaluate((el) => el.scrollTo(0, 400));
    await expect(tabs).toHaveAttribute("data-minimized", "true");
    // Tên tab vẫn đọc được khi chỉ còn icon.
    await expect(tabs.getByRole("tab", { name: "Bản đồ" })).toBeVisible();
    await region.evaluate((el) => el.scrollTo(0, 100));
    await expect(tabs).not.toHaveAttribute("data-minimized");

    // Công tắc xem trước "Giảm trong suốt" của trang.
    await page.getByRole("switch", { name: "Xem như khi bật Giảm trong suốt" }).click();
    expect((await material(toolbar)).filter).toBe("none");
  });

  test("giảm trong suốt và tăng tương phản → nền đặc, không blur", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Giả lập media feature qua CDP (Chromium)");
    const cdp = await page.context().newCDPSession(page);
    for (const feature of [
      { name: "prefers-reduced-transparency", value: "reduce" },
      { name: "prefers-contrast", value: "more" },
    ]) {
      await cdp.send("Emulation.setEmulatedMedia", { features: [feature] });
      await openDocs(page, ROUTE);
      const glass = await material(page.getByRole("toolbar", { name: "Thao tác với chuyến đi" }));
      expect(glass.filter, feature.name).toBe("none");
      expect(alpha(glass.background), feature.name).toBe(1);
    }
  });

  test("forced colors và theme tương phản cao → không blur", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "forcedColors chỉ giả lập được trên Chromium");
    await page.emulateMedia({ forcedColors: "active" });
    await openDocs(page, ROUTE);
    expect((await material(page.getByRole("toolbar", { name: "Thao tác với chuyến đi" }))).filter).toBe("none");

    await page.emulateMedia({ forcedColors: "none" });
    await openDocs(page, ROUTE, { theme: "high-contrast" });
    const glass = await material(page.getByRole("toolbar", { name: "Thao tác với chuyến đi" }));
    expect(glass.filter).toBe("none");
    expect(glass.background).toBe("rgb(0, 0, 0)");
  });
});
