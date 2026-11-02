import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { setMediaQueries } from "@/test/matchMedia";
import { matchesMedia, useMediaQuery } from "./useMediaQuery";

describe("useMediaQuery", () => {
  it("theo dõi query và cập nhật khi đổi", () => {
    setMediaQueries(() => false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => setMediaQueries(() => true));
    expect(result.current).toBe(true);
  });

  it("không có matchMedia → defaultValue", () => {
    const matchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: undefined });
    try {
      expect(renderHook(() => useMediaQuery("(min-width: 768px)", { defaultValue: true })).result.current).toBe(true);
      expect(matchesMedia("(min-width: 768px)")).toBe(false);
    } finally {
      Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: matchMedia });
    }
  });

  it("một MediaQueryList cho mỗi query; gỡ listener khi unmount", () => {
    const spy = vi.spyOn(window, "matchMedia");
    const a = renderHook(() => useMediaQuery("(orientation: portrait)"));
    const b = renderHook(() => useMediaQuery("(orientation: portrait)"));
    expect(spy.mock.calls.filter(([q]) => q === "(orientation: portrait)")).toHaveLength(1);
    const list = spy.mock.results[0].value as MediaQueryList;
    const remove = vi.spyOn(list, "removeEventListener");
    a.unmount();
    b.unmount();
    expect(remove.mock.calls.filter(([type]) => type === "change")).toHaveLength(2);
  });

  it("matchesMedia đọc một lần, theo giá trị hiện tại", () => {
    setMediaQueries({ "prefers-reduced-motion": true });
    expect(matchesMedia("(prefers-reduced-motion: reduce)")).toBe(true);
    setMediaQueries(() => false);
    expect(matchesMedia("(prefers-reduced-motion: reduce)")).toBe(false);
  });
});
