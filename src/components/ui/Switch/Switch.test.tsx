import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("role switch có nhãn; ref tới input; className lên input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Switch ref={ref} label="Chế độ tối" className="ms-1" />);
    const control = screen.getByRole("switch", { name: "Chế độ tối" });
    expect(ref.current).toBe(control);
    expect(control).toHaveClass("ms-1", "w-10");
    expect(control).not.toBeChecked();
  });

  it("uncontrolled: bấm nhãn / Space bật tắt, báo onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText("Wi-Fi"));
    expect(screen.getByRole("switch")).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(" ");
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("controlled: chỉ báo qua callback", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Switch aria-label="x" checked={false} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch")).not.toBeChecked();
    rerender(<Switch aria-label="x" checked onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("disabled; labelPosition before; id riêng", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch id="sw" label="Khoá" disabled labelPosition="before" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "Khoá" });
    expect(control).toHaveAttribute("id", "sw");
    expect(control).toBeDisabled();
    expect(control.parentElement!.parentElement).toHaveClass("flex-row-reverse");
    await user.click(screen.getByText("Khoá"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("material glass: thumb thành glass khi nhấn, onPointerDown của người dùng vẫn chạy", () => {
    const onPointerDown = vi.fn();
    render(<Switch aria-label="x" material="glass" onPointerDown={onPointerDown} />);
    const control = screen.getByRole("switch");
    const thumb = control.nextElementSibling!;
    expect(thumb).not.toHaveClass("glass");
    fireEvent.pointerDown(control);
    expect(onPointerDown).toHaveBeenCalled();
    expect(thumb).toHaveClass("glass", "w-6");
    act(() => {
      window.dispatchEvent(new Event("pointercancel"));
    });
    expect(thumb).not.toHaveClass("glass");
  });

  it("trong form gửi giá trị như input thường", () => {
    const { container } = render(
      <form>
        <Switch name="wifi" defaultChecked aria-label="Wi-Fi" />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("wifi")).toBe("on");
  });
});
