import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AreaChart, Heatmap, LineChart, ScatterChart } from "./Chart";
import {
  bubbleRadius,
  divergingColor,
  heatmapColor,
  heatmapDomain,
  heatmapPosition,
  linearRegression,
  markerPath,
  moveDomain,
  nearestIndex,
  nearestPoint,
  normalizeDomain,
  resizeDomain,
  sequentialColor,
  stackValues,
} from "./chartMath";

/* ================================================================== Hàm thuần */

describe("nearestPoint / nearestIndex", () => {
  const pts = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];
  it("chọn điểm gần nhất (ô Voronoi)", () => {
    expect(nearestPoint(pts, 1, 1)).toBe(0);
    expect(nearestPoint(pts, 9, 2)).toBe(1);
    expect(nearestPoint(pts, 9, 8)).toBe(2);
  });
  it("ngoài bán kính bắt hoặc rỗng → −1", () => {
    expect(nearestPoint(pts, 50, 50, 5)).toBe(-1);
    expect(nearestPoint([], 0, 0)).toBe(-1);
  });
  it("nearestIndex tìm nhị phân trên dãy tăng", () => {
    const pos = [0, 10, 20, 40];
    expect(nearestIndex(pos, -5)).toBe(0);
    expect(nearestIndex(pos, 14)).toBe(1);
    expect(nearestIndex(pos, 31)).toBe(3);
    expect(nearestIndex(pos, 99)).toBe(3);
    expect(nearestIndex([], 3)).toBe(-1);
  });
});

describe("linearRegression", () => {
  it("khớp đúng đường thẳng, R² = 1", () => {
    const fit = linearRegression([
      [0, 1],
      [1, 3],
      [2, 5],
    ])!;
    expect(fit.slope).toBeCloseTo(2);
    expect(fit.intercept).toBeCloseTo(1);
    expect(fit.r2).toBeCloseTo(1);
    expect(fit.predict(10)).toBeCloseTo(21);
  });
  it("dữ liệu nhiễu: R² trong (0, 1)", () => {
    const fit = linearRegression([
      [0, 0],
      [1, 2],
      [2, 1],
      [3, 3],
    ])!;
    expect(fit.slope).toBeCloseTo(0.8);
    expect(fit.r2).toBeGreaterThan(0);
    expect(fit.r2).toBeLessThan(1);
  });
  it("< 2 điểm hoặc mọi x trùng nhau → null; bỏ giá trị không hữu hạn", () => {
    expect(linearRegression([[1, 1]])).toBeNull();
    expect(
      linearRegression([
        [2, 1],
        [2, 5],
      ]),
    ).toBeNull();
    expect(
      linearRegression([
        [0, 0],
        [NaN, 3],
        [1, 1],
      ])?.slope,
    ).toBeCloseTo(1);
  });
});

describe("bubbleRadius & markerPath", () => {
  it("theo diện tích: giá trị ×4 → bán kính ×2, kẹp min/max", () => {
    expect(bubbleRadius(100, 100, 24)).toBe(24);
    expect(bubbleRadius(25, 100, 24)).toBeCloseTo(12);
    expect(bubbleRadius(0, 100, 24)).toBe(4);
    expect(bubbleRadius(500, 100, 24)).toBe(24);
    expect(bubbleRadius(5, 0)).toBe(4);
  });
  it("mỗi hình cho một path đóng", () => {
    for (const shape of ["circle", "square", "diamond", "triangle", "triangleDown"] as const) {
      expect(markerPath(shape, 10, 10, 4)).toMatch(/^M.*Z$/);
    }
  });
});

describe("thang màu heatmap", () => {
  it("tuần tự: t 0…1, kẹp ngoài miền", () => {
    const o = { domain: [0, 100] as [number, number] };
    expect(heatmapPosition(0, o)).toBe(0);
    expect(heatmapPosition(50, o)).toBe(0.5);
    expect(heatmapPosition(150, o)).toBe(1);
    expect(heatmapPosition(null, o)).toBeNull();
  });
  it("phân kỳ: −1 … 0 … 1 quanh điểm giữa", () => {
    const o = { domain: [-10, 30] as [number, number], diverging: true, midpoint: 0 };
    expect(heatmapPosition(-10, o)).toBe(-1);
    expect(heatmapPosition(0, o)).toBe(0);
    expect(heatmapPosition(15, o)).toBe(0.5);
  });
  it("màu dùng token tuần tự / phân kỳ, ô trống → null", () => {
    expect(sequentialColor(0)).toBe("var(--colorChartSequential1)");
    expect(sequentialColor(1)).toBe("var(--colorChartSequential7)");
    expect(sequentialColor(0.5)).toBe("var(--colorChartSequential4)");
    expect(sequentialColor(0.25)).toContain("color-mix(in oklab, var(--colorChartSequential3)");
    expect(divergingColor(0)).toBe("var(--colorChartDivergingMid)");
    expect(divergingColor(-1)).toBe("var(--colorChartDivergingNeg)");
    expect(divergingColor(0.5)).toBe("color-mix(in oklab, var(--colorChartDivergingPos) 50%, var(--colorChartDivergingMid))");
    expect(heatmapColor(undefined, { domain: [0, 1] })).toBeNull();
  });
  it("miền mặc định; phân kỳ đối xứng quanh điểm giữa", () => {
    expect(heatmapDomain([3, null, 9])).toEqual([3, 9]);
    expect(heatmapDomain([-2, 8], true)).toEqual([-8, 8]);
    expect(heatmapDomain([])).toEqual([0, 1]);
  });
});

describe("stackValues", () => {
  const values = [
    [1, 2, null],
    [3, 2, 4],
  ];
  it("không chồng: giữ nguyên, đáy 0", () => {
    expect(stackValues(values, false)[0]).toEqual({ lower: [0, 0, 0], upper: [1, 2, null] });
  });
  it("chồng: cộng dồn, thiếu = 0", () => {
    const [a, b] = stackValues(values, true);
    expect(a.upper).toEqual([1, 2, 0]);
    expect(b.lower).toEqual([1, 2, 0]);
    expect(b.upper).toEqual([4, 4, 4]);
  });
  it("expand: mỗi mốc cộng lại = 1", () => {
    const [a, b] = stackValues(values, true, "expand");
    expect(a.upper).toEqual([0.25, 0.5, 0]);
    expect(b.upper).toEqual([1, 1, 1]);
  });
});

describe("miền brush", () => {
  it("normalizeDomain kẹp, đảo, giữ rộng tối thiểu", () => {
    expect(normalizeDomain(undefined, 10)).toEqual([0, 9]);
    expect(normalizeDomain([7, 2], 10)).toEqual([2, 7]);
    expect(normalizeDomain([-5, 50], 10)).toEqual([0, 9]);
    expect(normalizeDomain([9, 9], 10)).toEqual([8, 9]);
  });
  it("moveDomain giữ độ rộng, không vượt hai đầu", () => {
    expect(moveDomain([2, 5], 3, 10)).toEqual([5, 8]);
    expect(moveDomain([2, 5], 10, 10)).toEqual([6, 9]);
    expect(moveDomain([2, 5], -10, 10)).toEqual([0, 3]);
  });
  it("resizeDomain dời một mép, giữ rộng ≥ minSpan", () => {
    expect(resizeDomain([2, 5], "end", 2, 10)).toEqual([2, 7]);
    expect(resizeDomain([2, 5], "end", -9, 10)).toEqual([2, 3]);
    expect(resizeDomain([2, 5], "start", -9, 10)).toEqual([0, 5]);
    expect(resizeDomain([2, 5], "start", 9, 10, 2)).toEqual([3, 5]);
  });
});

/* ================================================================== Bàn phím */

describe("tương tác bàn phím", () => {
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
  afterEach(() => vi.restoreAllMocks());

  it("ScatterChart: Tab vào biểu đồ, mũi tên duyệt điểm theo thứ tự X", () => {
    render(
      <ScatterChart
        data={[
          { name: "C", x: 30, y: 1 },
          { name: "A", x: 10, y: 5 },
          { name: "B", x: 20, y: 3 },
        ]}
        x="x"
        y="y"
        label="name"
        xLabel="Giá"
        yLabel="Điểm"
      />,
    );
    const points = screen.getAllByRole("img");
    const first = points.find((p) => p.getAttribute("tabindex") === "0")!;
    expect(first).toHaveAttribute("aria-label", expect.stringMatching(/^A, Giá 10, Điểm 5/));
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(document.activeElement).toHaveAttribute("aria-label", expect.stringMatching(/^B,/));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toHaveAttribute("aria-label", expect.stringMatching(/^C,/));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(document.activeElement).toHaveAttribute("aria-label", expect.stringMatching(/^B,/));
  });

  it("ScatterChart: nút Xu hướng bật đường hồi quy (mô tả có hệ số góc)", () => {
    const onTrend = vi.fn();
    render(
      <ScatterChart
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 5 },
        ]}
        x="x"
        y="y"
        onTrendLineChange={onTrend}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Xu hướng/ }));
    expect(onTrend).toHaveBeenCalledWith(true);
    expect(screen.getByRole("group", { name: /Đường xu hướng: hệ số góc 2/ })).toBeInTheDocument();
  });

  it("ScatterChart: nhóm thứ 9 trở đi gộp vào Khác", () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ g: `N${i + 1}`, x: i, y: i }));
    render(<ScatterChart data={data} x="x" y="y" group="g" />);
    const legend = screen.getAllByRole("button", { pressed: true }).map((b) => b.textContent);
    expect(legend).toHaveLength(9);
    expect(legend[8]).toBe("Khác");
  });

  it("Heatmap: mũi tên đi giữa các ô, ô trống đọc là Không có dữ liệu", () => {
    render(
      <Heatmap
        data={[
          { day: "T2", a: 1, b: 2 },
          { day: "T3", a: null, b: 4 },
        ]}
        index="day"
        columns={[
          { key: "a", label: "Sáng" },
          { key: "b", label: "Chiều" },
        ]}
      />,
    );
    const start = screen.getByRole("img", { name: "T2, Sáng: 1" });
    expect(start).toHaveAttribute("tabindex", "0");
    act(() => start.focus());
    fireEvent.keyDown(start, { key: "ArrowRight" });
    expect(document.activeElement).toHaveAccessibleName("T2, Chiều: 2");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toHaveAccessibleName("T3, Chiều: 4");
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toHaveAccessibleName("T3, Sáng: Không có dữ liệu");
    expect(document.activeElement).toHaveAttribute("tabindex", "0");
  });

  it("Brush: ←/→ dời cửa sổ, Shift+→ giãn, Đặt lại về toàn bộ", () => {
    const onDomainChange = vi.fn();
    const data = Array.from({ length: 10 }, (_, i) => ({ d: `M${i}`, v: i * 2 }));
    render(<LineChart data={data} index="d" series={[{ key: "v", label: "Giá trị" }]} brush defaultDomain={[2, 5]} onDomainChange={onDomainChange} />);
    const slider = screen.getByRole("slider", { name: "Vùng xem" });
    expect(slider).toHaveAttribute("aria-valuetext", "M2 – M5");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onDomainChange).toHaveBeenLastCalledWith([3, 6]);
    fireEvent.keyDown(slider, { key: "ArrowRight", shiftKey: true });
    expect(onDomainChange).toHaveBeenLastCalledWith([3, 7]);
    fireEvent.keyDown(slider, { key: "End" });
    expect(onDomainChange).toHaveBeenLastCalledWith([5, 9]);
    // Vùng vẽ chỉ còn các mốc trong miền.
    expect(screen.getAllByRole("img").map((el) => el.getAttribute("aria-label")?.split(":")[0])).toEqual(["M5", "M6", "M7", "M8", "M9"]);
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(onDomainChange).toHaveBeenLastCalledWith([0, 9]);
    expect(screen.getByRole("button", { name: "Đặt lại" })).toBeDisabled();
  });

  it("AreaChart stackOffset=expand: tooltip có tỉ lệ và dòng Tổng", () => {
    render(
      <AreaChart
        data={[
          { m: "T1", a: 1, b: 3 },
          { m: "T2", a: 2, b: 2 },
        ]}
        index="m"
        stacked
        stackOffset="expand"
        series={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ]}
      />,
    );
    const col = screen.getAllByRole("img")[0];
    expect(col.getAttribute("aria-label")).toMatch(/^T1: A 1 \(25%\), B 3 \(75%\), Tổng 4$/);
    expect(screen.getByRole("group", { name: /vùng chồng 100%/ })).toBeInTheDocument();
  });
});
