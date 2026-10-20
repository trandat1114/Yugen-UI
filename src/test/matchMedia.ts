/**
 * `window.matchMedia` giả lập, điều khiển được từ test (jsdom không có matchMedia).
 *
 * ```ts
 * setMediaQueries({ "prefers-reduced-motion": true }); // query chứa chuỗi này → khớp
 * setMediaQueries((query) => query.includes("min-width: 768px"));
 * ```
 * Đổi kết quả sẽ phát sự kiện `change` cho mọi MediaQueryList đang có listener.
 */

export type MediaQueryMatcher = (query: string) => boolean;

let matcher: MediaQueryMatcher = () => false;

type ChangeListener = (event: MediaQueryListEvent) => void;

class MockMediaQueryList {
  readonly media: string;
  matches: boolean;
  onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null = null;
  private readonly listeners = new Set<ChangeListener>();

  constructor(media: string) {
    this.media = media;
    this.matches = matcher(media);
  }

  addEventListener(type: string, listener: ChangeListener | null) {
    if (type === "change" && listener) this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: ChangeListener | null) {
    if (type === "change" && listener) this.listeners.delete(listener);
  }

  /** API cũ (Safari < 14). */
  addListener(listener: ChangeListener | null) {
    if (listener) this.listeners.add(listener);
  }

  removeListener(listener: ChangeListener | null) {
    if (listener) this.listeners.delete(listener);
  }

  dispatchEvent() {
    return true;
  }

  /** Tính lại theo matcher hiện tại; phát `change` nếu kết quả đổi. */
  refresh() {
    const next = matcher(this.media);
    if (next === this.matches) return;
    this.matches = next;
    const event = { matches: next, media: this.media } as MediaQueryListEvent;
    this.onchange?.call(this as unknown as MediaQueryList, event);
    this.listeners.forEach((listener) => listener(event));
  }
}

const lists = new Set<MockMediaQueryList>();

/** Đặt kết quả cho mọi media query (hàm, hoặc bảng "chuỗi con của query" → kết quả). */
export function setMediaQueries(next: MediaQueryMatcher | Record<string, boolean>) {
  matcher =
    typeof next === "function"
      ? next
      : (query) => Object.entries(next).some(([fragment, value]) => value && query.includes(fragment));
  lists.forEach((list) => list.refresh());
}

/** Về mặc định: không query nào khớp. */
export function resetMediaQueries() {
  matcher = () => false;
  lists.clear();
}

export function installMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => {
      const list = new MockMediaQueryList(query);
      lists.add(list);
      return list as unknown as MediaQueryList;
    },
  });
}
