import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

const item = (name: string) => screen.getByRole("radio", { name });

describe("ToggleGroup", () => {
  it("single: radiogroup, chọn một; ref + className; secondary ghép liền viền", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ToggleGroup ref={ref} type="single" defaultValue="left" aria-label="Căn lề" className="me-2" onValueChange={onValueChange}>
        <ToggleGroupItem value="left">Trái</ToggleGroupItem>
        <ToggleGroupItem value="center">Giữa</ToggleGroupItem>
        <ToggleGroupItem value="right" disabled>
          Phải
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "Căn lề" });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass("me-2", "flex-row");
    expect(item("Trái")).toHaveAttribute("aria-checked", "true");
    await user.click(item("Giữa"));
    expect(item("Giữa")).toHaveAttribute("aria-checked", "true");
    expect(item("Trái")).toHaveAttribute("aria-checked", "false");
    expect(onValueChange).toHaveBeenCalledWith("center");
  });

  it("mũi tên đi giữa các mục (roving focus), bỏ qua mục disabled", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="single" aria-label="Căn lề">
        <ToggleGroupItem value="left">Trái</ToggleGroupItem>
        <ToggleGroupItem value="center" disabled>
          Giữa
        </ToggleGroupItem>
        <ToggleGroupItem value="right">Phải</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.tab();
    expect(item("Trái")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(item("Phải")).toHaveFocus();
  });

  it("multiple: nút bật tắt độc lập (aria-pressed)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="multiple" aria-label="Định dạng" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold">Đậm</ToggleGroupItem>
        <ToggleGroupItem value="italic">Nghiêng</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Đậm" }));
    await user.click(screen.getByRole("button", { name: "Nghiêng" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    expect(screen.getByRole("button", { name: "Đậm" })).toHaveAttribute("aria-pressed", "true");
  });

  it("subtle: rời nhau có khoảng cách; vertical xếp dọc; mục chỉ có icon thành nút vuông", () => {
    render(
      <ToggleGroup type="single" appearance="subtle" size="small" orientation="vertical" aria-label="Công cụ">
        <ToggleGroupItem value="pen" icon={<svg />} aria-label="Bút" />
        <ToggleGroupItem value="text">Chữ</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "Công cụ" });
    expect(group).toHaveClass("gap-0.5", "flex-col");
    expect(item("Bút")).toHaveClass("w-6");
    expect(item("Chữ")).toHaveClass("min-w-0");
  });
});
