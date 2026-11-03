import { docsLinkTarget, localePathOf, type DocsLocation } from "./router";

/**
 * Nạp trước trang sắp mở khi người dùng tỏ ý (#305): trỏ chuột vào link nội bộ (sau 65 ms, lướt qua thì thôi), focus
 * bằng bàn phím, hoặc chạm. Áp cho mọi `<a href>` trỏ tới trang docs (sidebar, link trong trang) và phần tử có
 * `data-href` (mục của bảng lệnh). Mỗi trang nạp một lần; bỏ qua khi bật tiết kiệm dữ liệu hoặc mạng 2G.
 */
type Prefetch = (target: DocsLocation) => void;

const HOVER_DELAY = 65;

let prefetch: Prefetch | undefined;
const done = new Set<string>();

function constrained() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!connection && (connection.saveData === true || /(^|-)2g$/.test(connection.effectiveType ?? ""));
}

/** Nạp trước trang của một đường dẫn docs (bỏ qua nếu không phải trang docs, đã nạp, hoặc mạng hạn chế). */
export function prefetchHref(href: string) {
  if (!prefetch || constrained()) return;
  const target = docsLinkTarget(href);
  if (!target) return;
  const key = localePathOf(target.route, target.lang);
  if (done.has(key)) return;
  done.add(key);
  prefetch(target);
}

function hrefOf(target: EventTarget | null): string | null {
  const el = (target as Element | null)?.closest?.("a[href], [data-href]");
  if (!el || el.hasAttribute("download") || (el.getAttribute("target") ?? "_self") !== "_self") return null;
  return el.getAttribute("data-href") ?? el.getAttribute("href");
}

/** Gắn bộ nghe trên document (App gọi một lần); trả về hàm gỡ. */
export function installIntentPrefetch(fn: Prefetch): () => void {
  prefetch = fn;
  let timer: number | undefined;
  const onOver = (event: PointerEvent) => {
    if (event.pointerType === "touch") return; // touchstart lo
    window.clearTimeout(timer);
    const href = hrefOf(event.target);
    if (href) timer = window.setTimeout(() => prefetchHref(href), HOVER_DELAY);
  };
  const onIntent = (event: Event) => {
    const href = hrefOf(event.target);
    if (href) prefetchHref(href);
  };
  document.addEventListener("pointerover", onOver, { passive: true });
  document.addEventListener("focusin", onIntent);
  document.addEventListener("touchstart", onIntent, { passive: true });
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("focusin", onIntent);
    document.removeEventListener("touchstart", onIntent);
    prefetch = undefined;
  };
}
