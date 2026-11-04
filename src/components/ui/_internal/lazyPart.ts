import * as React from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Phần chỉ một tùy chọn cần (menu "…" của Breadcrumb, thẻ nguồn của chú thích) nạp lúc cần bằng `import()` (#350), không
 * nằm trong chunk đầu của component.
 *
 * Không dùng React.lazy + Suspense: `renderToString` không chờ Suspense và báo lỗi khi hydrate, còn stream thì đẩy nội
 * dung xuống cuối trang. Ở đây server và lần hydrate đầu luôn render bản thay thế (getServerSnapshot) nên HTML khớp;
 * module nạp trong effect rồi thay vào. Render trên client sau khi đã nạp thì dùng ngay, không qua bản thay thế.
 * Bản thay thế phải có cùng hộp (không xê dịch bố cục) và cùng ARIA với phần thật lúc đóng.
 * Chỉ dùng nội bộ — không export qua barrel.
 */
export function lazyPart<T>(load: () => Promise<T>) {
  let loaded: T | undefined;
  let pending: Promise<void> | undefined;
  const listeners = new Set<() => void>();

  const preload = () => {
    pending ??= load().then(
      (mod) => {
        loaded = mod;
        for (const listener of listeners) listener();
      },
      () => {
        // Lỗi mạng: giữ bản thay thế, lần gọi sau thử lại.
        pending = undefined;
      },
    );
    return pending;
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const getSnapshot = () => loaded;
  const getServerSnapshot = () => undefined;

  /**
   * `mod`: module đã nạp, hoặc `undefined` (server, lần hydrate đầu, chưa nạp xong) — khi đó render bản thay thế với
   * `fallbackRef`. Phần thật nhận `ref`: bản thay thế đang giữ focus lúc được thay thì focus chuyển sang phần thật.
   */
  function usePart<E extends HTMLElement = HTMLButtonElement>() {
    const mod = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const ref = React.useRef<E>(null);
    const hadFocus = React.useRef(false);
    // Cleanup của ref chạy trước khi React gỡ phần tử khỏi DOM, lúc nó còn giữ focus.
    const fallbackRef = React.useCallback((el: E | null) => {
      if (!el) return;
      return () => {
        hadFocus.current = el.ownerDocument.activeElement === el;
      };
    }, []);
    React.useEffect(() => {
      if (!mod) void preload();
    }, [mod]);
    useIsomorphicLayoutEffect(() => {
      if (mod && hadFocus.current) {
        hadFocus.current = false;
        ref.current?.focus();
      }
    }, [mod]);
    return { mod, ref, fallbackRef };
  }

  return { preload, usePart };
}
