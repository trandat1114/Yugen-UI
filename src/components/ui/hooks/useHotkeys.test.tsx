import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useHotkeys, type UseHotkeysOptions } from "./useHotkeys";

function Probe({ onKey, ...options }: { onKey: () => void } & UseHotkeysOptions) {
  useHotkeys({ "mod+k": onKey, "?": onKey, escape: onKey, start: onKey }, options);
  return (
    <>
      <input aria-label="ô nhập" />
      <textarea aria-label="ô văn bản" />
      <select aria-label="danh sách">
        <option>a</option>
      </select>
      <div aria-label="soạn thảo" contentEditable suppressContentEditableWarning>
        x
      </div>
    </>
  );
}
const ctrlK = { key: "k", ctrlKey: true };

describe("useHotkeys", () => {
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

  it("không khớp khi thừa / thiếu phím bổ trợ, và không chặn phím không xử lý", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, { key: "k" });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true, shiftKey: true });
    expect(fireEvent.keyDown(document, { key: "j", ctrlKey: true })).toBe(true);
    expect(onKey).not.toHaveBeenCalled();
  });

  it("preventDefault: false để trình duyệt vẫn xử lý phím", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} preventDefault={false} />);
    expect(fireEvent.keyDown(document, ctrlK)).toBe(true);
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("đang gõ trong input, textarea, select, contenteditable: bỏ qua phím thường, vẫn nhận phím có Ctrl", () => {
    const onKey = vi.fn();
    render(<Probe onKey={onKey} />);
    for (const label of ["ô nhập", "ô văn bản", "danh sách", "soạn thảo"]) {
      const field = screen.getByLabelText(label);
      fireEvent.keyDown(field, { key: "Escape" });
      fireEvent.keyDown(field, { key: "?", shiftKey: true });
    }
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByLabelText("ô nhập"), ctrlK);
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

  it("enabled=false gỡ listener; luôn gọi hàm xử lý mới nhất", () => {
    const first = vi.fn();
    const second = vi.fn();
    const remove = vi.spyOn(document, "removeEventListener");
    const { rerender } = render(<Probe onKey={first} />);
    rerender(<Probe onKey={first} enabled={false} />);
    expect(remove.mock.calls.filter(([type]) => type === "keydown")).toHaveLength(1);
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
    vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel");
    render(<Probe onKey={onKey} />);
    fireEvent.keyDown(document, ctrlK);
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("target: chỉ nghe trong phần tử được chỉ định", () => {
    const onKey = vi.fn();
    function Scoped() {
      const [area, setArea] = React.useState<HTMLDivElement | null>(null);
      useHotkeys({ escape: onKey }, { target: area });
      return (
        <div ref={setArea} tabIndex={0} data-testid="area">
          vùng
        </div>
      );
    }
    render(<Scoped />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKey).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByTestId("area"), { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("StrictMode: mỗi phím chỉ gọi hàm một lần và gỡ listener khi unmount", () => {
    const onKey = vi.fn();
    const strict = ({ children }: { children: React.ReactNode }) => <React.StrictMode>{children}</React.StrictMode>;
    const { unmount } = renderHook(() => useHotkeys({ escape: onKey }), { wrapper: strict });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onKey).toHaveBeenCalledTimes(1);
  });
});
