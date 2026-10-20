import * as React from "react";
import { DataTrending20Filled, DataTrending20Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { ChartContainer, ChartFocusRing, ChartLegend, ChartTable, ChartTooltip, type ChartTooltipRow } from "./ChartParts";
import { Baseline, GridLines, PlotArea, ValueAxisBottom, ValueAxisLeft, axisTextClass } from "./cartesian";
import {
  CHART_PALETTE_SIZE,
  chartUid,
  clamp,
  linearScale,
  makeAxisFormatter,
  makeNumberFormatter,
  measureText,
  niceTicks,
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
} from "./chartUtils";
import { MARKER_SHAPES, bubbleRadius, linearRegression, markerPath, nearestPoint, type LinearFit, type MarkerShape } from "./chartMath";

export type ScatterXFormat = Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | ((value: number | Date) => string);

export interface ScatterChartProps extends ChartFrameProps {
  data: ChartDatum[];
  /** Trường trục X — số, hoặc Date (thời gian). */
  x: string;
  /** Trường trục Y (số). Chỉ một trục Y. */
  y: string;
  /** Trường kích thước → bong bóng; bán kính theo diện tích (√), kẹp trong 5…`maxRadius` px. */
  size?: string;
  /** Trường nhóm (chuỗi) — mỗi giá trị là một chuỗi màu. Nhóm thứ 9 trở đi gộp vào "Khác". */
  group?: string;
  /** Thứ tự / nhãn / màu của các nhóm (`key` = giá trị của trường `group`). Mặc định theo thứ tự xuất hiện. */
  series?: ChartSeries[];
  /** Trường tên điểm (tiêu đề tooltip, cột đầu của bảng). */
  label?: string;
  /** Tên đại lượng của X / Y / kích thước — dùng trong tooltip, bảng và mô tả truy cập. */
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  /** Mặc định tự nhận: có Date → "time". */
  xType?: "number" | "time";
  /** Định dạng X (số hoặc ngày). */
  xFormat?: ScatterXFormat;
  /** Định dạng Y. */
  valueFormat?: ChartNumberFormat;
  axisFormat?: ChartNumberFormat;
  sizeFormat?: ChartNumberFormat;
  /** Trục Y bắt đầu từ 0. */
  includeZero?: boolean;
  /** Bán kính bong bóng lớn nhất (px). */
  maxRadius?: number;
  /** Phân biệt nhóm bằng hình marker (tròn, vuông, thoi, tam giác…). Mặc định bật khi có hoa văn hoặc > 3 nhóm. */
  shapes?: boolean;
  /** Đường xu hướng bình phương tối thiểu cho mỗi nhóm (có điều khiển). */
  trendLine?: boolean;
  defaultTrendLine?: boolean;
  onTrendLineChange?: (on: boolean) => void;
  /** Ẩn nút bật/tắt "Xu hướng" trên thanh công cụ. */
  hideTrendToggle?: boolean;
  /** Mặc định hiện khi ≥ 2 nhóm. */
  legend?: boolean;
}

interface Group {
  key: string;
  label: string;
  slot: ChartSlot;
  shape: MarkerShape;
}

interface ScatterPoint {
  row: number;
  group: Group;
  xv: number;
  yv: number;
  sv: number | null;
  name: string;
}

const OTHER_KEY = "__other";
const SINGLE_KEY = "__all";

/** Ô swatch là hình marker — legend / tooltip khớp hình trên biểu đồ. */
function MarkerSwatch({ slot, shape }: { slot: ChartSlot; shape: MarkerShape }) {
  return (
    <svg width={12} height={12} aria-hidden className="shrink-0 overflow-visible">
      <path d={markerPath(shape, 6, 6, 5)} style={{ fill: slotVar(slot) }} />
    </svg>
  );
}

/** Vạch chia thời gian cách đều (không "tròn") cho trục X kiểu Date. */
function timeTicks(min: number, max: number, count: number): number[] {
  if (!(max > min)) return [min];
  const k = Math.max(1, count);
  return Array.from({ length: k + 1 }, (_, i) => min + ((max - min) * i) / k);
}

/**
 * ScatterChart — quan hệ giữa hai đại lượng số (hoặc thời gian × số); tuỳ chọn bong bóng (`size`) và nhóm (`group`).
 * Marker ≥ 8px có viền bề mặt 2px để tách điểm chồng; tooltip theo điểm gần con trỏ nhất; bàn phím: Tab vào biểu đồ,
 * mũi tên duyệt các điểm theo thứ tự X. Có đường xu hướng (bình phương tối thiểu) bật/tắt được.
 */
export const ScatterChart = React.forwardRef<HTMLElement, ScatterChartProps>(function ScatterChart(
  {
    data,
    x,
    y,
    size,
    group,
    series,
    label,
    xLabel,
    yLabel,
    sizeLabel,
    xType,
    xFormat,
    valueFormat,
    axisFormat,
    sizeFormat,
    includeZero,
    maxRadius = 24,
    shapes,
    trendLine,
    defaultTrendLine = false,
    onTrendLineChange,
    hideTrendToggle,
    legend,
    title,
    description,
    toolbar,
    height = 320,
    locale = "vi-VN",
    ariaLabel,
    indexLabel,
    hideTableToggle,
    defaultShowTable,
    texture,
    animate = true,
    className,
  },
  ref,
) {
  const uid = chartUid(React.useId());
  const textured = useChartTexture(texture);
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(null);
  const [innerTrend, setInnerTrend] = React.useState(defaultTrendLine);
  const trendOn = trendLine ?? innerTrend;
  const setTrend = (on: boolean) => {
    if (trendLine === undefined) setInnerTrend(on);
    onTrendLineChange?.(on);
  };

  const isTime = xType ? xType === "time" : data.some((d) => d[x] instanceof Date);
  const xName = xLabel ?? x;
  const yName = yLabel ?? y;
  const sName = sizeLabel ?? size ?? "";
  const fmtY = makeNumberFormatter(locale, valueFormat);
  const fmtS = makeNumberFormatter(locale, sizeFormat);
  const fmtX = React.useMemo(() => {
    if (typeof xFormat === "function") return (v: number) => xFormat(isTime ? new Date(v) : v);
    if (isTime) {
      const f = new Intl.DateTimeFormat(locale, (xFormat as Intl.DateTimeFormatOptions | undefined) ?? { day: "numeric", month: "numeric", year: "numeric" });
      return (v: number) => f.format(new Date(v));
    }
    return makeNumberFormatter(locale, xFormat as Intl.NumberFormatOptions | undefined);
  }, [xFormat, isTime, locale]);

  /* ---------- nhóm: thứ tự cố định, nhóm thứ 9+ (không gán màu) gộp vào "Khác" ---------- */
  const groups = React.useMemo(() => {
    const list: Group[] = [];
    const byValue = new Map<string, Group>();
    if (!group) {
      const g: Group = { key: SINGLE_KEY, label: yName, slot: 1, shape: "circle" };
      return { list: [g], of: () => g };
    }
    const order: ChartSeries[] = [...(series ?? [])];
    for (const d of data) {
      const v = d[group];
      const k = v == null ? "" : String(v);
      if (!order.some((s) => s.key === k)) order.push({ key: k, label: k || "—" });
    }
    let other: Group | undefined;
    order.forEach((s, i) => {
      if (s.color || i < CHART_PALETTE_SIZE) {
        const g: Group = { key: s.key, label: s.label, slot: slotOf(s.color, i), shape: MARKER_SHAPES[list.length % MARKER_SHAPES.length] };
        list.push(g);
        byValue.set(s.key, g);
      } else {
        other ??= { key: OTHER_KEY, label: "Khác", slot: "other", shape: MARKER_SHAPES[list.length % MARKER_SHAPES.length] };
        byValue.set(s.key, other);
      }
    });
    if (other) list.push(other);
    return { list, of: (d: ChartDatum) => byValue.get(d[group] == null ? "" : String(d[group])) ?? list[0] };
  }, [data, group, series, yName]);

  const [hidden, toggleGroup] = useSeriesToggle(React.useMemo(() => groups.list.map((g) => g.key), [groups]));
  const useShapes = shapes ?? (textured || (!size && groups.list.length > 3));
  const shapeOf = (g: Group): MarkerShape => (useShapes ? g.shape : "circle");

  /* ---------- điểm ---------- */
  const allPoints: ScatterPoint[] = [];
  data.forEach((d, row) => {
    const rx = d[x];
    const xv = rx instanceof Date ? +rx : toNumber(rx);
    const yv = toNumber(d[y]);
    if (xv == null || !Number.isFinite(xv) || yv == null) return;
    const g = groups.of(d);
    const name = label && d[label] != null ? String(d[label]) : "";
    allPoints.push({ row, group: g, xv, yv, sv: size ? toNumber(d[size]) : null, name });
  });
  // Thứ tự X (rồi Y) — thứ tự duyệt bằng bàn phím.
  const points = allPoints.filter((p) => !hidden.has(p.group.key)).sort((a, b) => a.xv - b.xv || a.yv - b.yv);
  const n = points.length;

  /* ---------- thang đo ---------- */
  const xsRaw = allPoints.map((p) => p.xv);
  const ysRaw = allPoints.map((p) => p.yv);
  let yLo = ysRaw.length ? Math.min(...ysRaw) : 0;
  let yHi = ysRaw.length ? Math.max(...ysRaw) : 1;
  if (includeZero) {
    yLo = Math.min(0, yLo);
    yHi = Math.max(0, yHi);
  }
  const xLo = xsRaw.length ? Math.min(...xsRaw) : 0;
  const xHi = xsRaw.length ? Math.max(...xsRaw) : 1;
  const maxSize = Math.max(0, ...allPoints.map((p) => p.sv ?? 0));
  // r = 5 + viền bề mặt 2px (nửa trong đè lên mark) → phần màu nhìn thấy vẫn ≥ 8px.
  const radiusOf = (p: ScatterPoint) => (size ? bubbleRadius(p.sv ?? 0, maxSize, maxRadius, 5) : 5);

  const top = 8 + (size ? Math.min(maxRadius, 12) : 0);
  const bottom = 28;
  const plotH = Math.max(0, height - top - bottom);
  const yTicks = niceTicks(yLo, yHi, clamp(Math.round(plotH / 56), 2, 8));
  const yd0 = yTicks[0];
  const yd1 = yTicks[yTicks.length - 1];
  const axisFmtY = makeAxisFormatter(
    locale,
    axisFormat ?? valueFormat,
    Math.max(Math.abs(yd0), Math.abs(yd1)),
    yTicks.length > 1 ? yTicks[1] - yTicks[0] : 0,
  );
  const left = Math.ceil(Math.max(0, ...yTicks.map((t) => measureText(axisFmtY(t))))) + 8;
  const xTickCount = clamp(Math.round(width / 110), 2, 8);
  const xTicks = isTime ? timeTicks(xLo, xHi, Math.min(xTickCount, 5)) : niceTicks(xLo, xHi, xTickCount);
  const xd0 = xTicks[0];
  const xd1 = xTicks[xTicks.length - 1];
  const axisFmtX = isTime || typeof xFormat === "function" ? fmtX : makeAxisFormatter(locale, xFormat as Intl.NumberFormatOptions | undefined, Math.max(Math.abs(xd0), Math.abs(xd1)), xTicks.length > 1 ? xTicks[1] - xTicks[0] : 0);
  const lastXW = measureText(axisFmtX(xd1)) / 2;
  const right = Math.max(12, Math.ceil(lastXW) + 4, size ? Math.min(maxRadius, 12) : 0);
  const plotW = Math.max(0, width - left - right);
  const pad = isTime ? 8 : 0;
  const sx = linearScale([xd0, xd1 === xd0 ? xd0 + 1 : xd1], [left + pad, left + plotW - pad]);
  const sy = linearScale([yd0, yd1], [top + plotH, top]);

  const screen = points.map((p) => ({ x: sx(p.xv), y: sy(p.yv), r: radiusOf(p) }));

  /* ---------- xu hướng ---------- */
  const fits: { g: Group; fit: LinearFit; x0: number; x1: number }[] = [];
  if (trendOn) {
    for (const g of groups.list) {
      if (hidden.has(g.key)) continue;
      const pts = points.filter((p) => p.group === g);
      const fit = linearRegression(pts.map((p) => [p.xv, p.yv] as const));
      if (fit) fits.push({ g, fit, x0: Math.min(...pts.map((p) => p.xv)), x1: Math.max(...pts.map((p) => p.xv)) });
    }
  }

  /* ---------- tương tác ---------- */
  const roving = useRovingPoints(n, (i, kb) => setActive(i === null ? null : { i, kb }));
  const activeIdx = active && active.i < n && width > 0 ? active.i : -1;
  const activePoint = activeIdx >= 0 ? points[activeIdx] : undefined;
  const activeScreen = activeIdx >= 0 ? screen[activeIdx] : undefined;

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (active?.kb) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;
    if (px < left - 8 || px > left + plotW + 8 || py < top - 8 || py > top + plotH + 8) {
      setActive(null);
      return;
    }
    const i = nearestPoint(screen, px, py);
    setActive(i < 0 ? null : { i, kb: false });
  };

  const multi = groups.list.length > 1;
  const pointTitle = (p: ScatterPoint) => p.name || (multi ? p.group.label : "");
  const rowsOf = (p: ScatterPoint): ChartTooltipRow[] => {
    const rows: ChartTooltipRow[] = [];
    if (multi && p.name) rows.push({ key: "g", label: p.group.label, value: "", slot: p.group.slot, swatch: <MarkerSwatch slot={p.group.slot} shape={shapeOf(p.group)} /> });
    rows.push({ key: "x", label: xName, value: fmtX(p.xv) });
    rows.push({ key: "y", label: yName, value: fmtY(p.yv) });
    if (size) rows.push({ key: "s", label: sName, value: p.sv == null ? "—" : fmtS(p.sv) });
    return rows;
  };
  const pointAria = (p: ScatterPoint) =>
    [pointTitle(p), ...rowsOf(p).filter((r) => r.key !== "g").map((r) => `${r.label} ${r.value}`)].filter(Boolean).join(", ");

  const trendText = fits.length
    ? ` Đường xu hướng: ${fits
        .map(({ g, fit }) => `${multi ? `${g.label} ` : ""}hệ số góc ${fmtY(fit.slope)}, R² ${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(fit.r2)}`)
        .join("; ")}.`
    : "";
  const summary =
    ariaLabel ??
    `Biểu đồ phân tán: ${allPoints.length} điểm, ${xName} theo ${yName}${size ? `, kích thước theo ${sName}` : ""}${
      multi ? `, ${groups.list.length} nhóm (${groups.list.map((g) => g.label).join(", ")})` : ""
    }. Dùng phím mũi tên để duyệt các điểm theo thứ tự ${xName}.${trendText}`;

  const table = (
    <ChartTable
      caption={summary}
      columns={[
        { key: "__index", label: indexLabel ?? (label ? "Tên" : "#") },
        ...(group ? [{ key: "__group", label: "Nhóm" }] : []),
        { key: "__x", label: xName, numeric: true },
        { key: "__y", label: yName, numeric: true },
        ...(size ? [{ key: "__s", label: sName, numeric: true }] : []),
      ]}
      rows={allPoints.map((p, k) => ({
        key: String(p.row),
        header: p.name || String(k + 1),
        cells: [
          ...(group ? [p.group.label] : []),
          fmtX(p.xv),
          fmtY(p.yv),
          ...(size ? [p.sv == null ? "—" : fmtS(p.sv)] : []),
        ],
      }))}
    />
  );

  const showLegend = legend ?? multi;
  const trendToggle = hideTrendToggle ? null : (
    <ToggleButton
      size="small"
      appearance="subtle"
      icon={<DataTrending20Regular />}
      checkedIcon={<DataTrending20Filled />}
      checked={trendOn}
      onCheckedChange={setTrend}
    >
      Xu hướng
    </ToggleButton>
  );

  // Bong bóng lớn vẽ trước để bong bóng nhỏ nằm trên.
  const drawOrder = points.map((_, i) => i).sort((a, b) => screen[b].r - screen[a].r);

  return (
    <ChartContainer
      ref={ref}
      title={title}
      description={description}
      toolbar={
        toolbar !== undefined || trendToggle ? (
          <>
            {toolbar}
            {trendToggle}
          </>
        ) : undefined
      }
      hideTableToggle={hideTableToggle}
      defaultShowTable={defaultShowTable}
      className={className}
      table={table}
      legend={
        showLegend ? (
          <ChartLegend
            textured={textured}
            onToggle={multi ? toggleGroup : undefined}
            items={groups.list.map((g) => ({
              key: g.key,
              label: g.label,
              slot: g.slot,
              hidden: hidden.has(g.key),
              swatch: useShapes ? <MarkerSwatch slot={g.slot} shape={g.shape} /> : undefined,
            }))}
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
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive((a) => (a?.kb ? a : null))}
          >
            <defs>
              <clipPath id={`${uid}-clip`}>
                <rect x={left} y={top} width={plotW} height={plotH} />
              </clipPath>
            </defs>
            <GridLines ticks={yTicks} scale={sy} from={left} to={left + plotW} orientation="horizontal" skip={yd0} />
            <GridLines ticks={isTime ? [] : xTicks} scale={sx} from={top} to={top + plotH} orientation="vertical" skip={xd0} />
            <ValueAxisLeft ticks={yTicks} scale={sy} x={left - 8} format={axisFmtY} />
            <ValueAxisBottom ticks={xTicks} scale={sx} y={top + plotH + 8} format={axisFmtX} />
            <Baseline x1={left} x2={left + plotW} y1={top + plotH} y2={top + plotH} />
            <Baseline x1={left} x2={left} y1={top} y2={top + plotH} />

            {fits.length > 0 && (
              <g aria-hidden clipPath={`url(#${uid}-clip)`} fill="none">
                {fits.map(({ g, fit, x0, x1 }) => (
                  <line
                    key={g.key}
                    x1={sx(x0)}
                    x2={sx(x1)}
                    y1={sy(fit.predict(x0))}
                    y2={sy(fit.predict(x1))}
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    className={cn(animate && "animate-fade-in", "motion-reduce:animate-none")}
                    style={{ stroke: multi ? slotVar(g.slot) : "var(--colorChartCrosshair)" }}
                  />
                ))}
              </g>
            )}

            <g className={cn(animate && "animate-fade-in", "motion-reduce:animate-none")}>
              {drawOrder.map((i) => {
                const p = points[i];
                const s = screen[i];
                return (
                  <path
                    key={`${p.group.key}-${p.row}`}
                    d={markerPath(shapeOf(p.group), s.x, s.y, s.r)}
                    role="img"
                    aria-label={pointAria(p)}
                    strokeWidth={2}
                    className="outline-none"
                    style={{ fill: slotVar(p.group.slot), stroke: "var(--colorChartSurface)" }}
                    {...roving.pointProps(i)}
                  />
                );
              })}
            </g>

            {activePoint && activeScreen && (
              <g aria-hidden pointerEvents="none">
                <path
                  d={markerPath(shapeOf(activePoint.group), activeScreen.x, activeScreen.y, activeScreen.r + 1)}
                  strokeWidth={2}
                  style={{ fill: slotVar(activePoint.group.slot), stroke: "var(--colorChartLabelStrong)" }}
                />
                {active?.kb && (
                  <ChartFocusRing
                    x={activeScreen.x - activeScreen.r - 2}
                    y={activeScreen.y - activeScreen.r - 2}
                    width={2 * activeScreen.r + 4}
                    height={2 * activeScreen.r + 4}
                    radius={activeScreen.r + 2}
                  />
                )}
              </g>
            )}

            {n === 0 && (
              <text x={left + plotW / 2} y={top + plotH / 2} textAnchor="middle" className={axisTextClass}>
                Không có dữ liệu
              </text>
            )}
          </svg>
        )}
        {activePoint && activeScreen && (
          <ChartTooltip
            x={activeScreen.x}
            y={activeScreen.y - activeScreen.r}
            title={pointTitle(activePoint) || undefined}
            rows={rowsOf(activePoint)}
            textured={textured}
          />
        )}
      </PlotArea>
    </ChartContainer>
  );
});
