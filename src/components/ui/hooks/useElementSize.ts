import * as React from "react";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions {
  /** Đo hộp nào: `content-box` (mặc định, không tính padding / border) hay `border-box`. */
  box?: "content-box" | "border-box";
  /**
   * `false`: the ref does nothing, nothing is measured, no ResizeObserver is created and the size stays 0 × 0. Use it
   * when the size is already known (a Sparkline with a numeric `width`, for example) to skip the extra render and the
   * observer. Default `true`.
   */
  enabled?: boolean;
}

export interface UseElementSizeResult<T extends Element> extends ElementSize {
  /** Gắn vào phần tử cần đo. */
  ref: (node: T | null) => void;
}

const EMPTY: ElementSize = { width: 0, height: 0 };
const NO_REF = () => {};

/** Lần đo đầu, đồng bộ trước khi vẽ (ResizeObserver chỉ báo sau một frame). */
function measure(el: Element, box: UseElementSizeOptions["box"]): ElementSize {
  const rect = el.getBoundingClientRect();
  if (box === "border-box") return { width: rect.width, height: rect.height };
  const s = getComputedStyle(el);
  const px = (v: string) => parseFloat(v) || 0;
  return {
    width: Math.max(0, rect.width - px(s.paddingLeft) - px(s.paddingRight) - px(s.borderLeftWidth) - px(s.borderRightWidth)),
    height: Math.max(0, rect.height - px(s.paddingTop) - px(s.paddingBottom) - px(s.borderTopWidth) - px(s.borderBottomWidth)),
  };
}

/** Lệch dưới nửa pixel coi như không đổi: tránh render lại liên tục vì làm tròn. */
const same = (a: ElementSize, b: ElementSize) => Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;

/**
 * Đo kích thước phần tử và cập nhật khi nó đổi (ResizeObserver). Đo lần đầu trước khi trình duyệt vẽ, nên nội dung phụ thuộc
 * kích thước (biểu đồ) không nháy. Chưa đo được (SSR, lần render đầu) thì là 0 × 0.
 *
 * ```tsx
 * const { ref, width } = useElementSize<HTMLDivElement>();
 * <div ref={ref}>{width < 480 ? <Compact /> : <Full />}</div>
 * ```
 */
export function useElementSize<T extends Element = Element>({ box = "content-box", enabled = true }: UseElementSizeOptions = {}): UseElementSizeResult<T> {
  const [node, setNode] = React.useState<T | null>(null);
  const [size, setSize] = React.useState<ElementSize>(EMPTY);

  useIsomorphicLayoutEffect(() => {
    if (!node || !enabled) return;
    const first = measure(node, box);
    setSize((prev) => (same(prev, first) ? prev : first));
    if (typeof ResizeObserver === "undefined") return;
    // Chữ viết dọc đảo hai chiều: inlineSize không luôn là chiều ngang → đọc writing-mode một lần, không mỗi lần đổi cỡ.
    const vertical = (getComputedStyle(node).writingMode ?? "").startsWith("vertical");
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const sized = box === "border-box" ? entry.borderBoxSize?.[0] : entry.contentBoxSize?.[0];
      const width = sized ? sized.inlineSize : entry.contentRect.width;
      const height = sized ? sized.blockSize : entry.contentRect.height;
      const next = sized && vertical ? { width: height, height: width } : { width, height };
      setSize((prev) => (same(prev, next) ? prev : next));
    });
    observer.observe(node, { box });
    return () => observer.disconnect();
  }, [node, box, enabled]);

  // Tắt thì ref là hàm rỗng cố định: React không gọi setNode, nên không có lần render thứ hai.
  return enabled ? { ref: setNode, ...size } : { ref: NO_REF, ...EMPTY };
}
