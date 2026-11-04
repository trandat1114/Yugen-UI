import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
  it("gắn nhãn cho control qua htmlFor; ref + className", () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(
      <>
        <Label ref={ref} htmlFor="name" className="mb-1">
          Họ tên
        </Label>
        <input id="name" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Họ tên" })).toBeInTheDocument();
    expect(ref.current).toHaveClass("mb-1", "text-body1");
  });

  it("required: dấu * aria-hidden (không vào tên); ReactNode thay ký hiệu", () => {
    const { rerender } = render(
      <>
        <Label htmlFor="a" required>
          Email
        </Label>
        <input id="a" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("*")).toHaveClass("text-danger-foreground-1");
    rerender(
      <Label htmlFor="a" required="(bắt buộc)">
        Email
      </Label>,
    );
    expect(screen.getByText("(bắt buộc)")).toBeInTheDocument();
  });

  it("size / weight / disabled", () => {
    render(
      <>
        <Label size="large">Lớn</Label>
        <Label size="large" weight="regular">
          Lớn thường
        </Label>
        <Label size="small" disabled required>
          Tắt
        </Label>
      </>,
    );
    expect(screen.getByText("Lớn")).toHaveClass("text-body2", "font-semibold");
    expect(screen.getByText("Lớn thường")).toHaveClass("font-normal");
    const disabled = screen.getByText("Tắt");
    expect(disabled).toHaveClass("text-caption1", "text-foreground-disabled", "cursor-not-allowed");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("*")).toHaveClass("text-foreground-disabled");
  });
});
