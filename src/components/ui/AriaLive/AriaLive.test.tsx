import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnnounce } from "./AriaLive";

describe("AriaLive — announcer dự phòng (không có AriaLiveAnnouncer)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("đưa thông báo vào vùng live gắn ở body", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAnnounce());
    result.current.announce("Đã lưu");
    vi.advanceTimersByTime(60);
    expect(document.querySelector('[data-yugen-live-region="polite"]')?.textContent).toBe("Đã lưu");
    // Chạy hết hàng đợi để announcer (singleton cấp module) rảnh cho test sau.
    vi.advanceTimersByTime(1000);
  });

  it("timer chạy sau khi window / document đã mất (vd. môi trường test bị gỡ) không văng lỗi", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAnnounce());
    result.current.announce("Một");
    result.current.announce("Hai");
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    try {
      expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
