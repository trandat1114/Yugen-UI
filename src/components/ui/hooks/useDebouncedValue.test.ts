import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  it("trả giá trị đầu ngay, giữ giá trị cũ tới khi đứng yên đủ delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "a" } });
    expect(result.current).toBe("a");
    rerender({ v: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Đổi nhanh → hẹn lại từ đầu.
    rerender({ v: "abc" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("abc");
  });

  it("quay lại giá trị đang hiện thì huỷ hẹn giờ", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), { initialProps: { v: 1 } });
    rerender({ v: 2 });
    rerender({ v: 1 });
    expect(vi.getTimerCount()).toBe(0);
    expect(result.current).toBe(1);
  });

  it("StrictMode: không để timer treo sau unmount", () => {
    vi.useFakeTimers();
    const strict = ({ children }: { children: React.ReactNode }) => React.createElement(React.StrictMode, null, children);
    const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 100), { wrapper: strict, initialProps: { v: 1 } });
    rerender({ v: 2 });
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
