import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AreaChart, BarChart, LineChart, RadarChart } from "./Chart";

/* Biến thể theo gallery cho Area / Bar / Line (#428, #429, #430). */

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 300, width: 600, height: 300, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

const browsers = [
  { browser: "Chrome", visitors: 275 },
  { browser: "Safari", visitors: 200 },
  { browser: "Firefox", visitors: -40 },
];
const months = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
];
const tooltip = () => document.querySelector<HTMLElement>("div.absolute.rounded-medium[aria-hidden='true']");

describe("BarChart gallery (#429)", () => {
  it("colors each category with colorBy=\"category\" and lists the categories in the legend", () => {
    const { container } = render(<BarChart data={browsers} index="browser" series={[{ key: "visitors", label: "Visitors" }]} colorBy="category" />);
    const fills = [...container.querySelectorAll("g[aria-hidden] g[style]")].map((g) => (g as SVGGElement).style.fill);
    expect(new Set(fills).size).toBe(3);
    expect(screen.getByText("Chrome", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Visitors/ })).toBeNull();
  });

  it("keeps colors by series when there are several series", () => {
    const { container } = render(<BarChart data={months} index="month" series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]} colorBy="category" />);
    expect(container.querySelectorAll("g[aria-hidden] g[style]")).toHaveLength(2);
  });

  it("emphasizes activeIndex until a bar is hovered", () => {
    const { container } = render(<BarChart data={months} index="month" series={[{ key: "desktop", label: "Desktop" }]} activeIndex={1} />);
    const opacities = () => [...container.querySelectorAll("g[aria-hidden] path")].map((p) => (p as SVGPathElement).style.opacity);
    expect(opacities()).toEqual(["var(--chartDimOpacity)", "", "var(--chartDimOpacity)"]);
    fireEvent.pointerOver(screen.getAllByRole("img")[2]);
    expect(opacities()).toEqual(["var(--chartDimOpacity)", "var(--chartDimOpacity)", ""]);
  });

  it("writes custom value labels, including stacked totals", () => {
    const { container, rerender } = render(
      <BarChart data={months} index="month" series={[{ key: "desktop", label: "Desktop" }]} showValues={(v, i) => `${i}:${v}`} />,
    );
    const labels = () => [...container.querySelectorAll("text")].map((t) => t.textContent).filter((t) => t?.includes(":"));
    expect(labels()).toEqual(["0:186", "1:305", "2:237"]);
    rerender(
      <BarChart
        data={months}
        index="month"
        layout="stacked"
        series={[{ key: "desktop", label: "Desktop" }, { key: "mobile", label: "Mobile" }]}
        showValues={(v, _i, key) => `${key}:${v}`}
      />,
    );
    expect(labels()).toEqual(["__total:266", "__total:505", "__total:357"]);
  });
});

describe("AreaChart gallery (#428)", () => {
  it("fills areas with a gradient", () => {
    const { container } = render(<AreaChart data={months} index="month" series={[{ key: "desktop", label: "Desktop" }]} gradient />);
    const gradient = container.querySelector("linearGradient");
    expect(gradient?.querySelectorAll("stop")).toHaveLength(2);
    const area = [...container.querySelectorAll("path")].find((p) => p.style.fill.startsWith("url("));
    expect(area?.style.fill).toContain(gradient?.id);
  });
});

describe("series icons (#428, #433)", () => {
  it("shows a series icon in the legend and the tooltip of line, bar and radar charts", () => {
    const series = [
      { key: "desktop", label: "Desktop", icon: <svg data-testid="desk" /> },
      { key: "mobile", label: "Mobile" },
    ];
    const { unmount } = render(<LineChart data={months} index="month" series={series} />);
    expect(screen.getAllByTestId("desk")).toHaveLength(1);
    fireEvent.pointerOver(screen.getAllByRole("img")[0]);
    expect(tooltip()?.querySelector("[data-testid='desk']")).not.toBeNull();
    unmount();
    const bar = render(<BarChart data={months} index="month" series={series} />);
    expect(screen.getAllByTestId("desk")).toHaveLength(1);
    bar.unmount();
    render(<RadarChart data={months} index="month" series={series} />);
    expect(screen.getAllByTestId("desk")).toHaveLength(1);
    fireEvent.pointerOver(screen.getByRole("img", { name: /Feb/ }));
    expect(tooltip()?.querySelector("[data-testid='desk']")).not.toBeNull();
  });
});
