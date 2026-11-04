import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollArea, ScrollBar } from "./ScrollArea";

describe("ScrollArea", () => {
  it("vùng cuộn focus được bằng bàn phím; ref + className + viewportClassName", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ScrollArea ref={ref} className="h-40" viewportClassName="pe-3" data-testid="root">
        <p>Nội dung dài</p>
      </ScrollArea>,
    );
    const root = screen.getByTestId("root");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("h-40", "overflow-hidden");
    const viewport = screen.getByText("Nội dung dài").closest("[data-radix-scroll-area-viewport]")!;
    expect(viewport).toHaveClass("pe-3");
    await user.tab();
    expect(viewport).toHaveFocus();
  });

  it("orientation: chỉ dựng thanh cuộn theo hướng được chọn (type always để luôn hiện)", () => {
    const { container, rerender } = render(
      <ScrollArea type="always">
        <p>A</p>
      </ScrollArea>,
    );
    const bars = () => Array.from(container.querySelectorAll("[data-orientation]")).map((el) => el.getAttribute("data-orientation"));
    expect(bars()).toEqual(["vertical"]);
    rerender(
      <ScrollArea type="always" orientation="horizontal">
        <p>A</p>
      </ScrollArea>,
    );
    expect(bars()).toEqual(["horizontal"]);
    rerender(
      <ScrollArea type="always" orientation="both">
        <p>A</p>
      </ScrollArea>,
    );
    expect(bars()).toEqual(["vertical", "horizontal"]);
  });

  it("ScrollBar: lớp theo hướng, className gộp", () => {
    const { container } = render(
      <ScrollArea type="always" orientation="horizontal">
        <p>A</p>
        <ScrollBar orientation="horizontal" className="opacity-80" forceMount />
      </ScrollArea>,
    );
    const bar = container.querySelector(".opacity-80");
    expect(bar).toHaveClass("h-3", "flex-col");
  });
});
