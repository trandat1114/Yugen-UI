/**
 * Thiết lập chung cho Vitest: matcher của jest-dom + polyfill những API trình duyệt mà jsdom thiếu
 * (Radix, cmdk, Chart, Sheet… cần tới). Chạy cho cả file `@vitest-environment node` → luôn kiểm tra `window`.
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { installMatchMedia, resetMediaQueries } from "./matchMedia";

if (typeof window !== "undefined") {
  installMatchMedia();

  class ResizeObserverStub implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class IntersectionObserverStub implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  window.ResizeObserver ??= ResizeObserverStub;
  window.IntersectionObserver ??= IntersectionObserverStub;

  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.scrollIntoView ??= function scrollIntoView() {};
  proto.hasPointerCapture ??= function hasPointerCapture() {
    return false;
  };
  proto.setPointerCapture ??= function setPointerCapture() {};
  proto.releasePointerCapture ??= function releasePointerCapture() {};
  // Element.scrollTo / scrollBy: chỉ ghi lại vị trí cuộn (jsdom không có layout).
  proto.scrollTo ??= function scrollTo(this: Element, x?: ScrollToOptions | number, y?: number) {
    const options = typeof x === "object" ? x : { left: x, top: y };
    if (options.left !== undefined) this.scrollLeft = options.left;
    if (options.top !== undefined) this.scrollTop = options.top;
  };
  proto.scrollBy ??= function scrollBy(this: Element, x?: ScrollToOptions | number, y?: number) {
    const options = typeof x === "object" ? x : { left: x, top: y };
    this.scrollLeft += options.left ?? 0;
    this.scrollTop += options.top ?? 0;
  };

  // jsdom in lỗi "Not implemented" ra console khi gọi window.scrollTo.
  window.scrollTo = (() => {}) as typeof window.scrollTo;

  // CSS.escape (Combobox dùng để tìm option theo value).
  const cssGlobal = (globalThis as { CSS?: Partial<typeof CSS> }).CSS ?? {};
  cssGlobal.escape ??= (value: string) => value.replace(/[^a-zA-Z0-9_ -￿-]/g, (ch) => `\\${ch}`);
  (globalThis as { CSS?: Partial<typeof CSS> }).CSS = cssGlobal;

  // Canvas 2D tối thiểu cho measureText của Chart (jsdom không có canvas → in lỗi "Not implemented").
  // Hệ số 0.5 cố ý khác công thức dự phòng phía server (0.6) như trình duyệt thật → lộ lệch hydration nếu có.
  HTMLCanvasElement.prototype.getContext = function getContext() {
    const ctx = {
      font: "12px sans-serif",
      measureText(text: string) {
        const size = Number(/(\d+(?:\.\d+)?)px/.exec(ctx.font)?.[1] ?? 12);
        return { width: text.length * size * 0.5 } as TextMetrics;
      },
    };
    return ctx as unknown as CanvasRenderingContext2D;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;

  const { cleanup } = await import("@testing-library/react");
  afterEach(() => {
    cleanup();
    resetMediaQueries();
    try {
      window.localStorage.clear();
    } catch {
      // localStorage có thể bị chặn — bỏ qua.
    }
  });
}

afterEach(() => {
  vi.useRealTimers();
});
