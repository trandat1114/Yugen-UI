import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisuallyHidden, visuallyHiddenClass } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("span sr-only, vẫn thuộc tên truy cập; ref + className", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(
      <button>
        <svg aria-hidden />
        <VisuallyHidden ref={ref} className="select-none">
          Đóng
        </VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Đóng" })).toBeInTheDocument();
    expect(ref.current?.tagName).toBe("SPAN");
    expect(ref.current).toHaveClass(visuallyHiddenClass, "select-none");
  });

  it("asChild: class gộp vào phần tử con", () => {
    render(
      <VisuallyHidden asChild>
        <h2>Tiêu đề ẩn</h2>
      </VisuallyHidden>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Tiêu đề ẩn" })).toHaveClass("sr-only");
  });

  it("focusable: chỉ ẩn khi không có focus bên trong (skip link)", () => {
    render(
      <VisuallyHidden focusable asChild>
        <a href="#main">Bỏ qua tới nội dung</a>
      </VisuallyHidden>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("not-focus-within:sr-only");
    expect(link).not.toHaveClass("sr-only");
  });
});
