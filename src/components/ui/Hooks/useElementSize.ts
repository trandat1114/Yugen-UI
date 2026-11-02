import * as React from "react";

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions {
  /** Đo hộp nào: `content-box` (mặc định, không tính padding / border) hay `border-box`. */
  box?: "content-box" | "border-box";
}

const EMPTY: ElementSize = { width: 0, height: 0 };

/**
 * Đo kích thước phần tử và cập nhật khi nó đổi (ResizeObserver). Chưa đo được (SSR, lần render đầu) thì là 0 × 0.
 *
 * ```tsx
 * const { ref, width } = useElementSize<HTMLDivElement>();
 * <div ref={ref}>{width < 480 ? <Compact /> : <Full />}</div>
 * ```
 */
export function useElementSize<T extends Element = Element>({ box = "content-box" }: UseElementSizeOptions = {}): ElementSize & {
  ref: (node: T | null) => void;
} {
  const [node, setNode] = React.useState<T | null>(null);
  const [size, setSize] = React.useState<ElementSize>(EMPTY);

  React.useEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const sized = box === "border-box" ? entry.borderBoxSize?.[0] : entry.contentBoxSize?.[0];
      const width = sized ? sized.inlineSize : entry.contentRect.width;
      const height = sized ? sized.blockSize : entry.contentRect.height;
      // Chữ viết dọc đảo hai chiều: inlineSize không luôn là chiều ngang → đọc theo writing-mode.
      const vertical = !!sized && (getComputedStyle(entry.target).writingMode ?? "").startsWith("vertical");
      const next = vertical ? { width: height, height: width } : { width, height };
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    });
    observer.observe(node, { box });
    return () => observer.disconnect();
  }, [node, box]);

  return { ref: setNode, ...size };
}
