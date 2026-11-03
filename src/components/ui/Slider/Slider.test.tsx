import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("thumb role slider có nhãn từ label; ref tới phần tử gốc; className + rootClassName", () => {
    const ref = { current: null as HTMLSpanElement | null };
    const { container } = render(
      <Slider ref={ref} label="Âm lượng" defaultValue={[40]} className="mt-1" rootClassName="w-60" />,
    );
    const thumb = screen.getByRole("slider", { name: "Âm lượng" });
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
    expect(ref.current).toHaveClass("mt-1", "h-8");
    expect(container.firstElementChild).toHaveClass("w-60");
  });

  it("aria-label khi không có label hiển thị; mặc định giá trị = min", () => {
    render(<Slider aria-label="Độ sáng" min={10} />);
    expect(screen.getByRole("slider", { name: "Độ sáng" })).toHaveAttribute("aria-valuenow", "10");
  });

  it("phím mũi tên / Home / End đổi giá trị, showValue cập nhật theo", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider label="Âm lượng" showValue defaultValue={[40]} step={5} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider");
    act(() => thumb.focus());
    await user.keyboard("{ArrowRight}");
    expect(thumb).toHaveAttribute("aria-valuenow", "45");
    expect(onValueChange).toHaveBeenLastCalledWith([45]);
    expect(screen.getByText("45")).toBeInTheDocument();
    await user.keyboard("{End}");
    expect(screen.getByText("100")).toBeInTheDocument();
    await user.keyboard("{Home}");
    expect(thumb).toHaveAttribute("aria-valuenow", "0");
  });

  it("khoảng giá trị: hai thumb, showValue nối bằng gạch", () => {
    render(<Slider aria-label="Giá" showValue defaultValue={[20, 80]} />);
    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(screen.getByText("20 – 80")).toBeInTheDocument();
  });

  it("controlled: hiển thị theo value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Slider aria-label="x" showValue value={[30]} onValueChange={onValueChange} />);
    act(() => screen.getByRole("slider").focus());
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith([31]);
    expect(screen.getByText("30")).toBeInTheDocument();
    rerender(<Slider aria-label="x" showValue value={[60]} onValueChange={onValueChange} />);
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("disabled + size small: nhãn mờ, data-disabled, thanh mảnh", () => {
    const { container } = render(<Slider label="Tắt" disabled size="small" />);
    expect(screen.getByText("Tắt")).toHaveClass("text-foreground-disabled");
    const root = container.querySelector("[data-disabled]");
    expect(root).toHaveClass("h-6");
  });

  it("material glass: thumb thành glass khi đang nhấn, trở lại khi thả", () => {
    const onPointerDown = vi.fn();
    render(<Slider aria-label="x" material="glass" onPointerDown={onPointerDown} />);
    const thumb = screen.getByRole("slider");
    const root = thumb.closest(".group\\/slider")!;
    fireEvent.pointerDown(root);
    expect(onPointerDown).toHaveBeenCalled();
    expect(thumb).toHaveClass("glass", "scale-160");
    act(() => {
      window.dispatchEvent(new Event("pointerup"));
    });
    expect(thumb).not.toHaveClass("glass");
  });
});
