import * as React from "react";
import { ArrowReset20Regular } from "@fluentui/react-icons";
import { Button } from "../Button/Button";
import { ChartFocusRing } from "./ChartParts";
import { linePath, linearScale, slotVar, useElementWidth, type ChartSlot, type Point } from "./chartUtils";
import { moveDomain, nearestIndex, resizeDomain, type ChartDomain } from "./chartMath";

export interface ChartBrushLine {
  key: string;
  slot: ChartSlot;
  values: (number | null)[];
}

export interface ChartBrushProps {
  /** Số mốc dữ liệu. */
  count: number;
  /** Vị trí tương đối 0…1 của từng mốc (trục thời gian); mặc định cách đều. */
  positions?: number[];
  /** Đường thu nhỏ vẽ trong dải tổng quan. */
  lines?: ChartBrushLine[];
  /** Miền chỉ số đang xem [đầu, cuối]. */
  value: ChartDomain;
  onValueChange: (domain: ChartDomain) => void;
  /** Nhãn đầy đủ của từng mốc — cho aria-valuetext và dòng "Đang xem". */
  labels: string[];
  /** Chiều cao dải tổng quan (px). */
  height?: number;
  /** Số khoảng tối thiểu của cửa sổ. */
  minSpan?: number;
  className?: string;
}

type DragMode = "move" | "start" | "end";

/**
 * ChartBrush — dải tổng quan dưới vùng vẽ với cửa sổ kéo / đổi kích thước để zoom theo chỉ số.
 * Chuột/cảm ứng: kéo cửa sổ để dời, kéo tay nắm hai mép để đổi kích thước, bấm ra ngoài để nhảy tới.
 * Bàn phím (cửa sổ là một slider): ←/→ dời 1 mốc, Shift+←/→ thu/giãn mép cuối, PageUp/PageDown dời một cửa sổ, Home/End về hai đầu.
 * RTL: dải tổng quan luôn LTR như vùng vẽ (trục thời gian không lật), nên ←/→ luôn đi đúng chiều trên màn hình.
 */
export function ChartBrush({ count, positions, lines = [], value, onValueChange, labels, height = 48, minSpan = 1, className }: ChartBrushProps) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>();
  const [focused, setFocused] = React.useState(false);
  const drag = React.useRef<{ mode: DragMode; anchor: number; from: ChartDomain } | null>(null);

  const last = Math.max(0, count - 1);
  const [s, e] = value;
  const full = s <= 0 && e >= last;
  const pad = 8;
  const innerW = Math.max(0, width - 2 * pad);
  const frac = (i: number) => positions?.[i] ?? (last > 0 ? i / last : 0.5);
  const px = Array.from({ length: count }, (_, i) => pad + frac(i) * innerW);
  const x0 = px[s] ?? pad;
  const x1 = px[e] ?? pad + innerW;

  const all = lines.flatMap((l) => l.values).filter((v): v is number => v != null);
  const lo = all.length ? Math.min(0, ...all) : 0;
  const hi = all.length ? Math.max(...all) : 1;
  const sy = linearScale([lo, hi === lo ? lo + 1 : hi], [height - 4, 4]);

  const paths = lines.map((l) => {
    const segs: Point[][] = [];
    let cur: Point[] = [];
    l.values.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
      } else cur.push([px[i], sy(v)]);
    });
    if (cur.length) segs.push(cur);
    return { key: l.key, slot: l.slot, d: segs.map((seg) => linePath(seg, "linear")).join("") };
  });

  const indexAt = (event: React.PointerEvent) => {
    const box = (event.currentTarget as Element).closest("svg")?.getBoundingClientRect();
    return nearestIndex(px, event.clientX - (box?.left ?? 0));
  };

  const begin = (event: React.PointerEvent<SVGElement>, mode: DragMode | "jump") => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const svg = (event.currentTarget as Element).closest("svg");
    svg?.setPointerCapture?.(event.pointerId);
    const at = indexAt(event);
    let from = value;
    if (mode === "jump") {
      from = moveDomain(value, at - Math.round((s + e) / 2), count);
      onValueChange(from);
    }
    drag.current = { mode: mode === "jump" ? "move" : mode, anchor: at, from };
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const at = indexAt(event);
    const next =
      d.mode === "move"
        ? moveDomain(d.from, at - d.anchor, count)
        : resizeDomain(d.from, d.mode, at - (d.mode === "start" ? d.from[0] : d.from[1]), count, minSpan);
    if (next[0] !== s || next[1] !== e) onValueChange(next);
  };

  const end = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const span = e - s;
    let next: ChartDomain | null = null;
    // Dải luôn LTR → → là "về sau" ở cả trang LTR lẫn RTL.
    const step = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    if (step !== 0) next = event.shiftKey ? resizeDomain(value, "end", step, count, minSpan) : moveDomain(value, step, count);
    else if (event.key === "PageUp") next = moveDomain(value, span, count);
    else if (event.key === "PageDown") next = moveDomain(value, -span, count);
    else if (event.key === "Home") next = moveDomain(value, -s, count);
    else if (event.key === "End") next = moveDomain(value, last - e, count);
    if (!next) return;
    event.preventDefault();
    if (next[0] !== s || next[1] !== e) onValueChange(next);
  };

  const rangeText = `${labels[s] ?? ""} – ${labels[e] ?? ""}`;
  const handle = (x: number, mode: "start" | "end") => (
    <g key={mode} className="cursor-ew-resize" onPointerDown={(ev) => begin(ev, mode)}>
      <rect x={x - 8} y={0} width={16} height={height} style={{ fill: "transparent" }} />
      <rect
        x={x - 3}
        y={height / 2 - 10}
        width={6}
        height={20}
        rx={3}
        strokeWidth={1}
        style={{ fill: "var(--colorNeutralBackground1)", stroke: "var(--colorNeutralStrokeAccessible)" }}
      />
    </g>
  );

  return (
    <div className={className ?? "flex flex-col gap-1"}>
      <div ref={wrapRef} dir="ltr" className="relative w-full min-w-0 touch-none select-none" style={{ height }}>
        {width > 0 && count > 1 && (
          <svg
            width={width}
            height={height}
            className="block overflow-visible"
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerCancel={end}
          >
            <rect
              aria-hidden
              x={pad}
              y={0.5}
              width={innerW}
              height={height - 1}
              rx={4}
              strokeWidth={1}
              className="cursor-pointer"
              style={{ fill: "var(--colorChartSurface)", stroke: "var(--colorChartGrid)" }}
              onPointerDown={(ev) => begin(ev, "jump")}
            />
            <g aria-hidden fill="none" pointerEvents="none">
              {paths.map((p) => (
                <path key={p.key} d={p.d} strokeWidth={1} strokeLinejoin="round" style={{ stroke: slotVar(p.slot) }} />
              ))}
            </g>
            <g aria-hidden pointerEvents="none" style={{ fill: "var(--colorChartSurface)", fillOpacity: "var(--chartDimOpacity)" }}>
              <rect x={pad} y={1} width={Math.max(0, x0 - pad)} height={height - 2} />
              <rect x={x1} y={1} width={Math.max(0, pad + innerW - x1)} height={height - 2} />
            </g>
            <rect
              role="slider"
              tabIndex={0}
              aria-label="Vùng xem"
              aria-roledescription="cửa sổ thu phóng"
              aria-valuemin={0}
              aria-valuemax={last}
              aria-valuenow={s}
              aria-valuetext={rangeText}
              aria-keyshortcuts="ArrowLeft ArrowRight Shift+ArrowLeft Shift+ArrowRight Home End PageUp PageDown"
              x={x0}
              y={0.5}
              width={Math.max(0, x1 - x0)}
              height={height - 1}
              strokeWidth={1}
              className="cursor-grab outline-none active:cursor-grabbing"
              style={{ fill: "transparent", stroke: "var(--colorChartCrosshair)" }}
              onPointerDown={(ev) => begin(ev, "move")}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {handle(x0, "start")}
            {handle(x1, "end")}
            {focused && <ChartFocusRing x={x0} y={0} width={x1 - x0} height={height} radius={2} />}
          </svg>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-caption1 text-foreground-3">
        <span className="tabular-nums">
          Đang xem <bdi className="text-foreground-2">{rangeText}</bdi> · {e - s + 1}/{count} mốc
        </span>
        <Button size="small" appearance="subtle" icon={<ArrowReset20Regular />} disabled={full} onClick={() => onValueChange([0, last])}>
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
