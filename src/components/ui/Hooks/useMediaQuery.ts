import * as React from "react";

export interface UseMediaQueryOptions {
  /** Giá trị khi chưa có `window` (SSR, test) — mặc định false. */
  defaultValue?: boolean;
}

const lists = new Map<string, MediaQueryList>();
let listsFor: Window["matchMedia"] | undefined;

/** Một MediaQueryList cho mỗi query (matches luôn cập nhật theo môi trường); null khi không có window (SSR, test). */
function mediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  // matchMedia bị thay (test giả lập màn hình khác): bỏ cache cũ.
  if (listsFor !== window.matchMedia) {
    lists.clear();
    listsFor = window.matchMedia;
  }
  let mql = lists.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    lists.set(query, mql);
  }
  return mql;
}

/**
 * Theo dõi một CSS media query, tự cập nhật khi khớp / hết khớp (resize, xoay máy, đổi cài đặt hệ điều hành).
 * Dựa trên `useSyncExternalStore` nên không nháy giữa hai giá trị khi render lại.
 *
 * ```ts
 * const isDesktop = useMediaQuery("(min-width: 768px)");
 * const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 * ```
 */
export function useMediaQuery(query: string, { defaultValue = false }: UseMediaQueryOptions = {}): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = mediaQueryList(query);
      if (!mql) return () => {};
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  // getSnapshot chạy mỗi lần render: dùng lại MediaQueryList thay vì gọi matchMedia() mới (biểu đồ gọi hook này mỗi lần hover).
  const getSnapshot = () => mediaQueryList(query)?.matches ?? defaultValue;

  return React.useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
