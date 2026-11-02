import * as React from "react";

/**
 * Gộp nhiều ref (callback hoặc object) thành một callback ref — giữ nguyên giữa các lần render khi các ref không đổi.
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export function useComposedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  }, refs);
}
