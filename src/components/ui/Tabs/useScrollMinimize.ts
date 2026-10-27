import * as React from "react";

export interface UseScrollMinimizeOptions {
  /** Phần tử cuộn. Mặc định là cửa sổ. */
  target?: React.RefObject<HTMLElement | null>;
  /** Số px phải cuộn liền một chiều trước khi đổi trạng thái, để không nháy khi cuộn rung. Mặc định 24. */
  threshold?: number;
  /** Trong khoảng này tính từ đầu trang thì luôn mở rộng. Mặc định 48. */
  topOffset?: number;
}

/**
 * Yugen Labs — `true` khi người dùng cuộn xuống, `false` khi cuộn lên hoặc về gần đầu trang. Dùng cho tab bar / toolbar
 * nổi: `<TabsList material="glass" minimized={useScrollMinimize()}>`.
 */
export function useScrollMinimize({ target, threshold = 24, topOffset = 48 }: UseScrollMinimizeOptions = {}): boolean {
  const [minimized, setMinimized] = React.useState(false);

  React.useEffect(() => {
    const element = target?.current ?? null;
    const source: HTMLElement | Window = element ?? window;
    const read = () => (element ? element.scrollTop : window.scrollY);
    // Mốc so sánh: vị trí lần cuối đổi trạng thái (hoặc lần cuối đổi chiều cuộn).
    let anchor = read();
    let last = anchor;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = read();
      if (y <= topOffset) {
        setMinimized(false);
        anchor = last = y;
        return;
      }
      if (Math.sign(y - last) !== Math.sign(last - anchor)) anchor = last;
      last = y;
      if (Math.abs(y - anchor) < threshold) return;
      setMinimized(y > anchor);
      anchor = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    source.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      source.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, threshold, topOffset]);

  return minimized;
}
