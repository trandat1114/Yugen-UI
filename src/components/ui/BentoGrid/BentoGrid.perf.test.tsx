import { afterAll, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { measure, printReport, report } from "@/test/perf";
import { BentoGrid, BentoGridItem } from "./BentoGrid";

/*
 * Hiệu năng của BentoGrid (#437): bố cục là CSS Grid, nên chi phí chỉ là số ô React phải render. Đo mount và cập nhật một
 * ô với 6 / 12 / 30 ô có chữ, action và media giữ chỗ; `npm run bench -- BentoGrid` in trung vị / p95.
 */
afterAll(() => printReport("BentoGrid"));

function Cells({ count, version = 0 }: { count: number; version?: number }) {
  return (
    <BentoGrid columns={{ base: 1, sm: 2, lg: 4 }}>
      {Array.from({ length: count }, (_, i) => (
        <BentoGridItem
          key={i}
          colSpan={i % 5 === 0 ? { base: 1, lg: 2 } : 1}
          title={`Cell ${i}${i === 0 ? ` v${version}` : ""}`}
          description="Short supporting text that wraps on narrow screens."
          media={<div className="aspect-video bg-background-3" />}
          action={<button type="button">Open</button>}
        />
      ))}
    </BentoGrid>
  );
}

// Đo nhiều lần trong một test: cho thời gian rộng hơn mặc định 5 s khi CI chạy song song.
describe("BentoGrid performance (#437)", { timeout: 60_000 }, () => {
  for (const count of [6, 12, 30]) {
    it(`mounts and updates ${count} cells without measuring the layout`, () => {
      const host = document.createElement("div");
      document.body.append(host);
      const mount = report(
        `mount ${count} cells`,
        measure(() => {
          const root = createRoot(host);
          act(() => root.render(<Cells count={count} />));
          act(() => root.unmount());
        }),
      );
      const root = createRoot(host);
      act(() => root.render(<Cells count={count} />));
      let version = 0;
      const update = report(
        `update one of ${count} cells`,
        measure(() => {
          version++;
          act(() => root.render(<Cells count={count} version={version} />));
        }),
      );
      act(() => root.unmount());
      host.remove();
      // Ngưỡng rộng (jsdom, máy CI chậm): chỉ chặn hồi quy lớn.
      expect(mount.median).toBeLessThan(100 + count * 15);
      expect(update.median).toBeLessThan(100 + count * 8);
    });
  }

  it("adds no listeners, observers or layout reads per cell", () => {
    const addListener = vi.spyOn(window, "addEventListener");
    const observer = vi.fn();
    vi.stubGlobal("ResizeObserver", observer);
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect");
    render(<Cells count={30} />);
    render(
      <BentoGrid breakpoints="container">
        <BentoGridItem title="In a panel" />
      </BentoGrid>,
    );
    expect(addListener).not.toHaveBeenCalled();
    expect(observer).not.toHaveBeenCalled();
    expect(rect).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
