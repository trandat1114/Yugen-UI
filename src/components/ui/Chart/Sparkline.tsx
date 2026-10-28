import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { chartMessages } from "./messages";
import { Stat, type StatProps } from "../Stat/Stat";
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

export interface StatTileProps extends Omit<StatProps, "chart"> {
  /** Chuỗi xu hướng (≈ 12 điểm) — vẽ Sparkline xám, điểm hiện tại tô màu nhấn. */
  trend?: (number | null)[];
  trendLabels?: string[];
}

/** StatTile — Stat kèm Sparkline vẽ từ `trend`. Ngoài biểu đồ, dùng thẳng `Stat` (ổn định, không thuộc Labs). */
export const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(function StatTile(
  { trend, trendLabels, size = "medium", locale, valueFormat, ...props },
  ref,
) {
  return (
    <Stat
      ref={ref}
      size={size}
      locale={locale}
      valueFormat={valueFormat}
      chart={
        trend && trend.length > 1 ? (
          <Sparkline
            data={trend}
            labels={trendLabels}
            width={size === "medium" ? 112 : 160}
            height={size === "medium" ? 36 : 48}
            locale={locale}
            valueFormat={valueFormat}
          />
        ) : undefined
      }
      {...props}
    />
  );
});
