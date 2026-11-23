import * as React from "react";
import { cn } from "@/lib/cn";
import { useElementSize } from "../hooks/useElementSize";
import { useYugenLocale, useYugenMessages } from "../YugenProvider/context";
import { chartMessagesEn } from "./messages";
import {
  ChartContainer,
  ChartLegend,
  ChartPatterns,
  ChartTable,
  ChartTooltip,
  type ChartLegendItem,
} from "./ChartParts";
import { radarPath, radarPoint, radarValue, type RadarPoint } from "./radarMath";
import {
  chartUid,
  makeNumberFormatter,
  patternId,
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
  /** Lưới nền: đa giác theo các trục, vòng tròn, hoặc không vẽ (bỏ cả các nan từ tâm). */
  grid?: RadarGrid;
  /** Số vòng chia từ tâm tới biên (1–8). */
  levels?: number;
  /** Giá trị nhỏ nhất/lớn nhất dùng để chuẩn hóa các trục. Mặc định [0, giá trị lớn nhất của mọi chuỗi]. */
  domain?: [number, number];
  valueFormat?: ChartNumberFormat;
  /** Chấm tại giá trị của mỗi trục. */
  dots?: boolean;
  /** Chỉ vẽ đường viền, không tô (thắng `fill`). */
  linesOnly?: boolean;
  fill?: boolean;
  legend?: boolean;
  /** Cạnh lớn nhất (px); biểu đồ thu nhỏ theo khung chứa hẹp hơn. */
  size?: number;
}

interface RadarSeries {
  key: string;
  label: string;
  slot: ChartSlot;
  /** Giá trị gốc theo từng trục (null = thiếu). */
  values: (number | null)[];
  /** Giá trị đã định dạng theo `locale` (null = thiếu). */
  labels: (string | null)[];
  points: (RadarPoint | null)[];
}

/** Khoảng chừa quanh lưới cho nhãn trục. */
const LABEL_MARGIN = 38;

/**
 * RadarChart — so sánh nhiều chuỗi trên cùng một tập trục, SVG viết tay và không phụ thuộc thư viện. Lưới, đường của
 * các chuỗi và nhãn trục chỉ dựng lại khi dữ liệu, kích thước hoặc prop đổi; hover và focus chỉ vẽ lại vòng focus và
 * tooltip.
 */
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
  const fmt = React.useMemo(() => makeNumberFormatter(locale, valueFormat), [locale, valueFormat]);
  const axisLabels = React.useMemo(
    () => data.map((row, i) => String(row[index] ?? `${msg.category} ${i + 1}`)),
    [data, index, msg.category],
  );
  const count = axisLabels.length;
  const [hidden, toggle] = useSeriesToggle(series.map((item) => item.key));
  // Màu theo thực thể: chỉ số trong `series`, không đổi khi ẩn một chuỗi (giống legend).
  const slots = React.useMemo(() => new Map(series.map((item, i) => [item.key, slotOf(item.color, i)])), [series]);

  // Thang đo tính trên mọi chuỗi, kể cả chuỗi đang ẩn: ẩn một chuỗi không làm các chuỗi khác đổi hình.
  const autoMax = React.useMemo(() => {
    let m = 1;
    for (const row of data) {
      for (const item of series) {
        const v = toNumber(row[item.key]);
        if (v !== null && v > m) m = v;
      }
    }
    return m;
  }, [data, series]);
  const min = domain?.[0] ?? 0;
  const max = domain?.[1] ?? Math.max(autoMax, min);
  const levelCount = Math.max(1, Math.min(8, Math.round(levels)));

  // Cạnh = `size`, nhỏ lại khi khung chứa hẹp hơn. Server và lần render đầu dùng `size`; CSS `max-w-full` giữ không tràn.
  const { ref: boxRef, width: boxWidth } = useElementSize<HTMLDivElement>();
  const maxSide = Math.max(160, size);
  const S = boxWidth > 0 ? Math.max(120, Math.min(maxSide, Math.floor(boxWidth))) : maxSide;
  const cx = S / 2;
  const cy = S / 2;
  const radius = Math.max(20, S / 2 - LABEL_MARGIN);

  const axisPoints = React.useMemo(
    () => Array.from({ length: count }, (_, i) => radarPoint(i, count, radius, cx, cy)),
    [count, radius, cx, cy],
  );
  const seriesData: RadarSeries[] = React.useMemo(
    () =>
      series
        .filter((item) => !hidden.has(item.key))
        .map((item) => {
          const values = data.map((row) => toNumber(row[item.key]));
          return {
            key: item.key,
            label: item.label,
            slot: slots.get(item.key) as ChartSlot,
            values,
            labels: values.map((v) => (v === null ? null : fmt(v))),
            points: values.map((v, i) => {
              const t = radarValue(v, min, max);
              const axis = axisPoints[i];
              return t === null || !axis ? null : { x: cx + (axis.x - cx) * t, y: cy + (axis.y - cy) * t };
            }),
          };
        }),
    [series, hidden, data, slots, fmt, min, max, axisPoints, cx, cy],
  );

  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(null);
  const roving = useRovingPoints(count, (i, kb) => setActive(i === null ? null : { i, kb }));
  const indexLabel = indexLabelProp ?? msg.category;
  const summary = ariaLabel ?? msg.radarSummary({ axes: count, series: seriesData.map((item) => item.label) });

  const legendItems: ChartLegendItem[] = React.useMemo(
    () => series.map((item) => ({ key: item.key, label: item.label, slot: slots.get(item.key) as ChartSlot, hidden: hidden.has(item.key) })),
    [hidden, series, slots],
  );

  const gridLayer = React.useMemo(() => {
    if (grid === "none" || count === 0) return null;
    const rings = Array.from({ length: levelCount }, (_, level) => (level + 1) / levelCount);
    return (
      <g aria-hidden fill="none" style={{ stroke: "var(--colorChartGrid)" }}>
        {rings.map((scale) =>
          grid === "circle" ? (
            <circle key={scale} cx={cx} cy={cy} r={radius * scale} />
          ) : (
            <path
              key={scale}
              d={radarPath(axisPoints.map((point) => ({ x: cx + (point.x - cx) * scale, y: cy + (point.y - cy) * scale })))}
            />
          ),
        )}
        {axisPoints.map((point, i) => (
          <line key={i} x1={cx} y1={cy} x2={point.x} y2={point.y} strokeWidth={1} />
        ))}
      </g>
    );
  }, [grid, count, levelCount, axisPoints, cx, cy, radius]);

  const seriesLayer = React.useMemo(
    () => (
      <g aria-hidden>
        {seriesData.map((item) => (
          <g key={item.key} style={{ stroke: slotVar(item.slot) }}>
            <path
              d={radarPath(item.points)}
              fill={fill && !linesOnly ? slotFill(item.slot, textured, uid) : "none"}
              // Hoa văn (tương phản cao) giữ nét đậm; màu đặc tô mờ để các chuỗi chồng lên nhau vẫn đọc được.
              fillOpacity={fill && !linesOnly && !(textured && patternId(uid, item.slot)) ? 0.18 : undefined}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {dots && (
              <g style={{ fill: slotVar(item.slot), stroke: "var(--colorChartSurface)" }}>
                {item.points.map((point, i) => point && <circle key={i} cx={point.x} cy={point.y} r={3} />)}
              </g>
            )}
          </g>
        ))}
      </g>
    ),
    [seriesData, fill, linesOnly, dots, textured, uid],
  );

  const axisLayer = React.useMemo(
    () => (
      <g {...roving.layerProps}>
        {axisPoints.map((point, i) => {
          const values = seriesData.map((item) => `${item.label} ${item.labels[i] ?? msg.noData}`).join(", ");
          return (
            <g key={i}>
              <text
                aria-hidden
                x={point.x}
                y={point.y + (point.y < cy ? -8 : 14)}
                textAnchor={Math.abs(point.x - cx) < 4 ? "middle" : point.x < cx ? "end" : "start"}
                className="fill-foreground-2 text-caption1"
              >
                {axisLabels[i]}
              </text>
              <circle
                data-i={i}
                tabIndex={i === roving.stop ? 0 : -1}
                cx={point.x}
                cy={point.y}
                r={12}
                fill="transparent"
                role="img"
                aria-label={values ? `${axisLabels[i]}: ${values}` : axisLabels[i]}
                className="cursor-pointer outline-none"
              />
            </g>
          );
        })}
      </g>
    ),
    [roving.layerProps, roving.stop, axisPoints, seriesData, axisLabels, msg.noData, cx, cy],
  );

  const table = () => (
    <ChartTable
      caption={summary}
      columns={[{ key: "axis", label: indexLabel }, ...series.map((item) => ({ key: item.key, label: item.label, numeric: true }))]}
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

  const activePoint = active ? axisPoints[active.i] : undefined;

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
      {legend && <ChartLegend items={legendItems} shape="line" textured={textured} onToggle={toggle} />}
      <div ref={boxRef} className="relative flex w-full min-w-0 justify-center overflow-visible">
        <div className="relative max-w-full shrink-0" style={{ width: S, aspectRatio: "1" }}>
          <svg
            width={S}
            height={S}
            viewBox={`0 0 ${S} ${S}`}
            role="group"
            aria-label={summary}
            aria-roledescription={msg.roleDescription}
            className={cn("block size-full overflow-visible", animate && "animate-surface-in", "motion-reduce:animate-none")}
            onPointerLeave={() => setActive((current) => (current?.kb ? current : null))}
          >
            {textured && fill && !linesOnly && <ChartPatterns prefix={uid} slots={seriesData.map((item) => item.slot)} />}
            {gridLayer}
            {seriesLayer}
            {axisLayer}
            {active?.kb && activePoint && (
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={14}
                fill="none"
                strokeWidth={2}
                pointerEvents="none"
                style={{ stroke: "var(--colorStrokeFocus2)" }}
              />
            )}
          </svg>
          {active && activePoint && (
            <ChartTooltip
              x={activePoint.x}
              y={activePoint.y}
              title={axisLabels[active.i]}
              rows={seriesData.map((item) => ({
                key: item.key,
                label: item.label,
                value: item.labels[active.i] ?? msg.noData,
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
