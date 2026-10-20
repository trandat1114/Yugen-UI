/**
 * Hàm thuần cho ScatterChart, Heatmap, vùng chồng và brush — không phụ thuộc React/DOM, test được độc lập.
 */
import { clamp } from "./chartUtils";

/* ================================================================== Điểm gần nhất */

/** Toạ độ màn hình (px) của một điểm. */
export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Chỉ số điểm gần (px, py) nhất theo khoảng cách Euclid — tương đương tra ô Voronoi.
 * `maxDistance` (px) giới hạn bán kính bắt; ngoài bán kính trả −1. Danh sách rỗng cũng trả −1.
 */
export function nearestPoint(points: readonly ScreenPoint[], px: number, py: number, maxDistance = Infinity): number {
  let best = -1;
  let bestD = maxDistance * maxDistance;
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - px;
    const dy = points[i].y - py;
    const d = dx * dx + dy * dy;
    if (d < bestD || (best < 0 && d <= bestD)) {
      best = i;
      bestD = d;
    }
  }
  return best;
}

/** Chỉ số mốc có vị trí gần `px` nhất trong dãy `positions` đã sắp tăng dần (tìm nhị phân). */
export function nearestIndex(positions: readonly number[], px: number): number {
  const n = positions.length;
  if (n === 0) return -1;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (positions[mid] <= px) lo = mid;
    else hi = mid;
  }
  return Math.abs(positions[hi] - px) < Math.abs(positions[lo] - px) ? hi : lo;
}

/* ================================================================== Hồi quy tuyến tính */

export interface LinearFit {
  slope: number;
  intercept: number;
  /** Hệ số xác định R² (0…1); 1 khi mọi điểm nằm trên đường. */
  r2: number;
  /** y dự đoán tại x. */
  predict: (x: number) => number;
}

/** Bình phương tối thiểu y = slope·x + intercept. `null` khi < 2 điểm hữu hạn hoặc mọi x trùng nhau. */
export function linearRegression(points: readonly (readonly [number, number])[]): LinearFit | null {
  const pts = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const n = pts.length;
  if (n < 2) return null;
  let mx = 0;
  let my = 0;
  for (const [x, y] of pts) {
    mx += x;
    my += y;
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2, predict: (x) => slope * x + intercept };
}

/* ================================================================== Bong bóng */

/**
 * Bán kính bong bóng theo DIỆN TÍCH (r ∝ √giá trị), không theo bán kính — tránh phóng đại khác biệt.
 * Luôn ≥ `minRadius` (marker 8px) và ≤ `maxRadius`.
 */
export function bubbleRadius(value: number, maxValue: number, maxRadius = 24, minRadius = 4): number {
  if (!Number.isFinite(value) || !(maxValue > 0)) return minRadius;
  const r = Math.sqrt(Math.max(0, value) / maxValue) * maxRadius;
  return clamp(r, minRadius, maxRadius);
}

/* ================================================================== Hình marker */

/** Hình marker — dùng thêm hình (không chỉ màu) để phân biệt nhóm khi bật texture / nhiều nhóm. */
export type MarkerShape = "circle" | "square" | "diamond" | "triangle" | "triangleDown";
export const MARKER_SHAPES: readonly MarkerShape[] = ["circle", "square", "diamond", "triangle", "triangleDown"];

/** Path SVG của marker tâm (cx, cy), bán kính tương đương r (diện tích xấp xỉ hình tròn cùng r). */
export function markerPath(shape: MarkerShape, cx: number, cy: number, r: number): string {
  const f = (v: number) => +v.toFixed(2);
  switch (shape) {
    case "square": {
      const h = r * 0.886;
      return `M${f(cx - h)},${f(cy - h)}h${f(2 * h)}v${f(2 * h)}h${f(-2 * h)}Z`;
    }
    case "diamond": {
      const h = r * 1.253;
      return `M${f(cx)},${f(cy - h)}L${f(cx + h)},${f(cy)}L${f(cx)},${f(cy + h)}L${f(cx - h)},${f(cy)}Z`;
    }
    case "triangle":
    case "triangleDown": {
      const s = r * 1.555;
      const dir = shape === "triangle" ? 1 : -1;
      const top = cy - dir * s * 0.667;
      const base = cy + dir * s * 0.333;
      return `M${f(cx)},${f(top)}L${f(cx + s * 0.866)},${f(base)}L${f(cx - s * 0.866)},${f(base)}Z`;
    }
    default:
      return `M${f(cx - r)},${f(cy)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`;
  }
}

/* ================================================================== Thang màu heatmap */

export interface HeatmapScaleOptions {
  /** [min, max] của thang; giá trị ngoài miền bị kẹp. */
  domain: [number, number];
  /** Thang phân kỳ: hai cực quanh `midpoint` (mặc định 0), điểm giữa xám trung tính. */
  diverging?: boolean;
  midpoint?: number;
}

/**
 * Vị trí của `value` trên thang: tuần tự → t ∈ [0, 1]; phân kỳ → t ∈ [−1, 1] (âm = cực Neg, 0 = điểm giữa).
 * `null` khi không có giá trị.
 */
export function heatmapPosition(value: number | null | undefined, { domain, diverging, midpoint = 0 }: HeatmapScaleOptions): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const [lo, hi] = domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
  const v = clamp(value, lo, hi);
  if (diverging) {
    const mid = clamp(midpoint, lo, hi);
    if (v === mid) return 0;
    return v < mid ? (mid === lo ? 0 : -(mid - v) / (mid - lo)) : hi === mid ? 0 : (v - mid) / (hi - mid);
  }
  return hi === lo ? 1 : (v - lo) / (hi - lo);
}

const pct = (t: number) => `${+(t * 100).toFixed(1)}%`;

/** Màu tuần tự liên tục giữa 7 bậc `--colorChartSequential1…7` (t ∈ [0, 1]). */
export function sequentialColor(t: number): string {
  const s = clamp(t, 0, 1) * 6;
  const k = Math.min(5, Math.floor(s));
  const frac = s - k;
  if (frac < 0.005) return `var(--colorChartSequential${k + 1})`;
  if (frac > 0.995) return `var(--colorChartSequential${k + 2})`;
  return `color-mix(in oklab, var(--colorChartSequential${k + 2}) ${pct(frac)}, var(--colorChartSequential${k + 1}))`;
}

/** Màu phân kỳ (t ∈ [−1, 1]): trộn cực Neg / Pos với điểm giữa xám `--colorChartDivergingMid`. */
export function divergingColor(t: number): string {
  const v = clamp(t, -1, 1);
  if (Math.abs(v) < 0.005) return "var(--colorChartDivergingMid)";
  const pole = v < 0 ? "var(--colorChartDivergingNeg)" : "var(--colorChartDivergingPos)";
  if (Math.abs(v) > 0.995) return pole;
  return `color-mix(in oklab, ${pole} ${pct(Math.abs(v))}, var(--colorChartDivergingMid))`;
}

/** Màu ô heatmap cho một giá trị; `null` = ô trống (vẽ bằng hoa văn trung tính). */
export function heatmapColor(value: number | null | undefined, options: HeatmapScaleOptions): string | null {
  const t = heatmapPosition(value, options);
  if (t === null) return null;
  return options.diverging ? divergingColor(t) : sequentialColor(t);
}

/** Miền mặc định của heatmap từ dữ liệu; phân kỳ thì đối xứng quanh điểm giữa để hai cực cùng độ đậm. */
export function heatmapDomain(values: readonly (number | null | undefined)[], diverging = false, midpoint = 0): [number, number] {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (!nums.length) return [0, 1];
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  if (!diverging) return [lo, hi];
  const r = Math.max(Math.abs(lo - midpoint), Math.abs(hi - midpoint)) || 1;
  return [midpoint - r, midpoint + r];
}

/* ================================================================== Chồng */

export interface StackedSeries {
  /** Đáy của mỗi mốc. */
  lower: number[];
  /** Đỉnh của mỗi mốc (null chỉ khi không chồng và thiếu giá trị). */
  upper: (number | null)[];
}

/**
 * Chồng các chuỗi (series × mốc). `stacked=false` → giữ nguyên, đáy 0. `offset="expand"` → chuẩn hoá mỗi mốc về tỉ lệ 0…1
 * (100%). Giá trị thiếu khi chồng được tính là 0 để vùng không đứt.
 */
export function stackValues(values: readonly (readonly (number | null)[])[], stacked: boolean, offset: "none" | "expand" = "none"): StackedSeries[] {
  const n = values[0]?.length ?? 0;
  if (!stacked) return values.map((row) => ({ lower: new Array<number>(row.length).fill(0), upper: [...row] }));
  const totals = new Array<number>(n).fill(0);
  if (offset === "expand") for (const row of values) for (let r = 0; r < n; r++) totals[r] += Math.max(0, row[r] ?? 0);
  const acc = new Array<number>(n).fill(0);
  return values.map((row) => {
    const lower: number[] = [];
    const upper: number[] = [];
    for (let r = 0; r < n; r++) {
      const raw = row[r] ?? 0;
      const v = offset === "expand" ? (totals[r] > 0 ? Math.max(0, raw) / totals[r] : 0) : raw;
      lower.push(acc[r]);
      acc[r] += v;
      upper.push(acc[r]);
    }
    return { lower, upper };
  });
}

/* ================================================================== Brush (cửa sổ chỉ số) */

/** Miền chỉ số [đầu, cuối] (gồm cả hai đầu) của cửa sổ zoom. */
export type ChartDomain = [number, number];

/** Chuẩn hoá miền: kẹp trong [0, count−1], đầu < cuối, rộng tối thiểu `minSpan` khoảng. */
export function normalizeDomain(domain: readonly [number, number] | undefined, count: number, minSpan = 1): ChartDomain {
  const last = Math.max(0, count - 1);
  if (!domain) return [0, last];
  const span = Math.min(minSpan, last);
  let s = clamp(Math.round(Math.min(domain[0], domain[1])), 0, last);
  let e = clamp(Math.round(Math.max(domain[0], domain[1])), 0, last);
  if (e - s < span) {
    e = Math.min(last, s + span);
    s = Math.max(0, e - span);
  }
  return [s, e];
}

/** Dời cả cửa sổ `delta` mốc, giữ nguyên độ rộng, không vượt hai đầu. */
export function moveDomain([s, e]: ChartDomain, delta: number, count: number): ChartDomain {
  const last = Math.max(0, count - 1);
  const d = clamp(delta, -s, last - e);
  return [s + d, e + d];
}

/** Đổi kích thước bằng cách dời một mép (`edge`) `delta` mốc; giữ rộng ≥ `minSpan`. */
export function resizeDomain([s, e]: ChartDomain, edge: "start" | "end", delta: number, count: number, minSpan = 1): ChartDomain {
  const last = Math.max(0, count - 1);
  const span = Math.min(minSpan, last);
  if (edge === "start") return [clamp(s + delta, 0, e - span), e];
  return [s, clamp(e + delta, s + span, last)];
}
