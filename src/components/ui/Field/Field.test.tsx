import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./Field";

describe("Field", () => {
  it("nối nhãn, hint và thông báo với control (id, aria-labelledby, aria-describedby)", () => {
    render(
      <Field label="Email" hint="Dùng email công ty" validationMessage="Sai định dạng" validationState="error" required>
        <input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toHaveAccessibleDescription("Sai định dạng Dùng email công ty");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    // Thông báo lỗi là alert để trình đọc màn hình đọc ngay.
    expect(screen.getByRole("alert")).toHaveTextContent("Sai định dạng");
    expect(screen.getByText("*")).toHaveClass("text-danger-foreground-1");
  });

  it("id riêng; prop của control thắng prop Field gắn vào", () => {
    render(
      <Field label="Tên" id="name" disabled>
        <input aria-describedby="other" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Tên" });
    expect(input).toHaveAttribute("id", "name");
    expect(input).toHaveAttribute("aria-describedby", "other");
    expect(input).toBeDisabled();
    expect(screen.getByText("Tên")).toHaveClass("text-foreground-disabled");
  });

  it("render-prop nhận props của control (aria-labelledby cho control dạng nhóm)", () => {
    render(
      <Field label="Màu" hint="Chọn một">
        {(props) => <div role="radiogroup" {...props} />}
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Màu" });
    expect(group).toHaveAccessibleDescription("Chọn một");
  });

  it("warning / success: biểu tượng + màu, không phải alert; validationState none: chữ phụ", () => {
    const { rerender } = render(
      <Field label="Mật khẩu" validationState="warning" validationMessage="Hơi ngắn">
        <input />
      </Field>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const message = () => screen.getByText(/Hơi ngắn|Tốt|Ghi chú/).parentElement!;
    expect(message()).toHaveClass("text-warning-foreground-1");
    expect(message().querySelector("svg")).not.toBeNull();
    rerender(
      <Field label="Mật khẩu" validationState="success" validationMessage="Tốt">
        <input />
      </Field>,
    );
    expect(message()).toHaveClass("text-success-foreground-1");
    rerender(
      <Field label="Mật khẩu" validationMessage="Ghi chú">
        <input />
      </Field>,
    );
    expect(message()).toHaveClass("text-foreground-3");
    expect(message().querySelector("svg")).toBeNull();
  });

  it("orientation horizontal + size: lưới hai cột, cỡ chữ nhãn", () => {
    const { container, rerender } = render(
      <Field label="Tên" orientation="horizontal" size="small" className="w-80">
        <input />
      </Field>,
    );
    expect(container.firstElementChild).toHaveClass("grid", "w-80");
    expect(screen.getByText("Tên")).toHaveClass("text-caption1", "pt-1.5");
    rerender(
      <Field label="Tên" size="large">
        <input />
      </Field>,
    );
    expect(container.firstElementChild).toHaveClass("flex-col");
    expect(screen.getByText("Tên")).toHaveClass("text-body2", "font-semibold");
  });
});
