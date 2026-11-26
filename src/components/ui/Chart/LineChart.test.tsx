import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AreaChart, LineChart } from "./LineChart";

const data = [
  { month: "Jan", visits: 120, sales: 30 },
  { month: "Feb", visits: 180, sales: null },
  { month: "Mar", visits: 150, sales: 45 },
];
const series = [
  { key: "visits", label: "Visits" },
  { key: "sales", label: "Sales" },
];

// jsdom không đo được bố cục: khung vẽ rộng 600px để LineChart có toạ độ.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 300, width: 600, height: 300, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

describe("LineChart value labels and markers (#430)", () => {
  it("writes each value above its point, skipping missing values", () => {
    const { container } = render(<LineChart data={data} index="month" series={series} valueLabels locale="en-US" />);
    const labels = [...container.querySelectorAll("g.tabular-nums text")].map((t) => t.textContent);
    expect(labels).toEqual(expect.arrayContaining(["120", "180", "150", "30", "45"]));
    expect(labels).not.toContain("");
    expect(labels).toHaveLength(5);
  });

  it("formats labels with a function", () => {
    const { container } = render(
      <LineChart data={data} index="month" series={[series[0]]} valueLabels={(v, i) => `${i}:${v / 10}`} />,
    );
    const labels = [...container.querySelectorAll("g.tabular-nums text")].map((t) => t.textContent);
    expect(labels).toEqual(["0:12", "1:18", "2:15"]);
  });

  it("thins labels when points are close, keeping the last one", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ day: `D${i}`, v: i }));
    const { container } = render(<LineChart data={many} index="day" series={[{ key: "v", label: "V" }]} valueLabels />);
    const labels = [...container.querySelectorAll("g.tabular-nums text")].map((t) => t.textContent);
    expect(labels.length).toBeLessThan(60);
    expect(labels.at(-1)).toBe("59");
  });

  it("draws custom markers inside the series group and turns markers on", () => {
    const { container } = render(
      <AreaChart
        data={data}
        index="month"
        series={[series[0]]}
        renderMarker={({ x, y, index, series: key, value }) => <rect data-testid="marker" data-info={`${key}-${index}-${value}`} x={x - 3} y={y - 3} width={6} height={6} />}
      />,
    );
    const markers = screen.getAllByTestId("marker");
    expect(markers.map((m) => m.getAttribute("data-info"))).toEqual(["visits-0-120", "visits-1-180", "visits-2-150"]);
    expect(markers[0].closest("g[aria-hidden]")).not.toBeNull();
    expect(container.querySelectorAll("circle[r='4']")).toHaveLength(0);
  });
});
