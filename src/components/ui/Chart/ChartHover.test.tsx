import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BarChart, DonutChart, LineChart, Sparkline } from "./Chart";

/* Hover / bàn phím qua lớp điểm dùng chung, màu tô trên nhóm, Sparkline không đo khi độ rộng cố định (#352). */

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 600,
    bottom: 300,
    width: 600,
    height: 300,
    toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ChartTooltip: ẩn (`invisible`) tới khi đặt được vị trí — jsdom không có layout nên lớp này còn nguyên.
const tooltip = () => document.querySelector<HTMLElement>("div.invisible.absolute[aria-hidden='true']");
const two = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
];
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ d: `M${i}`, a: i + 1, b: n - i, c: (i % 4) + 1 }));

describe("LineChart", () => {
  it("hover chỉ định dạng điểm đang trỏ, không dựng lại nhãn của mọi điểm", () => {
    const valueFormat = vi.fn((v: number) => String(v));
    render(<LineChart data={rows(50)} index="d" series={two} valueFormat={valueFormat} />);
    const points = screen.getAllByRole("img");
    expect(points).toHaveLength(50);
    expect(points[3]).toHaveAttribute("aria-label", "M3: A 4, B 47");
    valueFormat.mockClear();

    fireEvent.pointerOver(points[3]);
    fireEvent.pointerOver(points[4]);
    // Hai bước hover × hai chuỗi trong tooltip — không phải 50 điểm × 2 chuỗi mỗi bước.
    expect(valueFormat).toHaveBeenCalledTimes(4);
    expect(tooltip()).toHaveTextContent("M4");
    expect(screen.getAllByRole("img")[4]).toBe(points[4]);
  });

  it("bàn phím: mũi tên / End đi giữa các điểm (kẹp ở hai đầu), Esc tắt tooltip, rời chuột không tắt", () => {
    render(<LineChart data={rows(5)} index="d" series={two} />);
    const points = screen.getAllByRole("img");
    expect(points.map((p) => p.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"]);
    act(() => points[0].focus());
    expect(tooltip()).toHaveTextContent("M0");
    fireEvent.keyDown(points[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(points[1]);
    expect(points[1]).toHaveAttribute("tabindex", "0");
    expect(points[0]).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(points[1], { key: "End" });
    fireEvent.keyDown(points[4], { key: "ArrowDown" });
    expect(document.activeElement).toBe(points[4]);
    fireEvent.pointerLeave(points[4].closest("svg")!);
    expect(tooltip()).toHaveTextContent("M4");
    fireEvent.keyDown(points[4], { key: "Escape" });
    expect(tooltip()).toBeNull();
  });

  it("chấm của một chuỗi lấy màu từ nhóm, không có style riêng", () => {
    const { container } = render(<LineChart data={rows(6)} index="d" series={two} markers />);
    const dots = container.querySelectorAll("svg circle");
    expect(dots).toHaveLength(12);
    for (const dot of dots) expect(dot).not.toHaveAttribute("style");
    expect((dots[0].parentElement as unknown as SVGGElement).style.fill).toBe("var(--colorChartCategorical1)");
    expect((dots[11].parentElement as unknown as SVGGElement).style.fill).toBe("var(--colorChartCategorical2)");
  });
});

describe("BarChart", () => {
  const three = [...two, { key: "c", label: "C" }];
  const fillGroups = (root: HTMLElement) =>
    [...root.querySelectorAll<SVGGElement>("svg g > g")].filter((g) => g.style.fill && g.style.fill !== "transparent");

  it("màu tô trên nhóm của chuỗi, vẽ chuỗi cuối trước (giữ thứ tự chồng cũ ở chỗ hai nhóm cột sát nhau)", () => {
    const { container } = render(<BarChart data={rows(12)} index="d" series={three} />);
    const groups = fillGroups(container);
    expect(groups.map((g) => g.style.fill)).toEqual(["var(--colorChartCategorical3)", "var(--colorChartCategorical2)", "var(--colorChartCategorical1)"]);
    for (const g of groups) {
      expect(g.querySelectorAll("path")).toHaveLength(12);
      for (const path of g.querySelectorAll("path")) expect(path).not.toHaveAttribute("style");
    }
  });

  it("cột dày đặc (chạm nhau giữa các hàng): mỗi cột giữ màu riêng, theo thứ tự hàng", () => {
    const { container } = render(<BarChart data={rows(300)} index="d" series={three} />);
    expect(fillGroups(container)).toHaveLength(0);
    const fills = [...container.querySelectorAll<SVGPathElement>("svg g[aria-hidden] path[style]")].slice(0, 4).map((p) => p.style.fill);
    expect(fills).toEqual(["var(--colorChartCategorical1)", "var(--colorChartCategorical2)", "var(--colorChartCategorical3)", "var(--colorChartCategorical1)"]);
  });

  it("hover làm mờ các cột khác; chuyển sang cột khác chỉ đổi hai cột", () => {
    const { container } = render(<BarChart data={rows(4)} index="d" series={[two[0]]} />);
    const hits = screen.getAllByRole("img");
    const bars = [...container.querySelectorAll<SVGPathElement>("svg g > g > path")];
    expect(bars).toHaveLength(4);
    fireEvent.pointerOver(hits[1]);
    expect(bars.map((b) => b.style.opacity)).toEqual(["var(--chartDimOpacity)", "", "var(--chartDimOpacity)", "var(--chartDimOpacity)"]);
    expect(tooltip()).toHaveTextContent("M1");
    fireEvent.pointerOver(hits[2]);
    expect(bars.map((b) => b.style.opacity)).toEqual(["var(--chartDimOpacity)", "var(--chartDimOpacity)", "", "var(--chartDimOpacity)"]);
    fireEvent.pointerLeave(container.querySelector("svg[role=group]")!);
    expect(bars.map((b) => b.style.opacity)).toEqual(["", "", "", ""]);
  });
});

describe("DonutChart (pointProps trên từng lát)", () => {
  it("mũi tên đi giữa các lát, hover hiện tooltip", () => {
    render(
      <DonutChart
        data={[
          { label: "Một", value: 1 },
          { label: "Hai", value: 2 },
          { label: "Ba", value: 3 },
        ]}
      />,
    );
    const slices = screen.getAllByRole("img");
    expect(slices.map((s) => s.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    act(() => slices[0].focus());
    fireEvent.keyDown(slices[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(slices[1]);
    expect(document.activeElement).toHaveAccessibleName(/^Hai: 2/);
    fireEvent.keyDown(slices[1], { key: "Home" });
    expect(document.activeElement).toBe(slices[0]);
    act(() => slices[0].blur());
    fireEvent.pointerOver(slices[2]);
    expect(tooltip()).toHaveTextContent("Ba");
  });
});

describe("Sparkline", () => {
  it("độ rộng cố định: không đo phần tử, không ResizeObserver; width='auto' thì đo", () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = observe;
        unobserve() {}
        disconnect() {}
      },
    );
    const { container } = render(<Sparkline data={[1, 2, 3]} width={120} />);
    expect(observe).not.toHaveBeenCalled();
    expect(container.querySelector("svg")).toHaveAttribute("width", "120");
    render(<Sparkline data={[1, 2, 3]} width="auto" />);
    expect(observe).toHaveBeenCalledTimes(1);
  });
});
