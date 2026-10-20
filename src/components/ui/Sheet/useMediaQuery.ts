import * as React from "react";

export interface UseMediaQueryOptions {
  /** Giá trị khi chưa có `window` (SSR, test) — mặc định false. */
  defaultValue?: boolean;
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
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window === "undefined" || typeof window.matchMedia !== "function" ? defaultValue : window.matchMedia(query).matches;

  return React.useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}
