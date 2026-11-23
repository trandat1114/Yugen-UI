import { afterAll, beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { measure, printReport, report } from "@/test/perf";
import { RadarChart } from "./RadarChart";

/*
 * Hiệu năng của RadarChart (#427): lưới, chuỗi và nhãn trục được memo, nên trỏ / focus một trục chỉ vẽ lại vòng focus và
 * tooltip; dữ liệu mới thì dựng lại hình. `npm run bench -- RadarChart` in trung vị / p95 cho 8 / 24 / 60 trục × 1 / 4 / 12
 * chuỗi. Ngưỡng trong CI rộng, chỉ chặn hồi quy lớn.
 */
afterAll(() => printReport("RadarChart"));

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 400, width: 600, height: 400, toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

function fixture(axes: number, seriesCount: number, seed = 0) {
  const series = Array.from({ length: seriesCount }, (_, s) => ({ key: `s${s}`, label: `Series ${s + 1}` }));
  const data = Array.from({ length: axes }, (_, a) => {
    const row: Record<string, string | number> = { axis: `Axis ${a + 1}` };
    series.forEach((_, s) => (row[`s${s}`] = 20 + ((a * 37 + s * 53 + seed * 11) % 80)));
    return row;
  });
  return { data, series };
}

describe("RadarChart performance (#427)", () => {
  for (const [axes, seriesCount] of [
    [8, 1],
    [24, 4],
    [60, 12],
  ] as const) {
    it(`${axes} axes × ${seriesCount} series: mount, active state and live data`, () => {
      const { data, series } = fixture(axes, seriesCount);
      const mount = report(
        `mount ${axes}×${seriesCount}`,
        measure(
          () => {
            const { unmount } = render(<RadarChart data={data} index="axis" series={series} legend={false} animate={false} />);
            unmount();
          },
          { runs: 10 },
        ),
      );

      const { rerender } = render(<RadarChart data={data} index="axis" series={series} legend={false} animate={false} />);
      const points = screen.getAllByRole("img");
      let i = 0;
      const active = report(
        `active-state update ${axes}×${seriesCount}`,
        measure(() => {
          i = (i + 1) % points.length;
          act(() => {
            fireEvent.pointerOver(points[i]);
          });
        }),
      );

      let seed = 0;
      const live = report(
        `live data update ${axes}×${seriesCount}`,
        measure(
          () => {
            seed++;
            const next = fixture(axes, seriesCount, seed);
            rerender(<RadarChart data={next.data} index="axis" series={series} legend={false} animate={false} />);
          },
          { runs: 10 },
        ),
      );

      // Ngưỡng rộng cho jsdom và máy CI chậm; số đo thật xem `npm run bench -- RadarChart`.
      expect(active.median).toBeLessThan(25);
      expect(mount.median).toBeLessThan(400);
      expect(live.median).toBeLessThan(400);
    });
  }

  it("hovering re-renders only the focus ring and the tooltip, not the series paths", () => {
    const { data, series } = fixture(24, 4);
    const { container } = render(<RadarChart data={data} index="axis" series={series} legend={false} animate={false} />);
    const firstPath = container.querySelector("path[stroke-linejoin]");
    const points = screen.getAllByRole("img");
    fireEvent.pointerOver(points[3]);
    fireEvent.pointerOver(points[10]);
    expect(container.querySelector("path[stroke-linejoin]")).toBe(firstPath);
    // Bảng dữ liệu chỉ dựng khi mở: không có hàng nào trong DOM lúc đầu.
    expect(container.querySelector("table")).toBeNull();
  });
});
