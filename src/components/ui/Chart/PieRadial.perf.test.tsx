import { afterAll, describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { measure, printReport, report } from "@/test/perf";
import { PieChart, RadialChart } from "./Chart";

/*
 * Hiệu năng của PieChart (#431) và RadialChart (#432): mount, một bước hover và cập nhật dữ liệu. PieChart gộp lát quá 6
 * vào "Khác", nên 30 lát vẽ 6. `npm run bench -- PieRadial` in trung vị / p95.
 */
afterAll(() => printReport("Pie / Radial"));

const slices = (n: number, seed = 0) => Array.from({ length: n }, (_, i) => ({ label: `Slice ${i + 1}`, value: 10 + ((i * 17 + seed * 5) % 90) }));

// Đo nhiều lần trong một test: cho thời gian rộng hơn mặc định 5 s khi CI chạy song song.
describe("Pie / Radial performance", { timeout: 60_000 }, () => {
  for (const n of [6, 30]) {
    it(`PieChart ${n} slices: mount, hover step and data update`, () => {
      const mount = report(
        `PieChart ${n} mount`,
        measure(() => {
          const { unmount } = render(<PieChart data={slices(n)} labels="percent" animate={false} />);
          unmount();
        }),
      );
      const { rerender } = render(<PieChart data={slices(n)} labels="percent" animate={false} />);
      const points = screen.getAllByRole("img").filter((el) => el.tagName === "path");
      let i = 0;
      const hover = report(
        `PieChart ${n} hover step`,
        measure(() => {
          i = (i + 1) % points.length;
          act(() => {
            fireEvent.pointerOver(points[i]);
          });
        }),
      );
      let seed = 0;
      const update = report(
        `PieChart ${n} data update`,
        measure(() => {
          seed++;
          rerender(<PieChart data={slices(n, seed)} labels="percent" animate={false} />);
        }),
      );
      expect(mount.median).toBeLessThan(150);
      expect(hover.median).toBeLessThan(30);
      expect(update.median).toBeLessThan(60);
    });
  }

  for (const n of [1, 6, 30]) {
    it(`RadialChart ${n} segments: mount and data update`, () => {
      const layout = n === 1 ? "segments" : "rings";
      const mount = report(
        `RadialChart ${n} (${layout}) mount`,
        measure(() => {
          const { unmount } = render(<RadialChart data={slices(n)} layout={layout} rounded animate={false} />);
          unmount();
        }),
      );
      const { rerender } = render(<RadialChart data={slices(n)} layout={layout} rounded animate={false} />);
      let seed = 0;
      const update = report(
        `RadialChart ${n} (${layout}) data update`,
        measure(() => {
          seed++;
          rerender(<RadialChart data={slices(n, seed)} layout={layout} rounded animate={false} />);
        }),
      );
      expect(mount.median).toBeLessThan(150);
      expect(update.median).toBeLessThan(60);
    });
  }
});
