import * as React from "react";

/** Gán giá trị cho một ref (callback hoặc object); trả về hàm cleanup nếu callback ref có (React 19). */
export function setRef<T>(ref: React.Ref<T> | undefined, value: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(value);
  if (ref) ref.current = value;
}

/**
 * Gộp nhiều ref (callback hoặc object) thành một callback ref — giữ nguyên giữa các lần render khi các ref không đổi.
 * Trả về hàm cleanup (React 19): khi gỡ, callback ref nào trả cleanup thì được gọi cleanup, ref còn lại nhận `null`.
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export function useComposedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback((node: T | null) => {
    const cleanups = refs.map((ref) => setRef(ref, node));
    return () =>
      refs.forEach((ref, i) => {
        const cleanup = cleanups[i];
        if (typeof cleanup === "function") cleanup();
        else setRef(ref, null);
      });
  }, refs);
}
