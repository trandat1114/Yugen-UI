import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { setMediaQueries } from "@/test/matchMedia";
import {
  useClipboard,
  useControllableState,
  useDebouncedValue,
  useDisclosure,
  useElementSize,
  useHotkeys,
  useIntersection,
  useLocalStorage,
  useMediaQuery,
} from "./Hooks";

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("useControllableState", () => {
  it("uncontrolled: tự giữ state, nhận cả giá trị lẫn hàm cập nhật, gọi onChange khi đổi", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
    expect(onChange.mock.calls).toEqual([[2], [3]]);
  });

  it("bỏ qua khi giá trị không đổi", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](1));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("controlled: không tự đổi, chỉ báo onChange; đổi theo `value` của cha", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState({ value, defaultValue: 0, onChange }), {
      initialProps: { value: 5 },
    });
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(9);
    rerender({ value: 9 });
    expect(result.current[0]).toBe(9);
  });

  it("hai lần set liên tiếp trong một sự kiện: hàm cập nhật thấy kết quả lần trước", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 0 }));
    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  it("hàm set có identity ổn định", () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 0 }));
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});

describe("useDisclosure", () => {
  it("mở / đóng / đảo và báo onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpenChange }));
    expect(result.current.open).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(true);
    act(() => result.current.onToggle());
    expect(result.current.open).toBe(false);
    act(() => result.current.onClose());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("defaultOpen và controlled", () => {
    expect(renderHook(() => useDisclosure({ defaultOpen: true })).result.current.open).toBe(true);
    const { result } = renderHook(() => useDisclosure({ open: false }));
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(false);
  });
});

describe("useMediaQuery", () => {
  it("theo dõi query và cập nhật khi đổi", () => {
    setMediaQueries(() => false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => setMediaQueries(() => true));
    expect(result.current).toBe(true);
  });
});

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

  it("hai hook cùng khoá đồng bộ với nhau", () => {
    const a = renderHook(() => useLocalStorage("shared", 0));
    const b = renderHook(() => useLocalStorage("shared", 0));
    act(() => a.result.current[1](7));
    expect(b.result.current[0]).toBe(7);
  });

  it("đồng bộ với tab khác qua sự kiện storage", () => {
    const { result } = renderHook(() => useLocalStorage("tab", "a"));
    act(() => {
      localStorage.setItem("tab", JSON.stringify("b"));
      window.dispatchEvent(new StorageEvent("storage", { key: "tab" }));
    });
    expect(result.current[0]).toBe("b");
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
});

describe("useClipboard", () => {
  it("chép vào clipboard, copied tự tắt sau timeout", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
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
});

describe("useDebouncedValue", () => {
  it("giữ giá trị cũ tới khi đứng yên đủ delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "a" } });
    expect(result.current).toBe("a");
    rerender({ v: "ab" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
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
});

describe("useHotkeys", () => {
  function Probe({ onKey, ...options }: { onKey: () => void } & Parameters<typeof useHotkeys>[1]) {
    useHotkeys({ "mod+k": onKey, "?": onKey, escape: onKey, start: onKey }, options);
    return <input aria-label="ô nhập" />;
  }
  const ctrlK = { key: "k", ctrlKey: true };

  it("khớp tổ hợp, gọi hàm và chặn hành vi mặc định", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    // mod = Ctrl ở jsdom (không phải Apple)
    const notCancelled = fireEvent.keyDown(document, ctrlK);
    expect(onKey).toHaveBeenCalledTimes(1);
    expect(notCancelled).toBe(false);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "?", shiftKey: true });
    expect(onKey).toHaveBeenCalledTimes(3);
  });

  it("không khớp khi thừa / thiếu phím bổ trợ", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, { key: "k" });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true, shiftKey: true });
    expect(onKey).not.toHaveBeenCalled();
  });

  it("đang gõ trong ô nhập: bỏ qua phím thường, vẫn nhận phím có Ctrl", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    const input = screen.getByLabelText("ô nhập");
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "?", shiftKey: true });
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(input, ctrlK);
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("enableOnFormTags cho phím thường chạy trong ô nhập", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} enableOnFormTags />);
    fireEvent.keyDown(screen.getByLabelText("ô nhập"), { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("start = mũi tên trái ở LTR, mũi tên phải ở RTL", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onKey).toHaveBeenCalledTimes(1);

    document.documentElement.dir = "rtl";
    try {
      fireEvent.keyDown(document, { key: "ArrowLeft" });
      expect(onKey).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(document, { key: "ArrowRight" });
      expect(onKey).toHaveBeenCalledTimes(2);
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });

  it("enabled=false tắt phím tắt; luôn gọi hàm xử lý mới nhất", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Probe onKey={first} enabled={false} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    rerender(<Probe onKey={first} />);
    rerender(<Probe onKey={second} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("bỏ qua khi đang gõ IME", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    // Safari: keydown chốt chữ IME có isComposing = false nhưng keyCode 229.
    fireEvent.keyDown(document, { key: "Escape", keyCode: 229 });
    expect(onKey).not.toHaveBeenCalled();
  });

  it("giữ phím chỉ tính một lần, trừ khi bật repeat", () => {
    const onKey = vi.fn();
    const { rerender } = render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    const notCancelled = fireEvent.keyDown(document, { key: "ArrowLeft", repeat: true });
    expect(onKey).toHaveBeenCalledTimes(1);
    // Không xử lý thì không chặn hành vi mặc định (cuộn trang khi giữ mũi tên).
    expect(notCancelled).toBe(true);
    rerender(<Probe onKey={onKey} repeat />);
    fireEvent.keyDown(document, { key: "ArrowLeft", repeat: true });
    expect(onKey).toHaveBeenCalledTimes(2);
  });

  it("mod là ⌘ trên Apple, Ctrl ở nơi khác", () => {
    const onKey = vi.fn();
    const platform = vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    try {
      render(<Probe onKey={onKey} />);
      fireEvent.keyDown(document, ctrlK);
      expect(onKey).not.toHaveBeenCalled();
      fireEvent.keyDown(document, { key: "k", metaKey: true });
      expect(onKey).toHaveBeenCalledTimes(1);
    } finally {
      platform.mockRestore();
    }
  });
});

describe("useIntersection", () => {
  type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
  const instances: { callback: Callback; disconnect: ReturnType<typeof vi.fn> }[] = [];

  function stubObserver() {
    instances.length = 0;
    class Stub {
      disconnect = vi.fn();
      constructor(public callback: Callback) {
        instances.push(this);
      }
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("IntersectionObserver", Stub);
  }
  afterEach(() => vi.unstubAllGlobals());

  function Probe({ once }: { once?: boolean }) {
    const { ref, isIntersecting } = useIntersection<HTMLDivElement>({ once });
    return <div ref={ref}>{isIntersecting ? "thấy" : "ẩn"}</div>;
  }

  it("theo dõi trạng thái giao nhau", () => {
    stubObserver();
    render(<Probe />);
    expect(screen.getByText("ẩn")).toBeInTheDocument();
    act(() => instances[0].callback([{ isIntersecting: true }]));
    expect(screen.getByText("thấy")).toBeInTheDocument();
    act(() => instances[0].callback([{ isIntersecting: false }]));
    expect(screen.getByText("ẩn")).toBeInTheDocument();
  });

  it("once: ngắt theo dõi và giữ true sau lần thấy đầu tiên", () => {
    stubObserver();
    render(<Probe once />);
    act(() => instances[0].callback([{ isIntersecting: true }]));
    expect(instances[0].disconnect).toHaveBeenCalled();
    expect(screen.getByText("thấy")).toBeInTheDocument();
  });

  it("không có IntersectionObserver: false, không lỗi", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe />);
    expect(screen.getByText("ẩn")).toBeInTheDocument();
  });
});

describe("useElementSize", () => {
  type Callback = (entries: Partial<ResizeObserverEntry>[]) => void;
  let callback: Callback | undefined;
  afterEach(() => vi.unstubAllGlobals());

  function Probe() {
    const { ref, width, height } = useElementSize<HTMLDivElement>();
    return (
      <div ref={ref} data-testid="box">
        {width}×{height}
      </div>
    );
  }

  it("bắt đầu 0×0 rồi cập nhật theo ResizeObserver", () => {
    class Stub {
      constructor(cb: Callback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", Stub);
    render(<Probe />);
    expect(screen.getByTestId("box")).toHaveTextContent("0×0");
    act(() =>
      callback?.([{ target: screen.getByTestId("box"), contentBoxSize: [{ inlineSize: 320, blockSize: 120 }] as never }]),
    );
    expect(screen.getByTestId("box")).toHaveTextContent("320×120");
  });
});

describe("StrictMode (mount, cleanup, mount lại)", () => {
  const strict = ({ children }: { children: React.ReactNode }) => <React.StrictMode>{children}</React.StrictMode>;

  it("useHotkeys: mỗi phím chỉ gọi hàm một lần và gỡ listener khi unmount", () => {
    const onKey = vi.fn();
    const { unmount } = renderHook(() => useHotkeys({ escape: onKey }), { wrapper: strict });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("useLocalStorage: gỡ listener storage khi unmount", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useLocalStorage("strict", 1), { wrapper: strict });
    unmount();
    expect(remove.mock.calls.filter(([type]) => type === "storage").length).toBeGreaterThan(0);
  });

  it("useClipboard: không còn timer sau unmount", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
    const { result, unmount } = renderHook(() => useClipboard(), { wrapper: strict });
    const before = vi.getTimerCount();
    await act(async () => {
      await result.current.copy("x");
    });
    expect(vi.getTimerCount()).toBe(before + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(before);
  });

  it("useDebouncedValue: không để timer treo sau unmount", () => {
    vi.useFakeTimers();
    const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 100), { wrapper: strict, initialProps: { v: 1 } });
    rerender({ v: 2 });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

// Giữ `React` được dùng để JSX trong file test không bị lint báo thừa import khi cấu hình thay đổi.
void React;
