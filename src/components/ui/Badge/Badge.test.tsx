import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("mặc định filled / brand / medium / circular; ref + className", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(
      <Badge ref={ref} className="ms-1" data-testid="badge">
        Mới
      </Badge>,
    );
    const badge = screen.getByTestId("badge");
    expect(ref.current).toBe(badge);
    expect(badge).toHaveClass("bg-brand-background", "text-foreground-on-brand", "h-5", "rounded-circular", "ms-1");
    expect(screen.getByText("Mới")).toHaveClass("px-0.5");
  });

  it("appearance × color chọn đúng tổ hợp màu", () => {
    render(
      <>
        <Badge data-testid="tint" appearance="tint" color="danger" />
        <Badge data-testid="outline" appearance="outline" color="success" />
        <Badge data-testid="ghost" appearance="ghost" color="warning" />
        <Badge data-testid="warning" color="warning" />
      </>,
    );
    expect(screen.getByTestId("tint")).toHaveClass("bg-danger-background-1", "border-danger-border-1");
    expect(screen.getByTestId("outline")).toHaveClass("bg-transparent", "border-current", "text-success-foreground-1");
    expect(screen.getByTestId("ghost")).toHaveClass("text-warning-foreground-1");
    // Nền cam sáng: chữ tối cố định để đủ tương phản.
    expect(screen.getByTestId("warning")).toHaveClass("text-foreground-1-static");
  });

  it("size / shape; chỉ có icon thì không có khối chữ", () => {
    render(<Badge data-testid="badge" size="extra-large" shape="square" icon={<svg data-testid="icon" />} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("h-8", "rounded-none");
    expect(badge.children).toHaveLength(1);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
