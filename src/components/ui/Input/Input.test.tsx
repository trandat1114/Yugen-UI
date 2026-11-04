import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("textbox có nhãn; ref tới input; className lên khung, rootClassName lên phần tử ngoài cùng", () => {
    const ref = { current: null as HTMLInputElement | null };
    const { container } = render(<Input ref={ref} label="Họ tên" className="w-60" rootClassName="mb-2" />);
    const input = screen.getByRole("textbox", { name: "Họ tên" });
    expect(ref.current).toBe(input);
    expect(input.parentElement).toHaveClass("w-60", "rounded-medium", "h-8");
    expect(container.firstElementChild).toHaveClass("mb-2");
  });

  it("gõ: uncontrolled + onChange; controlled theo value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Input aria-label="Tìm" defaultValue="a" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "bc");
    expect(screen.getByRole("textbox")).toHaveValue("abc");
    expect(onChange).toHaveBeenCalledTimes(2);
    rerender(<Input aria-label="Tìm" value="xyz" onChange={onChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("xyz");
  });

  it("required hiện dấu *; hint + thông báo lỗi nối qua aria-describedby", () => {
    render(<Input label="Email" required hint="Email công ty" validationState="error" validationMessage="Bắt buộc" />);
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Bắt buộc Email công ty");
    expect(input.parentElement).toHaveClass("border-danger-background-3");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("warning / success hiện biểu tượng màu; không có validationState: chữ phụ", () => {
    const { rerender } = render(<Input aria-label="x" validationState="warning" validationMessage="Lưu ý" />);
    expect(screen.getByText("Lưu ý").parentElement).toHaveClass("text-warning-foreground-1");
    rerender(<Input aria-label="x" validationState="success" validationMessage="Ổn" />);
    expect(screen.getByText("Ổn").parentElement).toHaveClass("text-success-foreground-1");
    rerender(<Input aria-label="x" validationMessage="Ghi chú" />);
    expect(screen.getByText("Ghi chú").parentElement).toHaveClass("text-foreground-3");
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("contentBefore / contentAfter, appearance + size, disabled", () => {
    render(
      <Input
        label="Giá"
        appearance="underline"
        size="large"
        disabled
        contentBefore={<span>₫</span>}
        contentAfter={<span>VND</span>}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Giá" });
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("rounded-none", "h-10", "border-stroke-disabled");
    expect(input.previousElementSibling).toHaveTextContent("₫");
    expect(input.nextElementSibling).toHaveTextContent("VND");
    expect(screen.getByText("Giá")).toHaveClass("text-foreground-disabled");
  });
});
