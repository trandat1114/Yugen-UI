import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DonutChart, PieChart, RadialChart } from "./Chart";

/* Biến thể theo gallery cho Pie / Donut (#431) và Radial (#432). */

const browsers = [
  { label: "Chrome", value: 275 },
  { label: "Safari", value: 200 },
  { label: "Firefox", value: 187 },
  { label: "Edge", value: 173 },
  { label: "Tiny", value: 10 },
];

const labelsOf = (container: HTMLElement) => [...container.querySelectorAll("g.tabular-nums text")].map((t) => t.textContent);

describe("PieChart labels and active slice (#431)", () => {
  it("writes value, percent or name labels outside the slices, skipping slices under 4%", () => {
    const { container, rerender } = render(<PieChart data={browsers} labels="value" valueFormat={{ maximumFractionDigits: 0 }} />);
    expect(labelsOf(container)).toEqual(["275", "200", "187", "173"]);
    rerender(<PieChart data={browsers} labels="percent" />);
    expect(labelsOf(container)[0]).toMatch(/^32/);
    rerender(<PieChart data={browsers} labels="label" />);
    expect(labelsOf(container)).toEqual(["Chrome", "Safari", "Firefox", "Edge"]);
    rerender(<PieChart data={browsers} labels={({ label, share, index }) => `${index}.${label} ${Math.round(share * 100)}`} />);
    expect(labelsOf(container)[0]).toBe("0.Chrome 33");
  });

  it("emphasizes activeIndex and shows it in the donut center until a slice is hovered", () => {
    const { container } = render(<DonutChart data={browsers} activeIndex={1} valueFormat={{ maximumFractionDigits: 0 }} />);
    const opacity = () => [...container.querySelectorAll("g[aria-hidden] path")].slice(0, 5).map((p) => (p as SVGPathElement).style.opacity);
    expect(opacity()).toEqual(["var(--chartDimOpacity)", "", "var(--chartDimOpacity)", "var(--chartDimOpacity)", "var(--chartDimOpacity)"]);
    expect(container).toHaveTextContent("200");
    expect(container).toHaveTextContent("Safari");
    fireEvent.pointerOver(screen.getAllByRole("img")[0]);
    expect(opacity()[0]).toBe("");
    expect(opacity()[1]).toBe("var(--chartDimOpacity)");
  });

  it("ignores an out-of-range activeIndex and keeps the total in the center", () => {
    const { container } = render(<DonutChart data={browsers} activeIndex={9} valueFormat={{ maximumFractionDigits: 0 }} />);
    expect(container).toHaveTextContent("845");
  });
});

describe("RadialChart shapes and rings (#432)", () => {
  it("draws rounded arcs as stroked paths", () => {
    const { container } = render(<RadialChart data={[{ label: "Done", value: 72 }]} maxValue={100} rounded />);
    const arc = [...container.querySelectorAll("path")].find((p) => p.getAttribute("stroke-linecap") === "round" && p.getAttribute("stroke")?.startsWith("var("));
    expect(arc).toBeDefined();
  });

  it("draws one concentric ring per value with its label and track", () => {
    const data = [
      { label: "Chrome", value: 275 },
      { label: "Safari", value: 200 },
      { label: "Firefox", value: 0 },
    ];
    const { container } = render(<RadialChart data={data} layout="rings" rounded legend={false} />);
    const ringLabels = [...container.querySelectorAll("g[aria-hidden] text")].map((t) => t.textContent);
    expect(ringLabels).toEqual(["Chrome", "Safari", "Firefox"]);
    // Ba track + hai cung (Firefox = 0 không có cung).
    expect(container.querySelectorAll("circle[fill='none']")).toHaveLength(3);
    const arcs = [...container.querySelectorAll("path[stroke^='var(']")];
    expect(arcs).toHaveLength(2);
    // Không có số ở tâm khi không truyền centerValue.
    expect(container.querySelector("text.text-subtitle1")).toBeNull();
  });

  it("supports partial rings, a center value and the table in rings layout", () => {
    const data = [
      { label: "A", value: 50 },
      { label: "B", value: 80 },
    ];
    const { container, unmount } = render(<RadialChart data={data} layout="rings" startAngle={-90} endAngle={90} maxValue={100} centerValue="2 goals" />);
    expect(container.querySelectorAll("path[stroke-linecap='butt']").length).toBeGreaterThanOrEqual(2);
    expect(container).toHaveTextContent("2 goals");
    unmount();
    // Chế độ bảng thay hình vẽ: mỗi vòng là một hàng.
    render(<RadialChart data={data} layout="rings" maxValue={100} defaultShowTable />);
    expect(screen.getByRole("table")).toHaveTextContent("B");
  });
});
