import type { CDPSession, Page } from "@playwright/test";

export interface Point {
  x: number;
  y: number;
}

/**
 * Chạm-kéo thật qua CDP (`Input.dispatchTouchEvent`): trình duyệt sinh touch + pointer event `pointerType: "touch"`,
 * áp `touch-action` và cuộn gốc như ngón tay thật (page.touchscreen chỉ có tap).
 * Mỗi sự kiện mang `timestamp` tổng hợp (cách nhau `stepMs`) nên vận tốc mà component đo được (event.timeStamp)
 * không phụ thuộc máy chạy test nhanh hay chậm.
 * - `stepMs`: thời gian giữa hai lần di chuyển (nhỏ → vận tốc lớn = cú vuốt nhanh).
 * - `hold`: giữ yên trước khi nhấc tay (ms) — vận tốc khi thả về 0, không bị coi là vuốt.
 * - `pause: false`: gửi các bước liền nhau, không chờ khung hình — cho cú hất. Chromium trên CI không luôn dùng
 *   timestamp tổng hợp, nên chờ giữa các bước (cộng độ trễ CDP khi runner bận) kéo dài cú vuốt thật và hạ vận tốc
 *   dưới ngưỡng hất của Sheet.
 */
export async function touchDrag(page: Page, from: Point, to: Point, { steps = 10, stepMs = 16, hold = 0, pause = true } = {}) {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  // Mốc tổng hợp lùi về quá khứ đủ xa để mọi timestamp đều ≤ giờ thật lúc gửi.
  let t = Date.now() / 1000 - (steps * stepMs + hold + 1000) / 1000;
  const send = (type: "touchStart" | "touchMove" | "touchEnd", point?: Point) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: point ? [{ x: point.x, y: point.y, id: 1 }] : [],
      timestamp: t,
    });
  try {
    await send("touchStart", from);
    for (let i = 1; i <= steps; i++) {
      t += stepMs / 1000;
      await send("touchMove", { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps });
      // Cho trình duyệt xử lý cuộn / khung hình giữa các bước (carousel cuộn gốc).
      if (pause) await page.waitForTimeout(Math.min(stepMs, 16));
    }
    t += hold / 1000;
    if (hold > 0) await page.waitForTimeout(Math.min(hold, 100));
    await send("touchEnd");
  } finally {
    await cdp.detach();
  }
}

/** Tâm của hộp bao. */
export function center(box: { x: number; y: number; width: number; height: number }): Point {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
