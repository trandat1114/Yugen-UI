import { useEffect, useState } from "react";

export type Route =
  | { kind: "home" }
  | { kind: "blocks" }
  | { kind: "templates" }
  | { kind: "theme-designer" }
  | { kind: "news" }
  | { kind: "community" }
  | { kind: "concept"; slug: string }
  | { kind: "foundation"; slug: string }
  | { kind: "component"; slug: string };

/** Gốc của docs: "/" khi dev, "/Yugen-UI/" trên GitHub Pages, "/Yugen-UI/next/" cho bản xem trước. Luôn có "/" cuối. */
const BASE = import.meta.env.BASE_URL;

const PAGES = ["blocks", "templates", "theme-designer", "news", "community"] as const;
const SECTIONS = { concepts: "concept", foundations: "foundation", components: "component" } as const;

/** "components/button" (đường dẫn sau BASE, không có "/" đầu) → route; null nếu không phải trang docs. */
function matchSegments(rest: string): Route | null {
  const parts = rest.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "home" };
  const [section, slug, extra] = parts;
  if (parts.length === 1 && (PAGES as readonly string[]).includes(section)) return { kind: section as (typeof PAGES)[number] };
  if (parts.length === 2 && !extra && section in SECTIONS) return { kind: SECTIONS[section as keyof typeof SECTIONS], slug };
  return null;
}

/** Route của một pathname trong docs (đã gồm BASE). Đường dẫn lạ → trang chủ. */
export function parsePath(pathname: string): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "");
  return matchSegments(rest) ?? { kind: "home" };
}

/** Link kiểu cũ "#/components/button" (docs ≤ 0.10, demo trong registry) → route. */
export function parseHash(hash: string): Route {
  return matchSegments(hash.replace(/^#\/?/, "")) ?? { kind: "home" };
}

/** Đường dẫn của route, không gồm BASE: "" (trang chủ), "components/button"… */
export function pathOf(route: Route): string {
  switch (route.kind) {
    case "home":
      return "";
    case "concept":
      return `concepts/${route.slug}`;
    case "foundation":
      return `foundations/${route.slug}`;
    case "component":
      return `components/${route.slug}`;
    default:
      return route.kind;
  }
}

export function hrefOf(route: Route) {
  return BASE + pathOf(route);
}

/** Link nội bộ: docsPath("/concepts/cli") → "/Yugen-UI/concepts/cli" (theo BASE của bản build). */
export function docsPath(path: string) {
  return BASE + path.replace(/^\//, "");
}

const NAVIGATE = "yugen-docs:navigate";

/** Chuyển trang không tải lại (History API). */
export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.href === window.location.href) return;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAVIGATE));
}

/** `#/components/button` trong URL hiện tại (link chia sẻ trước khi đổi sang đường dẫn) → URL mới, giữ ?query. */
export function legacyHashTarget(location: Pick<Location, "hash" | "search">): string | null {
  if (!location.hash.startsWith("#/")) return null;
  return hrefOf(parseHash(location.hash)) + location.search;
}

/**
 * Bấm vào `<a>` trỏ tới một trang docs (cùng origin, dưới BASE, không phải bản docs khác như next/ hay v0.9/) → đổi route
 * tại chỗ thay vì tải lại. Link `#/…` cũ cũng được đổi sang đường dẫn.
 */
function onDocumentClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
  const raw = anchor.getAttribute("href") ?? "";
  if (raw.startsWith("#/")) {
    event.preventDefault();
    navigate(hrefOf(parseHash(raw)));
    return;
  }
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return;
  // Cùng trang, chỉ khác #mục: để trình duyệt cuộn.
  if (url.pathname === window.location.pathname && url.hash) return;
  if (!matchSegments(url.pathname.slice(BASE.length))) return;
  event.preventDefault();
  navigate(url.href);
}

/** Route hiện tại. `path` (prerender) thay cho `window.location` khi render ở Node. */
export function useRoute(path?: string) {
  const [route, setRoute] = useState<Route>(() => parsePath(path ?? window.location.pathname));

  useEffect(() => {
    let current = window.location.pathname;
    const sync = () => {
      const legacy = legacyHashTarget(window.location);
      if (legacy) window.history.replaceState(null, "", legacy);
      // Chỉ đổi #mục (quay lại sau khi bấm mục lục…): không phải trang mới.
      if (window.location.pathname === current) return;
      current = window.location.pathname;
      setRoute(parsePath(current));
      window.scrollTo({ top: 0 });
    };
    const onHashChange = () => {
      if (window.location.hash.startsWith("#/")) sync();
    };
    window.addEventListener(NAVIGATE, sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener(NAVIGATE, sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return route;
}
