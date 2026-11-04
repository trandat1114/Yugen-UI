import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./Empty";

describe("Empty", () => {
  it("cấu trúc: media, tiêu đề h3, mô tả, vùng hành động; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Empty ref={ref} className="min-h-60" data-testid="empty">
        <EmptyHeader>
          <EmptyMedia data-testid="media">
            <svg />
          </EmptyMedia>
          <EmptyTitle>Chưa có dự án</EmptyTitle>
          <EmptyDescription>
            Tạo dự án đầu tiên hoặc <a href="#mau">dùng mẫu</a>.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button>Tạo dự án</button>
        </EmptyContent>
      </Empty>,
    );
    const empty = screen.getByTestId("empty");
    expect(ref.current).toBe(empty);
    expect(empty).toHaveClass("min-h-60", "text-center");
    expect(empty).not.toHaveClass("border-dashed");
    expect(screen.getByRole("heading", { level: 3, name: "Chưa có dự án" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "dùng mẫu" })).toBeInTheDocument();
    expect(screen.getByTestId("media")).toHaveClass("size-12", "bg-background-4");
    expect(screen.getByRole("button", { name: "Tạo dự án" }).parentElement).toHaveClass("justify-center");
  });

  it("variant outline: viền nét đứt; EmptyMedia default giữ nguyên nội dung", () => {
    render(
      <Empty variant="outline" data-testid="empty">
        <EmptyMedia variant="default" data-testid="media" />
      </Empty>,
    );
    expect(screen.getByTestId("empty")).toHaveClass("border-dashed", "rounded-2xlarge");
    expect(screen.getByTestId("media")).not.toHaveClass("size-12");
  });
});
