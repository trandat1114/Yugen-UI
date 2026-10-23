import * as React from "react";
import { ArrowTrending16Regular, ArrowTrendingDown16Regular, Subtract16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { chartMessages } from "./messages";
import { ChartTooltip } from "./ChartParts";
import {
  linePath,
  linearScale,
  makeNumberFormatter,
  slotVar,
  useElementWidth,
  type ChartColor,
  type ChartNumberFormat,
  type ChartSlot,
  type Point,
} from "./chartUtils";

/* ================================================================== Sparkline */

export interface SparklineProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "color"> {
  data: (number | null)[];
  /** Px, hoặc "auto" = theo độ rộng phần tử cha. */
  width?: number | "auto";
  height?: number;
  variant?: "line" | "area";
  /** "neutral" = xám làm nền (mặc định, điểm hiện tại tô màu nhấn) hoặc một ô màu phân loại. */
  color?: ChartColor | "neutral";
  /** Chấm màu nhấn ở điểm cuối (kỳ hiện tại). */
  highlightLast?: boolean;
  /** Nhãn từng điểm (vd. tháng) cho tooltip. */
  labels?: string[];
  valueFormat?: ChartNumberFormat;
  /** Locale cho Intl.NumberFormat. Mặc định lấy từ YugenProvider. */
  locale?: string;
  curve?: "linear" | "monotone";
  /** Mô tả cho trình đọc màn hình; mặc định tự tóm tắt (đầu, cuối, thấp nhất, cao nhất). */
  ariaLabel?: string;
}

/** Sparkline — đường xu hướng nhỏ inline, không trục. */
export const Sparkline = React.forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline(
  {
    data,
    width = 120,
    height = 32,
    variant = "line",
    color = "neutral",
    highlightLast = true,
    labels,
    valueFormat,
    locale: localeProp,
    curve = "monotone",
    ariaLabel,
    className,
    ...props
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("chart", chartMessages);
  const [measureRef, measured] = useElementWidth<HTMLSpanElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const setRefs = (el: HTMLSpanElement | null) => {
    measureRef(el);
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  const W = width === "auto" ? measured : width;
  const fmt = makeNumberFormatter(locale, valueFormat);

  const lineSlot: ChartSlot = color === "neutral" ? "other" : color;
  const accentSlot: ChartSlot = color === "neutral" ? 1 : color;
  const values = data.filter((v): v is number => v != null && Number.isFinite(v));
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const pad = 6;
  const x = linearScale([0, Math.max(1, data.length - 1)], [pad, Math.max(pad, W - pad)]);
  const y = linearScale(min === max ? [min - 1, max + 1] : [min, max], [height - pad, pad]);

  const segments: Point[][] = [];
  let cur: Point[] = [];
  data.forEach((v, i) => {
    if (v == null || !Number.isFinite(v)) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else cur.push([x(i), y(v)]);
  });
  if (cur.length) segments.push(cur);
  const lastIndex = data.reduce<number>((acc, v, i) => (v != null && Number.isFinite(v) ? i : acc), -1);
  const baseY = height - pad;

  const summary =
    ariaLabel ??
    (values.length
      ? msg.sparklineSummary({ points: data.length, first: fmt(values[0]), last: fmt(values[values.length - 1]), min: fmt(min), max: fmt(max) })
      : msg.noData);

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round(((px - pad) / Math.max(1, W - pad * 2)) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    setHover(data[clamped] == null ? null : clamped);
  };

  const hv = hover != null ? data[hover] : null;

  return (
    <span
      ref={setRefs}
      dir="ltr"
      className={cn("relative align-middle", width === "auto" ? "block w-full" : "inline-block", className)}
      style={{ height, width: width === "auto" ? undefined : width }}
      {...props}
    >
      {W > 0 && (
        <svg
          width={W}
          height={height}
          role="img"
          aria-label={summary}
          className="block overflow-visible"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          {variant === "area" &&
            segments.map((seg, i) => (
              <path
                key={`a${i}`}
                d={`${linePath(seg, curve)}L${seg[seg.length - 1][0]},${baseY}L${seg[0][0]},${baseY}Z`}
                style={{ fill: slotVar(lineSlot), fillOpacity: "var(--chartAreaOpacity)" }}
              />
            ))}
          {segments.map((seg, i) => (
            <path
              key={`l${i}`}
              d={linePath(seg, curve)}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ stroke: slotVar(lineSlot) }}
            />
          ))}
          {highlightLast && lastIndex >= 0 && (
            <circle
              cx={x(lastIndex)}
              cy={y(data[lastIndex] as number)}
              r={4}
              strokeWidth={2}
              style={{ fill: slotVar(accentSlot), stroke: "var(--colorChartSurface)" }}
            />
          )}
          {hover != null && hv != null && hover !== lastIndex && (
            <circle cx={x(hover)} cy={y(hv)} r={4} strokeWidth={2} style={{ fill: slotVar(lineSlot), stroke: "var(--colorChartSurface)" }} />
          )}
        </svg>
      )}
      {hover != null && hv != null && (
        <ChartTooltip placement="above" x={x(hover)} y={y(hv)} title={labels?.[hover]} rows={[{ key: "v", label: labels ? msg.value : `#${hover + 1}`, value: fmt(hv) }]} />
      )}
    </span>
  );
});

/* ================================================================== StatTile */

export interface StatTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Nhãn viết hoa chữ đầu câu, không dấu hai chấm. */
  label: React.ReactNode;
  value: number | string;
  /** Mặc định tự rút gọn từ 10.000 (12,9 N; 4,2 Tr…). */
  valueFormat?: ChartNumberFormat;
  /** Locale cho Intl.NumberFormat. Mặc định lấy từ YugenProvider. */
  locale?: string;
  /** Mức thay đổi có dấu (0.124 = +12,4% với định dạng mặc định). */
  delta?: number;
  deltaFormat?: ChartNumberFormat;
  /** So với kỳ nào — vd. "so với tháng trước". */
  deltaLabel?: React.ReactNode;
  /** Chiều nào là tốt: quyết định màu success / danger của delta. */
  goodDirection?: "up" | "down" | "neutral";
  /** Chuỗi xu hướng (≈ 12 điểm) — vẽ Sparkline xám, điểm hiện tại tô màu nhấn. */
  trend?: (number | null)[];
  trendLabels?: string[];
  /** medium 28px · large 40px · hero 68px (một hero mỗi màn hình). */
  size?: "medium" | "large" | "hero";
  icon?: React.ReactNode;
}

/** StatTile — "đôi khi câu trả lời không phải biểu đồ": con số lớn + delta + sparkline tuỳ chọn. */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
  {
    label,
    value,
    valueFormat,
    locale: localeProp,
    delta,
    deltaFormat,
    deltaLabel,
    goodDirection = "up",
    trend,
    trendLabels,
    size = "medium",
    icon,
    className,
    ...props
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("chart", chartMessages);
  const valueText =
    typeof value === "number"
      ? makeNumberFormatter(locale, valueFormat ?? (Math.abs(value) >= 1e4 ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }))(value)
      : value;
  const deltaText =
    delta === undefined
      ? ""
      : makeNumberFormatter(locale, deltaFormat ?? { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" })(delta);
  const direction = delta === undefined || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const tone =
    direction === "flat" || goodDirection === "neutral" ? "neutral" : direction === goodDirection ? "good" : "bad";
  const DeltaIcon = direction === "up" ? ArrowTrending16Regular : direction === "down" ? ArrowTrendingDown16Regular : Subtract16Regular;
  const directionText = direction === "up" ? msg.increase : direction === "down" ? msg.decrease : msg.noChange;

  return (
    <div ref={ref} className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
      <div className="flex items-center gap-2 text-body1 text-foreground-2">
        {icon && <span className="flex shrink-0 text-foreground-3 [&_svg]:size-5">{icon}</span>}
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div
            className={cn(
              "font-sans font-semibold text-foreground-1",
              size === "hero" ? "text-display" : size === "large" ? "text-large-title" : "text-title2",
            )}
          >
            <bdi>{valueText}</bdi>
          </div>
          {delta !== undefined && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-caption1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  tone === "good" ? "text-success-foreground-1" : tone === "bad" ? "text-danger-foreground-1" : "text-foreground-2",
                )}
              >
                <DeltaIcon aria-hidden className="shrink-0 rtl:-scale-x-100" />
                <span className="sr-only">{directionText}</span>
                <bdi>{deltaText}</bdi>
              </span>
              {deltaLabel && <span className="text-foreground-3">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {trend && trend.length > 1 && (
          <Sparkline data={trend} labels={trendLabels} width={size === "medium" ? 112 : 160} height={size === "medium" ? 36 : 48} locale={locale} valueFormat={valueFormat} />
        )}
      </div>
    </div>
  );
});
