import * as React from "react";
import { fitText, measureText, type ChartDateFormat, type ChartValue } from "./chartUtils";

/** Chữ trên trục: caption1, token chữ (không bao giờ dùng màu chuỗi), số thẳng cột. */
export const axisTextClass = "fill-foreground-3 text-caption1 tabular-nums";

/** Định dạng giá trị của trục danh mục (chuỗi, số hoặc ngày). */
export function formatCategory(v: ChartValue, locale: string, dateFormat?: Intl.DateTimeFormatOptions): string {
  if (v instanceof Date) return new Intl.DateTimeFormat(locale, dateFormat ?? { day: "numeric", month: "numeric", year: "numeric" }).format(v);
  if (typeof v === "number") return new Intl.NumberFormat(locale).format(v);
  return v == null ? "" : String(v);
}

export function resolveDateFormat(
  locale: string,
  format: ChartDateFormat | undefined,
  fallback: Intl.DateTimeFormatOptions,
): (d: Date) => string {
  if (typeof format === "function") return format;
  const f = new Intl.DateTimeFormat(locale, format ?? fallback);
  return (d) => f.format(d);
}

/** Lưới ngang (hoặc dọc) mảnh 1px, liền nét, lùi về sau. */
export function GridLines({
  ticks,
  scale,
  from,
  to,
  orientation,
  skip,
}: {
  ticks: number[];
  scale: (v: number) => number;
  from: number;
  to: number;
  orientation: "horizontal" | "vertical";
  skip?: number;
}) {
  return (
    <g aria-hidden>
      {ticks
        .filter((t) => t !== skip)
        .map((t) => {
          const p = Math.round(scale(t)) + 0.5;
          return orientation === "horizontal" ? (
            <line key={t} x1={from} x2={to} y1={p} y2={p} strokeWidth={1} style={{ stroke: "var(--colorChartGrid)" }} />
          ) : (
            <line key={t} y1={from} y2={to} x1={p} x2={p} strokeWidth={1} style={{ stroke: "var(--colorChartGrid)" }} />
          );
        })}
    </g>
  );
}

/** Đường gốc (mốc 0 hoặc đáy vùng vẽ). */
export function Baseline({ x1, x2, y1, y2 }: { x1: number; x2: number; y1: number; y2: number }) {
  const snap = (v: number) => Math.round(v) + 0.5;
  return (
    <line
      aria-hidden
      x1={x1 === x2 ? snap(x1) : x1}
      x2={x1 === x2 ? snap(x2) : x2}
      y1={y1 === y2 ? snap(y1) : y1}
      y2={y1 === y2 ? snap(y2) : y2}
      strokeWidth={1}
      style={{ stroke: "var(--colorChartAxis)" }}
    />
  );
}

/** Nhãn trục giá trị bên trái (biểu đồ dọc). */
export function ValueAxisLeft({ ticks, scale, x, format }: { ticks: number[]; scale: (v: number) => number; x: number; format: (v: number) => string }) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <text key={t} x={x} y={scale(t)} dy="0.32em" textAnchor="end" className={axisTextClass}>
          {format(t)}
        </text>
      ))}
    </g>
  );
}

/** Nhãn trục giá trị phía dưới (biểu đồ ngang). */
export function ValueAxisBottom({ ticks, scale, y, format }: { ticks: number[]; scale: (v: number) => number; y: number; format: (v: number) => string }) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <text key={t} x={scale(t)} y={y} dy="0.71em" textAnchor="middle" className={axisTextClass}>
          {format(t)}
        </text>
      ))}
    </g>
  );
}

/** Chọn chỉ số nhãn trục X sao cho không chồng nhau (nhãn còn lại nằm trong tooltip và bảng). */
export function pickLabelIndices(positions: number[], labels: string[], minX: number, maxX: number, gap = 12): number[] {
  const picked: number[] = [];
  let lastEnd = -Infinity;
  positions.forEach((x, i) => {
    const w = measureText(labels[i]);
    const start = x - w / 2;
    const end = x + w / 2;
    if (start < minX - 2 || end > maxX + 2) {
      // Nhãn đầu / cuối chạm mép: vẫn cho phép nếu dịch vào trong được.
      if (!(i === 0 || i === positions.length - 1)) return;
    }
    if (start >= lastEnd + gap) {
      picked.push(i);
      lastEnd = end;
    }
  });
  return picked;
}

/** Nhãn trục danh mục phía dưới (cột / đường), tự kẹp trong khung. */
export function CategoryAxisBottom({
  positions,
  labels,
  indices,
  y,
  minX,
  maxX,
  maxWidth,
}: {
  positions: number[];
  labels: string[];
  indices: number[];
  y: number;
  minX: number;
  maxX: number;
  maxWidth?: number;
}) {
  return (
    <g aria-hidden>
      {indices.map((i) => {
        const text = maxWidth ? fitText(labels[i], maxWidth) : labels[i];
        const w = measureText(text);
        const x = Math.min(Math.max(positions[i], minX + w / 2), maxX - w / 2);
        return (
          <text key={i} x={x} y={y} dy="0.71em" textAnchor="middle" className={axisTextClass}>
            {text}
          </text>
        );
      })}
    </g>
  );
}

/** Vùng vẽ: luôn LTR (trục số không đảo trong trang RTL), cao cố định gồm cả dải nhãn trục. */
export const PlotArea = React.forwardRef<HTMLDivElement, { height: number; children?: React.ReactNode; className?: string }>(
  ({ height, children, className }, ref) => (
    <div ref={ref} dir="ltr" className={className ?? "relative w-full min-w-0"} style={{ height }}>
      {children}
    </div>
  ),
);
PlotArea.displayName = "PlotArea";
