import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("đọc giá trị đã lưu, ghi dạng JSON và nhận hàm cập nhật", () => {
    localStorage.setItem("k", JSON.stringify({ n: 1 }));
    const { result } = renderHook(() => useLocalStorage("k", { n: 0 }));
    expect(result.current[0]).toEqual({ n: 1 });
    act(() => result.current[1]((prev) => ({ n: prev.n + 1 })));
    expect(result.current[0]).toEqual({ n: 2 });
    expect(localStorage.getItem("k")).toBe('{"n":2}');
  });

  it("chưa có hoặc dữ liệu hỏng → initialValue; remove xoá khoá", () => {
    localStorage.setItem("bad", "{oops");
    const { result } = renderHook(() => useLocalStorage("bad", "mặc định"));
    expect(result.current[0]).toBe("mặc định");
    act(() => result.current[1]("x"));
    expect(result.current[0]).toBe("x");
    act(() => result.current[2]());
    expect(localStorage.getItem("bad")).toBeNull();
    expect(result.current[0]).toBe("mặc định");
  });

  it("giá trị undefined xoá khoá", () => {
    const { result } = renderHook(() => useLocalStorage<string | undefined>("undef", "a"));
    act(() => result.current[1]("b"));
    act(() => result.current[1](undefined));
    expect(localStorage.getItem("undef")).toBeNull();
    expect(result.current[0]).toBe("a");
  });

  it("hai hook cùng khoá đồng bộ với nhau", () => {
    const a = renderHook(() => useLocalStorage("shared", 0));
    const b = renderHook(() => useLocalStorage("shared", 0));
    act(() => a.result.current[1](7));
    expect(b.result.current[0]).toBe(7);
  });

  it("đồng bộ với tab khác qua sự kiện storage, kể cả clear()", () => {
    const { result } = renderHook(() => useLocalStorage("tab", "a"));
    act(() => {
      localStorage.setItem("tab", JSON.stringify("b"));
      window.dispatchEvent(new StorageEvent("storage", { key: "tab" }));
    });
    expect(result.current[0]).toBe("b");
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
    });
    expect(result.current[0]).toBe("a");
  });

  it("object parse ra giữ identity khi render lại", () => {
    localStorage.setItem("id", JSON.stringify({ a: 1 }));
    const { result, rerender } = renderHook(() => useLocalStorage("id", { a: 0 }));
    const first = result.current[0];
    rerender();
    expect(result.current[0]).toBe(first);
  });

  it("localStorage ném lỗi khi ghi → vẫn chạy trong bộ nhớ", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => useLocalStorage("quota", 1));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
  });

  it("truy cập localStorage bị chặn (getter ném lỗi) → initialValue, không lỗi, vẫn ghi được trong phiên", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    const { result } = renderHook(() => useLocalStorage("blocked", "đầu"));
    expect(result.current[0]).toBe("đầu");
    act(() => result.current[1]("sau"));
    expect(result.current[0]).toBe("sau");
    act(() => result.current[2]());
    expect(result.current[0]).toBe("đầu");
  });

  it("serialize / deserialize: đọc khoá có sẵn dạng chuỗi thô", () => {
    localStorage.setItem("raw", "pnpm");
    const options = { serialize: (v: string) => v, deserialize: (raw: string) => raw };
    const { result } = renderHook(() => useLocalStorage("raw", "npm", options));
    expect(result.current[0]).toBe("pnpm");
    act(() => result.current[1]("bun"));
    expect(localStorage.getItem("raw")).toBe("bun");
  });

  it("deserialize ném lỗi → initialValue", () => {
    localStorage.setItem("strict", "42");
    const deserialize = (raw: string) => {
      const n = Number(raw);
      if (n > 10) throw new RangeError("quá lớn");
      return n;
    };
    expect(renderHook(() => useLocalStorage("strict", 1, { deserialize })).result.current[0]).toBe(1);
  });

  it("StrictMode: gỡ listener storage khi unmount", () => {
    const strict = ({ children }: { children: React.ReactNode }) => React.createElement(React.StrictMode, null, children);
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useLocalStorage("strict", 1), { wrapper: strict });
    unmount();
    const count = (spy: typeof add, type: string) => spy.mock.calls.filter(([t]) => t === type).length;
    expect(count(remove, "storage")).toBe(count(add, "storage"));
    expect(count(remove, "storage")).toBeGreaterThan(0);
  });
});
