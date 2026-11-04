import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { CounterBadge, counterBadgeMessagesVi } from "./CounterBadge";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

describe("CounterBadge", () => {
  it("số hiển thị aria-hidden, nhãn đầy đủ cho trình đọc màn hình; ref + className", () => {
    const ref = { current: null as HTMLSpanElement | null };
    render(<CounterBadge ref={ref} count={5} className="absolute" data-testid="badge" />);
    const badge = screen.getByTestId("badge");
    expect(ref.current).toBe(badge);
    expect(badge).toHaveClass("absolute", "tabular-nums");
    expect(screen.getByText("5")).toHaveAttribute("aria-hidden", "true");
    expect(badge).toHaveTextContent("5 thông báo");
  });

  it("count = 0: ẩn, trừ khi showZero", () => {
    const { container, rerender } = render(<CounterBadge count={0} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<CounterBadge count={0} showZero />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("vượt overflowCount hiển thị N+", () => {
    const { rerender } = render(<CounterBadge count={150} data-testid="badge" />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toHaveTextContent("Hơn 99 thông báo");
    rerender(<CounterBadge count={12} overflowCount={9} data-testid="badge" />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("dot: chấm tròn không số, luôn filled; label ghi đè nhãn", () => {
    render(<CounterBadge dot appearance="ghost" size="large" label="Có tin nhắn" data-testid="badge" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("size-2.5", "min-w-0", "border-transparent");
    expect(badge).not.toHaveClass("bg-transparent");
    expect(badge).toHaveTextContent("Có tin nhắn");
  });

  it("color important: nền đảo; ghost: chữ foreground-1", () => {
    const { rerender } = render(<CounterBadge count={3} color="important" data-testid="badge" />);
    expect(screen.getByTestId("badge")).toHaveClass("bg-foreground-1", "text-foreground-inverted");
    rerender(<CounterBadge count={3} color="important" appearance="ghost" data-testid="badge" />);
    expect(screen.getByTestId("badge")).toHaveClass("text-foreground-1");
  });

  it("nhãn: tiếng Anh mặc định (số ít / số nhiều), tiếng Việt qua counterBadgeMessagesVi", () => {
    const { unmount } = renderBare(
      <>
        <CounterBadge count={1} data-testid="one" />
        <CounterBadge count={2} data-testid="two" />
        <CounterBadge count={1000} data-testid="many" />
        <CounterBadge dot data-testid="dot" />
      </>,
    );
    expect(screen.getByTestId("one")).toHaveTextContent("1 notification");
    expect(screen.getByTestId("two")).toHaveTextContent("2 notifications");
    expect(screen.getByTestId("many")).toHaveTextContent("More than 99 notifications");
    expect(screen.getByTestId("dot")).toHaveTextContent("New notifications");
    unmount();
    renderBare(
      <YugenProvider messages={{ counterBadge: counterBadgeMessagesVi }}>
        <CounterBadge dot data-testid="dot" />
      </YugenProvider>,
    );
    expect(screen.getByTestId("dot")).toHaveTextContent("Có thông báo mới");
  });
});
