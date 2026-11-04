import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompoundButton } from "./CompoundButton";

describe("CompoundButton", () => {
  it("nút type=button, tên gồm cả dòng phụ; ref + className", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <CompoundButton ref={ref} secondaryContent="Bản nháp sẽ được lưu" className="w-64" onClick={onClick}>
        Tạo tài liệu
      </CompoundButton>,
    );
    const button = screen.getByRole("button", { name: /Tạo tài liệu/ });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveTextContent("Bản nháp sẽ được lưu");
    expect(button).toHaveClass("w-64", "h-auto", "p-3");
    expect(screen.getByText("Tạo tài liệu")).toHaveClass("font-semibold");
    expect(screen.getByText("Bản nháp sẽ được lưu")).toHaveClass("text-caption1", "text-foreground-2");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("primary: dòng phụ dùng màu trên nền brand; size small / large đổi cỡ", () => {
    render(
      <>
        <CompoundButton appearance="primary" size="small" secondaryContent="Phụ nhỏ">
          Nhỏ
        </CompoundButton>
        <CompoundButton size="large" secondaryContent="Phụ lớn">
          Lớn
        </CompoundButton>
      </>,
    );
    expect(screen.getByText("Phụ nhỏ")).toHaveClass("text-caption2", "text-foreground-on-brand");
    expect(screen.getByText("Phụ lớn")).toHaveClass("text-body1");
    expect(screen.getByRole("button", { name: /Lớn/ })).toHaveClass("p-4");
  });

  it("icon trước / sau; chỉ có icon thì bỏ khối chữ", () => {
    const { rerender } = render(
      <CompoundButton icon={<svg data-testid="icon" />} iconPosition="after">
        Mở
      </CompoundButton>,
    );
    expect(screen.getByRole("button").lastElementChild).toBe(screen.getByTestId("icon"));
    rerender(<CompoundButton icon={<svg data-testid="icon" />} aria-label="Mở" />);
    const button = screen.getByRole("button", { name: "Mở" });
    expect(button).toHaveClass("min-w-0");
    expect(button.children).toHaveLength(1);
  });

  it("asChild: nội dung ghép vào phần tử con, giữ class", () => {
    render(
      <CompoundButton asChild secondaryContent="Xem hướng dẫn">
        <a href="#bat-dau">Bắt đầu</a>
      </CompoundButton>,
    );
    const link = screen.getByRole("link", { name: /Bắt đầu/ });
    expect(link).toHaveAttribute("href", "#bat-dau");
    expect(link).toHaveClass("group/compound");
    expect(link).toHaveTextContent("Xem hướng dẫn");
  });

  it("type riêng vẫn được giữ", () => {
    render(<CompoundButton type="submit">Gửi</CompoundButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
