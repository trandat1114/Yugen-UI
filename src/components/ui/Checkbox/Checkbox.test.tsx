import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("role checkbox, tên từ label; ref tới nút; className lên nút", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Checkbox ref={ref} label="Ghi nhớ" className="me-1" />);
    const box = screen.getByRole("checkbox", { name: "Ghi nhớ" });
    expect(ref.current).toBe(box);
    expect(box).toHaveClass("me-1", "size-4");
    expect(box).not.toBeChecked();
  });

  it("uncontrolled: bấm nhãn hoặc Space đổi trạng thái, báo onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Ghi nhớ" defaultChecked onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");
    expect(box).toBeChecked();
    await user.click(screen.getByText("Ghi nhớ"));
    expect(box).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    box.focus();
    await user.keyboard(" ");
    expect(box).toBeChecked();
  });

  it("controlled + indeterminate: aria-checked=mixed, chỉ báo qua callback", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Checkbox label="Tất cả" checked="indeterminate" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-checked", "mixed");
    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "mixed");
    rerender(<Checkbox label="Tất cả" checked onCheckedChange={onCheckedChange} />);
    expect(box).toBeChecked();
  });

  it("disabled: không đổi được, nhãn con trỏ not-allowed", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Khoá" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText("Khoá"));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByText("Khoá")).toHaveClass("cursor-not-allowed");
  });

  it("size large, labelPosition before, id riêng", () => {
    render(<Checkbox id="cb" label="Lớn" size="large" labelPosition="before" />);
    const box = screen.getByRole("checkbox", { name: "Lớn" });
    expect(box).toHaveAttribute("id", "cb");
    expect(box).toHaveClass("size-5");
    expect(box.parentElement).toHaveClass("flex-row-reverse");
    expect(screen.getByText("Lớn")).toHaveClass("text-body2");
  });

  it("trong form gửi giá trị qua input ẩn", () => {
    const { container } = render(
      <form>
        <Checkbox name="remember" value="yes" defaultChecked label="Ghi nhớ" />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("remember")).toBe("yes");
  });
});
