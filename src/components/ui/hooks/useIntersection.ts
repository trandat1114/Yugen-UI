import * as React from "react";

export interface UseIntersectionOptions {
  /** Phần tử cuộn làm khung nhìn; mặc định là viewport. */
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** Dừng theo dõi sau lần giao nhau đầu tiên và giữ `isIntersecting = true` — hiện ảnh lười, chạy hiệu ứng một lần. */
  once?: boolean;
}

export interface UseIntersectionResult<T extends Element> {
  /** Gắn vào phần tử cần theo dõi. */
  ref: (node: T | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Theo dõi phần tử có đang nằm trong khung nhìn không (IntersectionObserver). Không có IntersectionObserver
 * (SSR, môi trường cũ) thì `isIntersecting` luôn false.
 *
 * ```tsx
 * const { ref, isIntersecting } = useIntersection<HTMLDivElement>({ once: true, rootMargin: "200px" });
 * <div ref={ref}>{isIntersecting && <HeavyChart />}</div>
 * ```
 */
export function useIntersection<T extends Element = Element>({
  root = null,
  rootMargin,
  threshold,
  once = false,
}: UseIntersectionOptions = {}): UseIntersectionResult<T> {
  const [node, setNode] = React.useState<T | null>(null);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);
  // threshold dạng mảng đổi identity mỗi lần render: so theo giá trị.
  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : threshold;

  React.useEffect(() => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Callback gộp nhiều entry của cùng phần tử: lấy cái mới nhất.
        const latest = entries[entries.length - 1];
        setEntry(latest);
        if (once && latest.isIntersecting) observer.disconnect();
      },
      {
        root,
        rootMargin,
        threshold: thresholdKey === undefined ? undefined : String(thresholdKey).split(",").map(Number),
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, root, rootMargin, thresholdKey, once]);

  return { ref: setNode, isIntersecting: entry?.isIntersecting ?? false, entry };
}
