import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useClipboard } from "./useClipboard";

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

function setExecCommand(impl: () => boolean) {
  const fn = vi.fn(impl);
  Object.defineProperty(document, "execCommand", { value: fn, configurable: true, writable: true });
  return fn;
}

afterEach(() => {
  setClipboard(undefined);
});

describe("useClipboard", () => {
  it("chép vào clipboard, copied tự tắt sau timeout", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    const { result } = renderHook(() => useClipboard({ timeout: 1000 }));
    let ok = false;
    await act(async () => {
      ok = await result.current.copy("xin chào");
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("xin chào");
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);
  });

  it("không có navigator.clipboard (ngữ cảnh không an toàn) → chép qua textarea tạm", async () => {
    setClipboard(undefined);
    const exec = setExecCommand(() => true);
    const { result } = renderHook(() => useClipboard());
    let ok = false;
    await act(async () => {
      ok = await result.current.copy("dự phòng");
    });
    expect(exec).toHaveBeenCalledWith("copy");
    expect(ok).toBe(true);
    expect(result.current.copied).toBe(true);
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("báo thất bại khi trình duyệt từ chối chép", async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")) });
    setExecCommand(() => false);
    const { result } = renderHook(() => useClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy("x");
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("reset tắt copied ngay; copy giữ identity", async () => {
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { result, rerender } = renderHook(() => useClipboard());
    const copy = result.current.copy;
    await act(async () => {
      await result.current.copy("x");
    });
    act(() => result.current.reset());
    expect(result.current.copied).toBe(false);
    rerender();
    expect(result.current.copy).toBe(copy);
  });

  it("StrictMode: không còn timer sau unmount", async () => {
    vi.useFakeTimers();
    setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const strict = ({ children }: { children: React.ReactNode }) => React.createElement(React.StrictMode, null, children);
    const { result, unmount } = renderHook(() => useClipboard(), { wrapper: strict });
    const before = vi.getTimerCount();
    await act(async () => {
      await result.current.copy("x");
    });
    expect(vi.getTimerCount()).toBe(before + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(before);
  });
});
