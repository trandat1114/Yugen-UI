import * as React from "react";
import { cn } from "@/lib/cn";
import { ChartContainer, ChartFocusRing, ChartLegend, ChartTable, ChartTooltip, type ChartTooltipRow } from "./ChartParts";
import { ChartBrush } from "./ChartBrush";
import { normalizeDomain, stackValues, type ChartDomain } from "./chartMath";
import { Baseline, CategoryAxisBottom, GridLines, PlotArea, ValueAxisLeft, formatCategory, pickLabelIndices } from "./cartesian";
import {
  clamp,
  df,
  linePath,
  linearScale,
  makeAxisFormatter,
  makeNumberFormatter,
  measureText,
  niceTicks,
  slotDash,
  slotOf,
  slotVar,
  toNumber,
  useChartTexture,
  useElementWidth,
  useRovingPoints,
  useSeriesToggle,
  type ChartDatum,
  type ChartFrameProps,
  type ChartNumberFormat,
  type ChartSeries,
  type ChartSlot,
  type ChartValue,
  type Point,
} from "./chartUtils";

export type ChartXFormat = Intl.DateTimeFormatOptions | ((value: ChartValue) => string);

export interface LineChartProps extends ChartFrameProps {
  data: ChartDatum[];
  /** Trường trục X — chuỗi (danh mục) hoặc Date (thời gian). Dữ liệu cần sắp xếp tăng dần theo X. */
  index: string;
  series: ChartSeries[];
  /** Mặc định tự nhận: có Date → "time" (vị trí theo thời gian thực), còn lại "category" (cách đều). */
  xType?: "category" | "time";
  valueFormat?: ChartNumberFormat;
  axisFormat?: ChartNumberFormat;
  /** Nhãn trục X. Thời gian mặc định "3/10". */
  xFormat?: ChartXFormat;
  /** Nhãn X trong tooltip và bảng. Thời gian mặc định "3 tháng 10, 2026". */
  xTooltipFormat?: ChartXFormat;
  /** Chấm tại mọi điểm (≥ 8px, viền bề mặt 2px). */
  markers?: boolean;
  curve?: "linear" | "monotone";
  /** Nhãn trực tiếp ở cuối đường (tên chuỗi; một chuỗi thì là giá trị). Mặc định khi ≤ 4 chuỗi; tự tắt nếu các nhãn chồng nhau. */
  endLabels?: boolean;
  /** Emphasis: tô màu một chuỗi, các chuỗi khác về xám. */
  highlight?: string;
  /** Trục Y bắt đầu từ 0 (luôn bật với AreaChart). */
  includeZero?: boolean;
  /** Mặc định hiện khi ≥ 2 chuỗi. */
  legend?: boolean;
  /** Dải tổng quan (brush) dưới vùng vẽ: kéo / đổi kích thước cửa sổ để zoom, có nút "Đặt lại". */
  brush?: boolean;
  /** Miền chỉ số đang xem [đầu, cuối] (gồm cả hai đầu) — có điều khiển. Có miền thì vùng vẽ chỉ hiện các mốc trong miền. */
  domain?: ChartDomain;
  /** Miền ban đầu khi không điều khiển. */
  defaultDomain?: ChartDomain;
  onDomainChange?: (domain: ChartDomain) => void;
}

export interface AreaChartProps extends LineChartProps {
  /** Chồng các vùng (phần–tổng theo thời gian). */
  stacked?: boolean;
  /** Khi chồng: "expand" chuẩn hoá mỗi mốc về 100% (trục Y là tỉ lệ). */
  stackOffset?: "none" | "expand";
}

interface Column {
  i: number;
  x: number;
  x0: number;
  x1: number;
}

function SeriesChart({
  variant,
  stacked = false,
  stackOffset = "none",
  data: allData,
  index,
  series,
  xType,
  valueFormat,
  axisFormat,
  xFormat,
  xTooltipFormat,
  markers = false,
  curve = "monotone",
  endLabels,
  highlight,
  includeZero,
  legend,
  brush = false,
  domain: domainProp,
  defaultDomain,
  onDomainChange,
  title,
  description,
  toolbar,
  height = 280,
  locale = "vi-VN",
  ariaLabel,
  indexLabel,
  hideTableToggle,
  defaultShowTable,
  texture,
  animate = true,
  className,
  forwardedRef,
}: AreaChartProps & { variant: "line" | "area"; forwardedRef: React.ForwardedRef<HTMLElement> }) {
  const textured = useChartTexture(texture);
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [hidden, toggleSeries] = useSeriesToggle(series.map((s) => s.key));
  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(null);

  const isArea = variant === "area";
  const isStacked = isArea && stacked && series.length > 1;
  const expand = isStacked && stackOffset === "expand";

  /* ---------- miền zoom (brush) ---------- */
  const [innerDomain, setInnerDomain] = React.useState<ChartDomain | undefined>(defaultDomain);
  const domainRaw = domainProp ?? innerDomain;
  const nAll = allData.length;
  const [ds, de] = normalizeDomain(domainRaw, nAll);
  const zoomed = domainRaw !== undefined && nAll > 1;
  const setDomain = (next: ChartDomain) => {
    if (domainProp === undefined) setInnerDomain(next);
    onDomainChange?.(next);
  };
  const data = zoomed ? allData.slice(ds, de + 1) : allData;
  const rawAll = allData.map((d) => d[index]);

  const n = data.length;
  const raw = data.map((d) => d[index]);
  const isTime = xType ? xType === "time" : rawAll.some((v) => v instanceof Date);
  const fmt = makeNumberFormatter(locale, valueFormat);

  const xAxisText = (v: ChartValue): string => {
    if (typeof xFormat === "function") return xFormat(v);
    if (v instanceof Date) return df(locale, xFormat ?? { day: "numeric", month: "numeric" }).format(v);
    return formatCategory(v, locale);
  };
  const xLongText = (v: ChartValue): string => {
    const f = xTooltipFormat ?? (typeof xFormat === "function" ? xFormat : undefined);
    if (typeof f === "function") return f(v);
    if (v instanceof Date) return df(locale, f ?? { day: "numeric", month: "long", year: "numeric" }).format(v);
    return formatCategory(v, locale);
  };
  const xLabels = raw.map(xAxisText);
  const xLongAll = rawAll.map(xLongText);
  const xLong = zoomed ? xLongAll.slice(ds, de + 1) : xLongAll;

  const slots = series.map((s, i) => slotOf(s.color, i));
  const slotFor = (key: string, slot: ChartSlot): ChartSlot => (highlight && key !== highlight ? "other" : slot);
  const vis = series.map((s, i) => ({ s, slot: slotFor(s.key, slots[i]) })).filter((v) => !hidden.has(v.s.key));
  // Chuỗi được nhấn mạnh vẽ sau cùng (nằm trên).
  const drawOrder = highlight ? [...vis.filter((v) => v.s.key !== highlight), ...vis.filter((v) => v.s.key === highlight)] : vis;
  const val = (r: number, key: string) => toNumber(data[r]?.[key]);

  /* ---------- giá trị (cộng dồn khi chồng; "expand" = tỉ lệ 0…1) ---------- */
  const stacks = stackValues(
    vis.map((v) => data.map((_, r) => val(r, v.s.key))),
    isStacked,
    expand ? "expand" : "none",
  );
  const upper = stacks.map((st) => st.upper);
  const lower = stacks.map((st) => st.lower);
  const all = upper.flat().filter((v): v is number => v != null);
  let lo = expand ? 0 : all.length ? Math.min(...all) : 0;
  let hi = expand ? 1 : all.length ? Math.max(...all) : 1;
  if (isArea || includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }

  /* ---------- bố cục ---------- */
  const top = 8;
  const bottom = 28;
  const plotH = Math.max(0, height - top - bottom);
  const ticks = niceTicks(lo, hi, clamp(Math.round(plotH / 56), 2, 8));
  const d0 = ticks[0];
  const d1 = ticks[ticks.length - 1];
  const axisFmt = makeAxisFormatter(locale, axisFormat ?? (expand ? { style: "percent" } : valueFormat), Math.max(Math.abs(d0), Math.abs(d1)), ticks.length > 1 ? ticks[1] - ticks[0] : 0);
  const left = Math.ceil(Math.max(0, ...ticks.map((t) => measureText(axisFmt(t))))) + 8;

  // Nhãn cuối đường
  const wantEndLabels = endLabels ?? series.length <= 4;
  const lastIdx = vis.map((_, k) => {
    for (let r = n - 1; r >= 0; r--) if (upper[k][r] != null) return r;
    return -1;
  });
  const endTexts = vis.map((v, k) =>
    lastIdx[k] < 0 || (highlight && v.s.key !== highlight) ? "" : series.length === 1 ? fmt(upper[k][lastIdx[k]] as number) : v.s.label,
  );
  const endW = Math.max(0, ...endTexts.map((t) => (t ? measureText(t) : 0)));
  const showEnd = wantEndLabels && endW > 0 && endW + 10 <= width * 0.3;
  const right = showEnd ? endW + 10 : 12;
  const plotW = Math.max(0, width - left - right);

  const y = linearScale([d0, d1], [top + plotH, top]);
  const timeOf = (v: ChartValue) => (v instanceof Date ? +v : typeof v === "number" ? v : NaN);
  const times = raw.map(timeOf);
  const tMin = Math.min(...times.filter(Number.isFinite));
  const tMax = Math.max(...times.filter(Number.isFinite));
  const xs = raw.map((_, r) => {
    if (isTime && Number.isFinite(times[r]) && tMax > tMin) return linearScale([tMin, tMax], [left, left + plotW])(times[r]);
    if (n <= 1) return left + plotW / 2;
    return left + (plotW * r) / (n - 1);
  });
  const columns: Column[] = xs.map((x, i) => ({
    i,
    x,
    x0: i === 0 ? left : (xs[i - 1] + x) / 2,
    x1: i === n - 1 ? left + plotW : (x + xs[i + 1]) / 2,
  }));
  const baseY = y(clamp(0, d0, d1));

  /* ---------- đường & vùng ---------- */
  const shapes = drawOrder.map((v) => {
    const k = vis.indexOf(v);
    const segments: Point[][] = [];
    const lowSegs: Point[][] = [];
    let cur: Point[] = [];
    let curLow: Point[] = [];
    for (let r = 0; r < n; r++) {
      const u = upper[k][r];
      if (u == null) {
        if (cur.length) {
          segments.push(cur);
          lowSegs.push(curLow);
        }
        cur = [];
        curLow = [];
        continue;
      }
      cur.push([xs[r], y(u)]);
      curLow.push([xs[r], isStacked ? y(lower[k][r]) : baseY]);
    }
    if (cur.length) {
      segments.push(cur);
      lowSegs.push(curLow);
    }
    const line = segments.map((seg) => linePath(seg, curve)).join("");
    const area = isArea
      ? segments
          .map((seg, j) => {
            const back = [...lowSegs[j]].reverse();
            return `${linePath(seg, curve)}L${linePath(back, curve).slice(1)}Z`;
          })
          .join("")
      : "";
    return { v, k, line, area };
  });

  /* ---------- tương tác ---------- */
  const roving = useRovingPoints(n, (i, kb) => setActive(i === null ? null : { i, kb }));
  const activeCol = active && width > 0 ? columns[active.i] : undefined;
  const activePoints = activeCol
    ? vis
        .map((v, k) => ({ v, k, value: upper[k][activeCol.i] }))
        .filter((p): p is { v: (typeof vis)[number]; k: number; value: number } => p.value != null)
    : [];
  const pctFmt = makeNumberFormatter(locale, { style: "percent", maximumFractionDigits: 1 });
  const rowsAt = (r: number): ChartTooltipRow[] => {
    const total = vis.reduce((a, v) => a + (val(r, v.s.key) ?? 0), 0);
    const rows: ChartTooltipRow[] = vis.map((v) => {
      const x = val(r, v.s.key);
      const text = x == null ? "—" : expand && total > 0 ? `${fmt(x)} (${pctFmt(Math.max(0, x) / total)})` : fmt(x);
      return { key: v.s.key, label: v.s.label, value: text, slot: v.slot, shape: isArea ? "rect" : "line" };
    });
    if (isStacked) rows.push({ key: "__total", label: "Tổng", value: fmt(total) });
    return rows;
  };

  // Nhãn cuối: bỏ hết nếu va nhau (không xếp chồng / đẩy lệch khỏi đường).
  const endLabelItems = showEnd
    ? vis
        .map((v, k) => ({ key: v.s.key, text: endTexts[k], y: lastIdx[k] >= 0 ? y(upper[k][lastIdx[k]] as number) : 0, x: lastIdx[k] >= 0 ? xs[lastIdx[k]] : 0 }))
        .filter((l) => l.text)
        .sort((a, b) => a.y - b.y)
    : [];
  const endCollide = endLabelItems.some((l, i) => i > 0 && l.y - endLabelItems[i - 1].y < 14);

  const xLabelIdx = width > 0 ? pickLabelIndices(xs, xLabels, 0, width) : [];
  const showLegend = legend ?? series.length > 1;
  const kind = isArea ? (isStacked ? (expand ? "vùng chồng 100%" : "vùng chồng") : "vùng") : "đường";
  const summary =
    ariaLabel ??
    `Biểu đồ ${kind}: ${n} điểm${n ? ` từ ${xLong[0]} đến ${xLong[n - 1]}` : ""}, ${
      series.length === 1 ? series[0]?.label ?? "" : `${series.length} chuỗi (${series.map((s) => s.label).join(", ")})`
    }. Dùng phím mũi tên để duyệt từng mốc.`;

  // Chỉ dựng khi bảng đang bật: hàng của mọi điểm dữ liệu được định dạng lại mỗi lần biểu đồ render.
  const table = () => (
    <ChartTable
      caption={summary}
      columns={[
        { key: "__index", label: indexLabel ?? (isTime ? "Thời gian" : "Danh mục") },
        ...series.map((s) => ({ key: s.key, label: s.label, numeric: true })),
      ]}
      rows={allData.map((d, r) => ({
        key: String(r),
        header: xLongAll[r],
        cells: series.map((s) => {
          const v = toNumber(d[s.key]);
          return v == null ? "—" : fmt(v);
        }),
      }))}
    />
  );

  /* ---------- dải tổng quan (toàn bộ dữ liệu) ---------- */
  const overview = brush
    ? stackValues(
        vis.map((v) => allData.map((d) => toNumber(d[v.s.key]))),
        isStacked,
        expand ? "expand" : "none",
      )
    : [];
  const allTimes = rawAll.map(timeOf);
  const finiteTimes = allTimes.filter(Number.isFinite);
  const atMin = finiteTimes.length ? Math.min(...finiteTimes) : 0;
  const atMax = finiteTimes.length ? Math.max(...finiteTimes) : 0;
  const brushPositions =
    brush && isTime && atMax > atMin && finiteTimes.length === allTimes.length ? allTimes.map((t) => (t - atMin) / (atMax - atMin)) : undefined;

  const activeTop = activePoints.length ? Math.min(...activePoints.map((p) => y(p.value))) : top;
  const activeBottom = activePoints.length ? Math.max(...activePoints.map((p) => y(p.value))) : top;

  return (
    <ChartContainer
      ref={forwardedRef}
      title={title}
      description={description}
      toolbar={toolbar}
      hideTableToggle={hideTableToggle}
      defaultShowTable={defaultShowTable}
      className={className}
      table={table}
      legend={
        showLegend ? (
          <ChartLegend
            shape={isArea ? "rect" : "line"}
            textured={textured}
            onToggle={series.length > 1 ? toggleSeries : undefined}
            items={series.map((s, i) => ({ key: s.key, label: s.label, slot: slotFor(s.key, slots[i]), hidden: hidden.has(s.key) }))}
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
            aria-roledescription="biểu đồ"
            className="block overflow-visible"
            onPointerLeave={() => setActive((a) => (a?.kb ? a : null))}
          >
            <GridLines ticks={ticks} scale={y} from={left} to={left + plotW} orientation="horizontal" skip={clamp(0, d0, d1)} />
            <ValueAxisLeft ticks={ticks} scale={y} x={left - 8} format={axisFmt} />
            <CategoryAxisBottom positions={xs} labels={xLabels} indices={xLabelIdx} y={top + plotH + 8} minX={0} maxX={width} />

            {isArea && (
              <g aria-hidden className={cn(animate && "animate-fade-in", "motion-reduce:animate-none")}>
                {shapes.map((s) => (
                  <path key={s.v.s.key} d={s.area} style={{ fill: slotVar(s.v.slot), fillOpacity: "var(--chartAreaOpacity)" }} />
                ))}
              </g>
            )}

            <Baseline x1={left} x2={left + plotW} y1={baseY} y2={baseY} />

            <g aria-hidden fill="none">
              {shapes.map((s) => {
                const dash = slotDash(s.v.slot, textured);
                return (
                  <path
                    key={s.v.s.key}
                    d={s.line}
                    pathLength={dash ? undefined : 1}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={dash}
                    className={cn(animate && (dash ? "animate-fade-in" : "animate-chart-draw [stroke-dasharray:1]"), "motion-reduce:animate-none")}
                    style={{ stroke: slotVar(s.v.slot) }}
                  />
                );
              })}
            </g>

            {markers && (
              <g aria-hidden>
                {shapes.map((s) =>
                  upper[s.k].map((u, r) =>
                    u == null ? null : (
                      <circle
                        key={`${s.v.s.key}-${r}`}
                        cx={xs[r]}
                        cy={y(u)}
                        r={4}
                        strokeWidth={2}
                        style={{ fill: slotVar(s.v.slot), stroke: "var(--colorChartSurface)" }}
                      />
                    ),
                  ),
                )}
              </g>
            )}

            {showEnd && !endCollide && (
              <g aria-hidden>
                {endLabelItems.map((l) => (
                  <text key={l.key} x={l.x + 8} y={l.y} dy="0.32em" className="fill-foreground-2 text-caption1 tabular-nums">
                    {l.text}
                  </text>
                ))}
              </g>
            )}

            {activeCol && (
              <g aria-hidden pointerEvents="none">
                <line
                  x1={Math.round(activeCol.x) + 0.5}
                  x2={Math.round(activeCol.x) + 0.5}
                  y1={top}
                  y2={top + plotH}
                  strokeWidth={1}
                  style={{ stroke: "var(--colorChartCrosshair)" }}
                />
                {activePoints.map((p) => (
                  <circle
                    key={p.v.s.key}
                    cx={activeCol.x}
                    cy={y(p.value)}
                    r={5}
                    strokeWidth={2}
                    style={{ fill: slotVar(p.v.slot), stroke: "var(--colorChartSurface)" }}
                  />
                ))}
                {active?.kb && <ChartFocusRing x={activeCol.x - 7} y={activeTop - 7} width={14} height={activeBottom - activeTop + 14} radius={6} />}
              </g>
            )}

            <g>
              {columns.map((c) => (
                <rect
                  key={c.i}
                  x={c.x0}
                  y={top}
                  width={Math.max(0, c.x1 - c.x0)}
                  height={plotH}
                  role="img"
                  aria-label={`${xLong[c.i]}: ${rowsAt(c.i)
                    .map((row) => `${row.label} ${row.value}`)
                    .join(", ")}`}
                  className="cursor-crosshair outline-none"
                  style={{ fill: "transparent" }}
                  {...roving.pointProps(c.i)}
                />
              ))}
            </g>
          </svg>
        )}
        {activeCol && (
          <ChartTooltip x={activeCol.x} y={activeTop} title={xLong[activeCol.i]} rows={rowsAt(activeCol.i)} textured={textured} />
        )}
      </PlotArea>
      {brush && nAll > 2 && (
        <ChartBrush
          count={nAll}
          positions={brushPositions}
          labels={xLongAll}
          value={[ds, de]}
          onValueChange={setDomain}
          lines={overview.map((st, k) => ({ key: vis[k].s.key, slot: vis[k].slot, values: st.upper }))}
        />
      )}
    </ChartContainer>
  );
}

/** LineChart — xu hướng theo thời gian / danh mục, nhiều chuỗi, crosshair + tooltip, nhãn cuối đường. */
export const LineChart = React.forwardRef<HTMLElement, LineChartProps>(function LineChart(props, ref) {
  return <SeriesChart {...props} variant="line" forwardedRef={ref} />;
});

/** AreaChart — như LineChart kèm lớp phủ ~10% dưới đường; `stacked` cho phần–tổng theo thời gian. */
export const AreaChart = React.forwardRef<HTMLElement, AreaChartProps>(function AreaChart(props, ref) {
  return <SeriesChart {...props} variant="area" forwardedRef={ref} />;
});
