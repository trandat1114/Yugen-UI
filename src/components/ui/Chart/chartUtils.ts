import * as React from "react";
import { useYugen } from "../YugenProvider/context";

/* ================================================================== Kiểu dữ liệu */

/** Ô màu phân loại 1…8 — thứ tự cố định (Sakura, Ai, Kohaku, Fuji, Matcha, Kaki, Sora, Koke). */
export type ChartColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
/** Ô màu thực tế của một mark: phân loại, "other" (Khác / làm nền) hoặc hai cực phân kỳ. */
export type ChartSlot = ChartColor | "other" | "neg" | "pos";

export const CHART_PALETTE_SIZE = 8;

export type ChartValue = string | number | Date | null | undefined;
export type ChartDatum = Record<string, ChartValue>;

export interface ChartSeries {
  /** Tên trường trong mỗi dòng `data`. */
  key: string;
  /** Tên hiển thị (legend, tooltip, bảng). */
  label: string;
  /** Ô màu cố định — mặc định theo vị trí trong mảng `series` (1…8). Màu đi theo thực thể, không theo thứ hạng. */
  color?: ChartColor;
}

export type ChartNumberFormat = Intl.NumberFormatOptions | ((value: number) => string);
export type ChartDateFormat = Intl.DateTimeFormatOptions | ((value: Date) => string);

/** Prop dùng chung cho mọi biểu đồ có khung (ChartContainer). */
export interface ChartFrameProps {
  /** Tiêu đề — cũng là tên truy cập của figure. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Thao tác thêm trên thanh công cụ (cạnh nút "Bảng dữ liệu"). */
  toolbar?: React.ReactNode;
  /** Chiều cao vùng vẽ (px) — đã gồm dải nhãn trục. */
  height?: number;
  /** Locale cho Intl.NumberFormat / DateTimeFormat. */
  locale?: string;
  /** Mô tả cho trình đọc màn hình; mặc định tự sinh từ dữ liệu. */
  ariaLabel?: string;
  /** Tiêu đề cột đầu của bảng dữ liệu. */
  indexLabel?: string;
  /** Ẩn nút "Bảng dữ liệu". */
  hideTableToggle?: boolean;
  /** Mở sẵn chế độ bảng. */
  defaultShowTable?: boolean;
  /** Bật hoa văn / nét đứt để nhận diện chuỗi (tự bật ở tương phản cao và forced-colors). */
  texture?: boolean;
  /** Animation vào cảnh (luôn tắt khi prefers-reduced-motion). */
  animate?: boolean;
  className?: string;
}

/* ================================================================== Màu */

export function slotOf(color: ChartColor | undefined, index: number): ChartSlot {
  if (color) return color;
  return index < CHART_PALETTE_SIZE ? ((index + 1) as ChartColor) : "other";
}

export function slotVar(slot: ChartSlot): string {
  if (slot === "other") return "var(--colorChartOther)";
  if (slot === "neg") return "var(--colorChartDivergingNeg)";
  if (slot === "pos") return "var(--colorChartDivergingPos)";
  return `var(--colorChartCategorical${slot})`;
}

/** Nét đứt theo ô màu — chỉ dùng khi bật texture (tương phản cao, in, forced-colors). */
const DASHES: Record<string, string | undefined> = {
  "1": undefined,
  "2": "8 4",
  "3": "2 4",
  "4": "12 4 2 4",
  "5": "4 4",
  "6": "16 6",
  "7": "2 2",
  "8": "8 4 2 4 2 4",
  other: "1 3",
  neg: "4 4",
  pos: undefined,
};

export function slotDash(slot: ChartSlot, textured: boolean): string | undefined {
  return textured ? DASHES[String(slot)] : undefined;
}

/** id pattern của một ô màu; `undefined` = tô đặc. */
export function patternId(prefix: string, slot: ChartSlot): string | undefined {
  if (slot === 1 || slot === "other") return undefined;
  return `${prefix}-tx-${slot}`;
}

/** Giá trị `fill` cho mark diện tích (cột, lát donut). */
export function slotFill(slot: ChartSlot, textured: boolean, prefix: string): string {
  const id = textured ? patternId(prefix, slot) : undefined;
  return id ? `url(#${id})` : slotVar(slot);
}

/* ================================================================== Định dạng */

const numberFormatCache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, options: Intl.NumberFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = numberFormatCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, f);
  }
  return f;
}

export function makeNumberFormatter(locale: string, format?: ChartNumberFormat): (value: number) => string {
  if (typeof format === "function") return format;
  const f = nf(locale, format ?? { maximumFractionDigits: 2 });
  return (v) => f.format(v);
}

/** Số chữ số thập phân cần để viết đúng `x` (tối đa 3). */
function decimalsOf(x: number) {
  for (let d = 0; d <= 3; d++) {
    const s = Math.abs(x) * 10 ** d;
    if (Math.abs(Math.round(s) - s) < 1e-6) return d;
  }
  return 3;
}

/**
 * Nhãn trục: rút gọn từ 1.000 trở lên (1 N, 2,5 Tr…), giữ style/currency/unit của định dạng giá trị.
 * `step` = khoảng cách vạch chia — đủ chữ số thập phân để 1.250 không bị làm tròn thành "1,3 N".
 */
export function makeAxisFormatter(
  locale: string,
  format: ChartNumberFormat | undefined,
  maxAbs: number,
  step = 0,
): (value: number) => string {
  if (typeof format === "function") return format;
  const base = format ?? {};
  const compact = maxAbs >= 1000 && base.style !== "percent";
  const unit = compact ? 10 ** (3 * Math.floor(Math.log10(maxAbs) / 3)) : base.style === "percent" ? 0.01 : 1;
  const digits = step > 0 ? decimalsOf(step / unit) : compact ? 1 : (base.maximumFractionDigits ?? 2);
  const f = nf(locale, {
    ...base,
    notation: compact ? "compact" : base.notation,
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
  return (v) => f.format(v);
}

export function makeDateFormatter(locale: string, format: ChartDateFormat | undefined, fallback: Intl.DateTimeFormatOptions) {
  if (typeof format === "function") return format;
  const f = new Intl.DateTimeFormat(locale, format ?? fallback);
  return (d: Date) => f.format(d);
}

export function toNumber(v: ChartValue): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

/* ================================================================== Thang đo */

function niceStep(rough: number) {
  const exp = Math.floor(Math.log10(rough));
  const f = rough / 10 ** exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * 10 ** exp;
}

/** Vạch chia "tròn" (0 / 50 / 100…) phủ trọn [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    if (min === 0) return [0, 1];
    const pad = Math.abs(min) * 0.1;
    min -= pad;
    max += pad;
  }
  const step = niceStep((max - min) / Math.max(1, count));
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ================================================================== Đo chữ */

let measureCtx: CanvasRenderingContext2D | null | undefined;
let measureFamily = "";

/** Độ rộng (px) của chữ caption1 (12px) — để chừa lề trục và kiểm tra nhãn có vừa không. */
export function measureText(text: string, size = 12, weight = 400): number {
  if (typeof document === "undefined") return text.length * size * 0.6;
  if (measureCtx === undefined) {
    measureCtx = document.createElement("canvas").getContext("2d");
    measureFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
  }
  if (!measureCtx) return text.length * size * 0.6;
  measureCtx.font = `${weight} ${size}px ${measureFamily}`;
  return measureCtx.measureText(text).width;
}

/** Cắt chữ cho vừa `max` px (thêm "…"). */
export function fitText(text: string, max: number, size = 12): string {
  if (measureText(text, size) <= max) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measureText(text.slice(0, mid) + "…", size) <= max) lo = mid;
    else hi = mid - 1;
  }
  return lo > 0 ? text.slice(0, lo) + "…" : "";
}

/* ================================================================== Đường & hình */

/** Hình chữ nhật bo 4px ở đầu dữ liệu, vuông ở đường gốc. */
export function barPath(x: number, y: number, w: number, h: number, r: number, end: "top" | "bottom" | "left" | "right" | "none") {
  if (w <= 0 || h <= 0) return "";
  const rr = end === "top" || end === "bottom" ? Math.min(r, w / 2, h) : Math.min(r, h / 2, w);
  if (end === "none" || rr <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
  const x1 = x + w;
  const y1 = y + h;
  switch (end) {
    case "top":
      return `M${x},${y1}V${y + rr}A${rr},${rr} 0 0 1 ${x + rr},${y}H${x1 - rr}A${rr},${rr} 0 0 1 ${x1},${y + rr}V${y1}Z`;
    case "bottom":
      return `M${x},${y}H${x1}V${y1 - rr}A${rr},${rr} 0 0 1 ${x1 - rr},${y1}H${x + rr}A${rr},${rr} 0 0 1 ${x},${y1 - rr}Z`;
    case "right":
      return `M${x},${y}H${x1 - rr}A${rr},${rr} 0 0 1 ${x1},${y + rr}V${y1 - rr}A${rr},${rr} 0 0 1 ${x1 - rr},${y1}H${x}Z`;
    case "left":
      return `M${x1},${y}V${y1}H${x + rr}A${rr},${rr} 0 0 1 ${x},${y1 - rr}V${y + rr}A${rr},${rr} 0 0 1 ${x + rr},${y}Z`;
  }
}

export type Point = [number, number];

/** Đường nối thẳng hoặc monotone (Fritsch–Carlson, không vượt đỉnh dữ liệu). */
export function linePath(points: Point[], curve: "linear" | "monotone" = "monotone"): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  if (curve === "linear" || points.length === 2) return "M" + points.map((p) => `${p[0]},${p[1]}`).join("L");
  const n = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0]);
    slope.push(dx[i] === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx[i]);
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  m.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += `C${x0 + h},${y0 + m[i] * h} ${x1 - h},${y1 - m[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/** Lát donut có khe 2px song song (khe đều từ trong ra ngoài). Góc tính bằng radian, 0 = 12 giờ, chiều kim đồng hồ. */
export function donutSlicePath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, gap: number): string {
  const half = gap / 2;
  const off1 = gap > 0 ? Math.asin(Math.min(1, half / r1)) : 0;
  const off0 = gap > 0 ? Math.asin(Math.min(1, half / r0)) : 0;
  const o0 = a0 + off1;
  const o1 = a1 - off1;
  const i0 = a0 + off0;
  const i1 = a1 - off0;
  if (o1 <= o0 || i1 <= i0) return "";
  const pt = (r: number, a: number) => `${cx + r * Math.sin(a)},${cy - r * Math.cos(a)}`;
  const largeOuter = o1 - o0 > Math.PI ? 1 : 0;
  const largeInner = i1 - i0 > Math.PI ? 1 : 0;
  return `M${pt(r1, o0)}A${r1},${r1} 0 ${largeOuter} 1 ${pt(r1, o1)}L${pt(r0, i1)}A${r0},${r0} 0 ${largeInner} 0 ${pt(r0, i0)}Z`;
}

/** Vòng tròn đầy đủ (một lát duy nhất). */
export function ringPath(cx: number, cy: number, r0: number, r1: number) {
  return `M${cx},${cy - r1}A${r1},${r1} 0 1 1 ${cx},${cy + r1}A${r1},${r1} 0 1 1 ${cx},${cy - r1}ZM${cx},${cy - r0}A${r0},${r0} 0 1 0 ${cx},${cy + r0}A${r0},${r0} 0 1 0 ${cx},${cy - r0}Z`;
}

/* ================================================================== Hook */

/** Độ rộng phần tử theo ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(): [(el: T | null) => void, number] {
  const [el, setEl] = React.useState<T | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, width];
}

function useMediaQuery(query: string) {
  const [match, setMatch] = React.useState(() => typeof window !== "undefined" && !!window.matchMedia?.(query).matches);
  React.useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

/** Bật hoa văn khi: prop texture, theme tương phản cao, hoặc forced-colors của hệ điều hành. */
export function useChartTexture(texture?: boolean): boolean {
  const { theme } = useYugen();
  const forced = useMediaQuery("(forced-colors: active)");
  return texture ?? (theme === "high-contrast" || forced);
}

/** Điều hướng bàn phím kiểu roving tabindex giữa các điểm dữ liệu (←/→/↑/↓, Home, End, Esc). */
export function useRovingPoints(count: number, onActivate: (index: number | null, viaKeyboard: boolean) => void) {
  const refs = React.useRef<(SVGElement | null)[]>([]);
  const [tabStop, setTabStop] = React.useState(0);
  const stop = Math.min(tabStop, Math.max(0, count - 1));

  const focusAt = (i: number) => {
    const next = clamp(i, 0, count - 1);
    setTabStop(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, i: number) => {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = i + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = i - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else if (event.key === "Escape") {
      onActivate(null, true);
      return;
    }
    if (next === null) return;
    event.preventDefault();
    focusAt(next);
  };

  const pointProps = (i: number) => ({
    ref: (el: SVGElement | null) => {
      refs.current[i] = el;
    },
    tabIndex: i === stop ? 0 : -1,
    onKeyDown: (e: React.KeyboardEvent) => onKeyDown(e, i),
    onFocus: () => {
      setTabStop(i);
      onActivate(i, true);
    },
    onBlur: () => onActivate(null, true),
    onPointerEnter: () => onActivate(i, false),
  });

  return { pointProps };
}

/** Ẩn/hiện chuỗi từ legend — luôn giữ ít nhất một chuỗi. Màu không đổi khi lọc (màu theo thực thể). */
export function useSeriesToggle(keys: string[]) {
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(() => new Set());
  const toggle = React.useCallback(
    (key: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return keys.every((k) => next.has(k)) ? prev : next;
      }),
    [keys],
  );
  return [hidden, toggle] as const;
}

/** Làm sạch id của React.useId (":r1:") để dùng được trong `url(#…)`. */
export function chartUid(base: string) {
  return base.replace(/[^a-zA-Z0-9_-]/g, "");
}
