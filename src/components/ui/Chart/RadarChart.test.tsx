import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { messagesEn } from "../messages-en";
import { RadarChart } from "./RadarChart";

const data = [
  { axis: "Speed", alpha: 86, beta: 72 },
  { axis: "Quality", alpha: 78, beta: 88 },
  { axis: "Support", alpha: 92, beta: null },
];

describe("RadarChart", () => {
  it("exposes keyboard axes and an equivalent focused tooltip", () => {
    render(
      <RadarChart
        data={data}
        index="axis"
        series={[
          { key: "alpha", label: "Alpha" },
          { key: "beta", label: "Beta" },
        ]}
      />,
    );

    const speed = screen.getByRole("img", { name: /Speed:/ });
    expect(speed).toHaveAttribute("tabindex", "0");

    fireEvent.focus(speed);

    expect(screen.getAllByText("Speed").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(1);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("toggles a series without removing its accessible table column", () => {
    render(
      <RadarChart
        data={data}
        index="axis"
        series={[
          { key: "alpha", label: "Alpha" },
          { key: "beta", label: "Beta" },
        ]}
      />,
    );

    const beta = screen.getByRole("button", { name: /Beta/ });
    expect(beta).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(beta);

    expect(beta).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /Bảng dữ liệu|Data table/ })).toBeInTheDocument();
  });

  const two = [
    { key: "alpha", label: "Alpha" },
    { key: "beta", label: "Beta" },
  ];

  it("names the chart from messages.chart in the app's language", () => {
    const { container, rerender } = render(<RadarChart data={data} index="axis" series={two} />);
    expect(container.querySelector("svg[role=group]")).toHaveAttribute(
      "aria-label",
      "Biểu đồ radar: 3 trục, 2 chuỗi (Alpha, Beta). Dùng phím mũi tên để duyệt từng trục.",
    );
    expect(screen.getByRole("img", { name: "Support: Alpha 92, Beta Không có dữ liệu" })).toBeInTheDocument();
    rerender(
      <YugenProvider messages={messagesEn} locale="en-US">
        <RadarChart data={data} index="axis" series={two} />
      </YugenProvider>,
    );
    expect(container.querySelector("svg[role=group]")).toHaveAttribute(
      "aria-label",
      "Radar chart: 3 axes, 2 series (Alpha, Beta). Use the arrow keys to move between axes.",
    );
    expect(screen.getByRole("img", { name: "Support: Alpha 92, Beta No data" })).toBeInTheDocument();
  });

  it("keeps each series' color and the scale when another series is hidden", () => {
    const { container } = render(<RadarChart data={data} index="axis" series={two} />);
    const pathOf = (slot: string) =>
      [...container.querySelectorAll<SVGGElement>("svg g[style]")].find((g) => g.style.stroke.includes(slot))?.querySelector("path")?.getAttribute("d");
    const betaBefore = pathOf("2");
    fireEvent.click(screen.getByRole("button", { name: /Alpha/ }));
    expect(pathOf("1")).toBeUndefined();
    expect(pathOf("2")).toBe(betaBefore);
  });

  it("moves between axes with the arrow keys and draws the focus ring only for the keyboard", () => {
    const { container } = render(<RadarChart data={data} index="axis" series={two} legend={false} />);
    const speed = screen.getByRole("img", { name: /Speed:/ });
    fireEvent.focus(speed);
    expect(container.querySelector("circle[pointer-events=none]")).not.toBeNull();
    fireEvent.keyDown(speed, { key: "ArrowRight" });
    const quality = screen.getByRole("img", { name: /Quality:/ });
    expect(quality).toHaveFocus();
    expect(quality).toHaveAttribute("tabindex", "0");
    expect(speed).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(quality, { key: "Escape" });
    expect(container.querySelector("circle[pointer-events=none]")).toBeNull();
  });

  it("draws a polygon, circle or no grid, and texture patterns in high contrast", () => {
    const props = { data, index: "axis", series: two, legend: false, levels: 3 } as const;
    const { container, rerender } = render(<RadarChart {...props} />);
    const gridGroup = () => container.querySelector("svg > g[fill=none]");
    expect(gridGroup()?.querySelectorAll("path")).toHaveLength(3);
    expect(gridGroup()?.querySelectorAll("line")).toHaveLength(3);
    rerender(<RadarChart {...props} grid="circle" />);
    expect(gridGroup()?.querySelectorAll("circle")).toHaveLength(3);
    rerender(<RadarChart {...props} grid="none" />);
    expect(gridGroup()).toBeNull();
    expect(container.querySelector("pattern")).toBeNull();
    rerender(<RadarChart {...props} texture />);
    expect(container.querySelectorAll("pattern").length).toBeGreaterThan(0);
    const fills = [...container.querySelectorAll("path[stroke-linejoin]")].map((p) => p.getAttribute("fill"));
    // Chuỗi đầu (slot 1) luôn tô đặc; các chuỗi sau dùng hoa văn.
    expect(fills[0]).toMatch(/^var\(/);
    expect(fills[1]).toMatch(/^url\(#/);
    // Nét đứt như legend (slot 2 trở đi), để phân biệt chuỗi không cần màu.
    const dashes = [...container.querySelectorAll("path[stroke-linejoin]")].map((p) => p.getAttribute("stroke-dasharray"));
    expect(dashes[0]).toBeNull();
    expect(dashes[1]).not.toBeNull();
    rerender(<RadarChart {...props} texture linesOnly dots />);
    expect(container.querySelector("pattern")).toBeNull();
    expect(container.querySelectorAll("svg g[style] > g circle")).toHaveLength(5);
  });

  it("keeps the grid and series geometry when the pointer moves between axes", () => {
    const { container } = render(<RadarChart data={data} index="axis" series={two} legend={false} />);
    const seriesPath = container.querySelector("svg g[style] > path");
    fireEvent.pointerOver(screen.getByRole("img", { name: /Quality:/ }));
    expect(screen.getAllByText("Quality").length).toBeGreaterThan(1);
    expect(container.querySelector("svg g[style] > path")).toBe(seriesPath);
    fireEvent.pointerLeave(container.querySelector("svg[role=group]") as Element);
    expect(screen.getAllByText("Quality")).toHaveLength(1);
  });

  it("handles an empty data set and a fixed domain", () => {
    const { container, rerender } = render(<RadarChart data={[]} index="axis" series={two} legend={false} />);
    expect(container.querySelector("svg[role=group]")).toHaveAttribute("aria-label", expect.stringContaining("0 trục"));
    rerender(<RadarChart data={data} index="axis" series={[two[0]]} legend={false} domain={[0, 200]} ariaLabel="Scores" />);
    expect(container.querySelector("svg[role=group]")).toHaveAttribute("aria-label", "Scores");
  });

  it("shows every series in the data table, with a dash for missing values", () => {
    render(<RadarChart data={data} index="axis" series={two} indexLabel="Skill" />);
    fireEvent.click(screen.getByRole("button", { name: "Alpha" }));
    fireEvent.click(screen.getByRole("button", { name: /Bảng dữ liệu/ }));
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Skill");
    expect(table).toHaveTextContent("Alpha");
    expect(screen.getByRole("rowheader", { name: "Support" }).parentElement).toHaveTextContent("—");
  });

  it("shortens labels that don't fit and keeps the full name for assistive tech", () => {
    const long = [
      { axis: "Communication with every stakeholder in the company", a: 80 },
      { axis: "Design", a: 60 },
      { axis: "Testing", a: 70 },
    ];
    render(<RadarChart data={long} index="axis" series={[{ key: "a", label: "A" }]} size={200} legend={false} />);
    const texts = [...document.querySelectorAll("svg text")].map((t) => t.textContent ?? "");
    expect(texts.some((t) => t.endsWith("…") && t.startsWith("Commun"))).toBe(true);
    expect(texts).toContain("Design");
    expect(screen.getByRole("img", { name: /^Communication with every stakeholder in the company:/ })).toBeInTheDocument();
  });
});

