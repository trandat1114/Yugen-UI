import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BarChart, LineChart, PieChart, RadarChart } from "./Chart";
import type { ChartTooltipConfig } from "./chartUtils";

/* Tooltip dùng chung cho mọi biểu đồ (#433): khoá màu, tiêu đề, giá trị, icon, nội dung riêng, ẩn. */

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 300, width: 600, height: 300, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

const tooltip = () => document.querySelector<HTMLElement>("div.absolute.rounded-medium[aria-hidden='true']");
const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
];
const series = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

function hoverLine(config?: ChartTooltipConfig) {
  render(<LineChart data={data} index="month" series={series} tooltip={config} locale="en-US" />);
  fireEvent.pointerOver(screen.getAllByRole("img")[1]);
  return tooltip();
}

describe("chart tooltip config (#433)", () => {
  it("shows a line key by default, or a dot, a dashed line or nothing", () => {
    expect(hoverLine()?.querySelectorAll("svg line")).toHaveLength(2);
    document.body.innerHTML = "";
    expect(hoverLine({ indicator: "dot" })?.querySelectorAll("span.rounded-circular")).toHaveLength(2);
    document.body.innerHTML = "";
    const dashed = hoverLine({ indicator: "dashed" });
    expect(dashed?.querySelector("svg line")).toHaveAttribute("stroke-dasharray", "4 3");
    document.body.innerHTML = "";
    const none = hoverLine({ indicator: "none" });
    expect(none?.querySelectorAll("svg")).toHaveLength(0);
    expect(none?.querySelector(".grid")).toHaveClass("grid-cols-[1fr_auto]");
  });

  it("hides or rewrites the title, and formats values from the raw number", () => {
    expect(hoverLine({ label: false })).not.toHaveTextContent("Feb");
    document.body.innerHTML = "";
    expect(hoverLine({ label: (label, index) => `${label} · #${index}` })).toHaveTextContent("Feb · #1");
    document.body.innerHTML = "";
    const formatted = hoverLine({ value: (v, key) => `${key}=${v / 100}` });
    expect(formatted).toHaveTextContent("desktop=3.05");
    expect(formatted).toHaveTextContent("mobile=2");
  });

  it("shows icons per series and custom content", () => {
    const withIcons = hoverLine({ icons: { desktop: <svg data-testid="desk" /> } });
    expect(withIcons?.querySelector("[data-testid='desk']")).not.toBeNull();
    document.body.innerHTML = "";
    const render = vi.fn(({ title, rows }) => (
      <p data-testid="custom">
        {title}: {rows.map((r: { key: string; value: number | null }) => `${r.key} ${r.value}`).join(", ")}
      </p>
    ));
    hoverLine({ render });
    expect(screen.getByTestId("custom")).toHaveTextContent("Feb: desktop 305, mobile 200");
    expect(render).toHaveBeenCalledWith(expect.objectContaining({ index: 1 }));
  });

  it("can be hidden while keyboard focus still works", () => {
    render(<LineChart data={data} index="month" series={series} tooltip={{ hidden: true }} />);
    const point = screen.getAllByRole("img")[0];
    fireEvent.focus(point);
    expect(tooltip()).toBeNull();
    expect(point).toHaveAttribute("tabindex", "0");
  });

  it("works the same on bar, pie and radar charts", () => {
    const config: ChartTooltipConfig = { label: false, value: (v) => `≈${Math.round(v / 10) * 10}` };
    const { unmount } = render(<BarChart data={data} index="month" series={series} tooltip={config} />);
    fireEvent.pointerOver(document.querySelector("[data-i]") ?? document.body);
    expect(tooltip()).toHaveTextContent("≈190");
    expect(tooltip()).not.toHaveTextContent("Jan");
    unmount();

    const pie = render(<PieChart data={[{ label: "Chrome", value: 275 }, { label: "Safari", value: 200 }]} tooltip={config} />);
    fireEvent.pointerOver(screen.getAllByRole("img").find((el) => el.tagName === "path") ?? document.body);
    expect(tooltip()).toHaveTextContent("≈280");
    pie.unmount();

    render(<RadarChart data={data} index="month" series={series} tooltip={config} legend={false} />);
    fireEvent.pointerOver(screen.getByRole("img", { name: /Feb/ }));
    expect(tooltip()).toHaveTextContent("≈310");
  });
});
