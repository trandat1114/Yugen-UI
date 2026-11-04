import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { SpinButton, spinButtonMessagesVi } from "./SpinButton";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const input = () => screen.getByRole("spinbutton");

describe("SpinButton", () => {
  it("role spinbutton với aria-valuenow / min / max; ref tới input; className lên khung ngoài", () => {
    const ref = { current: null as HTMLInputElement | null };
    const { container } = render(
      <SpinButton ref={ref} aria-label="Số lượng" defaultValue={3} min={0} max={10} className="w-24" />,
    );
    expect(ref.current).toBe(input());
    expect(input()).toHaveAccessibleName("Số lượng");
    expect(input()).toHaveValue("3");
    expect(input()).toHaveAttribute("aria-valuenow", "3");
    expect(input()).toHaveAttribute("aria-valuemin", "0");
    expect(input()).toHaveAttribute("aria-valuemax", "10");
    expect(container.firstElementChild).toHaveClass("w-24", "inline-grid");
  });

  it("nhãn nút: tiếng Anh mặc định, tiếng Việt qua spinButtonMessagesVi, prop riêng thắng", () => {
    const { unmount } = renderBare(<SpinButton />);
    expect(screen.getByRole("button", { name: "Increment value" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrement value" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ spinButton: spinButtonMessagesVi }}>
        <SpinButton decrementLabel="Bớt" />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Tăng giá trị" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bớt" })).toBeInTheDocument();
  });

  it("↑/↓ theo step, PageUp/PageDown theo stepPage, Home/End tới min/max", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SpinButton aria-label="n" defaultValue={5} min={0} max={50} step={2} onValueChange={onValueChange} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue("7");
    expect(onValueChange).toHaveBeenLastCalledWith(7);
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input()).toHaveValue("3");
    await user.keyboard("{PageUp}");
    expect(input()).toHaveValue("23");
    await user.keyboard("{PageUp}{PageUp}");
    // Kẹp trong [min, max].
    expect(input()).toHaveValue("50");
    await user.keyboard("{Home}");
    expect(input()).toHaveValue("0");
    await user.keyboard("{End}");
    expect(input()).toHaveValue("50");
    await user.keyboard("{PageDown}");
    expect(input()).toHaveValue("30");
  });

  it("độ chính xác suy ra từ step; precision ghi đè", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpinButton aria-label="n" defaultValue={0.1} step={0.2} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue("0.3");
    unmount();
    render(<SpinButton aria-label="n" defaultValue={1} precision={2} />);
    expect(input()).toHaveValue("1.00");
  });

  it("gõ rồi Enter / blur thì xác nhận (kẹp, làm tròn); Escape huỷ chữ đang gõ; xoá hết → null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SpinButton aria-label="n" defaultValue={5} max={100} onValueChange={onValueChange} />);
    await user.clear(input());
    await user.type(input(), "42abc");
    expect(input()).toHaveValue("42abc");
    await user.keyboard("{Enter}");
    expect(input()).toHaveValue("42");
    expect(onValueChange).toHaveBeenLastCalledWith(42);

    await user.clear(input());
    await user.type(input(), "999");
    await user.tab();
    expect(input()).toHaveValue("100");

    await user.clear(input());
    await user.type(input(), "7");
    await user.keyboard("{Escape}");
    expect(input()).toHaveValue("100");

    await user.clear(input());
    await user.keyboard("{Enter}");
    expect(input()).toHaveValue("");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input()).not.toHaveAttribute("aria-valuenow");
  });

  it("chữ không đọc được giữ giá trị cũ; ↑ từ ô trống bắt đầu ở min (hoặc 0)", async () => {
    const user = userEvent.setup();
    render(<SpinButton aria-label="n" min={10} />);
    await user.type(input(), "abc");
    await user.keyboard("{Enter}");
    expect(input()).toHaveValue("");
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue("10");
  });

  it("formatValue / parseValue / displayValue", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <SpinButton
        aria-label="n"
        defaultValue={5}
        formatValue={(n) => `${n} kg`}
        parseValue={(text) => Number.parseInt(text, 10) * 2}
      />,
    );
    expect(input()).toHaveValue("5 kg");
    expect(input()).toHaveAttribute("aria-valuetext", "5 kg");
    await user.clear(input());
    await user.type(input(), "4");
    await user.keyboard("{Enter}");
    expect(input()).toHaveValue("8 kg");
    unmount();
    render(<SpinButton aria-label="n" value={3} displayValue="Ba" />);
    expect(input()).toHaveValue("Ba");
  });

  it("controlled: chỉ báo qua onValueChange, hiển thị theo value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<SpinButton aria-label="n" value={1} onValueChange={onValueChange} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(input()).toHaveValue("1");
    rerender(<SpinButton aria-label="n" value={9} onValueChange={onValueChange} />);
    expect(input()).toHaveValue("9");
  });

  it("nút: nhấn giữ lặp lại cho tới khi thả; tắt ở biên min/max", async () => {
    vi.useFakeTimers();
    render(<SpinButton aria-label="n" defaultValue={0} min={0} max={5} />);
    const up = screen.getByRole("button", { name: "Tăng giá trị" });
    const down = screen.getByRole("button", { name: "Giảm giá trị" });
    expect(down).toBeDisabled();
    fireEvent.pointerDown(up, { button: 0 });
    expect(input()).toHaveValue("1");
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(input()).toHaveValue("2");
    await act(() => vi.advanceTimersByTimeAsync(75));
    expect(input()).toHaveValue("3");
    fireEvent.pointerUp(up);
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(input()).toHaveValue("3");
    // Chuột phải không làm gì.
    fireEvent.pointerDown(up, { button: 2 });
    expect(input()).toHaveValue("3");
    fireEvent.pointerDown(up, { button: 0 });
    await act(() => vi.advanceTimersByTimeAsync(1000));
    // Dừng khi chạm max.
    expect(input()).toHaveValue("5");
    expect(up).toBeDisabled();
    fireEvent.pointerLeave(up);
    fireEvent.pointerDown(down, { button: 0 });
    fireEvent.pointerCancel(down);
    expect(input()).toHaveValue("4");
  });

  it("readOnly: phím không đổi giá trị, nút tắt; disabled + aria-invalid gắn data-*", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpinButton aria-label="n" defaultValue={1} readOnly />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue("1");
    expect(screen.getByRole("button", { name: "Tăng giá trị" })).toBeDisabled();
    unmount();
    const second = render(<SpinButton aria-label="n" disabled aria-invalid />);
    expect(input()).toBeDisabled();
    expect(second.container.firstElementChild).toHaveAttribute("data-disabled", "true");
    expect(second.container.firstElementChild).toHaveAttribute("data-invalid", "true");
  });

  it("onKeyDown của người dùng chạy trước, preventDefault chặn xử lý mặc định", async () => {
    const user = userEvent.setup();
    render(<SpinButton aria-label="n" defaultValue={1} onKeyDown={(e) => e.key === "ArrowUp" && e.preventDefault()} />);
    input().focus();
    await user.keyboard("{ArrowUp}");
    expect(input()).toHaveValue("1");
    await user.keyboard("{ArrowDown}");
    expect(input()).toHaveValue("0");
  });
});
