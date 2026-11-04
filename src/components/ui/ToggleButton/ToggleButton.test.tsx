import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton, toggleButtonVariants } from "./ToggleButton";

describe("ToggleButton", () => {
  it("nút có aria-pressed; ref + className", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <ToggleButton ref={ref} className="min-w-20">
        Đậm
      </ToggleButton>,
    );
    const button = screen.getByRole("button", { name: "Đậm" });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveClass("min-w-20");
  });

  it("uncontrolled: bấm / Enter / Space bật tắt, báo onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <ToggleButton defaultChecked onCheckedChange={onCheckedChange}>
        Đậm
      </ToggleButton>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-state", "on");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.keyboard(" ");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("controlled: chỉ đổi theo checked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton checked={false} onCheckedChange={onCheckedChange}>
        Nghiêng
      </ToggleButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(
      <ToggleButton checked onCheckedChange={onCheckedChange}>
        Nghiêng
      </ToggleButton>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("checkedIcon thay icon khi bật; iconPosition after; chỉ có icon → nút vuông", () => {
    const { rerender } = render(
      <ToggleButton icon={<svg data-testid="off" />} checkedIcon={<svg data-testid="on" />} aria-label="Ghim" />,
    );
    expect(screen.getByTestId("off")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ghim" })).toHaveClass("w-8");
    rerender(
      <ToggleButton checked icon={<svg data-testid="off" />} checkedIcon={<svg data-testid="on" />} iconPosition="after">
        Ghim
      </ToggleButton>,
    );
    expect(screen.queryByTestId("off")).not.toBeInTheDocument();
    expect(screen.getByRole("button").lastElementChild).toBe(screen.getByTestId("on"));
    expect(screen.getByRole("button")).not.toHaveClass("w-8");
  });

  it("disabled không bật được", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <ToggleButton disabled onCheckedChange={onCheckedChange}>
        Đậm
      </ToggleButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("toggleButtonVariants: lớp trạng thái bật theo appearance", () => {
    expect(toggleButtonVariants({ appearance: "subtle" })).toContain("data-[state=on]:bg-subtle-pressed");
    expect(toggleButtonVariants()).toContain("data-[state=on]:bg-background-1-pressed");
    expect(toggleButtonVariants({ appearance: "outline" })).toContain("data-[state=on]:inset-ring-2");
  });
});
