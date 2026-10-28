import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Timeline, TimelineItem } from "./Timeline";

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
});
