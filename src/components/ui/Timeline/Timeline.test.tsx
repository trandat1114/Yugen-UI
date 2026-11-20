import { afterEach, describe, expect, it, vi } from "vitest";
import { watchDeprecations } from "@/test/deprecation";
import { setMediaQueries } from "@/test/matchMedia";
import { act, render, screen, within } from "@testing-library/react";
import { Timeline, TimelineItem } from "./Timeline";

afterEach(() => vi.unstubAllGlobals());

function queueAnimationFrames() {
  const callbacks: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  return () =>
    act(() => {
      callbacks.splice(0).forEach((callback) => callback(0));
    });
}

function rect(top: number, height: number): DOMRect {
  return { top, bottom: top + height, height, width: 0, left: 0, right: 0, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
}

describe("Timeline", () => {
  it("renders an ordered list of events with machine-readable times", () => {
    render(
      <Timeline aria-label="Hoạt động">
        <TimelineItem title="Đã tạo đơn" time="09:12" dateTime="2026-10-28T09:12">
          Đơn #2041 từ cửa hàng online
        </TimelineItem>
        <TimelineItem title="Đã thanh toán" intent="success" time="09:15" />
      </Timeline>,
    );
    const list = screen.getByRole("list", { name: "Hoạt động" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("09:12").closest("time")).toHaveAttribute("dateTime", "2026-10-28T09:12");
    expect(within(items[0]).getByText("Đơn #2041 từ cửa hàng online")).toBeInTheDocument();
    expect(within(items[1]).getByText("09:15").tagName).toBe("SPAN");
  });

  it("hides the rail and icons from assistive tech", () => {
    render(
      <Timeline variant="compact">
        <TimelineItem title="Minh đã bình luận" icon={<svg data-testid="icon" />} />
      </Timeline>,
    );
    expect(screen.getByTestId("icon").closest("[aria-hidden]")).not.toBeNull();
  });

  it("tracks scroll progress with one frame-scheduled scroll listener and exposes the current item", () => {
    const flushFrame = queueAnimationFrames();
    const addScrollListener = vi.spyOn(window, "addEventListener");
    const removeScrollListener = vi.spyOn(window, "removeEventListener");
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
    const { unmount } = render(
      <Timeline progress progressLabel="Release progress" aria-label="Release history">
        <TimelineItem title="Alpha" time="Jan 1" />
        <TimelineItem title="Beta" time="Feb 1" />
        <TimelineItem title="GA" time="Mar 1" />
      </Timeline>,
    );
    expect(addScrollListener.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(1);
    const list = screen.getByRole("list", { name: "Release history" });
    const items = within(list).getAllByRole("listitem");
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(rect(400, 1000));
    items.forEach((item, index) => vi.spyOn(item, "getBoundingClientRect").mockReturnValue(rect(400 + index * 300, 100)));

    flushFrame();
    expect(screen.getByRole("progressbar", { name: "Release progress" })).toHaveAttribute("aria-valuenow", "25");
    expect(items[0]).toHaveAttribute("data-timeline-status", "current");
    expect(items[1]).toHaveAttribute("data-timeline-status", "upcoming");

    vi.spyOn(list, "getBoundingClientRect").mockReturnValue(rect(0, 1000));
    items.forEach((item, index) => vi.spyOn(item, "getBoundingClientRect").mockReturnValue(rect(index * 300, 100)));
    act(() => window.dispatchEvent(new Event("scroll")));
    flushFrame();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "65");
    expect(items[0]).toHaveAttribute("data-timeline-status", "complete");
    expect(items[1]).toHaveAttribute("data-timeline-status", "complete");
    expect(items[2]).toHaveAttribute("data-timeline-status", "current");
    expect(items[2]).toHaveAttribute("aria-current", "step");

    unmount();
    expect(removeScrollListener.mock.calls.filter(([type]) => type === "scroll")).toHaveLength(1);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("supports controlled status, sticky dates and reduced motion", () => {
    setMediaQueries({ "prefers-reduced-motion": true });
    const flushFrame = queueAnimationFrames();
    render(
      <Timeline progress activeIndex={0} dateLayout="sticky" aria-label="Roadmap">
        <TimelineItem title="Now" time="Today" dateTime="2026-11-20" />
        <TimelineItem title="Next" time="Tomorrow" status="upcoming" />
      </Timeline>,
    );
    flushFrame();
    const items = screen.getAllByRole("listitem");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(items[0]).toHaveAttribute("data-timeline-status", "current");
    expect(items[1]).toHaveAttribute("data-timeline-status", "upcoming");
    expect(within(items[0]).getByText("Today").parentElement).toHaveClass("sm:sticky");
    expect(within(items[0]).getByText("Today").compareDocumentPosition(within(items[0]).getByText("Now")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("TimelineItem intent", () => {
  it("error dùng màu danger; danger (giá trị cũ) vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    const { container } = render(
      <Timeline>
        <TimelineItem title="Lỗi" intent="error" icon={<svg />} />
        <TimelineItem title="Cũ" intent="danger" icon={<svg />} />
        <TimelineItem title="Cũ 2" intent="danger" icon={<svg />} />
      </Timeline>,
    );
    expect(container.querySelectorAll(".bg-danger-background-1")).toHaveLength(3);
    expect(warnings('TimelineItem.intent="danger"')).toBe(1);
  });
});
