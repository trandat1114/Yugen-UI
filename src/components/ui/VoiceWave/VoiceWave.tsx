/** Yugen Labs · VoiceWave — mức âm thanh vào / ra của trợ lý giọng nói hoặc cuộc gọi, dạng các vạch dọc. */
import * as React from "react";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useYugenMessages } from "../YugenProvider/context";
import { voiceWaveMessagesEn } from "./messages";

export { voiceWaveMessagesVi, voiceWaveMessagesEn, type VoiceWaveMessages } from "./messages";

export type VoiceWaveState = "idle" | "listening" | "speaking" | "muted" | "error";
export type VoiceWaveSize = "small" | "medium" | "large";

/**
 * Hàm trả mức âm thanh mới nhất (mỗi giá trị 0–1), được gọi một lần mỗi animation frame khi đang nghe hoặc nói. Trả
 * `null` khi chưa có dữ liệu. VoiceWave không tự tạo AudioContext hay xin quyền micro: app đọc AnalyserNode của mình.
 */
export type VoiceWaveSource = () => ArrayLike<number> | null | undefined;

export interface VoiceWaveProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** idle / muted / error: vạch nằm phẳng · listening / speaking: vạch theo `levels` hoặc `source`. */
  state?: VoiceWaveState;
  /** Mức âm thanh (0–1), lấy mẫu lại cho đủ `bars`. Bỏ trống: dáng tĩnh của trạng thái. */
  levels?: ArrayLike<number>;
  /** Đọc mức âm thanh mỗi frame mà không re-render (luồng micro, Web Audio); thắng `levels` khi trả dữ liệu. */
  source?: VoiceWaveSource;
  /** Số vạch (3–64). Đổi số vạch không làm đổi kích thước khác ngoài chiều ngang. */
  bars?: number;
  size?: VoiceWaveSize;
  /** brand: màu brand · neutral: màu chữ phụ. muted / error có màu riêng. */
  tone?: "brand" | "neutral";
  /** center: vạch đối xứng quanh đường giữa · bottom: vạch mọc từ đáy. */
  align?: "center" | "bottom";
  /** Tên đọc; mặc định theo trạng thái (`messages.voiceWave`). */
  label?: string;
}

const SIZE: Record<VoiceWaveSize, { box: string; bar: string }> = {
  small: { box: "h-5 gap-px", bar: "w-0.5" },
  medium: { box: "h-8 gap-0.5", bar: "w-1" },
  large: { box: "h-14 gap-1", bar: "w-1.5" },
};

/** Chiều cao nhỏ nhất của một vạch (tỉ lệ), để trạng thái phẳng vẫn thấy một hàng chấm. */
const FLOOR = 0.1;

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);
const scaleOf = (level: number) => FLOOR + (1 - FLOOR) * clamp01(level);

/** Lấy mẫu lại `levels` thành `count` giá trị: mỗi vạch là trung bình của đoạn dữ liệu nó phủ. */
export function resampleLevels(levels: ArrayLike<number>, count: number): number[] {
  const n = levels.length;
  const out = new Array<number>(count).fill(0);
  if (n === 0) return out;
  for (let i = 0; i < count; i++) {
    const from = Math.floor((i * n) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * n) / count));
    let sum = 0;
    for (let j = from; j < to; j++) sum += clamp01(levels[j] ?? 0);
    out[i] = sum / (to - from);
  }
  return out;
}

/** Dáng tĩnh khi không có dữ liệu: vòm thấp khi nghe, vòm cao khi nói, phẳng ở các trạng thái khác. */
function staticLevels(state: VoiceWaveState, count: number): number[] {
  const peak = state === "speaking" ? 0.75 : state === "listening" ? 0.35 : 0;
  return Array.from({ length: count }, (_, i) => {
    if (peak === 0) return 0;
    const t = count === 1 ? 0.5 : i / (count - 1);
    const arch = Math.sin(Math.PI * t);
    // Gợn nhẹ để không giống một thanh tiến độ.
    return peak * (0.55 + 0.45 * arch) * (i % 2 === 0 ? 1 : 0.8);
  });
}

export function VoiceWave({
  state = "idle",
  levels,
  source,
  bars = 24,
  size = "medium",
  tone = "brand",
  align = "center",
  label,
  className,
  ref,
  ...props
}: VoiceWaveProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("voiceWave", voiceWaveMessagesEn);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const count = Math.min(64, Math.max(3, Math.round(bars)));
  const active = state === "listening" || state === "speaking";
  const heights = React.useMemo(
    () => (active && levels ? resampleLevels(levels, count) : staticLevels(state, count)),
    [active, levels, count, state],
  );

  const barsRef = React.useRef<HTMLDivElement>(null);
  const sourceRef = React.useRef(source);
  useIsomorphicLayoutEffect(() => {
    sourceRef.current = source;
  });
  const hasSource = source !== undefined;

  // Một vòng requestAnimationFrame cho cả biểu đồ (không timer hay listener cho từng vạch): ghi thẳng transform, không
  // re-render. Giảm chuyển động: không chạy, các vạch giữ dáng tĩnh.
  React.useEffect(() => {
    const box = barsRef.current;
    if (!active || !hasSource || reducedMotion || !box) return;
    const nodes = Array.from(box.children) as HTMLElement[];
    const last = new Array<string>(nodes.length).fill("");
    let frame = window.requestAnimationFrame(function tick() {
      const data = sourceRef.current?.();
      if (data && data.length > 0) {
        const next = resampleLevels(data, nodes.length);
        for (let i = 0; i < nodes.length; i++) {
          const transform = `scaleY(${scaleOf(next[i]).toFixed(3)})`;
          if (transform !== last[i]) {
            last[i] = transform;
            nodes[i].style.transform = transform;
          }
        }
      }
      frame = window.requestAnimationFrame(tick);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      // Trả các vạch về giá trị của lần render mới nhất (data-scale), không phải của lúc effect này bắt đầu.
      nodes.forEach((node) => (node.style.transform = `scaleY(${node.dataset.scale})`));
    };
  }, [active, hasSource, reducedMotion, count]);

  const color =
    state === "error"
      ? "bg-danger-background-3"
      : state === "muted"
        ? "bg-foreground-disabled"
        : tone === "brand"
          ? "bg-brand-background"
          : "bg-foreground-3";

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? msg[state]}
      data-state={state}
      className={cn("inline-flex shrink-0 align-middle", className)}
      {...props}
    >
      <div
        ref={barsRef}
        aria-hidden
        className={cn("flex", SIZE[size].box, align === "center" ? "items-center" : "items-end")}
      >
        {heights.map((level, i) => (
          <span
            key={i}
            className={cn(
              "h-full shrink-0 rounded-circular forced-colors:bg-[CanvasText]",
              SIZE[size].bar,
              align === "center" ? "origin-center" : "origin-bottom",
              color,
              "transition-transform duration-faster ease-easy-ease motion-reduce:transition-none",
            )}
            data-scale={scaleOf(level).toFixed(3)}
            style={{ transform: `scaleY(${scaleOf(level).toFixed(3)})` }}
          />
        ))}
      </div>
    </div>
  );
}
