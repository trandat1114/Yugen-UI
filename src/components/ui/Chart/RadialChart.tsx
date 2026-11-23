import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { chartMessagesEn } from "./messages";
import {
  ChartContainer,
  ChartLegend,
  ChartPatterns,
  ChartTable,
  type ChartLegendItem,
} from "./ChartParts";
import {
  chartUid,
  donutSlicePath,
  makeNumberFormatter,
  ringPath,
  slotFill,
  slotOf,
  useChartTexture,
  type ChartColor,
  type ChartFrameProps,
  type ChartNumberFormat,
  type ChartSlot,
} from "./chartUtils";

export interface RadialDatum {
  label: string;
  value: number;
  color?: ChartColor;
}

export interface RadialChartProps extends Omit<ChartFrameProps, "height"> {
  data: RadialDatum[];
  maxValue?: number;
  /** Hiển thị nhiều datum nối tiếp trên cùng một vòng. Mặc định chỉ dùng datum đầu tiên. */
  stacked?: boolean;
  startAngle?: number;
  endAngle?: number;
  size?: number;
  thickness?: number;
  track?: boolean;
  /** Nhãn và giá trị hiển thị ở tâm; mặc định là tổng đã định dạng. */
  centerLabel?: React.ReactNode;
  centerValue?: React.ReactNode;
  valueFormat?: ChartNumberFormat;
  legend?: boolean;
}

interface RadialSegment extends RadialDatum {
  key: string;
  slot: ChartSlot;
  start: number;
  end: number;
}

function degrees(value: number) {
  return (value * Math.PI) / 180;
}

function arcPath(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  start: number,
  end: number,
) {
  if (end - start >= Math.PI * 2 - 0.001) return ringPath(cx, cy, inner, outer);
  return donutSlicePath(cx, cy, inner, outer, start, end, 0);
}

function strokeArcPath(
  cx: number,
  cy: number,
  radius: number,
  start: number,
  end: number,
) {
  const point = (angle: number) =>
    `${cx + radius * Math.sin(angle)},${cy - radius * Math.cos(angle)}`;
  const span = end - start;
  if (span <= 0) return "";
  return `M${point(start)}A${radius},${radius} 0 ${span > Math.PI ? 1 : 0} 1 ${point(end)}`;
}

/** RadialChart — chỉ số vòng/gauge nhẹ, SVG viết tay và không phụ thuộc thư viện chart. */
export function RadialChart({
  data,
  maxValue,
  stacked = false,
  startAngle = 0,
  endAngle = 360,
  size = 220,
  thickness,
  track = true,
  centerLabel,
  centerValue,
  valueFormat,
  legend = true,
  title,
  description,
  toolbar,
  locale: localeProp,
  ariaLabel,
  hideTableToggle,
  defaultShowTable,
  texture,
  animate = true,
  className,
  ref,
}: RadialChartProps & { ref?: React.Ref<HTMLElement> }) {
  const locale = localeProp ?? useYugenLocale();
  const msg = useYugenMessages("chart", chartMessagesEn);
  const textured = useChartTexture(texture);
  const uid = chartUid(React.useId());
  const fmt = makeNumberFormatter(locale, valueFormat);
  const source = stacked ? data : data.slice(0, 1);
  const total = source.reduce(
    (sum, item) =>
      sum + (Number.isFinite(item.value) ? Math.max(0, item.value) : 0),
    0,
  );
  const max = Math.max(1, maxValue ?? total, total);
  const span = Math.max(0, Math.min(360, endAngle - startAngle));
  const start = degrees(startAngle);
  const end = start + degrees(span);
  const S = Math.max(140, size);
  const cx = S / 2;
  const cy = S / 2;
  const outer = S / 2 - 12;
  const inner = Math.max(
    outer - (thickness ?? Math.max(16, Math.round(S * 0.14))),
    4,
  );
  const trackRadius = (inner + outer) / 2;
  const isFullCircle = span >= 359.999;
  let cursor = start;
  const segments: RadialSegment[] = source.map((item, index) => {
    const value = Math.max(0, Number.isFinite(item.value) ? item.value : 0);
    const segmentStart = cursor;
    cursor += (value / max) * degrees(span);
    return {
      ...item,
      value,
      key: `${item.label}-${index}`,
      slot: slotOf(item.color, index),
      start: segmentStart,
      end: cursor,
    };
  });
  const label = centerLabel ?? (stacked ? msg.total : segments[0]?.label);
  const value = centerValue ?? fmt(total);
  const summary =
    ariaLabel ??
    msg.radialSummary({ value: fmt(total), max: fmt(max), label: segments[0]?.label });
  const legendItems: ChartLegendItem[] = segments.map((item) => ({
    key: item.key,
    label: item.label,
    slot: item.slot,
    value: fmt(item.value),
  }));
  const table = () => (
    <ChartTable
      caption={summary}
      columns={[
        { key: "label", label: msg.name },
        { key: "value", label: msg.value, numeric: true },
      ]}
      rows={segments.map((item) => ({
        key: item.key,
        header: item.label,
        cells: [fmt(item.value)],
      }))}
    />
  );

  return (
    <ChartContainer
      ref={ref}
      title={title}
      description={description}
      toolbar={toolbar}
      hideTableToggle={hideTableToggle}
      defaultShowTable={defaultShowTable}
      className={className}
      table={table}
    >
      <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <div className="relative shrink-0 overflow-visible" style={{ width: S, height: S }}>
          <svg
            width={S}
            height={S}
            viewBox={`0 0 ${S} ${S}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={summary}
            className="block max-w-full overflow-visible"
          >
            {textured && <ChartPatterns prefix={uid} slots={segments.map((item) => item.slot)} />}
            {track && (
              isFullCircle ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={trackRadius}
                  fill="none"
                  strokeWidth={outer - inner}
                  strokeLinecap="round"
                  style={{ stroke: "var(--colorChartGrid)" }}
                />
              ) : (
                <path
                  d={strokeArcPath(cx, cy, trackRadius, start, end)}
                  fill="none"
                  strokeWidth={outer - inner}
                  strokeLinecap="round"
                  style={{ stroke: "var(--colorChartGrid)" }}
                />
              )
            )}
            <g
              className={cn(
                animate && "animate-surface-in",
                "motion-reduce:animate-none",
              )}
            >
              {segments.map(
                (item) =>
                  item.end > item.start && (
                    <path
                      key={item.key}
                      d={arcPath(cx, cy, inner, outer, item.start, item.end)}
                      fill={slotFill(item.slot, textured ?? false, uid)}
                      stroke="none"
                      style={{ opacity: 0.92 }}
                    />
                  ),
              )}
            </g>
            <circle
              cx={cx}
              cy={cy}
              r={(inner + outer) / 2}
              fill="none"
              stroke="var(--colorChartSurface)"
              strokeWidth={2}
              aria-hidden
            />
            <text
              x={cx}
              y={cy - 2}
              textAnchor="middle"
              className="fill-foreground-1 text-subtitle1 font-semibold"
            >
              {value}
            </text>
            {label !== undefined && (
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                className="fill-foreground-3 text-caption1"
              >
                {label}
              </text>
            )}
          </svg>
        </div>
        {legend && segments.length > 1 && (
          <ChartLegend items={legendItems} shape="rect" textured={textured} />
        )}
      </div>
    </ChartContainer>
  );
}
