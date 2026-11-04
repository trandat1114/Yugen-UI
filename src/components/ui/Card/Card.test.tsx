import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardContent, CardFooter, CardHeader, CardPreview } from "./Card";

describe("Card", () => {
  it("mặc định filled / medium; ref + className; các phần con", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Card ref={ref} className="w-80" data-testid="card">
        <CardPreview>
          <img src="/anh.png" alt="Ảnh bìa" />
        </CardPreview>
        <CardHeader
          image={<span data-testid="avatar" />}
          header="Báo cáo quý"
          description="Cập nhật hôm qua"
          action={<button>Thêm</button>}
        />
        <CardContent>Tóm tắt doanh thu</CardContent>
        <CardFooter>
          <button>Mở</button>
        </CardFooter>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(ref.current).toBe(card);
    expect(card).toHaveClass("w-80", "bg-background-1", "shadow-4", "p-3");
    expect(card).not.toHaveClass("cursor-pointer");
    expect(screen.getByText("Báo cáo quý")).toHaveClass("font-semibold");
    expect(screen.getByText("Cập nhật hôm qua")).toHaveClass("text-foreground-3");
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ảnh bìa" }).parentElement).toHaveClass("-mx-3");
    expect(screen.getByText("Tóm tắt doanh thu")).toHaveClass("text-foreground-2");
    expect(screen.getByRole("button", { name: "Mở" }).parentElement).toHaveClass("flex");
  });

  it("CardHeader không có description / image / action: chỉ còn tiêu đề", () => {
    const { container } = render(<CardHeader header="Chỉ tiêu đề" />);
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  it("interactive thêm trạng thái hover theo appearance; size / appearance", () => {
    render(
      <>
        <Card data-testid="a" interactive />
        <Card data-testid="b" interactive appearance="outline" size="large" />
        <Card data-testid="c" appearance="subtle" size="small" />
        <Card data-testid="d" appearance="filled-alternative" interactive />
      </>,
    );
    expect(screen.getByTestId("a")).toHaveClass("cursor-pointer", "hover:shadow-8");
    expect(screen.getByTestId("b")).toHaveClass("border-stroke-1", "hover:border-stroke-1-hover", "p-4");
    expect(screen.getByTestId("c")).toHaveClass("bg-transparent", "border-transparent", "p-2");
    expect(screen.getByTestId("c")).not.toHaveClass("hover:bg-subtle-hover");
    expect(screen.getByTestId("d")).toHaveClass("bg-background-2", "hover:shadow-8");
  });
});
