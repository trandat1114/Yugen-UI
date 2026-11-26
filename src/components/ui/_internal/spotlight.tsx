import * as React from "react";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SpotlightOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Khung (toạ độ viewport) để chừa sáng; null = phủ tối cả màn hình. */
  rect: SpotlightRect | null;
  /** Khoảng chừa quanh khung (px). */
  padding?: number;
}

/**
 * Lớp phủ toàn màn hình làm tối trang và chừa một ô sáng quanh `rect` — dùng chung cho Tour và TeachingPopover
 * `focus="spotlight"`. Ô sáng là box-shadow rất rộng màu overlay (không cần mask hay clip-path); lớp phủ chặn con trỏ
 * tới trang phía sau, kể cả phần tử được chiếu sáng. Chỉ dùng nội bộ.
 */
export function SpotlightOverlay({ rect, padding = 8, className, ...props }: SpotlightOverlayProps) {
  return (
    <div aria-hidden className={cn("fixed inset-0", className)} {...props}>
      {rect ? (
        <div
          className={cn(
            "absolute rounded-medium shadow-[0_0_0_100vmax_var(--colorBackgroundOverlay)]",
            "outline-2 outline-offset-2 outline-brand-stroke forced-colors:outline-[Highlight]",
            "transition-[top,left,width,height] duration-normal ease-easy-ease motion-reduce:transition-none",
          )}
          style={{ top: rect.top - padding, left: rect.left - padding, width: rect.width + padding * 2, height: rect.height + padding * 2 }}
        />
      ) : (
        <div className="absolute inset-0 bg-overlay" />
      )}
    </div>
  );
}

const sameRect = (a: SpotlightRect | null, b: DOMRect) =>
  a !== null && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;

/**
 * Khung (toạ độ viewport) của `el` khi `enabled`, cập nhật khi cuộn (mọi vùng cuộn, capture), đổi cỡ cửa sổ hoặc chính
 * phần tử; các sự kiện dồn về một lần đo mỗi frame. Tắt hoặc không có phần tử: null và không gắn listener nào.
 */
export function useElementRect(el: Element | null, enabled: boolean): SpotlightRect | null {
  const [rect, setRect] = React.useState<SpotlightRect | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !el) return;
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const r = el.getBoundingClientRect();
      setRect((prev) => (sameRect(prev, r) ? prev : { top: r.top, left: r.left, width: r.width, height: r.height }));
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(el);
    return () => {
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [el, enabled]);

  return enabled && el ? rect : null;
}
