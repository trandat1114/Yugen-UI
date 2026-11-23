import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { measure, printReport, report } from "@/test/perf";
import { AreaChart, BarChart, LineChart } from "./Chart";

/*
 * Hiệu năng của các biểu đồ trục (#428, #429, #430, #433): một bước hover chỉ vẽ lại crosshair / tooltip (#352), kể cả
 * khi có valueLabels, renderMarker, gradient hay tooltip tuỳ biến. `npm run bench -- Charts` in trung vị / p95.
 */
afterAll(() => printReport("Line / Area / Bar"));

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 1200, bottom: 400, width: 1200, height: 400, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

const series = (n: number) => Array.from({ length: n }, (_, i) => ({ key: `s${i}`, label: `Series ${i + 1}` }));
const rows = (count: number, seriesCount: number) =>
  Array.from({ length: count }, (_, r) => {
    const row: Record<string, string | number> = { x: `P${r}` };
    for (let s = 0; s < seriesCount; s++) row[`s${s}`] = 50 + ((r * 13 + s * 29) % 97) - (s === 3 ? 60 : 0);
    return row;
  });

function hoverSteps(label: string, points: HTMLElement[]) {
  let i = 0;
  return report(
    label,
    measure(() => {
      i = (i + 7) % points.length;
      act(() => {
        fireEvent.pointerOver(points[i]);
      });
    }),
  );
}

// Đo nhiều lần trong một test: cho thời gian rộng hơn mặc định 5 s khi CI chạy song song.
describe("axis charts performance", { timeout: 60_000 }, () => {
  it("LineChart, 2,000 points × 3 series, markers and a custom tooltip: one hover step", () => {
    render(
      <LineChart
        data={rows(2000, 3)}
        index="x"
        series={series(3)}
        markers
        animate={false}
        tooltip={{ indicator: "dot", value: (v) => `${v} u` }}
      />,
    );
    const result = hoverSteps("LineChart 2000×3 hover step", screen.getAllByRole("img"));
    expect(result.median).toBeLessThan(40);
  });

  it("BarChart, 60 categories × 4 series with negative values and labels: one hover step", () => {
    render(<BarChart data={rows(60, 4)} index="x" series={series(4)} showValues={(v) => String(v)} animate={false} />);
    const result = hoverSteps("BarChart 60×4 hover step", screen.getAllByRole("img"));
    expect(result.median).toBeLessThan(40);
  });

  it("AreaChart, 500 points × 4 stacked series with a gradient: one hover step and a data update", () => {
    const data: Record<string, string | number>[] = rows(500, 4).map((r) => ({ ...r, s3: Math.abs(Number(r.s3)) }));
    const { rerender } = render(<AreaChart data={data} index="x" series={series(4)} stacked gradient animate={false} />);
    const hover = hoverSteps("AreaChart 500×4 stacked hover step", screen.getAllByRole("img"));
    let shift = 0;
    const update = report(
      "AreaChart 500×4 stacked data update",
      measure(
        () => {
          shift++;
          rerender(<AreaChart data={data.map((r) => ({ ...r, s0: Number(r.s0) + shift }))} index="x" series={series(4)} stacked gradient animate={false} />);
        },
        { runs: 10 },
      ),
    );
    expect(hover.median).toBeLessThan(40);
    expect(update.median).toBeLessThan(600);
  });
});
