import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { chartMessagesEn } from "./messages";
import {
  ChartContainer,
  ChartLegend,
  ChartTable,
  ChartTooltip,
  type ChartLegendItem,
} from "./ChartParts";
import { radarPath, radarPoint, radarValue } from "./radarMath";
import {
  chartUid,
  makeNumberFormatter,
  slotFill,
  slotOf,
  slotVar,
  toNumber,
  useChartTexture,
  useRovingPoints,
  useSeriesToggle,
  type ChartDatum,
  type ChartFrameProps,
  type ChartNumberFormat,
  type ChartSeries,
  type ChartSlot,
} from "./chartUtils";

export type RadarGrid = "polygon" | "circle" | "none";

export interface RadarChartProps extends ChartFrameProps {
  data: ChartDatum[];
  /** Trường nhãn của mỗi trục. */
  index: string;
  series: ChartSeries[];
  grid?: RadarGrid;
  /** Số vòng chia từ tâm tới biên. */
  levels?: number;
  /** Giá trị nhỏ nhất/lớn nhất dùng để chuẩn hóa các trục. */
  domain?: [number, number];
  valueFormat?: ChartNumberFormat;
  dots?: boolean;
  linesOnly?: boolean;
  fill?: boolean;
  legend?: boolean;
  size?: number;
}

interface RadarSeries {
  key: string;
  label: string;
  slot: ChartSlot;
  values: (number | null)[];
}

/** RadarChart — so sánh nhiều chuỗi trên cùng một tập trục, SVG viết tay và không phụ thuộc thư viện. */
export function RadarChart({
  data,
  index,
  series,
  grid = "polygon",
  levels = 5,
  domain,
  valueFormat,
  dots = false,
  linesOnly = false,
  fill = true,
  legend = true,
  size = 320,
  title,
  description,
  toolbar,
  locale: localeProp,
  ariaLabel,
  indexLabel: indexLabelProp,
  hideTableToggle,
  defaultShowTable,
  texture,
  animate = true,
  className,
  ref,
}: RadarChartProps & { ref?: React.Ref<HTMLElement> }) {
  const yugenLocale = useYugenLocale();
  const locale = localeProp ?? yugenLocale;
  const msg = useYugenMessages("chart", chartMessagesEn);
  const textured = useChartTexture(texture);
  const uid = chartUid(React.useId());
  const fmt = React.useMemo(
    () => makeNumberFormatter(locale, valueFormat),
    [locale, valueFormat],
  );
  const axisLabels = React.useMemo(
    () => data.map((row, i) => String(row[index] ?? `${msg.category} ${i + 1}`)),
    [data, index, msg.category],
  );
  const keys = series.map((item) => item.key);
  const [hidden, toggle] = useSeriesToggle(keys);
  const visible = React.useMemo(
    () => series.filter((item) => !hidden.has(item.key)),
    [hidden, series],
  );
  const allValues = React.useMemo(
    () =>
      data
        .flatMap((row) => series.map((item) => toNumber(row[item.key])))
        .filter((v): v is number => v !== null),
    [data, series],
  );
  const min = domain?.[0] ?? 0;
  const max = domain?.[1] ?? Math.max(1, ...allValues, min);
  const levelCount = Math.max(1, Math.min(8, levels));
  const S = Math.max(180, size);
  const cx = S / 2;
  const cy = S / 2;
  const radius = Math.max(20, S / 2 - 38);
  const axisPoints = React.useMemo(
    () =>
      axisLabels.map((_, i) =>
        radarPoint(i, axisLabels.length, radius, cx, cy),
      ),
    [axisLabels, radius, cx, cy],
  );
  const seriesData: RadarSeries[] = React.useMemo(
    () =>
      visible.map((item, seriesIndex) => ({
        key: item.key,
        label: item.label,
        slot: slotOf(item.color, seriesIndex),
        values: data.map((row) =>
          radarValue(toNumber(row[item.key]), min, max),
        ),
      })),
    [data, max, min, visible],
  );
  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(
    null,
  );
  const roving = useRovingPoints(axisLabels.length, (i, kb) =>
    setActive(i === null ? null : { i, kb }),
  );
  const indexLabel = indexLabelProp ?? msg.category;
  const summary =
    ariaLabel ??
    `Radar chart: ${axisLabels.length} ${axisLabels.length === 1 ? "axis" : "axes"}, ${seriesData.length} ${seriesData.length === 1 ? "series" : "series"}.`;
  const layers = React.useMemo(
    () =>
      Array.from(
        { length: levelCount },
        (_, level) => (level + 1) / levelCount,
      ),
    [levelCount],
  );
  const legendItems: ChartLegendItem[] = React.useMemo(
    () =>
      series.map((item, i) => ({
        key: item.key,
        label: item.label,
        slot: slotOf(item.color, i),
        hidden: hidden.has(item.key),
      })),
    [hidden, series],
  );

  const table = () => (
    <ChartTable
      caption={summary}
      columns={[
        { key: "axis", label: indexLabel },
        ...series.map((item) => ({
          key: item.key,
          label: item.label,
          numeric: true,
        })),
      ]}
      rows={data.map((row, i) => ({
        key: String(i),
        header: axisLabels[i],
        cells: series.map((item) => {
          const value = toNumber(row[item.key]);
          return value === null ? "—" : fmt(value);
        }),
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
      {legend && (
        <ChartLegend
          items={legendItems}
          shape="line"
          textured={textured}
          onToggle={toggle}
        />
      )}
      <div className="relative flex w-full justify-center overflow-visible">
        <div className="relative shrink-0" style={{ width: S, height: S }}>
          <svg
            width={S}
            height={S}
            viewBox={`0 0 ${S} ${S}`}
            role="group"
            aria-label={summary}
            aria-roledescription={msg.roleDescription}
            className={cn(
              "block h-auto max-w-full overflow-visible",
              animate && "animate-surface-in",
              "motion-reduce:animate-none",
            )}
            onPointerLeave={() =>
              setActive((current) => (current?.kb ? current : null))
            }
          >
          {layers.map((scale) => {
            const points = axisPoints.map((point) => ({
              x: cx + (point.x - cx) * scale,
              y: cy + (point.y - cy) * scale,
            }));
            return grid === "circle" ? (
              <circle
                key={scale}
                cx={cx}
                cy={cy}
                r={radius * scale}
                fill="none"
                style={{ stroke: "var(--colorChartGrid)" }}
              />
            ) : grid === "polygon" ? (
              <path
                key={scale}
                d={radarPath(points)}
                fill="none"
                style={{ stroke: "var(--colorChartGrid)" }}
              />
            ) : null;
          })}
          {grid !== "none" &&
            axisPoints.map((point, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={point.x}
                y2={point.y}
                strokeWidth={1}
                style={{ stroke: "var(--colorChartGrid)" }}
              />
            ))}
          <g aria-hidden>
            {seriesData.map((item) => {
              const points = item.values.map((value, i) =>
                value === null
                  ? null
                  : {
                      x: cx + (axisPoints[i].x - cx) * value,
                      y: cy + (axisPoints[i].y - cy) * value,
                    },
              );
              const path = radarPath(points);
              return (
                <g key={item.key}>
                  <path
                    d={path}
                    fill={
                      fill && !linesOnly
                        ? slotFill(item.slot, textured, uid)
                        : "none"
                    }
                    fillOpacity={fill && !linesOnly ? 0.18 : undefined}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeDasharray={textured ? undefined : undefined}
                    style={{
                      stroke: slotVar(item.slot),
                      transition: "opacity 120ms ease",
                    }}
                  />
                  {dots &&
                    points.map(
                      (point, i) =>
                        point && (
                          <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r={3}
                            style={{
                              fill: slotVar(item.slot),
                              stroke: "var(--colorChartSurface)",
                            }}
                          />
                        ),
                    )}
                </g>
              );
            })}
          </g>
          <g>
            {axisPoints.map((point, i) => (
              <g key={i}>
                <text
                  x={point.x}
                  y={point.y + (point.y < cy ? -8 : 14)}
                  textAnchor={
                    Math.abs(point.x - cx) < 4
                      ? "middle"
                      : point.x < cx
                        ? "end"
                        : "start"
                  }
                  className="fill-foreground-2 text-caption1"
                >
                  {axisLabels[i]}
                </text>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={12}
                  fill="transparent"
                  role="img"
                  aria-label={`${axisLabels[i]}: ${seriesData.map((item) => `${item.label} ${item.values[i] === null ? msg.noData : fmt(data[i]?.[item.key] as number)}`).join(", ")}`}
                  className="cursor-pointer outline-none"
                  {...roving.pointProps(i)}
                />
              </g>
            ))}
          </g>
          {active?.kb && (
            <circle
              cx={axisPoints[active.i].x}
              cy={axisPoints[active.i].y}
              r={14}
              fill="none"
              strokeWidth={2}
              style={{ stroke: "var(--colorStrokeFocus2)" }}
            />
          )}
          </svg>
          {active && (
            <ChartTooltip
              x={axisPoints[active.i].x}
              y={axisPoints[active.i].y}
              title={axisLabels[active.i]}
              rows={seriesData.map((item) => ({
                key: item.key,
                label: item.label,
                value:
                  toNumber(data[active.i]?.[item.key]) === null
                    ? msg.noData
                    : fmt(toNumber(data[active.i]?.[item.key]) as number),
                slot: item.slot,
                shape: "line",
              }))}
              textured={textured}
            />
          )}
        </div>
      </div>
    </ChartContainer>
  );
}
