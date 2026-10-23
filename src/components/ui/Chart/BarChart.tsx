import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { chartMessages } from "./messages";
import { ChartContainer, ChartFocusRing, ChartLegend, ChartPatterns, ChartTable, ChartTooltip, type ChartTooltipRow } from "./ChartParts";
import {
  Baseline,
  CategoryAxisBottom,
  GridLines,
  PlotArea,
  ValueAxisBottom,
  ValueAxisLeft,
  axisTextClass,
  formatCategory,
  pickLabelIndices,
} from "./cartesian";
import {
  barPath,
  chartUid,
  clamp,
  fitText,
  linearScale,
  makeAxisFormatter,
  makeNumberFormatter,
  measureText,
  niceTicks,
  slotFill,
  slotOf,
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
} from "./chartUtils";

export interface BarChartProps extends ChartFrameProps {
  data: ChartDatum[];
  /** Trường danh mục trong mỗi dòng (trục X của cột, trục Y của thanh ngang). */
  index: string;
  series: ChartSeries[];
  /** vertical = cột, horizontal = thanh ngang (hợp với nhiều danh mục / tên dài). */
  orientation?: "vertical" | "horizontal";
  /** grouped = cạnh nhau, stacked = chồng (phần–tổng). */
  layout?: "grouped" | "stacked";
  /** Định dạng giá trị (tooltip, bảng, nhãn) — Intl.NumberFormatOptions hoặc hàm. */
  valueFormat?: ChartNumberFormat;
  /** Định dạng nhãn trục; mặc định rút gọn từ 1.000 (1 N, 2 Tr…). */
  axisFormat?: ChartNumberFormat;
  categoryFormat?: (value: ChartValue) => string;
  /** Hiện giá trị ở đầu cột (chỉ khi vừa chỗ — không bao giờ bị cắt). Stacked: hiện tổng. */
  showValues?: boolean;
  /** Một chuỗi: tô âm / dương bằng cặp màu phân kỳ. */
  diverging?: boolean;
  /** Mặc định hiện khi ≥ 2 chuỗi. */
  legend?: boolean;
  /** Độ dày tối đa của cột (px). */
  barSize?: number;
}

interface Mark {
  key: string;
  row: number;
  hit: number;
  slot: ChartSlot;
  path: string;
  box: { x: number; y: number; w: number; h: number };
}

interface Hit {
  key: string;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  anchor: [number, number];
  label: string;
  title: string;
  rows: ChartTooltipRow[];
  ring: { x: number; y: number; w: number; h: number } | null;
}

interface ValueLabel {
  key: string;
  x: number;
  y: number;
  text: string;
  anchor: "start" | "middle" | "end";
  dy: string;
}

/** BarChart — cột / thanh ngang, nhóm hoặc chồng, hỗ trợ giá trị âm. SVG viết tay, không thư viện. */
export const BarChart = React.forwardRef<HTMLElement, BarChartProps>(function BarChart(
  {
    data,
    index,
    series,
    orientation = "vertical",
    layout = "grouped",
    valueFormat,
    axisFormat,
    categoryFormat,
    showValues = false,
    diverging = false,
    legend,
    barSize = 24,
    title,
    description,
    toolbar,
    height,
    locale: localeProp,
    ariaLabel,
    indexLabel: indexLabelProp,
    hideTableToggle,
    defaultShowTable,
    texture,
    animate = true,
    className,
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("chart", chartMessages);
  const indexLabel = indexLabelProp ?? msg.category;
  const totalLabel = msg.total;
  const textured = useChartTexture(texture);
  const uid = chartUid(React.useId());
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [hidden, toggleSeries] = useSeriesToggle(series.map((s) => s.key));
  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(null);

  const horizontal = orientation === "horizontal";
  const stacked = layout === "stacked" && series.length > 1;
  const single = series.length === 1;
  const useDiverging = diverging && single;
  const showLegend = legend ?? series.length > 1;
  const fmt = makeNumberFormatter(locale, valueFormat);
  const n = data.length;
  const catLabels = data.map((d) => (categoryFormat ? categoryFormat(d[index]) : formatCategory(d[index], locale)));
  const slots = series.map((s, i) => slotOf(s.color, i));
  const vis = series.map((s, i) => ({ s, slot: slots[i] })).filter((v) => !hidden.has(v.s.key));
  const val = (r: number, key: string) => toNumber(data[r]?.[key]);

  /* ---------- miền giá trị (luôn gồm 0) ---------- */
  let lo = 0;
  let hi = 0;
  const totals: { pos: number; neg: number }[] = [];
  for (let r = 0; r < n; r++) {
    let pos = 0;
    let neg = 0;
    for (const v of vis) {
      const x = val(r, v.s.key);
      if (x == null) continue;
      if (stacked) {
        if (x >= 0) pos += x;
        else neg += x;
      } else {
        hi = Math.max(hi, x);
        lo = Math.min(lo, x);
      }
    }
    totals.push({ pos, neg });
    if (stacked) {
      hi = Math.max(hi, pos);
      lo = Math.min(lo, neg);
    }
  }

  /* ---------- bố cục ---------- */
  const groupCount = stacked ? 1 : Math.max(1, vis.length);
  const H = height ?? (horizontal ? Math.max(160, n * Math.max(28, groupCount * Math.min(barSize, 16) + (groupCount - 1) * 2 + 16) + 36) : 280);
  const top = 8 + (showValues && !horizontal ? 14 : 0);
  const bottom = 28;
  const plotH = Math.max(0, H - top - bottom);

  const catLabelW = horizontal ? Math.min(Math.ceil(Math.max(0, ...catLabels.map((l) => measureText(l)))) + 12, Math.max(56, width * 0.35)) : 0;
  const tickCount = horizontal ? clamp(Math.round((width - catLabelW) / 96), 2, 8) : clamp(Math.round(plotH / 56), 2, 8);
  const ticks = niceTicks(lo, hi, tickCount);
  const d0 = ticks[0];
  const d1 = ticks[ticks.length - 1];
  const axisFmt = makeAxisFormatter(locale, axisFormat ?? valueFormat, Math.max(Math.abs(d0), Math.abs(d1)), ticks.length > 1 ? ticks[1] - ticks[0] : 0);
  const tickLabels = ticks.map(axisFmt);
  const maxTickW = Math.max(0, ...tickLabels.map((t) => measureText(t)));

  let left: number;
  let right: number;
  if (horizontal) {
    const valueLabelW = showValues
      ? Math.max(0, ...data.map((_, r) => measureText(fmt(stacked ? totals[r].pos + totals[r].neg : Math.max(0, ...vis.map((v) => val(r, v.s.key) ?? 0))))))
      : 0;
    left = catLabelW;
    right = Math.max(8, measureText(tickLabels[tickLabels.length - 1]) / 2 + 2, showValues ? valueLabelW + 8 : 0);
  } else {
    left = Math.ceil(maxTickW) + 8;
    right = 8;
  }
  const plotW = Math.max(0, width - left - right);

  const vScale = horizontal ? linearScale([d0, d1], [left, left + plotW]) : linearScale([d0, d1], [top + plotH, top]);
  const zero = vScale(0);
  const band = n ? (horizontal ? plotH : plotW) / n : 0;
  const center = (r: number) => (horizontal ? top : left) + band * (r + 0.5);
  const thick = stacked || vis.length <= 1 ? Math.max(2, Math.min(barSize, band * 0.6)) : Math.max(2, Math.min(barSize, (band * 0.72 - (vis.length - 1) * 2) / vis.length));
  const groupW = stacked ? thick : vis.length * thick + Math.max(0, vis.length - 1) * 2;

  /** Đặt một cột từ v0 (phía gốc) tới v1 (phía đầu dữ liệu), lùi `inset` px ở phía gốc (khe 2px giữa các đoạn chồng). */
  const place = (c: number, off: number, v0: number, v1: number, round: boolean, inset: number) => {
    const positive = v1 >= v0;
    const a = vScale(v0);
    const b = vScale(v1);
    let x: number;
    let y: number;
    let w: number;
    let h: number;
    let end: "top" | "bottom" | "left" | "right" | "none";
    if (horizontal) {
      y = c + off;
      h = thick;
      if (positive) {
        x = a + inset;
        w = b - a - inset;
        end = "right";
      } else {
        x = b;
        w = a - b - inset;
        end = "left";
      }
    } else {
      x = c + off;
      w = thick;
      if (positive) {
        y = b;
        h = a - b - inset;
        end = "top";
      } else {
        y = a + inset;
        h = b - a - inset;
        end = "bottom";
      }
    }
    w = Math.max(0, w);
    h = Math.max(0, h);
    return { path: barPath(x, y, w, h, 4, round ? end : "none"), box: { x, y, w, h } };
  };

  const marks: Mark[] = [];
  const hits: Hit[] = [];
  const valueLabels: ValueLabel[] = [];
  const plotBox = { x: left, y: top, w: plotW, h: plotH };

  const labelAt = (c: number, off: number, v: number, text: string, room: number): ValueLabel | null => {
    const tw = measureText(text);
    if (horizontal) {
      const end = vScale(v);
      return { key: "", x: v >= 0 ? end + 6 : end - 6, y: c + off + thick / 2, text, anchor: v >= 0 ? "start" : "end", dy: "0.32em" };
    }
    if (tw > room) return null;
    const end = vScale(v);
    return { key: "", x: c + off + thick / 2, y: v >= 0 ? end - 6 : end + 6, text, anchor: "middle", dy: v >= 0 ? "0" : "0.71em" };
  };

  if (width > 0 && n > 0) {
    for (let r = 0; r < n; r++) {
      const c = center(r);
      const cat = catLabels[r];
      if (stacked) {
        const segs: { v: (typeof vis)[number]; v0: number; v1: number; inset: number }[] = [];
        let p = 0;
        let q = 0;
        for (const v of vis) {
          const x = val(r, v.s.key);
          if (!x) continue;
          if (x > 0) {
            segs.push({ v, v0: p, v1: p + x, inset: p > 0 ? 2 : 0 });
            p += x;
          } else {
            segs.push({ v, v0: q, v1: q + x, inset: q < 0 ? 2 : 0 });
            q += x;
          }
        }
        const lastPos = segs.reduce((acc, s, i) => (s.v1 > s.v0 ? i : acc), -1);
        const lastNeg = segs.reduce((acc, s, i) => (s.v1 < s.v0 ? i : acc), -1);
        const hitIndex = hits.length;
        const boxes: Mark["box"][] = [];
        segs.forEach((s, i) => {
          const m = place(c, -thick / 2, s.v0, s.v1, i === lastPos || i === lastNeg, s.inset);
          if (!m.path) return;
          boxes.push(m.box);
          marks.push({ key: `${r}-${s.v.s.key}`, row: r, hit: hitIndex, slot: s.v.slot, ...m });
        });
        const total = totals[r].pos + totals[r].neg;
        const rows: ChartTooltipRow[] = vis
          .filter((v) => val(r, v.s.key) != null)
          .map((v) => ({ key: v.s.key, label: v.s.label, value: fmt(val(r, v.s.key) as number), slot: v.slot, shape: "rect" as const }));
        rows.push({ key: "__total", label: totalLabel, value: fmt(total) });
        const endV = totals[r].pos > 0 ? totals[r].pos : totals[r].neg;
        const tip = vScale(endV);
        hits.push({
          key: `r${r}`,
          row: r,
          ...(horizontal ? { x: plotBox.x, y: c - band / 2, w: plotBox.w, h: band } : { x: c - band / 2, y: plotBox.y, w: band, h: plotBox.h }),
          anchor: horizontal ? [tip, c - thick / 2] : [c, Math.min(tip, zero)],
          label: `${cat}: ${rows.map((row) => `${row.label} ${row.value}`).join(", ")}`,
          title: cat,
          rows,
          ring: unionBox(boxes),
        });
        if (showValues && segs.length) {
          const l = labelAt(c, -thick / 2, endV, fmt(total), band - 4);
          if (l) valueLabels.push({ ...l, key: `t${r}` });
        }
      } else {
        vis.forEach((v, j) => {
          const x = val(r, v.s.key);
          const off = -groupW / 2 + j * (thick + 2);
          const slot: ChartSlot = useDiverging ? ((x ?? 0) < 0 ? "neg" : "pos") : v.slot;
          const m = x == null ? null : place(c, off, 0, x, true, 0);
          const hitIndex = hits.length;
          if (m?.path) marks.push({ key: `${r}-${v.s.key}`, row: r, hit: hitIndex, slot, ...m });
          const whole = vis.length <= 1;
          const span = whole ? band : thick + 2;
          const start = whole ? c - band / 2 : c + off - 1;
          const valueText = x == null ? "—" : fmt(x);
          hits.push({
            key: `${r}-${v.s.key}`,
            row: r,
            ...(horizontal ? { x: plotBox.x, y: start, w: plotBox.w, h: span } : { x: start, y: plotBox.y, w: span, h: plotBox.h }),
            anchor: horizontal ? [vScale(x ?? 0), c + off] : [c + off + thick / 2, x == null ? zero : Math.min(vScale(x), zero)],
            label: single ? `${cat}: ${valueText}` : `${cat}, ${v.s.label}: ${valueText}`,
            title: cat,
            rows: [{ key: v.s.key, label: v.s.label, value: valueText, slot, shape: "rect" }],
            ring: m?.path ? m.box : null,
          });
          if (showValues && x != null) {
            const l = labelAt(c, off, x, fmt(x), whole ? band - 4 : thick + 2);
            if (l) valueLabels.push({ ...l, key: `v${r}-${v.s.key}` });
          }
        });
      }
    }
  }

  const roving = useRovingPoints(hits.length, (i, kb) => setActive(i === null ? null : { i, kb }));
  const activeHit = active ? hits[active.i] : undefined;

  /* ---------- nhãn trục danh mục ---------- */
  const catPositions = data.map((_, r) => center(r));
  const xLabelIdx = !horizontal && width > 0 ? pickLabelIndices(catPositions, catLabels, left, left + plotW) : [];

  const usedSlots: ChartSlot[] = useDiverging ? ["pos", "neg"] : vis.map((v) => v.slot);
  const summary =
    ariaLabel ?? msg.barSummary({ horizontal, stacked, categories: n, series: series.map((s) => s.label) });

  // Chỉ dựng khi bảng đang bật: hàng của mọi điểm dữ liệu được định dạng lại mỗi lần biểu đồ render.
  const table = () => (
    <ChartTable
      caption={summary}
      columns={[
        { key: "__index", label: indexLabel },
        ...series.map((s) => ({ key: s.key, label: s.label, numeric: true })),
        ...(stacked ? [{ key: "__total", label: totalLabel, numeric: true }] : []),
      ]}
      rows={data.map((d, r) => ({
        key: String(r),
        header: catLabels[r],
        cells: [
          ...series.map((s) => {
            const v = toNumber(d[s.key]);
            return v == null ? "—" : fmt(v);
          }),
          ...(stacked ? [fmt(series.reduce((acc, s) => acc + (toNumber(d[s.key]) ?? 0), 0))] : []),
        ],
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
      legend={
        showLegend ? (
          <ChartLegend
            textured={textured}
            onToggle={series.length > 1 ? toggleSeries : undefined}
            items={series.map((s, i) => ({ key: s.key, label: s.label, slot: slots[i], hidden: hidden.has(s.key) }))}
          />
        ) : undefined
      }
    >
      <PlotArea ref={plotRef} height={H}>
        {width > 0 && (
          <svg
            width={width}
            height={H}
            role="group"
            aria-label={summary}
            aria-roledescription={msg.roleDescription}
            className="block overflow-visible"
            onPointerLeave={() => setActive((a) => (a?.kb ? a : null))}
          >
            {textured && <ChartPatterns prefix={uid} slots={usedSlots} />}

            {horizontal ? (
              <>
                <GridLines ticks={ticks} scale={vScale} from={top} to={top + plotH} orientation="vertical" skip={0} />
                <ValueAxisBottom ticks={ticks} scale={vScale} y={top + plotH + 8} format={axisFmt} />
                <g aria-hidden>
                  {catLabels.map((l, r) => (
                    <text key={r} x={left - 8} y={center(r)} dy="0.32em" textAnchor="end" className={axisTextClass}>
                      {fitText(l, left - 12)}
                    </text>
                  ))}
                </g>
              </>
            ) : (
              <>
                <GridLines ticks={ticks} scale={vScale} from={left} to={left + plotW} orientation="horizontal" skip={0} />
                <ValueAxisLeft ticks={ticks} scale={vScale} x={left - 8} format={axisFmt} />
                <CategoryAxisBottom
                  positions={catPositions}
                  labels={catLabels}
                  indices={xLabelIdx}
                  y={top + plotH + 8}
                  minX={0}
                  maxX={width}
                />
              </>
            )}

            <g
              aria-hidden
              className={cn(animate && (horizontal ? "animate-chart-grow-x" : "animate-chart-grow"), "motion-reduce:animate-none")}
              style={{ transformOrigin: horizontal ? `${zero}px 0px` : `0px ${zero}px` }}
            >
              {marks.map((m) => (
                <path
                  key={m.key}
                  d={m.path}
                  className="transition-opacity duration-faster"
                  style={{
                    fill: slotFill(m.slot, textured, uid),
                    opacity: active && active.i !== m.hit ? "var(--chartDimOpacity)" : undefined,
                  }}
                />
              ))}
            </g>

            {horizontal ? (
              <Baseline x1={zero} x2={zero} y1={top} y2={top + plotH} />
            ) : (
              <Baseline x1={left} x2={left + plotW} y1={zero} y2={zero} />
            )}

            {valueLabels.length > 0 && (
              <g aria-hidden>
                {valueLabels.map((l) => (
                  <text key={l.key} x={l.x} y={l.y} dy={l.dy} textAnchor={l.anchor} className="fill-foreground-2 text-caption1 tabular-nums">
                    {l.text}
                  </text>
                ))}
              </g>
            )}

            {activeHit?.ring && active?.kb && (
              <ChartFocusRing x={activeHit.ring.x} y={activeHit.ring.y} width={activeHit.ring.w} height={activeHit.ring.h} />
            )}

            <g>
              {hits.map((h, i) => (
                <rect
                  key={h.key}
                  x={h.x}
                  y={h.y}
                  width={Math.max(0, h.w)}
                  height={Math.max(0, h.h)}
                  role="img"
                  aria-label={h.label}
                  className="cursor-default outline-none"
                  style={{ fill: "transparent" }}
                  {...roving.pointProps(i)}
                />
              ))}
            </g>
          </svg>
        )}
        {activeHit && (
          <ChartTooltip x={activeHit.anchor[0]} y={activeHit.anchor[1]} title={activeHit.title} rows={activeHit.rows} textured={textured} />
        )}
      </PlotArea>
    </ChartContainer>
  );
});

function unionBox(boxes: { x: number; y: number; w: number; h: number }[]) {
  if (!boxes.length) return null;
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
