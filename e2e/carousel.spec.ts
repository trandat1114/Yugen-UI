import { test, expect, type Page } from "@playwright/test";
import { openDocs, type Dir } from "./utils";

/** Carousel trên desktop: nút trước / sau, phím mũi tên (đổi vai ở RTL), vòng lặp, autoplay tạm dừng khi hover / focus. */

async function heroCarousel(page: Page, dir: Dir = "ltr") {
  await openDocs(page, "/components/carousel", { dir });
  const carousel = page.locator('section[aria-label="Điểm nổi bật"]').first();
  await carousel.scrollIntoViewIfNeeded();
  return {
    carousel,
    // Vùng cuộn = cha trực tiếp của các slide (aria-roledescription="slide"), không dựa vào class CSS.
    viewport: carousel.locator('[aria-roledescription="slide"]').first().locator("xpath=.."),
    current: carousel.getByRole("tab", { selected: true }),
    next: carousel.getByRole("button", { name: "Slide tiếp theo" }),
    prev: carousel.getByRole("button", { name: "Slide trước" }),
  };
}

test("nút trước / sau và vòng lặp (loop) quay đầu ↔ cuối", async ({ page }) => {
  const { current, next, prev } = await heroCarousel(page);
  await expect(current).toHaveAttribute("aria-label", "Slide 1 / 4");
  await next.click();
  await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");
  await prev.click();
  await expect(current).toHaveAttribute("aria-label", "Slide 1 / 4");
  // loop: trước slide đầu là slide cuối, sau slide cuối là slide đầu.
  await prev.click();
  await expect(current).toHaveAttribute("aria-label", "Slide 4 / 4");
  await next.click();
  await expect(current).toHaveAttribute("aria-label", "Slide 1 / 4");
});

for (const dir of ["ltr", "rtl"] as const) {
  test(`phím mũi tên theo chiều đọc (${dir})`, async ({ page }) => {
    const { viewport, current } = await heroCarousel(page, dir);
    const [forward, back] = dir === "ltr" ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
    await viewport.focus();
    await page.keyboard.press(forward);
    await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");
    await page.keyboard.press(forward);
    await expect(current).toHaveAttribute("aria-label", "Slide 3 / 4");
    await page.keyboard.press(back);
    await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");
    // Slide hiện tại thật sự nằm trong khung nhìn của track.
    await expect(viewport.getByRole("group", { name: "Slide 2 / 4" })).toBeInViewport({ ratio: 0.9 });
  });
}

test("autoplay chạy, tạm dừng khi hover và khi focus vào slide", async ({ page }) => {
  // Đồng hồ giả: điều khiển requestAnimationFrame / performance.now của đồng hồ autoplay (4s mỗi slide).
  await page.clock.install();
  const { carousel, viewport, current } = await heroCarousel(page);
  const toggle = carousel.getByRole("button", { name: "Tự động chạy" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);

  await page.clock.runFor(4_500);
  await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");

  // Hover vào slide: đứng yên dù đã quá 2 chu kỳ.
  await viewport.hover();
  await page.clock.runFor(9_000);
  await expect(current).toHaveAttribute("aria-label", "Slide 2 / 4");

  // Rời chuột: chạy tiếp.
  await page.mouse.move(0, 0);
  await page.clock.runFor(4_500);
  await expect(current).toHaveAttribute("aria-label", "Slide 3 / 4");

  // Focus bàn phím trong track: cũng tạm dừng.
  await viewport.focus();
  await page.clock.runFor(9_000);
  await expect(current).toHaveAttribute("aria-label", "Slide 3 / 4");

  // Tắt autoplay.
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await page.clock.runFor(9_000);
  await expect(current).toHaveAttribute("aria-label", "Slide 3 / 4");
});
