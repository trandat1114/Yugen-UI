import * as React from "react";
import { cn } from "@/lib/cn";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { chartMessages } from "./messages";
import { ChartContainer, ChartLegend, ChartPatterns, ChartTable, ChartTooltip } from "./ChartParts";
import {
  chartUid,
  donutSlicePath,
  makeNumberFormatter,
  ringPath,
  slotFill,
  slotOf,
  useChartTexture,
  useRovingPoints,
  type ChartColor,
  type ChartFrameProps,
  type ChartNumberFormat,
  type ChartSlot,
} from "./chartUtils";

export interface DonutDatum {
  label: string;
  value: number;
  /** Ghim ô màu cho thực thể (để màu không đổi khi dữ liệu thay đổi). */
  color?: ChartColor;
}

export interface DonutChartProps extends Omit<ChartFrameProps, "height"> {
  data: DonutDatum[];
  /** Tối đa số lát; phần còn lại gộp vào "Khác" (xám). Không vượt quá 6. */
  maxSlices?: number;
  /** Tên lát gộp. Mặc định lấy từ `messages.chart.other` ("Khác"). */
  otherLabel?: string;
  valueFormat?: ChartNumberFormat;
  /** Nhãn giữa vòng. Mặc định lấy từ `messages.chart.total` ("Tổng"). */
  centerLabel?: React.ReactNode;
  /** Giá trị giữa vòng (mặc định tổng đã định dạng). */
  centerValue?: React.ReactNode;
  /** Đường kính (px). */
  size?: number;
  /** Độ dày vòng (px) — giữ mảnh. */
  thickness?: number;
  /** Legend kèm tỉ lệ bên cạnh vòng (mặc định bật). */
  legend?: boolean;
}

interface Slice {
  key: string;
  label: string;
  value: number;
  slot: ChartSlot;
  a0: number;
  a1: number;
}

/** DonutChart — phần–tổng nhìn nhanh, ≤ 6 lát (còn lại gộp "Khác"), khe 2px, tổng ở giữa. */
export const DonutChart = React.forwardRef<HTMLElement, DonutChartProps>(function DonutChart(
  {
    data,
    maxSlices = 6,
    otherLabel: otherLabelProp,
    valueFormat,
    centerLabel: centerLabelProp,
    centerValue,
    size = 200,
    thickness,
    legend = true,
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
  },
  ref,
) {
  const yugen = useYugen();
  const locale = localeProp ?? yugen.locale;
  const msg = useYugenMessages("chart", chartMessages);
  const otherLabel = otherLabelProp ?? msg.other;
  const centerLabel = centerLabelProp ?? msg.total;
  const indexLabel = indexLabelProp ?? msg.group;
  const textured = useChartTexture(texture);
  const uid = chartUid(React.useId());
  const [active, setActive] = React.useState<{ i: number; kb: boolean } | null>(null);
  const ringRef = React.useRef<HTMLDivElement>(null);
  const fmt = makeNumberFormatter(locale, valueFormat);
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });

  /* ---------- gộp phần đuôi vào "Khác" ---------- */
  const cap = Math.max(1, Math.min(6, maxSlices));
  const positive = data.map((d, i) => ({ ...d, i })).filter((d) => Number.isFinite(d.value) && d.value > 0);
  let kept = positive;
  let rest: typeof positive = [];
  if (positive.length > cap) {
    const top = new Set([...positive].sort((a, b) => b.value - a.value).slice(0, cap - 1).map((d) => d.i));
    kept = positive.filter((d) => top.has(d.i));
    rest = positive.filter((d) => !top.has(d.i));
  }
  const items: { key: string; label: string; value: number; slot: ChartSlot }[] = kept.map((d, k) => ({
    key: `d${d.i}`,
    label: d.label,
    value: d.value,
    slot: d.color ?? slotOf(undefined, k),
  }));
  if (rest.length) items.push({ key: "__other", label: otherLabel, value: rest.reduce((a, d) => a + d.value, 0), slot: "other" });
  const total = items.reduce((a, d) => a + d.value, 0);

  let angle = 0;
  const slices: Slice[] = items.map((d) => {
    const a0 = angle;
    angle += total > 0 ? (d.value / total) * Math.PI * 2 : 0;
    return { ...d, a0, a1: angle };
  });

  /* ---------- hình học ---------- */
  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  const r1 = S / 2 - 6;
  const ring = thickness ?? Math.max(12, Math.round(S * 0.12));
  const r0 = Math.max(4, r1 - ring);
  const gap = slices.length > 1 ? 2 : 0;
  const roving = useRovingPoints(slices.length, (i, kb) => setActive(i === null ? null : { i, kb }));
  const activeSlice = active ? slices[active.i] : undefined;

  const pathFor = (s: Slice, grow = 0) =>
    slices.length === 1 ? ringPath(cx, cy, r0, r1 + grow) : donutSlicePath(cx, cy, r0, r1 + grow, s.a0, s.a1, gap);

  const biggest = [...items].sort((a, b) => b.value - a.value)[0];
  const summary =
    ariaLabel ??
    msg.donutSummary({
      groups: items.length,
      total: fmt(total),
      largest: biggest && total > 0 ? { label: biggest.label, share: pct.format(biggest.value / total) } : undefined,
    });

  // Chỉ dựng khi bảng đang bật: hàng của mọi điểm dữ liệu được định dạng lại mỗi lần biểu đồ render.
  const table = () => (
    <ChartTable
      caption={summary}
      columns={[
        { key: "__index", label: indexLabel },
        { key: "value", label: msg.value, numeric: true },
        { key: "share", label: msg.share, numeric: true },
      ]}
      rows={[
        ...items.map((d) => ({ key: d.key, header: d.label, cells: [fmt(d.value), total > 0 ? pct.format(d.value / total) : "—"] })),
        { key: "__total", header: msg.total, cells: [fmt(total), total > 0 ? pct.format(1) : "—"] },
      ]}
    />
  );

  // Neo tooltip ở mép ngoài lát, toạ độ theo khối bao (cả vòng + legend) để tooltip có chỗ đẩy ra ngoài.
  const offX = ringRef.current?.offsetLeft ?? 0;
  const offY = ringRef.current?.offsetTop ?? 0;
  const anchor = activeSlice
    ? (() => {
        const mid = (activeSlice.a0 + activeSlice.a1) / 2;
        return [offX + cx + (r1 + 3) * Math.sin(mid), offY + cy - (r1 + 3) * Math.cos(mid)] as const;
      })()
    : null;

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
      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-4">
        <div ref={ringRef} dir="ltr" className="relative shrink-0" style={{ width: S, height: S }}>
          <svg
            width={S}
            height={S}
            role="group"
            aria-label={summary}
            aria-roledescription={msg.roleDescription}
            className="block overflow-visible"
            onPointerLeave={() => setActive((a) => (a?.kb ? a : null))}
          >
            {textured && <ChartPatterns prefix={uid} slots={slices.map((s) => s.slot)} />}
            {total <= 0 && <path d={ringPath(cx, cy, r0, r1)} style={{ fill: "var(--colorChartGrid)" }} />}
            <g
              aria-hidden
              className={cn(animate && "animate-surface-in", "motion-reduce:animate-none")}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {slices.map((s, i) => (
                <path
                  key={s.key}
                  d={pathFor(s, active?.i === i ? 3 : 0)}
                  fillRule="evenodd"
                  className="transition-opacity duration-faster"
                  style={{
                    fill: slotFill(s.slot, textured, uid),
                    opacity: active && active.i !== i ? "var(--chartDimOpacity)" : undefined,
                  }}
                />
              ))}
            </g>
            {activeSlice && active?.kb && (
              <path
                d={pathFor(activeSlice, 3)}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                pointerEvents="none"
                style={{ stroke: "var(--colorStrokeFocus2)" }}
              />
            )}
            <g>
              {slices.map((s, i) => (
                <path
                  key={s.key}
                  d={slices.length === 1 ? ringPath(cx, cy, r0 - 4, r1 + 4) : donutSlicePath(cx, cy, r0 - 4, r1 + 4, s.a0, s.a1, 0)}
                  fillRule="evenodd"
                  role="img"
                  aria-label={`${s.label}: ${fmt(s.value)} (${pct.format(total > 0 ? s.value / total : 0)})`}
                  className="cursor-default outline-none"
                  style={{ fill: "transparent" }}
                  {...roving.pointProps(i)}
                />
              ))}
            </g>
          </svg>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ padding: ring + 10 }}
          >
            <span className="max-w-full truncate text-subtitle1 font-semibold text-foreground-1">{centerValue ?? fmt(total)}</span>
            <span className="max-w-full truncate text-caption1 text-foreground-3">{centerLabel}</span>
          </div>
        </div>
        {legend && (
          <ChartLegend
            orientation="vertical"
            textured={textured}
            className="min-w-40 flex-1"
            items={items.map((d) => ({ key: d.key, label: d.label, slot: d.slot, value: total > 0 ? pct.format(d.value / total) : "—" }))}
          />
        )}
        {activeSlice && anchor && (
          <ChartTooltip
            placement="outward"
            origin={[offX + cx, offY + cy]}
            x={anchor[0]}
            y={anchor[1]}
            title={activeSlice.label}
            rows={[
              { key: "v", label: msg.value, value: fmt(activeSlice.value) },
              { key: "p", label: msg.share, value: pct.format(total > 0 ? activeSlice.value / total : 0) },
            ]}
          />
        )}
      </div>
    </ChartContainer>
  );
});
