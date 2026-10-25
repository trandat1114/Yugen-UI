import * as React from "react";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { chartMessages } from "./messages";
import { ChartContainer, ChartFocusRing, ChartTable, ChartTooltip } from "./ChartParts";
import { PlotArea, axisTextClass, formatCategory } from "./cartesian";
import {
  chartUid,
  clamp,
  fitText,
  makeNumberFormatter,
  measureText,
  toNumber,
  useElementWidth,
  type ChartDatum,
  type ChartFrameProps,
  type ChartNumberFormat,
} from "./chartUtils";
import { heatmapColor, heatmapDomain, heatmapPosition } from "./chartMath";

export interface HeatmapColumn {
  /** Tên trường trong mỗi dòng `data`. */
  key: string;
  /** Nhãn cột (trục trên, tooltip, bảng). */
  label: string;
}

export interface HeatmapProps extends Omit<ChartFrameProps, "height" | "texture"> {
  /** Mỗi phần tử là một hàng của ma trận. */
  data: ChartDatum[];
  /** Trường nhãn hàng. */
  index: string;
  /** Các cột của ma trận (giá trị = `data[hàng][cột.key]`; null/thiếu = ô trống). */
  columns: HeatmapColumn[];
  valueFormat?: ChartNumberFormat;
  /** Miền màu [min, max]; mặc định theo dữ liệu (phân kỳ: đối xứng quanh `midpoint`). */
  domain?: [number, number];
  /** Thang phân kỳ (hai cực + điểm giữa xám) thay cho tuần tự một sắc. */
  diverging?: boolean;
  /** Điểm giữa của thang phân kỳ. */
  midpoint?: number;
  /** Chiều cao mỗi hàng (px). */
  rowHeight?: number;
  /** Hiện thang màu (mặc định bật). */
  legend?: boolean;
}


/** Ô mẫu hoa văn "không có dữ liệu" — dùng chung cho ô trống và legend. */
function EmptyPattern({ id }: { id: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
      <rect width={6} height={6} style={{ fill: "var(--colorChartSurface)" }} />
      <line x1={3} y1={0} x2={3} y2={6} strokeWidth={1.5} style={{ stroke: "var(--colorChartOther)" }} />
    </pattern>
  );
}

/** Thang màu dạng dải chuyển (gradient) với nhãn min / (giữa) / max — theo hướng chữ của trang. */
function HeatmapLegend({
  min,
  max,
  mid,
  midFraction,
  diverging,
  showEmpty,
  emptyId,
  emptyText,
}: {
  min: string;
  max: string;
  mid?: string;
  midFraction: number;
  diverging: boolean;
  showEmpty: boolean;
  emptyId: string;
  /** Nhãn ô trống (messages.chart.noData). */
  emptyText: string;
}) {
  const dir = useDirection();
  const side = dir === "rtl" ? "left" : "right";
  const stops = diverging
    ? `var(--colorChartDivergingNeg), var(--colorChartDivergingMid) ${+(midFraction * 100).toFixed(1)}%, var(--colorChartDivergingPos)`
    : Array.from({ length: 7 }, (_, i) => `var(--colorChartSequential${i + 1})`).join(", ");
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption1 text-foreground-2">
      <div className="flex flex-col gap-0.5">
        <div aria-hidden className="h-2 w-48 rounded-small" style={{ backgroundImage: `linear-gradient(to ${side}, ${stops})` }} />
        <div className="relative flex w-48 justify-between tabular-nums">
          <bdi>{min}</bdi>
          {mid !== undefined && (
            <bdi className="absolute -translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${midFraction * 100}%` }}>
              {mid}
            </bdi>
          )}
          <bdi>{max}</bdi>
        </div>
      </div>
      {showEmpty && (
        <span className="inline-flex items-center gap-1.5">
          <svg width={12} height={12} aria-hidden className="shrink-0">
            <defs>
              <EmptyPattern id={emptyId} />
            </defs>
            <rect x={0.5} y={0.5} width={11} height={11} rx={2} strokeWidth={1} style={{ fill: `url(#${emptyId})`, stroke: "var(--colorChartGrid)" }} />
          </svg>
          {emptyText}
        </span>
      )}
    </div>
  );
}

/**
 * Heatmap — ma trận hàng × cột tô theo thang tuần tự (một sắc nhạt → đậm) hoặc phân kỳ (`diverging`).
 * Khe 2px giữa các ô, nhãn cắt bằng fitText (đủ chữ trong tooltip và bảng), ô trống là hoa văn trung tính.
 * Bàn phím: Tab vào ma trận, mũi tên đi giữa các ô, Home/End đầu/cuối hàng, Ctrl+Home/End ô đầu/cuối.
 */
export const Heatmap = React.forwardRef<HTMLElement, HeatmapProps>(function Heatmap(
  {
    data,
    index,
    columns,
    valueFormat,
    domain: domainProp,
    diverging = false,
    midpoint = 0,
    rowHeight = 32,
    legend = true,
    title,
    description,
    toolbar,
    locale: localeProp,
    ariaLabel,
    indexLabel,
    hideTableToggle,
    defaultShowTable,
    animate = true,
    className,
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("chart", chartMessages);
  const emptyText = msg.noData;
  const uid = chartUid(React.useId());
  const emptyId = `${uid}-empty`;
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = React.useState<{ r: number; c: number; kb: boolean } | null>(null);
  const [stop, setStop] = React.useState<[number, number]>([0, 0]);
  const cellRefs = React.useRef<(SVGRectElement | null)[]>([]);

  const rows = data.length;
  const cols = columns.length;
  const fmt = makeNumberFormatter(locale, valueFormat);
  const rowLabels = data.map((d) => formatCategory(d[index], locale));
  const values = data.map((d) => columns.map((c) => toNumber(d[c.key])));
  const flat = values.flat();
  const domain = domainProp ?? heatmapDomain(flat, diverging, midpoint);
  const scale = { domain, diverging, midpoint };
  const hasEmpty = flat.some((v) => v == null);
  const nums = flat.filter((v): v is number => v != null);

  /* ---------- bố cục ---------- */
  const top = 24;
  const labelW = Math.ceil(Math.max(0, ...rowLabels.map((l) => measureText(l))));
  const left = Math.min(labelW, Math.max(48, width * 0.3), 160) + 8;
  const plotW = Math.max(0, width - left);
  const cellW = cols ? plotW / cols : 0;
  const height = top + rows * rowHeight + 4;
  const cellX = (c: number) => left + c * cellW;
  const cellY = (r: number) => top + r * rowHeight;

  /* ---------- bàn phím (roving 2 chiều) ---------- */
  const [sr, sc] = [clamp(stop[0], 0, Math.max(0, rows - 1)), clamp(stop[1], 0, Math.max(0, cols - 1))];
  const focusCell = (r: number, c: number) => {
    const nr = clamp(r, 0, rows - 1);
    const nc = clamp(c, 0, cols - 1);
    setStop([nr, nc]);
    cellRefs.current[nr * cols + nc]?.focus();
  };
  const onKeyDown = (event: React.KeyboardEvent, r: number, c: number) => {
    const ctrl = event.ctrlKey || event.metaKey;
    let next: [number, number] | null = null;
    // Vùng vẽ luôn LTR (như các biểu đồ khác) → → luôn là cột kế tiếp trên màn hình.
    if (event.key === "ArrowRight") next = [r, c + 1];
    else if (event.key === "ArrowLeft") next = [r, c - 1];
    else if (event.key === "ArrowDown") next = [r + 1, c];
    else if (event.key === "ArrowUp") next = [r - 1, c];
    else if (event.key === "Home") next = ctrl ? [0, 0] : [r, 0];
    else if (event.key === "End") next = ctrl ? [rows - 1, cols - 1] : [r, cols - 1];
    else if (event.key === "Escape") {
      setActive(null);
      return;
    }
    if (!next) return;
    event.preventDefault();
    focusCell(next[0], next[1]);
  };

  const valueText = (v: number | null) => (v == null ? emptyText : fmt(v));
  const activeValue = active ? values[active.r]?.[active.c] : undefined;

  const summary =
    ariaLabel ??
    msg.heatmapSummary({
      rows,
      columns: cols,
      min: nums.length ? fmt(Math.min(...nums)) : undefined,
      max: nums.length ? fmt(Math.max(...nums)) : undefined,
      hasEmpty,
    });

  // Chỉ dựng khi bảng đang bật: hàng của mọi điểm dữ liệu được định dạng lại mỗi lần biểu đồ render.
  const table = () => (
    <ChartTable
      caption={summary}
      columns={[{ key: "__index", label: indexLabel ?? "" }, ...columns.map((c) => ({ key: c.key, label: c.label, numeric: true }))]}
      rows={data.map((_, r) => ({ key: String(r), header: rowLabels[r], cells: values[r].map(valueText) }))}
    />
  );

  const midT = heatmapPosition(midpoint, { domain, diverging: false }) ?? 0.5;

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
      legend={
        legend ? (
          <HeatmapLegend
            min={fmt(domain[0])}
            max={fmt(domain[1])}
            mid={diverging ? fmt(midpoint) : undefined}
            midFraction={diverging ? midT : 0.5}
            diverging={diverging}
            showEmpty={hasEmpty}
            emptyId={`${uid}-legend-empty`}
            emptyText={emptyText}
          />
        ) : undefined
      }
    >
      <PlotArea ref={plotRef} height={height}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="group"
            aria-label={summary}
            aria-roledescription={msg.heatmapRoleDescription}
            className="block overflow-visible"
            onPointerLeave={() => setActive((a) => (a?.kb ? a : null))}
          >
            <defs>
              <EmptyPattern id={emptyId} />
            </defs>

            <g aria-hidden>
              {columns.map((c, i) => {
                const text = fitText(c.label, cellW - 4);
                return text ? (
                  <text key={c.key} x={cellX(i) + cellW / 2} y={top - 8} textAnchor="middle" className={axisTextClass}>
                    {text}
                  </text>
                ) : null;
              })}
              {rowLabels.map((l, r) => {
                const text = fitText(l, left - 8);
                return text ? (
                  <text key={r} x={left - 8} y={cellY(r) + rowHeight / 2} dy="0.32em" textAnchor="end" className={axisTextClass}>
                    {text}
                  </text>
                ) : null;
              })}
            </g>

            <g className={cn(animate && "animate-fade-in", "motion-reduce:animate-none")}>
              {values.map((row, r) =>
                row.map((v, c) => {
                  const color = heatmapColor(v, scale);
                  const isStop = r === sr && c === sc;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      ref={(el) => {
                        cellRefs.current[r * cols + c] = el;
                      }}
                      x={cellX(c) + 1}
                      y={cellY(r) + 1}
                      width={Math.max(0, cellW - 2)}
                      height={Math.max(0, rowHeight - 2)}
                      rx={2}
                      role="img"
                      aria-label={`${rowLabels[r]}, ${columns[c].label}: ${valueText(v)}`}
                      tabIndex={isStop ? 0 : -1}
                      className="outline-none"
                      style={{ fill: color ?? `url(#${emptyId})` }}
                      onKeyDown={(e) => onKeyDown(e, r, c)}
                      onFocus={() => {
                        setStop([r, c]);
                        setActive({ r, c, kb: true });
                      }}
                      onBlur={() => setActive(null)}
                      onPointerEnter={() => setActive((a) => (a?.kb ? a : { r, c, kb: false }))}
                    />
                  );
                }),
              )}
            </g>

            {active && active.r < rows && active.c < cols && (
              <g aria-hidden pointerEvents="none">
                {active.kb ? (
                  <ChartFocusRing x={cellX(active.c) + 1} y={cellY(active.r) + 1} width={cellW - 2} height={rowHeight - 2} radius={2} />
                ) : (
                  <rect
                    x={cellX(active.c) + 1}
                    y={cellY(active.r) + 1}
                    width={Math.max(0, cellW - 2)}
                    height={Math.max(0, rowHeight - 2)}
                    rx={2}
                    fill="none"
                    strokeWidth={2}
                    style={{ stroke: "var(--colorChartLabelStrong)" }}
                  />
                )}
              </g>
            )}
          </svg>
        )}
        {active && active.r < rows && active.c < cols && width > 0 && (
          <ChartTooltip
            x={cellX(active.c) + cellW / 2}
            y={cellY(active.r)}
            title={`${rowLabels[active.r]} · ${columns[active.c].label}`}
            rows={[{ key: "v", label: msg.value, value: valueText(activeValue ?? null) }]}
          />
        )}
      </PlotArea>
    </ChartContainer>
  );
});
